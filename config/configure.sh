#!/bin/bash

# Stop any existing containers
docker-compose down

# Start nginx
docker-compose up -d nginx

# Get the SSL certificate
docker-compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot --email your@email.com -d your-domain.com --agree-tos --no-eff-email

# Start all services
docker-compose up -d