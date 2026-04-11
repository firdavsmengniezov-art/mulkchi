FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
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
