<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header Sticky -->
    <div class="sticky top-0 z-50 bg-orange-600 shadow-lg">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <router-link to="/area-privada">
              <img class="h-10 w-10 rounded-lg shadow-md" src="@/assets/logo.jpg" alt="Logo">
            </router-link>
            <div>
              <h1 class="text-base sm:text-lg font-bold text-white">Gestió d'Imatges</h1>
              <p class="hidden sm:block text-xs text-orange-100">Administració de fotos</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <router-link
              to="/area-privada"
              class="inline-flex px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg font-semibold text-sm hover:bg-opacity-30 transition"
            >
              ← Tornar
            </router-link>
            <button 
              @click="logout" 
              class="px-3 py-2 bg-white text-orange-600 rounded-lg font-semibold text-sm hover:bg-orange-50 transition shadow-md"
            >
              Sortir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="px-4 py-6 max-w-7xl mx-auto">
      <div class="bg-white shadow-md rounded-xl p-4 sm:p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-medium text-gray-900">Gestió d'Imatges</h2>
          <div class="flex items-center space-x-2">
            <!-- Back Button -->
            <button 
              v-if="currentFolder !== ''"
              @click="goBack"
              class="px-4 py-2 rounded-md text-sm font-medium border shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center"
            >
              <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              Enrere
            </button>
            
            <div v-if="currentFolder" class="flex items-center text-sm font-medium text-gray-700">
              <span class="mx-1">/</span>
              <span class="text-orange-600">{{ currentFolder }}</span>
            </div>
          </div>
        </div>

        <!-- Upload Area -->
        <div 
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center"
          @dragover.prevent="dragover = true"
          @dragleave.prevent="dragover = false"
          @drop.prevent="handleDrop($event)"
          :class="{ 'border-orange-500 bg-orange-50': dragover }"
        >
          <div v-if="uploading">
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-10 w-10 border-t-4 border-orange-500 border-solid"></div>
              <span class="ml-3 text-sm font-medium text-gray-700">Pujant arxius... {{ Math.round(uploadProgress) }}%</span>
            </div>
          </div>
          <div v-else>
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="mt-2 text-sm text-gray-600">
              Arrossega imatges aquí o
              <label class="cursor-pointer text-orange-600 hover:text-orange-500">
                <span>selecciona arxius</span>
                <input type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
              </label>
            </p>
            <p class="mt-1 text-xs text-gray-500">PNG, JPG, WEBP fins a 10MB</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-solid"></div>
          <span class="ml-3 text-sm font-medium text-gray-700">Carregant imatges...</span>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="p-4 bg-red-50 rounded-md">
          <div class="flex">
            <div class="shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Folders Section -->
        <div v-else-if="folders.length > 0" class="mb-8">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Carpetes</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div 
              v-for="folder in folders" 
              :key="folder.name"
              @click="navigateToFolder(folder.name)"
              class="group relative bg-white border border-gray-200 rounded-md p-2 hover:shadow-md cursor-pointer transition-all"
            >
              <div class="aspect-square flex items-center justify-center bg-orange-50 rounded mb-2">
                <svg class="h-10 w-10 text-orange-400 group-hover:text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clip-rule="evenodd" />
                  <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
                </svg>
              </div>
              <p class="text-sm text-center text-gray-700 truncate group-hover:text-orange-600">{{ folder.name }}</p>
              <button 
                @click.stop="promptDeleteFolder(folder.name)" 
                class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-white rounded-full shadow hover:bg-red-50"
              >
                <svg class="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <!-- New Folder Button -->
            <div 
              @click="showNewFolderDialog = true"
              class="bg-white border border-gray-200 border-dashed rounded-md p-2 hover:shadow-md cursor-pointer transition-all"
            >
              <div class="aspect-square flex items-center justify-center bg-gray-50 rounded mb-2">
                <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-sm text-center text-gray-500">Nova Carpeta</p>
            </div>
          </div>
        </div>

        <!-- Images Grid -->
        <div v-if="!loading && !error">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Imatges</h3>
          <div v-if="images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div 
              v-for="image in images" 
              :key="image.name"
              class="group relative bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-all"
            >
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img 
                  :src="image.url" 
                  :alt="image.name" 
                  class="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div class="p-2">
                <p class="text-xs text-gray-500 truncate">{{ image.name }}</p>
              </div>
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button 
                  @click="deleteImage(image)"
                  class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="py-10 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
            </svg>
            <p class="mt-2 text-sm text-gray-500">No hi ha imatges en aquesta carpeta</p>
          </div>
        </div>
      </div>
    </div>

    <!-- New Folder Dialog -->
    <div v-if="showNewFolderDialog" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 transition-opacity" @click="showNewFolderDialog = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div class="px-6 py-4">
            <h3 class="text-lg font-medium text-gray-900">Nova Carpeta</h3>
            <div class="mt-4">
              <input 
                type="text" 
                v-model="newFolderName" 
                placeholder="Nom de la carpeta" 
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
              <p v-if="folderError" class="mt-2 text-sm text-red-600">{{ folderError }}</p>
            </div>
          </div>
          <div class="bg-gray-50 px-6 py-3 flex justify-end">
            <button 
              type="button" 
              class="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              @click="showNewFolderDialog = false"
            >
              Cancel·lar
            </button>
            <button 
              type="button" 
              class="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
              @click="createFolder"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 transition-opacity" @click="showDeleteDialog = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div class="px-6 py-4">
            <h3 class="text-lg font-medium text-gray-900">Confirmar Eliminació</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Estàs segur que vols eliminar {{ itemToDelete?.type === 'folder' ? 'la carpeta' : 'aquesta imatge' }}? 
                Aquesta acció no es pot desfer.
              </p>
            </div>
          </div>
          <div class="bg-gray-50 px-6 py-3 flex justify-end">
            <button 
              type="button" 
              class="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              @click="showDeleteDialog = false"
            >
              Cancel·lar
            </button>
            <button 
              type="button" 
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              @click="confirmDelete"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    
    const loading = ref(false);
    const error = ref(null);
    const folders = ref([]);
    const images = ref([]);
    const currentFolder = ref('');
    const dragover = ref(false);
    const uploading = ref(false);
    const uploadProgress = ref(0);
    
    const showNewFolderDialog = ref(false);
    const newFolderName = ref('');
    const folderError = ref('');
    
    const showDeleteDialog = ref(false);
    const itemToDelete = ref(null);
    
    const BUCKET_NAME = 'fotos';
    
    const fetchFolderContents = async (folderPath = '') => {
      try {
        loading.value = true;
        error.value = null;
        
        const { data, error: fetchError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .list(folderPath, {
            sortBy: { column: 'name', order: 'asc' }
          });
        
        if (fetchError) throw fetchError;
        
        folders.value = data
          .filter(item => item.id === null)
          .map(folder => ({ name: folder.name }));
          
        const imageFiles = data.filter(file => 
          file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
        );
        
        images.value = await Promise.all(imageFiles.map(async (file) => {
          const path = folderPath ? `${folderPath}/${file.name}` : file.name;
          const { data: { publicUrl } } = supabase
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(path);
            
          return {
            name: file.name,
            url: publicUrl,
            path: path
          };
        }));
        
      } catch (err) {
        console.error('Error fetching folder contents:', err);
        error.value = err.message || 'Error al carregar el contingut';
      } finally {
        loading.value = false;
      }
    };
    
    const navigateToFolder = (folderName) => {
      const newPath = currentFolder.value 
        ? `${currentFolder.value}/${folderName}`
        : folderName;
      currentFolder.value = newPath;
      fetchFolderContents(newPath);
    };
    
    const handleFileSelect = async (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        await uploadFiles(files);
      }
    };
    
    const handleDrop = async (event) => {
      dragover.value = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        await uploadFiles(files);
      }
    };
    
    const uploadFiles = async (files) => {
      uploading.value = true;
      uploadProgress.value = 0;
      
      try {
        let completed = 0;
        const validFiles = Array.from(files).filter(file => 
          file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
        );
        
        if (validFiles.length === 0) {
          error.value = 'No s\'han seleccionat imatges vàlides';
          return;
        }
        
        for (const file of validFiles) {
          const filepath = currentFolder.value 
            ? `${currentFolder.value}/${file.name}` 
            : file.name;
            
          const { error: uploadError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .upload(filepath, file);
            
          if (uploadError) {
            console.error(`Error uploading ${file.name}:`, uploadError);
          }
          
          completed++;
          uploadProgress.value = (completed / validFiles.length) * 100;
        }
        
        await fetchFolderContents(currentFolder.value);
        
      } catch (err) {
        console.error('Error during upload:', err);
        error.value = 'Error durant la pujada d\'arxius';
      } finally {
        uploading.value = false;
      }
    };
    
    const promptDeleteFolder = (folderName) => {
      itemToDelete.value = { 
        type: 'folder',
        name: folderName,
        path: currentFolder.value 
          ? `${currentFolder.value}/${folderName}` 
          : folderName
      };
      showDeleteDialog.value = true;
    };
    
    const deleteImage = (image) => {
      itemToDelete.value = { 
        type: 'image',
        name: image.name,
        path: image.path
      };
      showDeleteDialog.value = true;
    };
    
    const confirmDelete = async () => {
      if (!itemToDelete.value) return;
      
      try {
        if (itemToDelete.value.type === 'image') {
          const { error: deleteError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .remove([itemToDelete.value.path]);
            
          if (deleteError) throw deleteError;
        } else {
          await deleteFolderRecursively(itemToDelete.value.path);
        }
        
        await fetchFolderContents(currentFolder.value);
        
      } catch (err) {
        console.error('Error al eliminar:', err);
        error.value = `Error al eliminar ${itemToDelete.value.type === 'folder' ? 'la carpeta' : 'la imatge'}`;
      } finally {
        showDeleteDialog.value = false; 
        itemToDelete.value = null;
      }
    };
    
    const deleteFolderRecursively = async (folderPath) => {
      const { data: folderContents, error: listError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list(folderPath, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (listError) throw listError;
      
      for (const item of folderContents) {
        const itemPath = `${folderPath}/${item.name}`;
        
        if (item.id === null) {
          await deleteFolderRecursively(itemPath);
        } else {
          const { error: deleteFileError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .remove([itemPath]);
            
          if (deleteFileError) console.error(`Error deleting file ${itemPath}:`, deleteFileError);
        }
      }
      
      const { error: deleteFolderError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .remove([`${folderPath}/.gitkeep`]);
        
      if (deleteFolderError) {
        const { error: deleteFolderPathError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .remove([`${folderPath}/`]);
          
        if (deleteFolderPathError) {
          console.error(`Error deleting folder ${folderPath}:`, deleteFolderPathError);
        }
      }
    };
    
    const createFolder = async () => {
      if (!newFolderName.value.trim()) {
        folderError.value = 'El nom de la carpeta no pot estar buit';
        return;
      }
      
      if (!/^[a-zA-Z0-9-_]+$/.test(newFolderName.value)) {
        folderError.value = 'Nom no vàlid. Utilitza només lletres, números, guions o guions baixos';
        return;
      }
      
      try {
        const folderPath = currentFolder.value 
          ? `${currentFolder.value}/${newFolderName.value}/.gitkeep` 
          : `${newFolderName.value}/.gitkeep`;
          
        const { error: uploadError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .upload(folderPath, new Blob(['']));
          
        if (uploadError) throw uploadError;
        
        await fetchFolderContents(currentFolder.value);
        showNewFolderDialog.value = false;
        newFolderName.value = '';
        folderError.value = '';
        
      } catch (err) {
        console.error('Error creating folder:', err);
        folderError.value = 'Error al crear la carpeta';
      }
    };
    
    const logout = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      router.push('/login');
    };
    
    const goBack = () => {
      if (!currentFolder.value) return;
      
      const pathSegments = currentFolder.value.split('/');
      pathSegments.pop();
      
      const parentFolder = pathSegments.join('/');
      
      currentFolder.value = parentFolder;
      fetchFolderContents(parentFolder);
    };

    onMounted(() => {
      fetchFolderContents();
    });
    
    return {
      logout,
      loading,
      error,
      folders,
      images,
      currentFolder,
      dragover,
      uploading,
      uploadProgress,
      handleFileSelect,
      handleDrop,
      navigateToFolder,
      deleteImage,
      promptDeleteFolder,
      showNewFolderDialog,
      newFolderName,
      folderError,
      createFolder,
      showDeleteDialog,
      itemToDelete,
      confirmDelete,
      goBack
    };
  },
};
</script>
