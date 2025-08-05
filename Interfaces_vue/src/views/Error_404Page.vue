<template>
<div class="error-minimal">
    <div class="error-message">
        <img :src="Imagen" alt="" style="width: 80%; height: auto;">
        <p>Página no encontrada</p>
    </div>
</div>
</template>

<script setup>
import Imagen from '@/assets/page404.gif'
</script>

<style scoped>
.error-minimal {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - [altura-header] - [altura-footer]);
    background-color: #fff;
    text-align: center;
}

.error-message h1 {
    font-size: var(--text-font);
    margin: 0;
    color: #333;
    font-weight: 300;
}

.error-message p {
    font-size: var(--text-font);
    color: #666;
    margin-top: 0.5rem;
}
</style>