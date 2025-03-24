<script setup>
import { ref, onMounted } from 'vue';
import { quiSomData, serveisData } from '@/data/websiteData';
import HeaderComponent from '@/components/HeaderComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';
import { useSectionDetection } from '@/utils/sectionDetection';
import { supabase } from '../supabase';
import { useRoute } from 'vue-router';

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const { activeSection } = useSectionDetection();

// Slider related data
const sliderImages = ref([]);
const sliderLoading = ref(true);
const currentSlide = ref(0);
const slideInterval = ref(null);

// Fetch slider images
const fetchSliderImages = async () => {
  try {
    sliderLoading.value = true;
    
    // List all files in the slider folder
    const { data: files, error } = await supabase
      .storage
      .from('fotos')
      .list('slider', { sortBy: { column: 'name', order: 'asc' } });
    
    if (error) throw error;
    
    // Filter only image files
    const imageFiles = files.filter(file => 
      file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
    );
    
    // Get public URLs for each image
    const imagePromises = imageFiles.map(async (file) => {
      const { data: { publicUrl } } = supabase
        .storage
        .from('fotos')
        .getPublicUrl(`slider/${file.name}`);
        
      return {
        name: file.name,
        url: publicUrl
      };
    });
    
    sliderImages.value = await Promise.all(imagePromises);
  } catch (err) {
    console.error('Error fetching slider images:', err);
  } finally {
    sliderLoading.value = false;
  }
};

// Next and previous slide functions
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % sliderImages.value.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + sliderImages.value.length) % sliderImages.value.length;
};

// Start and stop autoplay
const startSlideshow = () => {
  slideInterval.value = setInterval(() => {
    nextSlide();
  }, 5000); // Change slide every 5 seconds
};

const stopSlideshow = () => {
  if (slideInterval.value) {
    clearInterval(slideInterval.value);
  }
};

