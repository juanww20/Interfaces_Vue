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
        <button 
            @click="activeTab = 'loaderconfig'" 
            class="tab" 
            :class="{ active: activeTab === 'loaderconfig' }"
        >
            ⏳ Loader
        </button>
        <button 
            @click="activeTab = 'fotoseditar'" 
            class="tab" 
            :class="{ active: activeTab === 'fotoseditar' }"
        >
            📷 Fotos
        </button>
        <button 
            @click="activeTab = 'videoseditar'" 
            class="tab" 
            :class="{ active: activeTab === 'videoseditar' }"
        >
            🎥 Videos
        </button>
        </div>

        <ColorsPanel v-if="activeTab === 'colors'" />
        <TypographyPanel v-if="activeTab === 'typography'" />
        <UsersPanel v-if="activeTab === 'users'" />
        <LoaderConfig v-if="activeTab === 'loaderconfig'" />
        <FotosEditar v-if="activeTab === 'fotoseditar'" />
        <VideosEditar v-if="activeTab === 'videoseditar'"/>
   </div>
</template>

<script setup>
import { ref } from 'vue';
import ColorsPanel from './Admin_componentes/ColoresComponente.vue';
import TypographyPanel from './Admin_componentes/FuenteComponente.vue';
import UsersPanel from './Admin_componentes/DatatableComponente.vue';
import LoaderConfig from './Admin_componentes/LoaderConfig.vue';
import FotosEditar from './Admin_componentes/FotosEditar.vue';
import VideosEditar from './Admin_componentes/VideosEditar.vue';

const activeTab = ref('colors'); // Valor inicial
</script>

<style scoped>
@import url('./Admin.css')
</style>