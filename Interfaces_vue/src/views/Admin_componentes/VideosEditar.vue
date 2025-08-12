<template>
  <div class="video-upload-container">
    <!-- Formulario de subida de video -->
    <div class="upload-section">
      <h2>Subir nuevo video EU</h2>
      <form @submit.prevent="handleSubmit" class="upload-form">
        <div class="form-group">
          <label for="video-name">Nombre del video:</label>
          <input id="video-name" v-model="videoData.name" type="text" required placeholder="Ej: Mi video increíble" />
        </div>

        <div class="form-group">
          <label for="video-file">Archivo de video (MP4):</label>
          <input id="video-file" type="file" accept=".mp4" required @change="handleVideoUpload" />
          <div v-if="videoData.file" class="file-info">
            Archivo seleccionado: {{ videoData.file.name }} ({{ formatFileSize(videoData.file.size) }})
          </div>
        </div>

        <div class="form-group">
          <label for="audio-file">Pistas de audio adicionales (opcional):</label>
          <!-- Cambiado a múltiple -->
          <input id="audio-file" type="file" accept="audio/*" multiple @change="handleAudioUpload" />
          <!-- Mostrar todos los audios -->
          <div v-for="(audio, index) in videoData.audioFiles" :key="index" class="file-info">
            Pista de audio: {{ audio.name }} ({{ formatFileSize(audio.size) }})
          </div>
        </div>

        <div class="form-group">
          <label for="subtitle-file">Archivos de subtítulos (VTT, opcional):</label>
          <!-- Cambiado a múltiple -->
          <input id="subtitle-file" type="file" accept=".vtt" multiple @change="handleSubtitleUpload" />
          <!-- Mostrar todos los subtítulos -->
          <div v-for="(subtitle, index) in videoData.subtitleFiles" :key="index" class="file-info">
            Subtítulos: {{ subtitle.name }} ({{ formatFileSize(subtitle.size) }})
          </div>
        </div>

        <button type="submit" class="submit-btn">Subir video</button>
      </form>
    </div>

    <!-- Previsualización del video con controles -->
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
        
        <div class="control-group">
          <label>Subtítulos:</label>
          <select v-model="selectedSubtitle" @change="changeSubtitle">
            <option value="-1">Desactivado</option>
            <option v-for="(subtitle, index) in subtitles" :key="index" :value="index">
              {{ subtitle.label }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="video-wrapper">
        <video ref="videoPlayer" class="video-js vjs-big-play-centered" controls preload="auto">
          <source :src="previewVideoSrc" type="video/mp4" />
          <!-- Eliminado el track estático -->
           <track 
            v-for="(subtitle, index) in subtitles" 
            :key="index"
            kind="subtitles"
            :src="subtitle.url"
            :srclang="subtitle.lang || 'es'"
            :label="subtitle.label"
            :default="selectedSubtitle === index"
          />
          <p class="vjs-no-js">
            Para ver este video, habilite JavaScript y considere actualizar a un navegador web que
            <a href="https://videojs.com/html5-video-support/" target="_blank">soporte video HTML5</a>
          </p>
        </video>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Datos del formulario
const videoData = reactive({
  name: '',
  file: null,
  audioFiles: [],
  subtitleFiles: []
});

// Referencias
const videoPlayer = ref(null);
const playerInstance = ref(null);
const audioElement = ref(null);
const previewVideoSrc = ref('');
const showPreview = ref(false);
const selectedAudioTrack = ref(0);
const selectedSubtitle = ref(-1);

// Listas de pistas
const audioTracks = ref([]);
const subtitles = ref([]);

// Event listeners para sincronización
const syncListeners = ref({
  play: null,
  pause: null,
  seeking: null,
  timeupdate: null
});

/**
 * Maneja la subida del archivo de video
 */
const handleVideoUpload = (event) => {
  const file = event.target.files[0];
  if (file && (file.type.includes('mp4') || file.name.toLowerCase().endsWith('.mp4'))) {
    if (previewVideoSrc.value) {
      URL.revokeObjectURL(previewVideoSrc.value);
    }
    
    videoData.file = file;
    previewVideoSrc.value = URL.createObjectURL(file);
    showPreview.value = true;
    
    // Resetear pistas
    audioTracks.value = [{ label: 'Audio original', enabled: true }];
    selectedAudioTrack.value = 0;
    subtitles.value = [];
    selectedSubtitle.value = -1;
    
    nextTick(() => {
      if (playerInstance.value) {
        playerInstance.value.src({ type: 'video/mp4', src: previewVideoSrc.value });
        playerInstance.value.load();
      } else {
        initVideoPlayer();
      }
    });
  } else {
    alert('Por favor, sube un archivo MP4 válido.');
  }
};

/**
 * Inicializa el reproductor de video
 */
const initVideoPlayer = () => {
  if (!videoPlayer.value) return;
  
  if (playerInstance.value) {
    playerInstance.value.dispose();
  }
  
  playerInstance.value = videojs(videoPlayer.value, {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    playbackRates: [0.5, 1, 1.5, 2],
    controlBar: {
      children: [
        'playToggle',
        'progressControl',
        'volumePanel',
        'currentTimeDisplay',
        'timeDivider',
        'durationDisplay',
        'playbackRateMenuButton',
        'subsCapsButton',
        'fullscreenToggle'
      ]
    }
  });
  
  playerInstance.value.on('error', (e) => {
    console.error('Error del reproductor:', playerInstance.value.error());
  });
};

/**
 * Maneja la subida de múltiples audios
 */
const handleAudioUpload = (event) => {
  const files = event.target.files;
  if (!files.length) return;
  
  Array.from(files).forEach(file => {
    if (file.type.includes('audio')) {
      videoData.audioFiles.push(file);
      const audioUrl = URL.createObjectURL(file);
      audioTracks.value.push({
        label: file.name,
        url: audioUrl,
        enabled: true
      });
    }
  });
};

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

/**
 * Cambia la pista de audio activa
 */
const changeAudioTrack = () => {
  if (!playerInstance.value) return;
  
  const wasPlaying = !playerInstance.value.paused();
  const currentTime = playerInstance.value.currentTime();
  playerInstance.value.pause();
  
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value = null;
  }
  
  removeSyncListeners();
  
  const trackIndex = selectedAudioTrack.value;
  
  if (trackIndex === 0) {
    playerInstance.value.volume(1);
  } 
  else if (trackIndex > 0 && trackIndex < audioTracks.value.length) {
    const track = audioTracks.value[trackIndex];
    
    audioElement.value = new Audio(track.url);
    audioElement.value.currentTime = currentTime;
    
    // Definir listeners
    const onPlay = () => audioElement.value.play();
    const onPause = () => audioElement.value.pause();
    const onSeeking = () => {
      audioElement.value.currentTime = playerInstance.value.currentTime();
    };
    const onTimeupdate = () => {
      const diff = Math.abs(audioElement.value.currentTime - playerInstance.value.currentTime());
      if (diff > 0.1) {
        audioElement.value.currentTime = playerInstance.value.currentTime();
      }
    };
    
    // Asignar listeners
    playerInstance.value.on('play', onPlay);
    playerInstance.value.on('pause', onPause);
    playerInstance.value.on('seeking', onSeeking);
    playerInstance.value.on('timeupdate', onTimeupdate);
    
    syncListeners.value = {
      play: onPlay,
      pause: onPause,
      seeking: onSeeking,
      timeupdate: onTimeupdate
    };
    
    playerInstance.value.volume(0);
  }
  
  if (wasPlaying) {
    setTimeout(() => playerInstance.value.play(), 100);
  }
};

