<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header Sticky -->
    <div class="sticky top-0 z-40 bg-orange-600 shadow-lg">
      <div class="px-3 py-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1 min-w-0">
            <router-link
              :to="isSuperuser ? '/area-privada' : '/control-horario'"
              class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-white active:bg-white active:bg-opacity-20 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <h1 class="text-base font-bold text-white truncate">Calendari</h1>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              v-if="isSuperuser"
              @click="openCreateModal(new Date())"
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

      <!-- Navegació setmanal -->
      <div class="flex items-center justify-between bg-white rounded-2xl shadow-sm p-2 mb-4">
        <button @click="prevWeek" class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 active:bg-gray-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button @click="goToday" class="text-sm font-semibold text-gray-900">
          {{ weekRangeLabel }}
        </button>
        <button @click="nextWeek" class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 active:bg-gray-100">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p class="mt-2 text-gray-500 text-sm">Carregant calendari...</p>
      </div>

      <!-- Dies de la setmana -->
      <div v-else class="space-y-3">
        <div
          v-for="day in weekDays"
          :key="toISO(day)"
          class="bg-white rounded-2xl shadow-sm overflow-hidden"
          :class="{ 'ring-2 ring-orange-400': isToday(day) }"
        >
          <div class="px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
            <div>
              <span class="text-sm font-bold text-gray-900 capitalize">{{ formatDayName(day) }}</span>
              <span class="text-xs text-gray-400 ml-1.5">{{ formatDayShort(day) }}</span>
              <span v-if="isToday(day)" class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700">Avui</span>
            </div>
            <button v-if="isSuperuser" @click="openCreateModal(day)" class="w-7 h-7 flex items-center justify-center rounded-full text-orange-600 active:bg-orange-50">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div v-if="entriesForDay(day).length === 0" class="px-4 py-3 text-xs text-gray-300">
            Sense planificació
          </div>
          <div v-else class="divide-y divide-gray-50">
            <div
              v-for="entry in entriesForDay(day)"
              :key="entry.id"
              @click="isSuperuser && editEntry(entry)"
              class="px-4 py-2.5 flex items-center justify-between gap-2"
              :class="{ 'active:bg-gray-50': isSuperuser }"
            >
              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-900 truncate">{{ nombreProjecte(entry.proyecto_id) }}</div>
                <div class="text-xs text-gray-400 truncate">
                  {{ nombreUsuari(entry.user_id) }}<span v-if="entry.comentario"> · {{ entry.comentario }}</span>
                </div>
              </div>
              <button v-if="isSuperuser" @click.stop="deleteEntry(entry.id)" class="text-red-500 text-xs font-semibold flex-shrink-0">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom sheet: Crear/Editar planificació -->
    <Transition name="sheet">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="showModal = false"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full" :style="{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }">
          <div class="flex justify-center pt-2 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-gray-300"></div>
          </div>
          <div class="px-6 pt-4 pb-2">
            <h3 class="text-lg font-bold text-gray-900">{{ editingEntry ? 'Editar planificació' : 'Nova planificació' }}</h3>
          </div>

          <form @submit.prevent="saveEntry" class="p-6 pt-2 space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Data *</label>
              <input v-model="form.fecha" type="date" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Projecte *</label>
              <select v-model="form.proyecto_id" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="">-- Selecciona un projecte --</option>
                <option v-for="p in proyectos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Treballador *</label>
              <select v-model="form.user_id" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="">-- Selecciona un treballador --</option>
                <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Comentari</label>
              <textarea v-model="form.comentario" rows="2" placeholder="Ex: muntatge cuina, mesures, entrega..." class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"></textarea>
            </div>

            <div class="flex gap-2 pt-1">
              <button
                v-if="editingEntry"
                type="button"
                @click="deleteEntry(editingEntry.id); showModal = false"
                class="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 active:bg-red-100"
              >
                Eliminar
              </button>
              <button type="button" @click="showModal = false" class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200">
                Cancel·lar
              </button>
              <button type="submit" :disabled="saving" class="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold active:bg-orange-700 disabled:bg-gray-300">
                {{ saving ? 'Guardant...' : (editingEntry ? 'Actualitzar' : 'Afegir') }}
              </button>
            </div>
          </form>
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
  name: 'Calendari',
  setup() {
    const router = useRouter();
    const userRole = ref(localStorage.getItem('userRole') || 'usuario');
    const isSuperuser = ref(userRole.value === 'superusuario');

    const proyectos = ref([]);
    const usuarios = ref([]);
    const entries = ref([]);
    const loading = ref(false);
    const saving = ref(false);
    const message = ref('');
    const messageType = ref('success');

    const showModal = ref(false);
    const editingEntry = ref(null);
    const form = ref({ fecha: '', proyecto_id: '', user_id: '', comentario: '' });

    const getMonday = (d) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const weekStart = ref(getMonday(new Date()));

    const weekDays = computed(() => {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart.value);
        d.setDate(d.getDate() + i);
        days.push(d);
      }
      return days;
    });

    const toISO = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const isToday = (d) => toISO(d) === toISO(new Date());

    const weekRangeLabel = computed(() => {
      const start = weekDays.value[0];
      const end = weekDays.value[6];
      const opts = { day: 'numeric', month: 'short' };
      return `${start.toLocaleDateString('ca-ES', opts)} - ${end.toLocaleDateString('ca-ES', opts)}`;
    });

    const formatDayName = (d) => d.toLocaleDateString('ca-ES', { weekday: 'long' });
    const formatDayShort = (d) => d.toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });

    const entriesForDay = (day) => {
      const iso = toISO(day);
      return entries.value.filter(e => e.fecha === iso);
    };

    const nombreProjecte = (id) => proyectos.value.find(p => p.id === id)?.nombre || 'Projecte eliminat';
    const nombreUsuari = (id) => usuarios.value.find(u => u.id === id)?.nombre || 'Desconegut';

    const showMessage = (text, type = 'success') => {
      message.value = text;
      messageType.value = type;
      setTimeout(() => { message.value = ''; }, 4000);
    };

    const loadEntries = async () => {
      loading.value = true;
      try {
        const desde = toISO(weekDays.value[0]);
        const hasta = toISO(weekDays.value[6]);
        entries.value = await api.get('/planificaciones', { desde, hasta });
      } catch (error) {
        console.error('Error carregant calendari:', error);
        showMessage('Error al carregar el calendari', 'error');
      } finally {
        loading.value = false;
      }
    };

    const loadProyectos = async () => {
      try {
        proyectos.value = await api.get('/proyectos');
      } catch (error) {
        console.error('Error carregant projectes:', error);
      }
    };

    const loadUsuarios = async () => {
      try {
        usuarios.value = await api.get('/users/basico');
      } catch (error) {
        console.error('Error carregant usuaris:', error);
      }
    };

    const prevWeek = () => {
      const d = new Date(weekStart.value);
      d.setDate(d.getDate() - 7);
      weekStart.value = d;
      loadEntries();
    };

    const nextWeek = () => {
      const d = new Date(weekStart.value);
      d.setDate(d.getDate() + 7);
      weekStart.value = d;
      loadEntries();
    };

    const goToday = () => {
      weekStart.value = getMonday(new Date());
      loadEntries();
    };

    const openCreateModal = (day) => {
      editingEntry.value = null;
      form.value = { fecha: toISO(day), proyecto_id: '', user_id: '', comentario: '' };
      showModal.value = true;
    };

    const editEntry = (entry) => {
      editingEntry.value = entry;
      form.value = {
        fecha: entry.fecha,
        proyecto_id: entry.proyecto_id,
        user_id: entry.user_id,
        comentario: entry.comentario || ''
      };
      showModal.value = true;
    };

    const saveEntry = async () => {
      saving.value = true;
      try {
        const payload = {
          fecha: form.value.fecha,
          proyecto_id: form.value.proyecto_id,
          user_id: form.value.user_id,
          comentario: form.value.comentario || null
        };
        if (editingEntry.value) {
          await api.patch(`/planificaciones/${editingEntry.value.id}`, payload);
          showMessage('Planificació actualitzada', 'success');
        } else {
          await api.post('/planificaciones', payload);
          showMessage('Planificació afegida', 'success');
        }
        showModal.value = false;
        await loadEntries();
      } catch (error) {
        console.error('Error guardant planificació:', error);
        showMessage('Error: ' + error.message, 'error');
      } finally {
        saving.value = false;
      }
    };

    const deleteEntry = async (id) => {
      if (!confirm('Estàs segur que vols eliminar aquesta planificació?')) return;
      try {
        await api.delete(`/planificaciones/${id}`);
        showMessage('Planificació eliminada', 'success');
        await loadEntries();
      } catch (error) {
        console.error('Error eliminant planificació:', error);
        showMessage('Error: ' + error.message, 'error');
      }
    };

    const logout = () => {
      apiLogout();
      router.push('/login');
    };

    onMounted(async () => {
      await Promise.all([loadProyectos(), loadUsuarios(), loadEntries()]);
    });

    return {
      isSuperuser,
      proyectos,
      usuarios,
      loading,
      saving,
      message,
      messageType,
      showModal,
      editingEntry,
      form,
      weekDays,
      weekRangeLabel,
      toISO,
      isToday,
      formatDayName,
      formatDayShort,
      entriesForDay,
      nombreProjecte,
      nombreUsuari,
      prevWeek,
      nextWeek,
      goToday,
      openCreateModal,
      editEntry,
      saveEntry,
      deleteEntry,
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
