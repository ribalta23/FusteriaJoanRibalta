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
            <h1 class="text-base font-bold text-white truncate">Informes</h1>
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
      <!-- Tipus d'informe -->
      <div class="grid grid-cols-2 gap-1 bg-white rounded-2xl shadow-sm p-1 mb-4">
        <button
          v-for="t in tipusInforme"
          :key="t.value"
          @click="canviarTipus(t.value)"
          class="py-2 rounded-xl text-sm font-semibold transition"
          :class="tipus === t.value ? 'bg-orange-600 text-white' : 'text-gray-500 active:bg-gray-50'"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl shadow-sm p-4 mb-4">
        <div v-if="tipus === 'usuari'" class="mb-3">
          <label class="block text-xs font-medium text-gray-500 mb-1">Usuari</label>
          <select
            v-model="selectedUserId"
            @change="loadReport"
            class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">-- Selecciona un usuari --</option>
            <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.full_name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Mes</label>
          <input
            type="month"
            v-model="selectedMonth"
            @change="loadActual"
            class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      <template v-if="tipus === 'usuari' && selectedUserId">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-10">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p class="mt-2 text-gray-500 text-sm">Carregant informe...</p>
        </div>

        <template v-else>
          <!-- Resum -->
          <div class="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Resum del mes</h2>
            <div class="grid grid-cols-2 gap-3 text-center">
              <div>
                <div class="text-[11px] text-gray-400 mb-0.5">Fitxatge</div>
                <div class="text-lg font-bold text-gray-900">{{ totalFitxatgeMesFormatted }}</div>
              </div>
              <div class="bg-orange-50 rounded-xl py-1.5">
                <div class="text-[11px] text-orange-500 mb-0.5">Hores projecte</div>
                <div class="text-lg font-bold text-orange-700">{{ totalHoresProjecteMes.toFixed(2) }}h</div>
              </div>
            </div>
          </div>

          <!-- Fitxatge del mes -->
          <div class="mb-4">
            <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Fitxatge del mes</h2>
            <div v-if="fichajesPorDia.length === 0" class="bg-white rounded-2xl shadow-sm p-6 text-center text-sm text-gray-400">
              Sense fitxatges aquest mes
            </div>
            <div v-else class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
              <div v-for="dia in fichajesPorDia" :key="dia.date" class="px-4 py-3">
                <div class="flex items-center justify-between mb-1.5">
                  <div>
                    <div class="text-sm font-semibold text-gray-900">{{ formatDate(dia.date) }}</div>
                    <div class="text-xs text-gray-400 capitalize">{{ formatDayOfWeek(dia.date) }}</div>
                  </div>
                  <div class="text-base font-bold text-gray-900">{{ dia.totalFormatted }}</div>
                </div>
                <div class="space-y-1">
                  <div v-for="s in dia.sessions" :key="s.id" class="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                    <span>{{ s.hora_entrada || '-' }} → {{ s.hora_salida || '-' }}</span>
                    <span class="font-medium text-gray-700">{{ calcularDuracio(s) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Hores per projecte -->
          <div class="mb-4">
            <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Hores per projecte</h2>
            <div v-if="horesPerProjecte.length === 0" class="bg-white rounded-2xl shadow-sm p-6 text-center text-sm text-gray-400">
              Sense hores de projecte aquest mes
            </div>
            <div v-else class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
              <div v-for="grup in horesPerProjecte" :key="grup.proyecto_id || 'sense'">
                <button
                  @click="toggleExpanded(grup.proyecto_id)"
                  class="w-full px-4 py-3 flex items-center justify-between gap-2 text-left active:bg-gray-50 transition"
                >
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-gray-900 truncate">{{ nombreProjecte(grup.proyecto_id) }}</div>
                    <div class="text-xs text-gray-400">{{ grup.entries.length }} {{ grup.entries.length === 1 ? 'registre' : 'registres' }}</div>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="text-sm font-bold text-orange-600">{{ grup.total.toFixed(2) }}h</span>
                    <svg class="w-4 h-4 text-gray-300 transition-transform" :class="{ 'rotate-90': expandedProjecte === grup.proyecto_id }" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                <div v-if="expandedProjecte === grup.proyecto_id" class="px-4 pb-3 space-y-1">
                  <div v-for="e in grup.entries" :key="e.id" class="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                    <span class="truncate">{{ formatDate(e.fecha) }}<span v-if="e.comentario"> · {{ e.comentario }}</span></span>
                    <span class="font-medium text-gray-700 flex-shrink-0 ml-2">{{ e.horas }}h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Descarrega -->
          <button
            @click="downloadInforme"
            :disabled="downloadingInforme"
            class="w-full flex items-center justify-center gap-2 bg-orange-600 text-white rounded-2xl shadow-sm py-3 text-sm font-bold active:bg-orange-700 disabled:bg-gray-300"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ downloadingInforme ? 'Generant...' : 'Descarrega informe PDF' }}
          </button>
        </template>
      </template>

      <!-- Empty State -->
      <div v-else-if="tipus === 'usuari'" class="bg-white rounded-2xl shadow-sm p-8 text-center">
        <svg class="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4m4-8l3 3m0 0l-3 3m3-3H9"></path>
        </svg>
        <p class="mt-3 text-sm text-gray-500">Selecciona un usuari per generar el seu informe</p>
      </div>

      <!-- Resum mensual: què s'ha fet i on -->
      <template v-if="tipus === 'mensual'">
        <div v-if="loadingMensual" class="text-center py-10">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p class="mt-2 text-gray-500 text-sm">Carregant resum...</p>
        </div>

        <template v-else>
          <!-- Resum -->
          <div class="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Resum del mes</h2>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="bg-orange-50 rounded-xl py-1.5">
                <div class="text-[11px] text-orange-500 mb-0.5">Hores</div>
                <div class="text-lg font-bold text-orange-700">{{ totalHoresMensual.toFixed(2) }}h</div>
              </div>
              <div>
                <div class="text-[11px] text-gray-400 mb-0.5">Projectes</div>
                <div class="text-lg font-bold text-gray-900">{{ projectesMensual.filter(p => p.proyecto_id).length }}</div>
              </div>
              <div>
                <div class="text-[11px] text-gray-400 mb-0.5">Treballadors</div>
                <div class="text-lg font-bold text-gray-900">{{ treballadorsMensual.length }}</div>
              </div>
            </div>
          </div>

          <!-- Per projecte / lloc -->
          <div class="mb-4">
            <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Projectes i llocs</h2>
            <div v-if="projectesMensual.length === 0" class="bg-white rounded-2xl shadow-sm p-6 text-center text-sm text-gray-400">
              No s'ha registrat feina aquest mes
            </div>
            <div v-else class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
              <div v-for="p in projectesMensual" :key="p.proyecto_id || 'sense'">
                <button
                  @click="toggleExpanded(p.proyecto_id)"
                  class="w-full px-4 py-3 flex items-center justify-between gap-2 text-left active:bg-gray-50 transition"
                >
                  <div class="min-w-0">
                    <div class="text-sm font-semibold text-gray-900 truncate">{{ nombreProjecte(p.proyecto_id) }}</div>
                    <div class="text-xs text-gray-400 truncate">
                      <span v-if="p.lugar">📍 {{ p.lugar }}</span>
                      <span v-if="p.lugar && p.carpeta"> · </span>
                      <span v-if="p.carpeta">{{ p.carpeta }}</span>
                      <span v-if="!p.lugar && !p.carpeta">{{ p.dies }} {{ p.dies === 1 ? 'dia' : 'dies' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="text-sm font-bold text-orange-600">{{ p.total.toFixed(2) }}h</span>
                    <svg class="w-4 h-4 text-gray-300 transition-transform" :class="{ 'rotate-90': expandedProjecte === p.proyecto_id }" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                <div v-if="expandedProjecte === p.proyecto_id" class="px-4 pb-3 space-y-2">
                  <div v-if="p.treballadors.length" class="flex flex-wrap gap-1">
                    <span v-for="t in p.treballadors" :key="t.user_id" class="text-[11px] bg-orange-50 text-orange-700 rounded-full px-2 py-0.5">
                      {{ nombreUsuario(t.user_id) }} · {{ t.horas.toFixed(2) }}h
                    </span>
                  </div>
                  <div class="space-y-1">
                    <div v-for="e in p.entries" :key="e.id" class="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                      <span class="truncate">{{ formatDate(e.fecha) }} · {{ nombreUsuario(e.user_id) }}<span v-if="e.comentario"> · {{ e.comentario }}</span></span>
                      <span class="font-medium text-gray-700 flex-shrink-0 ml-2">{{ e.horas }}h</span>
                    </div>
                  </div>
                  <div v-if="p.materials.length">
                    <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Materials afegits</div>
                    <div v-for="m in p.materials" :key="m.id" class="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 mb-1">
                      <span class="truncate">{{ nombreMaterial(m.material_id) }}</span>
                      <span class="font-medium text-gray-700 flex-shrink-0 ml-2">{{ Number(m.cantidad) }} {{ unitatMaterial(m.material_id) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Per treballador -->
          <div v-if="treballadorsMensual.length" class="mb-4">
            <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-2">Per treballador</h2>
            <div class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
              <div v-for="t in treballadorsMensual" :key="t.user_id" class="px-4 py-3 flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 truncate">{{ nombreUsuario(t.user_id) }}</div>
                  <div class="text-xs text-gray-400 truncate">{{ t.projectes.map(nombreProjecte).join(', ') }}</div>
                </div>
                <span class="text-sm font-bold text-orange-600 flex-shrink-0">{{ t.horas.toFixed(2) }}h</span>
              </div>
            </div>
          </div>

          <button
            @click="downloadInformeMensual"
            :disabled="downloadingInforme || projectesMensual.length === 0"
            class="w-full flex items-center justify-center gap-2 bg-orange-600 text-white rounded-2xl shadow-sm py-3 text-sm font-bold active:bg-orange-700 disabled:bg-gray-300"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ downloadingInforme ? 'Generant...' : 'Descarrega resum mensual PDF' }}
          </button>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { api, logout as apiLogout } from '@/api';
import { useRouter } from 'vue-router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '@/utils/informe';

export default {
  name: 'GeneracioInformes',
  setup() {
    const router = useRouter();
    const usuarios = ref([]);
    const proyectos = ref([]);
    const selectedUserId = ref('');
    const selectedMonth = ref(new Date().toISOString().slice(0, 7));
    const fichajes = ref([]);
    const horas = ref([]);
    const loading = ref(false);
    const downloadingInforme = ref(false);
    const expandedProjecte = ref(undefined);
    const tipusInforme = [
      { value: 'usuari', label: 'Per usuari' },
      { value: 'mensual', label: 'Resum mensual' }
    ];
    const tipus = ref('usuari');
    const carpetas = ref([]);
    const materiales = ref([]);
    const horasMes = ref([]);
    const materialsMes = ref([]);
    const loadingMensual = ref(false);

    const monthRange = computed(() => {
      const [year, month] = selectedMonth.value.split('-').map(Number);
      const desde = `${selectedMonth.value}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const hasta = `${selectedMonth.value}-${String(lastDay).padStart(2, '0')}`;
      return { desde, hasta };
    });

    const formatMinuts = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    };

    const calcularDuracio = (fichaje) => {
      if (!fichaje.hora_entrada || !fichaje.hora_salida) return '-';
      const [eh, em, es = 0] = fichaje.hora_entrada.split(':').map(Number);
      const [xh, xm, xs = 0] = fichaje.hora_salida.split(':').map(Number);
      const diff = (xh * 3600 + xm * 60 + xs) - (eh * 3600 + em * 60 + es);
      if (diff <= 0) return '-';
      return formatMinuts(diff / 60);
    };

    const fichajesPorDia = computed(() => {
      const grouped = {};
      fichajes.value.forEach(f => {
        if (!grouped[f.fecha]) grouped[f.fecha] = [];
        grouped[f.fecha].push(f);
      });
      const result = Object.keys(grouped).map(date => {
        const sessions = grouped[date].slice().sort((a, b) => (a.hora_entrada || '').localeCompare(b.hora_entrada || ''));
        let totalMinutes = 0;
        sessions.forEach(f => {
          if (f.hora_entrada && f.hora_salida) {
            const [eh, em, es = 0] = f.hora_entrada.split(':').map(Number);
            const [xh, xm, xs = 0] = f.hora_salida.split(':').map(Number);
            const diff = (xh * 3600 + xm * 60 + xs) - (eh * 3600 + em * 60 + es);
            if (diff > 0) totalMinutes += diff / 60;
          }
        });
        return { date, sessions, totalMinutes, totalFormatted: formatMinuts(totalMinutes) };
      });
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
      return result;
    });

    const totalFitxatgeMesFormatted = computed(() => {
      const totalMinutes = fichajesPorDia.value.reduce((sum, d) => sum + d.totalMinutes, 0);
      return formatMinuts(totalMinutes);
    });

    const horesPerProjecte = computed(() => {
      const grouped = {};
      horas.value.forEach(h => {
        const key = h.proyecto_id || 'sense';
        if (!grouped[key]) grouped[key] = { proyecto_id: h.proyecto_id, entries: [], total: 0 };
        grouped[key].entries.push(h);
        grouped[key].total += Number(h.horas || 0);
      });
      return Object.values(grouped).sort((a, b) => b.total - a.total);
    });

    const totalHoresProjecteMes = computed(() => {
      return horas.value.reduce((sum, h) => sum + Number(h.horas || 0), 0);
    });

    const projectesMensual = computed(() => {
      const grouped = {};
      const grup = (proyectoId) => {
        const key = proyectoId || 'sense';
        if (!grouped[key]) {
          const proyecto = proyectos.value.find(p => p.id === proyectoId);
          grouped[key] = {
            proyecto_id: proyectoId || null,
            lugar: proyecto?.lugar || null,
            carpeta: carpetas.value.find(c => c.id === proyecto?.carpeta_id)?.nombre || null,
            entries: [],
            materials: [],
            total: 0,
            perUsuari: {},
            dates: new Set()
          };
        }
        return grouped[key];
      };
      horasMes.value.forEach(h => {
        const g = grup(h.proyecto_id);
        const hores = Number(h.horas || 0);
        g.entries.push(h);
        g.total += hores;
        g.perUsuari[h.user_id] = (g.perUsuari[h.user_id] || 0) + hores;
        g.dates.add(h.fecha);
      });
      materialsMes.value.forEach(m => grup(m.proyecto_id).materials.push(m));
      return Object.values(grouped)
        .map(g => ({
          ...g,
          entries: g.entries.slice().sort((a, b) => a.fecha.localeCompare(b.fecha)),
          dies: g.dates.size,
          treballadors: Object.entries(g.perUsuari)
            .map(([user_id, horas]) => ({ user_id, horas }))
            .sort((a, b) => b.horas - a.horas)
        }))
        .sort((a, b) => b.total - a.total);
    });

    const treballadorsMensual = computed(() => {
      const grouped = {};
      horasMes.value.forEach(h => {
        if (!grouped[h.user_id]) grouped[h.user_id] = { user_id: h.user_id, horas: 0, projectes: [] };
        grouped[h.user_id].horas += Number(h.horas || 0);
        const pid = h.proyecto_id || null;
        if (!grouped[h.user_id].projectes.includes(pid)) grouped[h.user_id].projectes.push(pid);
      });
      return Object.values(grouped).sort((a, b) => b.horas - a.horas);
    });

    const totalHoresMensual = computed(() => horasMes.value.reduce((sum, h) => sum + Number(h.horas || 0), 0));

    const nombreUsuario = (userId) => usuarios.value.find(u => u.id === userId)?.full_name || 'Usuari';
    const nombreMaterial = (materialId) => materiales.value.find(m => m.id === materialId)?.nombre || 'Material';
    const unitatMaterial = (materialId) => materiales.value.find(m => m.id === materialId)?.unidad || '';

    const nombreProjecte = (proyectoId) => proyectos.value.find(p => p.id === proyectoId)?.nombre || 'Sense projecte';

    const toggleExpanded = (proyectoId) => {
      expandedProjecte.value = expandedProjecte.value === proyectoId ? undefined : proyectoId;
    };

    const formatDayOfWeek = (dateStr) => new Date(dateStr).toLocaleDateString('ca-ES', { weekday: 'long' });

    const loadUsuarios = async () => {
      try {
        const data = await api.get('/users');
        usuarios.value = data.map(u => ({ id: u.id, full_name: u.nombre, username: u.username }));
      } catch (error) {
        console.error('Error carregant usuaris:', error);
      }
    };

    const loadProyectos = async () => {
      try {
        proyectos.value = await api.get('/proyectos');
      } catch (error) {
        console.error('Error carregant projectes:', error);
      }
    };

    const loadReport = async () => {
      if (!selectedUserId.value || !selectedMonth.value) return;
      loading.value = true;
      expandedProjecte.value = undefined;
      try {
        const { desde, hasta } = monthRange.value;
        const [fichajesData, horasData] = await Promise.all([
          api.get('/fichajes', { user_id: selectedUserId.value, desde, hasta, abierto: false }),
          api.get('/horas', { user_id: selectedUserId.value, desde, hasta })
        ]);
        fichajes.value = fichajesData;
        horas.value = horasData;
      } catch (error) {
        console.error('Error carregant informe:', error);
      } finally {
        loading.value = false;
      }
    };

    const loadMensual = async () => {
      if (!selectedMonth.value) return;
      loadingMensual.value = true;
      expandedProjecte.value = undefined;
      try {
        const { desde, hasta } = monthRange.value;
        const [horasData, carpetasData, materialesData] = await Promise.all([
          api.get('/horas', { desde, hasta }),
          api.get('/carpetas'),
          api.get('/materiales')
        ]);
        horasMes.value = horasData;
        carpetas.value = carpetasData;
        materiales.value = materialesData;

        // Materials afegits durant el mes: projectes actius o amb hores aquest mes
        const ambHores = new Set(horasData.map(h => h.proyecto_id).filter(Boolean));
        const candidats = proyectos.value.filter(p => p.estado === 'en_curso' || ambHores.has(p.id));
        const llistes = await Promise.all(
          candidats.map(p => api.get(`/proyectos/${p.id}/materiales`).catch(() => []))
        );
        materialsMes.value = llistes.flat().filter(m => (m.created_at || '').slice(0, 7) === selectedMonth.value);
      } catch (error) {
        console.error('Error carregant resum mensual:', error);
      } finally {
        loadingMensual.value = false;
      }
    };

    const loadActual = () => (tipus.value === 'mensual' ? loadMensual() : loadReport());

    const canviarTipus = (value) => {
      if (tipus.value === value) return;
      tipus.value = value;
      loadActual();
    };

    const downloadInformeMensual = () => {
      downloadingInforme.value = true;
      try {
        const mesLabel = new Date(`${selectedMonth.value}-01`).toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' });
        const headStyles = { fillColor: [234, 88, 12], textColor: 255, fontSize: 8, fontStyle: 'bold' };
        const bodyStyles = { fontSize: 8, textColor: [31, 41, 55] };
        const alternateRowStyles = { fillColor: [249, 250, 251] };
        const margin = { left: 14, right: 14 };

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(234, 88, 12);
        doc.text('Resum mensual de feina', 14, 18);
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`Període: ${mesLabel}`, 14, 25);
        doc.text(`Generat: ${new Date().toLocaleDateString('ca-ES')}`, 14, 30);

        let y = 40;
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        doc.text(`Total hores: ${totalHoresMensual.value.toFixed(2)}h`, 14, y);
        doc.text(`Projectes: ${projectesMensual.value.filter(p => p.proyecto_id).length}`, 80, y);
        doc.text(`Treballadors: ${treballadorsMensual.value.length}`, 140, y);
        y += 9;

        doc.setFontSize(12);
        doc.setTextColor(234, 88, 12);
        doc.text('Projectes i llocs', 14, y);
        autoTable(doc, {
          startY: y + 4,
          head: [['Projecte', 'Lloc', 'Carpeta', 'Treballadors', 'Dies', 'Hores']],
          body: projectesMensual.value.map(p => [
            nombreProjecte(p.proyecto_id),
            p.lugar || '-',
            p.carpeta || '-',
            p.treballadors.map(t => nombreUsuario(t.user_id)).join(', ') || '-',
            p.dies,
            `${p.total.toFixed(2)}h`
          ]),
          headStyles, bodyStyles, alternateRowStyles, margin,
        });
        y = doc.lastAutoTable.finalY + 8;

        if (treballadorsMensual.value.length) {
          if (y > 245) { doc.addPage(); y = 20; }
          doc.setFontSize(12);
          doc.setTextColor(234, 88, 12);
          doc.text('Per treballador', 14, y);
          autoTable(doc, {
            startY: y + 4,
            head: [['Treballador', 'Projectes', 'Hores']],
            body: treballadorsMensual.value.map(t => [
              nombreUsuario(t.user_id),
              t.projectes.map(nombreProjecte).join(', '),
              `${t.horas.toFixed(2)}h`
            ]),
            headStyles, bodyStyles, alternateRowStyles, margin,
          });
        }

        // Detall per projecte
        projectesMensual.value.forEach(p => {
          doc.addPage();
          y = 20;
          doc.setFontSize(15);
          doc.setTextColor(234, 88, 12);
          doc.text(nombreProjecte(p.proyecto_id), 14, y);
          y += 7;
          doc.setFontSize(9);
          doc.setTextColor(107, 114, 128);
          if (p.lugar) { doc.text(`Lloc: ${p.lugar}`, 14, y); y += 5; }
          if (p.carpeta) { doc.text(`Carpeta: ${p.carpeta}`, 14, y); y += 5; }
          doc.text(`Total: ${p.total.toFixed(2)}h en ${p.dies} ${p.dies === 1 ? 'dia' : 'dies'}`, 14, y);
          y += 4;

          if (p.entries.length) {
            autoTable(doc, {
              startY: y + 2,
              head: [['Data', 'Treballador', 'Hores', 'Comentari']],
              body: p.entries.map(e => [formatDate(e.fecha), nombreUsuario(e.user_id), `${e.horas}h`, e.comentario || '-']),
              headStyles, bodyStyles, alternateRowStyles, margin,
            });
            y = doc.lastAutoTable.finalY + 8;
          } else {
            y += 6;
          }

          if (p.materials.length) {
            if (y > 245) { doc.addPage(); y = 20; }
            doc.setFontSize(11);
            doc.setTextColor(31, 41, 55);
            doc.text('Materials afegits', 14, y);
            autoTable(doc, {
              startY: y + 3,
              head: [['Data', 'Material', 'Quantitat']],
              body: p.materials.map(m => [
                formatDate(m.created_at),
                nombreMaterial(m.material_id),
                `${Number(m.cantidad)} ${unitatMaterial(m.material_id)}`
              ]),
              headStyles, bodyStyles, alternateRowStyles, margin,
            });
          }
        });

        doc.save(`resum-mensual-${selectedMonth.value}.pdf`);
      } finally {
        downloadingInforme.value = false;
      }
    };

    const downloadInforme = () => {
      downloadingInforme.value = true;
      try {
        const userName = usuarios.value.find(u => u.id === selectedUserId.value)?.full_name || 'Usuari';
        const mesLabel = new Date(`${selectedMonth.value}-01`).toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' });

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(234, 88, 12);
        doc.text(`Informe: ${userName}`, 14, 18);
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(`Període: ${mesLabel}`, 14, 25);
        doc.text(`Generat: ${new Date().toLocaleDateString('ca-ES')}`, 14, 30);

        let y = 40;
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        doc.text(`Total fitxatge: ${totalFitxatgeMesFormatted.value}`, 14, y);
        doc.text(`Total hores projecte: ${totalHoresProjecteMes.value.toFixed(2)}h`, 100, y);
        y += 9;

        doc.setFontSize(12);
        doc.setTextColor(234, 88, 12);
        doc.text('Fitxatge del mes', 14, y);
        y += 2;

        const fichajeRows = [];
        fichajesPorDia.value.slice().reverse().forEach(dia => {
          dia.sessions.forEach((s, idx) => {
            fichajeRows.push([
              idx === 0 ? formatDate(dia.date) : '',
              s.hora_entrada || '-',
              s.hora_salida || '-',
              calcularDuracio(s)
            ]);
          });
        });

        if (fichajeRows.length) {
          autoTable(doc, {
            startY: y + 2,
            head: [['Data', 'Entrada', 'Sortida', 'Durada']],
            body: fichajeRows,
            headStyles: { fillColor: [234, 88, 12], textColor: 255, fontSize: 8, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8, textColor: [31, 41, 55] },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 14, right: 14 },
          });
          y = doc.lastAutoTable.finalY + 8;
        } else {
          doc.setFontSize(9);
          doc.setTextColor(156, 163, 175);
          doc.text('Sense fitxatges aquest mes', 14, y + 6);
          y += 14;
        }

        if (y > 245) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(234, 88, 12);
        doc.text('Hores per projecte', 14, y);
        y += 2;

        if (horesPerProjecte.value.length) {
          autoTable(doc, {
            startY: y + 2,
            head: [['Projecte', 'Hores', 'Registres']],
            body: horesPerProjecte.value.map(g => [nombreProjecte(g.proyecto_id), `${g.total.toFixed(2)}h`, g.entries.length]),
            headStyles: { fillColor: [234, 88, 12], textColor: 255, fontSize: 8, fontStyle: 'bold' },
            bodyStyles: { fontSize: 8, textColor: [31, 41, 55] },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 14, right: 14 },
          });
        } else {
          doc.setFontSize(9);
          doc.setTextColor(156, 163, 175);
          doc.text('Sense hores de projecte aquest mes', 14, y + 6);
        }

        doc.save(`informe-${userName}-${selectedMonth.value}.pdf`);
      } finally {
        downloadingInforme.value = false;
      }
    };

    const logout = () => {
      apiLogout();
      router.push('/login');
    };

    onMounted(async () => {
      await loadUsuarios();
      await loadProyectos();
      if (usuarios.value.length > 0) {
        selectedUserId.value = usuarios.value[0].id;
        await loadReport();
      }
    });

    return {
      usuarios,
      selectedUserId,
      selectedMonth,
      loading,
      downloadingInforme,
      expandedProjecte,
      fichajesPorDia,
      horesPerProjecte,
      totalFitxatgeMesFormatted,
      totalHoresProjecteMes,
      nombreProjecte,
      toggleExpanded,
      calcularDuracio,
      formatDate,
      formatDayOfWeek,
      loadReport,
      downloadInforme,
      tipusInforme,
      tipus,
      canviarTipus,
      loadActual,
      loadingMensual,
      projectesMensual,
      treballadorsMensual,
      totalHoresMensual,
      nombreUsuario,
      nombreMaterial,
      unitatMaterial,
      downloadInformeMensual,
      logout
    };
  }
};
</script>
