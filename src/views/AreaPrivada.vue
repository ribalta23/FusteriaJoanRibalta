<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header Sticky -->
    <div class="sticky top-0 z-40 bg-orange-600 shadow-lg">
      <div class="px-3 py-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <img class="h-9 w-9 rounded-xl shadow-md flex-shrink-0" src="@/assets/logo.jpg" alt="Logo">
            <div class="min-w-0">
              <h1 class="text-base font-bold text-white truncate leading-tight">Àrea Privada</h1>
              <p class="text-xs text-orange-100 truncate leading-tight">{{ userName }}</p>
            </div>
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

    <!-- Dashboard Content -->
    <div class="max-w-lg mx-auto px-3 py-4 pb-10">
      <!-- Pròximament -->
      <div class="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pròximament</h2>
          <router-link to="/calendari" class="text-xs font-semibold text-orange-600">Veure calendari</router-link>
        </div>
        <template v-if="properEntries.length > 0">
          <div class="text-sm font-bold text-gray-900 capitalize mb-2">{{ properDiaLabel }}</div>
          <div class="space-y-2">
            <div v-for="e in properEntries" :key="e.id" class="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-900 truncate">{{ e.proyectoNombre }}</div>
                <div class="text-xs text-gray-400 truncate">{{ e.usuarioNombre }}</div>
              </div>
            </div>
          </div>
        </template>
        <p v-else class="text-sm text-gray-400">Sense planificació pròxima</p>
      </div>

      <!-- Control i Seguiment -->
      <div class="mb-6">
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Control i seguiment</h2>
        <div class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
          <router-link to="/calendari" class="flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition">
            <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-gray-900">Calendari</div>
              <div class="text-xs text-gray-400 truncate">Planifica dies i setmanes per projecte</div>
            </div>
            <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>

          <router-link to="/projectes" class="flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition">
            <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-gray-900">Projectes</div>
              <div class="text-xs text-gray-400 truncate">Hores, materials i cost</div>
            </div>
            <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>

          <router-link to="/control-usuario" class="flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition">
            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-gray-900">Control Usuari</div>
              <div class="text-xs text-gray-400 truncate">Fitxatge i hores per usuari</div>
            </div>
            <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>

          <router-link to="/informes" class="flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition">
            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4m4-8l3 3m0 0l-3 3m3-3H9" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-gray-900">Informes</div>
              <div class="text-xs text-gray-400 truncate">Informe per usuari o resum mensual de projectes</div>
            </div>
            <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
      </div>

      <!-- Gestió del Sistema -->
      <div>
        <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Gestió del sistema</h2>
        <div class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
          <router-link to="/gestio-imatges" class="flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition">
            <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-gray-900">Gestió d'Imatges</div>
              <div class="text-xs text-gray-400 truncate">Puja i organitza fotos en carpetes</div>
            </div>
            <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>

          <router-link to="/gestio-usuaris" class="flex items-center gap-3 px-4 py-3 active:bg-gray-50 transition">
            <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-gray-900">Gestió d'Usuaris</div>
              <div class="text-xs text-gray-400 truncate">Administra els usuaris del sistema</div>
            </div>
            <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api, logout as apiLogout } from '@/api';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const userName = ref('');
    const properEntries = ref([]);
    const properDiaLabel = ref('');

    const toISO = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const loadPropers = async () => {
      try {
        const todayISO = toISO(new Date());
        const [entries, proyectos, usuarios] = await Promise.all([
          api.get('/planificaciones', { desde: todayISO }),
          api.get('/proyectos'),
          api.get('/users')
        ]);

        if (entries.length === 0) {
          properEntries.value = [];
          return;
        }

        const nextDate = entries[0].fecha;
        properEntries.value = entries
          .filter(e => e.fecha === nextDate)
          .map(e => ({
            ...e,
            proyectoNombre: proyectos.find(p => p.id === e.proyecto_id)?.nombre || 'Projecte eliminat',
            usuarioNombre: usuarios.find(u => u.id === e.user_id)?.nombre || 'Desconegut'
          }));

        const label = new Date(`${nextDate}T00:00:00`).toLocaleDateString('ca-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        properDiaLabel.value = nextDate === todayISO ? `Avui · ${label}` : label;
      } catch (error) {
        console.error('Error carregant pròximes planificacions:', error);
      }
    };

    onMounted(() => {
      userName.value = localStorage.getItem('userFullName') || 'Administrador';
      loadPropers();
    });

    const logout = () => {
      apiLogout();
      router.push('/login');
    };

    return {
      userName,
      properEntries,
      properDiaLabel,
      logout
    };
  },
};
</script>
