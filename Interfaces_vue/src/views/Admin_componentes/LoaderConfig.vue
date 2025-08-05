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
      <label for="loaderSpeed">Velocidad de Loader (ms):</label>
      <input
        id="loaderSpeed"
        type="range"
        min="200"
        max="900"
        step="10"
        v-model.number="tangramSpeed"
        class="input-range"
      />
      <span class="range-value">{{ tangramSpeed }} ms</span>
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
const tangramSpeed = ref(400);

// Cargar valores desde localStorage al iniciar
onMounted(() => {
  const showLoader = localStorage.getItem('showLoader');
  const loaderTime = localStorage.getItem('loaderTime');
  const tangramSpeedStorage = localStorage.getItem('tangramSpeed');
  try {
    active.value = showLoader === null ? true : showLoader === 'true';
    // loaderTime está en ms, convertir a segundos para el input
    durationSeconds.value = loaderTime ? Math.round(JSON.parse(loaderTime) / 1000) : 6;
    tangramSpeed.value = tangramSpeedStorage ? Number(tangramSpeedStorage) : 400;
  } catch {
    durationSeconds.value = 6;
    tangramSpeed.value = 400;
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
      localStorage.setItem('tangramSpeed', tangramSpeed.value || 400); // Valor por defecto de 400 ms
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
.input-range {
  width: 100%;
  margin-top: 0.3rem;
}
.range-value {
  display: block;
  margin-top: 0.2rem;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3436;
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
