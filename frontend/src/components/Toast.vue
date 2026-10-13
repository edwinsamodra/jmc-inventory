<template>
  <div
    v-if="store.toast.show"
    class="position-fixed bottom-0 end-0 p-3"
    style="z-index: 9999;"
  >
    <div
      class="toast show align-items-center border-0 shadow-lg"
      :class="{
        'bg-success text-white': store.toast.type === 'success',
        'bg-danger text-white': store.toast.type === 'error',
        'bg-warning text-dark': store.toast.type === 'warning',
        'bg-info text-white': store.toast.type === 'info',
      }"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="d-flex p-2">
        <div class="toast-body d-flex align-items-center gap-2 fw-medium">
          <svg v-if="store.toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="icon" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10" />
          </svg>
          <svg v-else-if="store.toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" class="icon" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{{ store.toast.message }}</span>
        </div>
        <button
          type="button"
          class="btn-close me-2 m-auto"
          :class="store.toast.type === 'warning' ? '' : 'btn-close-white'"
          @click="store.toast.show = false"
          aria-label="Close"
        ></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { store } from '../store/mockStore';
</script>
