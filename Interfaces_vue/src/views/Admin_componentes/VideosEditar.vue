<template>
  <div class="video-upload-container">
    <div class="upload-section">
      <h2>Subir y Configurar Video</h2>
      <form @submit.prevent="handleSubmit" class="upload-form">

        <div class="form-group">
          <label for="video-file">Archivo de video (MP4):</label>
          <input id="video-file" type="file" accept=".mp4" required @change="handleVideoUpload" />
          <div v-if="videoData.file" class="file-info">
            Archivo seleccionado: {{ videoData.file.name }} ({{ formatFileSize(videoData.file.size) }})
          </div>
        </div>

        <div class="form-group">
          <label for="audio-file">Pistas de audio adicionales (opcional):</label>
          <input id="audio-file" type="file" accept="audio/*" multiple @change="handleAudioUpload" />
          <div v-if="videoData.audioFiles.length > 0" class="file-list">
            <div v-for="(file, index) in videoData.audioFiles" :key="index" class="file-item">
              <span>{{ file.name }} ({{ formatFileSize(file.size) }})</span>
              <!-- Nuevo campo para idioma -->
              <input
                type="text"
                v-model="videoData.audioFiles[index].language"
                placeholder="Idioma: es, en, fr"
                class="lang-input"
                style="width: 100px ; margin-left: 8px; padding: 2px 5px; font-size: 12px;"
              />
              <button @click.prevent="removeAudio(index)" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="subtitle-file">Archivos de subtítulos (VTT, opcional):</label>
          <input id="subtitle-file" type="file" accept=".vtt" multiple @change="handleSubtitleUpload" />
          <div v-if="videoData.subtitleFiles.length > 0" class="file-list">
            <div v-for="(file, index) in videoData.subtitleFiles" :key="index" class="file-item">
              <span>{{ file.name }} ({{ formatFileSize(file.size) }})</span>
              <!-- Nuevo campo para idioma -->
              <input
                type="text"
                v-model="videoData.subtitleFiles[index].language"
                placeholder="Idioma: es, en, fr"
                class="lang-input"
                style="width: 100px ; margin-left: 8px; padding: 2px 5px; font-size: 12px;"
              />
              <button @click.prevent="removeSubtitle(index)" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <button @click.prevent="generatePreview" :disabled="!videoData.file" class="preview-btn">
          Previsualizar Video
        </button>
      </form>
    </div>

    <div class="preview-section" v-if="showPreview">
      <h2>Previsualización</h2>
      
      <div class="preview-controls">
        <div class="control-group">
          <label>Pista de audio:</label>
          <select v-model="selectedAudioTrack" @change="changeAudioTrack">
            <option v-for="(track, index) in audioTracks" :key="index" :value="index">
              {{ track.label }}
            </option>
          </select>
        </div>
        </div>
      
      <div class="video-wrapper">
        <video ref="videoPlayer" class="video-js vjs-big-play-centered"></video>
      </div>
      
      <button @click="handleSubmit" class="submit-btn">Subir Video al Servidor</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, nextTick } from 'vue';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { videoService, audioService, subtituloService } from "@/services/project_4/multimediaService"
import Swal from "sweetalert2"

// Datos del formulario
const videoData = reactive({
  name: '',
  file: null,
  audioFiles: [],
  subtitleFiles: []
});

// Referencias del DOM y del reproductor
const videoPlayer = ref(null);
const playerInstance = ref(null);
const audioElement = ref(null);

// Estado de la UI
const previewVideoSrc = ref('');
const showPreview = ref(false);
const selectedAudioTrack = ref(0);

// Listas de pistas para el reproductor
const audioTracks = ref([]);
const subtitles = ref([]);

// Listeners de sincronización de audio
const syncListeners = ref({
  play: null,
  pause: null,
  seeking: null,
  timeupdate: null
});

