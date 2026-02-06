export class UIController {
    constructor() {
        this.toastContainer = document.getElementById('toast-container');
        this.loadingSpinner = document.getElementById('loading-spinner');
    }

    showLoading(message = 'Loading...') {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = message;
        }
        this.loadingSpinner.style.display = 'flex';
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
    }

    showToast(title, message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${iconMap[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    showError(error) {
        this.showToast('Error', error.message || 'An unexpected error occurred', 'error');
    }

    confirmAction(message, onConfirm, onCancel) {
        const confirmed = window.confirm(message);
        if (confirmed && onConfirm) {
            onConfirm();
        } else if (!confirmed && onCancel) {
            onCancel();
        }
    }

    updateProgress(current, total, message = '') {
        const percentage = Math.round((current / total) * 100);
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = `${message} ${percentage}%`;
        }
    }
}
