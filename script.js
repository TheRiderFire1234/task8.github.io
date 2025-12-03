class FeedbackForm {
    constructor() {
        this.form = document.getElementById('feedbackForm');
        this.popup = document.getElementById('popupOverlay');
        this.messageContainer = document.getElementById('messageContainer');
        this.storageKey = 'feedbackFormData';
        
        this.init();
    }

    init() {
        document.querySelector('.open-feedback-btn').addEventListener('click', () => {
            this.openForm();
        });

        document.querySelector('.close-btn').addEventListener('click', () => {
            this.closeForm();
        });

        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.closeForm();
            }
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        this.form.addEventListener('input', () => {
            this.saveFormData();
        });

        this.restoreFormData();

        window.addEventListener('popstate', (e) => {
            if (this.isFormOpen()) {
                this.closeForm(false);
            }
        });
    }

    openForm() {
        this.popup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        history.pushState({ formOpen: true }, '', '#feedback');
        
        document.getElementById('fullName').focus();
    }

    closeForm(updateHistory = true) {
        this.popup.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        if (updateHistory && this.isFormOpen()) {
            history.back();
        }
    }

    isFormOpen() {
        return this.popup.style.display === 'flex';
    }

    async submitForm() {
        const formData = new FormData(this.form);
        const submitBtn = this.form.querySelector('.submit-btn');
        
        if (!this.validateForm()) {
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            const response = await fetch('https://formcarry.com/s/4dbYuNn864I', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData
            });

            const result = await response.json();

            if (result.code === 200) {
                this.showMessage('Сообщение успешно отправлено!', 'success');
                this.clearFormData();
                this.form.reset();
                
                setTimeout(() => {
                    this.closeForm();
                }, 2000);
            } else {
                throw new Error(result.message || 'Ошибка отправки');
            }

        } catch (error) {
            console.error('Ошибка:', error);
            this.showMessage('Ошибка при отправке формы. Попробуйте еще раз.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
        }
    }

    validateForm() {
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        // Сбрасываем все ошибки
        requiredFields.forEach(field => {
            field.style.borderColor = '#e1e5e9';
        });

        // Валидация ФИО (только буквы и пробелы)
        const fullNameField = document.getElementById('fullName');
        if (fullNameField.value.trim()) {
            const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
            if (!nameRegex.test(fullNameField.value.trim())) {
                fullNameField.style.borderColor = '#dc3545';
                isValid = false;
                this.showMessage('ФИО должно содержать только буквы и пробелы', 'error');
                return false;
            }
        } else {
            fullNameField.style.borderColor = '#dc3545';
            isValid = false;
        }

        // Валидация email
        const emailField = document.getElementById('email');
        if (emailField.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value.trim())) {
                emailField.style.borderColor = '#dc3545';
                isValid = false;
                this.showMessage('Введите корректный email', 'error');
                return false;
            }
        } else {
            emailField.style.borderColor = '#dc3545';
            isValid = false;
        }

        // Валидация телефона (если заполнен)
        const phoneField = document.getElementById('phone');
        if (phoneField.value.trim()) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
            if (!phoneRegex.test(phoneField.value.trim()) || phoneField.value.trim().length < 5) {
                phoneField.style.borderColor = '#dc3545';
                isValid = false;
                this.showMessage('Введите корректный номер телефона', 'error');
                return false;
            }
        }

        // Валидация сообщения (минимум 10 символов)
        const messageField = document.getElementById('message');
        if (messageField.value.trim()) {
            if (messageField.value.trim().length < 10) {
                messageField.style.borderColor = '#dc3545';
                isValid = false;
                this.showMessage('Сообщение должно содержать минимум 10 символов', 'error');
                return false;
            }
        } else {
            messageField.style.borderColor = '#dc3545';
            isValid = false;
        }

        // Валидация чекбокса
        const privacyField = document.getElementById('privacyPolicy');
        if (!privacyField.checked) {
            privacyField.parentElement.style.color = '#dc3545';
            isValid = false;
            this.showMessage('Необходимо согласие с политикой обработки данных', 'error');
            return false;
        } else {
            privacyField.parentElement.style.color = '#555';
        }

        if (!isValid) {
            this.showMessage('Заполните все обязательные поля правильно', 'error');
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    saveFormData() {
        const formData = {};
        const formElements = this.form.elements;
        
        for (let element of formElements) {
            if (element.name && element.type !== 'submit') {
                if (element.type === 'checkbox') {
                    formData[element.name] = element.checked;
                } else {
                    formData[element.name] = element.value;
                }
            }
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(formData));
    }

    restoreFormData() {
        const savedData = localStorage.getItem(this.storageKey);
        
        if (savedData) {
            const formData = JSON.parse(savedData);
            
            for (let [name, value] of Object.entries(formData)) {
                const element = this.form.elements[name];
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = value;
                    } else {
                        element.value = value;
                    }
                }
            }
        }
    }

    clearFormData() {
        localStorage.removeItem(this.storageKey);
    }

    showMessage(message, type) {
        this.messageContainer.textContent = message;
        this.messageContainer.className = `message-container message-${type}`;
        this.messageContainer.style.display = 'block';
        
        setTimeout(() => {
            this.messageContainer.style.display = 'none';
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FeedbackForm();
    
    if (window.location.hash === '#feedback') {
        setTimeout(() => {
            document.querySelector('.open-feedback-btn').click();
        }, 100);
    }
});
