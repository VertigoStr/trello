# Trello Frontend

React + TypeScript frontend for Trello Clone authentication.

## Features

- User registration
- User login
- Password reset
- Protected routes
- Responsive design

## Tech Stack

- **Framework**: React 18+
- **Language**: TypeScript 5+
- **Build Tool**: Vite
- **Routing**: React Router 6+
- **Testing**: Vitest + React Testing Library
- **E2E**: Playwright

## Quick Start

### Prerequisites

- Node.js 18+
- Backend API running (see `../backend/README.md`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Application will be available at `http://localhost:5173`

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:e2e     # Run E2E tests

# Code quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format with Prettier
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/       # Reusable UI components
│   │   └── layout/       # Layout components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── styles/           # Global styles
├── tests/
│   ├── pages/            # Page tests
│   ├── integration/      # Integration tests
│   └── e2e/              # E2E tests
└── ...
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run test:e2e
```

## Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build artifacts will be stored in the `dist/` directory.

## License

Internal use only.
