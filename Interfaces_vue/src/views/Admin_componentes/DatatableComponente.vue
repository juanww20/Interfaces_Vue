<template>
  <div class="container mt-4">
    <h2>Gestión de Usuarios</h2>
    <table ref="userTable" class="table table-striped" style="width: 100%">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Estado</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in allUsers" :key="user.user_id">
          <td>{{ user.user_name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.status === true ? 'Activo' : 'Inactivo' }}</td>
          <td>{{ user.role_id }}</td>
          <td>
            <button class="btn btn-info btn-sm" @click="viewUser(user)">Ver</button>
            <button
              :class="['btn btn-sm', user.status ? 'btn-danger' : 'btn-success']"
              @click="toggleUser(user)"
            >
              {{ user.status ? 'Deshabilitar' : 'Habilitar' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal manual con paginación de campos -->
    <div v-if="isModalOpen" class="modal" @click.self="closeModal" tabindex="0" role="dialog" aria-modal="true" aria-labelledby="modalTitle" ref="modal">
      <div class="modal-content" @keydown.esc="closeModal" tabindex="0">
        <div class="modal-header">
          <h5 class="modal-title" id="modalTitle">Detalles del Usuario</h5>
          <button type="button" class="btn-close" aria-label="Cerrar modal" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <div v-for="field in paginatedUserFields" :key="field.key" class="field-item">
            <p>
              <strong>{{ field.label }}:</strong>
              <template v-if="field.key === 'image'">
                {{ selectedUser[field.key] ? selectedUser[field.key].slice(0, 15) + '...' : '' }}
              </template>
              <template v-else>
                {{ getNestedValue(selectedUser, field.key) }}
              </template>
            </p>
          </div>

          <!-- Controles de paginación solo si hay más de 1 página -->
          <div v-if="totalPages > 1" class="pagination-controls">
            <button @click="prevPage" :disabled="currentPage === 1">Anterior</button>
            <span>Página {{ currentPage }} de {{ totalPages }} </span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, computed } from 'vue'
import { userService } from '@/services/project_2/userService'
import Swal from 'sweetalert2'
import $ from 'jquery'

const allUsers = ref([])
const selectedUser = ref(null)
const userTable = ref(null)
const isModalOpen = ref(false)
const modal = ref(null)

const userFields = [
    { key: 'firstName', label: 'Nombre' },
    { key: 'lastName', label: 'Apellido' },
    { key: 'maidenName', label: 'Segundo Apellido' },
    { key: 'age', label: 'Edad' },
    { key: 'gender', label: 'Género' },
    { key: 'birthDate', label: 'Fecha de nacimiento' },
    { key: 'bloodGroup', label: 'Grupo sanguíneo' },
    { key: 'height', label: 'Altura' },
    { key: 'weight', label: 'Peso' },
    { key: 'eyeColor', label: 'Color de ojos' },
    { key: 'hair_color', label: 'Color de cabello' },
    { key: 'hair_type', label: 'Tipo de cabello' },
    { key: 'image', label: 'Imagen' },
    { key: 'email', label: 'Correo electrónico' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'user_name', label: 'Usuario' },
    { key: 'ip', label: 'IP' },
    { key: 'macAddress', label: 'MAC Address' },
    { key: 'userAgent', label: 'User Agent' },
    { key: 'address_address', label: 'Dirección' },
    { key: 'address_city', label: 'Ciudad' },
    { key: 'address_state', label: 'Estado' },
    { key: 'address_stateCode', label: 'Código de estado' },
    { key: 'address_postalCode', label: 'Código postal' },
    { key: 'address_coordinates_lat', label: 'Latitud' },
    { key: 'address_coordinates_lng', label: 'Longitud' },
    { key: 'address_country', label: 'País' },
    { key: 'university', label: 'Universidad' },
    { key: 'bank_cardExpire', label: 'Vencimiento tarjeta' },
    { key: 'bank_cardNumber', label: 'Número de tarjeta' },
    { key: 'bank_cardType', label: 'Tipo de tarjeta' },
    { key: 'bank_currency', label: 'Moneda' },
    { key: 'bank_iban', label: 'IBAN' },
    { key: 'crypto_coin', label: 'Criptomoneda' },
    { key: 'crypto_wallet', label: 'Wallet' },
    { key: 'crypto_network', label: 'Red cripto' },
    { key: 'company_department', label: 'Departamento' },
    { key: 'company_name', label: 'Empresa' },
    { key: 'company_title', label: 'Cargo' },
    { key: 'company_address_address', label: 'Dirección empresa' },
    { key: 'company_address_city', label: 'Ciudad empresa' },
    { key: 'company_address_state', label: 'Estado empresa' },
    { key: 'company_address_stateCode', label: 'Código estado empresa' },
    { key: 'company_address_postalCode', label: 'Código postal empresa' },
    { key: 'company_address_coordinates_lat', label: 'Latitud empresa' },
    { key: 'company_address_coordinates_lng', label: 'Longitud empresa' },
    { key: 'company_address_country', label: 'País empresa' },
    { key: 'ein', label: 'EIN' },
    { key: 'ssn', label: 'SSN' }
  ];

//Modal
// Agrega estas propiedades
const currentPage = ref(1);
const itemsPerPage = 10;

// Computed para campos paginados
const paginatedUserFields = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return userFields.slice(start, start + itemsPerPage)
})