// Form submission function - simplified to just use Formspree
async function handleSubmit(event) {
  event.preventDefault();
  
  try {
    // Create a FormData object for Formspree
    const form = new FormData();
    form.append('name', formData.value.name);
    form.append('email', formData.value.email);
    form.append('subject', formData.value.subject);
    form.append('message', formData.value.message);
    
    // Send form data to Formspree
    const response = await fetch('https://formspree.io/f/mwkjgejl', {
      method: 'POST',
      body: form,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      formData.value = { name: '', email: '', subject: '', message: '' };
      swal({
        title: 'Gràcies',
        text: 'Missatge enviat',
        icon: 'success'
      });
    } else {
      throw new Error('Error en enviar el formulari');
    }
  } catch (error) {
    console.error('Error en enviar el formulari:', error);
    swal({
      title: 'Error',
      text: 'Hi ha hagut un problema en enviar el missatge. Si us plau, intenta-ho més tard.',
      icon: 'error'
    });
  }
}

onMounted(() => {
  fetchSliderImages().then(() => {
    if (sliderImages.value.length > 0) {
      startSlideshow();
    }
  });
});
</script>

<template>
  <main class="bg-white min-h-screen">
    <HeaderComponent :activeSection="activeSection" />

    <!-- Hero Slider Section -->
    <section v-if="sliderImages.length > 0" class="relative">
      <!-- Slider Images -->
      <div class="relative h-[80vh] overflow-hidden">
        <div v-for="(image, index) in sliderImages" 
             :key="index"
             class="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
             :class="{ 'opacity-100': index === currentSlide, 'opacity-0': index !== currentSlide }">
          <img :src="image.url" 
               :alt="image.name"
               class="object-cover w-full h-full" />
          
          <!-- Dark Overlay -->
          <div class="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        </div>
        
        <!-- Slider Content -->
        <div class="absolute inset-0 flex items-center z-10 px-4">
          <div class="max-w-6xl mx-auto pl-4 md:pl-12">
            <div class="max-w-xl text-white">
              <h2 class="text-orange-400 font-medium mb-3 text-lg">Fusteria i mobles artesanals</h2>
              <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">Tradició i Qualitat <span class="text-orange-400">des de 1985</span></h1>
              <p class="text-lg mb-8 text-gray-200">Especialistes en fusteria a mida i restauració de mobles amb l'atenció personalitzada que el teu projecte mereix.</p>
              <div v-scroll-animate="'scale-in'" class="flex gap-4">
                <a href="#contacte" class="bg-orange-600 hover:bg-orange-700 text-white font-medium px-8 py-4 rounded-lg transition-all flex items-center gap-2">
                  <i class="fa-regular fa-comment-dots"></i>
                  Sol·licitar pressupost
                </a>
                <router-link to="/album" class="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-medium px-8 py-4 rounded-lg transition-all flex items-center gap-2">
                  <i class="fa-regular fa-images"></i>
                  Veure projectes
                </router-link>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Navigation Arrows -->
        <button @click="prevSlide" @mouseenter="stopSlideshow" @mouseleave="startSlideshow"
                class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center text-white z-20 transition-all border border-white/30">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button @click="nextSlide" @mouseenter="stopSlideshow" @mouseleave="startSlideshow"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center text-white z-20 transition-all border border-white/30">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
        
        <!-- Slider Indicators -->
        <div class="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          <button v-for="(_, index) in sliderImages" 
                  :key="index" 
                  @click="currentSlide = index"
                  :class="{'w-10 bg-orange-500': index === currentSlide, 'bg-white/50': index !== currentSlide}"
                  class="h-2 rounded-full transition-all">
          </button>
        </div>
      </div>
    </section>
    
    <!-- Trust Banner -->
    <section class="py-8 bg-gray-100">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-center md:text-left">
            <p class="text-gray-600 font-medium">Més de 35 anys d'experiència en el sector</p>
          </div>
          <div class="flex flex-wrap justify-center gap-8">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-star text-yellow-500"></i>
              <span class="font-semibold">Atenció personalitzada</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-check-circle text-green-600"></i>
              <span class="font-semibold">Materials de qualitat</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-medal text-blue-600"></i>
              <span class="font-semibold">Disseny a mida</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Secció Qui Som with dynamic data -->
    <section id="qui-som" class="py-24">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div v-scroll-animate="'fade-in-right'">
            <h2 class="text-orange-600 font-semibold mb-4">{{ quiSomData.title }}</h2>
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Artesans de la fusta <br>des de 1985</h1>
            <p class="text-lg text-gray-600 leading-relaxed mb-8">
              {{ quiSomData.description }}
            </p>
            <div class="grid grid-cols-2 gap-8 mb-10">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i class="fa-solid fa-ruler text-orange-600"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">Precisió</h3>
                  <p class="text-gray-600">Detall i qualitat</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i class="fa-solid fa-lightbulb text-orange-600"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">Creativitat</h3>
                  <p class="text-gray-600">Disseny innovador</p>
                </div>
              </div>
            </div>
            <a href="#serveis" class="text-orange-600 font-medium flex items-center gap-2 hover:gap-4 transition-all">
              Descobreix els nostres serveis 
              <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          <div v-scroll-animate="'fade-in-left'" class="relative">
            <div class="relative z-10 rounded-xl overflow-hidden shadow-xl h-[500px]">
              <img src="@/assets/imatges/taller.png" alt="Taller de fusteria" class="w-full h-full object-cover" />
            </div>
            <div class="absolute -bottom-5 -right-5 w-64 h-64 bg-orange-100 rounded-xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Serveis con Tarjetas -->
    <section id="serveis" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 v-scroll-animate="'fade-in-up'" class="text-orange-600 font-semibold mb-4">{{ serveisData.title }}</h2>
          <h1 v-scroll-animate="'fade-in-up'" class="text-4xl font-bold text-gray-900 mb-6">{{ serveisData.subtitle }}</h1>
          <p v-scroll-animate="'fade-in-up'" class="max-w-2xl mx-auto text-gray-600">Oferim solucions completes de fusteria per satisfer totes les teves necessitats, des de mobles a mida fins a restauracions.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="(service, index) in serveisData.services" 
            :key="index"
            v-scroll-animate="'fade-in-up'" 
            class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover:translate-y-[-5px] group"
            :class="{'delay-200': index === 1, 'delay-400': index === 2}"
          >
            <div class="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
              <i :class="[service.icon, 'text-3xl text-orange-600 group-hover:text-white']"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">{{ service.title }}</h3>
            <p class="text-gray-600 mb-6">{{ service.description }}</p>
            <a href="#contacte" class="text-orange-600 font-medium flex items-center gap-2 hover:gap-3 transition-all">
              Més informació
              <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Ubicación with animations - Fully Responsive -->
    <section id="ubicacio" class="py-12 md:py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Section title for mobile only -->
        <div class="text-center mb-8 lg:hidden">
          <h2 class="text-orange-600 font-semibold mb-2">Visita'ns</h2>
          <h1 class="text-3xl font-bold text-gray-900">Estem al cor de Tàrrega</h1>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          <!-- Map container - Always first on mobile -->
          <div class="order-1 lg:order-2 h-auto lg:h-full rounded-2xl overflow-hidden shadow-xl mb-6 lg:mb-0">
            <iframe class="w-full h-full" 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d745.3344619186892!2d1.13599958077411!3d41.64844195173005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a69eccd6da64a9%3A0x624c5747bd05a499!2sfusteria%20i%20mobles%20joan%20ribalta%20-%20t%C3%A0rrega!5e0!3m2!1ses!2ses!4v1678562494465!5m2!1ses!2ses" 
                    style="border:0;" 
                    allowfullscreen>
            </iframe>
          </div>
          
          <!-- Info container -->
          <div class="order-2 lg:order-1">
            <div v-scroll-animate="'fade-in-right'" class="bg-white p-6 md:p-8 rounded-2xl shadow-lg relative z-10 mx-0 h-full">
              <!-- Section title for desktop only -->
              <div class="hidden lg:block mb-10">
                <h2 class="text-orange-600 font-semibold mb-4">Visita'ns</h2>
                <h1 class="text-3xl font-bold text-gray-900 mb-6">Estem al cor de Tàrrega</h1>
              </div>
              
              <div class="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-6 bg-orange-50 rounded-xl mb-8">
                <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                  <i class="fa-solid fa-location-dot text-orange-600"></i>
                </div>
                <p class="text-lg font-medium text-gray-800">
                  Carrer de Sant Eloi, 21<br>
                  25300 Tàrrega, Lleida
                </p>
              </div>

              <div class="space-y-4 md:space-y-6 mb-8">
                <div class="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                  <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-clock text-orange-600"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900">Horari</h3>
                    <p class="text-gray-600">Dilluns a Divendres: 7:00 - 15:00</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                  <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-phone text-orange-600"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900">Truca'ns</h3>
                    <p class="text-2xl font-bold text-orange-600">666 59 08 33</p>
                  </div>
                </div>
              </div>

              <!-- Responsive social media buttons -->
              <div class="pt-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Segueix-nos</h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a href="https://wa.me/666590833" class="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all">
                    <i class="fa-brands fa-whatsapp text-xl"></i>
                    <span class="font-medium">WhatsApp</span>
                  </a>
                  <a href="https://www.instagram.com/fusteriajoanribalta/" class="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all">
                    <i class="fa-brands fa-instagram text-xl"></i>
                    <span class="font-medium">Instagram</span>
                  </a>
                  <a href="https://es-es.facebook.com/fusteriajoanribalta/" class="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                    <i class="fa-brands fa-facebook-f text-xl"></i>
                    <span class="font-medium">Facebook</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contacte section with modern styling -->
    <section id="contacte" class="py-24 bg-gradient-to-b from-white to-orange-50">
      <div class="max-w-4xl mx-auto px-4">
        <div v-scroll-animate="'scale-in'" class="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div class="text-center mb-12">
            <h2 v-scroll-animate="'fade-in-up'" class="text-sm font-semibold text-orange-600 mb-4">Contacte ràpid</h2>
            <h1 v-scroll-animate="'fade-in-up'" class="text-3xl font-bold text-gray-900 mb-4">Parlem del teu projecte</h1>
            <p v-scroll-animate="'fade-in-up'" class="text-gray-600">Responem en menys de 24 hores</p>
          </div>
          
          <form @submit="handleSubmit" class="space-y-6">
            <!-- Form elements with animations -->
            <div v-scroll-animate="'fade-in-up'" class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input v-model="formData.name" type="text" required 
                       class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input v-model="formData.email" type="email" required 
                       class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
              </div>
            </div>
            
            <div v-scroll-animate="'fade-in-up'" class="delay-200">
              <label class="block text-sm font-medium text-gray-700 mb-2">Assumpte</label>
              <input v-model="formData.subject" type="text" 
                     class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all">
            </div>
            
            <div v-scroll-animate="'fade-in-up'" class="delay-300">
              <label class="block text-sm font-medium text-gray-700 mb-2">Missatge *</label>
              <textarea v-model="formData.message" required 
                        class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-40 transition-all"></textarea>
            </div>
            <button v-scroll-animate="'fade-in-up'" type="submit" 
                    class="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-4 px-8 rounded-lg transition-all flex items-center justify-center gap-2 delay-400">
              <i class="fa-regular fa-paper-plane"></i>
              Envia el missatge
            </button>
          </form>
        </div>
      </div>
    </section>

    <FooterComponent />
  </main>
</template>

<style>
html {
  scroll-behavior: smooth;
}
</style>
