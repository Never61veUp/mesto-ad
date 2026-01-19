export const setButtonLoading = (button, isLoading, loadingText) => {
    if (isLoading) {
        button.classList.add('popup__button_loading');
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.disabled = true;
    } else {
        button.classList.remove('popup__button_loading');
        button.textContent = button.dataset.originalText;
        button.disabled = false;
    }
};