// Función para obtener duración de medios
const getMediaDuration = (file) => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const media = file.type.includes('audio') ? new Audio() : document.createElement('video');
    
    media.src = url;
    media.onloadedmetadata = () => {
      resolve(media.duration);
      URL.revokeObjectURL(url);
    };
    
    media.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
  });
};

// Función para estimar duración de subtítulos VTT
const getSubtitleDuration = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const vttContent = e.target.result;
      const lines = vttContent.split('\n');
      let lastTime = 0;
      
      // Buscar el último marcador de tiempo
      for (const line of lines) {
        if (line.includes('-->')) {
          const parts = line.split('-->')[1].trim().split(' ');
          const endTime = parts[0];
          const seconds = convertVttTimeToSeconds(endTime);
          lastTime = Math.max(lastTime, seconds);
        }
      }
      
      resolve(lastTime || 0);
    };
    reader.onerror = () => resolve(0);
    reader.readAsText(file);
  });
};

// Convertir formato VTT (00:00:00.000) a segundos
const convertVttTimeToSeconds = (timeStr) => {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return (hours * 3600) + (minutes * 60) + seconds;
  }
  return 0;
};

/**
 * Maneja la selección del archivo de video
 */
const handleVideoUpload = (event) => {
  const file = event.target.files[0];
  if (file && (file.type.includes('mp4') || file.name.toLowerCase().endsWith('.mp4'))) {
    videoData.file = file;
  } else {
    alert('Por favor, sube un archivo MP4 válido.');
    event.target.value = ''; // Limpiar input
  }
};

/**
 * Maneja la subida de múltiples audios y los añade a la lista
 */
const handleAudioUpload = (event) => {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    if (file.type.includes('audio')) {
      videoData.audioFiles.push(file);
    }
  });
  event.target.value = ''; // Limpiar para poder subir el mismo archivo otra vez
};

/**
 * Elimina un audio de la lista
 */
const removeAudio = (index) => {
  videoData.audioFiles.splice(index, 1);
};

/**
 * Maneja la subida de múltiples subtítulos y los añade a la lista
 */
const handleSubtitleUpload = (event) => {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    if (file.name.toLowerCase().endsWith('.vtt')) {
      videoData.subtitleFiles.push(file);
    }
  });
  event.target.value = ''; // Limpiar para poder subir el mismo archivo otra vez
};

/**
 * Elimina un subtítulo de la lista
 */
const removeSubtitle = (index) => {
  videoData.subtitleFiles.splice(index, 1);
};

/**
 * Prepara los datos y muestra la sección de previsualización
 */
const generatePreview = async () => {
  if (!videoData.file) return;

  // Validación de duración
  try {
    const videoDuration = await getMediaDuration(videoData.file);
    
    
    // Verificar audios
    for (const audioFile of videoData.audioFiles) {
      const audioDuration = await getMediaDuration(audioFile);
      if (Math.abs(audioDuration - videoDuration) > 0.5) {
        throw new Error(`El audio "${audioFile.name}" no coincide con la duración del video`);
      }
    }
    
    
    // Verificar subtítulos
    for (const subFile of videoData.subtitleFiles) {
      const subDuration = await getSubtitleDuration(subFile);
      if (Math.abs(subDuration - videoDuration) > 0.5) {
        throw new Error(`Los subtítulos "${subFile.name}" no coinciden con la duración del video`);
      }
    }
    

  } catch (error) {
    alert(`Error: ${error.message}`);
    return;
  }

  // Limpiar URLs previas si se regenera la preview
  if (previewVideoSrc.value) URL.revokeObjectURL(previewVideoSrc.value);
  audioTracks.value.forEach(track => track.url && URL.revokeObjectURL(track.url));
  subtitles.value.forEach(sub => sub.url && URL.revokeObjectURL(sub.url));
  
  // Crear URLs para los archivos seleccionados
  previewVideoSrc.value = URL.createObjectURL(videoData.file);
  
  // Poblar pistas de audio
  audioTracks.value = [{ label: 'Audio original', url: null }];
  videoData.audioFiles.forEach(file => {
    audioTracks.value.push({
      label: `${file.name.replace(/\.[^/.]+$/, "")} (${formatFileSize(file.size)})`,
      url: URL.createObjectURL(file),
      rawName: file.name.replace(/\.[^/.]+$/, "") // Guardamos el nombre original sin tamaño
    });
  });

  // Poblar pistas de subtítulos
  subtitles.value = videoData.subtitleFiles.map(file => ({
    label: `${file.name.replace('.vtt', '').replace(/_/g, ' ')} (${formatFileSize(file.size)})`,
    url: URL.createObjectURL(file),
    lang: 'es',
    rawName: file.name.replace('.vtt', '').replace(/_/g, ' ') // Guardamos el nombre original sin tamaño
  }));

  showPreview.value = true;
  selectedAudioTrack.value = 0;
  
  await nextTick();
  initVideoPlayer();
};

