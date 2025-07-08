<template>
  <header class="header">
    <h3>Carousel</h3>
  </header>
    <Carousel v-bind="config" class="contendor">
    <Slide v-for="(image,index) in imagenes" :key="index">
        <div class="custom-slide">
            <img :src="image.img" alt="image.title" />
        </div>
      
    </Slide>

    <template #addons>
      <Navigation />
      <Pagination />
    </template>
  </Carousel>

</template>

<script setup>
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel';
import { ref } from 'vue';
import 'vue3-carousel/carousel.css'
import t1 from '@/assets/img/carousel/testimonial-1.jpg'
import t2 from '@/assets/img/carousel/testimonial-2.jpg'
import t3 from '@/assets/img/carousel/testimonial-3.jpg'
import t4 from '@/assets/img/carousel/testimonial-4.jpg'
import t5 from '@/assets/img/carousel/testimonial-5.jpg'


const imagenes = ref([
    { img: t1, title: 'Imagen 1' },
    { img: t2, title: 'Imagen 2' },
    { img: t3, title: 'Imagen 3' },
    { img: t4, title: 'Imagen 3' },
    { img: t5, title: 'Imagen 3' }
])


const config = {
  width: 300,
  itemsToShow: 3,
  gap: 0,
  autoplay: 2500,
  wrapAround: true,
  pauseAutoplayOnHover: true
}
</script>

<style scoped>
.header{
  text-align: center;
}

:root {
  background-color: #242424;
}

.carousel {
  --vc-pgn-background-color: rgba(255, 255, 255, 0.7);
  --vc-pgn-active-color: rgba(255, 255, 255, 1);
  --vc-nav-background: rgba(52, 157, 255, 0.7);
  --vc-nav-border-radius: 100%;
}

img {
  border-radius: 8px;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.custom-slide {
  width: 300px; /* Altura fija */
  background: #f5f5f5;
  color: #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* Ajustar el espaciado entre slides */
.carousel__slide {
  padding: 10px;
}

/* Para slides con imágenes */
.custom-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.contendor{
  max-width: 1200px;
  margin: auto;
}
</style>