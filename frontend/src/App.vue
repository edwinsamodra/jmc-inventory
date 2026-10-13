<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
    <!-- Login Route Layout -->
    <div v-if="isLoginRoute" class="flex-1 flex flex-col">
      <RouterView />
    </div>

    <!-- Main Dashboard Layout -->
    <div v-else class="flex-1 flex flex-col min-h-screen">
      <!-- Top Navbar -->
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <div class="flex-1 flex">
        <!-- Sidebar Navigation -->
        <Sidebar
          :is-open="sidebarOpen"
          @close="sidebarOpen = false"
        />

        <!-- Main Content View -->
        <main class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <RouterView />
        </main>
      </div>
    </div>

    <!-- Global Toast Component -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Sidebar from './components/Sidebar.vue';
import Toast from './components/Toast.vue';

const route = useRoute();
const sidebarOpen = ref(false);

const isLoginRoute = computed(() => {
  return route.name === 'Login';
});
</script>
