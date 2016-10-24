window.Polymer = {
    dom: 'shadow',
    lazyRegister: true
};

document.addEventListener('DOMContentLoaded', () => {
    let link = document.createElement('link');

    link.rel = 'import';
    link.href = '/elements/elements.html';

    document.head.appendChild(link);
});