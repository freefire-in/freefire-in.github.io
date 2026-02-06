export class PDFLoader {
    constructor() {
        this.pdfDoc = null;
    }

    async loadPDF(arrayBuffer) {
        try {
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            this.pdfDoc = await loadingTask.promise;
            return this.pdfDoc;
        } catch (error) {
            throw new Error(`Failed to load PDF: ${error.message}`);
        }
    }

    getDocument() {
        return this.pdfDoc;
    }

    async getPage(pageNum) {
        if (!this.pdfDoc) {
            throw new Error('No PDF document loaded');
        }
        return await this.pdfDoc.getPage(pageNum);
    }

    getTotalPages() {
        return this.pdfDoc ? this.pdfDoc.numPages : 0;
    }
}
