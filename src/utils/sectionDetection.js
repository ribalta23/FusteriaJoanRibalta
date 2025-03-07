import { ref, onMounted, onUnmounted } from 'vue';

export function useSectionDetection() {
  const activeSection = ref('qui-som'); // Default active section

  // Function to check which section is in the viewport
  const checkActiveSection = () => {
    const sections = ['qui-som', 'serveis', 'ubicacio', 'contacte'];
    
    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        const isInViewport = (
          rect.top <= 150 && rect.bottom >= 150
        );
        
        if (isInViewport) {
          activeSection.value = section;
          break;
        }
      }
    }
  };

  // Set up scroll event listener
  onMounted(() => {
    window.addEventListener('scroll', checkActiveSection);
    // Initial check
    checkActiveSection();
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', checkActiveSection);
  });

  return {
    activeSection
  };
}
