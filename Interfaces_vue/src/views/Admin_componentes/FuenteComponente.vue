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
        <button @click="handleSaveOrEdit" class="save-btn">
          {{ saveMode === 'guardar' ? 'Guardar Configuración' : 'Editar Configuración' }}
        </button>
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
          :key="config.font_id || index"
          class="config-item"
          :class="{ active: activeConfig === (config.font_id || index) }"
        >
          <div class="config-preview">
            <p class="preview-title" :style="{ fontSize: config.title + 'px', fontFamily: config.fontFamily?.name_principal || 'Arial' }">Título {{ config.title }}</p>
            <p class="preview-subtitle" :style="{ fontSize: config.sub_title + 'px', fontFamily: config.fontFamily?.name_secundary || 'Times New Roman' }">Subtítulo {{ config.sub_title }}</p>
            <p class="preview-text" :style="{ fontSize: config.paragraph + 'px' }">Texto normal {{ config.paragraph }}</p>
          </div>
          <div class="config-meta">
            <span v-if="config.fontFamily?.name_principal">Principal: {{ config.fontFamily.name_principal }}</span>
            <span v-if="config.fontFamily?.name_secundary">Secundaria: {{ config.fontFamily.name_secundary }}</span>
          </div>
            <button class="aplicar_btn" @click="applyFontStyle(config)">Aplicar</button>
            <button class="editar_btn" @click="handleEdit(config)">Editar</button>
            <button @click="handleDeleteFont(config.font_id)" class="delete-btn">Eliminar</button>
        </div>
      </div>
    </div>
    
    <!-- Columna 3: Vista previa en tiempo real -->
    <div class="preview-column">
    <h2>👁️ Vista Previa</h2>
    <div class="preview-content">
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
import { ref, onMounted } from 'vue';
import { apiService } from '@/services/project_1/apiService';
import { useStyleStore } from '@/stores/Styles';
import Swal from 'sweetalert2';

const styleStore = useStyleStore();

// Modo de guardado o edición
const saveMode = ref('guardar');

const titleSize = ref(36);
const subtitleSize = ref(24);
const textSize = ref(16);
const primaryFontName = ref('');
const secondaryFontName = ref('');
const primaryFontFile = ref(null);
const secondaryFontFile = ref(null);
const fontError = ref({ primary: '', secondary: '' });

// Función para cargar configuración desde localStorage o usar valores por defecto
const loadFontConfigFromLocalStorage = () => {
  const config = localStorage.getItem('activeFont');
  if (config) {
    
      const parsed = JSON.parse(config);
      console.log('Cargando configuración de fuentes desde localStorage:', parsed);
      titleSize.value = parsed.title ?? 36;
      subtitleSize.value = parsed.sub_title ?? 24;
      textSize.value = parsed.paragraph ?? 16;
      primaryFontName.value = parsed.fontFamily?.name_principal ?? '';
      secondaryFontName.value = parsed.fontFamily?.name_secundary ?? '';

  } else {
    // No hay nada en localStorage, usar valores por defecto
    titleSize.value = 36;
    subtitleSize.value = 24;
    textSize.value = 16;
    primaryFontName.value = '';
    secondaryFontName.value = '';
  }
};


// Llamar la función al cargar el componente
loadFontConfigFromLocalStorage();

// Configuraciones guardadas
const savedConfigs = ref([]);
const activeConfig = ref(null);
const fontCounter = ref(1)
const editingItem = ref(null)


const defaultFontStyle = {
  title: 36,
  sub_title: 24,
  paragraph: 16,
  fontFamily: {
    name_principal: 'Arial',
    url_principal: '',
    name_secundary: 'Times New Roman',
    url_secundary: ''
  }
}

// Cargar fuentes al iniciar
const fetchSavedFont = async () => {
  savedConfigs.value = await apiService.getFontStyles();
  fontCounter.value = savedConfigs.value.length + 1;
}

// Guardar o Editar
const handleSaveOrEdit = () => {
  if (saveMode.value === 'guardar') {
    saveCurrentFont();
  } else {
    if (editingItem.value) {
      handleSaveEdit(editingItem.value);
    } else {
      Swal.fire('Error', 'No hay configuración seleccionada para editar', 'error');
    }
  }
}

// Helper para convertir archivo a base64
const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}


const applyFontStyle = (font) => {
  // Aplicar tamaños
  titleSize.value = font.title;
  subtitleSize.value = font.sub_title;
  textSize.value = font.paragraph;

  // Aplicar fuentes
  if (font.fontFamily) {
    primaryFontName.value = font.fontFamily.name_principal;
    secondaryFontName.value = font.fontFamily.name_secundary;
    // Si hay base64, crear @font-face dinámico
    if (font.fontFamily.url_principal) {
      const fontFace = `@font-face { font-family: '${font.fontFamily.name_principal}'; src: url('${font.fontFamily.url_principal}') format('truetype'); }`;
      addFontStyle(fontFace);
    }
    if (font.fontFamily.url_secundary) {
      const fontFace = `@font-face { font-family: '${font.fontFamily.name_secundary}'; src: url('${font.fontFamily.url_secundary}') format('truetype'); }`;
      addFontStyle(fontFace);
    }
    styleStore.applyFont(font);
  }
  
  Swal.fire({
    title: "¡Configuración aplicada!",
    icon: "success",
    timer: 1200,
    showConfirmButton: false
  });
}

 

