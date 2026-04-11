# 🐳 Multi-stage Dockerfile for Mulkchi Platform
FROM node:20-bookworm-slim AS frontend-build

# 📦 Frontend Build Stage
WORKDIR /app/frontend
COPY Mulkchi.Frontend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY Mulkchi.Frontend/ ./
RUN npm run build:prod

# 🏗️ Backend Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS backend-build

WORKDIR /app/backend
COPY ["Mulkchi.Api/Mulkchi.Api.csproj", "Mulkchi.Api/"]

RUN dotnet restore "Mulkchi.Api/Mulkchi.Api.csproj"
COPY . .
WORKDIR "/app/backend/Mulkchi.Api"
RUN dotnet publish "Mulkchi.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 🚀 Final Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime

# 📦 Install required packages
RUN apk add --no-cache curl

# 📁 Create app directory
WORKDIR /app

# 🔧 Environment variables
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

# 📦 Copy backend files
COPY --from=backend-build /app/publish ./

# 📦 Copy frontend build files
COPY --from=frontend-build /app/frontend/dist ./wwwroot

# 🔒 Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# 📁 Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# 🏥 Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# 🚀 Expose port
EXPOSE 80

# 🚀 Start application
ENTRYPOINT ["dotnet", "Mulkchi.Api.dll"]
