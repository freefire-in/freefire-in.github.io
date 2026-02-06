export class TextEditor {
    constructor() {
        this.textElements = new Map();
        this.textLayer = document.getElementById('text-layer');
    }

    extractTextElements(textContent, viewport, pageNum) {
        this.textLayer.innerHTML = '';

        textContent.items.forEach((item, index) => {
            const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
            const fontSize = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
            const fontFamily = item.fontName || 'sans-serif';

            const textDiv = document.createElement('div');
            textDiv.className = 'text-element';
            textDiv.dataset.id = `text-${pageNum}-${index}`;
            
            textDiv.style.left = `${tx[4]}px`;
            textDiv.style.top = `${tx[5] - fontSize}px`;
            textDiv.style.fontSize = `${fontSize}px`;
            textDiv.style.fontFamily = fontFamily;
            textDiv.style.position = 'absolute';
            textDiv.style.transformOrigin = 'left bottom';

            const textContent = document.createElement('span');
            textContent.className = 'text-element-content';
            textContent.textContent = item.str;
            textDiv.appendChild(textContent);

            this.textLayer.appendChild(textDiv);

            const elementData = {
                id: `text-${pageNum}-${index}`,
                text: item.str,
                x: tx[4],
                y: tx[5],
                fontSize: fontSize,
                fontFamily: fontFamily,
                color: [0, 0, 0],
                width: item.width * viewport.scale,
                height: item.height * viewport.scale,
                transform: tx,
                pageNum: pageNum,
                original: {
                    text: item.str,
                    fontSize: fontSize,
                    fontFamily: fontFamily,
                    color: [0, 0, 0]
                }
            };

            this.textElements.set(elementData.id, elementData);
        });
    }

    getTextElement(id) {
        return this.textElements.get(id);
    }

    updateTextElement(id, updates) {
        const element = this.textElements.get(id);
        if (!element) return;

        if (updates.text !== undefined) element.text = updates.text;
        if (updates.fontSize !== undefined) element.fontSize = updates.fontSize;
        if (updates.fontFamily !== undefined) element.fontFamily = updates.fontFamily;
        if (updates.color !== undefined) element.color = updates.color;

        element.modified = true;

        const domElement = document.querySelector(`[data-id="${id}"]`);
        if (domElement) {
            const content = domElement.querySelector('.text-element-content');
            if (content) {
                content.textContent = element.text;
            }
            domElement.style.fontSize = `${element.fontSize}px`;
            domElement.style.fontFamily = element.fontFamily;
            domElement.style.color = `rgb(${element.color[0]}, ${element.color[1]}, ${element.color[2]})`;
            
            if (!domElement.querySelector('.element-badge')) {
                const badge = document.createElement('div');
                badge.className = 'element-badge';
                badge.textContent = 'E';
                domElement.appendChild(badge);
            }
        }

        this.textElements.set(id, element);
    }

    revertTextElement(id) {
        const element = this.textElements.get(id);
        if (!element || !element.original) return;

        element.text = element.original.text;
        element.fontSize = element.original.fontSize;
        element.fontFamily = element.original.fontFamily;
        element.color = element.original.color;
        element.modified = false;

        const domElement = document.querySelector(`[data-id="${id}"]`);
        if (domElement) {
            const content = domElement.querySelector('.text-element-content');
            if (content) {
                content.textContent = element.text;
            }
            domElement.style.fontSize = `${element.fontSize}px`;
            domElement.style.fontFamily = element.fontFamily;
            domElement.style.color = `rgb(${element.color[0]}, ${element.color[1]}, ${element.color[2]})`;
            
            const badge = domElement.querySelector('.element-badge');
            if (badge) badge.remove();
        }

        this.textElements.set(id, element);
    }

    deleteTextElement(id) {
        const element = this.textElements.get(id);
        if (!element) return;

        element.deleted = true;

        const domElement = document.querySelector(`[data-id="${id}"]`);
        if (domElement) {
            domElement.classList.add('deleted');
        }

        this.textElements.set(id, element);
    }

    restoreTextElement(id) {
        const element = this.textElements.get(id);
        if (!element) return;

        element.deleted = false;

        const domElement = document.querySelector(`[data-id="${id}"]`);
        if (domElement) {
            domElement.classList.remove('deleted');
        }

        this.textElements.set(id, element);
    }

    getAllEdits() {
        const edits = [];
        this.textElements.forEach(element => {
            if (element.modified || element.deleted) {
                edits.push({
                    id: element.id,
                    pageNum: element.pageNum,
                    text: element.text,
                    x: element.x,
                    y: element.y,
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    color: element.color,
                    deleted: element.deleted || false,
                    modified: element.modified || false
                });
            }
        });
        return edits;
    }

    clear() {
        this.textElements.clear();
        this.textLayer.innerHTML = '';
    }
}
