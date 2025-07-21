<template>
  <div class="form-container">
    <!-- Stepper con puntos -->
    <v-stepper v-model="currentStep" alt-labels class="custom-stepper">
      <v-stepper-header>
        <v-stepper-item :value="1" editable @click="currentStep = 1">
          <template #title>Datos personales</template>
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item :value="2" editable @click="currentStep = 2">
          <template #title>Contacto</template>
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item :value="3" editable @click="currentStep = 3">
          <template #title>Dirección</template>
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item :value="4" editable @click="currentStep = 4">
          <template #title>Banco y Cripto</template>
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item :value="5" editable @click="currentStep = 5">
          <template #title>Datos Empresariales</template>
        </v-stepper-item>

        <v-divider></v-divider>

        <v-stepper-item :value="6" editable @click="currentStep = 6">
          <template #title>Confirmación</template>
        </v-stepper-item>
      </v-stepper-header>



      <!-- Contenido de los pasos -->
      <v-stepper-window>

        <!-- Paso 1: Datos personales -->
        <v-stepper-window-item :value="1">
          <v-form ref="form1" v-model="isStep1Valid" @submit.prevent="nextStep" class="step-form">
            <!-- Campos de nombre -->
            <div class="name-fields">
              <v-text-field v-model="formData.firstName" label="Nombre*" :rules="firstNameRules" outlined dense
                class="name-field"></v-text-field>

              <v-text-field v-model="formData.lastName" label="Apellido*" :rules="lastNameRules" outlined dense
                class="name-field"></v-text-field>

              <v-text-field v-model="formData.maidenName" label="Segundo apellido" :rules="maidenNameRules" outlined
                dense class="name-field"></v-text-field>

              <v-text-field v-model="formData.age" label="Edad*" type="number" :rules="ageRules" outlined dense
                class="name-field"></v-text-field>
            </div>

            <!-- Género, Fecha de nacimiento, Datos físicos -->
            <div class="row-fields">

              <v-select v-model="formData.gender" label="Género*" :items="genders" :rules="genderRules" outlined dense
                class="name-field"></v-select>

              <v-text-field v-model="formData.birthDate" label="Fecha de nacimiento*"
                placeholder="ddMMyyyy (Ej: 01072005)" :rules="birthDateRules" outlined dense maxlength="8"
                hint="Formato: ddMMyyyy" persistent-hint class="name-field"></v-text-field>

              <v-text-field v-model="formData.bloodGroup" label="Grupo sanguíneo" :rules="bloodGroupRules" outlined
                dense maxlength="3" class="name-field"></v-text-field>

              <v-text-field v-model="formData.height" label="Altura (cm)" :rules="heightRules" outlined dense
                type="number" maxlength="3" class="name-field"></v-text-field>
            </div>

            <!-- Datos físicos, Apariencia -->
            <div class="row-fields">
              <v-text-field v-model="formData.weight" label="Peso (kg)" :rules="weightRules" outlined dense
                type="number" maxlength="3" class="name-field"></v-text-field>

              <v-text-field v-model="formData.eyeColor" label="Color de ojos" :rules="eyeColorRules" outlined dense
                maxlength="15" class="name-field"></v-text-field>

              <v-text-field v-model="formData.hair_color" label="Color de cabello" :rules="hairColorRules" outlined
                dense maxlength="15" class="name-field"></v-text-field>

              <v-text-field v-model="formData.hair_type" label="Tipo de cabello" :rules="hairTypeRules" outlined dense
                maxlength="15" class="name-field"></v-text-field>
            </div>

            <!-- Sección de imagen -->
            <div class="image-section">
              <v-text-field v-model="formData.imageUrl" label="URL de imagen" outlined dense
                @update:modelValue="updateImagePreview" class="url-field"></v-text-field>

              <div class="imagen-input-preview-row">
                <v-file-input label="Cargar imagen" accept="image/*" prepend-icon="mdi-camera" @change="onFileSelected"
                  outlined dense :model-value="formData.imageFile ? [formData.imageFile] : []" :show-size="1000"
                  width="300px"></v-file-input>

                <div v-if="imagePreviewUrl" class="image-preview-container">
                  <v-img :src="imagePreviewUrl" max-width="150" max-height="150" class="preview-image" contain></v-img>
                  <div class="image-name">{{ formData.imageFile?.name || 'Imagen URL' }}</div>
                </div>
              </div>

            </div>

            <!-- Botón Siguiente corregido -->
            <div class="form-actions">
              <v-btn type="submit" color="primary" class="next-btn" :disabled="!isStep1Valid" :loading="isSubmitting">
                Siguiente
                <template v-slot:loader>
                  <v-progress-circular indeterminate size="24"></v-progress-circular>
                </template>
              </v-btn>
            </div>
          </v-form>
        </v-stepper-window-item>



        <!-- Paso 2: Contacto -->
        <v-stepper-window-item :value="2">
          <v-form ref="form2" v-model="isStep2Valid" @submit.prevent="nextStep" class="step-form">

            <div class="name-fields">
              <v-text-field label="Correo Electrónico" :rules="emailRules" outlined dense
                :error-messages="submitAttempted && !formData.email ? ['Campo obligatorio'] : []"
                class="name-field"></v-text-field>
              <!--Revisa este campo, piensa donde coloca mejor-->
              <v-text-field v-model="formData.hair_type" label="Contraseña" :rules="hairTypeRules" outlined dense
                maxlength="15" class="name-field"></v-text-field>
              <v-text-field label="Telefono" :rules="phoneRules" outlined dense class="name-field"></v-text-field>
              <v-text-field label="Usuario" outlined dense class="name-field"></v-text-field>
              <v-text-field label="IP" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="name-fields">
              <v-text-field label="MAC Address" outlined dense class="name-field"></v-text-field>
              <v-text-field label="User Agent" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="form-actions">
              <v-btn type="button" @click="currentStep = 1" text class="back-btn"> Atrás </v-btn>
              <v-btn type="submit" color="primary" class="next-btn" :disabled="!isStep2Valid">
                Siguiente
              </v-btn>
            </div>
          </v-form>
        </v-stepper-window-item>

        <!-- Paso 3: Direccion -->
        <v-stepper-window-item :value="3">
          <v-form ref="form3" v-model="isStep3Valid" @submit.prevent="submitForm" class="step-form">
            <div class="name-fields">
              <v-btn type="button" color="primary" class="map-button" @click="showModal = true">
                Seleccionar ubicación
              </v-btn>
              <MapModal v-if="showModal" @close="handleModalClose" />
              <v-text-field v-model="formData.address" label="Dirección" class="name-field"></v-text-field>
              <v-text-field v-model="formData.city" label="Ciudad" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.state" label="Estado" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="name-fields">
              <v-text-field v-model="formData.postcode" label="Código postal" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.stateCode" label="Código estado" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.lat" label="Latitud" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.lng" label="Longitud" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="name-fields">
              <v-text-field v-model="formData.country" label="País" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.university" label="Universidad" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="form-actions">
              <v-btn type="button" @click="currentStep = 2" text class="back-btn"> Atrás </v-btn>
              <v-btn type="submit" color="primary" class="next-btn">
                Siguiente
              </v-btn>
            </div>
          </v-form>
        </v-stepper-window-item>

        <!-- Paso 4: Banco y cripto -->
        <v-stepper-window-item :value="4">
          <v-form ref="form3" v-model="isStep3Valid" @submit.prevent="submitForm" class="step-form">
            <div class="name-fields">
              <v-text-field v-model="formData.bank_cardExpire" label="Vencimiento tarjeta" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.bank_cardNumber" label="Número de tarjeta" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.bank_cardType" label="Tipo de tarjeta" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.bank_currency" label="Moneda" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="name-fields">
              <v-text-field v-model="formData.bank_iban" label="IBAN" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.crypto_coin" label="Criptomoneda" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.crypto_wallet" label="Wallet" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.crypto_network" label="Red cripto" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="form-actions">
              <v-btn type="button" @click="currentStep = 3" text class="back-btn"> Atrás </v-btn>
              <v-btn type="submit" color="primary" class="next-btn">
                Siguiente
              </v-btn>
            </div>
          </v-form>
        </v-stepper-window-item>


        <!-- Paso 5: Datos empresariales -->
        <v-stepper-window-item :value="5">
          <v-form ref="form3" v-model="isStep3Valid" @submit.prevent="submitForm" class="step-form">
            <div class="name-fields">
              <v-btn type="button" color="primary" class="map-button" @click="showCompanyMapModal = true">
                Seleccionar ubicación
              </v-btn>
              <MapModal v-if="showCompanyMapModal" @close="handleCompanyMapModalClose" />
              <v-text-field v-model="formData.company_department" label="Departamento" class="name-field"></v-text-field>
              <v-text-field v-model="formData.company_name" label="Empresa" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.company_title" label="Cargo" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="name-fields">
              <v-text-field v-model="formData.company_address_address" label="Dirreción empresa" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.company_address_city" label="Ciudad empresa" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.company_address_state" label="Estado empresa" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.company_address_stateCode" label="Código estado empresa" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="name-fields">
              <v-text-field v-model="formData.company_address_postalCode" label="Código postal empresa" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.company_address_coordinates_lat" label="Latitud empresa" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.company_address_coordinates_lng" label="Longitud empresa" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.company_address_country" label="País empresa" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="name-fields">
              <v-text-field v-model="formData.ein" label="EIN" outlined dense class="name-field"></v-text-field>
              <v-text-field v-model="formData.ssn" label="SSN" outlined dense class="name-field"></v-text-field>
            </div>

            <div class="form-actions">
              <v-btn type="button" @click="currentStep = 4" text class="back-btn"> Atrás </v-btn>
              <v-btn type="submit" color="primary" class="next-btn">
                Siguiente
              </v-btn>
            </div>

          </v-form>
        </v-stepper-window-item>

        <!--Final paso: Confirmación, OJO, esto no deberia quedarse así-->
        <v-stepper-window-item :value="6">
          <v-form ref="form3" v-model="isStep3Valid" @submit.prevent="submitForm" class="step-form">
            <v-text-field v-model="formData.address" label="Dirección*" :rules="addressRules" outlined dense
              :error-messages="submitAttempted && !formData.address ? ['Campo obligatorio'] : []"></v-text-field>

            <v-text-field v-model="formData.city" label="Ciudad" :rules="cityRules" outlined dense></v-text-field>

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
              <v-btn type="button" @click="currentStep = 5" text class="back-btn"> Atrás </v-btn>
              <v-btn type="submit" color="primary" class="submit-btn" :disabled="!allStepsValid">
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
import MapModal from '@/components/Map/MapModal.vue';
//Esto sirve hacer la validacion, donde que permite tocar el boton de enviar con forma correcta, lea en la parte más abajo
const currentStep = ref(1);
const isStep1Valid = ref(false);
const isStep2Valid = ref(false);
const isStep3Valid = ref(false);
const submitAttempted = ref(false);

