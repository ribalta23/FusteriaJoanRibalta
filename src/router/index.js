import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AlbumView from '../views/AlbumView.vue'
import AreaPrivada from '../views/AreaPrivada.vue'
import Login from '../views/Login.vue'
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
      meta: { requiereAuth: true } 
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const requiereAuth = to.matched.some(record => record.meta.requiereAuth);
  
  if (requiereAuth) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      next('/login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router
