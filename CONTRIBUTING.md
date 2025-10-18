# Contributing to Hyperliquid Dashboard

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites
- Node.js 20.x or later
- npm 9.x or later
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/marioandres97/hyperliquid-dashboard.git
cd hyperliquid-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

## Development Workflow

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Test additions or updates

Example: `feature/add-trading-signals`

### Commit Messages
We follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**
```
feat(websocket): add reconnection logic with exponential backoff

- Implement automatic reconnection on disconnect
- Add connection quality monitoring
- Emit health events for subscribers

Closes #123
```

## Code Standards

### TypeScript
- Use TypeScript for all new code
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Export types and interfaces from their modules

### React
- Use functional components with hooks
- Use `memo` for expensive components
- Use `useMemo` and `useCallback` for optimization
- Keep components small and focused

### File Organization
```
/app              - Next.js app directory
  /api            - API routes
/components       - React components
  /shared         - Reusable components
/lib              - Utilities and libraries
  /hooks          - Custom React hooks
  /stores         - Zustand stores
  /utils          - Helper functions
  /monitoring     - Logging and error handling
/tests            - Test files
  /unit           - Unit tests
  /integration    - Integration tests
  /e2e            - End-to-end tests
```

### Naming Conventions
- Components: PascalCase (`AssetToggle.tsx`)
- Hooks: camelCase with `use` prefix (`useOrderBook.ts`)
- Utilities: camelCase (`formatPrice.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- Types/Interfaces: PascalCase (`OrderBookSnapshot`)

## Testing

### Running Tests
```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Watch mode (development)
npm test -- --watch
```

### Writing Tests
- Write tests for all new features
- Maintain minimum 70% code coverage
- Test edge cases and error conditions
- Use descriptive test names

**Example:**
```typescript
describe('calculatePriceImpact', () => {
  it('should calculate price impact correctly for market orders', () => {
    const orderSize = 10;
    const orderBookLevels = [
      { price: 100, volume: 5 },
      { price: 101, volume: 5 },
    ];
    const currentPrice = 100;

    const impact = calculatePriceImpact(orderSize, orderBookLevels, currentPrice);
    expect(impact).toBeGreaterThan(0);
  });
});
```

## Performance Guidelines

### WebSocket Usage
- Use the shared `WebSocketManager` singleton
- Throttle updates to max 1/second
- Always clean up subscriptions in useEffect

### State Management
- Use Zustand for global state
- Keep React Context for theme/preferences only
- Avoid unnecessary re-renders with `memo`

### Bundle Size
- Lazy load heavy components
- Use dynamic imports for routes
- Import only needed functions from libraries
- Run `npm run build` to check bundle size

## API Development

### Creating New Endpoints
```typescript
import { NextRequest, NextResponse } from 'next/server';

// Add ISR revalidation
export const revalidate = 30;

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    // Input validation
    // Business logic
    // Return response
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### Security Checklist
- [ ] Rate limiting implemented
- [ ] Input validation on all parameters
- [ ] No sensitive data in client-side code
- [ ] CORS properly configured
- [ ] Error messages don't leak system info

## Pull Request Process

1. **Create a branch** from `develop`
2. **Make your changes** following the guidelines above
3. **Write/update tests** for your changes
4. **Run tests locally**: `npm test`
5. **Build the project**: `npm run build`
6. **Commit your changes** with conventional commits
7. **Push your branch** and create a Pull Request
8. **Describe your changes** in the PR description
9. **Request review** from maintainers
10. **Address feedback** and update your PR

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated (if needed)
- [ ] Build succeeds without errors
- [ ] No console errors or warnings
- [ ] Bundle size is acceptable
- [ ] TypeScript errors resolved
- [ ] Commit messages follow convention

## Getting Help

- **Issues**: Check existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check `/docs` directory

## Code Review Guidelines

### As a Reviewer
- Be constructive and respectful
- Ask questions rather than making demands
- Approve when ready, request changes when needed
- Focus on code quality and maintainability

### As an Author
- Respond to all comments
- Don't take criticism personally
- Ask for clarification if needed
- Update your PR based on feedback

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
