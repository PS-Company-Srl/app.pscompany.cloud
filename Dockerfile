# Stage 1: Build frontend assets
FROM node:22-alpine AS frontend
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci
COPY vite.config.js ./
COPY resources ./resources
COPY public ./public
RUN npm run build

# Stage 2: Laravel app
FROM php:8.2-cli-alpine
WORKDIR /var/www/html

RUN apk add --no-cache \
    libzip-dev \
    sqlite-dev \
    icu-dev \
    oniguruma-dev \
    mariadb-dev \
    && docker-php-ext-install pdo pdo_sqlite pdo_mysql zip intl mbstring opcache \
    && docker-php-ext-enable opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

COPY . .
COPY --from=frontend /app/public/build ./public/build

RUN composer install --no-dev --optimize-autoloader --no-interaction

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
