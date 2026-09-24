<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header Sticky -->
    <div class="sticky top-0 z-50 bg-orange-600 shadow-lg">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img class="h-10 w-10 rounded-lg shadow-md" src="@/assets/logo.jpg" alt="Logo">
            <div>
              <h1 class="text-base sm:text-lg font-bold text-white">Control Horari</h1>
              <p class="text-xs text-orange-100">{{ userName }} <span v-if="isSuperuser" class="font-medium">(Admin)</span></p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <router-link
              v-if="isSuperuser"
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
    <div class="px-4 py-6 max-w-7xl mx-auto">
      <!-- Fichaje Rápido (Solo Usuarios) -->
      <div v-if="!isSuperuser" class="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-xl rounded-2xl p-6 mb-4">
        <!-- Fichaje activo -->
        <div v-if="activeFichaje">
          <!-- Contador grande con botón -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-3">
              <div class="text-5xl font-bold text-white">
                {{ elapsedTimeFormatted }}
              </div>
              <!-- Punto rojo pulsante -->
              <div class="relative">
                <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div class="absolute inset-0 w-3 h-3 bg-red-500 rounded-full opacity-50 animate-ping"></div>
              </div>
            </div>

            <!-- Botón circular de stop -->
            <button
              @click="stopFichaje"
              class="w-20 h-20 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center shadow-lg transition group"
            >
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2"></rect>
              </svg>
            </button>
          </div>
        </div>

        <!-- Sin fichaje activo -->
        <div v-else class="flex items-center justify-between mb-6">
          <div>
            <div class="text-white text-opacity-70 text-sm mb-1">
              {{ formatDateShort(new Date().toISOString().split('T')[0]) }}
            </div>
            <div class="text-white text-3xl font-bold">{{ todayHours }}</div>
          </div>

          <!-- Botón circular de play -->
          <button
            @click="startFichaje"
            class="w-20 h-20 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center shadow-lg transition group"
          >
            <svg class="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>

        <!-- Barra de progreso -->
        <div class="w-full bg-slate-600 rounded-full h-2 mb-4">
          <div
            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>

        <!-- Resumen semanal -->
        <div class="flex justify-between items-center text-white">
          <span class="text-sm text-white text-opacity-70">Aquesta setmana</span>
          <span class="text-lg font-semibold">
            {{ weeklyHours }} / <span class="text-white text-opacity-50">40h</span>
          </span>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="mb-4">
        <div
          :class="messageType === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'"
          class="p-4 rounded-md border"
        >
          {{ message }}
        </div>
      </div>

      <!-- Accés a Projectes (imputar hores per projecte) -->
      <router-link
        to="/projectes"
        class="block bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition-all active:scale-98 border border-gray-200 mb-3"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0 bg-orange-600 rounded-lg p-3">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900">Projectes</h3>
              <p class="text-sm text-gray-600">Imputa hores i materials a un projecte</p>
            </div>
          </div>
          <svg class="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>

      <!-- Accés al Calendari -->
      <router-link
        to="/calendari"
        class="block bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition-all active:scale-98 border border-gray-200"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0 bg-orange-600 rounded-lg p-3">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900">Calendari</h3>
              <p class="text-sm text-gray-600">Consulta la planificació de la setmana</p>
            </div>
          </div>
          <svg class="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { api, logout as apiLogout } from '@/api';
import { useRouter } from 'vue-router';

