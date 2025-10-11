# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-10

### Added
- 🎉 Initial release of Sentinel
- Command parsing with context detection (branch, environment, directory)
- Risk engine with configurable rules and heuristics
- Decision engine with three risk levels (safe, warning, critical)
- Telemetry system with stats and event tracking
- Plugin system for extensibility
- Stats display with colorful terminal UI
- YAML-based configuration system
- Default rule set for common dangerous operations
- Example plugin for branch checking
- Comprehensive test suite
- Full documentation (README, ARCHITECTURE, PLUGIN_GUIDE, CONTRIBUTING)
- CI/CD pipeline with GitHub Actions
- MIT License

### Features
- **Risk Assessment**: Analyzes commands based on patterns, context, and heuristics
- **Interactive Confirmations**: Asks for user confirmation on risky commands
- **Telemetry**: Tracks all commands and maintains statistics
- **Plugin Support**: Extensible architecture for custom rules
- **Git Integration**: Detects current branch and repository context
- **Environment Detection**: Identifies production/staging/development environments
- **Time-based Heuristics**: Increases risk for late-night and weekend operations
- **Force Flag Detection**: Warns about --force and similar dangerous flags
- **Destructive Command Detection**: Identifies delete, drop, reset, etc.

### Heuristics
- Main branch operations: +20 risk
- Production environment: +25 risk
- Force flags: +30 risk
- Destructive keywords: +25 risk
- Late night operations (22h-6h): +15 risk
- Weekend deployments: +20 risk
- Database migrations: +15 risk

### Commands
- `sentinel exec <command>`: Execute command with Sentinel protection
- `sentinel <command>`: Shorthand for exec
- `sentinel stats`: Display statistics and history
- `sentinel --help`: Show help information

### Configuration
- YAML-based rule configuration
- Pattern matching with glob support
- Conditional rules (branch, environment)
- Plugin loading from file paths

### Documentation
- Comprehensive README with examples
- Architecture documentation
- Plugin development guide
- Contributing guidelines
- MIT License

[Unreleased]: https://github.com/mhsolutions/sentinel/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mhsolutions/sentinel/releases/tag/v0.1.0
