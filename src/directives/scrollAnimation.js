export const scrollAnimation = {
  mounted(el, binding) {
    // Use animation type from binding or default to fade-in-up
    const animationType = binding.value || 'fade-in-up';
    el.classList.add(animationType);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add a small delay before adding the animate class
          setTimeout(() => {
            el.classList.add('animate');
          }, 100);
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.1 // Element is considered visible when 10% is visible
    });
    
    observer.observe(el);
  }
};

export default scrollAnimation;
