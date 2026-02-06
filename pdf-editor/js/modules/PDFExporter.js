export class PDFExporter {
    constructor() {
        this.PDFLib = window.PDFLib;
    }

    async exportPDF(originalPdfBytes, textEdits, imageEdits) {
        try {
            const pdfDoc = await this.PDFLib.PDFDocument.load(originalPdfBytes);
            const pages = pdfDoc.getPages();

            const textEditsByPage = this.groupEditsByPage(textEdits);
            const imageEditsByPage = this.groupEditsByPage(imageEdits);

            for (const [pageNum, edits] of Object.entries(textEditsByPage)) {
                const pageIndex = parseInt(pageNum) - 1;
                if (pageIndex >= 0 && pageIndex < pages.length) {
                    await this.applyTextEditsToPage(pages[pageIndex], edits, pdfDoc);
                }
            }

            for (const [pageNum, edits] of Object.entries(imageEditsByPage)) {
                const pageIndex = parseInt(pageNum) - 1;
                if (pageIndex >= 0 && pageIndex < pages.length) {
                    await this.applyImageEditsToPage(pages[pageIndex], edits, pdfDoc);
                }
            }

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            throw new Error(`Failed to export PDF: ${error.message}`);
        }
    }

    groupEditsByPage(edits) {
        const grouped = {};
        edits.forEach(edit => {
            const pageNum = edit.pageNum;
            if (!grouped[pageNum]) {
                grouped[pageNum] = [];
            }
            grouped[pageNum].push(edit);
        });
        return grouped;
    }

    async applyTextEditsToPage(page, edits, pdfDoc) {
        const { width, height } = page.getSize();

        for (const edit of edits) {
            if (edit.deleted) {
                continue;
            }

            if (edit.modified) {
                try {
                    let font;
                    if (edit.fontFamily === 'Times-Roman') {
                        font = await pdfDoc.embedFont(this.PDFLib.StandardFonts.TimesRoman);
                    } else if (edit.fontFamily === 'Courier') {
                        font = await pdfDoc.embedFont(this.PDFLib.StandardFonts.Courier);
                    } else {
                        font = await pdfDoc.embedFont(this.PDFLib.StandardFonts.Helvetica);
                    }

                    const color = this.PDFLib.rgb(
                        edit.color[0] / 255,
                        edit.color[1] / 255,
                        edit.color[2] / 255
                    );

                    const y = height - edit.y - edit.fontSize;

                    page.drawRectangle({
                        x: edit.x - 2,
                        y: y - 2,
                        width: edit.fontSize * edit.text.length * 0.6 + 4,
                        height: edit.fontSize + 4,
                        color: this.PDFLib.rgb(1, 1, 1),
                        borderWidth: 0
                    });

                    page.drawText(edit.text, {
                        x: edit.x,
                        y: y,
                        size: edit.fontSize,
                        font: font,
                        color: color
                    });
                } catch (error) {
                    console.warn('Failed to apply text edit:', error);
                }
            }
        }
    }

    async applyImageEditsToPage(page, edits, pdfDoc) {
        const { width, height } = page.getSize();

        for (const edit of edits) {
            if (edit.deleted) {
                page.drawRectangle({
                    x: edit.x,
                    y: height - edit.y - edit.height,
                    width: edit.width,
                    height: edit.height,
                    color: this.PDFLib.rgb(1, 1, 1),
                    borderWidth: 0
                });
                continue;
            }

            if (edit.modified && edit.src) {
                try {
                    let embeddedImage;
                    
                    if (edit.src.startsWith('data:image/png')) {
                        const imageBytes = this.dataURLToBytes(edit.src);
                        embeddedImage = await pdfDoc.embedPng(imageBytes);
                    } else if (edit.src.startsWith('data:image/jpeg') || edit.src.startsWith('data:image/jpg')) {
                        const imageBytes = this.dataURLToBytes(edit.src);
                        embeddedImage = await pdfDoc.embedJpg(imageBytes);
                    } else {
                        const imageBytes = this.dataURLToBytes(edit.src);
                        embeddedImage = await pdfDoc.embedPng(imageBytes);
                    }

                    const y = height - edit.y - edit.height;

                    page.drawRectangle({
                        x: edit.x,
                        y: y,
                        width: edit.width,
                        height: edit.height,
                        color: this.PDFLib.rgb(1, 1, 1),
                        borderWidth: 0
                    });

                    page.drawImage(embeddedImage, {
                        x: edit.x,
                        y: y,
                        width: edit.width,
                        height: edit.height
                    });
                } catch (error) {
                    console.warn('Failed to apply image edit:', error);
                }
            }
        }
    }

    dataURLToBytes(dataURL) {
        const base64 = dataURL.split(',')[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
}