//Imagen de la ruta?? 
const imagePreviewUrl = ref(null);

const form1 = ref(null);
const form2 = ref(null);
const form3 = ref(null);
//Aqui esta comentada para que pueda agregar otros campos
// const form4 = ref(null);
// const form5 = ref(null);
// const form6 = ref(null);

//Esto es donde el variable donde que se consigue todos los valores
const formData = ref({
  // Paso 1
  firstName: "",
  lastName: "",
  maidenName: "",
  age: null,
  gender: "",
  birthDate: "",
  bloodGroup: "",
  height: "",
  weight: "",
  eyeColor: "",
  hair_color: "",
  hair_type: "",
  image: "",
  // Paso 2
  email: "",
  phone: "",
  user_name: "",
  ip: "",
  macAddress: "",
  userAgent: "",
  // Paso 3
  address: "",
  city: "",
  state: "",
  stateCode: "",
  postcode: "",
  lat: "",
  lng: "",
  country: "",
  university: "",
  // Paso 4
  bank_cardExpire: "",
  bank_cardNumber: "",
  bank_cardType: "",
  bank_currency: "",
  bank_iban: "",
  crypto_coin: "",
  crypto_wallet: "",
  crypto_network: "",
  // Paso 5
  company_department: "",
  company_name: "",
  company_title: "",
  company_address_address: "",
  company_address_city: "",
  company_address_state: "",
  company_address_stateCode: "",
  company_address_postalCode: "",
  company_address_coordinates_lat: "",
  company_address_coordinates_lng: "",
  company_address_country: "",
  ein: "",
  ssn: ""
});

