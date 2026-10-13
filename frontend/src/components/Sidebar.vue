<template>
  <aside
    class="navbar navbar-vertical navbar-expand-lg navbar-dark sidebar"
    data-bs-theme="dark"
  >
    <div class="container-fluid px-0 justify-content-start">
      <!-- BRAND -->
      <h1 class="navbar-brand text-white ms-3 ms-lg-0 gap-3">
        <div class="logo">
          <img :src="logoJmc" alt="Logo" height="15" />
        </div>

        <RouterLink
          to="/barang-masuk"
          class="fw-bold hstack gap-3 text-decoration-none text-white"
        >
          <div style="font-size: 0.9rem">JMC Inventory</div>
        </RouterLink>
      </h1>

      <div
        id="sidebar-menu"
        class="offcanvas offcanvas-start px-lg-3"
        tabindex="-1"
      >
        <!-- HEADER (Mobile Offcanvas Header) -->
        <div class="offcanvas-header">
          <div class="d-flex gap-3 align-items-center">
            <div class="image">
              <img
                :src="logoJmc"
                alt="Logo"
                height="15"
              />
            </div>

            <div class="logo-text flex-grow-1">
              <h3 class="m-0"></h3>
              <div class="fs-4 fw-bold">JMC Inventory</div>
            </div>
          </div>

          <button
            type="button"
            class="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>

        <!-- BODY -->
        <div
          class="offcanvas-body p-3 p-lg-0 flex-column flex-grow-1 overflow-auto"
        >
          <ul class="navbar-nav align-items-start pt-lg-3">
            <!-- TRANSAKSI: BARANG MASUK -->
            <li class="nav-item">
              <RouterLink
                to="/barang-masuk"
                class="nav-link"
                :class="{ active: isBarangMasukActive }"
              >
                <span class="nav-link-icon d-md-none d-lg-inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3" />
                    <line x1="12" y1="12" x2="20" y2="7.5" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <line x1="12" y1="12" x2="4" y2="7.5" />
                  </svg>
                </span>
                <span class="nav-link-title">Barang Masuk</span>
              </RouterLink>
            </li>

            <!-- MASTER DATA: ADMIN ONLY -->
            <li
              v-if="isAdmin"
              class="nav-item dropdown"
              :class="{ active: isMasterActive }"
            >
              <a
                class="nav-link dropdown-toggle"
                href="#"
                :class="{ active: isMasterActive }"
                data-bs-toggle="dropdown"
                data-bs-auto-close="false"
                role="button"
                aria-expanded="false"
                @click.prevent="toggleMasterDropdown"
              >
                <span class="nav-link-icon d-md-none d-lg-inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <ellipse cx="12" cy="6" rx="8" ry="3"></ellipse>
                    <path d="M4 6v6a8 3 0 0 0 16 0v-6"></path>
                    <path d="M4 12v6a8 3 0 0 0 16 0v-6"></path>
                  </svg>
                </span>
                <span class="nav-link-title">Master Data</span>
              </a>
              <div
                class="dropdown-menu"
                :class="{ show: masterOpen || isMasterActive }"
              >
                <div class="dropdown-menu-columns">
                  <div class="dropdown-menu-column">
                    <RouterLink
                      to="/master/kategori"
                      class="dropdown-item"
                      :class="{ active: route.path === '/master/kategori' }"
                    >
                      Kategori
                    </RouterLink>
                    <RouterLink
                      to="/master/sub-kategori"
                      class="dropdown-item"
                      :class="{ active: route.path === '/master/sub-kategori' }"
                    >
                      Sub Kategori
                    </RouterLink>
                  </div>
                </div>
              </div>
            </li>

            <!-- PENGATURAN USER: ADMIN ONLY -->
            <li v-if="isAdmin" class="nav-item">
              <RouterLink
                to="/users"
                class="nav-link"
                :class="{ active: route.path === '/users' }"
              >
                <span class="nav-link-icon d-md-none d-lg-inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <circle cx="9" cy="7" r="4" />
                    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                  </svg>
                </span>
                <span class="nav-link-title">Manajemen User</span>
              </RouterLink>
            </li>

            <!-- OPERATOR NOTICE IF OPERATOR -->
            <li v-if="!isAdmin" class="nav-item mt-3">
              <div class="p-2 rounded bg-dark border border-secondary text-secondary small">
                <div class="fw-bold text-warning mb-1">Peran: Operator</div>
                <div>Akses terbatas pada input dan verifikasi data Barang Masuk.</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { store } from '../store/mockStore';
import logoJmc from '../assets/images/logo/logo_jmc.png';

const route = useRoute();
const masterOpen = ref(true);

const isAdmin = computed(() => store.currentUser?.role === 'Admin');

const isBarangMasukActive = computed(() => {
  return route.path.startsWith('/barang-masuk');
});

const isMasterActive = computed(() => {
  return route.path.startsWith('/master');
});

const toggleMasterDropdown = () => {
  masterOpen.value = !masterOpen.value;
};
</script>
