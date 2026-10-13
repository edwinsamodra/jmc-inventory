<template>
  <div v-if="show" class="modal modal-blur fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
      <div class="modal-content shadow-lg">
        <button type="button" class="btn-close" aria-label="Close" @click="$emit('cancel')"></button>
        <div class="modal-status" :class="danger ? 'bg-danger' : 'bg-primary'"></div>
        <div class="modal-body text-center py-4">
          <svg v-if="danger" xmlns="http://www.w3.org/2000/svg" class="icon mb-2 text-danger icon-lg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 9v2m0 4v.01" />
            <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon mb-2 text-primary icon-lg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
            <polyline points="11 12 12 12 12 16 13 16" />
          </svg>
          <h3 class="fw-bold">{{ title }}</h3>
          <div class="text-secondary small">{{ message }}</div>
        </div>
        <div class="modal-footer">
          <div class="w-100">
            <div class="row g-2">
              <div class="col">
                <button type="button" class="btn btn-outline-secondary w-100" @click="$emit('cancel')">
                  {{ cancelText || 'Batal' }}
                </button>
              </div>
              <div class="col">
                <button
                  type="button"
                  class="btn w-100"
                  :class="danger ? 'btn-danger' : 'btn-primary'"
                  @click="$emit('confirm')"
                >
                  {{ confirmText || 'Konfirmasi' }}
                </button>
              </div>
            </div>
          </div>
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
