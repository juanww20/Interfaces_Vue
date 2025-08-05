<template>
  <componente-header></componente-header>
  <router-view></router-view>
  <componente-footer></componente-footer>
</template>

<script setup>
import {RouterView } from 'vue-router'
import ComponenteHeader from './components/ComponenteHeader.vue';
import ComponenteFooter from './components/ComponenteFooter.vue';
import { useAuthStore } from '@/stores/Auth';
import { useStyleStore } from '@/stores/Styles';
import { onMounted } from 'vue';

const auth = useAuthStore()
const styles = useStyleStore()

onMounted(async () => {
  await auth.checkSession()
  styles.loadPaletteFromStorage()
  styles.loadFontFromStorage()
})


</script>

<style scoped>
</style>
