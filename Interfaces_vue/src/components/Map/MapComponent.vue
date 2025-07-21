<template>
  <div class="container-map">
    <div id="map" style="height: 400px;"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const emit = defineEmits(['ubicationSelected']);
let map = null;
let currentMarker = null;

onMounted(() => {
  // Ensure Leaflet is loaded (assumes it's included globally or via npm)
  const googleSat = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
    detectRetina: true,
    subdomains: 'abc',
  });

  const bounds = {
    north: 10.16202,
    east: -68.00765,
    south: 10.16202,
    west: -68.00765
  };

  const southWest = L.latLng(bounds.south, bounds.west);

  map = L.map('map', {
    center: southWest,
    zoom: 14,
    minZoom: 2,
    maxZoom: 22,
    layers: [googleSat]
  });

  map.on('click', async (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    if (currentMarker) {
      map.removeLayer(currentMarker);
    }
    let adress = '', state = '', postcode = '', country = '', city = '', university = '';
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'es'
          }
        }
      );
      if (!response.ok) throw new Error('Error en la respuesta de Nominatim');
      const data = await response.json();
      console.log('Datos obtenidos de Nominatim:', data);
      adress = data.name || data.address?.quarter || data.address?.neighbourhood || data.address?.suburb || '';
      state = data.address?.state || '';
      postcode = data.address?.postcode || '';
      country = data.address?.country || '';
      city = data.address?.city || data.address?.county || '';
      university = data.address?.amenity || '';

      currentMarker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`Marcador en:<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}<br>País: ${country}<br>Ciudad: ${city}`)
        .openPopup();
      const ubication_data = {
        adress,
        state,
        stateCode: postcode,
        lat,
        lng,
        country,
        city,
        university
      };
      
      emit('ubicationSelected', ubication_data);
    } catch (error) {
      console.error('Error al obtener datos de Nominatim:', error);
    }
  });
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.container-map {
  width: 100%;
  height: 400px;
}
#map {
  width: 100%;
  height: 100%;
}
</style>