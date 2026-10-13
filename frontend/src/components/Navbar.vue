<template>
  <header class="navbar navbar-expand-lg d-print-none sticky-top" id="navbar">
    <div class="container-xl justify-content-between">
      <div class="d-flex align-items-center">
        <!-- Desktop Sidebar Toggler -->
        <button
          class="sidebar-toggler d-none d-lg-block me-3"
          type="button"
          @click="toggleSidebar()"
          title="Toggle Sidebar"
        >
          <span class="sidebar-icon"></span>
        </button>

        <!-- Mobile Offcanvas Toggler -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebar-menu"
          @click="$emit('toggle-mobile-sidebar')"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>

      <!-- Right Navbar Nav -->
      <div class="navbar-nav flex-row order-md-last ms-md-auto align-items-center gap-2">
        <!-- Role Switcher (Helper for instant Demo testing) -->
        <div class="btn-group btn-group-sm me-2 d-none d-sm-flex" role="group">
          <button
            type="button"
            @click="store.switchRole('Admin')"
            class="btn py-1 px-2 fw-semibold"
            :class="store.currentUser?.role === 'Admin' ? 'btn-primary' : 'btn-outline-secondary'"
          >
            Admin
          </button>
          <button
            type="button"
            @click="store.switchRole('Operator')"
            class="btn py-1 px-2 fw-semibold"
            :class="store.currentUser?.role === 'Operator' ? 'btn-primary' : 'btn-outline-secondary'"
          >
            Operator
          </button>
        </div>

        <!-- User Dropdown matching Header.vue in contoh_ui_jadi -->
        <div class="nav-item dropdown position-relative" ref="userDropdownRef">
          <a
            href="#"
            class="nav-link d-flex lh-1 text-reset p-0 dropdown-toggle cursor-pointer"
            :class="{ show: isDropdownOpen }"
            @click.prevent="toggleUserDropdown"
          >
            <span
              class="avatar rounded-circle shadow-sm text-white fw-bold d-flex align-items-center justify-content-center"
              :class="isAdmin ? 'bg-purple' : 'bg-primary'"
            >
              {{ initials }}
            </span>
            <div class="d-none d-xl-block ps-2 text-start">
              <div class="fw-bold">{{ store.currentUser?.nama || "Pengguna" }}</div>
              <div class="mt-1 small text-primary fw-semibold">{{ store.currentUser?.role }}</div>
            </div>
          </a>

          <div
            class="dropdown-menu dropdown-menu-end dropdown-menu-arrow shadow"
            :class="{ show: isDropdownOpen }"
            :style="isDropdownOpen ? 'display: block; position: absolute; top: 100%; right: 0; margin-top: 0.5rem; z-index: 1050; min-width: 200px;' : 'display: none;'"
          >
            <div class="dropdown-header">
              <div class="fw-bold text-dark">{{ store.currentUser?.nama }}</div>
              <div class="small text-secondary">@{{ store.currentUser?.username }} • {{ store.currentUser?.role }}</div>
            </div>

            <div class="dropdown-divider"></div>

            <a href="#" class="dropdown-item cursor-pointer" @click.prevent="resetMockData">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon me-2 text-secondary" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset Data Mock</span>
            </a>

            <div class="dropdown-divider"></div>

            <button
              @click="handleLogout"
              type="button"
              class="dropdown-item text-danger border-0 bg-transparent w-100 text-start cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="icon me-2 text-danger" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                <path d="M7 12h14l-3 -3m0 6l3 -3" />
              </svg>
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store/mockStore';
import { useSidebar } from '../utils/useSidebar';

defineEmits(['toggle-mobile-sidebar']);

const router = useRouter();
const { toggleSidebar } = useSidebar();

const isDropdownOpen = ref(false);
const userDropdownRef = ref(null);

const isAdmin = computed(() => store.currentUser?.role === 'Admin');

const initials = computed(() => {
  if (!store.currentUser?.nama) return 'U';
  const parts = store.currentUser.nama.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
});

const toggleUserDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const handleLogout = async () => {
  isDropdownOpen.value = false;
  await store.logout();
  router.push('/login');
};

const resetMockData = () => {
  isDropdownOpen.value = false;
  if (confirm('Apakah Anda yakin ingin me-reset semua data ke kondisi awal?')) {
    store.resetToDefault();
  }
};

const handleClickOutside = (e) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    document.addEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('click', handleClickOutside);
  }
});
</script>