/**
 * Inicializa el reproductor de Video.js con la configuración completa
 */
const initVideoPlayer = () => {
  if (!videoPlayer.value) return;
  if (playerInstance.value) {
    playerInstance.value.dispose();
  }
  
  playerInstance.value = videojs(videoPlayer.value, {
    controls: true,
    autoplay: false,
    preload: 'auto',
    responsive: true,
    fluid: true,
    playbackRates: [0.5, 1, 1.5, 2],
    sources: [{
      src: previewVideoSrc.value,
      type: videoData.file.type
    }],
    tracks: subtitles.value.map((sub, index) => ({
      kind: 'subtitles',
      src: sub.url,
      srclang: sub.lang,
      label: sub.rawName, // Usamos el nombre sin el tamaño para el reproductor
      default: index === 0
    }))
  }, () => {
    console.log('Reproductor listo!');
    const subsButton = playerInstance.value.controlBar.subsCapsButton;
    if (subsButton) {
        subsButton.controlText('Subtítulos');
    }
  });

  playerInstance.value.on('error', () => {
    console.error('Error del reproductor:', playerInstance.value.error());
  });
};

/**
 * Cambia la pista de audio activa
 */
const changeAudioTrack = () => {
  if (!playerInstance.value) return;
  
  const wasPlaying = !playerInstance.value.paused();
  const currentTime = playerInstance.value.currentTime();
  const playbackRate = playerInstance.value.playbackRate();
  
  if (selectedAudioTrack.value !== 0 && audioElement.value) {
    playerInstance.value.pause();
  }
  
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value = null;
  }
  
  removeSyncListeners();
  
  const trackIndex = selectedAudioTrack.value;
  
  if (trackIndex === 0) {
    playerInstance.value.volume(1);
    if (wasPlaying) {
      playerInstance.value.play().catch(e => console.error("Error al reanudar:", e));
    }
  } 
  else if (trackIndex > 0 && trackIndex < audioTracks.value.length) {
    const track = audioTracks.value[trackIndex];
    
    audioElement.value = new Audio(track.url);
    audioElement.value.currentTime = currentTime;
    audioElement.value.playbackRate = playbackRate;
    
    const onPlay = () => {
      if (audioElement.value.paused) {
        audioElement.value.currentTime = playerInstance.value.currentTime();
        audioElement.value.playbackRate = playerInstance.value.playbackRate();
        audioElement.value.play().catch(e => console.error("Error audio externo:", e));
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
        audioElement.value.play().catch(e => console.error("Error al iniciar audio externo:", e));
      });
    }
  }
};

/**
 * Formatea el tamaño del archivo para mostrarlo
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Maneja el envío final del formulario (simulado)
 */