//Esto es para la seleccion multiple
const genders = ["Masculino", "Femenino", "Otro", "No especificar"];

// Campos obligatorios para el mensaje de error
const requiredFields = {
  1: ['firstName', 'lastName', 'age', 'gender'],
  2: ['email'],
  3: ['address']
};

//Vea bien este codigo, aqui es hacer la validacion que donde el campo obligatorio se lo pide de forma obligatorio, y esto tambien sirve
//que marca cuales son los campos en un mensaje.
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
// Estos son las validaciones para el primer paso
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

// Reglas de validación (EN ESTE CASO ES PARA Datos personales)
const firstNameRules = [
  v => !!v || "El nombre es obligatorio",
  v => (v && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v)) || "Solo letras permitidas",
  v => (v && v.length >= 2) || "Mínimo 2 caracteres",
  v => (v && v.length <= 20) || "Máximo 20 caracteres"
];

const lastNameRules = [
  v => !!v || "El apellido es obligatorio",
  v => (v && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v)) || "Solo letras permitidas",
  v => (v && v.length >= 2) || "Mínimo 2 caracteres",
  v => (v && v.length <= 20) || "Máximo 20 caracteres"
];

const maidenNameRules = [
  v => !v || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || "Solo letras permitidas",
  v => !v || v.length >= 2 || "Mínimo 2 caracteres",
  v => !v || v.length <= 20 || "Máximo 20 caracteres"
];

