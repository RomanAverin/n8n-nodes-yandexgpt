# Development Guide

This guide will help you set up the development environment for the YandexGPT n8n node.

## Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Git
- n8n instance (for testing)

## Setting Up Development Environment

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/n8n-nodes-yandex-cloud-ml.git
cd n8n-nodes-yandex-cloud-ml
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Project

```bash
npm run build
```

### 4. Link for Local Development

```bash
npm link
```

### 5. Link to n8n

In your n8n installation directory:

```bash
npm link n8n-nodes-yandex-cloud-ml
```

Or if using n8n via npx:

```bash
# Create a directory for n8n
mkdir n8n-dev
cd n8n-dev
npm init -y
npm install n8n
npm link n8n-nodes-yandex-cloud-ml
npx n8n start
```

## Development Workflow

### Project Structure

```
n8n-nodes-yandex-cloud-ml/
├── .github/                 # GitHub Actions workflows
├── credentials/             # Credential files
│   └── YandexGPTApi.credentials.ts
├── nodes/                   # Node implementations
│   └── YandexGPT/
│       ├── YandexGPT.node.ts
│       ├── YandexGPT.node.json
│       └── yandexgpt.svg
├── utils/                   # Utility functions
│   └── auth.ts
├── dist/                    # Built files (generated)
├── package.json
├── tsconfig.json
├── gulpfile.js
└── README.md
```

### Building

```bash
# Build TypeScript and copy assets
npm run build

# Watch mode for development
npm run dev
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lintfix

# Format code
npm run format
```

### Testing

```bash
# Type checking
npx tsc --noEmit

# Manual testing in n8n
# 1. Start n8n: npx n8n start
# 2. Open http://localhost:5678
# 3. Create workflow with YandexGPT node
```

## File Explanations

### Node Files

#### `YandexGPT.node.ts`
Main node implementation containing:
- Node description and properties
- Execute method with API calls
- Parameter validation
- Error handling

#### `YandexGPT.node.json`
Node metadata for n8n registry:
- Categories and subcategories
- Documentation links
- Aliases

#### `YandexGPTApi.credentials.ts`
Credential definition:
- Authentication methods
- Parameter definitions
- Validation rules

### Utility Files

#### `utils/auth.ts`
Authentication utilities:
- JWT token creation
- IAM token exchange
- Token caching
- Validation functions

## Adding New Features

### 1. Adding New Operations

1. Update node properties in `YandexGPT.node.ts`:
   ```typescript
   options: [
     // ... existing operations
     {
       name: 'New Operation',
       value: 'newOperation',
       description: 'Description of new operation',
       action: 'Perform new operation',
     },
   ],
   ```

2. Add parameters for the new operation
3. Implement the operation in the execute method
4. Update documentation

### 2. Adding New Authentication Methods

1. Update credentials in `YandexGPTApi.credentials.ts`
2. Add new auth type to options
3. Add corresponding parameters
4. Update `utils/auth.ts` to handle new method
5. Test thoroughly

### 3. Adding New Models

1. Update model options in node properties
2. Test with YandexGPT API
3. Update documentation

## Testing Your Node

### Setting Up Test Credentials

1. Create a Yandex Cloud account
2. Create a service account with `ai.languageModels.user` role
3. Generate service account key
4. Get your folder ID

### Manual Testing Checklist

- [ ] Node appears in n8n palette
- [ ] Credentials can be created and saved
- [ ] All authentication methods work
- [ ] Chat completion works with different models
- [ ] Text generation works
- [ ] Error handling works properly
- [ ] Token usage is reported correctly
- [ ] Different temperature settings work
- [ ] Max tokens parameter is respected

### Test Cases

#### Basic Chat Completion
```json
{
  "resource": "chat",
  "operation": "complete",
  "model": "yandexgpt-lite",
  "messages": [
    {
      "role": "user",
      "text": "Hello, how are you?"
    }
  ],
  "temperature": 0.5,
  "maxTokens": 100
}
```

#### Error Handling
- Invalid credentials
- Rate limiting
- Network errors
- Invalid parameters

## Debugging

### Enable Debug Logging

```bash
# Set log level
export N8N_LOG_LEVEL=debug

# Start n8n
npx n8n start
```

### Common Issues

#### "Node not found"
- Ensure the node is properly built: `npm run build`
- Check if it's linked: `npm list -g n8n-nodes-yandex-cloud-ml`
- Restart n8n after linking

#### "Authentication failed"
- Verify service account key format
- Check folder ID
- Ensure service account has proper roles
- Check IAM token expiration

#### "TypeScript errors"
- Run `npx tsc --noEmit` to check types
- Ensure all dependencies are installed
- Check TypeScript version compatibility

### Debug Tools

```typescript
// Add debug logging in your node
console.log('Debug info:', { variable });

// Use n8n's logger (if available)
this.logger?.debug('Debug message', { data });
```

## Publishing

### Pre-publish Checklist

- [ ] All tests pass
- [ ] Linting passes
- [ ] Documentation is complete
- [ ] Version is bumped
- [ ] Changelog is updated
- [ ] Icons are optimized

### Publishing Steps

```bash
# Ensure everything is clean
npm run lint
npm run build

# Bump version
npm version patch  # or minor/major

# Publish to npm
npm publish
```

### Publishing to n8n Community

1. Submit to n8n community nodes repository
2. Follow n8n's verification guidelines
3. Provide comprehensive documentation
4. Include examples and test cases

## Contributing

### Code Style

- Use TypeScript
- Follow existing code patterns
- Add proper type definitions
- Include JSDoc comments for public methods
- Use meaningful variable names

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Commit Messages

Follow conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `refactor:` for code refactoring
- `test:` for tests
- `chore:` for maintenance

## Resources

### n8n Development
- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

### YandexGPT API
- [YandexGPT Documentation](https://yandex.cloud/en/docs/foundation-models/)
- [Yandex Cloud IAM](https://yandex.cloud/en/docs/iam/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript with Node.js](https://nodejs.org/en/docs/guides/nodejs-typescript/)

## Support

- Create issues on GitHub
- Check existing issues and discussions
- Provide detailed bug reports with:
  - n8n version
  - Node version
  - Error messages
  - Steps to reproduce

## License

This project is licensed under the MIT License. See LICENSE file for details.