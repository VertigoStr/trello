#!/bin/bash
# Start script for Trello Clone local development environment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

show_help() {
    echo "Usage: ./scripts/start.sh [OPTIONS]"
    echo ""
    echo "Start the Trello Clone development environment."
    echo ""
    echo "Options:"
    echo "  --restart    Stop and restart all services"
    echo "  --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/start.sh              # Start services"
    echo "  ./scripts/start.sh --restart    # Restart services"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --restart)
            RESTART=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information."
            exit 1
            ;;
    esac
done

# Check if .env exists
if [ ! -f .env ]; then
    print_error ".env file not found. Run './scripts/setup.sh' first."
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Check Docker
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi

# Handle restart flag
if [ "${RESTART:-false}" = true ]; then
    print_info "Restarting services..."
    docker-compose down
fi

# Start services
print_info "Starting development environment..."

cd scripts/docker
docker-compose up -d

# Wait for services to be healthy
print_info "Waiting for services to be ready..."

MAX_ATTEMPTS=30
ATTEMPT=0

wait_for_service() {
    local service=$1
    local port=$2
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if docker-compose ps | grep -q "$service.*healthy\|Up"; then
            print_info "$service is ready"
            return 0
        fi
        ATTEMPT=$((ATTEMPT + 1))
        sleep 1
    done
    
    print_warn "$service may not be fully ready yet"
}

wait_for_service "postgres" "${POSTGRES_PORT:-5432}"
wait_for_service "redis" "${REDIS_PORT:-6379}"

echo ""
echo "========================================"
print_info "Development environment started!"
echo "========================================"
echo ""
echo "Services:"
echo "  - PostgreSQL: localhost:${POSTGRES_PORT:-5432}"
echo "  - Redis: localhost:${REDIS_PORT:-6379}"
echo ""
echo "Commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop: docker-compose down"
echo "  - Restart: ./scripts/start.sh --restart"
echo ""
