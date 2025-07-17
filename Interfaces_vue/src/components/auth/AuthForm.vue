<template>
  <form class="auth-form" @submit.prevent="onSubmit">
    <!-- Registro: Campo de nombre de usuario -->
    <InputField
      v-if="!isLoginMode"
      v-model="formData.user_name"
      label="UserName"
      name="userName"
      type="text"
      :required="true"
      :error="showError && !formData.user_name"
      error-message="El nombre es requerido."
    />

    <!-- Email -->
    <InputField
      v-model="formData.email"
      label="Email"
      name="email"
      type="email"
      :required="true"
      :error="showError && !validEmail"
      error-message="Correo inválido o vacío."
    />

    <!-- Password -->
    <InputField
      v-model="formData.password"
      label="Password"
      name="password"
      type="password"
      :required="true"
      :error="showError && formData.password.length < 6"
      error-message="La contraseña debe tener al menos 6 caracteres."
    />

    <!-- Registro: Confirmar contraseña -->
    <InputField
      v-if="!isLoginMode"
      v-model="formData.confirmPassword"
      label="Confirmar"
      name="confirmPassword"
      type="password"
      :required="true"
      :error="showError && (!formData.confirmPassword || formData.confirmPassword !== formData.password)"
      error-message="Las contraseñas no coinciden."
    />

    <button type="submit" class="auth-button">
      {{ isLoginMode ? 'Iniciar Sesión' : 'Registrarse' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import InputField from '@/components/auth/InputField.vue'

// Props for AuthForm
const props = defineProps({
  isLoginMode: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['submit'])


const formData = ref({
  user_name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showError = ref(false)

const validEmail = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)
)

function onSubmit() {
  showError.value = true

  const isValid =
    formData.value.email &&
    validEmail.value &&
    formData.value.password.length >= 6 &&
    (props.isLoginMode || (
      formData.value.user_name &&
      formData.value.confirmPassword === formData.value.password
    ))

  if (!isValid) return

  emit('submit', { ...formData.value })
}
</script>
