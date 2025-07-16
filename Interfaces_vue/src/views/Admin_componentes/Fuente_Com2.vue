<template>
<div class="font-section">
    <div class="control-panel font-panel">
      <div class="control-group">
        <h2>🔤 Configuración de Fuentes</h2>
      </div>

      <!-- Controles de tamaño de fuente -->
      <div class="control-group">
        <label for="titleFontSize">Tamaño Título:</label>
        <input type="range" id="titleFontSize" name="titleFontSize" 
            v-model="titleFontSize" min="12" max="72">
        <span>{{ titleFontSize }}px</span>
      </div>

      <div class="control-group">
        <label for="subtitleFontSize">Tamaño Subtítulo:</label>
        <input type="range" id="subtitleFontSize" name="subtitleFontSize" 
            v-model="subtitleFontSize" min="10" max="48">
        <span>{{ subtitleFontSize }}px</span>
      </div>

      <div class="control-group">
        <label for="textFontSize">Tamaño Texto:</label>
        <input type="range" id="textFontSize" name="textFontSize" 
            v-model="textFontSize" min="8" max="24">
        <span>{{ textFontSize }}px</span>
      </div>

      <!-- Sección de subida de fuentes TTF -->
      <div class="font-upload-container">
        <div class="upload-section">
          <h4>Fuente Principal</h4>
          <input ref="principalFontInput" type="file" accept=".ttf" 
              @change="onPrincipalFontSelected" hidden>
          <button class="upload-btn" @click="$refs.principalFontInput.click()">
            Seleccionar Fuente (.TTF)
          </button>
          <span v-if="principalFontName" class="font-name">{{ principalFontName }}</span>
        </div>

        <div class="upload-section">
          <h4>Fuente Secundaria</h4>
          <input ref="secondaryFontInput" type="file" accept=".ttf" 
              @change="onSecondaryFontSelected" hidden>
          <button class="upload-btn" @click="$refs.secondaryFontInput.click()">
            Seleccionar Fuente (.TTF)
          </button>
          <span v-if="secondaryFontName" class="font-name">{{ secondaryFontName }}</span>
        </div>
      </div>

      <!-- Botones de acción unificados -->
      <div class="save-section">
        <button id="saveBtn" @click="saveMode === 'guardar' ? saveFullFontConfig() : handleSaveEdit(editingItem)">
          {{ saveMode === 'guardar' ? 'Guardar Configuración' : 'Editar Configuración' }}
        </button>
        <button class="saveBtn" @click="resetFontStyles">Restablecer todo</button>
      </div>
    </div>

    <!-- Lista de configuraciones guardadas -->
    <div class="saved-styles">
      <h3>Configuraciones guardadas</h3>
      <div id="savedFontsList" class="custom-scrollbar">
        <div class="saved-style-item" v-for="font in savedStylesFont" :key="font.font_id">
          <div class="font-preview">
            <p>Título: {{ font.title }}px</p>
            <p>Subtítulo: {{ font.sub_title }}px</p>
            <p>Texto: {{ font.paragraph }}px</p>
            <p v-if="font.fontFamily">Fuente: {{ font.fontFamily.name_principal }}</p>
            <p v-if="font.fontFamily">Fuente: {{ font.fontFamily.name_secundary }}</p>
          </div>
          <div class="style-actions">
            <button @click="applyFullFontStyle(font)">Aplicar</button>
            <button @click="handleEdit(font, 'font')">Editar</button>
            <button @click="handleDeleteFontStyle(font.font_id)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Estado reactivo
const titleFontSize = ref(24);
const subtitleFontSize = ref(18);
const textFontSize = ref(14);
const principalFontName = ref('');
const secondaryFontName = ref('');
const saveMode = ref('guardar');
const editingItem = ref(null);
const savedStylesFont = ref([]);

// Referencias a inputs de archivo
const principalFontInput = ref(null);
const secondaryFontInput = ref(null);

// Métodos
const onPrincipalFontSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    principalFontName.value = file.name;
    // Aquí puedes añadir lógica para procesar la fuente
  }
};

const onSecondaryFontSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    secondaryFontName.value = file.name;
    // Aquí puedes añadir lógica para procesar la fuente
  }
};

const saveFullFontConfig = () => {
  // Lógica para guardar la configuración
  const newConfig = {
    font_id: Date.now(),
    title: titleFontSize.value,
    sub_title: subtitleFontSize.value,
    paragraph: textFontSize.value,
    fontFamily: {
      name_principal: principalFontName.value,
      name_secundary: secondaryFontName.value
    }
  };
  savedStylesFont.value.push(newConfig);
  saveMode.value = 'editar';
};

const resetFontStyles = () => {
  titleFontSize.value = 24;
  subtitleFontSize.value = 18;
  textFontSize.value = 14;
  principalFontName.value = '';
  secondaryFontName.value = '';
};

const applyFullFontStyle = (font) => {
  titleFontSize.value = font.title;
  subtitleFontSize.value = font.sub_title;
  textFontSize.value = font.paragraph;
  if (font.fontFamily) {
    principalFontName.value = font.fontFamily.name_principal;
    secondaryFontName.value = font.fontFamily.name_secundary;
  }
};

const handleEdit = (font) => {
  editingItem.value = font;
  saveMode.value = 'editar';
  applyFullFontStyle(font);
};

const handleDeleteFontStyle = (fontId) => {
  savedStylesFont.value = savedStylesFont.value.filter(font => font.font_id !== fontId);
};

const handleSaveEdit = (item) => {
  // Lógica para guardar edición
  const index = savedStylesFont.value.findIndex(f => f.font_id === item.font_id);
  if (index !== -1) {
    savedStylesFont.value[index] = {
      ...item,
      title: titleFontSize.value,
      sub_title: subtitleFontSize.value,
      paragraph: textFontSize.value,
      fontFamily: {
        name_principal: principalFontName.value,
        name_secundary: secondaryFontName.value
      }
    };
  }
  saveMode.value = 'guardar';
  editingItem.value = null;
};
</script>

<style scoped>
@import url('../Admin.css');
</style>