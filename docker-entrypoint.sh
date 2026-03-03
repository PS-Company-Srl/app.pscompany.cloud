#!/bin/sh
set -e
# Attendi che MySQL sia pronto (gestito da depends_on + healthcheck)
php artisan migrate --force
exec "$@"
