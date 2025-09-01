<template>
   <div class="galeria-config">
        <ComponenteCarousel :show-delete="true" />
        <ComponenteCarouselVideo :show-delete="true" />
   </div>
</template>
<script setup>

import ComponenteCarousel from "@/components/ComponenteCarousel.vue"
import ComponenteCarouselVideo from "@/components/ComponenteCarouselVideo.vue"

</script>