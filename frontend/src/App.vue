<template>
  <div class="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
    <!-- Login Route Layout (Self-contained scroll if needed) -->
    <div v-if="isLoginRoute" class="flex-1 overflow-y-auto flex flex-col">
      <RouterView />
    </div>

    <!-- Main Dashboard Layout -->
    <div v-else class="h-screen flex flex-col overflow-hidden">
      <!-- Fixed Top Navbar (h-16) -->
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Fixed Body Container below Navbar -->
      <div class="flex-1 flex pt-16 overflow-hidden relative">
        <!-- Fixed Sidebar (width 64 = 16rem) -->
        <Sidebar
          :is-open="sidebarOpen"
          @close="sidebarOpen = false"
        />

        <!-- Main Content Area: Fixed to right side of Sidebar, with internal independent scrolling -->
        <main class="flex-1 lg:pl-64 h-full overflow-y-auto">
          <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <RouterView />
          </div>
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
