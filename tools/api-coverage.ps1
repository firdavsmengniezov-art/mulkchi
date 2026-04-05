param(
    [string]$RepoRoot = ".",
    [string]$SwaggerUrl = "",
    [string]$SwaggerFile = "",
    [string]$OutFile = "api-coverage-report.md"
)

function NormUrl([string]$u) {
    if ([string]::IsNullOrWhiteSpace($u)) { return "" }
    $x = $u.Trim().ToLowerInvariant()
    $x = $x -replace "https?://[^/]+", ""
    $x = $x -replace "\?.*$", ""
    $x = $x -replace "/+$", ""
    if (-not $x.StartsWith("/")) { $x = "/" + $x }
    $x = $x -replace "\{[^}]+\}", "*"
    return $x
}

function ToRegex([string]$t) {
    $e = [Regex]::Escape($t) -replace "\\\*", "[^/]+"
    return "^$e$"
}

if ($SwaggerFile) { $sw = Get-Content -Raw $SwaggerFile | ConvertFrom-Json }
else { $sw = Invoke-RestMethod -Uri $SwaggerUrl }

$backend = @()
foreach ($p in $sw.paths.PSObject.Properties) {
    foreach ($m in @("get","post","put","delete","patch")) {
        $op = $p.Value.$m
        if ($null -ne $op) {
            $ctrl = if ($op.tags -and $op.tags.Count -gt 0) { $op.tags[0] } else { "Unknown" }
            $backend += [pscustomobject]@{
                Method = $m.ToUpperInvariant()
                Url    = $p.Name
                Norm   = NormUrl $p.Name
                Regex  = ToRegex (NormUrl $p.Name)
                Ctrl   = $ctrl
            }
        }
    }
}

$fePaths = @(
    (Join-Path $RepoRoot "Mulkchi.Frontend\src\app\core\services"),
    (Join-Path $RepoRoot "Mulkchi.Frontend\src\app\features"),
    (Join-Path $RepoRoot "src\app\core\services"),
    (Join-Path $RepoRoot "src\app\features")
) | Where-Object { Test-Path $_ }

$feCalls = @()
foreach ($folder in $fePaths) {
    foreach ($f in (Get-ChildItem $folder -Recurse -Filter *.ts)) {
        $c = Get-Content -Raw $f.FullName
        $matches2 = [regex]::Matches($c, '(this\.http\.(get|post|put|delete|patch))[^(]*\([''"]([^''"]+)[''"]')
        foreach ($m in $matches2) {
            $feCalls += [pscustomobject]@{
                Method = $m.Groups[2].Value.ToUpperInvariant()
                Url    = $m.Groups[3].Value
                Norm   = NormUrl $m.Groups[3].Value
                File   = $f.FullName.Replace((Resolve-Path $RepoRoot).Path, ".")
            }
        }
        $matches3 = [regex]::Matches($c, '[''"](/api/[^''"]+)[''"]')
        foreach ($m in $matches3) {
            $feCalls += [pscustomobject]@{
                Method = "ANY"
                Url    = $m.Groups[1].Value
                Norm   = NormUrl $m.Groups[1].Value
                File   = $f.FullName.Replace((Resolve-Path $RepoRoot).Path, ".")
            }
        }
    }
}

$used = 0
$rows = @()
$unused = @()
foreach ($be in $backend) {
    $hit = $feCalls | Where-Object { ($_.Method -eq "ANY" -or $_.Method -eq $be.Method) -and ($_.Norm -match $be.Regex) }
    $isUsed = $hit.Count -gt 0
    if ($isUsed) { $used++ } else { $unused += $be }
    $rows += [pscustomobject]@{
        Method = $be.Method; Url = $be.Url; Ctrl = $be.Ctrl
        Used   = if ($isUsed) { "YES" } else { "NO" }
        Files  = if ($isUsed) { ($hit.File | Select-Object -Unique) -join "; " } else { "" }
    }
}

$feOnly = @()
foreach ($fe in ($feCalls | Where-Object { $_.Norm -like "/api/*" })) {
    $hit = $backend | Where-Object { ($fe.Method -eq "ANY" -or $_.Method -eq $fe.Method) -and ($fe.Norm -match $_.Regex) }
    if (-not $hit) { $feOnly += $fe }
}

$pct = [math]::Round(($used * 100.0) / $backend.Count, 2)

$out = @()
$out += "# API Coverage Report"
$out += ""
$out += "## 1) Barcha endpointlar"
$out += "| Method | URL | Controller | FE ishlatadimi | Fayllar |"
$out += "|---|---|---|---|---|"
foreach ($r in $rows | Sort-Object Ctrl,Url) { $out += "| $($r.Method) | $($r.Url) | $($r.Ctrl) | $($r.Used) | $($r.Files) |" }
$out += ""
$out += "## 2) Frontendda ISHLATILMAGAN ($($unused.Count) ta)"
$out += "| Method | URL | Controller |"
$out += "|---|---|---|"
foreach ($r in $unused | Sort-Object Ctrl,Url) { $out += "| $($r.Method) | $($r.Url) | $($r.Ctrl) |" }
$out += ""
$out += "## 3) Frontendda bor, backendda YO'Q"
$out += "| Method | URL | Fayl |"
$out += "|---|---|---|"
foreach ($r in ($feOnly | Select-Object -Unique Method,Url,File | Sort-Object File,Url)) { $out += "| $($r.Method) | $($r.Url) | $($r.File) |" }
$out += ""
$out += "## 4) Natija"
$out += "- Jami: **$($backend.Count)**"
$out += "- Ishlatilayotgan: **$used**"
$out += "- Ishlatilmayotgan: **$($unused.Count)**"
$out += "- Coverage: **$pct%**"

$out | Set-Content -Path (Join-Path $RepoRoot $OutFile) -Encoding UTF8
Write-Host "Tayyor! Coverage: $pct% | Jami: $($backend.Count) | Ishlatilayotgan: $used | Ishlatilmayotgan: $($unused.Count)"
