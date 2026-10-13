<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" @click="$emit('cancel')"></div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100 p-6">
        <div class="sm:flex sm:items-start">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl sm:mx-0 sm:h-10 sm:w-10"
            :class="danger ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-600'"
          >
            <svg v-if="danger" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-semibold text-slate-800" id="modal-title">
              {{ title }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-slate-500">
                {{ message }}
              </p>
            </div>
          </div>
        </div>
        <div class="mt-6 sm:mt-5 sm:flex sm:flex-row-reverse gap-3">
          <button
            type="button"
            class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-xs px-4 py-2.5 text-sm font-semibold text-white transition focus:outline-none sm:w-auto"
            :class="danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'"
            @click="$emit('confirm')"
          >
            {{ confirmText || 'Konfirmasi' }}
          </button>
          <button
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 shadow-xs px-4 py-2.5 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:w-auto"
            @click="$emit('cancel')"
          >
            {{ cancelText || 'Batal' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  message: String,
  confirmText: String,
  cancelText: String,
  danger: {
    type: Boolean,
    default: true
  }
});

defineEmits(['confirm', 'cancel']);
</script>
