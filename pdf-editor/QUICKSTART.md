# Quick Start Guide

Get started with the Professional PDF Editor in 5 minutes!

## Step 1: Setup (30 seconds)

### Option A: Using Python
```bash
cd pdf-editor
python -m http.server 8000
```

### Option B: Using Node.js
```bash
cd pdf-editor
npx http-server -p 8000
```

### Option C: Using PHP
```bash
cd pdf-editor
php -S localhost:8000
```

Then open: `http://localhost:8000`

## Step 2: Generate Sample PDF (1 minute)

1. Open `demo/generate-sample.html` in your browser
2. Click "Generate Sample PDF"
3. A test PDF will be downloaded automatically

## Step 3: Load PDF (10 seconds)

**Method 1: Drag & Drop**
- Drag the sample PDF onto the editor window

**Method 2: File Picker**
- Click the "Open" button or "Choose File"
- Select the sample PDF

## Step 4: Navigate (30 seconds)

- **Page Navigation**: Use ◀️ ▶️ buttons or click thumbnails
- **Zoom**: Use + - buttons or select from dropdown
- **Fit Options**: Choose "Fit Width" or "Fit Page"

## Step 5: Edit Text (2 minutes)

1. Click the **"Edit Mode"** button in toolbar
2. Click on any text element (highlights on hover)
3. Modify:
   - Text content
   - Font family (Helvetica, Times, Courier)
   - Font size (6-72 pts)
   - Text color (color picker)
4. Click **"Save Changes"**
5. See the changes applied immediately!

## Step 6: Manage Images (1 minute)

1. Ensure **Edit Mode** is active
2. Click on any image
3. Choose to:
   - **Replace**: Upload a new image
   - **Delete**: Remove the image
4. Click **"Save Changes"**

## Step 7: Undo/Redo (30 seconds)

- Click **Undo** to revert last change
- Click **Redo** to reapply undone change
- History saves up to 50 actions

## Step 8: Export (30 seconds)

1. Click the **"Export"** button
2. PDF downloads automatically as `*_edited.pdf`
3. Open in any PDF reader to verify changes

## Common Actions

### Switch Dark Mode
- Click the 🌙 (moon) icon in top-right
- Preference is saved automatically

### Hide/Show Sidebar
- Click the ◀️ icon in sidebar header
- More space for editing!

### Go to Specific Page
- Type page number in the page input
- Press Enter

### Quick Zoom
- **Ctrl + Scroll**: Zoom in/out (future feature)
- Use zoom dropdown for precise control

## Keyboard Shortcuts (Recommended)

While editing:
- **Ctrl/Cmd + Z**: Undo (future feature)
- **Ctrl/Cmd + Y**: Redo (future feature)
- **Escape**: Close modal

## Tips for Best Results

### Text Editing
✅ **DO**:
- Use standard fonts (Helvetica, Times, Courier)
- Keep text on single lines
- Adjust size for better fit

❌ **AVOID**:
- Very long text strings
- Special unicode characters
- Complex formatting

### Image Editing
✅ **DO**:
- Use JPG or PNG formats
- Keep reasonable file sizes (<5MB)
- Maintain aspect ratios

❌ **AVOID**:
- Very large images (>10MB)
- Animated GIFs
- SVG files (use raster instead)

### Performance
✅ **DO**:
- Work with PDFs under 20MB
- Close other tabs if slow
- Use lower zoom for faster editing

❌ **AVOID**:
- 100+ page documents
- Multiple simultaneous edits
- Very high zoom levels (>200%)

## Troubleshooting Quick Fixes

### PDF Won't Load
```
1. Check file is under 50MB
2. Ensure it's a valid PDF
3. Try another browser
4. Check browser console (F12)
```

### Text Edit Not Saving
```
1. Ensure Edit Mode is active
2. Click element again
3. Check modal opened
4. Don't close modal too quickly
```

### Export Failed
```
1. Wait for all edits to complete
2. Check browser console
3. Try exporting with fewer edits
4. Refresh and reload PDF
```

### Slow Performance
```
1. Reduce zoom level
2. Close other tabs
3. Use smaller PDF
4. Clear browser cache
```

## Next Steps

📖 Read the full [README.md](README.md) for detailed documentation

🎨 Customize the interface in `styles/main.css`

🔧 Explore the code in `js/modules/`

🐛 Check browser console for debugging

---

**Need Help?** Check README.md troubleshooting section or browser console!

Happy Editing! 🎉
