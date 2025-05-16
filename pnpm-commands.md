# PNPM Commands Reference

## Project Setup

- `pnpm install` - Install all dependencies
- `pnpm clean` - Remove node_modules and build folders
- `pnpm reinstall` - Clean and reinstall all dependencies

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build the project
- `pnpm start` - Start the production server
- `pnpm lint` - Run linting

## Package Management

- `pnpm add <package>` - Add a dependency
- `pnpm add -D <package>` - Add a dev dependency
- `pnpm remove <package>` - Remove a dependency
- `pnpm update` - Update dependencies
- `pnpm list` - List installed packages

## Workspace Commands (Monorepo)

- `pnpm -r <command>` - Run a command in all packages
- `pnpm --filter <package> <command>` - Run a command in a specific package

## Other Useful Commands

- `pnpm run <script>` - Run a script defined in package.json
- `pnpm dlx <package>` - Execute a package without installing it (like npx)
- `pnpm outdated` - Check for outdated dependencies
