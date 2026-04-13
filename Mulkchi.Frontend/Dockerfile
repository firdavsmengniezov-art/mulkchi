FROM node:20-alpine AS build
WORKDIR /app

# Build cache uchun package fayllarini alohida copy qilish
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

# Source kodni copy qilish
COPY . .

# Production build
RUN npm run build -- --configuration production --output-path=dist/mulkchi-frontend/browser

FROM nginx:alpine AS final

COPY --from=build /app/dist/mulkchi-frontend/browser \
  /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
