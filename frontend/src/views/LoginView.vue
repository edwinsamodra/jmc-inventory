<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-brand-500/30">
          A
        </div>
      </div>
      <h2 class="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
        ARRG INVENTORY
      </h2>
      <p class="mt-1 text-center text-sm text-slate-500">
        Sistem Aplikasi Pengelolaan Barang Sederhana
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div class="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100">
        <!-- Error Alert -->
        <div v-if="errorMessage" class="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
          <svg class="w-4 h-4 mt-0.5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label for="username" class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Username <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7 7z" />
                </svg>
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                autocomplete="username"
                placeholder="Masukkan username Anda"
                class="block w-full pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Password <span class="text-rose-500">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Masukkan password Anda"
                class="block w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition duration-150 disabled:opacity-50"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{{ loading ? 'Memproses...' : 'Masuk ke Aplikasi' }}</span>
            </button>
          </div>
        </form>

        <!-- Quick Demo Login Switchers -->
        <div class="mt-6 pt-6 border-t border-slate-100">
          <p class="text-2xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Akun Demo Pengujian Cepat
          </p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              @click="quickFill('admin', 'Password123')"
              class="p-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition text-left"
            >
              <div class="font-bold">Role: Admin</div>
              <div class="text-2xs text-purple-600 mt-0.5">admin / Password123</div>
            </button>
            <button
              type="button"
              @click="quickFill('budi_op', 'Operator123')"
              class="p-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition text-left"
            >
              <div class="font-bold">Role: Operator</div>
              <div class="text-2xs text-blue-600 mt-0.5">budi_op / Operator123</div>
            </button>
          </div>

          <div class="mt-2 text-center">
            <button
              type="button"
              @click="quickFill('doni_lock', 'Operator123')"
              class="text-2xs text-slate-400 hover:text-rose-600 underline"
            >
              Uji Coba Login User Terkunci (doni_lock)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { store } from '../store/mockStore';

const router = useRouter();

const form = reactive({
  username: '',
  password: ''
});

const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

function quickFill(u, p) {
  form.username = u;
  form.password = p;
  errorMessage.value = '';
}

function handleLogin() {
  errorMessage.value = '';
  loading.value = true;

  setTimeout(() => {
    const res = store.login(form.username, form.password);
    loading.value = false;
    if (res.success) {
      store.showToast(`Selamat datang, ${res.user.nama}!`, 'success');
      router.push('/barang-masuk');
    } else {
      errorMessage.value = res.message;
    }
  }, 300);
}
</script>
