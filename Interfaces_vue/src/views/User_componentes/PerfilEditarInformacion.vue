<template>
  <div class="form-container">
    <!-- Stepper con puntos -->
    <v-stepper v-model="currentStep" alt-labels class="custom-stepper">
      <v-stepper-header>
        <v-stepper-item
          :value="1"
          editable
          @click="currentStep = 1"
        >
          <template #title>Datos personales</template>
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item
          :value="2"
          editable
          @click="currentStep = 2"
        >
          <template #title>Contacto</template>
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item
          :value="3"
          editable
          @click="currentStep = 3"
        >
          <template #title>Información adicional</template>
        </v-stepper-item>
      </v-stepper-header>

      <!-- Contenido de los pasos -->
      <v-stepper-window>
        <!-- Paso 1: Datos personales -->
        <v-stepper-window-item :value="1">
          <v-form ref="form1" v-model="isStep1Valid" @submit.prevent="nextStep" class="step-form">
            <div class="name-fields">
              <v-text-field
                v-model="formData.firstName"
                label="Nombre*"
                :rules="nameRules"
                outlined
                dense
                class="name-field"
                :error-messages="submitAttempted && !formData.firstName ? ['Campo obligatorio'] : []"
              ></v-text-field>

              <v-text-field
                v-model="formData.lastName"
                label="Apellido*"
                :rules="nameRules"
                outlined
                dense
                class="name-field"
                :error-messages="submitAttempted && !formData.lastName ? ['Campo obligatorio'] : []"
              ></v-text-field>
            </div>

            <v-text-field
              v-model="formData.age"
              label="Edad*"
              type="number"
              :rules="ageRules"
              outlined
              dense
              :error-messages="submitAttempted && !formData.age ? ['Campo obligatorio'] : []"
            ></v-text-field>

            <v-select
              v-model="formData.gender"
              label="Género*"
              :items="genders"
              :rules="[(v) => !!v || 'El género es obligatorio']"
              outlined
              dense
              :error-messages="submitAttempted && !formData.gender ? ['Campo obligatorio'] : []"
            ></v-select>

            <div class="form-actions">
              <v-btn 
                type="submit" 
                color="primary" 
                class="next-btn"
                :disabled="!isStep1Valid"
              >
                Siguiente
              </v-btn>
            </div>
          </v-form>
        </v-stepper-window-item>

        <!-- Paso 2: Contacto -->
        <v-stepper-window-item :value="2">
          <v-form ref="form2" v-model="isStep2Valid" @submit.prevent="nextStep" class="step-form">
            <v-text-field
              v-model="formData.email"
              label="Correo electrónico*"
              :rules="emailRules"
              outlined
              dense
              :error-messages="submitAttempted && !formData.email ? ['Campo obligatorio'] : []"
            ></v-text-field>

            <v-text-field
              v-model="formData.phone"
              label="Teléfono"
              :rules="phoneRules"
              outlined
              dense
            ></v-text-field>

            <div class="form-actions">
              <v-btn type="button" @click="currentStep = 1" text class="back-btn"> Atrás </v-btn>
              <v-btn 
                type="submit" 
                color="primary" 
                class="next-btn"
                :disabled="!isStep2Valid"
              >
                Siguiente
              </v-btn>
            </div>
          </v-form>
        </v-stepper-window-item>

        <!-- Paso 3: Información adicional -->
        <v-stepper-window-item :value="3">
          <v-form ref="form3" v-model="isStep3Valid" @submit.prevent="submitForm" class="step-form">
            <v-text-field
              v-model="formData.address"
              label="Dirección*"
              :rules="addressRules"
              outlined
              dense
              :error-messages="submitAttempted && !formData.address ? ['Campo obligatorio'] : []"
            ></v-text-field>

            <v-text-field
              v-model="formData.city"
              label="Ciudad"
              :rules="cityRules"
              outlined
              dense
            ></v-text-field>

            <!-- Mensaje de error global -->
            <div v-if="submitAttempted && allMissingRequiredFields.length > 0" class="error-message">
              <v-icon color="error">mdi-alert-circle</v-icon>
              <div>
                <div>Faltan los siguientes campos obligatorios:</div>
                <ul>
                  <li v-for="field in missingRequiredFields" :key="field">{{ field }}</li>
                </ul>
              </div>
            </div>

            <div class="form-actions">
              <v-btn type="button" @click="currentStep = 2" text class="back-btn"> Atrás </v-btn>
              <v-btn 
                type="submit" 
                color="primary" 
                class="submit-btn"
                :disabled="!allStepsValid"
              >
                Enviar
              </v-btn>
            </div>
          </v-form>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const currentStep = ref(1);
