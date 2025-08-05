<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1 style="font-family: var(--font-principal);">
          {{ isLoginMode ? 'Iniciar Sesión' : 'Registrarse' }}
        </h1>
      </div>

      <div class="mode-toggle">
        <button
          type="button"
          class="toggle-button" 
          :class="{ active: isLoginMode }"
          @click="toggleMode"
          style="font-family: var(--font-secundary);"
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          class="toggle-button"
          :class="{ active: !isLoginMode }"
          @click="toggleMode"
          style="font-family: var(--font-secundary);"
        >
          Registrarse
        </button>
      </div>

      <AuthForm :is-login-mode="isLoginMode" @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AuthForm from '@/components/auth/AuthForm.vue'
import { userService } from '@/services/project_2/userService'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/Auth'
import Swal from 'sweetalert2'

const isLoginMode = ref(true)
const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)

function toggleMode() {
  isLoginMode.value = !isLoginMode.value
}

async function handleSubmit(formData) {
  loading.value = true

  try {

    if(!isLoginMode.value) {

    const { user_name, email, password } = formData

    const res = await userService.createUser({user_name, email, password})

    if (res) {
      await Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Ahora puedes iniciar sesión.',
        confirmButtonColor: '#3085d6',
      })
      isLoginMode.value = true // Cambia a modo login
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el usuario. Inténtalo de nuevo.',
        confirmButtonColor: '#d33',
      })
      return
    }
    
  } else {

    const success = await auth.login({email : formData.email, password : formData.password})

    if(success) {
      await Swal.fire({
        icon: 'success',
        title: 'Inicio de sesión exitoso',
        text: `Bienvenido de nuevo ${auth.user.user_name ?? 'usuario'}.`,
        confirmButtonColor: '#3085d6',
      })
      router.push('/') // Redirige a la página principal
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Credenciales incorrectas. Inténtalo de nuevo.',
        confirmButtonColor: '#d33',
      })
      return
    }
  }
    
  } finally {
    loading.value = false
  }
  
}
</script>
