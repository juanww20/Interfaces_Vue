<template>
  <header class="header">
    <h3 style="font-size: var(--title-font);">Carousel</h3>
  </header>
  
  <Carousel v-bind="config" class="contendor">
    <Slide v-for="(image, index) in imagenes" :key="index">
      <div class="custom-slide" @click="openModal(image)">
        <img :src="image.url" :alt="image.name" />

        <!-- Botón solo visible si eres admin -->
        <button 
          v-if="showDelete && isAdmin" 
          class="delete-btn" 
          @click.stop="confirmDelete(image.image_id)">
          🗑 Eliminar
        </button>
      </div>
    </Slide>

    <template #addons>
      <Navigation />
      <Pagination />
    </template>
  </Carousel>

   <!-- Modal mejorado -->
  <div v-if="selectedImage" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">&times;</button>
      
      <div class="modal-grid">
        <div class="image-container">
          <img 
            :src="selectedImage.url" 
            :alt="selectedImage.name" 
            ref="modalImage" 
            @load="onImageLoad"
            class="modal-image"
          />
        </div>
        
        <div class="details-container">
          <h3 class="image-title">{{ selectedImage.name }}</h3>
          
          <div class="detail-item">
            <span class="detail-label">Dimensiones:</span>
            <span class="detail-value">{{ imageDimensions.width }}px x {{ imageDimensions.height }}px</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Formato:</span>
            <span class="detail-value">{{ selectedImage.format }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Tamaño:</span>
            <span class="detail-value">{{ formatFileSize(selectedImage.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel';
import { ref, onMounted, computed, defineProps } from 'vue';
import 'vue3-carousel/carousel.css'
//import t1 from '@/assets/img/carousel/testimonial-1.jpg'
//import t2 from '@/assets/img/carousel/testimonial-2.jpg'
//import t3 from '@/assets/img/carousel/testimonial-3.jpg'
//import t4 from '@/assets/img/carousel/testimonial-4.jpg'
//import t5 from '@/assets/img/carousel/testimonial-5.jpg'
//import t6 from '@/assets/img/foto.png'
//import t7 from '@/assets/img/about-extra-1.svg'
//import t8 from '@/assets/img/intro-bg.png'
import { imageService } from "@/services/project_4/multimediaService"
import { useAuthStore } from '@/stores/Auth';
import Swal from 'sweetalert2';

const authStore = useAuthStore();

const isAdmin = computed(() => authStore.user.role === 'admin');

defineProps({
  showDelete: {
    type: Boolean,
    default: false
  }
});

/*
const imagenes = ref([
    { img: t1, title: 'Imagen 1' },
    { img: t2, title: 'Imagen 2' },
    { img: t3, title: 'Imagen 3' },
    { img: t4, title: 'Imagen 4' },
    { img: t5, title: 'Imagen 5' },
    { img: t6, title: 'EU, furinaaaa' },
    { img: t7, title: 'EXTRA, extra' },
    { img: t8, title: 'EXTRA, extra2' }
]);
*/

const imagenes = ref([]);

const fetchImages = async () => {
  try {
    const response = await imageService.getImages();
    if(response && response.data) {
      imagenes.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching images:', error);
  }
};

const confirmDelete = async (id) => {
  const result = await Swal.fire({
    title: "¿Eliminar imagen?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (result.isConfirmed) {
    try {
      await imageService.deleteImage(id); // 👈 Llamada API
      fetchImages(); // Volver a obtener las imágenes
      Swal.fire("Eliminada", "La imagen ha sido eliminada", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo eliminar la imagen", "error");
    }
  }
};

const config = {
  width: 300,
  itemsToShow: 3,
  gap: 0,
  autoplay: 2500,
  wrapAround: true,
  pauseAutoplayOnHover: true
};

// Estado para el modal
const selectedImage = ref(null);
const modalImage = ref(null);
const imageDimensions = ref({ width: 0, height: 0 });

// Función para abrir el modal
const openModal = (image) => {
  selectedImage.value = image;
};

// Función para cerrar el modal
const closeModal = () => {
  selectedImage.value = null;
};

// Obtener dimensiones cuando la imagen se carga
const onImageLoad = () => {
  if (modalImage.value) {
    imageDimensions.value = {
      width: modalImage.value.naturalWidth,
      height: modalImage.value.naturalHeight
    };
  }
};

/*
// Calcular formato de la imagen
const imageFormat = computed(() => {
  if (!selectedImage.value) return '';
  const src = selectedImage.value.img;
  return src.split('.').pop().toUpperCase();
});

// Calcular tamaño del archivo (aproximado)
const fileSize = computed(() => {
  if (!selectedImage.value) return '';
  const src = selectedImage.value.img;
  
  // Esto es una aproximación ya que no podemos acceder al tamaño real del archivo
  // En una aplicación real, deberías obtener esta información del backend
  // o usar la API File si las imágenes son subidas por el usuario
  
  // Estimación basada en dimensiones
  const { width, height } = imageDimensions.value;
  const estimatedSizeKB = Math.round((width * height * 3) / 1024); // 3 bytes por pixel (RGB)
  
  if (estimatedSizeKB < 1024) {
    return `${estimatedSizeKB} KB`;
  } else {
    return `${(estimatedSizeKB / 1024).toFixed(1)} MB`;
  }
});
*/

// Formatear tamaño del archivo
const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

onMounted(() => {
  fetchImages();
});
</script>

<style scoped>
.header {
  text-align: center;
}

.carousel {
  --vc-pgn-background-color: var(--ligth-color);
  --vc-pgn-active-color: var(--primary-color);
  --vc-nav-background: var(--secondary-color);
  --vc-nav-border-radius: 100%;
}

img {
  border-radius: 8px;
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.02);
}

.custom-slide {
  width: 300px;
  background: var(--ligth-color);
  color: var(--primary-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-font);
  font-weight: bold;
  box-shadow: 0 4px 8px var(--dark-color);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.carousel__slide {
  padding: 10px;
}

.custom-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

/* Botón eliminar como overlay */
.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 0, 0, 0.85);
  border: none;
  color: white;
  font-size: 16px;
  padding: 6px 10px;
  border-radius: 20%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.custom-slide:hover .delete-btn {
  opacity: 1; /* solo se ve cuando pasas el mouse */
}

.delete-btn:hover {
  background: red;
}

.contendor {
  max-width: 1200px;
  margin: auto;
}

/* Estilos mejorados para el modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color:rgba(0, 0, 0, 0.7); /*var(--dark-color)*/
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--secondary-color);
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--dark-color);
  transition: color 0.2s;
}

.close-button:hover {
  color: var(--primary-color);
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: center;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--primary-color);
  border-radius: 8px;
  padding: 15px;
  height: 100%;
}

.modal-image {
  max-height: 400px;
  max-width: 100%;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.details-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.image-title {
  margin: 0;
  color: var(--primary-color);
  font-size: var(--subtitle-font);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 10px;
}

.detail-item {
  display: flex;
  gap: 10px;
}

.detail-label {
  font-weight: bold;
  font-size: var(--text-font);
  color: var(--dark-color);
  min-width: 100px;
}

.detail-value {
  color: var(--dark-color);
  font-size: var(--text-font);
}

/* Responsive design para móviles */
@media (max-width: 768px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    padding: 20px;
  }
  
  .image-container {
    max-height: 300px;
  }
}
</style>