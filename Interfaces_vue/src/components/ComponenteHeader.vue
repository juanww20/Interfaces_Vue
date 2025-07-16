<template>
  <header id="header" class="fixed-top">
    <div class="container">
      <div class="logo float-left">
        <router-link to="/" class="scrollto">
          <img :src="logo" alt="Logo" class="img-fluid" />
        </router-link>
      </div>

       <!-- Botón hamburguesa para móviles -->
    <button 
      class="navbar-toggle" 
      @click="toggleMenu"
      aria-label="Toggle navigation"
      aria-expanded="isMenuOpen"
    >
      <i class="fa fa-bars Hamburguesa"></i>
    </button>

      <!-- Navbar para desktop -->
      <nav class="navbar-menu" 
      :class="{ 'is-active': isMenuOpen }"
      >
      <div>
        
      </div>
        <ul class="navbar-links">
          <li :class="{ active: isActive('/') }"><router-link to="/" @click="closeMenu">Home</router-link></li>
          <li><a href="#about" @click="closeMenu">About Us</a></li>
          <li><a href="#services" @click="closeMenu">Services</a></li>
          <li><a href="#portfolio" @click="closeMenu">Portfolio</a></li>
          <li class="drop-down">
          <a href="#" @click.prevent="toggleDropdown($event)">Drop Down</a>
          <ul>
            <li><a href="#" @click="closeMenu">Drop Down 1</a></li>
            <li class="drop-down">
              <a href="#" @click.prevent="toggleDropdown($event)">Drop Down 2</a>
              <ul>
                <li><a href="#" @click="closeMenu">Deep Drop Down 1</a></li>
                <li><a href="#" @click="closeMenu">Deep Drop Down 2</a></li>
                <li><a href="#" @click="closeMenu">Deep Drop Down 3</a></li>
                <li><a href="#" @click="closeMenu">Deep Drop Down 4</a></li>
                <li><a href="#" @click="closeMenu">Deep Drop Down 5</a></li>
              </ul>
            </li>
            <li><a href="#" @click="closeMenu">Drop Down 3</a></li>
            <li><a href="#" @click="closeMenu">Drop Down 4</a></li>
            <li><a href="#" @click="closeMenu">Drop Down 5</a></li>
          </ul>
        </li>
          <li><a href="#contact" @click="closeMenu">Contact Us</a></li>

          <!-- Si NO ha iniciado sesión -->
          <li v-if="!auth.user" :class="{ active: isActive('/auth') }">
            <router-link to="/auth" @click="closeMenu">Login</router-link>
          </li>
          
          <!-- Si está autenticado -->
          <template v-else>
            <li v-if="auth.user.role === 'user'" :class="{ active: isActive('/perfil') }"><router-link to="/perfil" @click="closeMenu">Perfil</router-link></li>

            <!-- Solo para admin -->
            <li v-if="auth.user.role === 'admin'" :class="{ active: isActive('/administrador') }">
              <router-link to="/administrador" @click="closeMenu">Admin</router-link>
            </li>

            <li><a href="#" @click="logout">Logout</a></li>
          </template>
        </ul>
      </nav>

      <!-- Overlay para móviles -->
    <div 
      class="navbar-overlay" 
      :class="{ 'is-active': isMenuOpen }"
      @click="closeMenu"
    ></div>

    </div>
  </header>
</template>

<script setup>
import logo from '@/assets/img/logo.png'
import { useAuthStore } from '@/stores/Auth';
import { useRouter } from 'vue-router'
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isMenuOpen = ref(false);
const isMobile = ref(false);
const router = useRouter();
const auth = useAuthStore();

const isActive = (path) => {
  return router.currentRoute.value.path === path;
};
const logout = async () => {
  await auth.logout()
  router.push('/auth')
}

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    isMenuOpen.value = false;
  }
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  if (isMobile.value) {
    isMenuOpen.value = false;
  }
};

const toggleDropdown = (event) => {
  if (isMobile.value) {
    const parent = event.target.closest('li');
    parent.classList.toggle('active');
  }
  // En desktop, el hover ya manejará el despliegue
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>