<template>
<div class="typography-editor">
    <!-- Columna 1: Editor de fuentes -->
    <div class="editor-column">
      <h2>🔤 Editor de Tipografía</h2>
      
      <div class="control-group">
        <label>Tamaño del Título: {{ titleSize }}px</label>
        <input type="range" v-model="titleSize" min="12" max="72" class="slider">
      </div>
      
      <div class="control-group">
        <label>Tamaño del Subtítulo: {{ subtitleSize }}px</label>
        <input type="range" v-model="subtitleSize" min="10" max="48" class="slider">
      </div>
      
      <div class="control-group">
        <label>Tamaño del Texto: {{ textSize }}px</label>
        <input type="range" v-model="textSize" min="8" max="24" class="slider">
      </div>
      
      <div class="font-upload">
    <h3>Subir Fuentes TTF</h3>
    <div class="upload-group">
      <label style="color: black;">Fuente Principal:</label>
      <input type="file" ref="primaryFontInput" @change="handleFontUpload('primary', $event)" accept=".ttf" hidden>
      <button @click="$refs.primaryFontInput.click()" class="upload-btn">
        <span style="color: black;">{{ primaryFontName || 'Seleccionar archivo .ttf' }}</span>
      </button>
      <small v-if="fontError.primary" class="error">{{ fontError.primary }}</small>
    </div>
    
    <div class="upload-group">
      <label style="color: black;">Fuente Secundaria:</label>
      <input type="file" ref="secondaryFontInput" @change="handleFontUpload('secondary', $event)" accept=".ttf" hidden>
      <button @click="$refs.secondaryFontInput.click()" class="upload-btn">
        <span style="color: black;">{{ secondaryFontName || 'Seleccionar archivo .ttf' }}</span>
      </button>
      <small v-if="fontError.secondary" class="error">{{ fontError.secondary }}</small>
    </div>
  </div>
      
      <div class="action-buttons">
        <button @click="saveConfiguration" class="save-btn">Guardar Configuración</button>
        <button @click="resetAll" class="reset-btn">Restablecer Valores</button>
      </div>
    </div>
    
    <!-- Columna 2: Configuraciones guardadas -->
    <div class="saved-column">
      <h2>💾 Configuraciones Guardadas</h2>
      
      <div v-if="savedConfigs.length === 0" class="empty-state">
        <p>No hay configuraciones guardadas</p>
      </div>
      
      <div v-else class="config-list">
        <div 
          v-for="(config, index) in savedConfigs" 
          :key="index"
          class="config-item"
          :class="{ active: activeConfig === index }"
          @click="loadConfiguration(index)"
        >
          <div class="config-preview">
            <p class="preview-title" :style="{ fontSize: config.titleSize + 'px' }">Título</p>
            <p class="preview-subtitle" :style="{ fontSize: config.subtitleSize + 'px' }">Subtítulo</p>
            <p class="preview-text" :style="{ fontSize: config.textSize + 'px' }">Texto normal</p>
          </div>
          <div class="config-meta">
            <span v-if="config.primaryFont">Principal: {{ config.primaryFont.name }}</span>
            <span v-if="config.secondaryFont">Secundaria: {{ config.secondaryFont.name }}</span>
          </div>
            <button class="aplicar_btn">Aplicar</button>
            <button class="editar_btn">Editar</button>
            <button @click.stop="deleteConfiguration(index)" class="delete-btn">Eliminar</button>
        </div>
      </div>
    </div>
    
    <!-- Columna 3: Vista previa en tiempo real -->
    <div class="preview-column">
    <h2>👁️ Vista Previa</h2>
    <div class="preview-content" :style="previewStyles">
      <h1 :style="{ fontSize: titleSize + 'px', fontFamily: primaryFontName }">Título de Ejemplo</h1>
      <h2 :style="{ fontSize: subtitleSize + 'px', fontFamily: secondaryFontName || 'inherit' }">
        Este es un subtítulo
      </h2>
      <p :style="{ fontSize: textSize + 'px' }">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
      
      <div class="font-display" v-if="primaryFontName || secondaryFontName">
        <h3>Fuentes cargadas:</h3>
        <p v-if="primaryFontName" style="color: black;">🔤 Primaria: {{ primaryFontName }}</p>
        <p v-if="secondaryFontName" style="color: black;">🔤 Secundaria: {{ secondaryFontName }}</p>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Configuración actual
const titleSize = ref(24);
const subtitleSize = ref(18);
const textSize = ref(14);
const primaryFontName = ref('');
const secondaryFontName = ref('');
const primaryFontFile = ref(null);
const secondaryFontFile = ref(null);
const fontError = ref({ primary: '', secondary: '' });

// Configuraciones guardadas
const savedConfigs = ref([]);
const activeConfig = ref(null);

// Computed para estilos de fuente
// Computed para estilos de vista previa (actualizado)
const previewStyles = computed(() => {
  const styles = {};
  
  // Cargar fuentes dinámicamente
  if (primaryFontUrl.value) {
    styles['--primary-font'] = `url('${primaryFontUrl.value}')`;
  }
  if (secondaryFontUrl.value) {
    styles['--secondary-font'] = `url('${secondaryFontUrl.value}')`;
  }
  
  return styles;
});

// Manejar subida de fuentes (actualizado)
const primaryFontUrl = ref('');
const secondaryFontUrl = ref('');

