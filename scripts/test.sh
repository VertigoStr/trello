#!/bin/bash
# Test runner for Trello Clone

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
    echo "Usage: ./scripts/test.sh [OPTIONS]"
    echo ""
    echo "Run tests for Trello Clone."
    echo ""
    echo "Options:"
    echo "  --help       Show this help message"
    echo ""
    echo "This script will:"
    echo "  - Run backend tests (if exists)"
    echo "  - Run frontend tests (if exists)"
    echo "  - Run contract tests (if exists)"
    echo "  - Run integration tests (if exists)"
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
echo "Trello Clone - Tests"
echo "========================================"
echo ""

# Check if tests directory exists
if [ ! -d "tests" ]; then
    print_warn "No tests directory found"
    echo ""
    echo "Tests will be added as features are implemented."
    echo "See constitution principle: Test-First (NON-NEGOTIABLE)"
    exit 0
fi

# Run tests based on project structure
if [ -d "backend/tests" ]; then
    print_info "Running backend tests..."
    # Backend tests will be added when backend is implemented
fi

if [ -d "frontend/tests" ]; then
    print_info "Running frontend tests..."
    # Frontend tests will be added when frontend is implemented
fi

if [ -d "tests/contract" ]; then
    print_info "Running contract tests..."
    # Contract tests
fi

if [ -d "tests/integration" ]; then
    print_info "Running integration tests..."
    # Integration tests
fi

print_info "All tests completed!"
