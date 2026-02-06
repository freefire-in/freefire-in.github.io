import { PDFLoader } from './modules/PDFLoader.js';
import { PDFRenderer } from './modules/PDFRenderer.js';
import { TextEditor } from './modules/TextEditor.js';
import { ImageManager } from './modules/ImageManager.js';
import { PDFExporter } from './modules/PDFExporter.js';
import { UIController } from './modules/UIController.js';
import { StateManager } from './modules/StateManager.js';
import { Utils } from './modules/Utils.js';

class PDFEditorApp {
    constructor() {
        this.pdfLoader = new PDFLoader();
        this.pdfRenderer = new PDFRenderer();
        this.textEditor = new TextEditor();
        this.imageManager = new ImageManager();
        this.pdfExporter = new PDFExporter();
        this.stateManager = new StateManager();
        this.uiController = new UIController();

        this.currentPdfDoc = null;
        this.currentPageNum = 1;
        this.totalPages = 0;
        this.zoom = 1.0;
        this.editMode = false;
        this.pdfFileName = '';

        this.init();
    }

    async init() {
        try {
            await this.setupPDFjs();
            this.setupEventListeners();
            this.uiController.showToast('PDF Editor Ready', 'Welcome! Load a PDF to get started.', 'info');
        } catch (error) {
            console.error('Initialization error:', error);
            this.uiController.showToast('Initialization Error', error.message, 'error');
        }
    }

    async setupPDFjs() {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error('PDF.js library not loaded');
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    setupEventListeners() {
        // File input
        document.getElementById('open-file-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
        document.getElementById('upload-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
        document.getElementById('file-input').addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        const dropZone = document.getElementById('drop-zone');
        dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        dropZone.addEventListener('drop', (e) => this.handleDrop(e));

        // Navigation
        document.getElementById('first-page-btn').addEventListener('click', () => this.goToPage(1));
        document.getElementById('prev-page-btn').addEventListener('click', () => this.goToPage(this.currentPageNum - 1));
        document.getElementById('next-page-btn').addEventListener('click', () => this.goToPage(this.currentPageNum + 1));
        document.getElementById('last-page-btn').addEventListener('click', () => this.goToPage(this.totalPages));
        document.getElementById('page-input').addEventListener('change', (e) => {
            const pageNum = parseInt(e.target.value);
            if (pageNum >= 1 && pageNum <= this.totalPages) {
                this.goToPage(pageNum);
            }
        });

        // Zoom
        document.getElementById('zoom-in-btn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out-btn').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-select').addEventListener('change', (e) => this.handleZoomChange(e.target.value));

        // Edit mode
        document.getElementById('edit-mode-btn').addEventListener('click', () => this.toggleEditMode());

        // Undo/Redo
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());

        // Export
        document.getElementById('export-btn').addEventListener('click', () => this.exportPDF());

        // Dark mode
        document.getElementById('dark-mode-toggle').addEventListener('click', () => this.toggleDarkMode());

        // Sidebar
        document.getElementById('toggle-sidebar-btn').addEventListener('click', () => this.toggleSidebar());

        // Text edit modal
        document.getElementById('close-text-modal').addEventListener('click', () => this.closeTextModal());
        document.getElementById('cancel-text-edit-btn').addEventListener('click', () => this.closeTextModal());
        document.getElementById('save-text-edit-btn').addEventListener('click', () => this.saveTextEdit());

        // Image edit modal
        document.getElementById('close-image-modal').addEventListener('click', () => this.closeImageModal());
        document.getElementById('cancel-image-edit-btn').addEventListener('click', () => this.closeImageModal());
        document.getElementById('save-image-edit-btn').addEventListener('click', () => this.saveImageEdit());
        document.getElementById('delete-image-btn').addEventListener('click', () => this.deleteImage());

        // Window resize
        window.addEventListener('resize', Utils.debounce(() => {
            if (this.currentPdfDoc) {
                this.renderCurrentPage();
            }
        }, 250));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('drop-zone').classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('drop-zone').classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('drop-zone').classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            this.loadPDF(files[0]);
        } else {
            this.uiController.showToast('Invalid File', 'Please drop a PDF file.', 'error');
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            this.loadPDF(file);
        } else {
            this.uiController.showToast('Invalid File', 'Please select a PDF file.', 'error');
        }
    }

    async loadPDF(file) {
        try {
            this.uiController.showLoading('Loading PDF...');
            this.pdfFileName = file.name;

            // Check file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                throw new Error('File size exceeds 50MB limit');
            }

            // Load PDF with PDF.js
            const arrayBuffer = await file.arrayBuffer();
            this.currentPdfDoc = await this.pdfLoader.loadPDF(arrayBuffer);
            this.totalPages = this.currentPdfDoc.numPages;

            // Store original PDF data for export
            this.stateManager.setOriginalPDF(arrayBuffer);

            // Update UI
            document.getElementById('drop-zone').classList.remove('active');
            document.getElementById('pdf-canvas-wrapper').style.display = 'inline-block';

            // Enable controls
            this.enableControls();

            // Render first page
            this.currentPageNum = 1;
            await this.renderCurrentPage();

            // Generate thumbnails
            await this.generateThumbnails();

            // Update document info
            this.updateDocumentInfo();

            this.uiController.hideLoading();
            this.uiController.showToast('PDF Loaded', `Successfully loaded ${this.pdfFileName}`, 'success');
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.uiController.hideLoading();
            this.uiController.showToast('Load Error', error.message, 'error');
        }
    }

