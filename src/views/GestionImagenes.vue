<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header Sticky -->
    <div class="sticky top-0 z-40 bg-orange-600 shadow-lg">
      <div class="px-3 py-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1 min-w-0">
            <router-link
              to="/area-privada"
              class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-white active:bg-white active:bg-opacity-20 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <h1 class="text-base font-bold text-white truncate">Gestió d'Imatges</h1>
          </div>
          <button
            @click="logout"
            class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-white active:bg-white active:bg-opacity-20 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-lg mx-auto px-3 py-4">
      <!-- Breadcrumb -->
      <div v-if="currentFolder !== ''" class="flex items-center gap-2 mb-3">
        <button
          @click="goBack"
          class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white shadow-sm text-sm font-semibold text-gray-600 active:bg-gray-50"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Enrere
        </button>
        <span class="text-sm font-medium text-orange-600 truncate">{{ currentFolder }}</span>
      </div>

      <!-- Upload Area -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-2xl p-6 mb-5 text-center bg-white transition"
        @dragover.prevent="dragover = true"
        @dragleave.prevent="dragover = false"
        @drop.prevent="handleDrop($event)"
        :class="{ 'border-orange-500 bg-orange-50': dragover }"
      >
        <div v-if="uploading">
          <div class="flex flex-col items-center justify-center gap-2">
            <div class="animate-spin rounded-full h-9 w-9 border-b-2 border-orange-500"></div>
            <span class="text-sm font-medium text-gray-600">Pujant... {{ Math.round(uploadProgress) }}%</span>
          </div>
        </div>
        <div v-else>
          <svg class="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="mt-2 text-sm text-gray-600">
            Arrossega imatges aquí o
            <label class="cursor-pointer text-orange-600 font-medium">
              <span>selecciona arxius</span>
              <input type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
            </label>
          </p>
          <p class="mt-1 text-xs text-gray-400">PNG, JPG, WEBP fins a 10MB</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <div class="animate-spin rounded-full h-9 w-9 border-b-2 border-orange-500"></div>
        <span class="mt-2 text-sm text-gray-500">Carregant imatges...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 bg-red-50 rounded-xl text-sm text-red-700 mb-4">
        {{ error }}
      </div>

      <template v-else>
        <!-- Folders Section -->
        <div class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Carpetes</h3>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <div
              v-for="folder in folders"
              :key="folder.name"
              @click="navigateToFolder(folder.name)"
              class="relative bg-white rounded-2xl shadow-sm p-2 active:bg-gray-50 transition"
            >
              <div class="aspect-square flex items-center justify-center bg-orange-50 rounded-xl mb-1.5">
                <svg class="h-8 w-8 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clip-rule="evenodd" />
                  <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
                </svg>
              </div>
              <p class="text-xs text-center text-gray-600 truncate">{{ folder.name }}</p>
              <button
                @click.stop="promptDeleteFolder(folder.name)"
                class="absolute top-1 right-1 p-1 bg-white rounded-full shadow text-red-500"
              >
                <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>

            <!-- New Folder Button -->
            <div
              @click="showNewFolderDialog = true"
              class="bg-white rounded-2xl shadow-sm p-2 active:bg-gray-50 transition border border-dashed border-gray-200"
            >
              <div class="aspect-square flex items-center justify-center bg-gray-50 rounded-xl mb-1.5">
                <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-xs text-center text-gray-400">Nova</p>
            </div>
          </div>
        </div>

        <!-- Images Grid -->
        <div>
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Imatges</h3>
          <div v-if="images.length > 0" class="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <div
              v-for="image in images"
              :key="image.name"
              class="relative bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  :src="image.url"
                  :alt="image.name"
                  class="h-full w-full object-cover"
                />
                <button
                  @click="deleteImage(image)"
                  class="absolute top-1 right-1 p-1.5 bg-white bg-opacity-90 rounded-full shadow text-red-500"
                >
                  <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <p class="text-[11px] text-gray-400 truncate px-2 py-1.5">{{ image.name }}</p>
            </div>
          </div>
          <div v-else class="bg-white rounded-2xl shadow-sm py-10 text-center">
            <svg class="mx-auto h-10 w-10 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
            </svg>
            <p class="mt-2 text-sm text-gray-400">No hi ha imatges en aquesta carpeta</p>
          </div>
        </div>
      </template>
    </div>

    <!-- Bottom sheet: Nova Carpeta -->
    <Transition name="sheet">
      <div v-if="showNewFolderDialog" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="showNewFolderDialog = false"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-6" :style="{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }">
          <div class="flex justify-center -mt-2 mb-3 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-gray-300"></div>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-3">Nova Carpeta</h3>
          <input
            type="text"
            v-model="newFolderName"
            placeholder="Nom de la carpeta"
            class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <p v-if="folderError" class="mt-2 text-sm text-red-600">{{ folderError }}</p>
          <div class="flex gap-2 pt-4">
            <button
              @click="showNewFolderDialog = false"
              class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200"
            >
              Cancel·lar
            </button>
            <button
              @click="createFolder"
              class="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold active:bg-orange-700"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Bottom sheet: Confirmar Eliminació -->
    <Transition name="sheet">
      <div v-if="showDeleteDialog" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="showDeleteDialog = false"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-6" :style="{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }">
          <div class="flex justify-center -mt-2 mb-3 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-gray-300"></div>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-3">Confirmar Eliminació</h3>
          <p class="text-sm text-gray-600 mb-4">
            Estàs segur que vols eliminar {{ itemToDelete?.type === 'folder' ? 'la carpeta' : 'aquesta imatge' }}?
            Aquesta acció no es pot desfer.
          </p>
          <div class="flex gap-2">
            <button
              @click="showDeleteDialog = false"
              class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200"
            >
              Cancel·lar
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold active:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api, logout as apiLogout } from '@/api';
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

    const fetchFolderContents = async (folderPath = '') => {
      try {
        loading.value = true;
        error.value = null;

        const data = await api.get('/storage/list', { prefix: folderPath });

        folders.value = data.folders.map(name => ({ name }));
        images.value = data.files;
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

          const formData = new FormData();
          formData.append('file', file);

          try {
            await api.upload('/storage/upload', formData, { path: filepath });
          } catch (uploadError) {
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
          await api.delete('/storage/object', { path: itemToDelete.value.path });
        } else {
          await api.delete('/storage/folder', { path: itemToDelete.value.path });
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
          ? `${currentFolder.value}/${newFolderName.value}`
          : newFolderName.value;

        await api.post('/storage/folder', undefined, { path: folderPath });

        await fetchFolderContents(currentFolder.value);
        showNewFolderDialog.value = false;
        newFolderName.value = '';
        folderError.value = '';

      } catch (err) {
        console.error('Error creating folder:', err);
        folderError.value = 'Error al crear la carpeta';
      }
    };

    const logout = () => {
      apiLogout();
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

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active > div:last-child,
.sheet-leave-active > div:last-child {
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from > div:last-child,
.sheet-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>