const handleFontUpload = (type, event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validaciones (se mantienen igual)
  if (!file.name.endsWith('.ttf')) {
    fontError.value[type] = 'Solo se permiten archivos .ttf';
    return;
  }
  
  // Limpiar errores
  fontError.value[type] = '';
  
  // Crear URL para la fuente
  const fontUrl = URL.createObjectURL(file);
  
  if (type === 'primary') {
    primaryFontName.value = file.name.replace('.ttf', '');
    primaryFontUrl.value = fontUrl;
    
    // Crear regla @font-face dinámica
    const fontFace = `
      @font-face {
        font-family: '${primaryFontName.value}';
        src: url('${fontUrl}') format('truetype');
      }
    `;
    addFontStyle(fontFace);
  } else {
    secondaryFontName.value = file.name.replace('.ttf', '');
    secondaryFontUrl.value = fontUrl;
    
    const fontFace = `
      @font-face {
        font-family: '${secondaryFontName.value}';
        src: url('${fontUrl}') format('truetype');
      }
    `;
    addFontStyle(fontFace);
  }
};

// Función para añadir fuentes dinámicamente
const addFontStyle = (css) => {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = css;
  document.head.appendChild(style);
};

// Guardar configuración
const saveConfiguration = () => {
  const newConfig = {
    titleSize: titleSize.value,
    subtitleSize: subtitleSize.value,
    textSize: textSize.value,
    primaryFont: primaryFontName.value ? { 
      name: primaryFontName.value,
      file: primaryFontFile.value 
    } : null,
    secondaryFont: secondaryFontName.value ? { 
      name: secondaryFontName.value,
      file: secondaryFontFile.value 
    } : null,
    createdAt: new Date().toISOString()
  };
  
  savedConfigs.value.push(newConfig);
  activeConfig.value = savedConfigs.value.length - 1;
};

// Cargar configuración
const loadConfiguration = (index) => {
  const config = savedConfigs.value[index];
  titleSize.value = config.titleSize;
  subtitleSize.value = config.subtitleSize;
  textSize.value = config.textSize;
  primaryFontName.value = config.primaryFont?.name || '';
  secondaryFontName.value = config.secondaryFont?.name || '';
  primaryFontFile.value = config.primaryFont?.file || null;
  secondaryFontFile.value = config.secondaryFont?.file || null;
  activeConfig.value = index;
};

// Eliminar configuración
const deleteConfiguration = (index) => {
  savedConfigs.value.splice(index, 1);
  if (activeConfig.value === index) {
    activeConfig.value = null;
  }
};

// Resetear todo
const resetAll = () => {
  titleSize.value = 24;
  subtitleSize.value = 18;
  textSize.value = 14;
  primaryFontName.value = '';
  secondaryFontName.value = '';
  primaryFontFile.value = null;
  secondaryFontFile.value = null;
  fontError.value = { primary: '', secondary: '' };
};
</script>

<style scoped>
.typography-editor {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  padding: 20px;
  height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

.editor-column, .saved-column, .preview-column {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  overflow-y: auto;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.control-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #ddd;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
}

.font-upload {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.upload-group {
  margin-bottom: 15px;
}

.upload-btn {
  display: block;
  width: 100%;
  padding: 10px;
  background: #ecf0f1;
  border: 1px dashed #bdc3c7;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  margin-top: 5px;
  transition: all 0.3s;
}

.upload-btn:hover {
  background: #dfe6e9;
}

.error {
  color: #e74c3c;
  font-size: 0.8em;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.save-btn {
  background: #2ecc71;
  color: white;
}

.save-btn:hover {
  background: #27ae60;
}

.reset-btn {
  background: #e74c3c;
  color: white;
}

.reset-btn:hover {
  background: #c0392b;
}

/* Columna de configuraciones guardadas */
.config-list {
  margin-top: 20px;
}

.config-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.config-item:hover {
  border-color: #3498db;
}

.config-item.active {
  border-color: #3498db;
  background: #f0f8ff;
}

.config-preview {
  margin-bottom: 10px;
}

.preview-title {
  font-weight: bold;
  margin: 5px 0;
}

.preview-subtitle {
  font-weight: 600;
  margin: 5px 0;
}

.preview-text {
  margin: 5px 0;
}

.config-meta {
  font-size: 0.9em;
  color: #7f8c8d;
  margin: 10px 0;
}

.config-meta span {
  display: block;
}

.aplicar_btn{
  background: #2ecc71;
  color: white;
  font-size: 0.8em;
  padding: 5px 10px;
  margin: 0px 5px;
}

.aplicar_btn:hover{
  background: #27ae60;
}

.editar_btn {
  background: #6e7b72;
  color: white;
  font-size: 0.8em;
  padding: 5px 10px;
  margin: 0px 5px;
}

.editar_btn:hover{
  background: #525a55;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  font-size: 0.8em;
  padding: 5px 10px;
  margin: 0px 5px;
}

.delete-btn:hover {
  background: #c0392b;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #7f8c8d;
}

/* Columna de vista previa */
.preview-content {
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin-top: 20px;
}

.preview-content h1 {
  margin-top: 0;
  font-family: var(--primary-font, inherit);
}

.preview-content h2 {
  font-family: var(--secondary-font, inherit);
  border-bottom: none;
  padding-bottom: 0;
}

.font-display {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* Responsive */
@media (max-width: 1200px) {
  .typography-editor {
    grid-template-columns: 1fr;
    height: auto;
  }
}
</style>