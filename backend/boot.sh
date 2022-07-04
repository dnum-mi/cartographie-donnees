#!/bin/sh

echo "Waiting for postgres..."

while ! nc -z db 5432; do
  sleep 0.1
done

echo "PostgreSQL started"

source venv/bin/activate
[[ -z "${RESET_DB}" ]] || flask reset-db
flask db upgrade
exec gunicorn -b :5000 --access-logfile - --error-logfile - backend:app
