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
              <h1 class="text-base sm:text-lg font-bold text-white">Gestió de Projectes</h1>
              <p class="hidden sm:block text-xs text-orange-100">Administració de projectes</p>
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

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 px-4">
      <!-- Success/Error Messages -->
      <div v-if="message" class="mb-6">
        <div 
          :class="messageType === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'"
          class="p-4 rounded-md border"
        >
          {{ message }}
        </div>
      </div>

      <!-- Projects List -->
      <div class="bg-white shadow-md rounded-xl p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Llista de Projectes</h2>
          <div class="flex flex-wrap gap-2">
            <button
              @click="openCreateModal"
              class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition"
            >
              <svg class="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Crear
            </button>
            <button
              @click="loadProjects"
              :disabled="loading"
              class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition disabled:bg-gray-100"
            >
              <svg class="inline-block w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span class="hidden sm:inline">Actualitzar</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p class="mt-2 text-gray-600">Carregant projectes...</p>
        </div>

        <!-- Projects Table (Desktop) -->
        <div v-else-if="projects.length > 0">
          <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripció
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lloc
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="project in projects" :key="project.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">
                    {{ project.nombre }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">
                    {{ project.descripcion || '-' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ project.lugar || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      @click="editProject(project)"
                      class="text-orange-600 hover:text-orange-900"
                    >
                      Editar
                    </button>
                    <button
                      @click="confirmDelete(project)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Projects Cards (Mobile) -->
          <div class="lg:hidden space-y-4">
            <div v-for="project in projects" :key="project.id" class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div class="space-y-2">
                <h3 class="text-lg font-bold text-gray-900">{{ project.nombre }}</h3>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Descripció:</span> {{ project.descripcion || '-' }}
                </p>
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Lloc:</span> {{ project.lugar || '-' }}
                </p>
                <div class="flex gap-2 pt-2">
                  <button
                    @click="editProject(project)"
                    class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition"
                  >
                    Editar
                  </button>
                  <button
                    @click="confirmDelete(project)"
                    class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hi ha projectes</h3>
          <p class="mt-1 text-sm text-gray-500">Comença creant el teu primer projecte.</p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full">
        <div class="bg-orange-600 px-6 py-4 rounded-t-xl">
          <h3 class="text-xl font-bold text-white">
            {{ editingProject ? 'Editar Projecte' : 'Crear Nou Projecte' }}
          </h3>
        </div>
        
        <form @submit.prevent="saveProject" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nom del Projecte *
            </label>
            <input
              v-model="form.nombre"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Nom del projecte"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Descripció
            </label>
            <textarea
              v-model="form.descripcion"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Descripció del projecte"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Lloc
            </label>
            <input
              v-model="form.lugar"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ubicació del projecte"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition disabled:bg-gray-400"
            >
              {{ saving ? 'Guardant...' : (editingProject ? 'Actualitzar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Confirmar Eliminació</h3>
        <p class="text-sm text-gray-600 mb-6">
          Estàs segur que vols eliminar el projecte <strong>{{ projectToDelete?.nombre }}</strong>? Aquesta acció no es pot desfer.
        </p>
        <div class="flex gap-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel·lar
          </button>
          <button
            @click="deleteProject"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
          >
            Eliminar
          </button>
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
    const projects = ref([]);
    const loading = ref(false);
    const saving = ref(false);
    const showModal = ref(false);
    const showDeleteModal = ref(false);
    const editingProject = ref(null);
    const projectToDelete = ref(null);
    const message = ref('');
    const messageType = ref('success');

    const form = ref({
      nombre: '',
      descripcion: '',
      lugar: ''
    });

    const loadProjects = async () => {
      loading.value = true;
      try {
        const { data, error } = await supabase
          .from('proyectos')
          .select('*')
          .order('nombre', { ascending: true });

        if (error) throw error;
        projects.value = data || [];
      } catch (error) {
        console.error('Error carregant projectes:', error);
        showMessage('Error carregant els projectes', 'error');
      } finally {
        loading.value = false;
      }
    };

    const openCreateModal = () => {
      editingProject.value = null;
      form.value = {
        nombre: '',
        descripcion: '',
        lugar: ''
      };
      showModal.value = true;
    };

    const editProject = (project) => {
      editingProject.value = project;
      form.value = {
        nombre: project.nombre,
        descripcion: project.descripcion,
        lugar: project.lugar
      };
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      editingProject.value = null;
      form.value = {
        nombre: '',
        descripcion: '',
        lugar: ''
      };
    };

    const saveProject = async () => {
      saving.value = true;
      try {
        if (editingProject.value) {
          // Update existing project
          const { error } = await supabase
            .from('proyectos')
            .update({
              nombre: form.value.nombre,
              descripcion: form.value.descripcion,
              lugar: form.value.lugar
            })
            .eq('id', editingProject.value.id);

          if (error) throw error;
          showMessage('Projecte actualitzat correctament', 'success');
        } else {
          // Create new project
          const { error } = await supabase
            .from('proyectos')
            .insert([{
              nombre: form.value.nombre,
              descripcion: form.value.descripcion,
              lugar: form.value.lugar
            }]);

          if (error) throw error;
          showMessage('Projecte creat correctament', 'success');
        }

        closeModal();
        await loadProjects();
      } catch (error) {
        console.error('Error guardant projecte:', error);
        showMessage('Error guardant el projecte', 'error');
      } finally {
        saving.value = false;
      }
    };

    const confirmDelete = (project) => {
      projectToDelete.value = project;
      showDeleteModal.value = true;
    };

    const deleteProject = async () => {
      try {
        const { error } = await supabase
          .from('proyectos')
          .delete()
          .eq('id', projectToDelete.value.id);

        if (error) throw error;

        showMessage('Projecte eliminat correctament', 'success');
        showDeleteModal.value = false;
        projectToDelete.value = null;
        await loadProjects();
      } catch (error) {
        console.error('Error eliminant projecte:', error);
        showMessage('Error eliminant el projecte', 'error');
      }
    };

    const showMessage = (text, type) => {
      message.value = text;
      messageType.value = type;
      setTimeout(() => {
        message.value = '';
      }, 5000);
    };

    const logout = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      router.push('/login');
    };

    onMounted(() => {
      loadProjects();
    });

    return {
      projects,
      loading,
      saving,
      showModal,
      showDeleteModal,
      editingProject,
      projectToDelete,
      message,
      messageType,
      form,
      loadProjects,
      openCreateModal,
      editProject,
      closeModal,
      saveProject,
      confirmDelete,
      deleteProject,
      logout
    };
  }
};
</script>