export default {
  name: 'ControlHorario',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const message = ref('');
    const messageType = ref('');

    // Fichaje activo
    const activeFichaje = ref(null);
    const elapsedTime = ref('00:00:00');
    const fichajesHoy = ref([]);
    const fichajesSemanales = ref([]);
    let timerInterval = null;
    const userName = ref(localStorage.getItem('userFullName') || localStorage.getItem('userName') || 'Usuari');
    const userRole = ref(localStorage.getItem('userRole') || 'usuario');
    const isSuperuser = ref(userRole.value === 'superusuario');

    const formatDateShort = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('ca-ES', {
        day: 'numeric',
        month: 'short'
      });
    };

    // Formato de tiempo transcurrido: "0h 00m 00s"
    const elapsedTimeFormatted = computed(() => {
      if (!elapsedTime.value) return '0h 00m 00s';
      const parts = elapsedTime.value.split(':');
      const h = parseInt(parts[0]);
      const m = parts[1];
      const s = parts[2];
      return `${h}h ${m}m ${s}s`;
    });

    // Calcular horas trabajadas hoy
    const todayHours = computed(() => {
      let totalSeconds = 0;

      // Sumar fichajes completados de hoy
      fichajesHoy.value.forEach(fichaje => {
        if (fichaje.entry_time && fichaje.exit_time) {
          const [entryH, entryM, entryS = 0] = fichaje.entry_time.split(':').map(Number);
          const [exitH, exitM, exitS = 0] = fichaje.exit_time.split(':').map(Number);

          const entrySeconds = entryH * 3600 + entryM * 60 + entryS;
          const exitSeconds = exitH * 3600 + exitM * 60 + exitS;
          const diffSeconds = exitSeconds - entrySeconds;

          if (diffSeconds > 0) {
            totalSeconds += diffSeconds;
          }
        }
      });

      // Agregar tiempo del fichaje activo si existe
      if (activeFichaje.value && elapsedTime.value) {
        const parts = elapsedTime.value.split(':');
        const h = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        const s = parseInt(parts[2]);
        totalSeconds += (h * 3600 + m * 60 + s);
      }

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    });

    // Calcular horas trabajadas esta semana (SOLO FICHAJES)
    const weeklyHours = computed(() => {
      let totalMinutes = 0;

      // Sumar SOLO fichajes de la semana
      fichajesSemanales.value.forEach(fichaje => {
        if (fichaje.entry_time && fichaje.exit_time) {
          const [entryH, entryM, entryS = 0] = fichaje.entry_time.split(':').map(Number);
          const [exitH, exitM, exitS = 0] = fichaje.exit_time.split(':').map(Number);

          const entrySeconds = entryH * 3600 + entryM * 60 + entryS;
          const exitSeconds = exitH * 3600 + exitM * 60 + exitS;
          const diffSeconds = exitSeconds - entrySeconds;

          if (diffSeconds > 0) {
            totalMinutes += diffSeconds / 60;
          }
        }
      });

      // Agregar tiempo del fichaje activo si existe
      if (activeFichaje.value && elapsedTime.value) {
        const parts = elapsedTime.value.split(':');
        const h = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        const s = parseInt(parts[2]);
        totalMinutes += (h * 60 + m + s / 60);
      }

      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    });

    // Porcentaje de progreso semanal (sobre 40h - SOLO FICHAJES)
    const progressPercentage = computed(() => {
      let totalMinutes = 0;

      // Sumar SOLO fichajes de la semana
      fichajesSemanales.value.forEach(fichaje => {
        if (fichaje.entry_time && fichaje.exit_time) {
          const [entryH, entryM, entryS = 0] = fichaje.entry_time.split(':').map(Number);
          const [exitH, exitM, exitS = 0] = fichaje.exit_time.split(':').map(Number);

          const entrySeconds = entryH * 3600 + entryM * 60 + entryS;
          const exitSeconds = exitH * 3600 + exitM * 60 + exitS;
          const diffSeconds = exitSeconds - entrySeconds;

          if (diffSeconds > 0) {
            totalMinutes += diffSeconds / 60;
          }
        }
      });

      // Agregar tiempo del fichaje activo
      if (activeFichaje.value && elapsedTime.value) {
        const parts = elapsedTime.value.split(':');
        const h = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        const s = parseInt(parts[2]);
        totalMinutes += (h * 60 + m + s / 60);
      }

      const percentage = (totalMinutes / (40 * 60)) * 100;
      return Math.min(percentage, 100);
    });

    const showMessage = (msg, type = 'success') => {
      message.value = msg;
      messageType.value = type;
      setTimeout(() => {
        message.value = '';
      }, 3000);
    };

    const logout = () => {
      apiLogout();
      router.push('/login');
    };

    // ========== FICHAJE RÁPIDO ==========

    // Cargar fichajes del día actual
    const mapFichaje = (f) => ({
      id: f.id,
      date: f.fecha,
      name: userName.value,
      entry_time: f.hora_entrada,
      exit_time: f.hora_salida
    });

    const loadFichajesHoy = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const data = await api.get('/fichajes', { desde: today, hasta: today });
        fichajesHoy.value = data.map(mapFichaje);
      } catch (error) {
        console.error('Error carregant fitxatges d\'avui:', error);
      }
    };

    // Cargar fichajes de toda la semana (lunes a hoy)
    const loadFichajesSemanales = async () => {
      try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lunes
        const startDateStr = startOfWeek.toISOString().split('T')[0];

        const data = await api.get('/fichajes', { desde: startDateStr });
        fichajesSemanales.value = data.map(mapFichaje);
      } catch (error) {
        console.error('Error carregant fitxatges setmanals:', error);
      }
    };

    const updateElapsedTime = () => {
      if (!activeFichaje.value) return;

      const [hours, minutes, seconds = 0] = activeFichaje.value.entry_time.split(':').map(Number);
      const entryDate = new Date();
      entryDate.setHours(hours, minutes, seconds, 0);

      const now = new Date();
      const diff = now - entryDate;

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      elapsedTime.value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const startFichaje = async () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const today = now.toISOString().split('T')[0];
      const entry_time = `${hours}:${minutes}:${seconds}`;

      loading.value = true;
      try {
        // Crear NUEVO fichaje (cada play crea un registro nuevo)
        const newFichaje = await api.post('/fichajes', {
          fecha: today,
          hora_entrada: entry_time
        });

        activeFichaje.value = {
          id: newFichaje.id,
          date: today,
          name: userName.value,
          entry_time: entry_time
        };

        // Guardar en localStorage
        localStorage.setItem('activeFichaje', JSON.stringify(activeFichaje.value));

        // Iniciar contador
        timerInterval = setInterval(updateElapsedTime, 1000);
        updateElapsedTime();

        // Recargar fichajes del día
        await loadFichajesHoy();
        await loadFichajesSemanales();

        showMessage('Fitxatge iniciat correctament!', 'success');
      } catch (error) {
        console.error('Error:', error);
        showMessage('Error al iniciar el fitxatge: ' + error.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    const stopFichaje = async () => {
      if (!activeFichaje.value) return;

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const exit_time = `${hours}:${minutes}:${seconds}`;

      loading.value = true;
      try {
        // Actualizar el fichaje existente con exit_time
        await api.patch(`/fichajes/${activeFichaje.value.id}`, { hora_salida: exit_time });

        // Limpiar fichaje activo
        clearInterval(timerInterval);
        activeFichaje.value = null;
        elapsedTime.value = '00:00:00';
        localStorage.removeItem('activeFichaje');

        // Recargar fichajes del día
        await loadFichajesHoy();
        await loadFichajesSemanales();

        showMessage('Fitxatge finalitzat i registrat correctament!', 'success');
      } catch (error) {
        console.error('Error:', error);
        showMessage('Error al finalitzar el fitxatge: ' + error.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    const loadActiveFichaje = async () => {
      const today = new Date().toISOString().split('T')[0];

      // Primero intentar restaurar desde localStorage
      const saved = localStorage.getItem('activeFichaje');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verificar que el fichaje es de hoy
        if (parsed.date === today) {
          activeFichaje.value = parsed;
          timerInterval = setInterval(updateElapsedTime, 1000);
          updateElapsedTime();
        } else {
          // Limpiar si es de otro día
          localStorage.removeItem('activeFichaje');
        }
      } else {
        // Si no hay en localStorage, buscar en la BD si hay fichaje abierto
        try {
          const openFichajes = await api.get('/fichajes', { desde: today, hasta: today, abierto: true });

          if (openFichajes && openFichajes.length > 0) {
            // Hay un fichaje abierto, restaurarlo
            const fichaje = mapFichaje(openFichajes[0]);
            activeFichaje.value = fichaje;
            localStorage.setItem('activeFichaje', JSON.stringify(activeFichaje.value));
            timerInterval = setInterval(updateElapsedTime, 1000);
            updateElapsedTime();
          }
        } catch (error) {
          console.error('Error buscant fitxatges oberts:', error);
        }
      }

      // Cargar fichajes de hoy
      await loadFichajesHoy();
      await loadFichajesSemanales();
    };

    onMounted(async () => {
      loadActiveFichaje();
    });

    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    });

    return {
      loading,
      message,
      messageType,
      userName,
      isSuperuser,
      activeFichaje,
      elapsedTime,
      elapsedTimeFormatted,
      todayHours,
      weeklyHours,
      progressPercentage,
      startFichaje,
      stopFichaje,
      formatDateShort,
      logout
    };
  }
};
</script>
