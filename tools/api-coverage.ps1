param(
    [string]$RepoRoot = ".",
    [string]$OutFile = "docs/api-coverage-report.md"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Normalize-EndpointPath {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ""
    }

    $p = $Path.Trim()
    $p = $p -replace "https?://[^/]+", ""
    $p = $p -replace "\?.*$", ""
    $p = $p -replace "\\", "/"

    if ($p.StartsWith("__API__")) {
        $p = "/api" + $p.Substring("__API__".Length)
    }

    if ($p.StartsWith("/api/api/")) {
        $p = $p.Substring(4)
    }

    if (-not $p.StartsWith("/")) {
        $p = "/" + $p
    }

    $p = $p -replace "/+", "/"
    $p = $p -replace "/+$", ""

    if ($p -match "^/[^/]+" -and -not $p.StartsWith("/api/")) {
        # Frontend often calls /bookings, /users, etc where environment.apiUrl already contains /api.
        $p = "/api" + $p
    }

    $p = $p -replace ":guid", ""
    $p = $p -replace "\{[^}]+\}", "{var}"

    return $p.ToLowerInvariant()
}

function To-EndpointRegex {
    param([string]$Normalized)
    $escaped = [Regex]::Escape($Normalized)
    $escaped = $escaped -replace "\\\{var\\\}", "[^/]+"
    return "^$escaped$"
}

function Extract-BackendEndpoints {
    param([string]$ControllersDir)

    $result = @()
    $files = Get-ChildItem -Path $ControllersDir -Filter "*Controller.cs" -File

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw
        $controller = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) -replace "Controller$", ""

        $routeMatch = [regex]::Match($content, '\[Route\("([^"]+)"\)\]')
        if (-not $routeMatch.Success) {
            continue
        }

        $baseRoute = $routeMatch.Groups[1].Value -replace "\[controller\]", $controller

        $httpMatches = [regex]::Matches(
            $content,
            '\[Http(Get|Post|Put|Delete|Patch)(?:\("([^"]*)"\))?\]',
            [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        )

        foreach ($m in $httpMatches) {
            $method = $m.Groups[1].Value.ToUpperInvariant()
            $suffix = $m.Groups[2].Value

            $full = if ([string]::IsNullOrWhiteSpace($suffix)) {
                $baseRoute
            } else {
                ($baseRoute.TrimEnd('/') + "/" + $suffix.TrimStart('/'))
            }

            $norm = Normalize-EndpointPath -Path $full
            $result += [pscustomobject]@{
                Method = $method
                Url = "/" + $full.TrimStart('/')
                Norm = $norm
                Regex = To-EndpointRegex -Normalized $norm
                Controller = $controller
                Source = $file.FullName
            }
        }
    }

    return $result | Sort-Object Controller, Url, Method -Unique
}

function Resolve-ApiVarMap {
    param([string]$Content)

    $map = @{}

    $m1 = [regex]::Matches($Content, '(\w+)\s*=\s*`\$\{environment\.apiUrl\}([^`]+)`')
    foreach ($m in $m1) {
        $name = $m.Groups[1].Value
        $value = "__API__" + $m.Groups[2].Value
        $map[$name] = $value
    }

    $m2 = [regex]::Matches($Content, '(\w+)\s*=\s*environment\.apiUrl')
    foreach ($m in $m2) {
        $name = $m.Groups[1].Value
        if (-not $map.ContainsKey($name)) {
            $map[$name] = "__API__"
        }
    }

    return $map
}

function Resolve-HttpArg {
    param(
        [string]$Arg,
        [hashtable]$ApiVarMap
    )

    $a = $Arg.Trim()

    if ($a.Length -ge 2 -and [int][char]$a[0] -eq 96 -and [int][char]$a[$a.Length - 1] -eq 96) {
        $body = $a.Substring(1, $a.Length - 2)
        $body = $body.Replace('${environment.apiUrl}', '__API__')

        foreach ($k in $ApiVarMap.Keys) {
            $body = $body.Replace('${this.' + $k + '}', $ApiVarMap[$k])
        }

        # Replace any remaining runtime interpolation with placeholder
        $body = $body -replace '\$\{[^}]+\}', '{var}'
        return $body
    }

    $firstCharCode = if ($a.Length -gt 0) { [int][char]$a[0] } else { -1 }
    $lastCharCode = if ($a.Length -gt 0) { [int][char]$a[$a.Length - 1] } else { -1 }
    if (($firstCharCode -eq 34 -and $lastCharCode -eq 34) -or ($firstCharCode -eq 39 -and $lastCharCode -eq 39)) {
        return $a.Substring(1, $a.Length - 2)
    }

    if ($a -match 'this\.(\w+)$') {
        $varName = $Matches[1]
        if ($ApiVarMap.ContainsKey($varName)) {
            return $ApiVarMap[$varName]
        }
    }

    return ""
}

