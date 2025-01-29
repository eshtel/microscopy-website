// Example: alert when an image is clicked
document.querySelectorAll('.gallery img').forEach((img) => {
    img.addEventListener('click', () => {
        alert('You clicked on ' + img.alt);
    });
});
