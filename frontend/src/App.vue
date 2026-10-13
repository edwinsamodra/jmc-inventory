<template>
  <div class="page">
    <!-- Login Route (Auth Layout identical to Nuxt auth.vue) -->
    <template v-if="isLoginRoute">
      <RouterView />
    </template>

    <!-- Main Dashboard Layout (identical to Nuxt default.vue) -->
    <template v-else>
      <Sidebar />

      <div class="page-wrapper">
        <Navbar @toggle-mobile-sidebar="sidebarOpen = !sidebarOpen" />

        <div class="page-body">
          <div class="container-xl">
            <!-- Breadcrumb Navigation (hanya jika halaman tidak memiliki custom header) -->
            <AppBreadcrumb v-if="!['BarangMasukList', 'MasterKategori', 'MasterSubKategori', 'ManajemenUser'].includes(route.name)" />

            <!-- Page View Content -->
            <RouterView />
          </div>
        </div>
      </div>
    </template>

    <!-- Global Toast Component -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Sidebar from './components/Sidebar.vue';
import AppBreadcrumb from './components/AppBreadcrumb.vue';
import Toast from './components/Toast.vue';
const route = useRoute();
const sidebarOpen = ref(false);

onMounted(() => {
  document.body.setAttribute('data-bs-theme', 'light');
  localStorage.setItem('theme', 'light');
});

const isLoginRoute = computed(() => {
  return route.name === 'Login';
});
</script>
