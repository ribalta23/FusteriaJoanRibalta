import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AlbumView from '../views/AlbumView.vue'
import AreaPrivada from '../views/AreaPrivada.vue'
import ControlHorario from '../views/ControlHorario.vue'
import ControlUsuario from '../views/ControlUsuario.vue'
import GestionImagenes from '../views/GestionImagenes.vue'
import GestionUsuarios from '../views/GestionUsuarios.vue'
import GeneracioInformes from '../views/GeneracioInformes.vue'
import Calendari from '../views/Calendari.vue'
import ProjectesDashboard from '../views/ProjectesDashboard.vue'
import ProjecteFitxa from '../views/ProjecteFitxa.vue'
import Login from '../views/Login.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import { isAuthenticated } from '@/api';

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
      path: '/informes',
      component: GeneracioInformes,
      meta: { requiereAuth: true, requiresSuperuser: true }
    },
    {
      path: '/calendari',
      component: Calendari,
      meta: { requiereAuth: true }
    },
    {
      path: '/projectes',
      component: ProjectesDashboard,
      meta: { requiereAuth: true }
    },
    {
      path: '/projectes/:id',
      component: ProjecteFitxa,
      meta: { requiereAuth: true }
    },
    {
      path: '/privacitat',
      name: 'privacy',
      component: PrivacyPolicyView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const requiereAuth = to.matched.some(record => record.meta.requiereAuth);
  const requiresSuperuser = to.matched.some(record => record.meta.requiresSuperuser);

  if (requiereAuth) {
    if (!isAuthenticated()) {
      next('/login');
    } else {
      if (requiresSuperuser) {
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'superusuario') {
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