/**
 * Cambia los subtítulos activos
 */
const changeSubtitle = () => {
  if (!playerInstance.value) return;
  
  const tracks = playerInstance.value.remoteTextTracks();
  for (let i = tracks.length - 1; i >= 0; i--) {
    playerInstance.value.removeRemoteTextTrack(tracks[i]);
  }
  
  if (selectedSubtitle.value >= 0 && selectedSubtitle.value < subtitles.value.length) {
    const subtitle = subtitles.value[selectedSubtitle.value];
    playerInstance.value.addRemoteTextTrack({
      kind: 'subtitles',
      src: subtitle.url,
      srclang: subtitle.lang || 'es',
      label: subtitle.label,
      default: true
    }, false);
  }
};

/**
 * Maneja la subida de múltiples subtítulos
 */
const handleSubtitleUpload = (event) => {
  const files = event.target.files;
  if (!files.length) return;
  
  Array.from(files).forEach(file => {
    if (file.name.toLowerCase().endsWith('.vtt')) {
      videoData.subtitleFiles.push(file);
      const subtitleUrl = URL.createObjectURL(file);
      subtitles.value.push({
        label: file.name.replace('.vtt', ''),
        url: subtitleUrl,
        lang: 'es'
      });
    }
  });
};

/**
 * Formatea el tamaño del archivo
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Maneja el envío del formulario
 */
const handleSubmit = () => {
  console.log('Datos del video a subir:', {
    name: videoData.name,
    video: videoData.file,
    audioFiles: videoData.audioFiles,
    subtitleFiles: videoData.subtitleFiles
  });

  alert('Video listo para ser subido. En una implementación real, se enviaría al servidor.');
};

onMounted(() => {
  if (previewVideoSrc.value) {
    initVideoPlayer();
  }
});

onBeforeUnmount(() => {
  if (previewVideoSrc.value) {
    URL.revokeObjectURL(previewVideoSrc.value);
  }
  
  if (audioElement.value) {
    audioElement.value.pause();
    audioElement.value = null;
  }
  
  audioTracks.value.forEach(track => {
    if (track.url) URL.revokeObjectURL(track.url);
  });
  
  subtitles.value.forEach(sub => {
    if (sub.url) URL.revokeObjectURL(sub.url);
  });
  
  removeSyncListeners();
  
  if (playerInstance.value) {
    playerInstance.value.dispose();
  }
});
</script>

<style>
.video-upload-container {
  max-width: 1200px;
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

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #45a049;
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
  display: flex;
  align-items: center;
  gap: 5px;
}

.control-group select {
  padding: 5px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.video-wrapper {
  width: 100%;
  height: 400px;
}

.video-js {
  width: 100%;
  height: 100%;
  background-color: #000;
}

h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

@media (min-width: 768px) {
  .video-upload-container {
    flex-direction: row;
  }

  .upload-section,
  .preview-section {
    flex: 1;
  }
  
  .preview-section {
    max-width: 800px;
  }
}

@media (max-width: 767px) {
  .preview-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .video-wrapper {
    height: 300px;
  }
}
</style>