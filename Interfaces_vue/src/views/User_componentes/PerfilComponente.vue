<template>
    <main class="main-content">
        <section class="profile-section">
            <div class="avatar-container">
                <img :src="image" alt="eu" class="avatar">
            </div>
            
            <div class="info-card">
                <h2 class="info-title">Información perfil personal</h2>
                
                <div class="info-item">
                    <span class="info-label">Nombre: </span>
                    <span class="info-value">{{firstName}}</span>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Teléfono: </span>
                    <span class="info-value">{{phone}}</span>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Correo: </span>
                    <span class="info-value">{{ email }}</span>
                </div>
                
                <button class="edit-btn" @click="goToEdit">Editar</button>
            </div>
    </section>
</main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userService } from '@/services/project_2/userService';

const router = useRouter();

const firstName = ref('');
const phone = ref('');
const email = ref('');
const image = ref('');

const goToEdit = () => {
  router.push('/editar_informacion');
};



const getUserbyID = async (user_id) => {
  try {
    const result = await userService.getUserById(user_id);
    return result;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

onMounted(async () => {
  const UserID = await userService.getUserID();
  const data = await getUserbyID(UserID);
  
  if (data && data.data) {
    firstName.value = data.data.firstName || '';
    phone.value = data.data.phone || '';
    email.value = data.data.email || '';
    image.value = data.data.image || '';
  }
});

</script>

<style scoped>
.main-content {
    display: flex;
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    gap: 2rem;
}

.profile-section {
    display: flex;
    width: 100%;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.avatar-container {
    width: 35%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    border-right: 1px solid #eee;
}

.avatar {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: contain;
    border: 5px solid white;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
}

.info-card {
    width: 65%;
    padding: 2.5rem;
    position: relative;
}

.info-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
    font-weight: 600;
}

.info-item {
    margin-bottom: 1.2rem;
    display: flex;
    align-items: center;
}

.info-label {
    font-weight: 600;
    width: 100px;
    color: #7f8c8d;
}

.info-value {
    flex: 1;
    padding: 0.5rem 0;
    border-bottom: 1px solid #ecf0f1;
}

.edit-btn {
    position: absolute;
    bottom: 2.5rem;
    right: 2.5rem;
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.edit-btn:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>