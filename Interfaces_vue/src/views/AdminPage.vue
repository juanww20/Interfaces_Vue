<template>
   <div class="admin-panel">
        <div class="tab-nav">
        <button 
            @click="activeTab = 'colors'" 
            class="tab" 
            :class="{ active: activeTab === 'colors' }"
        >
            🎨 Colores
        </button>
        <button 
            @click="activeTab = 'typography'" 
            class="tab" 
            :class="{ active: activeTab === 'typography' }"
        >
            🔤 Tipografía
        </button>
        <button 
            @click="activeTab = 'users'" 
            class="tab" 
            :class="{ active: activeTab === 'users' }"
        >
            👤 Usuarios
        </button>
        </div>

        <ColorsPanel v-if="activeTab === 'colors'" />
        <TypographyPanel v-if="activeTab === 'typography'" />
        <UsersPanel v-if="activeTab === 'users'" />
   </div>
</template>

<script setup>
import { ref } from 'vue';
import ColorsPanel from './Admin_componentes/ColoresComponente.vue';
import TypographyPanel from './Admin_componentes/FuenteComponente.vue';
import UsersPanel from './Admin_componentes/DatatableComponente.vue';

const activeTab = ref('colors'); // Valor inicial
</script>

<style scoped>
@import url('./Admin.css')
</style>