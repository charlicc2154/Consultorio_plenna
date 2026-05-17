FROM php:8.4-cli

# Instalar dependencias Linux
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    nodejs \
    npm \
    default-mysql-client

# Extensiones PHP necesarias
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

EXPOSE 8000
EXPOSE 5173

CMD ["tail", "-f", "/dev/null"]
