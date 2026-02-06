# Testing Guide

Comprehensive testing procedures for the Professional PDF Editor.

## Table of Contents
1. [Setup Testing Environment](#setup-testing-environment)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [User Acceptance Testing](#user-acceptance-testing)
5. [Performance Testing](#performance-testing)
6. [Browser Compatibility Testing](#browser-compatibility-testing)
7. [Security Testing](#security-testing)

---

## Setup Testing Environment

### Prerequisites
```bash
# Start local server
python -m http.server 8000
# or
npx http-server -p 8000
```

### Generate Test Files
1. Open `demo/generate-sample.html`
2. Generate sample PDF
3. Prepare additional test PDFs:
   - Small PDF (1-2 pages, <1MB)
   - Medium PDF (10-20 pages, 5-10MB)
   - Large PDF (50+ pages, 20-40MB)
   - Complex PDF (images, forms, tables)

---

## Unit Testing

### PDFLoader Module

#### Test: Load Valid PDF
```javascript
// Expected: PDF loads successfully
1. Load sample.pdf
2. Verify pdfDoc object created
3. Check numPages > 0
4. Confirm no errors in console
```

#### Test: Handle Invalid File
```javascript
// Expected: Error message displayed
1. Attempt to load .txt file
2. Verify error toast appears
3. Check error message is user-friendly
```

#### Test: File Size Limit
```javascript
// Expected: Rejection for >50MB
1. Attempt to load 60MB PDF
2. Verify size check error
3. Confirm file not loaded
```

### PDFRenderer Module

#### Test: Render Page
```javascript
// Expected: Page renders correctly
1. Load PDF
2. Render page 1
3. Check canvas has content
4. Verify dimensions match PDF
```

#### Test: Zoom Functionality
```javascript
// Expected: Canvas scales correctly
1. Set zoom to 150%
2. Render page
3. Check canvas width = originalWidth * 1.5
4. Verify quality maintained
```

### TextEditor Module

#### Test: Extract Text Elements
```javascript
// Expected: Text elements extracted
1. Load PDF with text
2. Extract text from page 1
3. Verify textElements Map populated
4. Check text positions calculated
```

#### Test: Update Text Element
```javascript
// Expected: Text updated correctly
1. Extract text element
2. Update with new text
3. Verify element.modified = true
4. Check DOM updated
```

#### Test: Undo Text Edit
```javascript
// Expected: Text reverted
1. Make text edit
2. Call revertTextElement()
3. Verify text = original
4. Check modified = false
```

### ImageManager Module

#### Test: Extract Images
```javascript
// Expected: Images extracted
1. Load PDF with images
2. Extract images from page
3. Verify imageElements Map populated
4. Check image data URLs created
```

#### Test: Replace Image
```javascript
// Expected: Image replaced
1. Click image element
2. Upload new image
3. Verify src updated
4. Check modified flag set
```

### PDFExporter Module

#### Test: Export Unmodified PDF
```javascript
// Expected: PDF exports successfully
1. Load PDF
2. Export without edits
3. Verify download starts
4. Check file size similar to original
```

#### Test: Export with Text Edits
```javascript
// Expected: Text changes applied
1. Make text edits
2. Export PDF
3. Open in PDF reader
4. Verify text changes visible
```

#### Test: Export with Image Edits
```javascript
// Expected: Image changes applied
1. Replace/delete images
2. Export PDF
3. Open in PDF reader
4. Verify image changes visible
```

### StateManager Module

#### Test: Add Edit to History
```javascript
// Expected: Edit added to stack
1. Make edit
2. Check editHistory.length increased
3. Verify currentIndex updated
4. Confirm canUndo() = true
```

#### Test: Undo/Redo
```javascript
// Expected: History navigation works
1. Make 3 edits
2. Undo twice
3. Check currentIndex = 0
4. Redo once
5. Verify currentIndex = 1
```

### UIController Module

#### Test: Show Toast
```javascript
// Expected: Toast appears and disappears
1. Call showToast()
2. Verify toast element created
3. Wait 4 seconds
4. Confirm toast removed
```

#### Test: Loading Spinner
```javascript
// Expected: Spinner shows/hides
1. Call showLoading()
2. Verify spinner visible
3. Call hideLoading()
4. Confirm spinner hidden
```

---

## Integration Testing

### Test Suite 1: Complete Edit Workflow

**Test: Load → Edit Text → Export**
```
1. Load sample.pdf
2. Enable Edit Mode
3. Click text element
4. Change text to "Modified Text"
5. Save changes
6. Export PDF
7. Verify exported PDF contains "Modified Text"
```
**Expected**: Complete workflow succeeds, changes persist in export

**Test: Multiple Edits with Undo/Redo**
```
1. Load PDF
2. Make text edit A
3. Make text edit B
4. Make image edit C
5. Undo (revert C)
6. Undo (revert B)
7. Redo (reapply B)
8. Export
9. Verify only A and B applied
```
**Expected**: Undo/redo works correctly, export reflects current state

### Test Suite 2: Navigation Integration

**Test: Navigate Pages During Edit**
```
1. Load multi-page PDF
2. Edit text on page 1
3. Navigate to page 2
4. Edit text on page 2
5. Navigate back to page 1
6. Verify page 1 edit visible
7. Export
8. Check both edits applied
```
**Expected**: Edits persist across page navigation

### Test Suite 3: UI State Management

**Test: Edit Mode Toggle**
```
1. Load PDF
2. Toggle Edit Mode ON
3. Verify text elements clickable
4. Click text element
5. Toggle Edit Mode OFF
6. Verify text elements not clickable
7. Try clicking text
8. Confirm modal doesn't open
```
**Expected**: Edit mode correctly enables/disables editing

---

## User Acceptance Testing

### Scenario 1: First-Time User

**User Story**: "As a new user, I want to quickly edit a PDF"

**Steps**:
1. User opens application
2. Sees clear instructions to drop PDF
3. Drags PDF onto drop zone
4. PDF loads with visual feedback
5. Sees thumbnails and navigation
6. Clicks "Edit Mode" button
7. Hovers over text (highlights)
8. Clicks text element
9. Modal opens with intuitive fields
10. Makes changes and saves
11. Sees change applied immediately
12. Clicks "Export" button
13. PDF downloads successfully

**Success Criteria**:
- [ ] No confusion at any step
- [ ] Clear visual feedback throughout
- [ ] Changes applied correctly
- [ ] Export works first time

### Scenario 2: Power User

**User Story**: "As a power user, I want to make complex edits efficiently"

**Steps**:
1. Load 20-page PDF
2. Use keyboard/shortcuts to navigate
3. Make 10+ text edits
4. Make 5+ image edits
5. Use undo to revert mistakes
6. Use redo to fix over-undoing
7. Navigate between pages
8. Verify all edits maintained
9. Export with custom filename
10. Validate exported PDF

**Success Criteria**:
- [ ] Fast navigation
- [ ] No performance degradation
- [ ] Undo/redo works flawlessly
- [ ] Export completes quickly

### Scenario 3: Error Recovery

**User Story**: "As a user, I want helpful errors when things go wrong"

**Steps**:
1. Try to load non-PDF file
2. See clear error message
3. Try to load 60MB PDF
4. See size limit error
5. Load corrupted PDF
6. See parsing error
7. Try to edit without Edit Mode
8. See appropriate message
9. Lose internet during use
10. App continues working

**Success Criteria**:
- [ ] All errors caught gracefully
- [ ] Error messages are helpful
- [ ] App doesn't crash
- [ ] Can recover from errors

---

## Performance Testing

### Load Time Tests

**Test: Small PDF (1MB, 2 pages)**
```
Target: <2 seconds total load time
1. Measure file read time
2. Measure PDF.js parse time
3. Measure initial render time
4. Measure thumbnail generation
```

**Test: Medium PDF (10MB, 20 pages)**
```
Target: <5 seconds total load time
1. Monitor memory usage
2. Check render performance
3. Verify no UI blocking
```

**Test: Large PDF (40MB, 100 pages)**
```
Target: <15 seconds, smooth operation
1. Progressive loading
2. Thumbnail generation time
3. Memory usage stay under 500MB
```

### Rendering Performance

**Test: Page Render Speed**
```
Target: <500ms per page at 100% zoom
1. Load PDF
2. Navigate to page 10
3. Time render completion
4. Check FPS during render
```

**Test: Zoom Performance**
```
Target: <300ms zoom update
1. Load PDF
2. Change zoom from 100% to 200%
3. Measure re-render time
4. Check for jank/lag
```

### Edit Operation Performance

**Test: Text Edit Response Time**
```
Target: <100ms to open modal
1. Enable Edit Mode
2. Click text element
3. Measure time to modal open
4. Verify immediate feedback
```

**Test: Export Performance**
```
Target: <5 seconds for 10-page PDF with 10 edits
1. Make 10 text edits
2. Make 5 image edits
3. Click Export
4. Measure time to download start
```

### Memory Tests

**Test: Memory Leaks**
```
1. Load PDF
2. Navigate all pages
3. Make 20 edits
4. Undo all edits
5. Export PDF
6. Check memory returned to baseline
```

**Test: Maximum Concurrent PDFs**
```
1. Load PDF
2. Load another PDF
3. Verify first PDF data cleaned
4. Check memory usage acceptable
```

---

## Browser Compatibility Testing

### Chrome/Edge Testing

**Version**: 90+

**Tests**:
- [ ] PDF loads correctly
- [ ] Rendering is accurate
- [ ] Text editing works
- [ ] Image editing works
- [ ] Export succeeds
- [ ] Dark mode works
- [ ] Responsive design works

### Firefox Testing

**Version**: 88+

**Tests**:
- [ ] PDF.js integration works
- [ ] Canvas rendering correct
- [ ] Modal dialogs function
- [ ] File upload works
- [ ] Download triggers
- [ ] CSS variables supported

### Safari Testing

**Version**: 14+

**Tests**:
- [ ] ES6 modules load
- [ ] PDF rendering quality
- [ ] Color picker works
- [ ] File APIs function
- [ ] Export downloads
- [ ] Webkit-specific CSS

### Mobile Browser Testing

**iOS Safari**:
- [ ] Touch events work
- [ ] File picker accessible
- [ ] Responsive layout
- [ ] Zoom gestures
- [ ] Modal scrolling

**Android Chrome**:
- [ ] File selection works
- [ ] Rendering performance
- [ ] Touch interactions
- [ ] Keyboard appearance

---

## Security Testing

### Input Validation

**Test: Malicious File Upload**
```
1. Try to upload .exe as .pdf
2. Verify file type check
3. Confirm rejection
```

**Test: XSS Prevention**
```
1. Enter <script>alert('xss')</script> in text edit
2. Save changes
3. Verify script not executed
4. Check proper escaping
```

### Data Privacy

**Test: No Data Transmission**
```
1. Open browser DevTools Network tab
2. Load PDF
3. Make edits
4. Export PDF
5. Verify no external requests
6. Confirm all local processing
```

### File Access

**Test: Sandboxed File Access**
```
1. Load PDF
2. Check file path not exposed
3. Verify no filesystem access
4. Confirm blob URLs used
```

---

## Test Results Template

### Test Execution Report

**Date**: ___________
**Tester**: ___________
**Browser**: ___________
**Version**: ___________

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| UT-001 | Load Valid PDF | ☐ Pass ☐ Fail | |
| UT-002 | Handle Invalid File | ☐ Pass ☐ Fail | |
| IT-001 | Complete Edit Workflow | ☐ Pass ☐ Fail | |
| PT-001 | Load Time Small PDF | ☐ Pass ☐ Fail | |
| BC-001 | Chrome Compatibility | ☐ Pass ☐ Fail | |

**Overall Result**: ☐ Passed ☐ Failed  
**Critical Bugs**: _____________________  
**Recommendations**: __________________

---

## Automated Testing (Future)

### Unit Tests with Jest
```javascript
// Example test structure
describe('TextEditor', () => {
  test('should extract text elements', () => {
    // Test implementation
  });
  
  test('should update text element', () => {
    // Test implementation
  });
});
```

### E2E Tests with Playwright
```javascript
// Example E2E test
test('complete edit workflow', async ({ page }) => {
  await page.goto('http://localhost:8000');
  await page.setInputFiles('#file-input', 'sample.pdf');
  // ... more steps
});
```

---

For questions about testing, see [README.md](README.md) or check the browser console.
