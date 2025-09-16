const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    } else {
      entry.target.classList.remove("visible");
    }
  });
}, {
  threshold: 0.01,  // fire when 25% of element is visible
  rootMargin: "50px 0px" 
});

// Watch elements
document.querySelectorAll(".fade-in").forEach(el => observer.observe(el));