<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header Sticky -->
    <div class="sticky top-0 z-50 bg-orange-600 shadow-lg">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img class="h-10 w-10 rounded-lg shadow-md" src="@/assets/logo.jpg" alt="Logo">
            <div>
              <h1 class="text-base sm:text-lg font-bold text-white">Control Usuari</h1>
              <p class="text-xs text-orange-100">Fitxatge i Hores</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <router-link
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
      <!-- Filters Section -->
      <div class="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
        <h2 class="text-lg sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          Filtres
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Selector de Usuario -->
          <div>
            <label for="usuario" class="block text-sm font-medium text-gray-700 mb-2">
              Selecciona Usuari
            </label>
            <select
              id="usuario"
              v-model="selectedUserId"
              @change="loadFichajes"
              class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">-- Selecciona un usuari --</option>
              <option v-for="user in usuarios" :key="user.id" :value="user.id">
                {{ user.full_name }}
              </option>
            </select>
          </div>

          <!-- Selector de Período -->
          <div>
            <label for="periodo" class="block text-sm font-medium text-gray-700 mb-2">
              Període
            </label>
            <select
              id="periodo"
              v-model="filterPeriod"
              @change="loadFichajes"
              class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="week">Setmana Actual</option>
              <option value="month">Mes Actual</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div v-if="selectedUserId" class="bg-white shadow-md rounded-xl p-4 sm:p-6">
        <h2 class="text-lg sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Resum de Fitxatges
        </h2>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p class="mt-2 text-gray-600">Carregant fitxatges...</p>
        </div>

        <!-- No data -->
        <div v-else-if="fichajesPorDia.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="mt-2 text-gray-600">No hi ha fitxatges en aquest període</p>
        </div>

        <!-- Results -->
        <div v-else>
          <!-- Table with Progress Bars - Desktop -->
          <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hores Treballades
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progrés
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aprovació
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="dia in fichajesPorDia" :key="dia.date" class="hover:bg-gray-50 cursor-pointer" @click="openDayModal(dia.date)">
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ formatDate(dia.date) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatDayOfWeek(dia.date) }}
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="text-lg font-bold text-gray-900">
                    {{ dia.totalFormatted }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ dia.numSessions }} {{ dia.numSessions === 1 ? 'sessió' : 'sessions' }}
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 rounded-full h-4 mr-3">
                      <div 
                        class="h-4 rounded-full transition-all duration-300"
                        :class="dia.percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'"
                        :style="{ width: Math.min(dia.percentage, 100) + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm font-semibold text-gray-700 min-w-[50px]">
                      {{ dia.percentage.toFixed(0) }}%
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <div v-if="dia.approvalStatus === 'all'" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Tot Acceptat
                  </div>
                  <div v-else-if="dia.approvalStatus === 'partial'" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    {{ dia.acceptedCount }}/{{ dia.totalCount }}
                  </div>
                  <div v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Pendent
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td class="px-4 py-4 text-sm font-bold text-gray-900">
                  TOTAL
                </td>
                <td class="px-4 py-4 text-lg font-bold text-orange-600">
                  {{ totalHoras }}
                </td>
                <td class="px-4 py-4" colspan="2">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 rounded-full h-5 mr-3">
                      <div 
                        class="h-5 rounded-full transition-all duration-300"
                        :class="totalPercentage >= 100 ? 'bg-green-500' : 'bg-orange-500'"
                        :style="{ width: Math.min(totalPercentage, 100) + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm font-semibold text-gray-700 min-w-[50px]">
                      {{ totalPercentage.toFixed(0) }}%
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Cards - Mobile -->
        <div class="md:hidden space-y-3">
          <div v-for="dia in fichajesPorDia" :key="dia.date" 
            class="bg-white rounded-lg shadow-md p-4 border-l-4 cursor-pointer hover:shadow-lg transition"
            :class="{
              'border-green-500': dia.approvalStatus === 'all',
              'border-yellow-500': dia.approvalStatus === 'partial',
              'border-gray-300': dia.approvalStatus === 'none'
            }"
            @click="openDayModal(dia.date)">
            <!-- Header -->
            <div class="flex justify-between items-start mb-3">
              <div>
                <div class="text-base font-bold text-gray-900">
                  {{ formatDate(dia.date) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatDayOfWeek(dia.date) }}
                </div>
              </div>
              <div v-if="dia.approvalStatus === 'all'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Acceptat
              </div>
              <div v-else-if="dia.approvalStatus === 'partial'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                {{ dia.acceptedCount }}/{{ dia.totalCount }}
              </div>
              <div v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                Pendent
              </div>
            </div>

            <!-- Horas -->
            <div class="flex items-center justify-between mb-3">
              <div>
                <div class="text-xs text-gray-600 mb-1">Hores Treballades</div>
                <div class="text-2xl font-bold text-gray-900">{{ dia.totalFormatted }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-600 mb-1">Sessions</div>
                <div class="text-lg font-semibold text-gray-700">{{ dia.numSessions }}</div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs text-gray-600">Progrés del dia</span>
                <span class="text-xs font-semibold text-gray-700">{{ dia.percentage.toFixed(0) }}%</span>
              </div>
              <div class="bg-gray-200 rounded-full h-3">
                <div 
                  class="h-3 rounded-full transition-all duration-300"
                  :class="dia.percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'"
                  :style="{ width: Math.min(dia.percentage, 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Total Card -->
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <div>
                <div class="text-sm text-orange-100">Total del Període</div>
                <div class="text-3xl font-bold text-white">{{ totalHoras }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm text-orange-100">Progrés</div>
                <div class="text-2xl font-bold text-white">{{ totalPercentage.toFixed(0) }}%</div>
              </div>
            </div>
            <div class="bg-white bg-opacity-20 rounded-full h-4">
              <div 
                class="h-4 rounded-full bg-white transition-all duration-300"
                :style="{ width: Math.min(totalPercentage, 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white shadow-md rounded-xl p-8 text-center">
        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <p class="mt-4 text-lg text-gray-600">Selecciona un usuari per veure els seus fitxatges</p>
      </div>
    </div>

    <!-- Modal de Edición de Fichajes del Día -->
    <div v-if="showDayModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeDayModal">
      <div class="flex items-center justify-center min-h-screen px-2 sm:px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Overlay -->
        <div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" @click="closeDayModal"></div>

        <!-- Modal -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full sm:w-full">
          <!-- Header -->
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 px-4 sm:px-6 py-3 sm:py-4">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg sm:text-xl font-bold text-white truncate">
                  Fitxatges del {{ formatDate(selectedDay) }}
                </h3>
                <p class="text-orange-100 text-xs sm:text-sm mt-1 truncate">
                  {{ selectedUser?.full_name }} - {{ formatDayOfWeek(selectedDay) }}
                </p>
              </div>
              <button @click="closeDayModal" class="text-white hover:text-orange-100 ml-2 flex-shrink-0">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="px-3 sm:px-6 py-4 max-h-[70vh] overflow-y-auto bg-gray-50">
            <div v-if="dayFichajes.length === 0" class="text-center py-8 text-gray-500">
              No hi ha fitxatges per aquest dia
            </div>
            
            <!-- Resumen del día -->
            <div v-else class="mb-3 sm:mb-4 bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
              <div class="grid grid-cols-3 gap-2 sm:gap-4">
                <div class="text-center sm:text-left">
                  <p class="text-xs sm:text-sm text-gray-600">Sessions</p>
                  <p class="text-xl sm:text-2xl font-bold text-gray-900">{{ dayFichajes.length }}</p>
                </div>
                <div class="text-center sm:text-left">
                  <p class="text-xs sm:text-sm text-gray-600">Total</p>
                  <p class="text-xl sm:text-2xl font-bold text-orange-600">{{ calculateDayTotal() }}</p>
                </div>
                <div class="text-center sm:text-left">
                  <p class="text-xs sm:text-sm text-gray-600">Aprovació</p>
                  <p class="text-xs sm:text-sm font-medium" :class="allAccepted() ? 'text-green-600' : 'text-yellow-600'">
                    {{ acceptedCount() }}/{{ dayFichajes.length }}
                  </p>
                </div>
              </div>
            </div>
            
            <div v-if="dayFichajes.length > 0" class="space-y-3">
              <div v-for="(fichaje, index) in dayFichajes" :key="fichaje.id" class="bg-white rounded-lg shadow-sm border-2 overflow-hidden"
                :class="{
                  'border-green-500 bg-green-50': fichaje.accepted,
                  'border-yellow-500 bg-yellow-50': fichaje.edited && !fichaje.accepted,
                  'border-gray-200': !fichaje.edited && !fichaje.accepted
                }">
                <!-- Header del fichaje -->
                <div class="px-4 py-2 border-b" :class="{
                  'bg-green-100 border-green-200': fichaje.accepted,
                  'bg-yellow-100 border-yellow-200': fichaje.edited && !fichaje.accepted,
                  'bg-gray-100 border-gray-200': !fichaje.edited && !fichaje.accepted
                }">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-gray-700">Sessió {{ index + 1 }}</span>
                      <span v-if="fichaje.accepted" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-600 text-white">
                        Acceptat
                      </span>
                      <span v-if="fichaje.edited" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-600 text-white">
                        Editat
                      </span>
                    </div>
                    <div class="text-sm font-semibold" :class="{
                      'text-green-700': fichaje.accepted,
                      'text-yellow-700': fichaje.edited && !fichaje.accepted,
                      'text-gray-700': !fichaje.edited && !fichaje.accepted
                    }">
                      {{ calculateDuration(fichaje) }}
                    </div>
                  </div>
                </div>

                <!-- Formulario de Edición -->
                <div class="p-3 sm:p-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Hora d'Entrada</label>
                      <input 
                        type="time" 
                        step="1"
                        v-model="fichaje.entry_time"
                        class="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <div v-if="fichaje.original_entry_time" class="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p class="text-xs font-medium text-blue-700">Hora original</p>
                        <p class="text-xs sm:text-sm font-semibold text-blue-900">{{ fichaje.original_entry_time }}</p>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Hora de Sortida</label>
                      <input 
                        type="time" 
                        step="1"
                        v-model="fichaje.exit_time"
                        class="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <div v-if="fichaje.original_exit_time" class="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p class="text-xs font-medium text-blue-700">Hora original</p>
                        <p class="text-xs sm:text-sm font-semibold text-blue-900">{{ fichaje.original_exit_time }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Info de Edición -->
                  <div v-if="fichaje.edited_at" class="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-100 rounded-lg border border-gray-300">
                    <p class="text-xs font-medium text-gray-600 mb-1">Històric d'edició</p>
                    <p class="text-xs sm:text-sm text-gray-800">
                      <span class="font-semibold">{{ fichaje.edited_by }}</span> va editar aquest registre el 
                      <span class="font-semibold">{{ formatDateTime(fichaje.edited_at) }}</span>
                    </p>
                  </div>

                  <!-- Botones de Acción -->
                  <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button 
                      @click="saveFichaje(fichaje)"
                      class="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-sm text-sm"
                    >
                      <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                      </svg>
                      Guardar Canvis
                    </button>
                    <button 
                      @click="toggleAccepted(fichaje)"
                      class="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition shadow-sm text-sm"
                      :class="fichaje.accepted 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-300' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'"
                    >
                      <svg v-if="!fichaje.accepted" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <svg v-else class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      {{ fichaje.accepted ? 'Rebutjar' : 'Acceptar' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-100 px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0 border-t border-gray-300">
            <button 
              @click="acceptAllDay"
              class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition shadow-sm text-sm order-2 sm:order-1"
              :disabled="allAccepted()"
              :class="allAccepted() ? 'opacity-50 cursor-not-allowed' : ''"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Acceptar Tot
            </button>
            <button 
              @click="closeDayModal"
              class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition text-sm order-1 sm:order-2"
            >
              Tancar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '@/supabase';
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
    const currentUserName = localStorage.getItem('userFullName');

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

    const loadUsuarios = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, full_name, username, role')
          .eq('role', 'usuario')
          .order('full_name', { ascending: true });

        if (error) throw error;
        usuarios.value = data || [];
        
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
        const user = usuarios.value.find(u => u.id === selectedUserId.value);
        if (!user) return;

        let query = supabase
          .from('fichajes')
          .select('*')
          .eq('name', user.full_name)
          .not('exit_time', 'is', null)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false });

        // Apply date filter
        const now = new Date();
        if (filterPeriod.value === 'week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lunes
          startOfWeek.setHours(0, 0, 0, 0);
          query = query.gte('date', startOfWeek.toISOString().split('T')[0]);
        } else if (filterPeriod.value === 'month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          query = query.gte('date', startOfMonth.toISOString().split('T')[0]);
        }

        const { data, error } = await query;

        if (error) throw error;
        fichajes.value = data || [];
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
        const user = usuarios.value.find(u => u.id === selectedUserId.value);
        if (!user) return;

        const { data, error } = await supabase
          .from('fichajes')
          .select('*')
          .eq('name', user.full_name)
          .eq('date', date)
          .order('entry_time', { ascending: true });

        if (error) throw error;
        dayFichajes.value = data || [];
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
        const updates = {
          entry_time: fichaje.entry_time,
          exit_time: fichaje.exit_time
        };

        // Si es la primera edición, guardar las horas originales
        if (!fichaje.edited) {
          // Cargar el fichaje original de la BD
          const { data: originalData } = await supabase
            .from('fichajes')
            .select('entry_time, exit_time')
            .eq('id', fichaje.id)
            .single();

          if (originalData) {
            updates.original_entry_time = originalData.entry_time;
            updates.original_exit_time = originalData.exit_time;
          }
        }

        updates.edited = true;
        updates.edited_at = new Date().toISOString();
        updates.edited_by = currentUserName;

        const { error } = await supabase
          .from('fichajes')
          .update(updates)
          .eq('id', fichaje.id);

        if (error) throw error;

        // Actualizar localmente
        if (!fichaje.edited) {
          fichaje.original_entry_time = updates.original_entry_time;
          fichaje.original_exit_time = updates.original_exit_time;
        }
        fichaje.edited = true;
        fichaje.edited_at = updates.edited_at;
        fichaje.edited_by = updates.edited_by;

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
        
        const { error } = await supabase
          .from('fichajes')
          .update({ accepted: newAcceptedValue })
          .eq('id', fichaje.id);

        if (error) throw error;

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
          .map(f => 
            supabase
              .from('fichajes')
              .update({ accepted: true })
              .eq('id', f.id)
          );
        
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

    const logout = async () => {
      await supabase.auth.signOut();
      localStorage.removeItem('userFullName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
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
