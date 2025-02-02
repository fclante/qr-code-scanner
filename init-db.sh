#!/bin/bash

# Database connection parameters
export DB_HOST="127.0.0.1"
export DB_PORT="5432"
export DB_USER="postgres"
export DB_PASSWORD="otg"
export DB_NAME="fresh_flow_db"

# Function to check if PostgreSQL is ready
wait_for_postgres() {
    echo "Waiting for PostgreSQL to start..."
    for i in {1..30}; do
        if pg_isready -h 127.0.0.1 -U "$DB_USER"; then
            echo "PostgreSQL is ready!"
            return 0
        fi
        echo "Waiting... ($i/30)"
        sleep 1
    done
    echo "PostgreSQL did not start in time"
    return 1
}

# Wait for PostgreSQL to be ready
wait_for_postgres

# Create database if it doesn't exist
echo "Creating database if it doesn't exist..."
psql -h 127.0.0.1 -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Execute the schema.sql file
echo "Initializing schema..."
psql -h 127.0.0.1 -U "$DB_USER" -d "$DB_NAME" -f src/backend/schema.sql

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo "Database schema successfully initialized!"
else
    echo "Error: Failed to initialize database schema"
    exit 1
fi

# Unset the password
unset PGPASSWORD 