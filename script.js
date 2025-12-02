document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('feedbackPopup');
  const openBtn = document.getElementById('openFeedbackBtn');
  const closeBtn = document.getElementById('closePopup');
  const form = document.getElementById('feedbackForm');
  const messageEl = document.getElementById('formMessage');

  const STORAGE_KEY = 'feedbackFormData';

  // Восстановление данных из localStorage
  const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  Object.keys(savedData).forEach(key => {
    const field = document.getElementById(key);
    if (field) {
      if (field.type === 'checkbox') {
        field.checked = savedData[key];
      } else {
        field.value = savedData[key];
      }
    }
  });

  // Сохранение данных при вводе
  const fields = ['fullName', 'email', 'phone', 'organization', 'message', 'privacy'];
  fields.forEach(fieldName => {
    const field = document.getElementById(fieldName);
    if (field) {
      field.addEventListener('input', () => {
        const value = field.type === 'checkbox' ? field.checked : field.value;
        savedData[fieldName] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
      });
    }
  });

  // Открытие попапа
  function openPopup() {
    popup.classList.remove('hidden');
    history.pushState({ feedbackForm: true }, '', '#feedback');
  }

  // Закрытие попапа
  function closePopup() {
    popup.classList.add('hidden');
    history.pushState(null, '', location.pathname + location.search);
  }

  // Обработка открытия
  openBtn.addEventListener('click', openPopup);
  closeBtn.addEventListener('click', closePopup);

  // Обработка нажатия «Назад»
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.feedbackForm) {
      openPopup();
    } else {
      closePopup();
    }
  });

  // Отправка формы
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Проверка, что чекбокс согласия установлен
    if (!data.privacy) {
      showMessage('Пожалуйста, согласитесь с политикой обработки персональных данных.', 'error');
      return;
    }

    try {
      // Отправка формы через Formcarry.com
      // ⚠️ Замените YOUR_FORM_ID на реальный ID формы с formcarry.com
      const response = await fetch('https://formcarry.com/s/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.code === 200) {
        showMessage('Сообщение успешно отправлено!', 'success');
        form.reset();
        localStorage.removeItem(STORAGE_KEY);
      } else {
        throw new Error(result.message || 'Ошибка отправки');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      showMessage('Произошла ошибка при отправке формы. Попробуйте позже.', 'error');
    }
  });

  // Отображение сообщения
  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `form-message ${type}`;
    messageEl.classList.remove('hidden');
  }
});