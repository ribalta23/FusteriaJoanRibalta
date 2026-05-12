<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header Sticky -->
    <div class="sticky top-0 z-50 bg-orange-600 shadow-lg">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img class="h-10 w-10 rounded-lg shadow-md" src="@/assets/logo.jpg" alt="Logo">
            <div>
              <h1 class="text-lg font-bold text-white">Àrea Privada</h1>
              <p class="text-xs text-orange-100">{{ userName }}</p>
            </div>
          </div>
          <button 
            @click="logout" 
            class="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold text-sm hover:bg-orange-50 transition shadow-md"
          >
            Sortir
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div class="px-4 py-6 pb-20">
      <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-2">
          Panell de Control
        </h2>
        <p class="text-sm text-gray-600">
          Selecciona una opció per gestionar el sistema
        </p>
      </div>

      <!-- Dashboard Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Control Horario Card -->
        <router-link 
          to="/control-horario"
          class="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 border border-gray-200"
        >
          <div class="p-5">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0 bg-orange-600 rounded-lg p-3">
                <svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-gray-900 mb-1">
                  Control Horari
                </h3>
                <p class="text-sm text-gray-600 leading-relaxed">
                  Consulta els registres de tots els empleats i gestiona les hores
                </p>
                <div class="mt-3 flex items-center text-orange-600 font-semibold text-sm">
                  <span>Accedir</span>
                  <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </router-link>

        <!-- Gestión de Imágenes Card -->
        <router-link 
          to="/gestio-imatges"
          class="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 border border-gray-200"
        >
          <div class="p-5">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0 bg-orange-600 rounded-lg p-3">
                <svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-gray-900 mb-1">
                  Gestió d'Imatges
                </h3>
                <p class="text-sm text-gray-600 leading-relaxed">
                  Puja, organitza i elimina les imatges en carpetes
                </p>
                <div class="mt-3 flex items-center text-orange-600 font-semibold text-sm">
                  <span>Accedir</span>
                  <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </router-link>

        <!-- Gestión de Usuarios Card -->
        <router-link 
          to="/gestio-usuaris"
          class="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 border border-gray-200"
        >
          <div class="p-5">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0 bg-orange-600 rounded-lg p-3">
                <svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-gray-900 mb-1">
                  Gestió d'Usuaris
                </h3>
                <p class="text-sm text-gray-600 leading-relaxed">
                  Gestiona la informació dels usuaris del sistema
                </p>
                <div class="mt-3 flex items-center text-orange-600 font-semibold text-sm">
                  <span>Accedir</span>
                  <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </router-link>

        <!-- Gestión de Proyectos Card -->
        <router-link 
          to="/gestio-projectes"
          class="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-98 border border-gray-200"
        >
          <div class="p-5">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0 bg-orange-600 rounded-lg p-3">
                <svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-bold text-gray-900 mb-1">
                  Gestió de Projectes
                </h3>
                <p class="text-sm text-gray-600 leading-relaxed">
                  Gestiona els projectes amb nom, descripció i ubicació
                </p>
                <div class="mt-3 flex items-center text-orange-600 font-semibold text-sm">
                  <span>Accedir</span>
                  <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </router-link>
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
    const userName = ref('');
    
    onMounted(() => {
      userName.value = localStorage.getItem('userFullName') || 'Administrador';
    });
    
    const logout = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      router.push('/login');
    };
    
    return {
      userName,
      logout
    };
  },
};
</script>
