<template>
  <componente-header></componente-header>
  <router-view></router-view>
</template>

<script setup>
import {RouterView } from 'vue-router'
import ComponenteHeader from './components/ComponenteHeader.vue';
</script>

<style scoped>
</style>
