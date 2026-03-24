#!/bin/bash
# Setup script for Trello Clone local development environment
# Compatible with macOS, Linux, and WSL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "Trello Clone - Setup"
echo "========================================"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

show_help() {
    echo "Usage: ./scripts/setup.sh [OPTIONS]"
    echo ""
    echo "Setup the Trello Clone development environment."
    echo ""
    echo "Options:"
    echo "  --help       Show this help message"
    echo ""
    echo "This script will:"
    echo "  - Check minimum requirements (RAM, disk space)"
    echo "  - Verify Docker installation"
    echo "  - Create .env file from .env.example"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information."
            exit 1
            ;;
    esac
done

# Check minimum requirements
check_requirements() {
    print_info "Checking minimum requirements..."
    
    # Check RAM (2GB minimum)
    if command -v free &> /dev/null; then
        RAM_KB=$(free -k | grep Mem | awk '{print $2}')
        RAM_GB=$((RAM_KB / 1024 / 1024))
        if [ "$RAM_GB" -lt 2 ]; then
            print_warn "RAM: ${RAM_GB}GB detected (minimum 2GB recommended)"
        else
            print_info "RAM: ${RAM_GB}GB OK"
        fi
    fi
    
    # Check disk space (2GB free minimum)
    FREE_KB=$(df -k . | tail -1 | awk '{print $4}')
    FREE_GB=$((FREE_KB / 1024 / 1024))
    if [ "$FREE_GB" -lt 2 ]; then
        print_warn "Disk: ${FREE_GB}GB free (minimum 2GB recommended)"
    else
        print_info "Disk: ${FREE_GB}GB free OK"
    fi
}

# Check Docker installation
check_docker() {
    print_info "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo ""
        echo "Please install Docker:"
        echo "  macOS/Linux: https://docs.docker.com/desktop/"
        echo "  Windows: https://docs.docker.com/desktop/windows/install/"
        exit 1
    fi
    
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3)
    print_info "Docker version: $DOCKER_VERSION"
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        echo ""
        echo "Please start Docker Desktop or Docker service"
        exit 1
    fi
    print_info "Docker daemon is running"
    
    # Check docker-compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "docker-compose is not installed"
        exit 1
    fi
    
    COMPOSE_VERSION=$(docker compose version 2>/dev/null || docker-compose --version | cut -d' ' -f4)
    print_info "docker-compose version: $COMPOSE_VERSION"
}

# Check Git installation
check_git() {
    print_info "Checking Git installation..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        echo ""
        echo "Please install Git:"
        echo "  macOS: xcode-select --install"
        echo "  Linux: sudo apt-get install git"
        echo "  Windows: https://git-scm.com/download/win"
        exit 1
    fi
    
    GIT_VERSION=$(git --version)
    print_info "$GIT_VERSION"
}

# Create .env file from example
setup_env() {
    print_info "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || cat > .env << EOF
# PostgreSQL
POSTGRES_PASSWORD=trello_dev
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# Backend (when implemented)
BACKEND_PORT=8000

# Frontend (when implemented)
FRONTEND_PORT=3000
EOF
        print_info "Created .env file"
    else
        print_info ".env file already exists"
    fi
}

# Main execution
main() {
    check_git
    check_requirements
    check_docker
    setup_env
    
    echo ""
    echo "========================================"
    print_info "Setup completed successfully!"
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo "  1. Run './scripts/start.sh' to start the development environment"
    echo "  2. See 'specs/001-local-dev-env/quickstart.md' for more information"
    echo ""
}

main "$@"
