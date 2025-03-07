<script setup>
import { defineProps } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  activeSection: {
    type: String,
    default: 'home'
  }
});

const route = useRoute();

// Función para determinar la URL correcta según la vista actual
const getSectionUrl = (section) => {
  // Si ya estamos en la página de inicio, usamos anclas
  if (route.path === '/') {
    return `#${section}`;
  }
  // Si estamos en otra página, volvemos a la página principal con ancla
  return `/#${section}`;
};
</script>

<template>
  <header class="bg-white shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <router-link to="/" class="flex items-center space-x-3 md:justify-start justify-center w-full md:w-auto">
        <img src="@/assets/logo.jpg" alt="FUSTERIA JOAN RIBALTA" class="h-16 w-auto object-contain rounded-lg shadow-md">
      </router-link>
      
      <nav class="hidden md:flex space-x-8">
        <!-- Links que aparecen en todas las vistas -->
        <a :href="getSectionUrl('qui-som')" 
           :class="['transition-colors duration-300', 
                   route.path === '/' && activeSection === 'qui-som' 
                   ? 'text-orange-600 font-medium border-b-2 border-orange-600' 
                   : 'text-gray-600 hover:text-orange-600']">
          Qui Som
        </a>
        <a :href="getSectionUrl('serveis')" 
           :class="['transition-colors duration-300', 
                   route.path === '/' && activeSection === 'serveis' 
                   ? 'text-orange-600 font-medium border-b-2 border-orange-600' 
                   : 'text-gray-600 hover:text-orange-600']">
          Serveis
        </a>
        <a :href="getSectionUrl('ubicacio')" 
           :class="['transition-colors duration-300', 
                   route.path === '/' && activeSection === 'ubicacio' 
                   ? 'text-orange-600 font-medium border-b-2 border-orange-600' 
                   : 'text-gray-600 hover:text-orange-600']">
          Ubicació
        </a>
        <a :href="getSectionUrl('contacte')" 
           :class="['transition-colors duration-300', 
                   route.path === '/' && activeSection === 'contacte' 
                   ? 'text-orange-600 font-medium border-b-2 border-orange-600' 
                   : 'text-gray-600 hover:text-orange-600']">
          Contacte
        </a>
        
        <router-link to="/album" 
           :class="['transition-colors duration-300', 
                   route.path === '/album' 
                   ? 'text-orange-600 font-medium border-b-2 border-orange-600' 
                   : 'text-gray-600 hover:text-orange-600']">
          Album
        </router-link>
      </nav>
    </div>
  </header>
</template>
