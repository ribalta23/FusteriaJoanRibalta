<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header Sticky -->
    <div class="sticky top-0 z-40 bg-orange-600 shadow-lg">
      <div class="px-3 py-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1 min-w-0">
            <router-link
              to="/projectes"
              class="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-white active:bg-white active:bg-opacity-20 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <div class="min-w-0">
              <h1 class="text-base font-bold text-white truncate leading-tight">{{ proyecto?.nombre || 'Projecte' }}</h1>
              <p v-if="carpetaNombre" class="text-xs text-orange-100 truncate leading-tight">{{ carpetaNombre }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button
              v-if="proyecto"
              @click="downloadInforme"
              :disabled="downloadingInforme"
              class="w-9 h-9 flex items-center justify-center rounded-full text-white active:bg-white active:bg-opacity-20 transition disabled:opacity-50"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

    <div class="max-w-lg mx-auto px-3 py-4" :style="{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }">
      <!-- Loading -->
      <div v-if="loadingProyecto" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p class="mt-2 text-gray-600">Carregant projecte...</p>
      </div>

      <template v-else-if="proyecto">
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

        <!-- Cost summary (només superusuari) -->
        <div v-if="isSuperuser" class="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <h2 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Resum de cost</h2>
          <div v-if="coste" class="grid grid-cols-3 gap-2 text-center">
            <div>
              <div class="text-[11px] text-gray-400 mb-0.5">Mà d'obra</div>
              <div class="text-base font-bold text-gray-900">{{ formatEuros(coste.coste_mano_obra) }}</div>
            </div>
            <div>
              <div class="text-[11px] text-gray-400 mb-0.5">Materials</div>
              <div class="text-base font-bold text-gray-900">{{ formatEuros(coste.coste_materiales) }}</div>
            </div>
            <div class="bg-orange-50 rounded-xl py-1.5">
              <div class="text-[11px] text-orange-500 mb-0.5">Total</div>
              <div class="text-base font-bold text-orange-700">{{ formatEuros(coste.coste_total) }}</div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400">Carregant cost...</p>
        </div>

        <!-- ===== HORES ===== -->
        <div v-if="activeTab === 'hores'">
          <div class="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <h2 class="text-base font-bold text-gray-900 mb-3">{{ editingHora ? 'Editar registre' : 'Afegir hores' }}</h2>
            <form @submit.prevent="saveHora" class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Data</label>
                  <input type="date" v-model="horaForm.fecha" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Hores</label>
                  <input type="number" min="0" step="0.25" v-model="horaForm.horas" required placeholder="4.5" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                </div>
              </div>
              <div v-if="isSuperuser">
                <label class="block text-xs font-medium text-gray-500 mb-1">Usuari</label>
                <select v-model="horaForm.user_id" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="">-- Selecciona --</option>
                  <option v-for="u in usuarios" :key="u.id" :value="u.id">{{ u.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Comentari</label>
                <textarea v-model="horaForm.comentario" rows="2" placeholder="Descriu la feina feta..." class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"></textarea>
              </div>
              <div class="flex gap-2 pt-1">
                <button v-if="editingHora" type="button" @click="cancelEditHora" class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200">Cancel·lar</button>
                <button type="submit" :disabled="savingHora" class="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold active:bg-orange-700 disabled:bg-gray-300">
                  {{ savingHora ? 'Guardant...' : (editingHora ? 'Actualitzar' : 'Afegir') }}
                </button>
              </div>
            </form>
          </div>

          <div v-if="loadingHoras" class="text-center py-6 text-gray-400 text-sm">Carregant hores...</div>
          <div v-else-if="horas.length === 0" class="text-center py-8 text-gray-400 text-sm">Encara no hi ha hores registrades.</div>
          <template v-else>
            <div class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
              <div v-for="h in horas" :key="h.id" class="px-4 py-3 flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900">
                    {{ formatDate(h.fecha) }}
                    <span class="ml-1.5 text-orange-600 font-bold">{{ h.horas }}h</span>
                  </div>
                  <div class="text-xs text-gray-400 truncate">
                    <span v-if="isSuperuser">{{ nombreUsuario(h.user_id) }}<span v-if="h.comentario"> · </span></span>{{ h.comentario }}
                  </div>
                </div>
                <div v-if="canEditHora(h)" class="flex gap-3 flex-shrink-0 text-xs font-semibold">
                  <button @click="editHora(h)" class="text-orange-600">Editar</button>
                  <button @click="deleteHora(h.id)" class="text-red-600">Eliminar</button>
                </div>
              </div>
            </div>
            <div class="flex justify-end pt-3 pr-1">
              <span class="text-sm text-gray-500">Total: <strong class="text-gray-900">{{ totalHoras }}h</strong></span>
            </div>
          </template>
        </div>

        <!-- ===== MATERIALS ===== -->
        <div v-if="activeTab === 'materials'">
          <div class="flex items-center justify-between mb-3 px-1">
            <h2 class="text-base font-bold text-gray-900">Materials</h2>
            <button @click="openMaterialModal" class="w-8 h-8 flex items-center justify-center bg-orange-600 text-white rounded-full active:bg-orange-700 shadow-sm">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div v-if="loadingMateriales" class="text-center py-6 text-gray-400 text-sm">Carregant materials...</div>
          <div v-else-if="proyectoMateriales.length === 0" class="text-center py-8 text-gray-400 text-sm">Encara no hi ha materials afegits.</div>
          <div v-else class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            <div v-for="pm in proyectoMateriales" :key="pm.id" class="px-4 py-3 flex items-center justify-between gap-2">
              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-900 truncate">{{ nombreMaterial(pm.material_id) }}</div>
                <div class="text-xs text-gray-400 truncate">
                  {{ categoriaMaterial(pm.material_id) || 'Sense categoria' }} · {{ pm.cantidad }} x {{ formatEuros(pm.precio_unitario_aplicado) }}
                </div>
              </div>
              <div class="flex items-center gap-3 flex-shrink-0">
                <span class="text-sm font-bold text-gray-900">{{ formatEuros(pm.cantidad * pm.precio_unitario_aplicado) }}</span>
                <button @click="deleteMaterial(pm.id)" class="text-red-600 text-xs font-semibold">Eliminar</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== INFO ===== -->
        <div v-if="activeTab === 'info'">
          <template v-if="!editingInfo">
            <div class="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden mb-4">
              <div class="px-4 py-3 flex justify-between items-center gap-3">
                <span class="text-sm text-gray-500 flex-shrink-0">Nom</span>
                <span class="text-sm font-medium text-gray-900 text-right">{{ proyecto.nombre }}</span>
              </div>
              <div class="px-4 py-3 flex justify-between items-center gap-3">
                <span class="text-sm text-gray-500 flex-shrink-0">Descripció</span>
                <span class="text-sm font-medium text-gray-900 text-right">{{ proyecto.descripcion || '-' }}</span>
              </div>
              <div class="px-4 py-3 flex justify-between items-center gap-3">
                <span class="text-sm text-gray-500 flex-shrink-0">Lloc</span>
                <span class="text-sm font-medium text-gray-900 text-right">{{ proyecto.lugar || '-' }}</span>
              </div>
              <div class="px-4 py-3 flex justify-between items-center gap-3">
                <span class="text-sm text-gray-500 flex-shrink-0">Carpeta</span>
                <span class="text-sm font-medium text-gray-900 text-right">{{ carpetaNombre || '-' }}</span>
              </div>
              <div class="px-4 py-3 flex justify-between items-center gap-3">
                <span class="text-sm text-gray-500 flex-shrink-0">Estat</span>
                <span
                  :class="proyecto.estado === 'en_curso' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ proyecto.estado === 'en_curso' ? 'Actiu' : 'Finalitzat' }}
                </span>
              </div>
              <button v-if="isSuperuser" @click="startEditInfo" class="w-full px-4 py-3 flex justify-between items-center text-orange-600 font-semibold text-sm active:bg-gray-50">
                Editar projecte
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <button v-if="isSuperuser" @click="confirmDelete" class="w-full bg-white rounded-2xl shadow-sm px-4 py-3 text-red-600 font-semibold text-sm active:bg-gray-50">
              Eliminar projecte
            </button>
          </template>

          <form v-else @submit.prevent="saveInfo" class="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Nom del Projecte *</label>
              <input v-model="infoForm.nombre" type="text" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Descripció</label>
              <textarea v-model="infoForm.descripcion" rows="3" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"></textarea>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Lloc</label>
              <input v-model="infoForm.lugar" type="text" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Carpeta</label>
              <select v-model="infoForm.carpeta_id" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option :value="null">-- Sense carpeta --</option>
                <option v-for="c in carpetas" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Estat</label>
              <select v-model="infoForm.estado" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="en_curso">Actiu</option>
                <option value="finalizado">Finalitzat</option>
              </select>
            </div>
            <div class="flex gap-2 pt-1">
              <button type="button" @click="editingInfo = false" class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200">Cancel·lar</button>
              <button type="submit" :disabled="savingInfo" class="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold active:bg-orange-700 disabled:bg-gray-300">
                {{ savingInfo ? 'Guardant...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </template>
    </div>

    <!-- Barra de pestanyes fixa inferior -->
    <div v-if="proyecto" class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200" :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }">
      <div class="max-w-lg mx-auto grid grid-cols-3">
        <button
          @click="activeTab = 'hores'"
          class="flex flex-col items-center justify-center gap-0.5 py-2.5 transition"
          :class="activeTab === 'hores' ? 'text-orange-600' : 'text-gray-400'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" :stroke-width="activeTab === 'hores' ? 2.4 : 2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-[11px] font-semibold">Hores</span>
        </button>
        <button
          @click="activeTab = 'materials'"
          class="flex flex-col items-center justify-center gap-0.5 py-2.5 transition"
          :class="activeTab === 'materials' ? 'text-orange-600' : 'text-gray-400'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" :stroke-width="activeTab === 'materials' ? 2.4 : 2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7L12 3 4 7m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span class="text-[11px] font-semibold">Materials</span>
        </button>
        <button
          @click="activeTab = 'info'"
          class="flex flex-col items-center justify-center gap-0.5 py-2.5 transition"
          :class="activeTab === 'info' ? 'text-orange-600' : 'text-gray-400'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" :stroke-width="activeTab === 'info' ? 2.4 : 2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-[11px] font-semibold">Info</span>
        </button>
      </div>
    </div>

    <!-- Modal afegir material (bottom sheet) -->
    <Transition name="sheet">
      <div v-if="showMaterialModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="showMaterialModal = false"></div>
        <div
          class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full sm:mb-0"
          :style="{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }"
        >
          <div class="flex justify-center pt-2 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-gray-300"></div>
          </div>
          <div class="px-6 pt-4 pb-2">
            <h3 class="text-lg font-bold text-gray-900">Afegir material</h3>
          </div>

          <div class="px-6">
            <div class="flex bg-gray-100 rounded-xl p-1">
              <button
                @click="materialMode = 'existent'"
                :class="materialMode === 'existent' ? 'bg-white shadow text-orange-600' : 'text-gray-500'"
                class="flex-1 py-2 rounded-lg text-sm font-semibold transition"
              >
                Del catàleg
              </button>
              <button
                v-if="isSuperuser"
                @click="materialMode = 'nou'"
                :class="materialMode === 'nou' ? 'bg-white shadow text-orange-600' : 'text-gray-500'"
                class="flex-1 py-2 rounded-lg text-sm font-semibold transition"
              >
                Material nou
              </button>
            </div>
          </div>

          <form v-if="materialMode === 'existent'" @submit.prevent="addExistingMaterial" class="p-6 space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Material *</label>
              <input v-model="materialSearch" type="text" placeholder="Cerca per nom..." class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm mb-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              <select v-model="materialForm.material_id" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="">-- Selecciona un material --</option>
                <option v-for="m in filteredCatalogo" :key="m.id" :value="m.id">
                  {{ m.nombre }} ({{ formatEuros(m.precio_unitario) }}/{{ m.unidad }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Quantitat *</label>
              <input v-model="materialForm.cantidad" type="number" min="0" step="0.01" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div class="flex gap-2 pt-2">
              <button type="button" @click="showMaterialModal = false" class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200">Cancel·lar</button>
              <button type="submit" :disabled="savingMaterial" class="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold active:bg-orange-700 disabled:bg-gray-300">
                {{ savingMaterial ? 'Afegint...' : 'Afegir' }}
              </button>
            </div>
          </form>

          <form v-else @submit.prevent="createAndAddMaterial" class="p-6 space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Nom *</label>
              <input v-model="newMaterialForm.nombre" type="text" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
              <select v-model="newMaterialForm.categoria" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option :value="null">-- Sense categoria --</option>
                <option v-for="c in categoriasDisponibles" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Unitat</label>
                <input v-model="newMaterialForm.unidad" type="text" placeholder="ud" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Preu (€) *</label>
                <input v-model="newMaterialForm.precio_unitario" type="number" min="0" step="0.01" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Quantitat per aquest projecte *</label>
              <input v-model="newMaterialForm.cantidad" type="number" min="0" step="0.01" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <p class="text-xs text-gray-400">Es guardarà al catàleg general de materials i s'afegirà a aquest projecte.</p>
            <div class="flex gap-2 pt-2">
              <button type="button" @click="showMaterialModal = false" class="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200">Cancel·lar</button>
              <button type="submit" :disabled="savingMaterial" class="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold active:bg-orange-700 disabled:bg-gray-300">
                {{ savingMaterial ? 'Guardant...' : 'Crear i afegir' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal eliminar projecte (bottom sheet) -->
    <Transition name="sheet">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black bg-opacity-40" @click="showDeleteModal = false"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-6" :style="{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }">
          <div class="flex justify-center -mt-2 mb-3 sm:hidden">
            <div class="w-10 h-1 rounded-full bg-gray-300"></div>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-3">Confirmar Eliminació</h3>
          <p class="text-sm text-gray-600 mb-4">
            Estàs segur que vols eliminar el projecte <strong>{{ proyecto?.nombre }}</strong>? Aquesta acció no es pot desfer.
          </p>
          <div class="flex gap-2 pt-1">
            <button @click="showDeleteModal = false" class="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200">Cancel·lar</button>
            <button @click="deleteProject" class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold active:bg-red-700">Eliminar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { api, logout as apiLogout } from '@/api';
import { useRouter, useRoute } from 'vue-router';
import { jsPDF } from 'jspdf';
import { renderCapcalera, renderProjecteSeccio } from '@/utils/informe';

export default {
  name: 'ProjecteFitxa',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const proyectoId = route.params.id;

    const userRole = ref(localStorage.getItem('userRole') || 'usuario');
    const currentUserId = ref(localStorage.getItem('userId') || '');
    const isSuperuser = ref(userRole.value === 'superusuario');

    const proyecto = ref(null);
    const loadingProyecto = ref(false);
    const coste = ref(null);
    const message = ref('');
    const messageType = ref('success');

    const activeTab = ref('hores');

    // ---- Hores ----
    const horas = ref([]);
    const usuarios = ref([]);
    const loadingHoras = ref(false);
    const savingHora = ref(false);
    const editingHora = ref(null);
    const horaForm = ref({ fecha: new Date().toISOString().split('T')[0], user_id: '', horas: '', comentario: '' });

    const totalHoras = computed(() => {
      return horas.value.reduce((sum, h) => sum + Number(h.horas || 0), 0).toFixed(2);
    });

    const nombreUsuario = (userId) => {
      const u = usuarios.value.find(u => u.id === userId);
      return u?.nombre || 'Desconegut';
    };

    const canEditHora = (h) => isSuperuser.value || h.user_id === currentUserId.value;

    const resetHoraForm = () => {
      horaForm.value = {
        fecha: new Date().toISOString().split('T')[0],
        user_id: isSuperuser.value ? '' : currentUserId.value,
        horas: '',
        comentario: ''
      };
      editingHora.value = null;
    };

    const loadHoras = async () => {
      loadingHoras.value = true;
      try {
        horas.value = await api.get('/horas', { proyecto_id: proyectoId });
      } catch (error) {
        console.error('Error carregant hores:', error);
        showMessage('Error al carregar les hores', 'error');
      } finally {
        loadingHoras.value = false;
      }
    };

    const loadUsuarios = async () => {
      if (!isSuperuser.value) return;
      try {
        usuarios.value = await api.get('/users');
      } catch (error) {
        console.error('Error carregant usuaris:', error);
      }
    };

    const saveHora = async () => {
      savingHora.value = true;
      try {
        const payload = {
          proyecto_id: proyectoId,
          fecha: horaForm.value.fecha,
          horas: horaForm.value.horas,
          comentario: horaForm.value.comentario || null
        };
        if (isSuperuser.value) payload.user_id = horaForm.value.user_id;

        if (editingHora.value) {
          await api.patch(`/horas/${editingHora.value.id}`, payload);
          showMessage('Registre actualitzat', 'success');
        } else {
          await api.post('/horas', payload);
          showMessage('Hores afegides', 'success');
        }
        resetHoraForm();
        await loadHoras();
        await loadCoste();
      } catch (error) {
        console.error('Error guardant hores:', error);
        showMessage('Error: ' + error.message, 'error');
      } finally {
        savingHora.value = false;
      }
    };

    const editHora = (h) => {
      editingHora.value = h;
      horaForm.value = { fecha: h.fecha, user_id: h.user_id, horas: h.horas, comentario: h.comentario || '' };
    };

    const cancelEditHora = () => resetHoraForm();

    const deleteHora = async (id) => {
      if (!confirm('Estàs segur que vols eliminar aquest registre?')) return;
      try {
        await api.delete(`/horas/${id}`);
        showMessage('Registre eliminat', 'success');
        await loadHoras();
        await loadCoste();
      } catch (error) {
        console.error('Error eliminant hores:', error);
        showMessage('Error: ' + error.message, 'error');
      }
    };

    // ---- Materials ----
    const proyectoMateriales = ref([]);
    const catalogo = ref([]);
    const loadingMateriales = ref(false);
    const savingMaterial = ref(false);
    const showMaterialModal = ref(false);
    const materialMode = ref('existent');
    const materialSearch = ref('');
    const materialForm = ref({ material_id: '', cantidad: '' });
    const newMaterialForm = ref({ nombre: '', categoria: null, unidad: 'ud', precio_unitario: '', cantidad: '' });
    const categoriasDisponibles = ['Fusta', 'Ferramentes', 'Pintura', 'Vis i Cargols', 'Altres'];

    const filteredCatalogo = computed(() => {
      if (!materialSearch.value) return catalogo.value;
      const q = materialSearch.value.toLowerCase();
      return catalogo.value.filter(m => m.nombre.toLowerCase().includes(q));
    });

    const nombreMaterial = (materialId) => catalogo.value.find(m => m.id === materialId)?.nombre || 'Material eliminat';
    const categoriaMaterial = (materialId) => catalogo.value.find(m => m.id === materialId)?.categoria;

    const loadProyectoMateriales = async () => {
      loadingMateriales.value = true;
      try {
        proyectoMateriales.value = await api.get(`/proyectos/${proyectoId}/materiales`);
      } catch (error) {
        console.error('Error carregant materials:', error);
        showMessage('Error al carregar els materials', 'error');
      } finally {
        loadingMateriales.value = false;
      }
    };

    const loadCatalogo = async () => {
      try {
        catalogo.value = await api.get('/materiales');
      } catch (error) {
        console.error('Error carregant catàleg:', error);
      }
    };

    const openMaterialModal = () => {
      materialMode.value = 'existent';
      materialSearch.value = '';
      materialForm.value = { material_id: '', cantidad: '' };
      newMaterialForm.value = { nombre: '', categoria: null, unidad: 'ud', precio_unitario: '', cantidad: '' };
      showMaterialModal.value = true;
    };

    const addExistingMaterial = async () => {
      savingMaterial.value = true;
      try {
        await api.post(`/proyectos/${proyectoId}/materiales`, {
          material_id: materialForm.value.material_id,
          cantidad: materialForm.value.cantidad
        });
        showMessage('Material afegit', 'success');
        showMaterialModal.value = false;
        await loadProyectoMateriales();
        await loadCoste();
      } catch (error) {
        console.error('Error afegint material:', error);
        showMessage('Error: ' + error.message, 'error');
      } finally {
        savingMaterial.value = false;
      }
    };

    const createAndAddMaterial = async () => {
      savingMaterial.value = true;
      try {
        const nuevoMaterial = await api.post('/materiales', {
          nombre: newMaterialForm.value.nombre,
          categoria: newMaterialForm.value.categoria,
          unidad: newMaterialForm.value.unidad || 'ud',
          precio_unitario: newMaterialForm.value.precio_unitario
        });
        await api.post(`/proyectos/${proyectoId}/materiales`, {
          material_id: nuevoMaterial.id,
          cantidad: newMaterialForm.value.cantidad
        });
        showMessage('Material creat i afegit', 'success');
        showMaterialModal.value = false;
        await loadCatalogo();
        await loadProyectoMateriales();
        await loadCoste();
      } catch (error) {
        console.error('Error creant material:', error);
        showMessage('Error: ' + error.message, 'error');
      } finally {
        savingMaterial.value = false;
      }
    };

    const deleteMaterial = async (itemId) => {
      if (!confirm('Estàs segur que vols eliminar aquest material del projecte?')) return;
      try {
        await api.delete(`/proyectos/${proyectoId}/materiales/${itemId}`);
        showMessage('Material eliminat', 'success');
        await loadProyectoMateriales();
        await loadCoste();
      } catch (error) {
        console.error('Error eliminant material:', error);
        showMessage('Error: ' + error.message, 'error');
      }
    };

    // ---- Info ----
    const editingInfo = ref(false);
    const savingInfo = ref(false);
    const showDeleteModal = ref(false);
    const infoForm = ref({ nombre: '', descripcion: '', lugar: '', carpeta_id: null, estado: 'en_curso' });

    const carpetas = ref([]);

    const carpetaNombre = computed(() => {
      if (!proyecto.value?.carpeta_id) return null;
      return carpetas.value.find(c => c.id === proyecto.value.carpeta_id)?.nombre || null;
    });

    const loadCarpetas = async () => {
      try {
        carpetas.value = await api.get('/carpetas');
      } catch (error) {
        console.error('Error carregant carpetes:', error);
      }
    };

    const startEditInfo = () => {
      infoForm.value = {
        nombre: proyecto.value.nombre,
        descripcion: proyecto.value.descripcion || '',
        lugar: proyecto.value.lugar || '',
        carpeta_id: proyecto.value.carpeta_id || null,
        estado: proyecto.value.estado
      };
      editingInfo.value = true;
    };

    const saveInfo = async () => {
      savingInfo.value = true;
      try {
        const payload = {
          nombre: infoForm.value.nombre,
          descripcion: infoForm.value.descripcion,
          lugar: infoForm.value.lugar,
          carpeta_id: infoForm.value.carpeta_id || null,
          estado: infoForm.value.estado
        };
        proyecto.value = await api.patch(`/proyectos/${proyectoId}`, payload);
        showMessage('Projecte actualitzat', 'success');
        editingInfo.value = false;
      } catch (error) {
        console.error('Error actualitzant projecte:', error);
        showMessage('Error: ' + error.message, 'error');
      } finally {
        savingInfo.value = false;
      }
    };

    const confirmDelete = () => { showDeleteModal.value = true; };

    const deleteProject = async () => {
      try {
        await api.delete(`/proyectos/${proyectoId}`);
        router.push('/projectes');
      } catch (error) {
        console.error('Error eliminant projecte:', error);
        showMessage('Error: ' + error.message, 'error');
        showDeleteModal.value = false;
      }
    };

    // ---- Comú ----
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formatEuros = (value) => Number(value || 0).toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' });

    const showMessage = (text, type = 'success') => {
      message.value = text;
      messageType.value = type;
      setTimeout(() => { message.value = ''; }, 4000);
    };

    const loadCoste = async () => {
      if (!isSuperuser.value) return;
      try {
        coste.value = await api.get(`/proyectos/${proyectoId}/coste`);
      } catch (error) {
        console.error('Error carregant cost:', error);
      }
    };

    const loadProyecto = async () => {
      loadingProyecto.value = true;
      try {
        proyecto.value = await api.get(`/proyectos/${proyectoId}`);
      } catch (error) {
        console.error('Error carregant projecte:', error);
        showMessage('No s\'ha trobat el projecte', 'error');
      } finally {
        loadingProyecto.value = false;
      }
    };

    const logout = () => {
      apiLogout();
      router.push('/login');
    };

    const downloadingInforme = ref(false);

    const downloadInforme = () => {
      downloadingInforme.value = true;
      try {
        const doc = new jsPDF();
        const y = renderCapcalera(doc, 'Informe de Projecte');
        renderProjecteSeccio(doc, y, {
          proyecto: proyecto.value,
          carpetaNombre: carpetaNombre.value,
          horas: horas.value,
          materiales: proyectoMateriales.value,
          coste: coste.value,
          isSuperuser: isSuperuser.value,
          nombreUsuario,
          nombreMaterial,
          categoriaMaterial
        });
        doc.save(`informe-${proyecto.value.nombre}.pdf`);
      } catch (error) {
        console.error('Error generant informe:', error);
        showMessage('Error generant l\'informe', 'error');
      } finally {
        downloadingInforme.value = false;
      }
    };

    onMounted(async () => {
      resetHoraForm();
      await Promise.all([
        loadProyecto(),
        loadCarpetas(),
        loadUsuarios(),
        loadHoras(),
        loadCatalogo(),
        loadProyectoMateriales(),
        loadCoste()
      ]);
    });

    return {
      proyecto, loadingProyecto, coste, message, messageType,
      activeTab, isSuperuser,
      horas, usuarios, loadingHoras, savingHora, editingHora, horaForm, totalHoras,
      nombreUsuario, canEditHora, saveHora, editHora, cancelEditHora, deleteHora,
      proyectoMateriales, catalogo, loadingMateriales, savingMaterial, showMaterialModal,
      materialMode, materialSearch, materialForm, newMaterialForm, categoriasDisponibles,
      filteredCatalogo, nombreMaterial, categoriaMaterial, openMaterialModal,
      addExistingMaterial, createAndAddMaterial, deleteMaterial,
      editingInfo, savingInfo, showDeleteModal, infoForm, carpetas, carpetaNombre,
      startEditInfo, saveInfo, confirmDelete, deleteProject,
      formatDate, formatEuros, logout, downloadingInforme, downloadInforme
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
