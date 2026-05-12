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
      <!-- Add Entry Form -->
      <div class="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 class="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {{ editingEntry ? 'Editar Registre' : 'Nou Registre' }}
        </h2>
        
        <form @submit.prevent="saveEntry" class="space-y-3 sm:space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label for="date" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                id="date"
                v-model="form.date"
                required
                class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div>
              <label for="name" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                id="name"
                v-model="form.name"
                required
                placeholder="El teu nom"
                class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
              />
            </div>

            <div>
              <label for="entry_time" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Hora d'Entrada
              </label>
              <select
                id="entry_time"
                v-model="form.entry_time"
                required
                class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">-- Selecciona hora --</option>
                <option v-for="time in timeOptions" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
            </div>

            <div>
              <label for="exit_time" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Hora de Sortida
              </label>
              <select
                id="exit_time"
                v-model="form.exit_time"
                class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">-- Selecciona hora --</option>
                <option v-for="time in timeOptions" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
            </div>

            <div>
              <label for="project" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Projecte (Opcional)
              </label>
              <select
                id="project"
                v-model="form.project_id"
                class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option :value="null">-- Sense projecte --</option>
                <option v-for="project in proyectos" :key="project.id" :value="project.id">
                  {{ project.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label for="comment" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Descripció / Comentari
            </label>
            <textarea
              id="comment"
              v-model="form.comment"
              rows="3"
              placeholder="Descriu el que has fet durant aquestes hores..."
              class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            ></textarea>
          </div>

          <div class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
            <button
              v-if="editingEntry"
              type="button"
              @click="cancelEdit"
              class="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Guardant...</span>
              <span v-else-if="editingEntry">Actualitzar</span>
              <span v-else>Afegir Registre</span>
            </button>
          </div>
        </form>

        <!-- Success/Error Messages -->
        <div v-if="message" class="mt-4">
          <div 
            :class="messageType === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'"
            class="p-4 rounded-md border"
          >
            {{ message }}
          </div>
        </div>
      </div>

      <!-- Records Section -->
      <div class="bg-white shadow-md rounded-xl p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 class="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span>Historial</span>
            <span v-if="!isSuperuser" class="text-xs sm:text-base font-normal text-gray-500 ml-2">(Teus registres)</span>
          </h2>
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select 
              v-if="isSuperuser"
              v-model="filterProject" 
              class="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tots els projectes</option>
              <option value="none">Sense projecte</option>
              <option v-for="project in proyectos" :key="project.id" :value="project.id">
                {{ project.nombre }}
              </option>
            </select>
            <select 
              v-model="filterPeriod" 
              @change="carregarRegistres"
              class="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="week">Aquesta setmana</option>
              <option value="month">Aquest mes</option>
              <option value="all">Tot l'historial</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loadingRecords" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p class="mt-2 text-gray-600">Carregant registres...</p>
        </div>

        <!-- Records - Mobile Cards -->
        <div v-else-if="registres.length > 0">
          <!-- Superuser: Grouped by User -->
          <div v-if="isSuperuser" class="space-y-6">
            <div v-for="(userEntries, userNameKey) in registresPorUsuario" :key="userNameKey" class="border border-gray-200 rounded-xl overflow-hidden">
              <!-- User Header -->
              <div class="bg-orange-50 px-4 py-3 border-b border-orange-200">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-bold text-orange-900">{{ userNameKey }}</h3>
                  <span class="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {{ calculateUserTotalHours(userEntries) }}
                  </span>
                </div>
              </div>

              <!-- Desktop Table -->
              <div class="hidden lg:block overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projecte</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sortida</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hores</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentari</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="registre in userEntries" :key="registre.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(registre.date) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span v-if="registre.proyectos" class="inline-flex items-center px-2 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-medium">
                          {{ registre.proyectos.nombre }}
                        </span>
                        <span v-else class="text-gray-400">-</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ registre.entry_time }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ registre.exit_time || '-' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span class="font-semibold text-orange-600">{{ calculateHours(registre.entry_time, registre.exit_time) }}</span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{{ registre.comment || '-' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button @click="editEntry(registre)" class="text-orange-600 hover:text-orange-900 mr-3">Editar</button>
                        <button @click="deleteEntry(registre.id)" class="text-red-600 hover:text-red-900">Eliminar</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Cards -->
              <div class="lg:hidden space-y-3 p-3">
                <div v-for="registre in userEntries" :key="registre.id" class="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                      <div class="text-sm font-semibold text-gray-900 mb-1">
                        {{ formatDate(registre.date) }}
                      </div>
                    </div>
                    <div class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                      {{ calculateHours(registre.entry_time, registre.exit_time) }}
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3 mb-3 bg-gray-50 rounded-lg p-3">
                    <div>
                      <div class="text-xs text-gray-500 mb-1">Entrada</div>
                      <div class="text-sm font-semibold text-gray-900">{{ registre.entry_time }}</div>
                    </div>
                    <div>
                      <div class="text-xs text-gray-500 mb-1">Sortida</div>
                      <div class="text-sm font-semibold text-gray-900">{{ registre.exit_time || '-' }}</div>
                    </div>
                  </div>

                  <div v-if="registre.proyectos" class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                    <div class="text-xs text-orange-600 mb-1">Projecte</div>
                    <div class="text-sm font-semibold text-orange-700">{{ registre.proyectos.nombre }}</div>
                  </div>

                  <div v-if="registre.comment" class="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                    <div class="text-xs text-gray-500 mb-1">Comentari</div>
                    <div class="text-sm text-gray-700">{{ registre.comment }}</div>
                  </div>

                  <div class="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                      @click="editEntry(registre)"
                      class="flex-1 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 active:bg-orange-200 transition"
                    >
                      Editar
                    </button>
                    <button
                      @click="deleteEntry(registre.id)"
                      class="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 active:bg-red-200 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Normal User: Single List -->
          <div v-else>
          <!-- Desktop Table (hidden on mobile) -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projecte</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sortida</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hores</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentari</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="registre in registres" :key="registre.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(registre.date) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ registre.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span v-if="registre.proyectos" class="inline-flex items-center px-2 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-medium">
                      {{ registre.proyectos.nombre }}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ registre.entry_time }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ registre.exit_time || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="font-semibold text-orange-600">{{ calculateHours(registre.entry_time, registre.exit_time) }}</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{{ registre.comment || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button @click="editEntry(registre)" class="text-orange-600 hover:text-orange-900 mr-3">Editar</button>
                    <button @click="deleteEntry(registre.id)" class="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards (visible on mobile) -->
          <div class="lg:hidden space-y-3">
            <div v-for="registre in registres" :key="registre.id" class="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition">
              <!-- Card Header -->
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <div class="text-sm font-semibold text-gray-900 mb-1">
                    {{ formatDate(registre.date) }}
                  </div>
                  <div class="text-xs text-gray-600">
                    {{ registre.name }}
                  </div>
                </div>
                <div class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold">
                  {{ calculateHours(registre.entry_time, registre.exit_time) }}
                </div>
              </div>

              <!-- Time Info -->
              <div class="grid grid-cols-2 gap-3 mb-3 bg-gray-50 rounded-lg p-3">
                <div>
                  <div class="text-xs text-gray-500 mb-1">Entrada</div>
                  <div class="text-sm font-semibold text-gray-900">{{ registre.entry_time }}</div>
                </div>
                <div>
                  <div class="text-xs text-gray-500 mb-1">Sortida</div>
                  <div class="text-sm font-semibold text-gray-900">{{ registre.exit_time || '-' }}</div>
                </div>
              </div>

              <!-- Project -->
              <div v-if="registre.proyectos" class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                <div class="text-xs text-orange-600 mb-1">Projecte</div>
                <div class="text-sm font-semibold text-orange-700">{{ registre.proyectos.nombre }}</div>
              </div>

              <!-- Comment -->
              <div v-if="registre.comment" class="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                <div class="text-xs text-gray-500 mb-1">Comentari</div>
                <div class="text-sm text-gray-700">{{ registre.comment }}</div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  @click="editEntry(registre)"
                  class="flex-1 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 active:bg-orange-200 transition"
                >
                  Editar
                </button>
                <button
                  @click="deleteEntry(registre.id)"
                  class="flex-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 active:bg-red-200 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          </div>

          <!-- Total Hours -->
          <div class="mt-4 sm:mt-6 flex justify-center sm:justify-end">
            <div class="bg-orange-600 text-white px-6 py-4 rounded-xl shadow-lg w-full sm:w-auto">
              <div class="text-center sm:text-left">
                <span class="text-sm font-medium">Total hores:</span>
                <span class="text-2xl font-bold ml-2">{{ totalHours }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hi ha registres</h3>
          <p class="mt-1 text-sm text-gray-500">Comença afegint el teu primer registre horari.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';

export default {
  name: 'ControlHorario',
  setup() {
    const router = useRouter();
    const loading = ref(false);
    const loadingRecords = ref(false);
    const message = ref('');
    const messageType = ref('');
    const registres = ref([]);
    const proyectos = ref([]);
    const filterPeriod = ref('month');
    const filterProject = ref('all');
    const editingEntry = ref(null);
    const userName = ref(localStorage.getItem('userFullName') || localStorage.getItem('userName') || 'Usuari');
    const userRole = ref(localStorage.getItem('userRole') || 'usuario');
    const isSuperuser = ref(userRole.value === 'superusuario');
    
    const form = ref({
      date: new Date().toISOString().split('T')[0],
      name: userName.value,
      entry_time: '',
      exit_time: '',
      comment: '',
      project_id: null
    });

    // Generar opciones de tiempo en cuartos de hora (15 minutos)
    const timeOptions = ref([]);
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        timeOptions.value.push(`${h}:${m}`);
      }
    }

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('ca-ES', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const calculateHours = (entry, exit) => {
      if (!entry || !exit) return '-';
      
      const [entryH, entryM] = entry.split(':').map(Number);
      const [exitH, exitM] = exit.split(':').map(Number);
      
      const entryMinutes = entryH * 60 + entryM;
      const exitMinutes = exitH * 60 + exitM;
      const diffMinutes = exitMinutes - entryMinutes;
      
      if (diffMinutes < 0) return '-';
      
      // Convertir a horas decimales y redondear a cuartos (0.25h)
      const decimalHours = diffMinutes / 60;
      const roundedHours = Math.round(decimalHours * 4) / 4;
      
      return `${roundedHours.toFixed(2)}h`;
    };

    const registresPorUsuario = computed(() => {
      if (!isSuperuser.value) return {};
      
      // Filtrar por proyecto primero
      let filteredRegistres = registres.value;
      if (filterProject.value !== 'all') {
        if (filterProject.value === 'none') {
          filteredRegistres = registres.value.filter(r => !r.project_id);
        } else {
          filteredRegistres = registres.value.filter(r => r.project_id === filterProject.value);
        }
      }
      
      // Agrupar por usuario
      const grouped = {};
      filteredRegistres.forEach(registre => {
        const userName = registre.name || 'Sense nom';
        if (!grouped[userName]) {
          grouped[userName] = [];
        }
        grouped[userName].push(registre);
      });
      
      return grouped;
    });

    const calculateUserTotalHours = (userEntries) => {
      let totalMinutes = 0;
      
      userEntries.forEach(registre => {
        if (registre.entry_time && registre.exit_time) {
          const [entryH, entryM] = registre.entry_time.split(':').map(Number);
          const [exitH, exitM] = registre.exit_time.split(':').map(Number);
          
          const entryMinutes = entryH * 60 + entryM;
          const exitMinutes = exitH * 60 + exitM;
          const diffMinutes = exitMinutes - entryMinutes;
          
          if (diffMinutes > 0) {
            totalMinutes += diffMinutes;
          }
        }
      });
      
      // Convertir a horas decimales y redondear a cuartos (0.25h)
      const decimalHours = totalMinutes / 60;
      const roundedHours = Math.round(decimalHours * 4) / 4;
      
      return `${roundedHours.toFixed(2)}h`;
    };

    const totalHours = computed(() => {
      let totalMinutes = 0;
      
      registres.value.forEach(registre => {
        if (registre.entry_time && registre.exit_time) {
          const [entryH, entryM] = registre.entry_time.split(':').map(Number);
          const [exitH, exitM] = registre.exit_time.split(':').map(Number);
          
          const entryMinutes = entryH * 60 + entryM;
          const exitMinutes = exitH * 60 + exitM;
          const diffMinutes = exitMinutes - entryMinutes;
          
          if (diffMinutes > 0) {
            totalMinutes += diffMinutes;
          }
        }
      });
      
      // Convertir a horas decimales y redondear a cuartos (0.25h)
      const decimalHours = totalMinutes / 60;
      const roundedHours = Math.round(decimalHours * 4) / 4;
      
      return `${roundedHours.toFixed(2)}h`;
    });

    const showMessage = (msg, type = 'success') => {
      message.value = msg;
      messageType.value = type;
      setTimeout(() => {
        message.value = '';
      }, 3000);
    };

    const saveEntry = async () => {
      loading.value = true;
      try {
        if (editingEntry.value) {
          // Update existing entry
          const { error } = await supabase
            .from('time_entries')
            .update({
              date: form.value.date,
              name: form.value.name,
              entry_time: form.value.entry_time,
              exit_time: form.value.exit_time || null,
              comment: form.value.comment || null,
              project_id: form.value.project_id || null
            })
            .eq('id', editingEntry.value.id);

          if (error) throw error;
          showMessage('Registre actualitzat correctament!', 'success');
        } else {
          // Insert new entry
          const { error } = await supabase
            .from('time_entries')
            .insert([{
              date: form.value.date,
              name: form.value.name,
              entry_time: form.value.entry_time,
              exit_time: form.value.exit_time || null,
              comment: form.value.comment || null,
              project_id: form.value.project_id || null
            }]);

          if (error) throw error;
          showMessage('Registre afegit correctament!', 'success');
        }

        // Reset form
        form.value = {
          date: new Date().toISOString().split('T')[0],
          name: userName.value,
          entry_time: '',
          exit_time: '',
          comment: '',
          project_id: null
        };
        editingEntry.value = null;
        
        await carregarRegistres();
      } catch (error) {
        console.error('Error:', error);
        showMessage('Error al guardar el registre: ' + error.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    const editEntry = (registre) => {
      editingEntry.value = registre;
      form.value = {
        date: registre.date,
        name: registre.name,
        entry_time: registre.entry_time,
        exit_time: registre.exit_time || '',
        comment: registre.comment || '',
        project_id: registre.project_id || null
      };
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
      editingEntry.value = null;
      form.value = {
        date: new Date().toISOString().split('T')[0],
        name: userName.value,
        entry_time: '',
        exit_time: '',
        comment: '',
        project_id: null
      };
    };

    const deleteEntry = async (id) => {
      if (!confirm('Estàs segur que vols eliminar aquest registre?')) return;
      
      try {
        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', id);

        if (error) throw error;

        showMessage('Registre eliminat correctament!', 'success');
        await carregarRegistres();
      } catch (error) {
        console.error('Error:', error);
        showMessage('Error al eliminar el registre: ' + error.message, 'error');
      }
    };

    const carregarRegistres = async () => {
      loadingRecords.value = true;
      try {
        let query = supabase
          .from('time_entries')
          .select(`
            *,
            proyectos:project_id (
              id,
              nombre
            )
          `)
          .order('date', { ascending: false })
          .order('entry_time', { ascending: false });

        // Si NO es superusuario, filtrar solo por su nombre
        if (!isSuperuser.value) {
          query = query.eq('name', userName.value);
        }

        // Apply date filter
        const now = new Date();
        if (filterPeriod.value === 'week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          query = query.gte('date', startOfWeek.toISOString().split('T')[0]);
        } else if (filterPeriod.value === 'month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          query = query.gte('date', startOfMonth.toISOString().split('T')[0]);
        }

        const { data, error } = await query;

        if (error) throw error;

        registres.value = data || [];
      } catch (error) {
        console.error('Error carregant registres:', error);
        showMessage('Error al carregar registres: ' + error.message, 'error');
      } finally {
        loadingRecords.value = false;
      }
    };

    const logout = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      router.push('/login');
    };

    const loadProyectos = async () => {
      try {
        const { data, error } = await supabase
          .from('proyectos')
          .select('id, nombre')
          .order('nombre', { ascending: true });

        if (error) throw error;
        proyectos.value = data || [];
      } catch (error) {
        console.error('Error carregant projectes:', error);
      }
    };

    onMounted(() => {
      loadProyectos();
      carregarRegistres();
    });

    return {
      form,
      loading,
      loadingRecords,
      message,
      messageType,
      registres,
      proyectos,
      filterPeriod,
      filterProject,
      editingEntry,
      totalHours,
      userName,
      isSuperuser,
      registresPorUsuario,
      calculateUserTotalHours,
      timeOptions,
      saveEntry,
      editEntry,
      cancelEdit,
      deleteEntry,
      carregarRegistres,
      formatDate,
      calculateHours,
      logout
    };
  }
};
</script>