// Computed para total de páginas
const totalPages = computed(() => Math.ceil(userFields.length / itemsPerPage))

// Funciones para controlar paginación
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Función para acceder a valores anidados según el key con "_"
function getNestedValue(obj, key) {
  if (!obj) return ''
  return obj[key] ?? ''
}


const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUQAAAA0CAMAAADFYbGBAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDYzODYzQUYxOUMzMTFFOTg3MDFGNDQyQkU1QTgyM0YiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDYzODYzQjAxOUMzMTFFOTg3MDFGNDQyQkU1QTgyM0YiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0NjM4NjNBRDE5QzMxMUU5ODcwMUY0NDJCRTVBODIzRiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0NjM4NjNBRTE5QzMxMUU5ODcwMUY0NDJCRTVBODIzRiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqsXPvUAAAJ/UExURQA2bwB7////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'

const getAllUsers = async () => {
  const result = await userService.getUsers()
  if (result) {
    allUsers.value = [...result.active, ...result.desactive]
    initDataTable()
  }
}

const initDataTable = () => {
  setTimeout(() => {
    $(userTable.value).DataTable({
      destroy: true,
      dom: 'Bfrtip',
      buttons: [
        {
          extend: 'excelHtml5',
          title: 'Usuarios',
          text: 'Exportar a Excel',
          className: 'btn btn-success',
          exportOptions: {
            columns: ':not(:last-child)' // Excluye la última columna (Acciones)
          },
        },
        {
          extend: 'pdfHtml5',
          title: 'Usuarios',
          text: 'Exportar a PDF',
          exportOptions: {
            columns: ':not(:last-child)' // Excluye la última columna (Acciones)
          },
          customize: (doc) => {
            doc.content.splice(0, 0, {
              margin: [0, 0, 0, 12],
              alignment: 'center',
              image: logoBase64,
              width: 50
            })
          },
          className: 'btn btn-danger'
        }
      ]
    })
  }, 100)
}

const viewUser = async (user) => {
    
    console.log('Ver usuario:', user)
    selectedUser.value = user
    isModalOpen.value = true
    await nextTick()
    modal.value?.focus() // para accesibilidad: enfocar modal al abrir
}

const closeModal = () => {
  isModalOpen.value = false
  selectedUser.value = null
}

const toggleUser = async (user) => {
  const action = user.status ? 'deshabilitar' : 'habilitar'
  const result = await Swal.fire({
    title: `¿Estás seguro de ${action} a este usuario?`,
    text: `Esta acción puede revertirse.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar'
  })

  if (result.isConfirmed) {
    const success = await userService.updateUser(user.user_id, { status: !user.status })
    if (success) {
      Swal.fire('¡Listo!', `El usuario fue ${action}do correctamente.`, 'success')
      getAllUsers()
    } else {
      Swal.fire('Error', 'Hubo un problema al actualizar el usuario.', 'error')
    }
  }
}

onMounted(() => {
  getAllUsers()
})
</script>

<style scoped>
.container {
  padding: 20px;
}

button {
  margin-right: 5px;
}

/* Modal overlay */
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6); /* fondo más oscuro */
  display: flex; 
  justify-content: center; 
  align-items: center;
  z-index: 1050;
  outline: none;
  backdrop-filter: blur(5px); /* efecto blur de fondo */
  -webkit-backdrop-filter: blur(5px);
}

/* Modal box */
.modal-content {
  background: #fff;
  padding: 30px 25px;
  border-radius: 12px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  outline: none;
  animation: modalFadeIn 0.3s ease forwards;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Animación de entrada */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  line-height: 1;
  color: #999;
  transition: color 0.3s ease;
}
.btn-close:hover {
  color: #ff4d4f;
}

.modal-body p {
  margin: 10px 0;
  font-size: 1rem;
  color: #444;
  line-height: 1.4;
}

.modal-body p strong {
  color: #222;
}

.modal-footer {
  text-align: right;
  margin-top: 25px;
}

.modal-footer .btn-secondary {
  background-color: #007bff;
  border: none;
  color: white;
  padding: 8px 18px;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-footer .btn-secondary:hover {
  background-color: #0056b3;
}

/* Para que el botón tenga algo de sombra */
.modal-footer .btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.5);
}
</style>
