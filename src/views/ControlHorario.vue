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
            
            <!-- Campo Nom: hidden para usuarios, select para superusuarios -->
            <div v-if="isSuperuser">
              <label for="name" class="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Usuari
              </label>
              <select
                id="name"
                v-model="form.name"
                required
                class="w-full px-3 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">-- Selecciona usuari --</option>
                <option v-for="user in usuarios" :key="user.id" :value="user.full_name">
                  {{ user.full_name }}
                </option>
              </select>
            </div>
            <input v-else type="hidden" v-model="form.name" />

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

      <!-- Records Section (Solo Superusuario) -->
      <div v-if="isSuperuser" class="bg-white shadow-md rounded-xl p-4 sm:p-6">
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
            <button
              v-if="isSuperuser && filterProject !== 'all'"
              @click="deleteMassive"
              :disabled="registres.length === 0"
              class="w-full sm:w-auto px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 active:bg-red-900 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Eliminar tots els registres del projecte seleccionat"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
            <button
              @click="exportToPDF"
              :disabled="registres.length === 0"
              class="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 active:bg-red-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Exportar a PDF"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>

        <!-- Paginación superior -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mb-4">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ««
          </button>
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            «
          </button>
          <span class="px-4 py-2 text-sm font-medium text-gray-700">
            Pàgina {{ currentPage }} de {{ totalPages }}
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            »
          </button>
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            »»
          </button>
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
            <div v-for="(userEntries, userNameKey) in paginatedRegistresPorUsuario" :key="userNameKey" class="border border-gray-200 rounded-xl overflow-hidden">
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
                <tr v-for="registre in paginatedRegistres" :key="registre.id" class="hover:bg-gray-50">
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
            <div v-for="registre in paginatedRegistres" :key="registre.id" class="bg-white border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition">
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

          <!-- Paginación inferior -->
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-4">
            <button
              @click="currentPage = 1"
              :disabled="currentPage === 1"
              class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ««
            </button>
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>
            <span class="px-4 py-2 text-sm font-medium text-gray-700">
              Pàgina {{ currentPage }} de {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
            <button
              @click="currentPage = totalPages"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »»
            </button>
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
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const usuarios = ref([]);
    const filterProject = ref('all');
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    
    // Fichaje activo
    const activeFichaje = ref(null);
    const elapsedTime = ref('00:00:00');
    const fichajesHoy = ref([]);
    const fichajesSemanales = ref([]);
    let timerInterval = null;
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

    // Generar opciones de tiempo en cuartos de hora (15 minutos) - 7:00 a 21:00
    const timeOptions = ref([]);
    for (let hour = 7; hour <= 21; hour++) {
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

    // Paginación
    const paginatedRegistresPorUsuario = computed(() => {
      if (!isSuperuser.value) return {};
      
      const allEntries = Object.entries(registresPorUsuario.value);
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      
      // Paginar por registros individuales, no por usuarios
      let allRecords = [];
      allEntries.forEach(([userName, entries]) => {
        entries.forEach(entry => {
          allRecords.push({ userName, entry });
        });
      });
      
      const paginatedRecords = allRecords.slice(start, end);
      
      // Reagrupar
      const regrouped = {};
      paginatedRecords.forEach(({ userName, entry }) => {
        if (!regrouped[userName]) {
          regrouped[userName] = [];
        }
        regrouped[userName].push(entry);
      });
      
      return regrouped;
    });

    const paginatedRegistres = computed(() => {
      if (isSuperuser.value) return [];
      
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return registres.value.slice(start, end);
    });

    const totalPages = computed(() => {
      if (isSuperuser.value) {
        let totalRecords = 0;
        Object.values(registresPorUsuario.value).forEach(entries => {
          totalRecords += entries.length;
        });
        return Math.ceil(totalRecords / itemsPerPage.value);
      } else {
        return Math.ceil(registres.value.length / itemsPerPage.value);
      }
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
        // Para usuarios regulares, forzar el nombre del usuario logueado
        if (!isSuperuser.value) {
          form.value.name = userName.value;
        }
        
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

        // Sin filtro de fecha - siempre mostrar todo

        const { data, error } = await query;

        if (error) throw error;

        registres.value = data || [];
        currentPage.value = 1; // Reset a la primera página
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

    const loadUsuarios = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, full_name, username')
          .order('full_name', { ascending: true });

        if (error) throw error;
        usuarios.value = data || [];
      } catch (error) {
        console.error('Error carregant usuaris:', error);
      }
    };

    // ========== FICHAJE RÁPIDO ==========
    
    // Cargar fichajes del día actual
    const loadFichajesHoy = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('fichajes')
          .select('*')
          .eq('date', today)
          .eq('name', userName.value)
          .order('created_at', { ascending: true });

        if (error) throw error;
        fichajesHoy.value = data || [];
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
        
        const { data, error } = await supabase
          .from('fichajes')
          .select('*')
          .eq('name', userName.value)
          .gte('date', startDateStr)
          .order('date', { ascending: true })
          .order('created_at', { ascending: true });

        if (error) throw error;
        fichajesSemanales.value = data || [];
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
        const { data: newFichaje, error: insertError } = await supabase
          .from('fichajes')
          .insert([{
            date: today,
            name: userName.value,
            entry_time: entry_time,
            exit_time: null
          }])
          .select()
          .single();

        if (insertError) throw insertError;

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
        const { error } = await supabase
          .from('fichajes')
          .update({ exit_time: exit_time })
          .eq('id', activeFichaje.value.id);

        if (error) throw error;
        
        // Limpiar fichaje activo
        clearInterval(timerInterval);
        activeFichaje.value = null;
        elapsedTime.value = '00:00:00';
        localStorage.removeItem('activeFichaje');
        
        // Recargar fichajes del día
        await loadFichajesHoy();
        await loadFichajesSemanales();
        await carregarRegistres();
        
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
          const { data: openFichajes, error } = await supabase
            .from('fichajes')
            .select('*')
            .eq('date', today)
            .eq('name', userName.value)
            .is('exit_time', null)
            .order('created_at', { ascending: false })
            .limit(1);

          if (!error && openFichajes && openFichajes.length > 0) {
            // Hay un fichaje abierto, restaurarlo
            const fichaje = openFichajes[0];
            activeFichaje.value = {
              id: fichaje.id,
              date: fichaje.date,
              name: fichaje.name,
              entry_time: fichaje.entry_time
            };
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

    const deleteMassive = async () => {
      if (!isSuperuser.value || filterProject.value === 'all') {
        showMessage('Selecciona un projecte específic per eliminar registres', 'error');
        return;
      }

      // Obtener información del proyecto seleccionado
      let projectInfo = '';
      let confirmMessage = '';
      
      if (filterProject.value === 'none') {
        projectInfo = 'sense projecte';
        confirmMessage = `Estàs segur que vols eliminar TOTS els registres sense projecte?\n\n⚠️ Aquesta acció no es pot desfer!\n\nRegistres a eliminar: ${registres.value.length}`;
      } else {
        const project = proyectos.value.find(p => p.id === filterProject.value);
        if (project) {
          projectInfo = `del projecte "${project.nombre}"`;
          confirmMessage = `Estàs segur que vols eliminar TOTS els registres del projecte "${project.nombre}"?\n\n⚠️ Aquesta acció no es pot desfer!\n\nRegistres a eliminar: ${registres.value.length}`;
        }
      }

      if (!confirm(confirmMessage)) return;

      // Doble confirmación para operaciones masivas
      if (!confirm('⚠️ ÚLTIMA CONFIRMACIÓ!\n\nAixò eliminarà definitivament tots aquests registres. Continuar?')) return;

      loading.value = true;
      try {
        // Construir la query de eliminación
        let deleteQuery = supabase.from('time_entries').delete();

        if (filterProject.value === 'none') {
          // Eliminar registros sin proyecto
          deleteQuery = deleteQuery.is('project_id', null);
        } else {
          // Eliminar registros del proyecto específico
          deleteQuery = deleteQuery.eq('project_id', filterProject.value);
        }

        const { error, count } = await deleteQuery;

        if (error) throw error;

        showMessage(`S'han eliminat correctament tots els registres ${projectInfo}!`, 'success');
        
        // Resetear filtro y recargar
        filterProject.value = 'all';
        await carregarRegistres();
      } catch (error) {
        console.error('Error eliminant registres:', error);
        showMessage('Error al eliminar els registres: ' + error.message, 'error');
      } finally {
        loading.value = false;
      }
    };

    const exportToPDF = () => {
      const doc = new jsPDF();
      
      // Configuración
      const isProjectFilter = filterProject.value !== 'all';
      const selectedProject = isProjectFilter && filterProject.value !== 'none' 
        ? proyectos.value.find(p => p.id === filterProject.value) 
        : null;
      
      // Título del documento
      doc.setFontSize(18);
      doc.setTextColor(234, 88, 12); // Orange-600
      doc.text('Control Horari - Fusteria Joan Ribalta', 14, 20);
      
      // Si es de un proyecto específico, mostrarlo en grande
      if (selectedProject) {
        doc.setFontSize(16);
        doc.setTextColor(234, 88, 12);
        doc.text(`Projecte: ${selectedProject.nombre}`, 14, 32);
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.text(`Data generació: ${new Date().toLocaleDateString('ca-ES')}`, 14, 40);
      } else {
        // Información del filtro
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        let filterText = 'Tots els registres';
        
        if (filterProject.value === 'none') {
          filterText = 'Registres sense projecte';
        }
        
        doc.text(filterText, 14, 28);
        doc.text(`Data generació: ${new Date().toLocaleDateString('ca-ES')}`, 14, 34);
      }
      
      // Preparar datos según si es superusuario o no
      let yPosition = selectedProject ? 48 : 42;
      
      if (isSuperuser.value) {
        // Para superusuarios: agrupar por usuario
        Object.entries(registresPorUsuario.value).forEach(([userName, userEntries], index) => {
          if (index > 0) {
            yPosition += 10; // Espacio entre usuarios
          }
          
          // Nombre del usuario
          doc.setFontSize(12);
          doc.setTextColor(234, 88, 12);
          doc.text(`${userName}`, 14, yPosition);
          
          // Total de horas del usuario
          const userTotal = calculateUserTotalHours(userEntries);
          doc.setFontSize(10);
          doc.setTextColor(75, 85, 99);
          doc.text(`Total: ${userTotal}`, 14, yPosition + 6);
          
          yPosition += 10;
          
          // Tabla de registros del usuario
          let tableData;
          let tableHead;
          
          if (selectedProject) {
            // Si es de un proyecto específico, NO mostrar columna de proyecto
            tableData = userEntries.map(registre => [
              formatDate(registre.date),
              registre.entry_time,
              registre.exit_time || '-',
              calculateHours(registre.entry_time, registre.exit_time),
              registre.comment ? (registre.comment.length > 60 ? registre.comment.substring(0, 57) + '...' : registre.comment) : '-'
            ]);
            tableHead = [['Data', 'Entrada', 'Sortida', 'Hores', 'Comentari']];
          } else {
            // Mostrar columna de proyecto
            tableData = userEntries.map(registre => [
              formatDate(registre.date),
              registre.proyectos ? registre.proyectos.nombre : '-',
              registre.entry_time,
              registre.exit_time || '-',
              calculateHours(registre.entry_time, registre.exit_time),
              registre.comment ? (registre.comment.length > 50 ? registre.comment.substring(0, 47) + '...' : registre.comment) : '-'
            ]);
            tableHead = [['Data', 'Projecte', 'Entrada', 'Sortida', 'Hores', 'Comentari']];
          }
          
          autoTable(doc, {
            startY: yPosition,
            head: tableHead,
            body: tableData,
            theme: 'striped',
            headStyles: { 
              fillColor: [234, 88, 12], // Orange-600
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: 'bold'
            },
            bodyStyles: {
              fontSize: 8,
              textColor: [31, 41, 55] // Gray-800
            },
            alternateRowStyles: {
              fillColor: [249, 250, 251] // Gray-50
            },
            columnStyles: selectedProject ? {
              0: { cellWidth: 25 }, // Data
              1: { cellWidth: 22 }, // Entrada
              2: { cellWidth: 22 }, // Sortida
              3: { cellWidth: 20 }, // Hores
              4: { cellWidth: 'auto' } // Comentari
            } : {
              0: { cellWidth: 25 }, // Data
              1: { cellWidth: 35 }, // Projecte
              2: { cellWidth: 20 }, // Entrada
              3: { cellWidth: 20 }, // Sortida
              4: { cellWidth: 18 }, // Hores
              5: { cellWidth: 'auto' } // Comentari
            },
            margin: { top: 10 }
          });
          
          yPosition = doc.lastAutoTable.finalY + 5;
          
          // Añadir nueva página si es necesario
          if (yPosition > 250 && index < Object.entries(registresPorUsuario.value).length - 1) {
            doc.addPage();
            yPosition = 20;
          }
        });
      } else {
        // Para usuarios normales: lista simple
        let tableData;
        let tableHead;
        
        if (selectedProject) {
          // Si es de un proyecto específico, NO mostrar columna de proyecto
          tableData = registres.value.map(registre => [
            formatDate(registre.date),
            registre.entry_time,
            registre.exit_time || '-',
            calculateHours(registre.entry_time, registre.exit_time),
            registre.comment ? (registre.comment.length > 60 ? registre.comment.substring(0, 57) + '...' : registre.comment) : '-'
          ]);
          tableHead = [['Data', 'Entrada', 'Sortida', 'Hores', 'Comentari']];
        } else {
          // Mostrar columna de proyecto
          tableData = registres.value.map(registre => [
            formatDate(registre.date),
            registre.proyectos ? registre.proyectos.nombre : '-',
            registre.entry_time,
            registre.exit_time || '-',
            calculateHours(registre.entry_time, registre.exit_time),
            registre.comment ? (registre.comment.length > 50 ? registre.comment.substring(0, 47) + '...' : registre.comment) : '-'
          ]);
          tableHead = [['Data', 'Projecte', 'Entrada', 'Sortida', 'Hores', 'Comentari']];
        }
        
        autoTable(doc, {
          startY: yPosition,
          head: tableHead,
          body: tableData,
          theme: 'striped',
          headStyles: { 
            fillColor: [234, 88, 12],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [31, 41, 55]
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          columnStyles: selectedProject ? {
            0: { cellWidth: 25 },
            1: { cellWidth: 22 },
            2: { cellWidth: 22 },
            3: { cellWidth: 20 },
            4: { cellWidth: 'auto' }
          } : {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 18 },
            5: { cellWidth: 'auto' }
          },
          margin: { top: 10 }
        });
        
        yPosition = doc.lastAutoTable.finalY;
      }
      
      // Total general al final
      yPosition += 10;
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(234, 88, 12);
      doc.setFillColor(234, 88, 12);
      doc.rect(14, yPosition, 182, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(`TOTAL HORES: ${totalHours.value}`, 20, yPosition + 7);
      
      // Generar nombre del archivo
      let fileName = 'control-horari';
      if (selectedProject) {
        fileName += `-${selectedProject.nombre.toLowerCase().replace(/\s+/g, '-')}`;
      } else if (filterProject.value === 'none') {
        fileName += '-sense-projecte';
      }
      fileName += `-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Abrir el PDF en lugar de descargarlo
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      showMessage('PDF generat correctament!', 'success');
    };

    onMounted(() => {
      loadProyectos();
      if (isSuperuser.value) {
        loadUsuarios();
      }
      carregarRegistres();
      loadActiveFichaje();
    });

    onUnmounted(() => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    });

    return {
      form,
      loading,
      loadingRecords,
      message,
      messageType,
      registres,
      proyectos,
      usuarios,
      filterProject,
      currentPage,
      totalPages,
      editingEntry,
      totalHours,
      userName,
      isSuperuser,
      registresPorUsuario,
      paginatedRegistresPorUsuario,
      paginatedRegistres,
      calculateUserTotalHours,
      timeOptions,
      activeFichaje,
      elapsedTime,
      elapsedTimeFormatted,
      todayHours,
      weeklyHours,
      progressPercentage,
      startFichaje,
      stopFichaje,
      saveEntry,
      editEntry,
      cancelEdit,
      deleteEntry,
      deleteMassive,
      carregarRegistres,
      formatDate,
      formatDateShort,
      calculateHours,
      exportToPDF,
      logout
    };
  }
};
</script>
