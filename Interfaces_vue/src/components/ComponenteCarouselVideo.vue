<template>
  <div class="video-carousel-container">
    <header class="header">
      <h3>Carrusel de Videos con Subtítulos</h3>
    </header>

    <Carousel v-bind="config" class="contendor">
      <Slide v-for="(video, index) in videos" :key="index">
        <div class="custom-slide" @click="openModal(video)">
          <img v-if="video.thumbnail" :src="video.thumbnail" class="video-thumbnail" />
          <div class="video-title">
            <h3 class="Cambio_subtitulo">{{ video.title }}</h3>
          </div>
          <div class="video-subtitle-indicator" v-if="video.subtitles.length > 0">
            <span class="subtitle-icon">CC</span>
          </div>
        </div>
      </Slide>

      <template #addons>
        <Navigation />
        <Pagination />
      </template>
    </Carousel>

    <!-- Modal de reproducción -->
    <div v-if="selectedVideo" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-button" @click="closeModal">&times;</button>

        <div class="modal-grid">
          <div class="video-container">
            <div class="video-wrapper">
              <video ref="videoPlayer" class="video-js vjs-big-play-centered"></video>
            </div>
          </div>

          <div class="details-container">
            <h3 class="video-title Cambio_subtitulo2">{{ selectedVideo.title }}</h3>

            <div class="detail-item">
              <span class="detail-label">Nombre:</span>
              <span class="detail-value">{{ selectedVideo.title }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Tamaño:</span>
              <span class="detail-value">{{ formatFileSize(selectedVideo.size) }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Formato:</span>
              <span class="detail-value">{{ selectedVideo.format }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Dimensiones:</span>
              <span class="detail-value">{{ videoDimensions.width }}px x {{ videoDimensions.height }}px</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Duración:</span>
              <span class="detail-value">{{ formatDuration(selectedVideo.duration) }}</span>
            </div>

            <div class="control-group">
              <label for="audio-track">Pista de audio:</label>
              <select id="audio-track" v-model="selectedAudioTrack" @change="changeAudioTrack">
                <option v-for="(track, index) in audioTracks" :key="index" :value="index">
                  {{ track.label }}
                </option>
              </select>
            </div>

            <!-- <div class="control-group" v-if="selectedVideo.subtitles.length > 0">
              <label for="subtitle-track">Subtítulos:</label>
              <select id="subtitle-track" v-model="selectedSubtitleTrack" @change="changeSubtitleTrack">
                <option value="-1">Desactivados</option>
                <option v-for="(subtitle, index) in selectedVideo.subtitles" :key="index" :value="index">
                  {{ subtitle.label }} ({{ subtitle.lang }})
                </option>
              </select>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel';
import 'vue3-carousel/carousel.css';
import { ref, reactive, onBeforeUnmount, nextTick, onMounted } from 'vue';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import VideoExample from '@/assets/temp/eu.mp4'
//import ImagenExample from '@/assets/img/intro-bg.png'
import AudioExample from '@/assets/temp/0006.mp3'
import SubtituloExample from '@/assets/temp/op.vtt'
import SubtituloExample2 from '@/assets/temp/op1.vtt'

/**
 * Genera una miniatura de un video en un punto de tiempo específico.
 * @param {string} videoSrc - La URL del archivo de video.
 * @returns {Promise<string>} - Una promesa que se resuelve con la imagen en formato Data URL.
 */
const generateVideoThumbnail = (videoSrc) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata'; // Optimización: solo necesitamos los metadatos iniciales

    // 1. Esperamos a que los metadatos (duración, dimensiones) se carguen
    video.onloadedmetadata = () => {
      // 2. AHORA que el video está listo, le pedimos que vaya al segundo 1
      video.currentTime = 1;
    };

    // 3. Esperamos a que el video haya saltado (seek) exitosamente a ese punto
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      // 4. Dibujamos el fotograma actual en el canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg'));
    };

    video.onerror = (e) => {
      reject(`Error al cargar el video para generar la miniatura: ${e.message}`);
    };
  });
};


// Subtítulos estáticos en formato VTT
// Se hizo este en comentado, porque antes estan compartiendo de forma universal, solo para ustedes vean como se hacen la cosa
// me refiero tipo conexion
// const sampleSubtitles = [
//    {
//     label: 'Español',
//     lang: 'es',
//     src: SubtituloExample // <- Ruta al archivo
//   },
//   {
//     label: 'Inglés',
//     lang: 'en',
//     src: SubtituloExample2 // <- Ruta al archivo
//   }
// ];

