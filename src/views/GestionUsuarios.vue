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
              <h1 class="text-base sm:text-lg font-bold text-white">Gestió d'Usuaris</h1>
              <p class="hidden sm:block text-xs text-orange-100">Administració d'usuaris</p>
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

      <!-- Users List -->
      <div class="bg-white shadow-md rounded-xl p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Llista d'Usuaris</h2>
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
              @click="refreshUsers"
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
          <p class="mt-2 text-gray-600">Carregant usuaris...</p>
        </div>

        <!-- Users Table -->
        <div v-else-if="users.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correu Electrònic
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom d'Usuari
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom Complet
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telèfon
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Registre
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.username || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.full_name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.phone || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="user.role === 'superusuario' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ user.role === 'superusuario' ? 'Superusuari' : 'Usuari' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    @click="editUser(user)"
                    class="text-orange-600 hover:text-orange-900"
                  >
                    Editar
                  </button>
                  <button
                    @click="confirmDelete(user)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hi ha usuaris</h3>
          <p class="mt-1 text-sm text-gray-500">Els usuaris apareixeran aquí quan es registrin.</p>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveUser">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {{ isCreating ? 'Crear Nou Usuari' : 'Editar Informació d\'Usuari' }}
                  </h3>
                  
                  <div class="space-y-4">
                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                        Correu Electrònic <span v-if="isCreating" class="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        v-model="form.email"
                        :disabled="!isCreating"
                        :required="isCreating"
                        placeholder="usuari@example.com"
                        :class="isCreating ? 'bg-white' : 'bg-gray-100 text-gray-500 cursor-not-allowed'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      >
                    </div>

                    <div>
                      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                        {{ isCreating ? 'Contrasenya' : 'Nova Contrasenya (opcional)' }} 
                        <span v-if="isCreating" class="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        v-model="form.password"
                        :required="isCreating"
                        :placeholder="isCreating ? 'Mínim 6 caràcters' : 'Deixa en blanc per mantenir l\'actual'"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      >
                      <p class="mt-1 text-xs text-gray-500">
                        {{ isCreating ? 'La contrasenya ha de tenir mínim 6 caràcters' : 'Si vols canviar la contrasenya, introdueix-ne una de nova (mínim 6 caràcters)' }}
                      </p>
                    </div>

                    <div>
                      <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                        Nom d'Usuari
                      </label>
                      <input
                        type="text"
                        id="username"
                        v-model="form.username"
                        placeholder="nom.usuari"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      >
                    </div>

                    <div>
                      <label for="full_name" class="block text-sm font-medium text-gray-700 mb-1">
                        Nom Complet
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        v-model="form.full_name"
                        placeholder="Introdueix el nom complet"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      >
                    </div>

                    <div>
                      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                        Telèfon
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        v-model="form.phone"
                        placeholder="+34 123 456 789"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      >
                    </div>

                    <div>
                      <label for="role" class="block text-sm font-medium text-gray-700 mb-1">
                        Rol <span class="text-red-500">*</span>
                      </label>
                      <select
                        id="role"
                        v-model="form.role"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="usuario">Usuari</option>
                        <option value="superusuario">Superusuari</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="saving"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"
              >
                {{ saving ? 'Guardant...' : (isCreating ? 'Crear Usuari' : 'Guardar') }}
              </button>
              <button
                type="button"
                @click="closeModal"
                :disabled="saving"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel·lar
              </button>
            </div>
          </form>
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
  name: 'GestionUsuarios',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const saving = ref(false);
    const message = ref('');
    const messageType = ref('');
    const users = ref([]);
    const showModal = ref(false);
    const editingUser = ref(null);
    const isCreating = ref(false);
    
    const form = ref({
      email: '',
      password: '',
      username: '',
      full_name: '',
      phone: '',
      role: 'usuario'
    });

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('ca-ES', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const showMessage = (msg, type = 'success') => {
      message.value = msg;
      messageType.value = type;
      setTimeout(() => {
        message.value = '';
      }, 3000);
    };

    const loadUsers = async () => {
      loading.value = true;
      try {
        const { data, error } = await supabase.rpc('get_all_users_with_profiles');
        
        if (error) throw error;
        
        users.value = data || [];
      } catch (error) {
        console.error('Error cargando usuarios:', error);
        showMessage('Error al carregar usuaris: ' + error.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    const refreshUsers = () => {
      loadUsers();
    };

    const openCreateModal = () => {
      isCreating.value = true;
      editingUser.value = null;
      form.value = {
        email: '',
        password: '',
        username: '',
        full_name: '',
        phone: '',
        role: 'usuario'
      };
      showModal.value = true;
    };

    const editUser = (user) => {
      isCreating.value = false;
      editingUser.value = user;
      form.value = {
        email: user.email,
        password: '',
        username: user.username || '',
        full_name: user.full_name || '',
        phone: user.phone || '',
        role: user.role || 'usuario'
      };
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      editingUser.value = null;
      isCreating.value = false;
      form.value = {
        email: '',
        password: '',
        username: '',
        full_name: '',
        phone: '',
        role: 'usuario'
      };
    };

    const saveUser = async () => {
      saving.value = true;
      try {
        if (isCreating.value) {
          // Crear nuevo usuario
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: form.value.email,
            password: form.value.password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                username: form.value.username || null,
                full_name: form.value.full_name || null,
                phone: form.value.phone || null,
                role: form.value.role
              }
            }
          });

          if (signUpError) throw signUpError;

          // Crear perfil del usuario
          if (authData.user) {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert([{
                id: authData.user.id,
                username: form.value.username || null,
                full_name: form.value.full_name || null,
                phone: form.value.phone || null,
                role: form.value.role
              }]);

            if (profileError) {
              console.error('Error creando perfil:', profileError);
            }
            
            // Intentar confirmar automáticamente el email
            try {
              await supabase.rpc('confirm_user_email', { user_id: authData.user.id });
              showMessage('Usuari creat i verificat correctament!', 'success');
            } catch (confirmError) {
              console.log('No se pudo auto-confirmar:', confirmError);
              showMessage('Usuari creat correctament. Pot iniciar sessió ara mateix.', 'success');
            }
          }
        } else {
          // Editar usuario existente
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', editingUser.value.id)
            .single();

          if (existingProfile) {
            const { error } = await supabase
              .from('user_profiles')
              .update({
                username: form.value.username || null,
                full_name: form.value.full_name || null,
                phone: form.value.phone || null,
                role: form.value.role
              })
              .eq('id', editingUser.value.id);

            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('user_profiles')
              .insert([{
                id: editingUser.value.id,
                username: form.value.username || null,
                full_name: form.value.full_name || null,
                phone: form.value.phone || null,
                role: form.value.role
              }]);

            if (error) throw error;
          }

          // Si hay una nueva contraseña, actualizarla
          if (form.value.password && form.value.password.trim() !== '') {
            const { error: passwordError } = await supabase.rpc('update_user_password', {
              user_id: editingUser.value.id,
              new_password: form.value.password
            });

            if (passwordError) {
              showMessage('Usuari actualitzat però no s\'ha pogut canviar la contrasenya: ' + passwordError.message, 'error');
            } else {
              showMessage('Informació d\'usuari i contrasenya actualitzats correctament!', 'success');
            }
          } else {
            showMessage('Informació d\'usuari guardada correctament!', 'success');
          }
        }

        closeModal();
        await loadUsers();
      } catch (error) {
        console.error('Error guardando usuario:', error);
        showMessage('Error: ' + error.message, 'error');
      } finally {
        saving.value = false;
      }
    };

    const confirmDelete = (user) => {
      if (confirm(`Estàs segur que vols eliminar l'usuari "${user.email}"? Aquesta acció no es pot desfer.`)) {
        deleteUser(user.id);
      }
    };

    const deleteUser = async (userId) => {
      loading.value = true;
      try {
        const { error } = await supabase.rpc('delete_user_admin', {
          user_id: userId
        });

        if (error) throw error;

        showMessage('Usuari eliminat correctament!', 'success');
        await loadUsers();
      } catch (error) {
        console.error('Error eliminando usuario:', error);
        showMessage('Error al eliminar l\'usuari: ' + error.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    const logout = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      router.push('/login');
    };

    onMounted(() => {
      loadUsers();
    });

    return {
      loading,
      saving,
      message,
      messageType,
      users,
      showModal,
      editingUser,
      isCreating,
      form,
      formatDate,
      loadUsers,
      refreshUsers,
      openCreateModal,
      editUser,
      closeModal,
      saveUser,
      confirmDelete,
      deleteUser,
      logout
    };
  }
};
</script>