    async renderCurrentPage() {
        try {
            const page = await this.currentPdfDoc.getPage(this.currentPageNum);
            
            // Render the page
            await this.pdfRenderer.renderPage(page, this.zoom);

            // Extract and render text elements
            const textContent = await page.getTextContent();
            const viewport = page.getViewport({ scale: this.zoom });
            this.textEditor.extractTextElements(textContent, viewport, this.currentPageNum);

            // Extract and render images
            await this.imageManager.extractImages(page, viewport, this.currentPageNum);

            // Update page number display
            document.getElementById('page-input').value = this.currentPageNum;

            // Update thumbnail active state
            this.updateThumbnailSelection();

            // Apply edit mode if active
            if (this.editMode) {
                this.applyEditMode();
            }
        } catch (error) {
            console.error('Error rendering page:', error);
            this.uiController.showToast('Render Error', error.message, 'error');
        }
    }

    async generateThumbnails() {
        const container = document.getElementById('thumbnail-container');
        container.innerHTML = '';

        for (let i = 1; i <= this.totalPages; i++) {
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'thumbnail-item';
            thumbnailDiv.dataset.page = i;

            const canvasWrapper = document.createElement('div');
            canvasWrapper.className = 'thumbnail-canvas-wrapper';

            const canvas = document.createElement('canvas');
            canvas.className = 'thumbnail-canvas';
            canvasWrapper.appendChild(canvas);

            const label = document.createElement('span');
            label.className = 'thumbnail-label';
            label.textContent = `Page ${i}`;

            thumbnailDiv.appendChild(canvasWrapper);
            thumbnailDiv.appendChild(label);
            container.appendChild(thumbnailDiv);

            thumbnailDiv.addEventListener('click', () => this.goToPage(i));

            // Render thumbnail
            const page = await this.currentPdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.2 });
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
        }

        this.updateThumbnailSelection();
    }

    updateThumbnailSelection() {
        document.querySelectorAll('.thumbnail-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.page) === this.currentPageNum) {
                item.classList.add('active');
            }
        });
    }

    goToPage(pageNum) {
        if (pageNum < 1 || pageNum > this.totalPages || pageNum === this.currentPageNum) {
            return;
        }

        this.currentPageNum = pageNum;
        this.renderCurrentPage();
    }

    zoomIn() {
        const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = zoomLevels.findIndex(z => z >= this.zoom);
        if (currentIndex < zoomLevels.length - 1) {
            this.zoom = zoomLevels[currentIndex + 1];
            document.getElementById('zoom-select').value = this.zoom.toString();
            this.renderCurrentPage();
        }
    }

    zoomOut() {
        const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentIndex = zoomLevels.findIndex(z => z >= this.zoom);
        if (currentIndex > 0) {
            this.zoom = zoomLevels[currentIndex - 1];
            document.getElementById('zoom-select').value = this.zoom.toString();
            this.renderCurrentPage();
        }
    }

    handleZoomChange(value) {
        if (value === 'fit-width') {
            this.fitToWidth();
        } else if (value === 'fit-page') {
            this.fitToPage();
        } else {
            this.zoom = parseFloat(value);
            this.renderCurrentPage();
        }
    }

    async fitToWidth() {
        const page = await this.currentPdfDoc.getPage(this.currentPageNum);
        const viewport = page.getViewport({ scale: 1 });
        const container = document.getElementById('viewer-container');
        const containerWidth = container.clientWidth - 40;
        this.zoom = containerWidth / viewport.width;
        document.getElementById('zoom-select').value = this.zoom.toString();
        this.renderCurrentPage();
    }

    async fitToPage() {
        const page = await this.currentPdfDoc.getPage(this.currentPageNum);
        const viewport = page.getViewport({ scale: 1 });
        const container = document.getElementById('viewer-container');
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        const scaleWidth = containerWidth / viewport.width;
        const scaleHeight = containerHeight / viewport.height;
        this.zoom = Math.min(scaleWidth, scaleHeight);
        document.getElementById('zoom-select').value = this.zoom.toString();
        this.renderCurrentPage();
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        const btn = document.getElementById('edit-mode-btn');
        
        if (this.editMode) {
            btn.classList.add('active');
            btn.style.backgroundColor = 'var(--accent-color)';
            btn.style.color = 'white';
            this.uiController.showToast('Edit Mode', 'Click on text or images to edit', 'info');
        } else {
            btn.classList.remove('active');
            btn.style.backgroundColor = '';
            btn.style.color = '';
        }

        this.applyEditMode();
    }

    applyEditMode() {
        const textLayer = document.getElementById('text-layer');
        const imageLayer = document.getElementById('image-layer');

        if (this.editMode) {
            textLayer.classList.add('edit-mode');
            imageLayer.classList.add('edit-mode');
            this.setupEditEventListeners();
        } else {
            textLayer.classList.remove('edit-mode');
            imageLayer.classList.remove('edit-mode');
            this.removeEditEventListeners();
        }
    }

    setupEditEventListeners() {
        // Text elements
        document.querySelectorAll('.text-element').forEach(element => {
            element.addEventListener('click', (e) => this.handleTextClick(e));
        });

        // Image elements
        document.querySelectorAll('.image-element').forEach(element => {
            element.addEventListener('click', (e) => this.handleImageClick(e));
        });
    }

    removeEditEventListeners() {
        document.querySelectorAll('.text-element').forEach(element => {
            element.replaceWith(element.cloneNode(true));
        });

        document.querySelectorAll('.image-element').forEach(element => {
            element.replaceWith(element.cloneNode(true));
        });
    }

    handleTextClick(e) {
        if (!this.editMode) return;

        const element = e.currentTarget;
        const elementId = element.dataset.id;
        const textData = this.textEditor.getTextElement(elementId);

        if (textData) {
            this.openTextModal(elementId, textData);
        }
    }

    handleImageClick(e) {
        if (!this.editMode) return;

        const element = e.currentTarget;
        const elementId = element.dataset.id;
        const imageData = this.imageManager.getImageElement(elementId);

        if (imageData) {
            this.openImageModal(elementId, imageData);
        }
    }

    openTextModal(elementId, textData) {
        this.currentEditingTextId = elementId;

        document.getElementById('text-content-input').value = textData.text;
        document.getElementById('font-family-input').value = textData.fontFamily || 'Helvetica';
        document.getElementById('font-size-input').value = textData.fontSize || 12;
        document.getElementById('text-color-input').value = Utils.rgbToHex(textData.color) || '#000000';

        document.getElementById('text-edit-modal').style.display = 'flex';
    }

    closeTextModal() {
        document.getElementById('text-edit-modal').style.display = 'none';
        this.currentEditingTextId = null;
    }

    saveTextEdit() {
        const text = document.getElementById('text-content-input').value;
        const fontFamily = document.getElementById('font-family-input').value;
        const fontSize = parseInt(document.getElementById('font-size-input').value);
        const color = document.getElementById('text-color-input').value;

        const updates = {
            text,
            fontFamily,
            fontSize,
            color: Utils.hexToRgb(color)
        };

        this.textEditor.updateTextElement(this.currentEditingTextId, updates);
        this.stateManager.addEdit({
            type: 'text',
            id: this.currentEditingTextId,
            page: this.currentPageNum,
            updates
        });

        this.updateUndoRedoButtons();
        this.closeTextModal();
        this.renderCurrentPage();

        this.uiController.showToast('Text Updated', 'Text changes saved successfully', 'success');
    }

    openImageModal(elementId, imageData) {
        this.currentEditingImageId = elementId;

        const preview = document.getElementById('image-preview');
        preview.src = imageData.src;

        document.getElementById('image-replace-input').value = '';
        document.getElementById('image-edit-modal').style.display = 'flex';
    }

    closeImageModal() {
        document.getElementById('image-edit-modal').style.display = 'none';
        this.currentEditingImageId = null;
    }

    async saveImageEdit() {
        const fileInput = document.getElementById('image-replace-input');
        
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const imageData = await Utils.fileToDataURL(file);

            this.imageManager.updateImageElement(this.currentEditingImageId, { src: imageData });
            this.stateManager.addEdit({
                type: 'image',
                action: 'replace',
                id: this.currentEditingImageId,
                page: this.currentPageNum,
                data: imageData
            });

            this.updateUndoRedoButtons();
            this.renderCurrentPage();

            this.uiController.showToast('Image Updated', 'Image replaced successfully', 'success');
        }

        this.closeImageModal();
    }

    deleteImage() {
        if (!this.currentEditingImageId) return;

        this.imageManager.deleteImageElement(this.currentEditingImageId);
        this.stateManager.addEdit({
            type: 'image',
            action: 'delete',
            id: this.currentEditingImageId,
            page: this.currentPageNum
        });

        this.updateUndoRedoButtons();
        this.closeImageModal();
        this.renderCurrentPage();

        this.uiController.showToast('Image Deleted', 'Image removed from PDF', 'success');
    }

    undo() {
        const edit = this.stateManager.undo();
        if (edit) {
            this.applyUndoRedo(edit, true);
            this.updateUndoRedoButtons();
            this.renderCurrentPage();
            this.uiController.showToast('Undo', 'Last change undone', 'info');
        }
    }

    redo() {
        const edit = this.stateManager.redo();
        if (edit) {
            this.applyUndoRedo(edit, false);
            this.updateUndoRedoButtons();
            this.renderCurrentPage();
            this.uiController.showToast('Redo', 'Change reapplied', 'info');
        }
    }

    applyUndoRedo(edit, isUndo) {
        if (edit.type === 'text') {
            if (isUndo) {
                this.textEditor.revertTextElement(edit.id);
            } else {
                this.textEditor.updateTextElement(edit.id, edit.updates);
            }
        } else if (edit.type === 'image') {
            if (edit.action === 'replace') {
                if (isUndo) {
                    this.imageManager.revertImageElement(edit.id);
                } else {
                    this.imageManager.updateImageElement(edit.id, { src: edit.data });
                }
            } else if (edit.action === 'delete') {
                if (isUndo) {
                    this.imageManager.restoreImageElement(edit.id);
                } else {
                    this.imageManager.deleteImageElement(edit.id);
                }
            }
        }
    }

    updateUndoRedoButtons() {
        document.getElementById('undo-btn').disabled = !this.stateManager.canUndo();
        document.getElementById('redo-btn').disabled = !this.stateManager.canRedo();
    }

    async exportPDF() {
        try {
            this.uiController.showLoading('Exporting PDF...');

            const textEdits = this.textEditor.getAllEdits();
            const imageEdits = this.imageManager.getAllEdits();

            const pdfBytes = await this.pdfExporter.exportPDF(
                this.stateManager.getOriginalPDF(),
                textEdits,
                imageEdits
            );

            // Download the file
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.pdfFileName.replace('.pdf', '_edited.pdf');
            link.click();
            URL.revokeObjectURL(url);

            this.uiController.hideLoading();
            this.uiController.showToast('Export Complete', 'PDF exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.uiController.hideLoading();
            this.uiController.showToast('Export Error', error.message, 'error');
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const icon = document.querySelector('#dark-mode-toggle i');
        
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem('darkMode', 'disabled');
        }
    }

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    }

    enableControls() {
        document.getElementById('edit-mode-btn').disabled = false;
        document.getElementById('zoom-in-btn').disabled = false;
        document.getElementById('zoom-out-btn').disabled = false;
        document.getElementById('zoom-select').disabled = false;
        document.getElementById('first-page-btn').disabled = false;
        document.getElementById('prev-page-btn').disabled = false;
        document.getElementById('next-page-btn').disabled = false;
        document.getElementById('last-page-btn').disabled = false;
        document.getElementById('page-input').disabled = false;
        document.getElementById('export-btn').disabled = false;

        document.getElementById('page-count').textContent = `/ ${this.totalPages}`;
    }

    updateDocumentInfo() {
        const infoContent = document.getElementById('info-content');
        infoContent.innerHTML = `
            <p><strong>File:</strong> ${this.pdfFileName}</p>
            <p><strong>Pages:</strong> ${this.totalPages}</p>
            <p><strong>Current Page:</strong> ${this.currentPageNum}</p>
        `;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('#dark-mode-toggle i');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    // Create app instance
    window.pdfEditorApp = new PDFEditorApp();
});
