<template>
  <header class="bg-white border-b border-slate-200 fixed top-0 inset-x-0 h-16 z-30 shadow-xs select-none">
    <div class="px-4 sm:px-6 lg:px-8 h-full">
      <div class="flex items-center justify-between h-full">
        <!-- Left: Mobile Menu Button & App Brand -->
        <div class="flex items-center space-x-3">
          <button
            @click="$emit('toggle-sidebar')"
            class="lg:hidden text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 focus:outline-none transition"
            aria-label="Toggle menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <RouterLink to="/barang-masuk" class="flex items-center space-x-2.5 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm group-hover:shadow-md transition">
              J
            </div>
            <div class="flex flex-col">
              <span class="text-base sm:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent leading-none">
                JMC Inventory
              </span>
              <span class="text-2xs font-medium text-slate-400 mt-0.5">Sistem Pengelolaan Barang</span>
            </div>
          </RouterLink>
        </div>

        <!-- Right: Fast Role Switcher & System Status -->
        <div class="flex items-center space-x-3 sm:space-x-4">
          <!-- Role Switcher (Helper for UI test) -->
          <div class="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200/60">
            <span class="text-slate-500 px-2 hidden sm:inline-block">Peran Aktif:</span>
            <button
              @click="store.switchRole('Admin')"
              :class="store.currentUser?.role === 'Admin' ? 'bg-white text-brand-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
              class="px-2.5 py-1 rounded-lg transition text-xs"
            >
              Admin
            </button>
            <button
              @click="store.switchRole('Operator')"
              :class="store.currentUser?.role === 'Operator' ? 'bg-white text-brand-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
              class="px-2.5 py-1 rounded-lg transition ml-1 text-xs"
            >
              Operator
            </button>
          </div>

          <!-- Environment Badge -->
          <div class="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-2xs font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { store } from '../store/mockStore';

defineEmits(['toggle-sidebar']);
</script>
