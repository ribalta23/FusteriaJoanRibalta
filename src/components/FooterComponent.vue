<template>
  <footer class="bg-gray-900 text-white py-12">
    <div class="max-w-7xl mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8">
        <div class="space-y-4">
          <img src="@/assets/logo.jpg" alt="Logo" class="h-16 w-auto rounded-lg">
          <p class="text-gray-400 text-sm">Artisans de la fusta des de 1982</p>
        </div>
        
        <div class="space-y-4">
          <h3 class="font-bold text-lg mb-2">Contacte</h3>
          <ul class="space-y-2 text-gray-400">
            <li><i class="fa-solid fa-phone mr-2"></i>666 59 08 33</li>
            <li><i class="fa-solid fa-envelope mr-2"></i>info@moblesjoanribalta.com</li>
            <li><i class="fa-solid fa-map-marker-alt mr-2"></i>C/ Sant Eloi, 21 Tàrrega</li>
          </ul>
        </div>
        
        <div class="space-y-4">
          <h3 class="font-bold text-lg mb-2">Enllaços</h3>
          <ul class="space-y-2">
            <li><router-link to="/" class="text-gray-400 hover:text-orange-500 transition-colors">Sobre nosaltres</router-link></li>
            <li><router-link to="/album" class="text-gray-400 hover:text-orange-500 transition-colors">Galeria de treballs</router-link></li>
            <li><a href="#" class="text-gray-400 hover:text-orange-500 transition-colors">Política de privacitat</a></li>
          </ul>
        </div>
        
        <div class="space-y-4">
          <h3 class="font-bold text-lg mb-2">Xarxes socials</h3>
          <div class="flex space-x-4">
            <a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
              <i class="fa-brands fa-facebook-f"></i>
            </a>
            <a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="#" class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
        <p>© 2023 Fusteria Joan Ribalta. Tots els drets reservats</p>
      </div>
    </div>
  </footer>
</template>
