<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a href="/" class="flex-shrink-0 mr-5">
              <img class="h-10 w-auto" src="@/assets/logo.jpg" alt="Logo">
            </a>
            <h1 class="text-xl font-bold text-gray-900">Àrea Privada</h1>
          </div>
          <div class="flex items-center">
            <button @click="logout" class="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              Tancar Sessió
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Navigation Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Image Management Tab -->
      <div v-if="activeTab === 'images'" class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-medium text-gray-900">Gestió d'Imatges</h2>
          <div class="flex items-center space-x-2">
            <!-- Back Button - Only show when in a subfolder -->
            <button 
              v-if="currentFolder !== ''"
              @click="goBack"
              class="px-4 py-2 rounded-md text-sm font-medium border shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center"
            >
              <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              Enrere
            </button>
            
            <div v-if="currentFolder" class="flex items-center text-sm font-medium text-gray-700">
              <span class="mx-1">/</span>
              <span class="text-orange-600">{{ currentFolder }}</span>
            </div>
          </div>
        </div>

        <!-- Upload Area -->
        <div 
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 text-center"
          @dragover.prevent="dragover = true"
          @dragleave.prevent="dragover = false"
          @drop.prevent="handleDrop($event)"
          :class="{ 'border-orange-500 bg-orange-50': dragover }"
        >
          <div v-if="uploading">
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-10 w-10 border-t-4 border-orange-500 border-solid"></div>
              <span class="ml-3 text-sm font-medium text-gray-700">Pujant arxius... {{ Math.round(uploadProgress) }}%</span>
            </div>
          </div>
          <div v-else>
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="mt-2 text-sm text-gray-600">
              Arrossega imatges aquí o
              <label class="cursor-pointer text-orange-600 hover:text-orange-500">
                <span>selecciona arxius</span>
                <input type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
              </label>
            </p>
            <p class="mt-1 text-xs text-gray-500">
              PNG, JPG, WEBP fins a 10MB
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-solid"></div>
          <span class="ml-3 text-sm font-medium text-gray-700">Carregant imatges...</span>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="p-4 bg-red-50 rounded-md">
          <div class="flex">
            <div class="shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Folders Section -->
        <div v-else-if="folders.length > 0" class="mb-8">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Carpetes</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div 
              v-for="folder in folders" 
              :key="folder.name"
              @click="navigateToFolder(folder.name)"
              class="group relative bg-white border border-gray-200 rounded-md p-2 hover:shadow-md cursor-pointer transition-all"
            >
              <div class="aspect-square flex items-center justify-center bg-orange-50 rounded mb-2">
                <svg class="h-10 w-10 text-orange-400 group-hover:text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clip-rule="evenodd" />
                  <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
                </svg>
              </div>
              <p class="text-sm text-center text-gray-700 truncate group-hover:text-orange-600">{{ folder.name }}</p>
              <button 
                @click.stop="promptDeleteFolder(folder.name)" 
                class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-white rounded-full shadow hover:bg-red-50"
              >
                <svg class="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            
            <!-- New Folder Button -->
            <div 
              @click="showNewFolderDialog = true"
              class="bg-white border border-gray-200 border-dashed rounded-md p-2 hover:shadow-md cursor-pointer transition-all"
            >
              <div class="aspect-square flex items-center justify-center bg-gray-50 rounded mb-2">
                <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-sm text-center text-gray-500">Nova Carpeta</p>
            </div>
          </div>
        </div>

        <!-- Images Grid -->
        <div v-if="!loading && !error">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Imatges</h3>
          <div v-if="images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div 
              v-for="image in images" 
              :key="image.name"
              class="group relative bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-all"
            >
              <div class="aspect-square bg-gray-100 relative overflow-hidden">
                <img 
                  :src="image.url" 
                  :alt="image.name" 
                  class="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div class="p-2">
                <p class="text-xs text-gray-500 truncate">{{ image.name }}</p>
              </div>
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button 
                  @click="deleteImage(image)"
                  class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-else class="py-10 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
            </svg>
            <p class="mt-2 text-sm text-gray-500">No hi ha imatges en aquesta carpeta</p>
          </div>
        </div>
      </div>
      
      <!-- Control Horario Tab -->
      <div v-if="activeTab === 'control_horario'" class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-medium text-gray-900">Control Horario</h2>
        </div>
        
        <!-- Calendar View -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Calendari</h3>
          <div class="bg-white border border-gray-200 rounded-lg shadow">
            <div class="p-4 flex justify-between items-center border-b">
              <button @click="previousMonth" class="p-1 hover:bg-gray-100 rounded-full">
                <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 class="text-lg font-medium text-gray-900">{{ currentMonthName }} {{ currentYear }}</h2>
              <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded-full">
                <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-7 gap-px bg-gray-200">
              <div v-for="day in daysOfWeek" :key="day" class="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                {{ day }}
              </div>
              <template v-for="(day, index) in calendarDays" :key="index">
                <div 
                  class="bg-white p-2 min-h-[80px] relative"
                  :class="{
                    'bg-gray-50': !day.isCurrentMonth,
                    'border-orange-500 border-2': day.isToday
                  }"
                >
                  <span class="text-sm" :class="day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'">
                    {{ day.date.getDate() }}
                  </span>
                  <!-- Indicator for days with entries -->
                  <div 
                    v-if="day.hasEntries" 
                    class="absolute top-2 right-2 h-2 w-2 bg-orange-500 rounded-full"
                    :title="`${day.entriesCount} registres`"
                  ></div>
                  <!-- Display entries count if any -->
                  <div v-if="day.hasEntries" class="mt-1">
                    <span @click="viewDayEntries(day.date)" class="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded cursor-pointer hover:bg-orange-200">
                      {{ day.entriesCount }} registres
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Time Entry Form -->
        <div class="mb-8">
          <h3 class="text-sm font-medium text-gray-700 mb-3">Registrar Control Horari</h3>
          <div class="bg-white border border-gray-200 rounded-lg shadow p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input 
                  type="date" 
                  v-model="timeEntry.date" 
                  class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <select
                  v-model="timeEntry.name"
                  class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Javier">Javier</option>
                  <option value="Joan">Joan</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora d'entrada</label>
                <input 
                  type="time" 
                  v-model="timeEntry.entryTime" 
                  class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora de sortida</label>
                <input 
                  type="time" 
                  v-model="timeEntry.exitTime" 
                  class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div class="md:col-span-2 lg:col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Comentari (opcional)</label>
                <input 
                  type="text" 
                  v-model="timeEntry.comment" 
                  placeholder="Comentari opcional" 
                  class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <button 
                @click="submitTimeEntry"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                :disabled="!isFormValid || submittingEntry"
              >
                <span v-if="submittingEntry" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardant...
                </span>
                <span v-else>Guardar Registre</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Time Entries Table -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Registres</h3>
          
          <!-- Date selector -->
          <div class="flex items-center mb-4 space-x-2">
            <input 
              type="date" 
              v-model="selectedDateFilter"
              class="border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
            <button 
              @click="loadTimeEntriesForDate"
              class="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Filtrar
            </button>
            <button 
              @click="clearDateFilter"
              class="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Mostrar Tots
            </button>
          </div>
          
          <!-- Loading state -->
          <div v-if="loadingEntries" class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-solid"></div>
            <span class="ml-3 text-sm font-medium text-gray-700">Carregant registres...</span>
          </div>
          
          <!-- Entries table -->
          <div v-else-if="timeEntries.length > 0" class="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sortida</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hores</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentari</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="entry in timeEntries" :key="entry.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(entry.date) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ entry.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ entry.entry_time }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ entry.exit_time || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ calculateHours(entry.entry_time, entry.exit_time) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ entry.comment || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      @click="editTimeEntry(entry)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button 
                      @click="deleteTimeEntry(entry.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-10 text-center bg-white border border-gray-200 rounded-lg">
            <svg class="mx-auto h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="mt-2 text-sm text-gray-500">No hi ha registres per mostrar</p>
          </div>
        </div>
      </div>
      
      <!-- Other Tabs Content -->
      <div v-else-if="activeTab !== 'images' && activeTab !== 'control_horario'" class="bg-white shadow rounded-lg p-6">
        <p>Contingut en desenvolupament per a la pestanya {{ activeTab }}</p>
      </div>
    </div>

    <!-- New Folder Dialog -->
    <div v-if="showNewFolderDialog" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 transition-opacity" @click="showNewFolderDialog = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div class="px-6 py-4">
            <h3 class="text-lg font-medium text-gray-900">Nova Carpeta</h3>
            <div class="mt-4">
              <input 
                type="text" 
                v-model="newFolderName" 
                placeholder="Nom de la carpeta" 
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
              <p v-if="folderError" class="mt-2 text-sm text-red-600">{{ folderError }}</p>
            </div>
          </div>
          <div class="bg-gray-50 px-6 py-3 flex justify-end">
            <button 
              type="button" 
              class="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              @click="showNewFolderDialog = false"
            >
              Cancel·lar
            </button>
            <button 
              type="button" 
              class="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
              @click="createFolder"
            >
              Crear
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteDialog" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 transition-opacity" @click="showDeleteDialog = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div class="px-6 py-4">
            <h3 class="text-lg font-medium text-gray-900">Confirmar Eliminació</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Estàs segur que vols eliminar {{ itemToDelete?.type === 'folder' ? 'la carpeta' : 'aquesta imatge' }}? 
                Aquesta acció no es pot desfer.
              </p>
            </div>
          </div>
          <div class="bg-gray-50 px-6 py-3 flex justify-end">
            <button 
              type="button" 
              class="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              @click="showDeleteDialog = false"
            >
              Cancel·lar
            </button>
            <button 
              type="button" 
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              @click="confirmDelete"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Entry Dialog -->
    <div v-if="showEditDialog" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 transition-opacity" @click="showEditDialog = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div class="px-6 py-4">
            <h3 class="text-lg font-medium text-gray-900">Editar Registre</h3>
            <div class="mt-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input 
                  type="date" 
                  v-model="editingEntry.date" 
                  class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <select
                  v-model="editingEntry.name"
                  class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Javier">Javier</option>
                  <option value="Joan">Joan</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora d'entrada</label>
                  <input 
                    type="time" 
                    v-model="editingEntry.entry_time" 
                    class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora de sortida</label>
                  <input 
                    type="time" 
                    v-model="editingEntry.exit_time" 
                    class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Comentari</label>
                <input 
                  type="text" 
                  v-model="editingEntry.comment" 
                  class="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-6 py-3 flex justify-end">
            <button 
              type="button" 
              class="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              @click="showEditDialog = false"
            >
              Cancel·lar
            </button>
            <button 
              type="button" 
              class="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700"
              @click="saveTimeEntry"
              :disabled="submittingEdit"
            >
              <span v-if="submittingEdit" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Desant...
              </span>
              <span v-else>Desar Canvis</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Entries Dialog -->
    <div v-if="showDayEntriesDialog" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 transition-opacity" @click="showDayEntriesDialog = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-4xl sm:w-full">
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">Registres del {{ formatDate(selectedDay) }}</h3>
              <button @click="showDayEntriesDialog = false" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="mt-4">
              <!-- Loading state -->
              <div v-if="loadingDayEntries" class="flex justify-center items-center py-20">
                <div class="animate-spin rounded-full h-8 w-8 border-t-4 border-orange-500 border-solid"></div>
                <span class="ml-3 text-sm font-medium text-gray-700">Carregant registres...</span>
              </div>
              
              <!-- Day entries table -->
              <div v-else-if="dayEntries.length > 0" class="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sortida</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hores</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentari</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="entry in dayEntries" :key="entry.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ entry.name }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ entry.entry_time }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ entry.exit_time || '-' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ calculateHours(entry.entry_time, entry.exit_time) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ entry.comment || '-' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                          @click="editTimeEntry(entry)"
                          class="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button 
                          @click="deleteTimeEntry(entry.id, true)"
                          class="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="py-10 text-center bg-white border border-gray-200 rounded-lg">
                <svg class="mx-auto h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="mt-2 text-sm text-gray-500">No hi ha registres per aquest dia</p>
              </div>
            </div>
          </div>
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
  setup() {
    const router = useRouter();
    const activeTab = ref('images');
    const tabs = ref([
      { id: 'images', name: 'Imatges' },
      { id: 'control_horario', name: 'Control Horari' },
    //   { id: 'posts', name: 'Articles' },
    //   { id: 'settings', name: 'Configuració' }
    ]);
    
    // Image management
    const loading = ref(false);
    const error = ref(null);
    const folders = ref([]);
    const images = ref([]);
    const currentFolder = ref('');
    const dragover = ref(false);
    const uploading = ref(false);
    const uploadProgress = ref(0);
    
    // New folder dialog
    const showNewFolderDialog = ref(false);
    const newFolderName = ref('');
    const folderError = ref('');
    
    // Delete dialog
    const showDeleteDialog = ref(false);
    const itemToDelete = ref(null);
    
    const BUCKET_NAME = 'fotos';
    
    const fetchFolderContents = async (folderPath = '') => {
      try {
        loading.value = true;
        error.value = null;
        
        const { data, error: fetchError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .list(folderPath, {
            sortBy: { column: 'name', order: 'asc' }
          });
        
        if (fetchError) throw fetchError;
        
        // Process folders and images
        folders.value = data
          .filter(item => item.id === null)
          .map(folder => ({ name: folder.name }));
          
        const imageFiles = data.filter(file => 
          file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
        );
        
        // Get public URLs for each image
        images.value = await Promise.all(imageFiles.map(async (file) => {
          const path = folderPath ? `${folderPath}/${file.name}` : file.name;
          const { data: { publicUrl } } = supabase
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(path);
            
          return {
            name: file.name,
            url: publicUrl,
            path: path
          };
        }));
        
      } catch (err) {
        console.error('Error fetching folder contents:', err);
        error.value = err.message || 'Error al carregar el contingut';
      } finally {
        loading.value = false;
      }
    };
    
    const navigateToFolder = (folderName) => {
      const newPath = currentFolder.value 
        ? `${currentFolder.value}/${folderName}`
        : folderName;
      currentFolder.value = newPath;
      fetchFolderContents(newPath);
    };
    
    const handleFileSelect = async (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        await uploadFiles(files);
      }
    };
    
    const handleDrop = async (event) => {
      dragover.value = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        await uploadFiles(files);
      }
    };
    
    const uploadFiles = async (files) => {
      uploading.value = true;
      uploadProgress.value = 0;
      
      try {
        let completed = 0;
        const validFiles = Array.from(files).filter(file => 
          file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
        );
        
        if (validFiles.length === 0) {
          error.value = 'No s\'han seleccionat imatges vàlides';
          return;
        }
        
        for (const file of validFiles) {
          const filepath = currentFolder.value 
            ? `${currentFolder.value}/${file.name}` 
            : file.name;
            
          const { error: uploadError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .upload(filepath, file);
            
          if (uploadError) {
            console.error(`Error uploading ${file.name}:`, uploadError);
          }
          
          completed++;
          uploadProgress.value = (completed / validFiles.length) * 100;
        }
        
        // Refresh the folder contents
        await fetchFolderContents(currentFolder.value);
        
      } catch (err) {
        console.error('Error during upload:', err);
        error.value = 'Error durant la pujada d\'arxius';
      } finally {
        uploading.value = false;
      }
    };
    
    const promptDeleteFolder = (folderName) => {
      itemToDelete.value = { 
        type: 'folder',
        name: folderName,
        path: currentFolder.value 
          ? `${currentFolder.value}/${folderName}` 
          : folderName
      };
      showDeleteDialog.value = true;
    };
    
    const deleteImage = (image) => {
      itemToDelete.value = { 
        type: 'image',
        name: image.name,
        path: image.path
      };
      showDeleteDialog.value = true;
    };
    
    const confirmDelete = async () => {
      if (!itemToDelete.value) return;
      
      try {
        if (itemToDelete.value.type === 'image') {
          const { error: deleteError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .remove([itemToDelete.value.path]);
            
          if (deleteError) throw deleteError;
        } else { // folder deletion
          await deleteFolderRecursively(itemToDelete.value.path);
        }
        
        // Refresh the content
        await fetchFolderContents(currentFolder.value);
        
      } catch (err) {
        console.error('Error al eliminar:', err);
        error.value = `Error al eliminar ${itemToDelete.value.type === 'folder' ? 'la carpeta' : 'la imatge'}`;
      } finally {
        showDeleteDialog.value = false; 
        itemToDelete.value = null;
      }
    };
    
    const deleteFolderRecursively = async (folderPath) => {
      // Step 1: List all contents in the folder
      const { data: folderContents, error: listError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list(folderPath, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (listError) throw listError;
      
      // Step 2: Process all contents - both files and folders
      for (const item of folderContents) {
        const itemPath = `${folderPath}/${item.name}`;
        
        if (item.id === null) {
          // This is a subfolder, recursively delete it
          await deleteFolderRecursively(itemPath);
        } else {
          // This is a file, delete it directly
          const { error: deleteFileError } = await supabase
            .storage
            .from(BUCKET_NAME)
            .remove([itemPath]);
            
          if (deleteFileError) console.error(`Error deleting file ${itemPath}:`, deleteFileError);
        }
      }
      
      // Step 3: Delete the placeholder file that represents the folder
      const { error: deleteFolderError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .remove([`${folderPath}/.gitkeep`]);
        
      // If the .gitkeep file doesn't exist, try with the folder path directly
      if (deleteFolderError) {
        const { error: deleteFolderPathError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .remove([`${folderPath}/`]);
          
        if (deleteFolderPathError) {
          console.error(`Error deleting folder ${folderPath}:`, deleteFolderPathError);
        }
      }
    };
    
    const createFolder = async () => {
      if (!newFolderName.value.trim()) {
        folderError.value = 'El nom de la carpeta no pot estar buit';
        return;
      }
      
      // Validate folder name (no special chars, etc.)
      if (!/^[a-zA-Z0-9-_]+$/.test(newFolderName.value)) {
        folderError.value = 'Nom no vàlid. Utilitza només lletres, números, guions o guions baixos';
        return;
      }
      
      try {
        const folderPath = currentFolder.value 
          ? `${currentFolder.value}/${newFolderName.value}/.gitkeep` 
          : `${newFolderName.value}/.gitkeep`;
          
        // Create an empty file to create the folder (Supabase requires this)
        const { error: uploadError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .upload(folderPath, new Blob(['']));
          
        if (uploadError) throw uploadError;
        
        // Refresh folder list
        await fetchFolderContents(currentFolder.value);
        showNewFolderDialog.value = false;
        newFolderName.value = '';
        folderError.value = '';
        
      } catch (err) {
        console.error('Error creating folder:', err);
        folderError.value = 'Error al crear la carpeta';
      }
    };
    
    const logout = async () => {
      await supabase.auth.signOut();
      // Use router navigation instead of direct URL change
      router.push('/login');
    };
    
    const goBack = () => {
      if (!currentFolder.value) return;
      
      // Split the path by '/' and remove the last segment
      const pathSegments = currentFolder.value.split('/');
      pathSegments.pop();
      
      // Join the remaining segments back together
      const parentFolder = pathSegments.join('/');
      
      // Update currentFolder and fetch contents
      currentFolder.value = parentFolder;
      fetchFolderContents(parentFolder);
    };
    
    // Time tracking variables
    const currentDate = ref(new Date());
    const selectedDate = ref(null);
    const calendarDays = ref([]);
    const timeEntries = ref([]);
    const loadingEntries = ref(false);
    const submittingEntry = ref(false);
    const selectedDateFilter = ref(formatDateForInput(new Date()));

    const timeEntry = ref({
      date: formatDateForInput(new Date()),
      name: '',
      entryTime: formatTimeForInput(new Date()),
      exitTime: '',
      comment: ''
    });

    // Edit dialog
    const showEditDialog = ref(false);
    const editingEntry = ref(null);
    const submittingEdit = ref(false);

    // Day entries dialog
    const showDayEntriesDialog = ref(false);
    const selectedDay = ref(null);
    const dayEntries = ref([]);
    const loadingDayEntries = ref(false);

    // Calendar functions
    const daysOfWeek = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
    
    const currentMonthName = computed(() => {
      const months = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 
                      'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];
      return months[currentDate.value.getMonth()];
    });
    
    const currentYear = computed(() => {
      return currentDate.value.getFullYear();
    });
    
    const isFormValid = computed(() => {
      return timeEntry.value.date && 
             timeEntry.value.name && 
             timeEntry.value.entryTime;
    });
    
    const generateCalendar = async () => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      
      // Get first day of month
      const firstDay = new Date(year, month, 1);
      // Get days in month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Get day of week of first day (0 = Sunday, 1 = Monday, etc.)
      // Convert to Monday-first format (0 = Monday, 6 = Sunday)
      let dayOfWeek = firstDay.getDay();
      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      const days = [];
      
      // Add days from previous month
      const prevMonth = new Date(year, month, 0);
      const prevMonthDays = prevMonth.getDate();
      
      for (let i = dayOfWeek - 1; i >= 0; i--) {
        days.push({
          date: new Date(year, month - 1, prevMonthDays - i),
          isCurrentMonth: false,
          hasEntries: false,
          entriesCount: 0
        });
      }
      
      // Add days from current month
      const today = new Date();
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          date: new Date(year, month, i),
          isCurrentMonth: true,
          isToday: today.getDate() === i && 
                   today.getMonth() === month && 
                   today.getFullYear() === year,
          hasEntries: false,
          entriesCount: 0
        });
      }
      
      // Add days from next month
      const totalDaysToShow = 42; // 6 rows of 7 days
      const daysFromNextMonth = totalDaysToShow - days.length;
      
      for (let i = 1; i <= daysFromNextMonth; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
          hasEntries: false,
          entriesCount: 0
        });
      }
      
      // Fetch entries data for the days in the calendar
      await fetchEntriesForCalendar(days, year, month);
      
      calendarDays.value = days;
    };
    
    // Fetch entries for the calendar to show indicators
    const fetchEntriesForCalendar = async (days, year, month) => {
      try {
        // Get start and end date for the calendar view (including days from adjacent months)
        const startDate = formatDateForDatabase(days[0].date);
        const endDate = formatDateForDatabase(days[days.length - 1].date);
        
        // Fetch entries for the entire calendar range
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate);
          
        if (error) throw error;
        
        // Group entries by date
        const entriesByDate = {};
        data.forEach(entry => {
          if (!entriesByDate[entry.date]) {
            entriesByDate[entry.date] = [];
          }
          entriesByDate[entry.date].push(entry);
        });
        
        // Update calendar days with entry information
        days.forEach(day => {
          const dateStr = formatDateForDatabase(day.date);
          const entries = entriesByDate[dateStr] || [];
          day.hasEntries = entries.length > 0;
          day.entriesCount = entries.length;
        });
        
      } catch (err) {
        console.error('Error fetching calendar entries:', err);
      }
    };
    
    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
      generateCalendar();
    };
    
    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
      generateCalendar();
    };
    
    // Time entry functions
    const submitTimeEntry = async () => {
      if (!isFormValid.value) return;
      
      submittingEntry.value = true;
      
      try {
        // Format the date for database storage
        const formattedDate = timeEntry.value.date;
        
        const { data, error } = await supabase
          .from('time_entries')
          .insert([
            {
              date: formattedDate,
              name: timeEntry.value.name,
              entry_time: timeEntry.value.entryTime,
              exit_time: timeEntry.value.exitTime || null,
              comment: timeEntry.value.comment || null
            }
          ]);
          
        if (error) throw error;
        
        // Reset form fields except name (for convenience)
        const userName = timeEntry.value.name;
        timeEntry.value = {
          date: formatDateForInput(new Date()),
          name: userName,
          entryTime: formatTimeForInput(new Date()),
          exitTime: '',
          comment: ''
        };
        
        // Refresh entries list and calendar
        await loadTimeEntries();
        await generateCalendar();
        
      } catch (err) {
        console.error('Error adding time entry:', err);
        alert('Error al guardar el registre. Si us plau, intenta-ho de nou.');
      } finally {
        submittingEntry.value = false;
      }
    };
    
    const loadTimeEntries = async (date = null) => {
      loadingEntries.value = true;
      
      try {
        let query = supabase
          .from('time_entries')
          .select('*')
          .order('date', { ascending: false });
          
        if (date) {
          query = query.eq('date', date);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        timeEntries.value = data || [];
        
      } catch (err) {
        console.error('Error loading time entries:', err);
      } finally {
        loadingEntries.value = false;
      }
    };
    
    const loadTimeEntriesForDate = async () => {
      if (selectedDateFilter.value) {
        await loadTimeEntries(selectedDateFilter.value);
      }
    };
    
    const clearDateFilter = async () => {
      selectedDateFilter.value = '';
      await loadTimeEntries();
    };
    
    const selectDate = (date) => {
      selectedDateFilter.value = formatDateForInput(date);
      loadTimeEntriesForDate();
    };
    
    const deleteTimeEntry = async (id, isFromDayDialog = false) => {
      if (!confirm('Estàs segur que vols eliminar aquest registre?')) {
        return;
      }
      
      try {
        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // Refresh entries list and calendar
        await loadTimeEntries(selectedDateFilter.value || null);
        if (isFromDayDialog && selectedDay.value) {
          await loadDayEntries(selectedDay.value);
        }
        await generateCalendar();
        
      } catch (err) {
        console.error('Error deleting time entry:', err);
        alert('Error al eliminar el registre. Si us plau, intenta-ho de nou.');
      }
    };
    
    // Edit time entry
    const editTimeEntry = (entry) => {
      editingEntry.value = { ...entry };
      showEditDialog.value = true;
    };
    
    const saveTimeEntry = async () => {
      if (!editingEntry.value) return;
      
      submittingEdit.value = true;
      
      try {
        const { error } = await supabase
          .from('time_entries')
          .update({
            date: editingEntry.value.date,
            name: editingEntry.value.name,
            entry_time: editingEntry.value.entry_time,
            exit_time: editingEntry.value.exit_time,
            comment: editingEntry.value.comment
          })
          .eq('id', editingEntry.value.id);
          
        if (error) throw error;
        
        showEditDialog.value = false;
        
        // Refresh entries list and calendar
        await loadTimeEntries(selectedDateFilter.value || null);
        if (showDayEntriesDialog.value && selectedDay.value) {
          await loadDayEntries(selectedDay.value);
        }
        await generateCalendar();
        
      } catch (err) {
        console.error('Error updating time entry:', err);
        alert('Error al desar els canvis. Si us plau, intenta-ho de nou.');
      } finally {
        submittingEdit.value = false;
      }
    };
    
    // View entries for a specific day
    const viewDayEntries = (date) => {
      selectedDay.value = date;
      showDayEntriesDialog.value = true;
      loadDayEntries(date);
    };
    
    const loadDayEntries = async (date) => {
      loadingDayEntries.value = true;
      
      try {
        const formattedDate = formatDateForDatabase(date);
        
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('date', formattedDate)
          .order('entry_time', { ascending: true });
          
        if (error) throw error;
        
        dayEntries.value = data || [];
        
      } catch (err) {
        console.error('Error loading day entries:', err);
      } finally {
        loadingDayEntries.value = false;
      }
    };
    
    // Helper functions
    function formatDateForInput(date) {
      // Ajusta la data a l'hora local per evitar desfasaments
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().split('T')[0];
    }
    
    function formatTimeForInput(date) {
      return date.toTimeString().slice(0, 5);
    }
    
    function formatDateForDatabase(date) {
      // Ajusta la data a l'hora local per evitar desfasaments
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().split('T')[0];
    }
    
    function formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('ca-ES');
    }

    // Calculate hours between entry and exit time
    const calculateHours = (entryTime, exitTime) => {
      if (!entryTime || !exitTime) return '-';
      
      // Parse times
      const [entryHour, entryMinute] = entryTime.split(':').map(Number);
      const [exitHour, exitMinute] = exitTime.split(':').map(Number);
      
      // Calculate total minutes
      let entryMinutes = entryHour * 60 + entryMinute;
      let exitMinutes = exitHour * 60 + exitMinute;
      
      // Handle if exit time is on the next day
      if (exitMinutes < entryMinutes) {
        exitMinutes += 24 * 60; // Add 24 hours
      }
      
      const diffMinutes = exitMinutes - entryMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      return `${hours}h ${minutes}m`;
    };

    onMounted(() => {
      fetchFolderContents();
      // Initialize time tracking
      generateCalendar();
      loadTimeEntries();
    });
    
    return {
      activeTab,
      tabs,
      logout,
      loading,
      error,
      folders,
      images,
      currentFolder,
      dragover,
      uploading,
      uploadProgress,
      handleFileSelect,
      handleDrop,
      navigateToFolder,
      deleteImage,
      promptDeleteFolder,
      showNewFolderDialog,
      newFolderName,
      folderError,
      createFolder,
      showDeleteDialog,
      itemToDelete,
      confirmDelete,
      goBack,
      // Time tracking
      currentDate,
      currentMonthName,
      currentYear,
      daysOfWeek,
      calendarDays,
      timeEntry,
      timeEntries,
      loadingEntries,
      submittingEntry,
      selectedDateFilter,
      isFormValid,
      previousMonth,
      nextMonth,
      submitTimeEntry,
      loadTimeEntries,
      loadTimeEntriesForDate,
      clearDateFilter,
      selectDate,
      deleteTimeEntry,
      formatDate,
      calculateHours,
      editTimeEntry,
      saveTimeEntry,
      showEditDialog,
      editingEntry,
      submittingEdit,
      dayEntries,
      selectedDay,
      loadingDayEntries,
      showDayEntriesDialog,
      viewDayEntries
    };
  },
};
</script>
