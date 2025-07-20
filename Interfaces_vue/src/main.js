import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useAuthStore } from './stores/Auth'
import { useStyleStore } from './stores/Styles'

import 'jquery'
import 'datatables.net-dt/css/dataTables.dataTables.css'
import 'datatables.net-dt'
import 'datatables.net-buttons'
import 'datatables.net-buttons/js/dataTables.buttons'
import 'datatables.net-buttons/js/buttons.html5.js'
import 'datatables.net-buttons/js/buttons.print.js'
import 'datatables.net-buttons/js/buttons.colVis.js'
import 'datatables.net-buttons-dt/css/buttons.dataTables.css'

import jszip from 'jszip'
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'

// ✅ Asigna las fuentes virtuales para los PDF
pdfMake.vfs = pdfFonts.vfs

// ✅ También puedes usar esto si JSZip te lanza error (DataTables lo necesita)
window.JSZip = jszip

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')

// ✅ Verifica la sesión al iniciar la app
const auth = useAuthStore()
auth.checkSession()

const styleStore = useStyleStore()
// ✅ Aplica el tema por defecto al iniciar la app
styleStore.loadPaletteFromStorage()
styleStore.loadFontFromStorage()