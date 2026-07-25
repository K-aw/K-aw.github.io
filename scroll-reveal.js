
document.addEventListener('DOMContentLoaded', function () {
  const images = document.querySelectorAll('.image-column img');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    images.forEach(function (img) {
      observer.observe(img);
    });
  } else {
    images.forEach(function (img) {
      img.classList.add('visible');
    });
  }
});
