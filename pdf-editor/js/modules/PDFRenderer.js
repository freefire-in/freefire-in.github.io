export class PDFRenderer {
    constructor() {
        this.canvas = document.getElementById('pdf-canvas');
        this.context = this.canvas.getContext('2d');
    }

    async renderPage(page, scale = 1.0) {
        try {
            const viewport = page.getViewport({ scale });

            // Set canvas dimensions
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;

            // Render PDF page
            const renderContext = {
                canvasContext: this.context,
                viewport: viewport
            };

            await page.render(renderContext).promise;

            return viewport;
        } catch (error) {
            throw new Error(`Failed to render page: ${error.message}`);
        }
    }

    getCanvas() {
        return this.canvas;
    }

    getContext() {
        return this.context;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
