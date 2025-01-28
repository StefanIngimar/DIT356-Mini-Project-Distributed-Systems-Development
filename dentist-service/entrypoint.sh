#!/bin/sh

ENV=${ENV-dev}
DB_PATH=${DB_PATH:-main.db}

if [ "$ENV" = "test" ]; then
    DB_PATH="data/test.db"
    echo "Using test database: $DB_PATH"
fi

echo "Running migrations"
goose -dir ./db/migrations sqlite3 "$DB_PATH" up

echo "Running application"
exec ./dentist-service
