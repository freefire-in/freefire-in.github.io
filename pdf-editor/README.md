# Professional PDF Editor

A senior-level, browser-based PDF editor built with vanilla JavaScript, PDF.js, and pdf-lib. Edit text and images directly within PDF documents without requiring any backend services.

## Features

### Core Capabilities
- **PDF Loading & Rendering**
  - Drag-and-drop file upload
  - Support for files up to 50MB
  - High-quality rendering with PDF.js
  - Page thumbnails for easy navigation

- **Text Editing**
  - Click-to-edit text elements
  - Modify text content, font family, size, and color
  - Changes are applied directly to PDF structure
  - Visual indicators for edited elements

- **Image Management**
  - Extract and display embedded images
  - Replace images with new uploads
  - Delete unwanted images
  - Maintain aspect ratios and positioning

- **PDF Export**
  - Export modified PDF with all changes applied
  - Preserve original PDF quality and structure
  - Download with custom naming

- **User Interface**
  - Professional toolbar with intuitive controls
  - Page navigation (first, previous, next, last, go to page)
  - Zoom controls (50%-200%, fit-to-width, fit-to-page)
  - Left sidebar with thumbnails and document info
  - Undo/redo functionality
  - Dark mode support
  - Responsive design

## Technology Stack

- **PDF.js** - PDF rendering and text/image extraction
- **pdf-lib** - PDF manipulation and rebuilding
- **Vanilla JavaScript** - No framework dependencies
- **ES6 Modules** - Clean, modular architecture
- **CSS3** - Modern styling with CSS variables

## Architecture

```
pdf-editor/
├── index.html              # Main application entry point
├── styles/
│   ├── main.css           # Core styles and theme variables
│   ├── toolbar.css        # Toolbar component styles
│   ├── sidebar.css        # Sidebar and thumbnail styles
│   └── editor.css         # Editor canvas and layer styles
├── js/
│   ├── main.js            # Application controller
│   └── modules/
│       ├── PDFLoader.js   # PDF loading with PDF.js
│       ├── PDFRenderer.js # Canvas rendering
│       ├── TextEditor.js  # Text extraction and editing
│       ├── ImageManager.js# Image extraction and management
│       ├── PDFExporter.js # PDF rebuilding with pdf-lib
│       ├── StateManager.js# Undo/redo state management
│       ├── UIController.js# Toast notifications and loading
│       └── Utils.js       # Utility functions
└── demo/
    └── sample.pdf         # Sample PDF for testing
```

## Installation & Setup

### Option 1: Local Development Server

1. Clone or download this repository

2. Install a local server (choose one):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

### Option 2: Deploy to Web Server

Simply upload all files to your web hosting service. No build process required!

## Usage Guide

### Loading a PDF

1. **Drag and Drop**: Drag a PDF file onto the drop zone
2. **File Picker**: Click "Choose File" or "Open" button to browse

### Navigating Pages

- Use the navigation buttons: ⏮️ ◀️ ▶️ ⏭️
- Enter page number directly in the input field
- Click thumbnails in the left sidebar

### Zooming

- Click zoom in/out buttons
- Select preset zoom level from dropdown
- Choose "Fit Width" or "Fit Page" for automatic sizing

### Editing Text

1. Click the "Edit Mode" button in toolbar
2. Click on any text element (it will highlight on hover)
3. Edit text content, font family, size, and color
4. Click "Save Changes" to apply

### Managing Images

1. Enable "Edit Mode"
2. Click on any image element
3. Choose to replace the image or delete it
4. Click "Save Changes" to apply

### Undo/Redo

- Use the undo/redo buttons in the toolbar
- History supports up to 50 actions
- Each edit can be undone and redone individually

### Exporting

1. Click the "Export" button in the toolbar
2. PDF will be downloaded with "_edited" suffix
3. All changes are permanently applied to the exported PDF

### Dark Mode

- Click the moon/sun icon in the top-right corner
- Preference is saved to localStorage

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

**Note**: Modern browsers with ES6 module support required.

## Performance Considerations

### Large PDFs
- Files up to 50MB are supported
- Rendering is optimized with lazy loading
- Thumbnails are generated progressively
- Consider breaking very large documents into smaller files

### Memory Management
- Original PDF is stored in memory for export
- Edit history limited to 50 actions
- Large image replacements may impact performance

## Limitations

### Current Implementation
- Text positioning is approximate (PDF.js limitation)
- Complex PDF layouts may require adjustment
- Encrypted/password-protected PDFs not supported
- Form fields are not editable (rendered as static content)
- Vector graphics cannot be edited (only raster images)

### Browser Limitations
- File size limited by browser memory (~50MB practical limit)
- Some fonts may not be available for embedding
- Advanced PDF features (3D, multimedia) not supported

## API Overview

### PDFLoader
```javascript
const loader = new PDFLoader();
const pdfDoc = await loader.loadPDF(arrayBuffer);
```

### TextEditor
```javascript
const textEditor = new TextEditor();
textEditor.extractTextElements(textContent, viewport, pageNum);
textEditor.updateTextElement(id, { text, fontSize, color });
```

### ImageManager
```javascript
const imageManager = new ImageManager();
await imageManager.extractImages(page, viewport, pageNum);
imageManager.updateImageElement(id, { src });
```

### PDFExporter
```javascript
const exporter = new PDFExporter();
const pdfBytes = await exporter.exportPDF(originalPDF, textEdits, imageEdits);
```

## Customization

### Themes
Modify CSS variables in `styles/main.css`:
```css
:root {
    --bg-primary: #f5f5f5;
    --accent-color: #4a90e2;
    /* ... more variables */
}
```

### Zoom Levels
Edit zoom options in `main.js`:
```javascript
const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2];
```

### History Size
Adjust undo/redo history in `StateManager.js`:
```javascript
this.maxHistorySize = 50; // Change as needed
```

## Troubleshooting

### PDF Won't Load
- Check file is valid PDF format
- Ensure file size is under 50MB
- Check browser console for errors
- Try a different browser

### Text Editing Issues
- Some PDFs use custom fonts that may not render exactly
- Text positioning is approximate due to PDF complexity
- Try using standard fonts (Helvetica, Times, Courier)

### Export Fails
- Check browser console for errors
- Ensure you have sufficient memory available
- Try reducing number of edits or splitting PDF

### Performance Issues
- Reduce zoom level for faster rendering
- Close other browser tabs
- Try a smaller PDF file
- Clear browser cache

## Security Considerations

- All processing happens locally in the browser
- No data is sent to external servers
- PDF files remain on your device
- Suitable for confidential documents

## Future Enhancements

Potential features for future versions:
- [ ] Annotation tools (highlighting, comments)
- [ ] Drawing/shapes overlay
- [ ] Page manipulation (add, remove, reorder)
- [ ] Digital signatures
- [ ] OCR for scanned documents
- [ ] Collaborative editing
- [ ] Cloud storage integration
- [ ] Mobile app version

## Contributing

This is a production-ready implementation. For improvements:

1. Follow the existing code style
2. Maintain modular architecture
3. Add comments for complex logic
4. Test across multiple browsers
5. Update documentation

## License

MIT License - Free for personal and commercial use.

## Credits

Built with:
- [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
- [pdf-lib](https://pdf-lib.js.org/) by Andrew Dillon
- [Font Awesome](https://fontawesome.com/) for icons

## Support

For issues, questions, or feature requests:
- Check the troubleshooting section
- Review browser console for errors
- Test with sample PDF files first

---

**Version:** 1.0.0  
**Last Updated:** 2024

Enjoy editing PDFs directly in your browser! 🎉
