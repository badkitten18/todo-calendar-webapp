# Todo Calendar Webapp

A React-based todo application with a monthly calendar interface.

## Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Vitest** - Testing framework
- **Testing Library** - React component testing utilities

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run test` - Run tests
- `pnpm run test:ui` - Run tests with UI
- `pnpm run test:coverage` - Run tests with coverage report
- `pnpm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── Calendar/     # Calendar-related components
│   ├── Todo/         # Todo management components
│   ├── UI/           # Reusable UI components
│   └── ErrorBoundary.jsx # Error boundary component
├── contexts/
│   └── ErrorContext.jsx # Global error handling context
├── hooks/            # Custom React hooks
├── utils/
│   ├── dateUtils.js  # Date-related utilities
│   ├── errorUtils.js # Error handling utilities
│   └── todoUtils.js  # Todo-related utilities
├── __tests__/        # Test files
└── test/             # Test configuration
```

## Features

- Monthly calendar view
- Add, edit, and delete todos
- Mark todos as complete/incomplete
- Navigate between months
- Responsive design for mobile, tablet, and desktop
- Local storage persistence
- Comprehensive error handling
- Form validation
- Error notifications

## Development

This project follows a component-based architecture with custom hooks for state management and utility functions for common operations.

## Error Handling

The application implements a comprehensive error handling strategy:

- **ErrorBoundary**: Catches and displays errors in the component tree
- **ErrorContext**: Provides global error state management
- **FormError**: Displays form validation errors
- **ErrorNotification**: Shows global error notifications
- **Custom Error Classes**: Specialized error types for different scenarios

See the [Error Handling Guide](./docs/error-handling.md) for more details.