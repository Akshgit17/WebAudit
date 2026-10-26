# WebAudit Accessibility Analyzer

A VSCode extension that provides real-time WCAG 2.2 accessibility analysis for React, Angular, Vue.js, and HTML files with intelligent quick fixes and educational guidance.

## Features

### 🔍 Real-Time Analysis
- **Framework Support**: Works with React/JSX, Angular templates, Vue.js SFCs, and HTML files
- **WCAG 2.2 Compliance**: Checks against Web Content Accessibility Guidelines 2.2
- **Instant Feedback**: See accessibility violations as you type with squiggly underlines
- **Performance Optimized**: Analysis completes in under 500ms for files up to 10,000 lines

### 🛠️ Intelligent Quick Fixes
- **One-Click Solutions**: Fix most violations with a single click
- **Context-Aware**: Suggestions adapt to your specific code context
- **Framework-Specific**: Handles JSX expressions, Angular directives, and Vue template syntax
- **User Guidance**: Interactive prompts for fixes requiring input

### 📚 Educational Guidance
- **WCAG References**: Direct links to relevant WCAG guidelines
- **Impact Explanations**: Learn how violations affect users with disabilities
- **Best Practices**: Contextual tips for writing accessible code

### ⚡ Comprehensive Rules

#### Alt Text (WCAG 1.1.1 - Level A)
- Detects missing `alt` attributes on images
- Identifies generic or meaningless alt text
- Suggests context-appropriate descriptions
- Distinguishes between decorative and content images

#### ARIA Labels (WCAG 4.1.2 - Level A)  
- Ensures interactive elements have accessible names
- Checks buttons, links, form controls, and custom components
- Validates `aria-label`, `aria-labelledby`, and text content
- Supports framework-specific event handlers

#### Heading Structure (WCAG 1.3.1 - Level AA)
- Enforces proper heading hierarchy (h1 → h2 → h3, etc.)
- Prevents skipped heading levels
- Detects empty headings
- Identifies headings used purely for styling

## Installation

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "WebAudit Accessibility"
4. Click Install

Or install from the command line:
```bash
code --install-extension webaudit.webaudit-accessibility
```

## Quick Start

1. Open any React, Angular, Vue, or HTML file
2. WebAudit automatically analyzes your code
3. Accessibility violations appear with squiggly underlines
4. Right-click or press `Ctrl+.` (`Cmd+.` on Mac) for quick fixes
5. Hover over violations to see detailed explanations

## Usage

### Command Palette Actions

Access these commands via `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac):

- **WebAudit: Analyze Workspace** - Scan all supported files in your project
- **WebAudit: Fix All Issues in File** - Apply all available automatic fixes
- **WebAudit: Generate Report** - Create a comprehensive accessibility report
- **WebAudit: Toggle Analysis** - Enable/disable real-time analysis
- **WebAudit: Open Settings** - Configure extension preferences

### Context Menu Actions

Right-click in any supported file:
- **Fix All Accessibility Issues** - Apply fixes for the current file

### Status Bar

The status bar shows:
- Current violation count for the active file
- Quick access to workspace analysis

## Configuration

Customize WebAudit behavior in VS Code Settings (`Ctrl+,`):

### Basic Settings

```json
{
  "WebAudit.enabled": true,
  "WebAudit.severity": "warning"
}
```

### Rule Configuration

Enable/disable specific rules and set severity levels:

```json
{
  "WebAudit.rules": {
    "altText": { "enabled": true, "severity": "error" },
    "ariaLabels": { "enabled": true, "severity": "warning" },
    "headingStructure": { "enabled": true, "severity": "warning" }
  }
}
```

### Framework Support

Control which frameworks to analyze:

```json
{
  "WebAudit.frameworks": {
    "react": { "enabled": true },
    "angular": { "enabled": true },
    "vue": { "enabled": true }
  }
}
```

### Quick Fix Behavior

```json
{
  "WebAudit.quickFix": {
    "enabled": true,
    "showPreview": true,
    "autoApply": false
  }
}
```

### Educational Features

```json
{
  "WebAudit.education": {
    "showImpactExplanations": true,
    "showWcagReferences": true,
    "showExamples": true
  }
}
```

## Examples

### Before: Accessibility Issues
```jsx
// Missing alt text
<img src="logo.png" />

// Generic alt text  
<img src="photo.jpg" alt="image" />

// Missing button label
<button onClick={handleClick}>
  <i className="icon-save" />
</button>

// Skipped heading level
<h1>Main Title</h1>
<h3>Subsection</h3>
```

### After: Accessible Code
```jsx
// Descriptive alt text
<img src="logo.png" alt="Company logo" />

// Specific description
<img src="photo.jpg" alt="Team celebrating project completion" />

// Accessible button
<button onClick={handleClick} aria-label="Save document">
  <i className="icon-save" />
</button>

// Proper heading hierarchy
<h1>Main Title</h1>
<h2>Subsection</h2>
```

## Framework-Specific Features

### React/JSX
- Understands JSX expressions: `<img alt={description} />`
- Handles component props and state references
- Supports TypeScript React files

### Angular
- Parses template syntax: `<img [alt]="imageDescription" />`
- Understands property and event bindings
- Supports both inline templates and separate HTML files

### Vue.js
- Works with Single File Components (SFCs)
- Understands Vue directives: `<img :alt="description" />`
- Supports template syntax and scoped slots

## Integration

### ESLint
WebAudit can work alongside ESLint accessibility plugins. It will detect existing ESLint configurations and avoid duplicate warnings.

### CI/CD
Generate reports for continuous integration:

```bash
# Command-line interface (future feature)
npx WebAudit-cli analyze --output report.json
```

## Performance

- **Analysis Speed**: < 500ms for typical files
- **Memory Usage**: < 50MB for large workspaces
- **CPU Impact**: Minimal, with intelligent caching
- **File Limits**: Supports projects with 1000+ files

## Troubleshooting

### Extension Not Working
1. Check if the file type is supported (React, Angular, Vue, HTML)
2. Verify the extension is enabled in settings
3. Restart VS Code if needed

### Performance Issues
1. Exclude large files/folders in VS Code settings
2. Disable analysis for specific frameworks if not needed
3. Adjust cache settings in configuration

### False Positives
1. Report issues on our GitHub repository
2. Temporarily disable specific rules if needed
3. Use workspace-specific configuration to override defaults

## Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/WebAudit/vscode-extension
cd vscode-extension
npm install
npm run compile
```

### Running Tests
```bash
npm test
```

## Support

- **Documentation**: [Full documentation](https://docs.WebAudit.dev)
- **GitHub Issues**: [Report bugs and request features](https://github.com/WebAudit/vscode-extension/issues)
- **Discussions**: [Community discussions](https://github.com/WebAudit/vscode-extension/discussions)

