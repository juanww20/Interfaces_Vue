<template>
  <div class="form-field">
    <label :for="name" style="font-family: var(--font-secundary);">
      {{ label }}
    </label>
    <input
      :type="type"
      :id="name"
      :name="name"
      v-model="model"
      :required="required"
      class="form-input"
      :class="{
        'ng-invalid': error,
        'ng-valid': !error && modelValue
      }"
    />
    <div v-if="error" class="error-message">
      <span style="font-family: var(--font-secundary);">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

