#!/bin/bash

# TinTin Finance Backend Setup Script
# This script sets up the backend development environment

set -e

echo "🚀 TinTin Finance Backend Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check Node.js version
print_info "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or later is required. Current version: $(node -v)"
    exit 1
fi
print_status "Node.js version: $(node -v)"

# Check if pnpm is available, otherwise use npm
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
    print_status "Using pnpm package manager"
else
    PACKAGE_MANAGER="npm"
    print_status "Using npm package manager"
fi

# Install dependencies
print_info "Installing dependencies..."
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm install
else
    npm install
fi
print_status "Dependencies installed successfully"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found"
    if [ -f ".env.example" ]; then
        print_info "Copying .env.example to .env..."
        cp .env.example .env
        print_status ".env file created from template"
        print_warning "Please edit .env file with your configuration values"
    else
        print_error ".env.example file not found. Please create .env manually."
    fi
else
    print_status ".env file already exists"
fi

# Check TypeScript compilation
print_info "Checking TypeScript compilation..."
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm run type-check
else
    npm run type-check
fi
print_status "TypeScript compilation successful"

# Check if Rust is installed (for Solana development)
print_info "Checking Rust installation..."
if ! command -v rustc &> /dev/null; then
    print_warning "Rust is not installed. Solana features will not be available."
    print_info "To install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
else
    print_status "Rust version: $(rustc --version)"
fi

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    print_warning "Solana CLI is not installed. Blockchain features will be limited."
    print_info "To install Solana CLI: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
else
    print_status "Solana CLI version: $(solana --version)"
fi

# Create necessary directories
print_info "Creating necessary directories..."
mkdir -p logs
mkdir -p temp
mkdir -p uploads
print_status "Directories created"

# Run linting (optional)
print_info "Running linter..."
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    if pnpm run lint; then
        print_status "Linting passed"
    else
        print_warning "Linting failed - please fix issues before running in production"
    fi
else
    if npm run lint; then
        print_status "Linting passed"
    else
        print_warning "Linting failed - please fix issues before running in production"
    fi
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
print_info "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Set up your Supabase project and add credentials to .env"
echo "3. Configure Solana RPC endpoint in .env (if using blockchain features)"
echo "4. Run 'npm run dev' or 'pnpm dev' to start the development server"
echo ""
print_info "Useful commands:"
echo "• Start development server: $PACKAGE_MANAGER run dev"
echo "• Build for production: $PACKAGE_MANAGER run build"
echo "• Run tests: $PACKAGE_MANAGER test"
echo "• Check types: $PACKAGE_MANAGER run type-check"
echo "• Fix linting: $PACKAGE_MANAGER run lint:fix"
echo ""
print_info "Documentation:"
echo "• README.md - Complete setup and API documentation"
echo "• BACKEND_PROGRESS.md - Implementation progress and status"
echo "• .env.example - Environment variable reference"
echo ""
print_status "Backend setup completed successfully! 🚀"
