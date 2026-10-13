<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
      @click="$emit('close')"
    ></div>

    <!-- Sidebar Aside -->
    <aside
      :class="[
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 pt-16 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:h-[calc(100vh-4rem)]'
      ]"
    >
      <div class="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <!-- Navigation Group: Utama -->
        <div>
          <div class="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Transaksi
          </div>
          <div class="mt-2 space-y-1">
            <RouterLink
              to="/barang-masuk"
              class="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition group"
              :class="isBarangMasukActive ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs' : 'text-slate-700 hover:bg-slate-100'"
              @click="$emit('close')"
            >
              <svg class="w-5 h-5 mr-3 transition" :class="isBarangMasukActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Barang Masuk</span>
            </RouterLink>
          </div>
        </div>

        <!-- Navigation Group: Master Data (Admin Only) -->
        <div v-if="isAdmin">
          <div class="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Master Data
          </div>
          <div class="mt-2 space-y-1">
            <RouterLink
              to="/master/kategori"
              class="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition group"
              :class="$route.path === '/master/kategori' ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs' : 'text-slate-700 hover:bg-slate-100'"
              @click="$emit('close')"
            >
              <svg class="w-5 h-5 mr-3 transition" :class="$route.path === '/master/kategori' ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Kategori</span>
            </RouterLink>

            <RouterLink
              to="/master/sub-kategori"
              class="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition group"
              :class="$route.path === '/master/sub-kategori' ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs' : 'text-slate-700 hover:bg-slate-100'"
              @click="$emit('close')"
            >
              <svg class="w-5 h-5 mr-3 transition" :class="$route.path === '/master/sub-kategori' ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Sub Kategori</span>
            </RouterLink>
          </div>
        </div>

        <!-- Navigation Group: Sistem (Admin Only) -->
        <div v-if="isAdmin">
          <div class="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pengaturan
          </div>
          <div class="mt-2 space-y-1">
            <RouterLink
              to="/users"
              class="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition group"
              :class="$route.path === '/users' ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs' : 'text-slate-700 hover:bg-slate-100'"
              @click="$emit('close')"
            >
              <svg class="w-5 h-5 mr-3 transition" :class="$route.path === '/users' ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Manajemen User</span>
            </RouterLink>
          </div>
        </div>

        <!-- Operator Access Notice -->
        <div v-if="!isAdmin" class="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-800">
          <div class="font-semibold flex items-center mb-1">
            <svg class="w-4 h-4 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hak Akses Operator
          </div>
          <p>Anda hanya memiliki akses ke modul <strong>Barang Masuk</strong> sesuai spesifikasi hak akses.</p>
        </div>
      </div>

      <!-- Footer Reset Mock Utility -->
      <div class="p-4 border-t border-slate-200 bg-slate-50">
        <button
          @click="resetStore"
          class="w-full text-xs text-slate-500 hover:text-rose-600 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 transition"
          title="Kembalikan semua data mock ke kondisi awal"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset Data Mock</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { store } from '../store/mockStore';

defineProps({
  isOpen: Boolean
});

defineEmits(['close']);

const route = useRoute();

const isAdmin = computed(() => store.currentUser?.role === 'Admin');

const isBarangMasukActive = computed(() => {
  return route.path.startsWith('/barang-masuk');
});

function resetStore() {
  if (confirm('Apakah Anda yakin ingin me-reset semua data ke default mock awal?')) {
    store.resetToDefault();
  }
}
</script>