function Extract-FrontendCalls {
    param([string]$FrontendRoot)

    $calls = @()
    $files = Get-ChildItem -Path $FrontendRoot -Recurse -Filter "*.ts" -File |
        Where-Object { $_.FullName -notlike "*.spec.ts" }

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw
        $apiVars = Resolve-ApiVarMap -Content $content

        $httpMatches = [regex]::Matches(
            $content,
            'this\.http\.(get|post|put|delete|patch)(?:<[^>]*>)?\(([^,\n\r\)]+)',
            [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        )

        foreach ($m in $httpMatches) {
            $method = $m.Groups[1].Value.ToUpperInvariant()
            $arg = $m.Groups[2].Value
            $resolved = Resolve-HttpArg -Arg $arg -ApiVarMap $apiVars
            if ([string]::IsNullOrWhiteSpace($resolved)) {
                continue
            }

            $norm = Normalize-EndpointPath -Path $resolved
            if (-not $norm.StartsWith("/api/")) {
                continue
            }

            $calls += [pscustomobject]@{
                Method = $method
                Url = $resolved
                Norm = $norm
                File = $file.FullName
            }
        }

        # Hardcoded /api/... literal extraction is intentionally skipped here.
        # Most calls are captured from this.http.* patterns above.
    }

    return $calls | Sort-Object Method, Norm, File -Unique
}

$root = (Resolve-Path $RepoRoot).Path
$controllersDir = Join-Path $root "Mulkchi.Api/Controllers"
$frontendRoot = Join-Path $root "Mulkchi.Frontend/src/app"
$outputPath = Join-Path $root $OutFile

if (-not (Test-Path $controllersDir)) {
    throw "Controllers directory not found: $controllersDir"
}
if (-not (Test-Path $frontendRoot)) {
    throw "Frontend root not found: $frontendRoot"
}

$backend = Extract-BackendEndpoints -ControllersDir $controllersDir
$frontend = Extract-FrontendCalls -FrontendRoot $frontendRoot

$rows = @()
$unused = @()
$usedCount = 0

foreach ($be in $backend) {
    $hits = $frontend | Where-Object {
        ($_.Method -eq "ANY" -or $_.Method -eq $be.Method) -and ($_.Norm -match $be.Regex)
    }

    $isUsed = @($hits).Count -gt 0
    if ($isUsed) {
        $usedCount++
    } else {
        $unused += $be
    }

    $files = if ($isUsed) {
        ($hits | Select-Object -ExpandProperty File -Unique |
            ForEach-Object { $_.Replace($root + "\\", "") }) -join "; "
    } else {
        ""
    }

    $rows += [pscustomobject]@{
        Method = $be.Method
        Url = $be.Url
        Controller = $be.Controller
        Used = if ($isUsed) { "YES" } else { "NO" }
        Files = $files
    }
}

$frontendOnly = @()
foreach ($fe in $frontend) {
    $match = $backend | Where-Object {
        ($fe.Method -eq "ANY" -or $_.Method -eq $fe.Method) -and ($fe.Norm -match $_.Regex)
    }

    if (-not $match) {
        $frontendOnly += [pscustomobject]@{
            Method = $fe.Method
            Url = $fe.Norm
            File = $fe.File.Replace($root + "\\", "")
        }
    }
}

$total = $backend.Count
$unusedCount = $unused.Count
$coverage = if ($total -gt 0) { [math]::Round(($usedCount * 100.0) / $total, 2) } else { 0 }

$report = @()
$report += "# API Coverage Report"
$report += ""
$report += "## 1) Barcha endpointlar"
$report += "| Method | URL | Controller | FE ishlatadimi | Fayllar |"
$report += "|---|---|---|---|---|"
foreach ($r in ($rows | Sort-Object Controller, Url, Method)) {
    $report += "| $($r.Method) | $($r.Url) | $($r.Controller) | $($r.Used) | $($r.Files) |"
}

$report += ""
$report += "## 2) Frontendda ISHLATILMAGAN ($unusedCount ta)"
$report += "| Method | URL | Controller |"
$report += "|---|---|---|"
foreach ($r in ($unused | Sort-Object Controller, Url, Method)) {
    $report += "| $($r.Method) | $($r.Url) | $($r.Controller) |"
}

$report += ""
$report += "## 3) Frontendda bor, backendda YO'Q"
$report += "| Method | URL | Fayl |"
$report += "|---|---|---|"
foreach ($r in ($frontendOnly | Sort-Object File, Url, Method | Select-Object -Unique Method, Url, File)) {
    $report += "| $($r.Method) | $($r.Url) | $($r.File) |"
}

$report += ""
$report += "## 4) Natija"
$report += "- Jami: **$total**"
$report += "- Ishlatilayotgan: **$usedCount**"
$report += "- Ishlatilmayotgan: **$unusedCount**"
$report += "- Coverage: **$coverage%**"

$report | Set-Content -Path $outputPath -Encoding UTF8
Write-Host "Tayyor! Coverage: $coverage% | Jami: $total | Ishlatilayotgan: $usedCount | Ishlatilmayotgan: $unusedCount"
