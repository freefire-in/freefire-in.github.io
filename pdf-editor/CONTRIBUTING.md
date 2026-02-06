# Contributing Guide

Thank you for your interest in contributing to the Professional PDF Editor!

## Getting Started

### Prerequisites
- Basic understanding of JavaScript (ES6+)
- Familiarity with HTML/CSS
- Knowledge of PDF structure (helpful but not required)
- Git for version control

### Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd pdf-editor

# Start development server
python -m http.server 8000
# or
npx http-server -p 8000

# Open in browser
open http://localhost:8000
```

## Project Structure

```
pdf-editor/
├── index.html              # Main application entry
├── styles/                 # Stylesheets
│   ├── main.css           # Core styles, theme variables
│   ├── toolbar.css        # Toolbar component
│   ├── sidebar.css        # Sidebar component
│   └── editor.css         # Editor canvas and layers
├── js/
│   ├── main.js            # Application controller
│   └── modules/           # Modular components
│       ├── PDFLoader.js
│       ├── PDFRenderer.js
│       ├── TextEditor.js
│       ├── ImageManager.js
│       ├── PDFExporter.js
│       ├── StateManager.js
│       ├── UIController.js
│       └── Utils.js
├── demo/                   # Demo and test files
└── docs/                   # Documentation
```

## Code Style Guidelines

### JavaScript

#### ES6+ Standards
```javascript
// Use const/let, not var
const config = { zoom: 1.0 };
let currentPage = 1;

// Arrow functions for callbacks
element.addEventListener('click', (e) => this.handleClick(e));

// Template literals
const message = `Loading page ${pageNum} of ${totalPages}`;

// Destructuring
const { width, height } = page.getSize();

// Async/await for promises
async loadPDF(file) {
  const data = await file.arrayBuffer();
  return await pdfjsLib.getDocument(data).promise;
}
```

#### Naming Conventions
```javascript
// Classes: PascalCase
class PDFLoader { }

// Functions/methods: camelCase
function renderPage() { }
async exportPDF() { }

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Private methods: prefix with _
_internalHelper() { }

// Boolean variables: is/has prefix
const isEditMode = true;
const hasChanges = false;
```

#### Comments
```javascript
// Single-line comments for brief explanations
const zoom = 1.0; // Default zoom level

/**
 * Multi-line comments for functions/classes
 * @param {PDFPageProxy} page - The PDF page to render
 * @param {number} scale - Scale factor for rendering
 * @returns {Promise<void>}
 */
async renderPage(page, scale) {
  // Implementation
}

// TODO: Add keyboard shortcuts
// FIXME: Handle edge case for rotated pages
// NOTE: PDF.js returns coordinates in different space
```

### CSS

#### Organization
```css
/* Component styles */
.toolbar {
  /* Layout */
  display: flex;
  flex-direction: row;
  
  /* Spacing */
  padding: 12px 16px;
  margin: 0;
  
  /* Visual */
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  
  /* Effects */
  box-shadow: 0 2px 8px var(--shadow-color);
  
  /* Misc */
  z-index: 100;
}
```

#### Use CSS Variables
```css
:root {
  --accent-color: #4a90e2;
  --text-primary: #333333;
}

.button {
  color: var(--text-primary);
  background: var(--accent-color);
}
```

#### Mobile-First Responsive
```css
/* Base styles for mobile */
.toolbar {
  flex-direction: column;
}

/* Desktop styles */
@media (min-width: 768px) {
  .toolbar {
    flex-direction: row;
  }
}
```

### HTML

#### Semantic Structure
```html
<!-- Use semantic HTML5 elements -->
<header>
  <nav>
    <button>Open</button>
  </nav>
</header>

<main>
  <aside><!-- Sidebar --></aside>
  <section><!-- Canvas --></section>
</main>

<footer><!-- Status bar --></footer>
```

#### Accessibility
```html
<!-- ARIA labels -->
<button aria-label="Zoom in" title="Zoom in">
  <i class="fas fa-search-plus"></i>
</button>

<!-- Alt text for images -->
<img src="icon.png" alt="PDF icon">

<!-- Form labels -->
<label for="page-input">Page Number:</label>
<input id="page-input" type="number">
```

## Adding New Features

### 1. Plan Your Feature

Create an issue describing:
- What the feature does
- Why it's needed
- How it should work
- UI mockups (if applicable)

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Implement the Feature

#### Example: Adding a New Tool

**Step 1: Add UI Element**
```html
<!-- In index.html -->
<button id="new-tool-btn" class="toolbar-btn">
  <i class="fas fa-magic"></i>
  <span>New Tool</span>
</button>
```

**Step 2: Add Styles**
```css
/* In appropriate CSS file */
.new-tool-active {
  background-color: var(--accent-color);
  color: white;
}
```

**Step 3: Create Module**
```javascript
// js/modules/NewTool.js
export class NewTool {
  constructor() {
    this.isActive = false;
  }
  
  activate() {
    this.isActive = true;
    // Implementation
  }
  
