window.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    if (window.scrollY > 0) {
        header.classList.add('scroll');
    } else {
        header.classList.remove('scroll');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".section");

    sections.forEach(section => {
        section.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });

    const handleScroll = () => {
        const windowHeight = window.innerHeight;

        sections.forEach(section => {
            if (section.contains(document.getElementById('header'))) return;

            const rect = section.getBoundingClientRect();

            let progress = Math.min(Math.max(0, (rect.top - windowHeight / 2) / (rect.height / 2)), 1);
            progress = Math.max(0, Math.min(1, progress));

            section.style.opacity = 1 - progress;
            section.style.transform = `translateY(${progress * 50}px)`;
        });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
});

let cachedMessages = [];

async function loadMessages() {
    const newsContainer = document.getElementById("news");

    try {
        const res = await fetch("http://localhost:5000/api/messages");
        if (!res.ok) throw new Error("Сервер недоступен");

        const data = await res.json();
        cachedMessages = data;
        updateNews(data, newsContainer);
    } catch (e) {
        console.warn("Ошибка загрузки сообщений:", e.message);
        if (cachedMessages.length > 0) {
            updateNews(cachedMessages, newsContainer);
        } else {
            newsContainer.innerHTML = "<p style='color:#aaa;'>Нет данных о новостях</p>";
        }
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function parseDiscordFormatting(rawText) {
    if (!rawText) return "";
    let text = escapeHtml(rawText);
    const codeBlocks = [];
    text = text.replace(/```([\s\S]*?)```/g, (m, p1) => {
        const idx = codeBlocks.push(p1) - 1;
        return `@@CODEBLOCK${idx}@@`;
    });
    const inlineCodes = [];
    text = text.replace(/`([^`\n]+)`/g, (m, p1) => {
        const idx = inlineCodes.push(p1) - 1;
        return `@@INLINECODE${idx}@@`;
    });
    text = text.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([\s\S]+?)__/g, "<u>$1</u>");
    text = text.replace(/~~([\s\S]+?)~~/g, "<del>$1</del>");
    text = text.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "<em>$1</em>");
    text = text.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, "<em>$1</em>");
    text = text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    text = text.replace(/@@INLINECODE(\d+)@@/g, (m, idx) => {
        const content = inlineCodes[Number(idx)];
        return `<code>${escapeHtml(content)}</code>`;
    });
    text = text.replace(/@@CODEBLOCK(\d+)@@/g, (m, idx) => {
        const content = codeBlocks[Number(idx)];
        return `<pre><code>${escapeHtml(content)}</code></pre>`;
    });
    return text;
}

function updateNews(data, container) {
    container.innerHTML = "";
    const latest = data.slice(-3);
    latest.forEach((msg, i) => {
        const block = document.createElement("div");
        block.classList.add("block__news");

        const text = document.createElement("p");
        text.innerHTML = parseDiscordFormatting(msg.content);
        block.appendChild(text);

        if (msg.attachments && msg.attachments.length > 0) {
            const imagesWrapper = document.createElement("div");
            imagesWrapper.classList.add("news__images");

            const img = document.createElement("img");
            img.src = msg.attachments[0];
            imagesWrapper.appendChild(img);
            imagesWrapper.style.display = "flex";
            imagesWrapper.style.justifyContent = "center";

            block.appendChild(imagesWrapper);
        }

        container.appendChild(block);
        setTimeout(() => block.classList.add("show"), i * 100);
    });
}

setInterval(loadMessages, 10000);
loadMessages();
