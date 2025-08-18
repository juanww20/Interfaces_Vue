<template>
    <LoaderAnimation v-if="showLoader"></LoaderAnimation>
    <ComponenteBanner></ComponenteBanner>
    <ComponenteAboutSection></ComponenteAboutSection>
    <ComponenteSectionService></ComponenteSectionService>
    <ComponentePortafolio></ComponentePortafolio>
    <ComponenteCarousel></ComponenteCarousel>
    <ComponenteCarouselVideo></ComponenteCarouselVideo>
    <ComponenteContactoSection></ComponenteContactoSection>
</template>

<script setup>
import ComponenteBanner from '@/components/ComponenteBanner.vue';
import ComponenteAboutSection from '@/components/ComponenteAboutSection.vue';
import ComponenteSectionService from '@/components/ComponenteSectionService.vue';
import ComponenteContactoSection from '@/components/ComponenteContactoSection.vue';
import ComponentePortafolio from '@/components/ComponentePortafolio.vue';
import ComponenteCarousel from '@/components/ComponenteCarousel.vue';
import LoaderAnimation from '@/components/LoaderAnimation.vue';
import ComponenteCarouselVideo from '@/components/ComponenteCarouselVideo.vue';
import { ref } from 'vue';

// showLoader: extrae valor booleano de localStorage ('true' o 'false'), default true
const showLoader = ref(localStorage.getItem('showLoader') === 'false' ? false : true);
// Loader timeout desde localStorage (en ms), default 6000
const tiempo = Number(localStorage.getItem('loaderTime')) || 6000;
setTimeout(() => {
    showLoader.value = false;
}, tiempo);
</script>