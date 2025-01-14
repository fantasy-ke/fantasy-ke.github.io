document.querySelectorAll('.footer .info-container span').forEach(span => {
    if (span.textContent.includes('Redefine v')) {
        span.closest('div').style.display = 'none';
    }
});