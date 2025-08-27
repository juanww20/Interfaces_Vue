<template>
  <div class="image-uploader">
      <h2>Subir Imagen para editar la fotos</h2>
      <div class="centrar">
        <img :src="Icono_foto" alt="" style="width: 80px; height: auto;">
      </div>

    <div class="upload-section">
      <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange" style="display: none">
      <button @click="triggerFileInput">Seleccionar Imagen</button>
      <button v-if="imageSrc" @click="clearImage" class="clear-btn">Borrar Foto</button>

      <div v-if="selectedFile" class="file-info">
        Seleccionado: {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
      </div>
    </div>

    <div v-if="imageSrc" class="cropper-section">
      <div class="cropper-container">
        <vue-cropper ref="cropper" :src="imageSrc" :aspect-ratio="NaN" :view-mode="2" :auto-crop-area="0.8"
          :min-container-width="300" :min-container-height="300" :background="true"
          @ready="onCropperReady"></vue-cropper>
      </div>

      <div class="controls">
        <button @click="cropImage">Recortar imagen</button>
        <button @click="rotate(-90)">Rotar izquierda</button>
        <button @click="rotate(90)">Rotar derecha</button>
        <button @click="reset">Reiniciar</button>
      </div>
    </div>

    <div v-if="croppedImage" class="result-section">
      <h3>Resultado del recorte</h3>
      <div class="cropped-image-container">
        <img :src="croppedImage" alt="Imagen recortada" class="cropped-image">
      </div>
      <div class="image-details">
        <p><strong>Nombre de archivo:</strong> {{ croppedFileName }}</p>
        <p><strong>Dimensiones:</strong> {{ croppedDimensions.width }} × {{ croppedDimensions.height }} píxeles</p>
        <p><strong>Tamaño de archivo:</strong> {{ formatFileSize(croppedFileSize) }}</p>
      </div>
      <button @click="uploadCroppedImage" class="upload-btn">Subir Imagen Recortada</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Icono_foto from '@/assets/img/foto.png'
import VueCropper from 'vue-cropperjs';
import '@/views/Admin_componentes/cropper.css'
import { imageService } from "@/services/project_4/multimediaService"
import Swal from 'sweetalert2';

// Referencias reactivas
const fileInput = ref(null);
const cropper = ref(null);
const imageSrc = ref('');
const selectedFile = ref(null);
const croppedImage = ref('');
const croppedFileName = ref('');
const croppedDimensions = ref({ width: 0, height: 0 });
const croppedFileSize = ref(0);

// Activa el input de archivo
const triggerFileInput = () => {
  fileInput.value.click();
};

// Maneja el cambio de archivo seleccionado
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile.value = file;
  croppedImage.value = '';

  const reader = new FileReader();
  reader.onload = (event) => {
    imageSrc.value = event.target.result;
  };
  reader.readAsDataURL(file);
};

// Limpia la imagen seleccionada
const clearImage = () => {
  imageSrc.value = '';
  selectedFile.value = null;
  croppedImage.value = '';
  croppedFileName.value = '';
  croppedDimensions.value = { width: 0, height: 0 };
  croppedFileSize.value = 0;

  // Reinicia el input de archivo para permitir seleccionar el mismo archivo nuevamente
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Callback cuando el cropper está listo
const onCropperReady = () => {
  console.log('Cropper listo');
};

// Recorta la imagen
const cropImage = () => {
  if (!cropper.value) return;

  const canvas = cropper.value.getCroppedCanvas({
    minWidth: 1,
    minHeight: 1,
    maxWidth: 4096,
    maxHeight: 4096,
    fillColor: '#fff',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });

  if (!canvas) return;

  croppedDimensions.value = {
    width: canvas.width,
    height: canvas.height
  };

  canvas.toBlob((blob) => {
    croppedFileSize.value = blob.size;

    const reader = new FileReader();
    reader.onload = () => {
      croppedImage.value = reader.result;
    };
    reader.readAsDataURL(blob);
  }, selectedFile.value.type || 'image/png', 0.92);

  const fileName = selectedFile.value.name;
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex !== -1) {
    croppedFileName.value = fileName.substring(0, dotIndex) + '_recortada' + fileName.substring(dotIndex);
  } else {
    croppedFileName.value = fileName + '_recortada';
  }
};

// Rota la imagen
const rotate = (degrees) => {
  if (cropper.value) {
    cropper.value.rotate(degrees);
  }
};

// Reinicia el cropper
const reset = () => {
  if (cropper.value) {
    cropper.value.reset();
  }
};

// Formatea el tamaño del archivo para mostrarlo
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const uploadCroppedImage = async () => {
  if (!croppedImage.value) return;

  const canvas = cropper.value.getCroppedCanvas();
  canvas.toBlob(async (blob) => {
    if (!blob) return;

    // Crear archivo con nombre
    const file = new File([blob], croppedFileName.value, { type: selectedFile.value.type || 'image/png' });

    // Armar el FormData
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Mostrar loading mientras se sube
      Swal.fire({
        title: "Subiendo imagen...",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await imageService.createImage(formData);

      // Éxito
      Swal.fire({
        icon: "success",
        title: "¡Imagen subida!",
        text: "La imagen se subió correctamente.",
        confirmButtonText: "Aceptar"
      });

      console.log("✅ Imagen subida correctamente:", response.data);

    } catch (error) {
      console.error("❌ Error al subir imagen:", error);

      // Error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo subir la imagen. Intenta de nuevo.",
        confirmButtonText: "Reintentar"
      });
    }
  }, selectedFile.value.type || 'image/png', 0.92);
};

</script>

<style scoped>
.centrar{
  display: flex;
  justify-content: center;
  padding: 20px 10px;
}
.image-uploader {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.upload-section,
.cropper-section,
.result-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  text-align: center;
}

.cropper-container {
  width: 100%;
  height: 400px;
  margin-bottom: 50px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

button {
  padding: 8px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #45a049;
}

.clear-btn {
  background-color: #f44336;
  margin-left: 10px;
}

.clear-btn:hover {
  background-color: #d32f2f;
}

.cropped-image-container {
  max-width: 100%;
  margin-bottom: 15px;
}

.cropped-image {
  max-width: 100%;
  max-height: 400px;
  display: block;
  margin: 0 auto;
}

.image-details {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
}

.image-details strong{
  color: var(--dark-color);
}

.file-info {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}

.upload-btn {
  margin-top: 10px;
  background-color: #2196F3;
}

</style>