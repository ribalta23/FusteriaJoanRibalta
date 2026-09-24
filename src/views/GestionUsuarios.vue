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
            <h1 class="text-base font-bold text-white truncate">Gestió d'Usuaris</h1>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              @click="openCreateModal"
              class="w-9 h-9 flex items-center justify-center rounded-full text-white active:bg-white active:bg-opacity-20 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              @click="logout"
              class="w-9 h-9 flex items-center justify-center rounded-full text-white active:bg-white active:bg-opacity-20 transition"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-lg mx-auto px-3 py-4">
      <!-- Success/Error Messages -->
      <Transition name="fade">
        <div v-if="message" class="mb-4">
          <div
            :class="messageType === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'"
            class="p-3 rounded-xl border text-sm"
          >
            {{ message }}
          </div>
        </div>
      </Transition>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p class="mt-2 text-gray-500 text-sm">Carregant usuaris...</p>
      </div>

      <!-- Users grouped list -->
      <div v-else-if="users.length > 0" class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
        <div v-for="user in users" :key="user.id" class="px-4 py-3 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
            {{ (user.nombre || user.username || '?').charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-gray-900 truncate">{{ user.nombre || user.username }}</span>
              <span
                :class="user.rol === 'superusuario' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'"
                class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
              >
                {{ user.rol === 'superusuario' ? 'Admin' : 'Usuari' }}
              </span>
            </div>
            <div class="text-xs text-gray-400 truncate">
              @{{ user.username }}<span v-if="user.tarifa_hora != null"> · {{ user.tarifa_hora }} €/h</span>
            </div>
          </div>
          <div class="flex gap-3 flex-shrink-0 text-xs font-semibold">
            <button @click="editUser(user)" class="text-orange-600">Editar</button>
            <button @click="confirmDelete(user)" class="text-red-600">Eliminar</button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <svg class="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <h3 class="mt-3 text-sm font-semibold text-gray-900">No hi ha usuaris</h3>
        <p class="mt-1 text-xs text-gray-400">Els usuaris apareixeran aquí quan es registrin.</p>
      </div>
    </div>

    <!-- Bottom sheet: Crear/Editar Usuari -->
    <Transition name="sheet">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="closeModal"></div>
        <div
          class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full flex flex-col"
          style="max-height: 90vh"
          :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
        >
          <div class="flex justify-center pt-2 sm:hidden flex-shrink-0">
            <div class="w-10 h-1 rounded-full bg-gray-300"></div>
          </div>
          <div class="px-6 pt-4 pb-2 flex-shrink-0">
            <h3 class="text-lg font-bold text-gray-900">{{ isCreating ? 'Crear Nou Usuari' : 'Editar Usuari' }}</h3>
          </div>

          <form @submit.prevent="saveUser" class="px-6 pb-6 space-y-3 overflow-y-auto">
            <div>
              <label for="username" class="block text-xs font-medium text-gray-500 mb-1">Nom d'Usuari *</label>
              <input
                type="text"
                id="username"
                v-model="form.username"
                required
                :disabled="!isCreating"
                placeholder="nom.usuari"
                class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:text-gray-400"
              >
            </div>

            <div>
              <label for="password" class="block text-xs font-medium text-gray-500 mb-1">
                {{ isCreating ? 'Contrasenya *' : 'Nova Contrasenya (opcional)' }}
              </label>
              <input
                type="password"
                id="password"
                v-model="form.password"
                :required="isCreating"
                :placeholder="isCreating ? 'Mínim 6 caràcters' : 'Deixa en blanc per mantenir l\'actual'"
                class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
            </div>

            <div>
              <label for="nombre" class="block text-xs font-medium text-gray-500 mb-1">Nom Complet</label>
              <input
                type="text"
                id="nombre"
                v-model="form.nombre"
                placeholder="Introdueix el nom complet"
                class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
            </div>

            <div>
              <label for="telefono" class="block text-xs font-medium text-gray-500 mb-1">Telèfon</label>
              <input
                type="tel"
                id="telefono"
                v-model="form.telefono"
                placeholder="+34 123 456 789"
                class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="rol" class="block text-xs font-medium text-gray-500 mb-1">Rol *</label>
                <select
                  id="rol"
                  v-model="form.rol"
                  required
                  class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="usuario">Usuari</option>
                  <option value="superusuario">Superusuari</option>
                </select>
              </div>
              <div>
                <label for="tarifa_hora" class="block text-xs font-medium text-gray-500 mb-1">Tarifa/h (€)</label>
                <input
                  type="number"
                  id="tarifa_hora"
                  v-model="form.tarifa_hora"
                  min="0"
                  step="0.01"
                  placeholder="15.00"
                  class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
              </div>
            </div>
            <p class="text-[11px] text-gray-400 -mt-1">La tarifa s'utilitza per calcular el cost de mà d'obra dels projectes.</p>

            <div class="flex gap-2 pt-2">
              <button
                type="button"
                @click="closeModal"
                :disabled="saving"
                class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold active:bg-orange-700 disabled:bg-gray-300"
              >
                {{ saving ? 'Guardant...' : (isCreating ? 'Crear' : 'Guardar') }}
              </button>
            </div>
          </form>
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
      password: '',
      username: '',
      nombre: '',
      telefono: '',
      rol: 'usuario',
      tarifa_hora: ''
    });

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
        users.value = await api.get('/users');
      } catch (error) {
        console.error('Error cargando usuarios:', error);
        showMessage('Error al carregar usuaris: ' + error.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    const openCreateModal = () => {
      isCreating.value = true;
      editingUser.value = null;
      form.value = {
        password: '',
        username: '',
        nombre: '',
        telefono: '',
        rol: 'usuario',
        tarifa_hora: ''
      };
      showModal.value = true;
    };

    const editUser = (user) => {
      isCreating.value = false;
      editingUser.value = user;
      form.value = {
        password: '',
        username: user.username || '',
        nombre: user.nombre || '',
        telefono: user.telefono || '',
        rol: user.rol || 'usuario',
        tarifa_hora: user.tarifa_hora != null ? user.tarifa_hora : ''
      };
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      editingUser.value = null;
      isCreating.value = false;
      form.value = {
        password: '',
        username: '',
        nombre: '',
        telefono: '',
        rol: 'usuario',
        tarifa_hora: ''
      };
    };

    const saveUser = async () => {
      saving.value = true;
      try {
        if (isCreating.value) {
          await api.post('/users', {
            username: form.value.username,
            password: form.value.password,
            nombre: form.value.nombre || '',
            telefono: form.value.telefono || null,
            rol: form.value.rol,
            tarifa_hora: form.value.tarifa_hora !== '' ? form.value.tarifa_hora : null
          });
          showMessage('Usuari creat correctament!', 'success');
        } else {
          const payload = {
            nombre: form.value.nombre || null,
            telefono: form.value.telefono || null,
            rol: form.value.rol,
            tarifa_hora: form.value.tarifa_hora !== '' ? form.value.tarifa_hora : null
          };
          if (form.value.password && form.value.password.trim() !== '') {
            payload.password = form.value.password;
          }
          await api.patch(`/users/${editingUser.value.id}`, payload);
          showMessage('Informació d\'usuari guardada correctament!', 'success');
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
      if (confirm(`Estàs segur que vols eliminar l'usuari "${user.username}"? Aquesta acció no es pot desfer.`)) {
        deleteUser(user.id);
      }
    };

    const deleteUser = async (userId) => {
      loading.value = true;
      try {
        await api.delete(`/users/${userId}`);
        showMessage('Usuari eliminat correctament!', 'success');
        await loadUsers();
      } catch (error) {
        console.error('Error eliminando usuario:', error);
        showMessage('Error al eliminar l\'usuari: ' + error.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    const logout = () => {
      apiLogout();
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
      loadUsers,
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
