document.addEventListener('DOMContentLoaded', () => {

  // IMAGE CLICK (optional testing)
  document.querySelectorAll('.gallery img').forEach(img => {
    img.addEventListener('click', () => {
      alert('You clicked on ' + img.alt);
    });
  });

  // FADE-IN ON SCROLL
  const faders = document.querySelectorAll('.fade-in');
  const appearOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };
  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, appearOptions);
  faders.forEach(fader => appearOnScroll.observe(fader));

  // LIGHT / DARK MODE TOGGLE
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  if (themeToggle) themeToggle.textContent = '🌙';
  if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-mode');
    if (themeToggle) themeToggle.textContent = '🌞';
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      const isLight = body.classList.contains('light-mode');
      themeToggle.textContent = isLight ? '🌞' : '🌙';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }

  // CONTEXT MENU BLOCK ON IMAGES
  document.addEventListener("contextmenu", function(event) {
    if (event.target.tagName === "IMG") event.preventDefault();
  });

  // SMOOTH SCROLL ONLY FOR #anchors that exist
  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    const targetEl = document.querySelector(link.getAttribute('href'));
    if (!targetEl) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
    });
  });

});


const url = 'images/chapt5.pdf'; // your PDF file path

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    scale = 1.2, // zoom factor
    canvasLeft = document.getElementById('pdf-render-left'),
    canvasRight = document.getElementById('pdf-render-right'),
    ctxLeft = canvasLeft.getContext('2d'),
    ctxRight = canvasRight.getContext('2d');

// Render a pair of pages
const renderPagePair = num => {
    pageIsRendering = true;

    const renderSinglePage = (pageNumber, canvas, ctx) => {
        if (pageNumber > pdfDoc.numPages) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        pdfDoc.getPage(pageNumber).then(page => {
            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            page.render({ canvasContext: ctx, viewport });
        });
    };

    renderSinglePage(num, canvasLeft, ctxLeft);
    renderSinglePage(num + 1, canvasRight, ctxRight);

    pageIsRendering = false;
    document.getElementById('page-num').textContent = num;
};

const queueRenderPagePair = num => {
    if (pageIsRendering) pageNumIsPending = num;
    else renderPagePair(num);
};

// Event listeners
document.getElementById('prev-page').addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum -= 2;
    if (pageNum < 1) pageNum = 1;
    queueRenderPagePair(pageNum);
});

document.getElementById('next-page').addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum += 2;
    if (pageNum > pdfDoc.numPages) pageNum = pdfDoc.numPages - (pdfDoc.numPages % 2);
    queueRenderPagePair(pageNum);
});

document.getElementById('zoom-in').addEventListener('click', () => {
    scale += 0.2;
    queueRenderPagePair(pageNum);
});

document.getElementById('zoom-out').addEventListener('click', () => {
    scale -= 0.2;
    queueRenderPagePair(pageNum);
});

// Load the PDF
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.getElementById('page-count').textContent = pdfDoc.numPages;
    renderPagePair(pageNum);
}).catch(err => {
    const div = document.getElementById('article');
    div.innerHTML = `<p>Failed to load PDF: ${err.message}</p>`;
});
