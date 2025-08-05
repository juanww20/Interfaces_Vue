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
    <div class="row">
            <fieldset class="control-panel">
                <div class="saved-styles">
                    <h3>Estilos guardados</h3>
                    <div id="savedStylesList" class="custom-scrollbar" >
                        <div v-for="palette in savedStylesColor" :key="palette.id" class="saved-style-item">
                          <span>{{ palette.name }}</span>
                          <div class="color-preview">
                            <div v-for="(color, idx) in [palette.colors.color_one, palette.colors.color_two, palette.colors.color_three, palette.colors.color_four, palette.colors.color_five]" 
                                :key="idx" class="color-box" 
                                :style="{ backgroundColor: color }">
                            </div>
                          </div>
                          <div class="style-actions">
                            <button @click="applyColorPalette(palette)">✅ Aplicar</button>
                            <button @click="handleEdit(palette)">✏️ Editar</button>
                            <button @click="handleDeletePalette(palette.colors.colors_id)">🗑️ Eliminar</button>
                          </div>
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
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
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { apiService } from '@/services/project_1/apiService'
import { useStyleStore } from '@/stores/Styles'

const styleStore = useStyleStore()

function handleApplyPalette(palette) {
  styleStore.applyPalette(palette)
}

// Colores reactivos

let headerBgColor = ref('')
let titleColor = ref('')
let divBorderColor = ref('')
let cardBgColor = ref('')
let footerBgColor = ref('')
const titleFontSize = ref(32)

function colorsReactive() {
  
  const saved = localStorage.getItem('activePalette')

  if(saved){
    const palette = JSON.parse(saved)
    headerBgColor.value = palette.colors.color_one
    titleColor.value = palette.colors.color_two
    divBorderColor.value = palette.colors.color_three
    cardBgColor.value = palette.colors.color_four
    footerBgColor.value = palette.colors.color_five
  } else {
    headerBgColor.value = '#092db0'
    titleColor.value = '#4B97F5'
    divBorderColor.value = '#AED6F5'
    cardBgColor.value = '#0D0D2E'
    footerBgColor.value = '#FFFFFF'
  }
}

colorsReactive();

const saveMode = ref('guardar')
const editingItem = ref(null)
const savedStylesColor = ref([])
const styleCounter = ref(1)

// Estilos por defecto
const defaultStyles = {
  color_one: '#092db0',
  color_two: '#4B97F5',
  color_three: '#AED6F5',
  color_four: '#0D0D2E',
  color_five: '#FFFFFF',
}

// Cargar paletas al iniciar
const fetchSavedStyles = async () => {
  savedStylesColor.value = await apiService.getStyles()
  styleCounter.value = savedStylesColor.value.length + 1
}

// Guardar o Editar
const handleSaveOrEdit = () => {
  if (saveMode.value === 'guardar') {
    saveCurrentStyle()
  } else {
    if (editingItem.value) {
      handleSaveEdit(editingItem.value)
    } else {
      Swal.fire('Error', 'No hay paleta seleccionada para editar', 'error')
    }
  }
}

// Guardar nueva paleta
const saveCurrentStyle = async () => {
  const newStyle = {
    name: `Paleta: ${styleCounter.value}`,
    colors: {
      color_one: headerBgColor.value,
      color_two: titleColor.value,
      color_three: divBorderColor.value,
      color_four: cardBgColor.value,
      color_five: footerBgColor.value
    }
  }

  await apiService.createStyles(newStyle)
  Swal.fire('¡Guardado!', 'La paleta ha sido guardada.', 'success')
  await fetchSavedStyles()
}

// Editar paleta
const handleEdit = (item) => {
  editingItem.value = item
  saveMode.value = 'editar'
  headerBgColor.value = item.colors.color_one
  titleColor.value = item.colors.color_two
  divBorderColor.value = item.colors.color_three
  cardBgColor.value = item.colors.color_four
  footerBgColor.value = item.colors.color_five
}

const handleSaveEdit = async (item) => {
  await apiService.updateColor(item.colors.colors_id, {
    color_one: headerBgColor.value,
    color_two: titleColor.value,
    color_three: divBorderColor.value,
    color_four: cardBgColor.value,
    color_five: footerBgColor.value
  })
  saveMode.value = 'guardar'
  editingItem.value = null
  Swal.fire('Editado', 'La paleta fue actualizada.', 'success')
  await fetchSavedStyles()
}

const resetStyles = () => {
  headerBgColor.value = defaultStyles.color_one
  titleColor.value = defaultStyles.color_two
  divBorderColor.value = defaultStyles.color_three
  cardBgColor.value = defaultStyles.color_four
  footerBgColor.value = defaultStyles.color_five

  const pallete = {
    colors: {
      color_one: defaultStyles.color_one,
      color_two: defaultStyles.color_two,
      color_three: defaultStyles.color_three,
      color_four: defaultStyles.color_four,
      color_five: defaultStyles.color_five
    }
  }

  Swal.fire('¡Estilos restablecidos!', '', 'success')

  applyColorPalette(pallete);
}

const applyColorPalette = (palette) => {
  headerBgColor.value = palette.colors.color_one
  titleColor.value = palette.colors.color_two
  divBorderColor.value = palette.colors.color_three
  cardBgColor.value = palette.colors.color_four
  footerBgColor.value = palette.colors.color_five

  Swal.fire('¡Paleta aplicada!', '', 'success')
  handleApplyPalette(palette)
}

const handleDeletePalette = async (id) => {
  await apiService.deleteColors(id)
  Swal.fire('Eliminado', 'La paleta fue eliminada.', 'success')
  await fetchSavedStyles()
}

onMounted(fetchSavedStyles)
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


