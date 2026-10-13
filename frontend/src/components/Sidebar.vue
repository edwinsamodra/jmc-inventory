<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
      @click="$emit('close')"
    ></div>

    <!-- Fixed Sidebar Aside (not scrollable with main content) -->
    <aside
      :class="[
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'fixed top-16 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out'
      ]"
    >
      <!-- Navigation Menu (scrolls independently if items overflow) -->
      <div class="flex-1 px-4 py-5 space-y-6 overflow-y-auto">
        <!-- Navigation Group: Transaksi -->
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

        <!-- Navigation Group: Pengaturan (Admin Only) -->
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

      <!-- Footer: Reset Mock & Profile Logged In + Logout (di sidebar bawah) -->
      <div class="border-t border-slate-200 bg-slate-50/80 p-3 space-y-2.5">
        <!-- User Profile Card & Logout Button -->
        <div class="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <!-- Profile info -->
          <div class="flex items-center space-x-2.5 min-w-0">
            <div
              class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm text-white shadow-xs"
              :class="isAdmin ? 'bg-purple-600' : 'bg-blue-600'"
            >
              {{ store.currentUser?.nama?.charAt(0) || 'U' }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold text-slate-800 truncate" :title="store.currentUser?.nama">
                {{ store.currentUser?.nama }}
              </div>
              <div class="flex items-center space-x-1 mt-0.5">
                <span
                  class="inline-block px-1.5 py-0.2 rounded text-3xs font-bold uppercase tracking-wider"
                  :class="isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ store.currentUser?.role }}
                </span>
                <span class="text-3xs text-slate-400 truncate">@{{ store.currentUser?.username }}</span>
              </div>
            </div>
          </div>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition flex-shrink-0 ml-1"
            title="Keluar / Logout"
            aria-label="Logout"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <!-- Reset Data Mock Button -->
        <button
          @click="resetStore"
          class="w-full text-2xs text-slate-500 hover:text-rose-600 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50/50 transition font-medium"
          title="Kembalikan semua data mock ke kondisi awal"
        >
          <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
import { useRoute, useRouter } from 'vue-router';
import { store } from '../store/mockStore';

defineProps({
  isOpen: Boolean
});

defineEmits(['close']);

const route = useRoute();
const router = useRouter();

const isAdmin = computed(() => store.currentUser?.role === 'Admin');

const isBarangMasukActive = computed(() => {
  return route.path.startsWith('/barang-masuk');
});

function handleLogout() {
  store.logout();
  router.push('/login');
}

function resetStore() {
  if (confirm('Apakah Anda yakin ingin me-reset semua data ke default mock awal?')) {
    store.resetToDefault();
  }
}
</script>
