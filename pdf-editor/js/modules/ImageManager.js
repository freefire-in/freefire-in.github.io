export class ImageManager {
    constructor() {
        this.imageElements = new Map();
        this.imageLayer = document.getElementById('image-layer');
    }

    async extractImages(page, viewport, pageNum) {
        this.imageLayer.innerHTML = '';

        try {
            const operatorList = await page.getOperatorList();
            const imageIndex = {};
            let imageCount = 0;

            for (let i = 0; i < operatorList.fnArray.length; i++) {
                const fn = operatorList.fnArray[i];
                const args = operatorList.argsArray[i];

                if (fn === pdfjsLib.OPS.paintImageXObject || 
                    fn === pdfjsLib.OPS.paintInlineImageXObject ||
                    fn === pdfjsLib.OPS.paintImageMaskXObject) {
                    
                    const imageName = args[0];
                    
                    if (!imageIndex[imageName]) {
                        imageIndex[imageName] = imageCount++;
                        
                        try {
                            const image = await this.getImageFromPage(page, imageName);
                            if (image) {
                                this.createImageElement(image, viewport, pageNum, imageIndex[imageName]);
                            }
                        } catch (error) {
                            console.warn(`Failed to extract image ${imageName}:`, error);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Image extraction error:', error);
        }
    }

    async getImageFromPage(page, imageName) {
        try {
            const resources = await page.objs.get(imageName);
            if (!resources) return null;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (resources.bitmap) {
                canvas.width = resources.width;
                canvas.height = resources.height;
                ctx.drawImage(resources.bitmap, 0, 0);
            } else if (resources.data) {
                const imageData = new ImageData(
                    new Uint8ClampedArray(resources.data),
                    resources.width,
                    resources.height
                );
                canvas.width = resources.width;
                canvas.height = resources.height;
                ctx.putImageData(imageData, 0, 0);
            } else {
                return null;
            }

            return {
                src: canvas.toDataURL(),
                width: resources.width,
                height: resources.height
            };
        } catch (error) {
            return null;
        }
    }

    createImageElement(image, viewport, pageNum, index) {
        const imageDiv = document.createElement('div');
        imageDiv.className = 'image-element';
        imageDiv.dataset.id = `image-${pageNum}-${index}`;

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = `Image ${index + 1}`;

        const estimatedX = (viewport.width / 2) - (image.width / 2);
        const estimatedY = (viewport.height / 2) - (image.height / 2);

        imageDiv.style.left = `${estimatedX}px`;
        imageDiv.style.top = `${estimatedY}px`;
        imageDiv.style.width = `${image.width}px`;
        imageDiv.style.height = `${image.height}px`;
        imageDiv.style.position = 'absolute';

        imageDiv.appendChild(img);
        this.imageLayer.appendChild(imageDiv);

        const elementData = {
            id: `image-${pageNum}-${index}`,
            src: image.src,
            x: estimatedX,
            y: estimatedY,
            width: image.width,
            height: image.height,
            pageNum: pageNum,
            original: {
                src: image.src,
                width: image.width,
                height: image.height
            }
        };

        this.imageElements.set(elementData.id, elementData);
    }

    getImageElement(id) {
        return this.imageElements.get(id);
    }

    updateImageElement(id, updates) {
        const element = this.imageElements.get(id);
        if (!element) return;

        if (updates.src !== undefined) element.src = updates.src;
        if (updates.width !== undefined) element.width = updates.width;
        if (updates.height !== undefined) element.height = updates.height;

        element.modified = true;

        const domElement = document.querySelector(`[data-id="${id}"]`);
        if (domElement) {
            const img = domElement.querySelector('img');
            if (img && updates.src) {
                img.src = element.src;
            }
            
            if (updates.width) domElement.style.width = `${element.width}px`;
            if (updates.height) domElement.style.height = `${element.height}px`;
            
            if (!domElement.querySelector('.element-badge')) {
                const badge = document.createElement('div');
                badge.className = 'element-badge';
                badge.textContent = 'E';
                domElement.appendChild(badge);
            }
        }

        this.imageElements.set(id, element);
    }

    revertImageElement(id) {
        const element = this.imageElements.get(id);
        if (!element || !element.original) return;

        element.src = element.original.src;
        element.width = element.original.width;
        element.height = element.original.height;
        element.modified = false;

        const domElement = document.querySelector(`[data-id="${id}"]`);
        if (domElement) {
            const img = domElement.querySelector('img');
            if (img) {
                img.src = element.src;
            }
            domElement.style.width = `${element.width}px`;
            domElement.style.height = `${element.height}px`;
            
            const badge = domElement.querySelector('.element-badge');
            if (badge) badge.remove();
        }

        this.imageElements.set(id, element);
    }

    deleteImageElement(id) {
        const element = this.imageElements.get(id);
        if (!element) return;

        element.deleted = true;

        const domElement = document.querySelector(`[data-id="${id}"]`);
        if (domElement) {
            domElement.classList.add('deleted');
        }

        this.imageElements.set(id, element);
    }

    restoreImageElement(id) {
        const element = this.imageElements.get(id);
        if (!element) return;

        element.deleted = false;

        const domElement = document.querySelector(`[data-id="${id}"]`);
        if (domElement) {
            domElement.classList.remove('deleted');
        }

        this.imageElements.set(id, element);
    }

    getAllEdits() {
        const edits = [];
        this.imageElements.forEach(element => {
            if (element.modified || element.deleted) {
                edits.push({
                    id: element.id,
                    pageNum: element.pageNum,
                    src: element.src,
                    x: element.x,
                    y: element.y,
                    width: element.width,
                    height: element.height,
                    deleted: element.deleted || false,
                    modified: element.modified || false
                });
            }
        });
        return edits;
    }

    clear() {
        this.imageElements.clear();
        this.imageLayer.innerHTML = '';
    }
}