  deactivate() {
    this.isActive = false;
    // Implementation
  }
}
```

**Step 4: Integrate in Main**
```javascript
// js/main.js
import { NewTool } from './modules/NewTool.js';

class PDFEditorApp {
  constructor() {
    this.newTool = new NewTool();
    // ...
  }
  
  setupEventListeners() {
    document.getElementById('new-tool-btn')
      .addEventListener('click', () => this.toggleNewTool());
  }
  
  toggleNewTool() {
    if (this.newTool.isActive) {
      this.newTool.deactivate();
    } else {
      this.newTool.activate();
    }
  }
}
```

### 4. Test Your Feature

Follow the testing guide:
- Unit tests for individual functions
- Integration tests for workflows
- Browser compatibility tests
- Performance tests

### 5. Document Your Feature

Update documentation:
- Add to README.md features list
- Update CHANGELOG.md
- Add usage instructions
- Include code examples

### 6. Submit Pull Request

```bash
git add .
git commit -m "feat: add new tool for [purpose]"
git push origin feature/your-feature-name
```

Create PR with:
- Clear description
- Screenshots/GIFs
- Test results
- Breaking changes (if any)

## Common Contribution Areas

### 1. New Edit Tools
- Annotation tools (highlight, underline)
- Drawing tools (shapes, arrows)
- Text formatting (bold, italic)

### 2. UI Improvements
- Keyboard shortcuts
- Context menus
- Tooltips
- Loading indicators

### 3. Performance Optimizations
- Rendering speed
- Memory usage
- Large file handling
- Caching strategies

### 4. Export Features
- Multiple format support
- Compression options
- Metadata editing
- Batch processing

### 5. Accessibility
- Screen reader support
- Keyboard navigation
- High contrast mode
- Focus indicators

## Bug Fixes

### Reporting Bugs

Include:
1. **Description**: What went wrong?
2. **Steps to Reproduce**: How to trigger the bug?
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What actually happens?
5. **Environment**: Browser, OS, file details
6. **Screenshots**: Visual evidence
7. **Console Logs**: Error messages

### Fixing Bugs

1. **Reproduce**: Confirm you can trigger the bug
2. **Isolate**: Find the root cause
3. **Fix**: Implement the minimal fix
4. **Test**: Verify fix works
5. **Regression Test**: Ensure nothing else broke
6. **Document**: Update relevant docs

Example fix:
```javascript
// Before (buggy)
function calculatePosition(x, y) {
  return { x: x, y: y }; // Missing viewport transform
}

// After (fixed)
function calculatePosition(x, y, viewport) {
  const tx = viewport.transform;
  return {
    x: x * tx[0] + tx[4],
    y: y * tx[3] + tx[5]
  };
}
```

## Code Review Process

### For Contributors

When submitting code:
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested in multiple browsers
- [ ] Commit messages are clear

### For Reviewers

Check for:
- [ ] Code quality and readability
- [ ] Performance implications
- [ ] Security concerns
- [ ] Accessibility compliance
- [ ] Documentation completeness
- [ ] Test coverage

## Testing Requirements

### Before Submitting

Run these tests:
```bash
# Manual testing checklist
1. Load PDF - works
2. Edit text - works
3. Edit image - works
4. Undo/redo - works
5. Export - works
6. No console errors
7. No memory leaks
```

### Browser Testing

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance Baseline

Ensure:
- Load time <5s for 10MB PDF
- Render time <500ms per page
- Edit response <100ms
- Export time <5s for edited PDF

## Documentation Standards

### Code Documentation

Use JSDoc:
```javascript
/**
 * Exports the modified PDF with all applied changes
 * @param {ArrayBuffer} originalPDF - Original PDF data
 * @param {Array<Object>} textEdits - Text modifications
 * @param {Array<Object>} imageEdits - Image modifications
 * @returns {Promise<Uint8Array>} Modified PDF bytes
 * @throws {Error} If export fails
 */
async exportPDF(originalPDF, textEdits, imageEdits) {
  // Implementation
}
```

### User Documentation

Include:
- Clear instructions
- Screenshots/GIFs
- Code examples
- Common issues
- Tips and tricks

## Release Process

### Version Numbers

Follow Semantic Versioning:
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

Example: 1.2.3
- 1 = Major version
- 2 = Minor version
- 3 = Patch version

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version number bumped
- [ ] Git tag created
- [ ] Release notes written

## Community Guidelines

### Be Respectful
- Constructive feedback
- Patient with newcomers
- Inclusive language
- Professional tone

### Be Collaborative
- Share knowledge
- Help others
- Ask questions
- Provide context

### Be Responsible
- Test your code
- Document changes
- Fix your bugs
- Follow through

## Getting Help

### Resources
- README.md - User guide
- TESTING.md - Testing procedures
- QUICKSTART.md - Quick start
- GitHub Issues - Bug reports

### Contact
- Open an issue for bugs
- Discussions for questions
- Pull requests for contributions

---

Thank you for contributing to the Professional PDF Editor! 🎉

Your contributions make this project better for everyone.
