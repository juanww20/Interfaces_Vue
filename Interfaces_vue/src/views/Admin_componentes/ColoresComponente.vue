<template>
    <div class="row color-section">
        <div class="control-panel">
            <div class="control-group">
            <h2>🎨 Colores</h2>
            </div>

            <div class="control-group">
            <label for="primary_color">Color Primario:</label>
            <input type="color" id="primary_color" v-model="headerBgColor" />
            <span class="color-hex">{{ headerBgColor }}</span>
            </div>

            <div class="control-group">
            <label for="secondary_color">Color Secundario:</label>
            <input type="color" id="secondary_color" v-model="titleColor" />
            <span class="color-hex">{{ titleColor }}</span>
            </div>

            <div class="control-group">
            <label for="tertiary_color">Color Terciario:</label>
            <input type="color" id="tertiary_color" v-model="divBorderColor" />
            <span class="color-hex">{{ divBorderColor }}</span>
            </div>

            <div class="control-group">
            <label for="light_color">Color Neutro 1:</label>
            <input type="color" id="light_color" v-model="cardBgColor" />
            <span class="color-hex">{{ cardBgColor }}</span>
            </div>

            <div class="control-group">
            <label for="dark_color">Color Neutro 2:</label>
            <input type="color" id="dark_color" v-model="footerBgColor" />
            <span class="color-hex">{{ footerBgColor }}</span>
            </div>

            <div class="save-section">
            <button id="saveBtn" @click="handleSaveOrEdit">
                {{ saveMode === 'guardar' ? 'Guardar' : 'Editar' }}
            </button>
            <button class="saveBtn" @click="resetStyles">Restablecer paleta</button>
        </div>
    </div>
    
    <div>
    <h1>Hola Mundo</h1>
  </div>

  <div class="playground">
    <header :style="{ backgroundColor: headerBgColor }" id="playground-header">
      <h1 :style="{ color: titleColor, fontSize: titleFontSize + 'px' }" id="mainTitle">Título</h1>
    </header>

    <div :style="{ borderColor: divBorderColor }" class="div-with-border">
      Hola Mundo
    </div>

    <div class="card" :style="{ backgroundColor: cardBgColor }">
      <h2>Título de Carta</h2>
      <p class="content">Hola, aquí donde hace las pruebas para cambio de letras.</p>
    </div>

    <footer id="playground-footer" :style="{ backgroundColor: footerBgColor }">
      <p>Footer © MJS</p>
    </footer>
  </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

// Datos reactivos
const headerBgColor = ref('#3498db');
const titleColor = ref('#ffffff');
const divBorderColor = ref('#95a5a6');
const cardBgColor = ref('#2c3e50');
const footerBgColor = ref('#ecf0f1');
const titleFontSize = ref(24);
const saveMode = ref('guardar');

// Métodos
const handleSaveOrEdit = () => {
  saveMode.value = saveMode.value === 'guardar' ? 'editar' : 'guardar';
  // Aquí podrías añadir lógica para guardar los estilos
};

const resetStyles = () => {
  headerBgColor.value = '#ffffff';
  titleColor.value = '#000000';
  divBorderColor.value = '#cccccc';
  cardBgColor.value = '#f5f5f5';
  footerBgColor.value = '#333333';
  titleFontSize.value = 24;
};
</script>

<style scoped>
@import url('../Admin.css');

.columna_de_3 {
  display: flex;
  width: 100%;
  gap: 20px;
  align-items: center;
  justify-content: center;
}
</style>