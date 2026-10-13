<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Left: Mobile Menu Button & App Title -->
        <div class="flex items-center space-x-3">
          <button
            @click="$emit('toggle-sidebar')"
            class="lg:hidden text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="flex items-center space-x-2">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              A
            </div>
            <div>
              <span class="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">ARRG</span>
              <span class="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 border-l border-slate-300 pl-2">Pengelolaan Barang</span>
            </div>
          </div>
        </div>

        <!-- Right: Role Switcher & User Profile -->
        <div class="flex items-center space-x-3 sm:space-x-4">
          <!-- Fast Role Switcher (Helper for instant UI testing) -->
          <div class="hidden md:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <span class="text-slate-500 px-2 select-none">Mode Tes Peran:</span>
            <button
              @click="store.switchRole('Admin')"
              :class="store.currentUser?.role === 'Admin' ? 'bg-white text-brand-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'"
              class="px-2.5 py-1 rounded-lg transition"
            >
              Admin
            </button>
            <button
              @click="store.switchRole('Operator')"
              :class="store.currentUser?.role === 'Operator' ? 'bg-white text-brand-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'"
              class="px-2.5 py-1 rounded-lg transition ml-1"
            >
              Operator
            </button>
          </div>

          <!-- User Badge & Menu -->
          <div class="flex items-center space-x-3">
            <div class="text-right hidden sm:block">
              <div class="text-sm font-semibold text-slate-800 leading-tight">
                {{ store.currentUser?.nama }}
              </div>
              <div class="flex items-center justify-end space-x-1.5 mt-0.5">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold"
                  :class="store.currentUser?.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                >
                  {{ store.currentUser?.role }}
                </span>
                <span class="text-xs text-slate-400">@{{ store.currentUser?.username }}</span>
              </div>
            </div>

            <!-- Avatar -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs"
              :class="store.currentUser?.role === 'Admin' ? 'bg-purple-600' : 'bg-blue-600'"
            >
              {{ store.currentUser?.nama?.charAt(0) || 'U' }}
            </div>

            <!-- Logout Button -->
            <button
              @click="handleLogout"
              class="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition"
              title="Keluar / Logout"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { store } from '../store/mockStore';

defineEmits(['toggle-sidebar']);

const router = useRouter();

function handleLogout() {
  store.logout();
  router.push('/login');
}
</script>
