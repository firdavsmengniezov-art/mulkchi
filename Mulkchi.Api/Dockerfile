FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["Mulkchi.Api/Mulkchi.Api.csproj", "Mulkchi.Api/"]
RUN dotnet restore "Mulkchi.Api/Mulkchi.Api.csproj"

COPY . .
WORKDIR "/src/Mulkchi.Api"
RUN dotnet build "Mulkchi.Api.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/build

FROM build AS publish
RUN dotnet publish "Mulkchi.Api.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Root bo'lmagan user bilan ishga tushir (xavfsizlik)
RUN adduser --disabled-password --gecos '' appuser
USER appuser

ENTRYPOINT ["dotnet", "Mulkchi.Api.dll"]
