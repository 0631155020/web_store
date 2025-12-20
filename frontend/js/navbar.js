const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    })
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    })
}

document.addEventListener("DOMContentLoaded", function() {
    const path = window.location.pathname;
    const links = document.querySelectorAll("#navbar li a");

    links.forEach(link => {
        const linkPath = new URL(link.href).pathname;

        // Remove the active class from all links first to be safe
        link.classList.remove("active");

        // Check for a match.
        // The home page can be at '/' or '/main.html', so we treat them as the same.
        if (path === linkPath || (path === '/' && linkPath === '/main.html')) {
            link.classList.add("active");
        }
    });
});
