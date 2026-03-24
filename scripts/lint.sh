#!/bin/bash
# Linter for Trello Clone

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

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

show_help() {
    echo "Usage: ./scripts/lint.sh [OPTIONS]"
    echo ""
    echo "Run linters for Trello Clone."
    echo ""
    echo "Options:"
    echo "  --help       Show this help message"
    echo ""
    echo "This script will:"
    echo "  - Run shellcheck on shell scripts"
    echo "  - Validate docker-compose.yml"
    echo "  - Run sqlfluff on SQL files (if installed)"
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

echo "========================================"
echo "Trello Clone - Linting"
echo "========================================"
echo ""

# Lint shell scripts
if command -v shellcheck &> /dev/null; then
    print_info "Running shellcheck on scripts..."
    
    for script in scripts/*.sh scripts/docker/*.sh; do
        if [ -f "$script" ]; then
            shellcheck "$script" || print_warn "Issues found in $script"
        fi
    done
else
    print_warn "shellcheck not installed. Install with:"
    echo "  macOS: brew install shellcheck"
    echo "  Linux: sudo apt-get install shellcheck"
fi

# Lint docker-compose
if command -v docker-compose &> /dev/null; then
    print_info "Validating docker-compose.yml..."
    docker-compose -f scripts/docker/docker-compose.yml config > /dev/null
    print_info "docker-compose.yml is valid"
fi

# Lint SQL
if command -v sqlfluff &> /dev/null; then
    print_info "Linting SQL files..."
    sqlfluff lint scripts/docker/*.sql || print_warn "SQL lint issues found"
fi

echo ""
print_info "Linting completed!"