const isStep1Valid = ref(false);
const isStep2Valid = ref(false);
const isStep3Valid = ref(false);
const submitAttempted = ref(false);

const form1 = ref(null);
const form2 = ref(null);
const form3 = ref(null);

const formData = ref({
  firstName: "",
  lastName: "",
  age: null,
  gender: null,
  email: "",
  phone: "",
  address: "",
  city: "",
});

const genders = ["Masculino", "Femenino", "Otro", "No especificar"];

// Campos obligatorios para el mensaje de error
const requiredFields = {
  1: ['firstName', 'lastName', 'age', 'gender'],
  2: ['email'],
  3: ['address']
};

const missingRequiredFields = computed(() => {
  const fields = requiredFields[currentStep.value];
  return fields.filter(field => !formData.value[field]).map(field => {
    const labels = {
      'firstName': 'Nombre',
      'lastName': 'Apellido',
      'age': 'Edad',
      'gender': 'Género',
      'email': 'Correo electrónico',
      'address': 'Dirección'
    };
    return labels[field];
  });
});

// Reglas de validación
const nameRules = [
  (v) => !!v || "Campo obligatorio",
  (v) => (v && v.length >= 2) || "Mínimo 2 caracteres",
  (v) => (v && v.length <= 20) || "Máximo 20 caracteres",
];

const ageRules = [
  (v) => !!v || "Campo obligatorio",
  (v) => (v >= 0 && v <= 120) || "Edad inválida",
];

const emailRules = [
  (v) => !!v || "Campo obligatorio",
  (v) => /.+@.+\..+/.test(v) || "Correo inválido",
];

const phoneRules = [
  (v) => /^[0-9]*$/.test(v) || "Solo números",
  (v) => !v || v.length <= 11 || "Máximo 11 dígitos",
];

const addressRules = [(v) => !!v || "Campo obligatorio"];
const cityRules = [];

// Navegación entre pasos
const nextStep = async () => {
  submitAttempted.value = true;
  const form = currentStep.value === 1 ? form1.value : form2.value;
  const { valid } = await form.validate();
  
  if (valid) {
    if (currentStep.value < 3) currentStep.value += 1;
  }
};


// Nueva computed property para todos los campos faltantes
const allMissingRequiredFields = computed(() => {
  const allFields = [...requiredFields[1], ...requiredFields[2], ...requiredFields[3]];
  return allFields.filter(field => !formData.value[field]).map(field => {
    const labels = {
      'firstName': 'Nombre (Paso 1)',
      'lastName': 'Apellido (Paso 1)',
      'age': 'Edad (Paso 1)',
      'gender': 'Género (Paso 1)',
      'email': 'Correo electrónico (Paso 2)',
      'address': 'Dirección (Paso 3)'
    };
    return labels[field];
  });
});

// Validación global de todos los pasos
const allStepsValid = computed(() => {
  return isStep1Valid.value && isStep2Valid.value && isStep3Valid.value;
});

const submitForm = async () => {
  submitAttempted.value = true;
  
  // Validar todos los formularios
  const validatePromises = [
    form1.value.validate(),
    form2.value.validate(),
    form3.value.validate()
  ];
  
  const results = await Promise.all(validatePromises);
  const allValid = results.every(result => result.valid);
  
  if (allValid) {
    console.log("Formulario enviado:", formData.value);
    // Lógica para enviar datos (API, etc.)
  } else {
    // Encontrar el primer paso con errores
    const invalidStep = results.findIndex(result => !result.valid) + 1;
    currentStep.value = invalidStep;
  }
};
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.custom-stepper {
  box-shadow: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.step-form {
  padding: 20px;
}

.name-fields {
  display: flex;
  gap: 16px;
}

.name-field {
  flex: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.next-btn, .submit-btn {
  min-width: 120px;
}

.back-btn {
  margin-right: auto;
}

.error-message {
  color: #ff5252;
  background-color: #ffebee;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Estilos para los campos */
:deep(.v-text-field) {
  margin-bottom: 16px;
}

:deep(.v-input__control) {
  min-height: 48px;
}

:deep(.v-label) {
  font-size: 14px;
}

:deep(.v-label--required::after) {
  content: '*' !important;
  color: #ff5252;
  margin-left: 2px;
}

:deep(.v-stepper-item__title) {
  font-weight: 500;
  cursor: pointer;
}

.error-message {
  color: #ff5252;
  background-color: #ffebee;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-message ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.error-message li {
  margin-bottom: 4px;
}
</style>