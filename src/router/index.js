import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AlbumView from '../views/AlbumView.vue'
import AreaPrivada from '../views/AreaPrivada.vue'
import ControlHorario from '../views/ControlHorario.vue'
import ControlUsuario from '../views/ControlUsuario.vue'
import GestionImagenes from '../views/GestionImagenes.vue'
import GestionUsuarios from '../views/GestionUsuarios.vue'
import GestionProyectos from '../views/GestionProyectos.vue'
import Login from '../views/Login.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import { supabase } from '@/supabase';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/album',
      name: 'album',
      component: AlbumView,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    { 
      path: '/area-privada', 
      component: AreaPrivada, 
      meta: { requiereAuth: true, requiresSuperuser: true } 
    },
    { 
      path: '/control-horario', 
      component: ControlHorario, 
      meta: { requiereAuth: true } 
    },
    { 
      path: '/control-usuario', 
      component: ControlUsuario, 
      meta: { requiereAuth: true, requiresSuperuser: true } 
    },
    { 
      path: '/gestio-imatges', 
      component: GestionImagenes, 
      meta: { requiereAuth: true, requiresSuperuser: true } 
    },
    { 
      path: '/gestio-usuaris', 
      component: GestionUsuarios, 
      meta: { requiereAuth: true, requiresSuperuser: true } 
    },
    { 
      path: '/gestio-projectes', 
      component: GestionProyectos, 
      meta: { requiereAuth: true, requiresSuperuser: true } 
    },
    {
      path: '/privacitat',
      name: 'privacy',
      component: PrivacyPolicyView,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const requiereAuth = to.matched.some(record => record.meta.requiereAuth);
  const requiresSuperuser = to.matched.some(record => record.meta.requiresSuperuser);
  
  if (requiereAuth) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      // Redirigir al login único
      next('/login');
    } else {
      // Si requiere ser superusuario, verificar el rol
      if (requiresSuperuser) {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'superusuario') {
          // Si no es superusuario, redirigir a control horario
          next('/control-horario');
          return;
        }
      }
      next();
    }
  } else {
    next();
  }
});

export default router
