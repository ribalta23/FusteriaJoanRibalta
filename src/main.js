import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import './assets/animations.css';
import scrollAnimation from './directives/scrollAnimation';

const app = createApp(App);

app.use(router);
app.directive('scroll-animate', scrollAnimation);

app.mount('#app');