const handleSaveEdit = async (item) => {

  console.log('Guardando edición de fuente:', item);
  console.log('primaryFontFile:', primaryFontFile.value);
  console.log('secondaryFontFile:', secondaryFontFile.value);
  // Convertir archivo a base64 si existe
  let fontBase64 = '';
  let secondaryFontBase64 = '';
  if (primaryFontFile.value) {
    console.log('Convirtiendo archivo principal a base64');
    fontBase64 = await fileToBase64(primaryFontFile.value);
  } else {
    fontBase64 = item.fontFamily.url_principal || '';
  }
  if (secondaryFontFile.value) {
    console.log('Convirtiendo archivo secundario a base64');
    secondaryFontBase64 = await fileToBase64(secondaryFontFile.value);
  } else {
    secondaryFontBase64 = item.fontFamily.url_secundary || '';
  }

  const fontStyles = {
    title: parseInt(titleSize.value),
    sub_title: parseInt(subtitleSize.value),
    paragraph: parseInt(textSize.value),
  };

  const fontFamily = {};

  if (primaryFontName.value) fontFamily.name_principal = primaryFontName.value;
  if (fontBase64) fontFamily.url_principal = fontBase64;
  if (secondaryFontName.value) fontFamily.name_secundary = secondaryFontName.value;
  if (secondaryFontBase64) fontFamily.url_secundary = secondaryFontBase64;

  await apiService.updateFont(item.font_id, fontStyles);
  await apiService.updateFontFamily(item.fontFamily_id, fontFamily);
  saveMode.value = 'guardar';
  editingItem.value = null;
  Swal.fire('Editado', 'La configuración fue actualizada.', 'success');
  await fetchSavedFont();
}

// Editar paleta
const handleEdit = (item) => {
  console.log('Editando fuente:', item);
  editingItem.value = item;
  saveMode.value = 'editar';
  titleSize.value = item.title;
  subtitleSize.value = item.sub_title;
  textSize.value = item.paragraph;
  primaryFontName.value = item.fontFamily?.name_principal || '';
  secondaryFontName.value = item.fontFamily?.name_secundary || '';
  primaryFontFile.value = null;
  secondaryFontFile.value = null;
}

// Guardar nueva paleta
const saveCurrentFont = async () => {
  // Verificar que el archivo principal existe
  if (!primaryFontFile.value && !primaryFontName.value) {
    Swal.fire({
      title: 'Error',
      text: 'Debes seleccionar al menos la fuente principal',
      icon: 'error'
    });
    return;
  }
  try {
    // Convertir archivos a base64 (con verificación de tipo)
    const principalBase64 = await fileToBase64(primaryFontFile.value);
    
    const secondaryBase64 = await fileToBase64(secondaryFontFile.value);
    
    const fontConfig = {
      title: titleSize.value,
      sub_title: subtitleSize.value,
      paragraph: textSize.value,
      fontFamily: {
        name_principal: primaryFontName.value,
        url_principal: principalBase64,
        name_secundary: secondaryFontName.value,
        url_secundary: secondaryBase64
      }
    };
    await apiService.createFontStyles(fontConfig);
    Swal.fire({
      title: '¡Configuración guardada!',
      icon: 'success',
      timer: 1200,
      showConfirmButton: false
    });
    await fetchSavedFont();
  } catch (error) {
    console.error('Error al guardar las fuentes:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudo guardar la configuración',
      icon: 'error'
    });
  }
}


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
    primaryFontFile.value = file;
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
    secondaryFontFile.value = file;
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
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
};


// Eliminar configuración
const handleDeleteFont = async (id) => {
  Swal.fire({
    title: "¿Estás seguro de eliminar esta fuente?",
    text: "¡No podrás revertir esto!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "No, cancelar",
    reverseButtons: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await apiService.deleteFonts(id);
        fontCounter.value--;
        await fetchSavedFont();
        Swal.fire({
          title: "¡Eliminado!",
          text: "La fuente ha sido eliminada.",
          icon: "success"
        });
      } catch (error) {
        console.error("Error al eliminar:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar la fuente.",
          icon: "error"
        });
      }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      Swal.fire({
        title: "Cancelado",
        text: "Tu fuente está a salvo :)",
        icon: "error"
      });
    }
  });
}

// Resetear todo
const resetAll = () => {

  titleSize.value = defaultFontStyle.title;
  subtitleSize.value = defaultFontStyle.sub_title;
  textSize.value = defaultFontStyle.paragraph;
  primaryFontName.value = defaultFontStyle.fontFamily.name_principal;
  secondaryFontName.value = defaultFontStyle.fontFamily.name_secundary;
  primaryFontFile.value = null;
  secondaryFontFile.value = null;
  fontError.value = { primary: '', secondary: '' };

  const font = {
    title: defaultFontStyle.title,
    sub_title: defaultFontStyle.sub_title,
    paragraph: defaultFontStyle.paragraph,
    fontFamily: {
      name_principal: defaultFontStyle.fontFamily.name_principal,
      url_principal: '',
      name_secundary: defaultFontStyle.fontFamily.name_secundary,
      url_secundary: ''
    }
  }

  Swal.fire('¡Estilos restablecidos!', '', 'success');
  applyFontStyle(font);

};


onMounted(() => {
  fetchSavedFont();
});

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