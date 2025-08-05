<template>
  <section id="portfolio" class="clearfix">
    <div class="container">
      <header class="section-header">
        <h3 class="section-title">Galeria</h3>
      </header>

      <div class="row">
        <div class="col-lg-12">
          <ul id="portfolio-flters">
            <li
              v-for="filter in filters"
              :key="filter"
              :class="{ 'filter-active': activeFilter === filter }"
              @click="activeFilter = filter"
            >
              {{ filter.charAt(0).toUpperCase() + filter.slice(1) }}
            </li>
          </ul>
        </div>
      </div>

      <div class="row portfolio-container">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          :class="`col-lg-4 col-md-6 portfolio-item filter-${item.category}`"
        >
          <div class="portfolio-wrap">
            <img :src="item.img" class="img-fluid" :alt="item.title" />
            <div class="portfolio-info">
              <h4><a href="#">{{ item.title }}</a></h4>
              <p>{{ item.category.charAt(0).toUpperCase() + item.category.slice(1) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import app1 from '@/assets/img/portfolio/app1.jpg'
import app2 from '@/assets/img/portfolio/app2.jpg'
import app3 from '@/assets/img/portfolio/app3.jpg'
import card1 from '@/assets/img/portfolio/card1.jpg'
import card2 from '@/assets/img/portfolio/card2.jpg'
import card3 from '@/assets/img/portfolio/card3.jpg'
import web1 from '@/assets/img/portfolio/web1.jpg'
import web2 from '@/assets/img/portfolio/web2.jpg'
import web3 from '@/assets/img/portfolio/web3.jpg'



const portfolioItems = [
  { id: 1, category: 'app', title: 'App 1', img: app1},
  { id: 2, category: 'web', title: 'Web 3', img: web1 },
  { id: 3, category: 'app', title: 'App 2', img: app2 },
  { id: 4, category: 'card', title: 'Card 2', img: card2 },
  { id: 5, category: 'web', title: 'Web 2', img: web2 },
  { id: 6, category: 'app', title: 'App 3', img: app3 },
  { id: 7, category: 'card', title: 'Card 1', img: card1 },
  { id: 8, category: 'card', title: 'Card 3', img: card3 },
  { id: 9, category: 'web', title: 'Web 1', img: web3 }
];

const filters = ['all', 'app', 'card', 'web'];

const activeFilter = ref('all');

const filteredItems = computed(() => {
  return activeFilter.value === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeFilter.value);
});
</script>