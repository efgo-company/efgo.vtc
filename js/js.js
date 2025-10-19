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