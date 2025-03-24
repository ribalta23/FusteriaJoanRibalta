<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
      <div class="px-6 py-8 sm:px-10">
        <div class="text-center">
          <h1 class="text-3xl font-extrabold text-gray-900 mb-6">Login</h1>
        </div>
        <form @submit.prevent="login" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Correu Electronic</label>
            <div class="mt-1">
              <input 
                id="email"
                v-model="email" 
                type="email" 
                required 
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Correu Electronic" 
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Contrasenya</label>
            <div class="mt-1">
              <input 
                id="password"
                v-model="password" 
                type="password" 
                required 
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Contrasenya" 
              />
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out"
            >
              Iniciar sessió
            </button>
          </div>
        </form>
        
        <div class="mt-6">
          <p v-if="error" class="text-sm text-center font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
            {{ error }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref('');
    const router = useRouter();

    const login = async () => {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
      if (loginError) {
        error.value = loginError.message;
      } else {
        error.value = '';
        // Use router navigation instead of direct URL change
        router.push('/area-privada');
      }
    };

    return { email, password, error, login };
  },
};
</script>
