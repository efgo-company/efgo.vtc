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
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('input').forEach(input => {
            input.classList.remove('input-error');
        });

        form.querySelectorAll('input').forEach(input => {
            const valid = validateField(input);
            if (!valid) isValid = false;
        });

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
                document.getElementById('btn__close-popup').addEventListener('click', () => {
                    popup.style.display = 'none';
                    document.body.style.overflow = '';
                });
                isSubmitting = false;
                return;
            }
        }

        const email = document.getElementById('email').value;
        const discord = document.getElementById('usernameDiscord').value;
        const truckersmp = document.getElementById('truckersmp').value;
        const dlc = document.getElementById('dlc').value;
        const age = document.getElementById('age').value;
        const activity = document.getElementById('activity').value;
        const reason = document.getElementById('person').value;
        const km = document.getElementById('km').value;
        const comment = document.getElementById('comment').value || "Немає";

        const recruitingRoleIdFirst = '1333577796743729164';
        const recruitingRoleIdSecond = '1253064228173123646';

        const embed = {
            title: "📥 Нова заявка на вступ до компанії",
            color: 0x3498DB,
            fields: [
                { name: "📧 Email", value: email, inline: true },
                { name: "👤 Discord username", value: discord, inline: true },
                { name: "🚛 Профіль TruckersMP", value: truckersmp, inline: false },
                { name: "🧩 DLC", value: dlc, inline: true },
                { name: "🎂 Вік", value: age, inline: true },
                { name: "🚛 Активність на тиждень", value: activity, inline: false },
                { name: "❓ Чому хоче приєднатися", value: reason, inline: false },
                { name: "📏 Км/тиждень", value: km, inline: true },
                { name: "💬 Коментар", value: comment, inline: false },
                { name: "🕒 Дата", value: new Date().toLocaleString('uk-UA'), inline: false },
            ],
            footer: { text: "EUROFEST GROUP | Рекрутинг" },
            timestamp: new Date(),
        };

        const message = `<@&${recruitingRoleIdFirst}> <@&${recruitingRoleIdSecond}> — нова заявка! 🚨`;

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
            }
        }).catch(error => {
            console.error("Помилка при відправці заявки:", error);
            alert("Сталася помилка при відправці заявки.");
        }).finally(() => {
            isSubmitting = false;
        });
    });

    document.getElementById('close__btn')?.addEventListener('click', () => {
        document.querySelector('.container__form-sended').style.display = 'none';
    });

    function validateField(input) {
        const value = input.value.trim();
        const id = input.id;
        let message = '';

        if (id === 'email') {
            const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
            if (!emailPattern.test(value)) message = 'Введіть коректну електронну адресу';
        } else if (id === 'usernameDiscord') {
            if (value.length < 3) message = "Ім'я користувача має містити щонайменше 3 символи";
        } else if (id === 'truckersmp') {
            if (value.length < 10 || !value.includes('truckersmp.com')) {
                message = 'Введіть посилання на профіль TruckersMP';
            }
        } else if (id === 'dlc') {
            if (value === '') message = "Це поле обов'язкове для заповнення";
        } else if (id === 'age') {
            if (!/^\d{1,2}$/.test(value) || +value < 14 || +value > 99) message = 'Вік має бути від 14 до 99';
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
            showError(input, message);
            return false;
        }
        return true;
    }

    function showError(input, message) {
        input.classList.add('input-error');
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        input.parentNode.appendChild(error);
        requestAnimationFrame(() => {
            error.classList.add('visible');
        });
    }
});
