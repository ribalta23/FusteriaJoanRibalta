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
            <h1 class="text-base font-bold text-white truncate">Projectes</h1>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              v-if="isSuperuser"
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

      <div class="flex bg-gray-200 bg-opacity-60 rounded-xl p-1 mb-3">
        <button
          @click="showAll = false"
          :class="!showAll ? 'bg-white shadow text-orange-600' : 'text-gray-500'"
          class="flex-1 py-2 rounded-lg text-sm font-semibold transition"
        >
          Actius
        </button>
        <button
          @click="showAll = true"
          :class="showAll ? 'bg-white shadow text-orange-600' : 'text-gray-500'"
          class="flex-1 py-2 rounded-lg text-sm font-semibold transition"
        >
          Tots
        </button>
      </div>

      <!-- Filtre per carpeta -->
      <div class="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-3 px-3" style="scrollbar-width: none;">
        <button
          @click="selectedCarpeta = 'all'"
          :class="selectedCarpeta === 'all' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600'"
          class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm flex-shrink-0"
        >
          Totes
        </button>
        <button
          @click="selectedCarpeta = 'none'"
          :class="selectedCarpeta === 'none' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600'"
          class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm flex-shrink-0"
        >
          Sense carpeta
        </button>
        <button
          v-for="c in carpetas"
          :key="c.id"
          @click="selectedCarpeta = c.id"
          :class="selectedCarpeta === c.id ? 'bg-orange-600 text-white' : 'bg-white text-gray-600'"
          class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm flex-shrink-0 flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
          {{ c.nombre }}
        </button>
        <button
          v-if="isSuperuser"
          @click="openCarpetasModal"
          class="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm flex-shrink-0 bg-white text-orange-600 border border-dashed border-orange-300"
        >
          + Carpetes
        </button>
      </div>

      <!-- Descarrega informe de la carpeta seleccionada -->
      <button
        v-if="selectedCarpetaObj"
        @click="downloadCarpetaInforme"
        :disabled="downloadingInforme"
        class="w-full flex items-center justify-center gap-2 bg-white rounded-2xl shadow-sm py-2.5 mb-4 text-sm font-semibold text-orange-600 active:bg-gray-50 disabled:opacity-50"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {{ downloadingInforme ? 'Generant informe...' : `Descarrega informe de "${selectedCarpetaObj.nombre}"` }}
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p class="mt-2 text-gray-500 text-sm">Carregant projectes...</p>
      </div>

      <!-- Projects grouped list -->
      <div v-else-if="filteredProjects.length > 0" class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
        <button
          v-for="project in filteredProjects"
          :key="project.id"
          @click="$router.push(`/projectes/${project.id}`)"
          class="w-full px-4 py-3 flex items-center justify-between gap-3 text-left active:bg-gray-50 transition"
        >
          <div class="min-w-0">
            <div class="text-sm font-semibold text-gray-900 truncate">{{ project.nombre }}</div>
            <div class="text-xs text-gray-400 truncate">
              {{ project.lugar || 'Sense ubicació' }}
              <span v-if="carpetaNombre(project.carpeta_id)"> · {{ carpetaNombre(project.carpeta_id) }}</span>
              <span v-if="isSuperuser && costes[project.id]"> · {{ formatEuros(costes[project.id].coste_total) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <span
              :class="project.estado === 'en_curso' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
              class="px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
            >
              {{ project.estado === 'en_curso' ? 'Actiu' : 'Finalitzat' }}
            </span>
            <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white rounded-2xl shadow-sm">
        <svg class="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No hi ha projectes</h3>
        <p class="mt-1 text-xs text-gray-400">
          {{ showAll ? 'Encara no s\'ha creat cap projecte.' : 'No hi ha projectes actius. Prova "Tots".' }}
        </p>
      </div>
    </div>

    <!-- Bottom sheet: Crear projecte -->
    <Transition name="sheet">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="showModal = false"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full" :style="{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }">
          <div class="flex justify-center pt-2 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-gray-300"></div>
          </div>
          <div class="px-6 pt-4 pb-2">
            <h3 class="text-lg font-bold text-gray-900">Crear Nou Projecte</h3>
          </div>

          <form @submit.prevent="saveProject" class="p-6 pt-2 space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Nom del Projecte *</label>
              <input
                v-model="form.nombre"
                type="text"
                required
                class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Nom del projecte"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Descripció</label>
              <textarea
                v-model="form.descripcion"
                rows="3"
                class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Descripció del projecte"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Lloc</label>
              <input
                v-model="form.lugar"
                type="text"
                class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ubicació del projecte"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Carpeta (opcional)</label>
              <select
                v-model="form.carpeta_id"
                class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option :value="null">-- Sense carpeta --</option>
                <option v-for="c in carpetas" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
            </div>

            <div class="flex gap-2 pt-2">
              <button
                type="button"
                @click="showModal = false"
                class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold active:bg-orange-700 disabled:bg-gray-300"
              >
                {{ saving ? 'Guardant...' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Bottom sheet: Gestionar carpetes -->
    <Transition name="sheet">
      <div v-if="showCarpetasModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="showCarpetasModal = false"></div>
        <div
          class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full flex flex-col"
          style="max-height: 80vh"
          :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
        >
          <div class="flex justify-center pt-2 sm:hidden flex-shrink-0">
            <div class="w-10 h-1 rounded-full bg-gray-300"></div>
          </div>
          <div class="px-6 pt-4 pb-2 flex-shrink-0">
            <h3 class="text-lg font-bold text-gray-900">Carpetes</h3>
            <p class="text-xs text-gray-400 mt-0.5">Agrupa projectes (ex: per proveïdor o client habitual)</p>
          </div>

          <form @submit.prevent="createCarpeta" class="px-6 pb-3 flex gap-2 flex-shrink-0">
            <input
              v-model="newCarpetaName"
              type="text"
              placeholder="Nom de la carpeta"
              class="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              type="submit"
              :disabled="!newCarpetaName.trim() || savingCarpeta"
              class="px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold active:bg-orange-700 disabled:bg-gray-300"
            >
              Crear
            </button>
          </form>

          <div class="overflow-y-auto px-6 pb-6">
            <div v-if="carpetas.length === 0" class="text-center py-6 text-sm text-gray-400">Encara no hi ha carpetes.</div>
            <div v-else class="bg-gray-50 rounded-2xl divide-y divide-gray-100 overflow-hidden">
              <div v-for="c in carpetas" :key="c.id" class="px-4 py-3 flex items-center justify-between gap-2">
                <span class="text-sm font-medium text-gray-900 truncate">{{ c.nombre }}</span>
                <div class="flex gap-3 flex-shrink-0 text-xs font-semibold">
                  <button @click="renameCarpeta(c)" class="text-orange-600">Renombrar</button>
                  <button @click="deleteCarpeta(c)" class="text-red-600">Eliminar</button>
                </div>
              </div>
            </div>
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
import { jsPDF } from 'jspdf';
import { renderCapcalera, renderProjecteSeccio } from '@/utils/informe';

export default {
  name: 'ProjectesDashboard',
  setup() {
    const router = useRouter();
    const projects = ref([]);
    const carpetas = ref([]);
    const costes = ref({});
    const loading = ref(false);
    const saving = ref(false);
    const showModal = ref(false);
    const showAll = ref(false);
    const selectedCarpeta = ref('all');
    const message = ref('');
    const messageType = ref('success');
    const userRole = ref(localStorage.getItem('userRole') || 'usuario');
    const isSuperuser = ref(userRole.value === 'superusuario');

    const showCarpetasModal = ref(false);
    const newCarpetaName = ref('');
    const savingCarpeta = ref(false);

    const form = ref({
      nombre: '',
      descripcion: '',
      lugar: '',
      carpeta_id: null
    });

    const filteredProjects = computed(() => {
      let list = projects.value;
      if (!showAll.value) list = list.filter(p => p.estado === 'en_curso');
      if (selectedCarpeta.value === 'none') list = list.filter(p => !p.carpeta_id);
      else if (selectedCarpeta.value !== 'all') list = list.filter(p => p.carpeta_id === selectedCarpeta.value);
      return list;
    });

    const carpetaNombre = (carpetaId) => carpetas.value.find(c => c.id === carpetaId)?.nombre || null;

    const selectedCarpetaObj = computed(() => {
      if (selectedCarpeta.value === 'all' || selectedCarpeta.value === 'none') return null;
      return carpetas.value.find(c => c.id === selectedCarpeta.value) || null;
    });

    const downloadingInforme = ref(false);

    const formatEuros = (value) => {
      const n = Number(value || 0);
      return n.toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' });
    };

    const showMessage = (text, type = 'success') => {
      message.value = text;
      messageType.value = type;
      setTimeout(() => { message.value = ''; }, 4000);
    };

    const loadCostes = async () => {
      if (!isSuperuser.value) return;
      await Promise.all(projects.value.map(async (p) => {
        try {
          costes.value[p.id] = await api.get(`/proyectos/${p.id}/coste`);
        } catch (error) {
          console.error('Error carregant cost del projecte', p.id, error);
        }
      }));
    };

    const loadProjects = async () => {
      loading.value = true;
      try {
        projects.value = await api.get('/proyectos');
        loadCostes();
      } catch (error) {
        console.error('Error carregant projectes:', error);
        showMessage('Error al carregar els projectes', 'error');
      } finally {
        loading.value = false;
      }
    };

    const loadCarpetas = async () => {
      try {
        carpetas.value = await api.get('/carpetas');
      } catch (error) {
        console.error('Error carregant carpetes:', error);
      }
    };

    const openCreateModal = () => {
      form.value = { nombre: '', descripcion: '', lugar: '', carpeta_id: null };
      showModal.value = true;
    };

    const saveProject = async () => {
      saving.value = true;
      try {
        const payload = {
          nombre: form.value.nombre,
          descripcion: form.value.descripcion,
          lugar: form.value.lugar,
          carpeta_id: form.value.carpeta_id || null
        };
        await api.post('/proyectos', payload);
        showMessage('Projecte creat correctament', 'success');
        showModal.value = false;
        await loadProjects();
      } catch (error) {
        console.error('Error creant projecte:', error);
        showMessage('Error creant el projecte: ' + error.message, 'error');
      } finally {
        saving.value = false;
      }
    };

    const openCarpetasModal = () => {
      newCarpetaName.value = '';
      showCarpetasModal.value = true;
    };

    const createCarpeta = async () => {
      if (!newCarpetaName.value.trim()) return;
      savingCarpeta.value = true;
      try {
        await api.post('/carpetas', { nombre: newCarpetaName.value.trim() });
        newCarpetaName.value = '';
        await loadCarpetas();
      } catch (error) {
        console.error('Error creant carpeta:', error);
        showMessage('Error creant la carpeta: ' + error.message, 'error');
      } finally {
        savingCarpeta.value = false;
      }
    };

    const renameCarpeta = async (carpeta) => {
      const nom = prompt('Nom de la carpeta', carpeta.nombre);
      if (!nom || !nom.trim() || nom.trim() === carpeta.nombre) return;
      try {
        await api.patch(`/carpetas/${carpeta.id}`, { nombre: nom.trim() });
        await loadCarpetas();
      } catch (error) {
        console.error('Error renombrant carpeta:', error);
        showMessage('Error renombrant la carpeta: ' + error.message, 'error');
      }
    };

    const deleteCarpeta = async (carpeta) => {
      if (!confirm(`Estàs segur que vols eliminar la carpeta "${carpeta.nombre}"? Els projectes de dins no s'eliminaran, només deixaran de pertànyer a la carpeta.`)) return;
      try {
        await api.delete(`/carpetas/${carpeta.id}`);
        if (selectedCarpeta.value === carpeta.id) selectedCarpeta.value = 'all';
        await loadCarpetas();
        await loadProjects();
      } catch (error) {
        console.error('Error eliminant carpeta:', error);
        showMessage('Error eliminant la carpeta: ' + error.message, 'error');
      }
    };

    const logout = () => {
      apiLogout();
      router.push('/login');
    };

    const downloadCarpetaInforme = async () => {
      const carpeta = selectedCarpetaObj.value;
      if (!carpeta) return;

      const projectesCarpeta = projects.value.filter(p => p.carpeta_id === carpeta.id);
      if (projectesCarpeta.length === 0) {
        showMessage('Aquesta carpeta no té projectes', 'error');
        return;
      }

      downloadingInforme.value = true;
      try {
        const [catalogo, usuarios] = await Promise.all([
          api.get('/materiales'),
          isSuperuser.value ? api.get('/users') : Promise.resolve([])
        ]);
        const nombreMaterial = (id) => catalogo.find(m => m.id === id)?.nombre || 'Material eliminat';
        const categoriaMaterial = (id) => catalogo.find(m => m.id === id)?.categoria;
        const nombreUsuario = (id) => usuarios.find(u => u.id === id)?.nombre || 'Desconegut';

        const doc = new jsPDF();
        let y = renderCapcalera(doc, `Informe de Carpeta: ${carpeta.nombre}`);

        let totalManoObra = 0;
        let totalMateriales = 0;

        for (let i = 0; i < projectesCarpeta.length; i++) {
          const p = projectesCarpeta[i];
          const [horasP, materialesP, costeP] = await Promise.all([
            api.get('/horas', { proyecto_id: p.id }),
            api.get(`/proyectos/${p.id}/materiales`),
            isSuperuser.value ? api.get(`/proyectos/${p.id}/coste`) : Promise.resolve(null)
          ]);
          if (costeP) {
            totalManoObra += Number(costeP.coste_mano_obra);
            totalMateriales += Number(costeP.coste_materiales);
          }

          if (i > 0) {
            doc.addPage();
            y = 20;
          }
          y = renderProjecteSeccio(doc, y, {
            proyecto: p,
            carpetaNombre: carpeta.nombre,
            horas: horasP,
            materiales: materialesP,
            coste: costeP,
            isSuperuser: isSuperuser.value,
            nombreUsuario,
            nombreMaterial,
            categoriaMaterial
          });
        }

        if (isSuperuser.value) {
          if (y > 260) {
            doc.addPage();
            y = 20;
          }
          doc.setFillColor(234, 88, 12);
          doc.rect(14, y, 182, 12, 'F');
          doc.setFontSize(11);
          doc.setTextColor(255, 255, 255);
          doc.text(`TOTAL CARPETA: ${formatEuros(totalManoObra + totalMateriales)}`, 20, y + 8);
        }

        doc.save(`informe-carpeta-${carpeta.nombre}.pdf`);
      } catch (error) {
        console.error('Error generant informe de carpeta:', error);
        showMessage('Error generant l\'informe: ' + error.message, 'error');
      } finally {
        downloadingInforme.value = false;
      }
    };

    onMounted(() => {
      loadCarpetas();
      loadProjects();
    });

    return {
      projects,
      carpetas,
      costes,
      loading,
      saving,
      showModal,
      showAll,
      selectedCarpeta,
      message,
      messageType,
      isSuperuser,
      form,
      filteredProjects,
      carpetaNombre,
      formatEuros,
      openCreateModal,
      saveProject,
      showCarpetasModal,
      newCarpetaName,
      savingCarpeta,
      openCarpetasModal,
      createCarpeta,
      renameCarpeta,
      deleteCarpeta,
      selectedCarpetaObj,
      downloadingInforme,
      downloadCarpetaInforme,
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
