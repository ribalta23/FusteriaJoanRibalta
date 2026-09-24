<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-xl shadow-xl overflow-hidden">
        <!-- Header con logo -->
        <div class="bg-orange-600 px-6 py-8 text-center">
          <div class="flex justify-center mb-4">
            <img class="h-16 w-auto rounded-lg shadow-lg" src="@/assets/logo.jpg" alt="Logo">
          </div>
          <h1 class="text-3xl font-bold text-white">Inici de Sessió</h1>
          <p class="text-orange-100 mt-2">Accés al sistema</p>
        </div>

        <!-- Formulario -->
        <div class="px-8 py-8">
          <form @submit.prevent="login" class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">
                Nom d'Usuari
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <input 
                  id="username"
                  v-model="username" 
                  type="text" 
                  required 
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="nom.usuari" 
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                Contrasenya
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <input 
                  id="password"
                  v-model="password" 
                  type="password" 
                  required 
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
                <p class="text-sm text-red-700 font-medium">{{ error }}</p>
              </div>
            </div>

            <button 
              type="submit" 
              :disabled="loading"
              class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!loading">Accedir</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrant...
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { login as apiLogin, fetchMe } from '@/api';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const error = ref('');
    const loading = ref(false);
    const router = useRouter();

    const login = async () => {
      loading.value = true;
      error.value = '';

      try {
        await apiLogin(username.value, password.value);
        const me = await fetchMe();

        localStorage.setItem('userFullName', me.nombre || '');
        localStorage.setItem('userRole', me.rol || 'usuario');
        localStorage.setItem('userName', me.username || '');
        localStorage.setItem('userId', me.id || '');

        if (me.rol === 'superusuario') {
          router.push('/area-privada');
        } else {
          router.push('/control-horario');
        }
      } catch (err) {
        error.value = 'Usuari o contrasenya incorrectes';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    return { username, password, error, loading, login };
  },
};
</script>
