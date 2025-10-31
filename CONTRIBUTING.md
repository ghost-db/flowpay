# Contributing to FlowPay

Thank you for your interest in contributing to FlowPay! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/flowpay.git
   cd flowpay
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/my-feature
   ```

## Development Workflow

### Running Locally

```bash
# Development mode with hot reload
pnpm dev

# Build TypeScript
pnpm build

# Run production build
pnpm start
```

### Code Quality

Before submitting a PR, ensure your code:

- **Builds successfully**: `pnpm build`
- **Follows linting rules**: `pnpm lint`
- **Is properly formatted**: `pnpm format`
- **Has descriptive commit messages**

### Testing

```bash
# Run tests (when implemented)
pnpm test
```

## Making Changes

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns and structure
- Add JSDoc comments for public APIs
- Use descriptive variable and function names

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add support for market search endpoint
fix: handle edge case in order validation
docs: update API endpoint documentation
```

Prefix types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Submitting Pull Requests

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/my-feature
   ```
2. **Create a Pull Request** on GitHub
3. **Describe your changes** clearly in the PR description
4. **Link any related issues**

### PR Guidelines

- Keep PRs focused on a single feature or fix
- Include tests for new functionality (when test framework is set up)
- Update documentation as needed
- Ensure CI checks pass

## Areas for Contribution

### High Priority

- **Tests**: Add unit and integration tests
- **Documentation**: Improve API documentation and examples
- **Error Handling**: Enhance error messages and validation
- **Performance**: Optimize API response times

### Feature Ideas

- **Advanced Order Types**: Support limit orders, stop-loss, etc.
- **Analytics**: Add endpoints for market analytics and trends
- **WebSocket Support**: Real-time market data streaming
- **Rate Limiting**: Implement rate limiting per payer
- **Caching**: Add caching for frequently accessed data
- **Multi-Market Support**: Support for other prediction markets

### Documentation

- API usage examples for different programming languages
- Video tutorials
- Integration guides for popular AI agent frameworks
- Architecture documentation

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Provide constructive feedback
- Focus on what is best for the community

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## License

By contributing to FlowPay, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to FlowPay! 🚀
