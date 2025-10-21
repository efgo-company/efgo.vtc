document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const webhookURL = "https://discord.com/api/webhooks/1429513561398579290/iVDCkd2jXrK4lIzpmtEycMiULcBYZtENX8H9gw5E7IWzSn76x77K_wtwnSNrDJknHbDc";
    let isSubmitting = false;

    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            validateField(input);
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;

        let isValid = true;

        // Очистка ошибок
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('input').forEach(input => input.classList.remove('input-error'));

        form.querySelectorAll('input').forEach(input => {
            if (!validateField(input)) isValid = false;
        });

        // Проверка hCaptcha
        const captchaResponse = hcaptcha.getResponse();
        const captchaContainer = document.getElementById('hcaptcha-container');
        captchaContainer?.querySelector('.error-message')?.remove();

        if (!captchaResponse) {
            isValid = false;
            if (captchaContainer) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Підтвердіть, що ви не робот';
                captchaContainer.appendChild(error);
                requestAnimationFrame(() => error.classList.add('visible'));
            }
        }

        if (!isValid) {
            isSubmitting = false;
            return;
        }

        const lastSubmit = localStorage.getItem('lastFormSubmit');
        if (lastSubmit) {
            const lastDate = new Date(lastSubmit);
            const now = new Date();
            const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays < 7) {
                form.reset();
                document.getElementById('days-popup').textContent = ` ${diffDays} днів тому`;
                document.getElementById('days-next-form').textContent = ` ${7 - diffDays} днів`;
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const popup = document.getElementById('popupRecruitment');
                popup.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                document.getElementById('btn__close-popup')?.addEventListener('click', () => {
                    popup.style.display = 'none';
                    document.body.style.overflow = '';
                });
                isSubmitting = false;
                return;
            }
        }

        const data = {
            email: document.getElementById('email').value,
            discord: document.getElementById('usernameDiscord').value,
            truckersmp: document.getElementById('truckersmp').value,
            dlc: document.getElementById('dlc').value,
            age: document.getElementById('age').value,
            activity: document.getElementById('activity').value,
            reason: document.getElementById('person').value,
            km: document.getElementById('km').value,
            comment: document.getElementById('comment').value || "Немає"
        };

        const embed = {
            title: "📥 Нова заявка на вступ до компанії",
            color: 0x3498DB,
            fields: [
                { name: "📧 Email", value: data.email, inline: true },
                { name: "👤 Discord username", value: data.discord, inline: true },
                { name: "🚛 Профіль TruckersMP", value: data.truckersmp, inline: false },
                { name: "🧩 DLC", value: data.dlc, inline: true },
                { name: "🎂 Вік", value: data.age, inline: true },
                { name: "🚛 Активність на тиждень", value: data.activity, inline: false },
                { name: "❓ Чому хоче приєднатися", value: data.reason, inline: false },
                { name: "📏 Км/тиждень", value: data.km, inline: true },
                { name: "💬 Коментар", value: data.comment, inline: false },
                { name: "🕒 Дата", value: new Date().toLocaleString('uk-UA'), inline: false },
            ],
            footer: { text: "EUROFEST GROUP | Рекрутинг" },
            timestamp: new Date(),
        };

        const message = `<@&1333577796743729164> <@&1253064228173123646> — нова заявка! 🚨`;

        fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: "EUROFEST GROUP - Заявки на вступ",
                content: message,
                embeds: [embed],
            }),
        }).then(response => {
            if (response.ok) {
                localStorage.setItem('lastFormSubmit', new Date().toISOString());
                document.querySelector('.container__form-sended').style.display = 'flex';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                form.reset();
                hcaptcha.reset();
            }
        }).finally(() => { isSubmitting = false; });
    });

    document.getElementById('close__btn')?.addEventListener('click', () => {
        document.querySelector('.container__form-sended').style.display = 'none';
    });

    function validateField(input) {
        const value = input.value.trim();
        const id = input.id;
        let message = '';

        if (id === 'email') {
            if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) message = 'Введіть коректну електронну адресу';
        } else if (id === 'usernameDiscord') {
            if (value.length < 3) message = "Ім'я користувача має містити щонайменше 3 символи";
        } else if (id === 'truckersmp') {
            if (value.length < 10 || !value.includes('truckersmp.com')) message = 'Введіть посилання на профіль TruckersMP';
        } else if (id === 'dlc') {
            if (!value) message = "Це поле обов'язкове для заповнення";
        } else if (id === 'age') {
            if (!/^\d{1,2}$/.test(value) || +value < 18 || +value > 99) message = 'Вік має бути від 18 до 99';
        } else if (id === 'activity') {
            if (value.length < 3) message = 'Опишіть Вашу активність';
        } else if (id === 'person') {
            if (value.length < 5) message = 'Напишіть більше про мотивацію приєднатися';
        } else if (id === 'km') {
            if (!/^\d{3,5}$/.test(value)) message = 'Вкажіть кількість км від 100 до 99999';
        }

        input.classList.remove('input-error');
        input.parentNode.querySelector('.error-message')?.remove();

        if (message) {
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = message;
            input.parentNode.appendChild(error);
            requestAnimationFrame(() => error.classList.add('visible'));
            input.classList.add('input-error');
            return false;
        }
        return true;
    }
});
