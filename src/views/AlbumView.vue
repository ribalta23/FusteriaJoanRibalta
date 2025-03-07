<script setup>
import { ref, onMounted } from 'vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';
import { useSectionDetection } from '@/utils/sectionDetection';
import { supabase } from '../supabase';

const folderStructure = ref({
  rootImages: [],
  folders: {}
});
const loading = ref(true);
const error = ref(null);
const selectedImage = ref(null);

const { activeSection } = useSectionDetection();

const BUCKET_NAME = 'fotos';
// Folder to exclude from album view
const EXCLUDED_FOLDERS = ['slider'];

const fetchImages = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Listar todos los archivos en el bucket raíz
    const { data: rootFiles, error: listError } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list('', { sortBy: { column: 'name', order: 'asc' } });
    
    if (listError) throw listError;
    
    // Separar carpetas e imágenes
    const folders = rootFiles.filter(item => item.id === null && !EXCLUDED_FOLDERS.includes(item.name));
    const imageFiles = rootFiles.filter(file => 
      !file.id && file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
    );
    
    // Procesar imágenes raíz
    const rootImagePromises = imageFiles.map(async (file) => {
      const { data: { publicUrl } } = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(file.name);
        
      return {
        name: file.name,
        url: publicUrl
      };
    });
    
    folderStructure.value.rootImages = await Promise.all(rootImagePromises);
    
    // Procesar cada carpeta
    for (const folder of folders) {
      try {
        // Listar contenido de la carpeta
        const { data: folderFiles, error: folderError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .list(folder.name, { sortBy: { column: 'name', order: 'asc' } });
        
        if (folderError) throw folderError;
        
        // Filtrar solo imágenes
        const folderImageFiles = folderFiles.filter(file => 
          file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
        );
        
        // Obtener URLs para imágenes de la carpeta
        const folderImagesPromises = folderImageFiles.map(async (file) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(`${folder.name}/${file.name}`);
            
          return {
            name: file.name,
            url: publicUrl,
            path: `${folder.name}/${file.name}`
          };
        });
        
        const folderImages = await Promise.all(folderImagesPromises);
        
        // Solo añadir carpetas que contienen imágenes
        if (folderImages.length > 0) {
          folderStructure.value.folders[folder.name] = folderImages;
        }
        
      } catch (folderErr) {
        console.error(`Error al cargar la carpeta ${folder.name}:`, folderErr);
      }
    }
    
  } catch (err) {
    console.error('Error fetching images:', err);
    error.value = err.message || 'Error al cargar imágenes';
  } finally {
    loading.value = false;
  }
};

const openImage = (image) => {
  selectedImage.value = image;
};

const closeModal = () => {
  selectedImage.value = null;
};

// Función para formatear el nombre de la carpeta
const formatFolderName = (folderName) => {
  return folderName.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

// Validar si hay imágenes para mostrar
const hasImages = () => {
  return folderStructure.value.rootImages.length > 0 || 
         Object.keys(folderStructure.value.folders).length > 0;
};

onMounted(() => {
  fetchImages();
});
</script>

<template>
  <main class="bg-white min-h-screen">
    <HeaderComponent :activeSection="activeSection" />

    <!-- Album Header Section -->
    <section class="py-24 bg-gradient-to-b from-orange-50 to-white">
      <div class="max-w-6xl mx-auto px-4 text-center">
        <h1 v-scroll-animate="'fade-in-up'" class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Àlbum de Fotos
        </h1>
        <div class="w-24 h-1 bg-orange-500 mx-auto mb-8"></div>
        <p v-scroll-animate="'fade-in-up'" class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Explora la nostra galeria d'imatges organitzada per categories
        </p>
      </div>
    </section>

    <!-- Album Content Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col justify-center items-center py-24">
          <div class="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-orange-500 border-solid mb-4"></div>
          <p class="text-xl text-gray-600 mt-6 font-light">Carregant la galeria...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-8">
            <i class="fa-solid fa-triangle-exclamation text-red-500 text-2xl"></i>
          </div>
          <p class="text-xl text-red-600 font-light">{{ error }}</p>
          <button @click="fetchImages" class="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Tornar a intentar
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!hasImages()" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-8">
            <i class="fa-regular fa-images text-gray-500 text-3xl"></i>
          </div>
          <p class="text-xl text-gray-600 font-light">No s'han trobat imatges a l'àlbum</p>
        </div>
        
        <!-- Images Content -->
        <div v-else class="space-y-24">
          <!-- Root Images Section -->
          <div v-if="folderStructure.rootImages.length > 0" v-scroll-animate="'fade-in-up'" class="relative">
            <div class="flex items-center mb-12 border-b border-gray-200 pb-4">
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-5">
                <i class="fa-regular fa-images text-orange-600 text-xl"></i>
              </div>
              <h2 class="text-3xl font-bold text-gray-900">Imatges Generals</h2>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <div 
                v-for="(image, index) in folderStructure.rootImages" 
                :key="`root-${index}`" 
                class="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
                @click="openImage(image)"
              >
                <div class="relative overflow-hidden rounded-xl shadow-lg aspect-[4/3] bg-gray-100">
                  <img 
                    :src="image.url" 
                    :alt="image.name" 
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div class="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-300">
                      <i class="fa-solid fa-magnifying-glass text-gray-800"></i>
                    </div>
                  </div>
                </div>
                <p class="mt-4 text-sm font-medium text-gray-700 text-center group-hover:text-orange-600 transition-colors">
                  {{ image.name.replace(/\.[^/.]+$/, "") }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Folder Sections -->
          <div 
            v-for="(images, folderName) in folderStructure.folders" 
            :key="folderName" 
            v-scroll-animate="'fade-in-up'"
            class="relative"
          >
            <div class="flex items-center mb-12 border-b border-gray-200 pb-4">
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-5">
                <i class="fa-solid fa-folder-open text-orange-600 text-xl"></i>
              </div>
              <h2 class="text-3xl font-bold text-gray-900">{{ formatFolderName(folderName) }}</h2>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <div 
                v-for="(image, index) in images" 
                :key="`${folderName}-${index}`" 
                class="group cursor-pointer transform transition-all duration-300 hover:-translate-y-1"
                @click="openImage(image)"
              >
                <div class="relative overflow-hidden rounded-xl shadow-lg aspect-[4/3] bg-gray-100">
                  <img 
                    :src="image.url" 
                    :alt="image.name" 
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  >
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div class="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-300">
                      <i class="fa-solid fa-magnifying-glass text-gray-800"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal -->
    <div 
      v-if="selectedImage" 
      class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
      @click="closeModal"
    >
      <div 
        @click.stop 
        class="max-w-6xl w-full bg-white rounded-xl overflow-hidden shadow-2xl transform transition-all"
      >
        <div class="relative bg-gray-900">
          <img 
            :src="selectedImage.url" 
            :alt="selectedImage.name" 
            class="w-full max-h-[80vh] object-contain"
          >
          <button 
            @click="closeModal" 
            class="absolute top-4 right-4 w-12 h-12 rounded-full bg-white bg-opacity-90 flex items-center justify-center text-gray-900 hover:bg-opacity-100 transition-all"
          >
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
      </div>
    </div>

    <FooterComponent />
  </main>
</template>