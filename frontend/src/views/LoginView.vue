<template>
  <div class="page-login d-flex flex-column flex-lg-row w-100" data-bs-theme="light">
    <!-- Left: Login Form Section -->
    <div class="loginbox col-12 col-lg-5 d-flex align-items-center justify-content-center p-4 p-md-5 overflow-y-auto">
      <div class="w-100" style="max-width: 440px;">
        <!-- Logo and Branding Header identical to contoh_ui_jadi -->
        <div class="d-flex gap-3 mb-4 align-items-center">
          <div class="logo">
            <img
              :src="logoJmcBlack"
              alt="Logo JMC"
              height="36"
              class="d-inline-block"
            />
          </div>

          <div class="logo-text">
            <h1 class="h3 mb-0 fw-bold text-primary">JMC INVENTORY</h1>
            <div class="text-secondary small fw-medium">Sistem Pengelolaan Barang</div>
          </div>
        </div>

        <p class="text-muted mb-4">
          Selamat Datang, silahkan masukkan username dan password Anda!
        </p>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible mb-3 d-flex align-items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon me-2 flex-shrink-0" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div class="small fw-medium">{{ errorMessage }}</div>
        </div>

        <!-- Form Login -->
        <form id="login-form" @submit.prevent="handleLogin">
          <!-- Username / Identifier -->
          <div class="mb-3">
            <label class="form-label text-muted small mb-1">
              Username <span class="text-danger">*</span>
            </label>
            <div class="input-icon">
              <span class="input-icon-addon">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon text-muted" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <circle cx="12" cy="7" r="4" />
                  <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                </svg>
              </span>
              <input
                v-model="form.username"
                type="text"
                class="form-control py-3 bg-light text-dark"
                placeholder="Masukkan username Anda"
                autocomplete="username"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="mb-3">
            <label class="form-label text-muted small mb-1">
              Password <span class="text-danger">*</span>
            </label>
            <div class="input-icon has-end-addon">
              <span class="input-icon-addon">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon text-muted" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <circle cx="12" cy="16" r="1" />
                  <path d="M8 11v-4a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control py-3 bg-light text-dark"
                placeholder="Password"
                autocomplete="current-password"
                required
                :disabled="loading"
              />
              <span
                class="input-icon-addon input-icon-addon-end"
                @click="showPassword = !showPassword"
                title="Tampilkan / Sembunyikan Password"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="icon text-muted" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <circle cx="12" cy="12" r="2" />
                  <path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon text-muted" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <line x1="3" y1="3" x2="21" y2="21" />
                  <path d="M10.584 10.587a2 2 0 0 0 2.828 2.83" />
                  <path d="M9.363 5.365a9.466 9.466 0 0 1 2.637 -.365c4 0 7.333 2.333 10 7c-.778 1.361 -1.612 2.524 -2.503 3.488m-2.14 1.861c-1.631 1.026 -3.415 1.651 -5.357 1.651c-4 0 -7.333 -2.333 -10 -7c1.369 -2.396 2.913 -4.175 4.632 -5.341" />
                </svg>
              </span>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="mb-3 d-flex justify-content-between align-items-center">
            <label class="form-check m-0">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="form-check-input"
                :disabled="loading"
              />
              <span class="form-check-label text-muted small">Remember Me</span>
            </label>
            <span class="text-muted small">v1.0.0</span>
          </div>

          <!-- Submit Button -->
          <div class="d-grid mt-4">
            <button
              class="btn btn-primary text-uppercase shadow py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              type="submit"
              :disabled="loading"
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm"
                role="status"
              ></span>
              <span>{{ loading ? "Memverifikasi..." : "Masuk" }}</span>
            </button>
          </div>
        </form>

      </div>
    </div>

    <!-- Right: Swiper Cover Section identical to contoh_ui_jadi auth layout -->
    <div class="login-cover bg-dark col-lg-7 d-none d-lg-block position-relative">
      <Swiper
        :modules="[Autoplay, Pagination, Navigation]"
        :loop="true"
        :autoplay="{
          delay: 4500,
          disableOnInteraction: false,
        }"
        :pagination="{
          clickable: true,
        }"
        :navigation="true"
        class="w-100 h-100 position-absolute inset-0"
      >
        <SwiperSlide class="position-relative w-100 h-100">
          <img
            :src="work01"
            alt="Work Cover 1"
            class="cover"
          />
          <div class="position-absolute bottom-0 start-0 p-5 text-white" style="z-index: 3;">
            <div class="badge bg-warning text-dark mb-2 px-3 py-2 fw-bold text-uppercase">JMC Inventory Management</div>
            <h2 class="display-6 fw-bold mb-2 text-white">Kelola Transaksi Barang Masuk</h2>
            <p class="text-white-50 lead fs-6 mb-0">
              Pencatatan barang masuk cepat, validasi batas harga sub-kategori realtime, dan cetak surat penerimaan resmi.
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide class="position-relative w-100 h-100">
          <img
            :src="work02"
            alt="Work Cover 2"
            class="cover"
          />
          <div class="position-absolute bottom-0 start-0 p-5 text-white" style="z-index: 3;">
            <div class="badge bg-primary mb-2 px-3 py-2 fw-bold text-uppercase">Master Data & User Security</div>
            <h2 class="display-6 fw-bold mb-2 text-white">Kontrol Hak Akses Ketat</h2>
            <p class="text-white-50 lead fs-6 mb-0">
              Hak akses Admin dan Operator terintegrasi dengan proteksi akun terkunci dan master data dinamis.
            </p>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store/mockStore';

import logoJmcBlack from '../assets/images/logo/logo_jmc_black.png';
import work01 from '../assets/images/login/work01.jpeg';
import work02 from '../assets/images/login/work02.jpeg';

import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

const router = useRouter();

const form = reactive({
  username: '',
  password: '',
});

const rememberMe = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

onMounted(() => {
  document.body.setAttribute('data-bs-theme', 'light');
});


async function handleLogin() {
  errorMessage.value = '';
  loading.value = true;

  try {
    const res = await store.login(form.username, form.password);
    if (res.success) {
      store.showToast(`Selamat datang, ${res.user.nama}!`, 'success');
      router.push('/barang-masuk');
    } else {
      errorMessage.value = res.message;
    }
  } catch (err) {
    errorMessage.value = err.message || 'Gagal masuk ke sistem';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.cover {
  width: 100%;
  height: 100vh;
  object-fit: cover;
}
</style>
