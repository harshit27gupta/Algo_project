# Contributing to Algo_project

Thank you for your interest in contributing to this online judge platform! 

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Docker & Docker Compose (optional)

### Quick Start
1. Clone the repository
2. Copy environment files: `cp server/.env.example server/.env` and `cp client/.env.example client/.env`
3. Install all dependencies: `npm run install:all`
4. Start development services: `npm run dev`

### Development Scripts

#### Root Level
- `npm run install:all` - Install dependencies for all services
- `npm run dev` - Start all services in development mode
- `npm run lint` - Run linting for client and server
- `npm run lint:fix` - Fix linting issues automatically

#### Individual Services
- **Server**: `cd server && npm run server` (development with nodemon)
- **Client**: `cd client && npm run dev` (Vite dev server)
- **Compiler**: `cd Compiler && npm run compiler` (development with nodemon)

## Code Quality

### Linting
- Client uses ESLint with React-specific rules
- Server uses ESLint with Node.js rules
- Run `npm run lint` before committing

### Code Style
- Use meaningful variable names
- Add proper error handling (no empty catch blocks)
- Remove unused imports and variables
- Follow existing code patterns

## Pull Request Guidelines

1. **Create a feature branch** from `main`
2. **Make focused commits** with clear messages
3. **Ensure all linting passes** (`npm run lint`)
4. **Test your changes** thoroughly
5. **Update documentation** if needed

## Common Tasks

### Adding New Dependencies
```bash
# For server
cd server && npm install package-name

# For client  
cd client && npm install package-name

# For compiler service
cd Compiler && npm install package-name
```

### Database Changes
- Update models in `server/models/`
- Add migration scripts if needed
- Update seed data in `server/utils/seedProblems.js`

### API Changes
- Update controllers in `server/controllers/`
- Add proper validation using express-validator
- Update client API calls in `client/src/services/api.js`

## Security Guidelines

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** on both client and server
3. **Use HTTPS** in production
4. **Keep dependencies updated** - Run `npm audit` regularly

## Testing

Currently, the project has basic test files. When adding features:
- Add tests for new API endpoints
- Test error scenarios
- Verify security measures

## Questions?

Feel free to open an issue for any questions about contributing!