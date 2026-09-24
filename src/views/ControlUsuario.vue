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
            <h1 class="text-base font-bold text-white truncate">Control Usuari</h1>
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

    <!-- Main Content -->
    <div class="max-w-lg mx-auto px-3 py-4">
      <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-sm p-4 mb-4">
        <div class="mb-3">
          <label for="usuario" class="block text-xs font-medium text-gray-500 mb-1">Usuari</label>
          <select
            id="usuario"
            v-model="selectedUserId"
            @change="loadFichajes"
            class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">-- Selecciona un usuari --</option>
            <option v-for="user in usuarios" :key="user.id" :value="user.id">
              {{ user.full_name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Període</label>
          <div class="flex bg-gray-100 rounded-xl p-1">
            <button
              @click="filterPeriod = 'week'; loadFichajes()"
              :class="filterPeriod === 'week' ? 'bg-white shadow text-orange-600' : 'text-gray-500'"
              class="flex-1 py-2 rounded-lg text-sm font-semibold transition"
            >
              Setmana
            </button>
            <button
              @click="filterPeriod = 'month'; loadFichajes()"
              :class="filterPeriod === 'month' ? 'bg-white shadow text-orange-600' : 'text-gray-500'"
              class="flex-1 py-2 rounded-lg text-sm font-semibold transition"
            >
              Mes
            </button>
          </div>
        </div>
      </div>

      <template v-if="selectedUserId">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-10">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p class="mt-2 text-gray-500 text-sm">Carregant fitxatges...</p>
        </div>

        <!-- No data -->
        <div v-else-if="fichajesPorDia.length === 0" class="bg-white rounded-2xl shadow-sm p-8 text-center">
          <svg class="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="mt-3 text-sm text-gray-500">No hi ha fitxatges en aquest període</p>
        </div>

        <!-- Results -->
        <template v-else>
          <!-- Resum -->
          <div class="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div class="flex items-center justify-between mb-2">
              <div>
                <div class="text-xs text-gray-400">Total del període</div>
                <div class="text-2xl font-bold text-gray-900">{{ totalHoras }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-400">Progrés</div>
                <div class="text-lg font-bold text-orange-600">{{ totalPercentage.toFixed(0) }}%</div>
              </div>
            </div>
            <div class="bg-gray-100 rounded-full h-2.5">
              <div
                class="h-2.5 rounded-full transition-all duration-300"
                :class="totalPercentage >= 100 ? 'bg-green-500' : 'bg-orange-500'"
                :style="{ width: Math.min(totalPercentage, 100) + '%' }"
              ></div>
            </div>
          </div>

          <!-- Dies (llista agrupada) -->
          <div class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            <button
              v-for="dia in fichajesPorDia"
              :key="dia.date"
              @click="openDayModal(dia.date)"
              class="w-full px-4 py-3 flex items-center gap-3 text-left active:bg-gray-50 transition"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between mb-1.5">
                  <div>
                    <div class="text-sm font-semibold text-gray-900">{{ formatDate(dia.date) }}</div>
                    <div class="text-xs text-gray-400 capitalize">{{ formatDayOfWeek(dia.date) }}</div>
                  </div>
                  <div class="text-right flex-shrink-0 ml-2">
                    <div class="text-base font-bold text-gray-900">{{ dia.totalFormatted }}</div>
                    <div class="text-[11px] text-gray-400">{{ dia.numSessions }} {{ dia.numSessions === 1 ? 'sessió' : 'sessions' }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full"
                      :class="dia.percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'"
                      :style="{ width: Math.min(dia.percentage, 100) + '%' }"
                    ></div>
                  </div>
                  <span
                    :class="{
                      'bg-green-100 text-green-700': dia.approvalStatus === 'all',
                      'bg-yellow-100 text-yellow-700': dia.approvalStatus === 'partial',
                      'bg-gray-100 text-gray-500': dia.approvalStatus === 'none'
                    }"
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 whitespace-nowrap"
                  >
                    {{ dia.approvalStatus === 'all' ? 'Acceptat' : dia.approvalStatus === 'partial' ? dia.acceptedCount + '/' + dia.totalCount : 'Pendent' }}
                  </span>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </template>
      </template>

      <!-- Empty State (cap usuari seleccionat) -->
      <div v-else class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <svg class="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <p class="mt-3 text-sm text-gray-500">Selecciona un usuari per veure els seus fitxatges</p>
      </div>
    </div>

    <!-- Modal (bottom sheet) de fitxatges del dia -->
    <Transition name="sheet">
      <div v-if="showDayModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="closeDayModal"></div>
        <div
          class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-lg w-full sm:my-8 flex flex-col"
          style="max-height: 90vh"
          :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
        >
          <div class="flex justify-center pt-2 sm:hidden flex-shrink-0">
            <div class="w-10 h-1 rounded-full bg-gray-300"></div>
          </div>

          <!-- Header -->
          <div class="px-5 pt-3 pb-3 flex-shrink-0 flex items-center justify-between border-b border-gray-100">
            <div class="min-w-0">
              <h3 class="text-base font-bold text-gray-900 truncate">{{ formatDate(selectedDay) }}</h3>
              <p class="text-xs text-gray-400 truncate capitalize">{{ selectedUser?.full_name }} · {{ formatDayOfWeek(selectedDay) }}</p>
            </div>
            <button @click="closeDayModal" class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 active:bg-gray-100 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-5 py-4 overflow-y-auto flex-1">
            <div v-if="dayFichajes.length === 0" class="text-center py-8 text-sm text-gray-400">
              No hi ha fitxatges per aquest dia
            </div>

            <template v-else>
              <div class="bg-gray-50 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center mb-4">
                <div>
                  <div class="text-[11px] text-gray-400">Sessions</div>
                  <div class="text-lg font-bold text-gray-900">{{ dayFichajes.length }}</div>
                </div>
                <div>
                  <div class="text-[11px] text-gray-400">Total</div>
                  <div class="text-lg font-bold text-orange-600">{{ calculateDayTotal() }}</div>
                </div>
                <div>
                  <div class="text-[11px] text-gray-400">Aprovació</div>
                  <div class="text-sm font-bold" :class="allAccepted() ? 'text-green-600' : 'text-yellow-600'">{{ acceptedCount() }}/{{ dayFichajes.length }}</div>
                </div>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(fichaje, index) in dayFichajes"
                  :key="fichaje.id"
                  class="rounded-2xl overflow-hidden border"
                  :class="{
                    'border-green-200 bg-green-50': fichaje.accepted,
                    'border-yellow-200 bg-yellow-50': fichaje.edited && !fichaje.accepted,
                    'border-gray-100 bg-gray-50': !fichaje.edited && !fichaje.accepted
                  }"
                >
                  <div class="px-4 py-2 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-gray-500">Sessió {{ index + 1 }}</span>
                      <span v-if="fichaje.accepted" class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-600 text-white">Acceptat</span>
                      <span v-if="fichaje.edited" class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-600 text-white">Editat</span>
                    </div>
                    <span class="text-sm font-bold text-gray-700">{{ calculateDuration(fichaje) }}</span>
                  </div>

                  <div class="px-4 pb-4">
                    <div class="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label class="block text-[11px] font-medium text-gray-500 mb-1">Entrada</label>
                        <input
                          type="time"
                          step="1"
                          v-model="fichaje.entry_time"
                          class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <p v-if="fichaje.original_entry_time" class="mt-1 text-[11px] text-blue-600">Original: {{ fichaje.original_entry_time }}</p>
                      </div>
                      <div>
                        <label class="block text-[11px] font-medium text-gray-500 mb-1">Sortida</label>
                        <input
                          type="time"
                          step="1"
                          v-model="fichaje.exit_time"
                          class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <p v-if="fichaje.original_exit_time" class="mt-1 text-[11px] text-blue-600">Original: {{ fichaje.original_exit_time }}</p>
                      </div>
                    </div>

                    <p v-if="fichaje.edited_at" class="text-[11px] text-gray-400 mb-3">
                      Editat per <strong>{{ fichaje.edited_by }}</strong> el {{ formatDateTime(fichaje.edited_at) }}
                    </p>

                    <div class="flex gap-2">
                      <button @click="saveFichaje(fichaje)" class="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold active:bg-blue-700">
                        Guardar
                      </button>
                      <button
                        @click="toggleAccepted(fichaje)"
                        class="flex-1 py-2 rounded-xl text-sm font-semibold"
                        :class="fichaje.accepted ? 'bg-red-100 text-red-700 active:bg-red-200' : 'bg-green-100 text-green-700 active:bg-green-200'"
                      >
                        {{ fichaje.accepted ? 'Rebutjar' : 'Acceptar' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Footer -->
          <div v-if="dayFichajes.length > 0" class="px-5 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
            <button @click="closeDayModal" class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200">
              Tancar
            </button>
            <button
              @click="acceptAllDay"
              :disabled="allAccepted()"
              class="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold active:bg-green-700 disabled:bg-gray-300"
            >
              Acceptar Tot
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { api, logout as apiLogout } from '@/api';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const usuarios = ref([]);
    const selectedUserId = ref('');
    const filterPeriod = ref('week');
    const fichajes = ref([]);
    const loading = ref(false);
    const showDayModal = ref(false);
    const selectedDay = ref('');
    const dayFichajes = ref([]);
    const allUsers = ref([]);

    const selectedUser = computed(() => {
      return usuarios.value.find(u => u.id === selectedUserId.value);
    });

    const fichajesPorDia = computed(() => {
      if (!fichajes.value.length) return [];

      // Agrupar por fecha
      const grouped = {};
      fichajes.value.forEach(fichaje => {
        if (!grouped[fichaje.date]) {
          grouped[fichaje.date] = [];
        }
        grouped[fichaje.date].push(fichaje);
      });

      // Calcular totales por día
      const result = Object.keys(grouped).map(date => {
        const dayFichajes = grouped[date];
        let totalMinutes = 0;
        let numSessions = 0;

        dayFichajes.forEach(fichaje => {
          if (fichaje.entry_time && fichaje.exit_time) {
            const [entryH, entryM, entryS = 0] = fichaje.entry_time.split(':').map(Number);
            const [exitH, exitM, exitS = 0] = fichaje.exit_time.split(':').map(Number);

            const entrySeconds = entryH * 3600 + entryM * 60 + entryS;
            const exitSeconds = exitH * 3600 + exitM * 60 + exitS;
            const diffSeconds = exitSeconds - entrySeconds;

            if (diffSeconds > 0) {
              totalMinutes += diffSeconds / 60;
              numSessions++;
            }
          }
        });

        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        const percentage = (totalMinutes / 480) * 100; // 480 min = 8h

        // Calcular estado de aprobación
        const acceptedCount = dayFichajes.filter(f => f.accepted).length;
        const totalCount = dayFichajes.length;
        let approvalStatus = 'none';
        if (acceptedCount === totalCount) {
          approvalStatus = 'all';
        } else if (acceptedCount > 0) {
          approvalStatus = 'partial';
        }

        return {
          date,
          totalMinutes,
          hours,
          minutes,
          totalFormatted: `${hours}h ${minutes.toString().padStart(2, '0')}m`,
          numSessions,
          percentage,
          acceptedCount,
          totalCount,
          approvalStatus
        };
      });

      // Ordenar por fecha descendente
      result.sort((a, b) => new Date(b.date) - new Date(a.date));

      return result;
    });

    const totalHoras = computed(() => {
      const totalMinutes = fichajesPorDia.value.reduce((sum, dia) => sum + dia.totalMinutes, 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    });

    const totalPercentage = computed(() => {
      const totalMinutes = fichajesPorDia.value.reduce((sum, dia) => sum + dia.totalMinutes, 0);
      const expectedHours = filterPeriod.value === 'week' ? 40 : 160; // 40h/semana, 160h/mes aprox
      return (totalMinutes / (expectedHours * 60)) * 100;
    });

    const nombrePorId = (userId) => {
      const user = allUsers.value.find(u => u.id === userId);
      return user?.full_name || null;
    };

    const mapFichaje = (f) => ({
      id: f.id,
      date: f.fecha,
      entry_time: f.hora_entrada,
      exit_time: f.hora_salida,
      accepted: f.aceptado,
      edited: f.editado,
      original_entry_time: f.hora_entrada_original,
      original_exit_time: f.hora_salida_original,
      edited_at: f.editado_en,
      edited_by: f.editado_por_user_id ? nombrePorId(f.editado_por_user_id) : null
    });

    const loadUsuarios = async () => {
      try {
        const data = await api.get('/users');
        allUsers.value = data.map(u => ({ id: u.id, full_name: u.nombre, username: u.username, role: u.rol }));
        usuarios.value = allUsers.value.filter(u => u.role === 'usuario');

        // Seleccionar automáticamente el primer usuario
        if (usuarios.value.length > 0) {
          selectedUserId.value = usuarios.value[0].id;
          await loadFichajes();
        }
      } catch (error) {
        console.error('Error carregant usuaris:', error);
      }
    };

    const loadFichajes = async () => {
      if (!selectedUserId.value) return;

      loading.value = true;
      try {
        const params = { user_id: selectedUserId.value, abierto: false };

        const now = new Date();
        if (filterPeriod.value === 'week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lunes
          startOfWeek.setHours(0, 0, 0, 0);
          params.desde = startOfWeek.toISOString().split('T')[0];
        } else if (filterPeriod.value === 'month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          params.desde = startOfMonth.toISOString().split('T')[0];
        }

        const data = await api.get('/fichajes', params);
        fichajes.value = data.map(mapFichaje);
      } catch (error) {
        console.error('Error carregant fitxatges:', error);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('ca-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    const formatDayOfWeek = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('ca-ES', {
        weekday: 'long'
      });
    };

    const openDayModal = async (date) => {
      selectedDay.value = date;
      showDayModal.value = true;

      // Cargar fichajes del día seleccionado
      try {
        const data = await api.get('/fichajes', { user_id: selectedUserId.value, desde: date, hasta: date });
        dayFichajes.value = data
          .map(mapFichaje)
          .sort((a, b) => (a.entry_time || '').localeCompare(b.entry_time || ''));
      } catch (error) {
        console.error('Error carregant fitxatges del dia:', error);
      }
    };

    const closeDayModal = () => {
      showDayModal.value = false;
      selectedDay.value = '';
      dayFichajes.value = [];
    };

    const saveFichaje = async (fichaje) => {
      try {
        const actualitzado = await api.patch(`/fichajes/${fichaje.id}/editar`, {
          hora_entrada: fichaje.entry_time,
          hora_salida: fichaje.exit_time
        });

        Object.assign(fichaje, mapFichaje(actualitzado));

        // Recargar fichajes
        await loadFichajes();

        alert('Fitxatge guardat correctament');
      } catch (error) {
        console.error('Error guardant fitxatge:', error);
        alert('Error guardant el fitxatge');
      }
    };

    const toggleAccepted = async (fichaje) => {
      try {
        const newAcceptedValue = !fichaje.accepted;

        await api.patch(`/fichajes/${fichaje.id}/aceptar`, { aceptado: newAcceptedValue });

        // Actualizar localmente
        fichaje.accepted = newAcceptedValue;

        // Recargar fichajes
        await loadFichajes();
      } catch (error) {
        console.error('Error canviant estat d\'acceptació:', error);
        alert('Error canviant l\'estat');
      }
    };

    const formatDateTime = (dateTimeStr) => {
      return new Date(dateTimeStr).toLocaleString('ca-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const calculateDuration = (fichaje) => {
      if (!fichaje.entry_time || !fichaje.exit_time) return '-';

      const [entryH, entryM, entryS = 0] = fichaje.entry_time.split(':').map(Number);
      const [exitH, exitM, exitS = 0] = fichaje.exit_time.split(':').map(Number);

      const entrySeconds = entryH * 3600 + entryM * 60 + entryS;
      const exitSeconds = exitH * 3600 + exitM * 60 + exitS;
      const diffSeconds = exitSeconds - entrySeconds;

      if (diffSeconds <= 0) return '-';

      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);

      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    };

    const calculateDayTotal = () => {
      let totalMinutes = 0;
      dayFichajes.value.forEach(fichaje => {
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

      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    };

    const acceptedCount = () => {
      return dayFichajes.value.filter(f => f.accepted).length;
    };

    const allAccepted = () => {
      return dayFichajes.value.length > 0 && dayFichajes.value.every(f => f.accepted);
    };

    const acceptAllDay = async () => {
      try {
        const updates = dayFichajes.value
          .filter(f => !f.accepted)
          .map(f => api.patch(`/fichajes/${f.id}/aceptar`, { aceptado: true }));

        await Promise.all(updates);

        // Actualizar localmente
        dayFichajes.value.forEach(f => f.accepted = true);

        // Recargar fichajes
        await loadFichajes();
      } catch (error) {
        console.error('Error acceptant tot el dia:', error);
        alert('Error acceptant els fitxatges');
      }
    };

    const logout = () => {
      apiLogout();
      router.push('/login');
    };

    onMounted(() => {
      loadUsuarios();
    });

    return {
      usuarios,
      selectedUserId,
      selectedUser,
      filterPeriod,
      fichajes,
      loading,
      fichajesPorDia,
      totalHoras,
      totalPercentage,
      showDayModal,
      selectedDay,
      dayFichajes,
      loadFichajes,
      openDayModal,
      closeDayModal,
      saveFichaje,
      toggleAccepted,
      calculateDuration,
      calculateDayTotal,
      acceptedCount,
      allAccepted,
      acceptAllDay,
      formatDate,
      formatDayOfWeek,
      formatDateTime,
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
</style>
