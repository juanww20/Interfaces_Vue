<template>
  <div class="loader-config">
    <div class="form-group">
      <label for="loaderDuration">Duración de Loader (segundos):</label>
      <input
        id="loaderDuration"
        type="number"
        min="0"
        v-model.number="durationSeconds"
        class="input-number"
      />
    </div>
    <div class="form-group">
      <label for="loaderActive">Activar Loader:</label>
      <input
        id="loaderActive"
        type="checkbox"
        v-model="active"
        class="input-switch"
      />
    </div>
    <button class="save-btn" @click="confirmSave">Guardar Configuración</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';

const durationSeconds = ref(6);
const active = ref(true);

// Cargar valores desde localStorage al iniciar
onMounted(() => {
  const showLoader = localStorage.getItem('showLoader');
  const loaderTime = localStorage.getItem('loaderTime');
  try {
    active.value = showLoader || true;
    // loaderTime está en ms, convertir a segundos para el input
    durationSeconds.value = loaderTime ? Math.round(JSON.parse(loaderTime) / 1000) : 6;
  } catch {
    durationSeconds.value = 6;
  }
});

const confirmSave = () => {
  Swal.fire({
    title: '¿Estás seguro de guardar la configuración?',
    text: `Duración: ${durationSeconds.value} segundos\nLoader: ${active.value ? 'Activado' : 'Desactivado'}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, guardar',
    cancelButtonText: 'No, cancelar',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      // Guardar en localStorage (convertir a ms)
      localStorage.setItem('showLoader', active.value );
      localStorage.setItem('loaderTime', durationSeconds.value * 1000 );
      Swal.fire('¡Guardado!', 'La configuración del loader ha sido guardada.', 'success');
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire('Cancelado', 'No se guardó la configuración.', 'info');
    }
  });
};
</script>
<style scoped>
.save-btn {
  margin-top: 1rem;
  padding: 0.7rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:hover {
  background: #27ae60;
}

.loader-config {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--ligth-color);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.input-number {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
.input-switch {
  width: 1.2rem;
  height: 1.2rem;
}
.preview {
  background: #f6f6f6;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  font-size: 1.1rem;
}
@media (max-width: 600px) {
  .loader-config {
    padding: 1rem;
    max-width: 95vw;
  }
}
</style>