const handleSubmit = async () => {

  let videoId = null;

  try {
    Swal.fire({
      title: "Subiendo...",
      text: "Por favor espera mientras se cargan los archivos",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // 1. Subir el video principal
    console.log("video data:", videoData);
    const formDataVideo = new FormData();
    formDataVideo.append("video", videoData.file);

    const video = await videoService.createVideo(formDataVideo);

    videoId = video.data.video_id;
    if (!videoId) {
      throw new Error("No se pudo obtener el ID del video subido");
    }

    // 2. Subir audios con su video_id
    for (const audio of videoData.audioFiles) {

      console.log("audio: ", audio)
      const formDataAudio = new FormData();
      formDataAudio.append("audio", audio);
      formDataAudio.append("idioma", audio.language);
      formDataAudio.append("video_id", String(videoId));

      await audioService.createAudio(formDataAudio);
    }

    // 3. Subir subtítulos con su video_id
    for (const subtitle of videoData.subtitleFiles) {

      console.log("subtitulo: ", subtitle)
      const formDataSubtitle = new FormData();
      formDataSubtitle.append("subtitulo", subtitle);
      formDataSubtitle.append("idioma", subtitle.language);
      formDataSubtitle.append("video_id", String(videoId));

      await subtituloService.createSubtitulo(formDataSubtitle);
    }

    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: "El video, audios y subtítulos fueron subidos correctamente 🎉"
    });
  } catch (error) {

    if(videoId) await videoService.deleteVideo(videoId);

    console.error("❌ Error al subir los archivos:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Hubo un problema al subir los archivos"
    });
  }
};

/**
 * Limpia recursos al desmontar el componente
 */
onBeforeUnmount(() => {
  if (playerInstance.value) {
    playerInstance.value.dispose();
  }
  if (previewVideoSrc.value) {
    URL.revokeObjectURL(previewVideoSrc.value);
  }
  audioTracks.value.forEach(track => {
    if (track.url) URL.revokeObjectURL(track.url);
  });
  subtitles.value.forEach(sub => {
    if (sub.url) URL.revokeObjectURL(sub.url);
  });
  removeSyncListeners();
});

/**
 * Elimina los event listeners de sincronización
 */
const removeSyncListeners = () => {
  if (!playerInstance.value) return;
  
  Object.keys(syncListeners.value).forEach(event => {
    if (syncListeners.value[event]) {
      playerInstance.value.off(event, syncListeners.value[event]);
      syncListeners.value[event] = null;
    }
  });
};
</script>

<style scoped>
.video-upload-container {
  max-width: 1210px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.upload-section,
.preview-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="file"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.file-info {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* Estilos para la lista de archivos con botón de eliminar */
.file-list {
  margin-top: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 5px;
  max-height: 150px;
  overflow-y: auto;
  background-color: #fff;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.file-item span {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-item:last-child {
  border-bottom: none;
}

.remove-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
}

.remove-btn:hover {
  background: #cc0000;
}

/* MODIFIED BUTTON STYLES */
.preview-btn {
  background-color: #007BFF;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 15px;
  transition: all 0.3s;
  width: 100%;
  max-width: 300px;
  align-self: center;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
.preview-btn:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.preview-btn:active {
  transform: translateY(0);
}
.preview-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
  transition: all 0.3s;
  align-self: center;
  width: 100%;
  max-width: 300px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
.submit-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.preview-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding: 10px;
  background: #e9e9e9;
  border-radius: 4px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-weight: bold;
}

.control-group select {
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* MODIFIED VIDEO WRAPPER STYLES */
.video-wrapper {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.video-js {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  background-color: #000;
  max-height: 80vh;
}

h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

@media (min-width: 768px) {
  .preview-btn,
  .submit-btn {
    width: auto;
    padding: 12px 30px;
  }
}

@media (min-width: 992px) {
  .video-upload-container {
    flex-direction: row;
    align-items: flex-start;
  }

  .upload-section {
    flex: 1;
    max-width: 400px;
  }
  
  .preview-section {
    flex: 2;
  }
  
  .video-wrapper {
    max-width: none;
  }
}
</style>