// Videos de ejemplo con subtítulos
const videos = ref([
  {
    id: 1,
    title: 'Naturaleza en 4K',
    videoSrc: VideoExample,
    thumbnail: '',
    format: 'mp4',
    size: 1024 * 1024, // 1MB
    duration: 60, // 60 segundos
    audioTracks: [
      { label: 'Audio original', src: null },
      { label: 'Música relajante', src: AudioExample }
    ],
    subtitles: [
      { label: 'Español', lang: 'es', src: SubtituloExample },
      { label: 'Ingles', lang: 'in', src: SubtituloExample2 }
    ]
  },
  {
    id: 2,
    title: 'Ciudad al atardecer',
    videoSrc: VideoExample,
    thumbnail: '',
    format: 'mp4',
    size: 2.5 * 1024 * 1024, // 2.5MB
    duration: 45, // 45 segundos
    audioTracks: [
      { label: 'Audio original', src: null },
      { label: 'Sonidos urbanos', src: AudioExample }
    ],
    subtitles: [
      { label: 'Español', lang: 'es', src: SubtituloExample },
      { label: 'Ingles', lang: 'in', src: SubtituloExample2 }
    ] // Solo español
  },
  {
    id: 3,
    title: 'Playas paradisíacas',
    videoSrc: VideoExample,
    thumbnail: '',
    format: 'mp4',
    size: 3.8 * 1024 * 1024, // 3.8MB
    duration: 90, // 90 segundos
    audioTracks: [
      { label: 'Audio original', src: null },
      { label: 'Olas del mar', src: AudioExample }
    ],
    subtitles: [{ label: 'Español', lang: 'es', src: SubtituloExample }] // Solo inglés
  },
  {
    id: 4,
    title: 'Montañas nevadas',
    videoSrc: VideoExample,
    thumbnail: '',
    format: 'mp4',
    size: 4.2 * 1024 * 1024, // 4.2MB
    duration: 75, // 75 segundos
    audioTracks: [
      { label: 'Audio original', src: null },
      { label: 'Sonidos de viento', src: AudioExample }
    ],
    subtitles: [{ label: 'Español', lang: 'es', src: SubtituloExample }] // Ambos idiomas
  }
]);

const config = {
  width: 300,
  itemsToShow: 3,
  gap: 10,
  autoplay: 3500,
  wrapAround: true,
  pauseAutoplayOnHover: true
};

// Estado para el modal
const selectedVideo = ref(null);
const videoPlayer = ref(null);
const playerInstance = ref(null);
const audioElement = ref(null);
const videoDimensions = ref({ width: 0, height: 0 });
const audioTracks = ref([]);
const selectedAudioTrack = ref(0);
const selectedSubtitleTrack = ref(-1);

// Listeners de sincronización
const syncListeners = ref({
  play: null,
  pause: null,
  seeking: null,
  timeupdate: null
});

// Abrir modal
const openModal = (video) => {
  selectedVideo.value = video;
  audioTracks.value = video.audioTracks;
  selectedAudioTrack.value = 0;
  selectedSubtitleTrack.value = -1;

  nextTick(() => {
    initVideoPlayer();
  });
};

// Cerrar modal
const closeModal = () => {
  if (playerInstance.value) {
    playerInstance.value.dispose();
    playerInstance.value = null;
  }
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value = null;
  }
  removeSyncListeners();
  selectedVideo.value = null;
  videoDimensions.value = { width: 0, height: 0 };
};

