#!/bin/bash
set -e  # Exit on error
set -x  # Print commands as they're executed

# Database connection parameters
export DB_HOST=127.0.0.1
export DB_PORT=2561
export DB_USER=otg
export DB_PASSWORD=otg
export DB_NAME=fresh_flow_db

# Function to check if PostgreSQL is ready
wait_for_postgres() {
    echo "Waiting for PostgreSQL to start..."
    for i in {1..30}; do
        if pg_isready -h localhost -p 2561; then
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

echo "Attempting to connect to PostgreSQL on port 2561..."

# Try connection with full details and verbose output
PGPASSWORD=otg pg_isready -h localhost -p 2561 -d fresh_flow_db -U otg -v

# Store the exit code
result=$?

if [ $result -eq 0 ]; then
    echo "Successfully connected to database"
elif [ $result -eq 1 ]; then
    echo "Server is rejecting connections"
elif [ $result -eq 2 ]; then
    echo "No response from server"
elif [ $result -eq 3 ]; then
    echo "No attempt was made to connect to the server"
else
    echo "Unknown error occurred"
fi

# Exit with the same code as pg_isready
exit $result

# If using psql commands later in the script, use:
# PGPASSWORD=otg psql -h localhost -p 2561 -d fresh_flow_db -U otg 