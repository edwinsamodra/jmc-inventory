<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="store.toast.show"
      class="fixed bottom-5 right-5 z-50 max-w-md w-full shadow-xl rounded-xl p-4 border flex items-center space-x-3 pointer-events-auto"
      :class="{
        'bg-emerald-50 border-emerald-200 text-emerald-900': store.toast.type === 'success',
        'bg-rose-50 border-rose-200 text-rose-900': store.toast.type === 'error',
        'bg-amber-50 border-amber-200 text-amber-900': store.toast.type === 'warning',
        'bg-blue-50 border-blue-200 text-blue-900': store.toast.type === 'info',
      }"
    >
      <div class="flex-shrink-0">
        <!-- Success Icon -->
        <svg v-if="store.toast.type === 'success'" class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <!-- Error Icon -->
        <svg v-else-if="store.toast.type === 'error'" class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <!-- Warning Icon -->
        <svg v-else-if="store.toast.type === 'warning'" class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <!-- Info Icon -->
        <svg v-else class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div class="flex-1 text-sm font-medium">
        {{ store.toast.message }}
      </div>

      <button
        @click="store.toast.show = false"
        type="button"
        class="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg"
      >
        <span class="sr-only">Close</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { store } from '../store/mockStore';
</script>