const ageRules = [
  v => !!v || "La edad es obligatoria",
  v => /^[0-9]*$/.test(v) || "Solo números permitidos",
  v => (v >= 0) || "Edad mínima: 0",
  v => (v <= 120) || "Edad máxima: 120",
  v => v.toString().length <= 3 || "Máximo 3 dígitos"
];

const genderRules = [
  v => !!v || "El género es obligatorio"
];

const birthDateRules = [
  v => !!v || "La fecha es obligatoria",
  v => /^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[0-2])\d{4}$/.test(v) || "Formato inválido (ddMMyyyy)",
  v => {
    if (!v) return true;
    const day = parseInt(v.substring(0, 2));
    const month = parseInt(v.substring(2, 4)) - 1;
    const year = parseInt(v.substring(4));
    const inputDate = new Date(year, month, day);
    return inputDate <= new Date() || "La fecha no puede ser futura";
  }
];

const bloodGroupRules = [
  v => !v || v.length <= 3 || "Máximo 3 caracteres"
];

const heightRules = [
  v => !v || /^[0-9]*$/.test(v) || "Solo números válidos",
  v => !v || v.toString().length <= 3 || "Máximo 3 dígitos"
];

const weightRules = [
  v => !v || /^[0-9]*$/.test(v) || "Solo números válidos",
  v => !v || v.toString().length <= 3 || "Máximo 3 dígitos"
];

const eyeColorRules = [
  v => !v || v.length <= 15 || "Máximo 15 caracteres"
];

const hairColorRules = [
  v => !v || v.length <= 15 || "Máximo 15 caracteres"
];

const hairTypeRules = [
  v => !v || v.length <= 15 || "Máximo 15 caracteres"
];

// Manejo de archivos
const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    formData.value.imageFile = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
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

//Funcion para cerrar modal del mapa
const showModal = ref(false)
function handleModalClose(data) {
  showModal.value = false
  if (data) {
    formData.value = { ...formData.value, ...data };
    formData.value.address = data.adress || '';
  }
}

// Modal para ubicación de empresa
const showCompanyMapModal = ref(false)
function handleCompanyMapModalClose(data) {
  showCompanyMapModal.value = false
  if (data) {
    formData.value.company_address_address = data.adress || ''
    formData.value.company_address_city = data.city || ''
    formData.value.company_address_state = data.state || ''
    formData.value.company_address_stateCode = data.stateCode || ''
    formData.value.company_address_postalCode = data.postcode || ''
    formData.value.company_address_coordinates_lat = data.lat || ''
    formData.value.company_address_coordinates_lng = data.lng || ''
    formData.value.company_address_country = data.country || ''
  }
}
</script>

<style scoped>
.form-container {
  max-width: 90%;
  height: auto;
  margin: 0 auto;
  padding: 20px;
}

.custom-stepper {
  box-shadow: none;
  border: 1px solid var(--ligth-color);
  border-radius: 8px;
  padding: 20px;
}

.step-form {
  padding: 10px;
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
  margin-top: 0px;
}

.next-btn,
.submit-btn {
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

.name-fields,
.row-fields {
  display: flex;
  gap: 16px;
}

.name-field {
  flex: 1;
}

.image-section {
  display: flex;
  margin-top: 10px;
}

.imagen-input-preview-row {
  display: flex;
  align-items: center;
  gap: 20px;

}

.preview-image {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 600px) {

  .name-fields,
  .row-fields {
    flex-direction: column;
    gap: 8px;
  }

  .imagen-input-preview-row {
    flex-direction: column;
    align-items: flex-start;
  }
}

.map-button {
  background-color: var(--primary-color);
  color: var(--ligth-color);
  font-size: 14px;
  width: 20%;
  height: auto;
}
</style>