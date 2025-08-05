<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <MapComponent @ubicationSelected="onUbicationSelected" />
    </div>
  </div>
</template>

<script setup>
import MapComponent from './MapComponent.vue'

const emit = defineEmits(['close'])

function onUbicationSelected(event) {
  emit('close', event) // Devuelve la ubicación seleccionada al padre
}

function close() {
  emit('close', null) // Cierra el modal sin datos
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 0;
  min-width: 400px;
  min-height: 400px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.2);
}
</style>