// Inicializar el reproductor de video con subtítulos
const initVideoPlayer = () => {
  if (!videoPlayer.value) return;

  if (playerInstance.value) {
    playerInstance.value.dispose();
  }

  // Configuración del reproductor con soporte para subtítulos
  playerInstance.value = videojs(videoPlayer.value, {
    controls: true,
    autoplay: false,
    preload: 'auto',
    responsive: true,
    fluid: true,
    playbackRates: [0.5, 1, 1.5, 2],
    sources: [{
      src: selectedVideo.value.videoSrc,
      type: 'video/mp4'
    }],
    tracks: selectedVideo.value.subtitles.map((subtitle, index) => ({
      kind: 'subtitles',
      label: subtitle.label,
      srclang: subtitle.lang,
      src: subtitle.src,
      default: index === 0
    }))
  }, () => {
    console.log('Reproductor listo con subtítulos!');

    // Método 2: Añadir estilos CSS dinámicamente
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .video-js .vjs-text-track-cue div {
          color: var(--dark-color) !important;
          background-color: rgba(0, 0, 0, 0.5) !important;
          font-size: var(--text-font) !important;
          font-family: var(--font-secundaria) !important;
          font-weight: bold !important;
          text-shadow: 
            2px 0 2px black,
            -2px 0 2px black,
            0 2px 2px black,
            0 -2px 2px black !important;
        }
      `;
    document.head.appendChild(style);

    // Obtener dimensiones del video
    playerInstance.value.on('loadedmetadata', () => {
      videoDimensions.value = {
        width: playerInstance.value.videoWidth(),
        height: playerInstance.value.videoHeight()
      };
    });

    // Configurar el botón de subtítulos
    const subsButton = playerInstance.value.controlBar.subsCapsButton;
    if (subsButton) {
      subsButton.controlText('Subtítulos');
    }
  });

  // Configurar la pista de audio inicial
  changeAudioTrack();
};

// Cambiar subtítulos
const changeSubtitleTrack = () => {
  if (!playerInstance.value) return;

  const trackIndex = selectedSubtitleTrack.value;
  const textTracks = playerInstance.value.textTracks();

  // Desactivar todos los subtítulos primero
  for (let i = 0; i < textTracks.length; i++) {
    textTracks[i].mode = 'disabled';
  }

  // Activar el subtítulo seleccionado si no es -1
  if (trackIndex >= 0 && trackIndex < textTracks.length) {
    textTracks[trackIndex].mode = 'showing';
  }
};

// Cambiar pista de audio (igual que antes)
const changeAudioTrack = () => {
  if (!playerInstance.value) return;

  const trackIndex = selectedAudioTrack.value;

  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value = null;
    removeSyncListeners();
  }

  if (trackIndex === 0) {
    playerInstance.value.volume(1);
  } else if (trackIndex < audioTracks.value.length) {
    const track = audioTracks.value[trackIndex];
    const wasPlaying = !playerInstance.value.paused();
    const currentTime = playerInstance.value.currentTime();
    const playbackRate = playerInstance.value.playbackRate();

    playerInstance.value.pause();

    audioElement.value = new Audio(track.src);
    audioElement.value.currentTime = currentTime;
    audioElement.value.playbackRate = playbackRate;

    const onPlay = () => {
      if (audioElement.value.paused) {
        audioElement.value.currentTime = playerInstance.value.currentTime();
        audioElement.value.playbackRate = playerInstance.value.playbackRate();
        audioElement.value.play().catch(e => console.error("Error al reproducir audio:", e));
      }
    };

    const onPause = () => {
      if (!audioElement.value.paused) {
        audioElement.value.pause();
      }
    };

    const onSeeking = () => {
      audioElement.value.currentTime = playerInstance.value.currentTime();
    };

    const onTimeupdate = () => {
      const diff = Math.abs(audioElement.value.currentTime - playerInstance.value.currentTime());
      if (diff > 0.15) {
        audioElement.value.currentTime = playerInstance.value.currentTime();
      }
    };

    const onRatechange = () => {
      audioElement.value.playbackRate = playerInstance.value.playbackRate();
    };

    playerInstance.value.on('play', onPlay);
    playerInstance.value.on('pause', onPause);
    playerInstance.value.on('seeking', onSeeking);
    playerInstance.value.on('timeupdate', onTimeupdate);
    playerInstance.value.on('ratechange', onRatechange);

    syncListeners.value = {
      play: onPlay,
      pause: onPause,
      seeking: onSeeking,
      timeupdate: onTimeupdate,
      ratechange: onRatechange
    };

    playerInstance.value.volume(0);

    if (wasPlaying) {
      playerInstance.value.play().then(() => {
        audioElement.value.play().catch(e => console.error("Error al iniciar audio:", e));
      });
    }
  }
};

// Formatear tamaño del archivo
const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Formatear duración (segundos a MM:SS)
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Limpiar listeners de sincronización
const removeSyncListeners = () => {
  if (!playerInstance.value) return;

  Object.keys(syncListeners.value).forEach(event => {
    if (syncListeners.value[event]) {
      playerInstance.value.off(event, syncListeners.value[event]);
      syncListeners.value[event] = null;
    }
  });
};

// Limpiar al desmontar
onBeforeUnmount(() => {
  if (playerInstance.value) {
    playerInstance.value.dispose();
  }
  if (audioElement.value) {
    audioElement.value.pause();
  }
  removeSyncListeners();
});

onMounted(async () => {
  console.log('Generando portadas de video...');
  try {
    for (const video of videos.value) {
      // Solo genera la miniatura si no la tiene ya
      if (!video.thumbnail) {
        const thumbnailUrl = await generateVideoThumbnail(video.videoSrc);
        video.thumbnail = thumbnailUrl;
      }
    }
    console.log('Portadas generadas exitosamente.');
  } catch (error) {
    console.error('Ocurrió un error al generar las portadas:', error);
  }
});
</script>

<style scoped>
.video-carousel-container {
  max-width: 1200px;
  margin: 50px auto;
  padding: 20px;
  font-family: var(--font-principal);
  /* background: linear-gradient(135deg, #bac3ea, #778bda); */
  border-radius: 12px;
  /* box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); */
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h3 {
  font-size: 2rem;
  color: white;
  padding: 15px;
  border-radius: 8px;
  display: inline-block;
  font-size: var(--title-font);
  color: var(----dark-color);
}

.carousel {
  --vc-pgn-background-color: var(--ligth-color);
  --vc-pgn-active-color: var(--primary-color);
  --vc-nav-background: var(--secondary-color);
  --vc-nav-border-radius: 100%;
}

.custom-slide {
  background: white;
  color: #333;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  margin-bottom: 20px;
}

.custom-slide:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.4);
}

.video-thumbnail {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 3px solid #4a00e0;
}

.video-title {
  padding: 15px 10px;
  text-align: center;
  font-weight: 600;
  background: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.Cambio_subtitulo {
  color: var(--dark-color);
  font-family: var(--font-secundaria);
  font-size: var(--subtitle-font);
}

.Cambio_subtitulo2 {
  color: var(--ligth-color);
  font-size: var(--subtitle-font);
}

.video-subtitle-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  padding: 3px 6px;
}

.subtitle-icon {
  color: var(--ligth-color);
  font-size: 0.8rem;
  font-weight: bold;
}

.contendor {
  max-width: 1200px;
  margin: auto;
}

/* Estilos para el modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #e0e0e0;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff4d4d;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1010;
}

.close-button:hover {
  background: #ff1a1a;
  transform: scale(1.1);
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
  align-items: center;
}

.video-container {
  grid-column: 1 / -1;
}

.video-wrapper {
  width: 100%;
  position: relative;
  padding-top: 56.25%;
  /* 16:9 Aspect Ratio */
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.video-js {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
}

.details-container {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.video-title {
  margin: 0 0 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

.detail-item {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.detail-label {
  font-weight: bold;
  color: var(--dark-color);
  min-width: 120px;
  font-size: var(--text-font);
  font-family: var(--font-secundaria);

}

.detail-value {
  color: var(--ligth-color);
  font-size: var(--text-font);
  font-family: var(--font-secundaria);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.control-group label {
  font-weight: bold;
  color: var(--dark-color);
  font-size: var(--text-font);
  font-family: var(--font-secundaria);
}

.control-group select {
  padding: 10px 15px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  min-width: 200px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  color: var(--dark-color);
  font-size: var(--text-font);
  font-family: var(--font-secundaria);
}

.control-group select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 0, 224, 0.5);
}

/* Estilos para los subtítulos en el reproductor */
:deep(.video-js .vjs-text-track-display) {
  font-size: 1.2em;
  text-shadow: 1px 1px 2px black, -1px -1px 2px black;
}

:deep(.video-js .vjs-subs-caps-button) {
  cursor: pointer;
}

.vjs-text-track-cue.vjs-text-track-cue-es {}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 20px;
  }

  .detail-item {
    flex-direction: column;
    gap: 5px;
  }

  .control-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .config {
    itemsToShow: 2;
  }
}

@media (max-width: 480px) {
  .config {
    itemsToShow: 1;
  }

  .header h3 {
    font-size: 1.5rem;
  }
}
</style>