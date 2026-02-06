export class StateManager {
    constructor() {
        this.originalPDF = null;
        this.editHistory = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50;
    }

    setOriginalPDF(arrayBuffer) {
        this.originalPDF = arrayBuffer;
    }

    getOriginalPDF() {
        return this.originalPDF;
    }

    addEdit(edit) {
        if (this.currentIndex < this.editHistory.length - 1) {
            this.editHistory = this.editHistory.slice(0, this.currentIndex + 1);
        }

        this.editHistory.push({
            ...edit,
            timestamp: Date.now()
        });

        if (this.editHistory.length > this.maxHistorySize) {
            this.editHistory.shift();
        } else {
            this.currentIndex++;
        }
    }

    undo() {
        if (this.canUndo()) {
            const edit = this.editHistory[this.currentIndex];
            this.currentIndex--;
            return edit;
        }
        return null;
    }

    redo() {
        if (this.canRedo()) {
            this.currentIndex++;
            const edit = this.editHistory[this.currentIndex];
            return edit;
        }
        return null;
    }

    canUndo() {
        return this.currentIndex >= 0;
    }

    canRedo() {
        return this.currentIndex < this.editHistory.length - 1;
    }

    getEditHistory() {
        return this.editHistory.slice(0, this.currentIndex + 1);
    }

    clearHistory() {
        this.editHistory = [];
        this.currentIndex = -1;
    }

    getStats() {
        const history = this.getEditHistory();
        const textEdits = history.filter(e => e.type === 'text').length;
        const imageEdits = history.filter(e => e.type === 'image').length;

        return {
            totalEdits: history.length,
            textEdits,
            imageEdits,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }
}
