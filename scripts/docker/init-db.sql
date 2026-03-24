-- Initial database setup for Trello Clone
-- This script runs automatically on first PostgreSQL startup

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS app;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA app TO trello;
GRANT ALL PRIVILEGES ON DATABASE trello TO trello;
