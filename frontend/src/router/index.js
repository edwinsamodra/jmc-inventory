import { createRouter, createWebHistory } from 'vue-router';
import { store } from '../store/mockStore';

import LoginView from '../views/LoginView.vue';
import BarangMasukView from '../views/BarangMasukView.vue';
import FormBarangMasukView from '../views/FormBarangMasukView.vue';
import KategoriView from '../views/KategoriView.vue';
import SubKategoriView from '../views/SubKategoriView.vue';
import UserView from '../views/UserView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true, title: 'Login - Pengelolaan Barang' }
  },
  {
    path: '/',
    redirect: '/barang-masuk'
  },
  {
    path: '/barang-masuk',
    name: 'BarangMasukList',
    component: BarangMasukView,
    meta: { title: 'Barang Masuk - Daftar Data' }
  },
  {
    path: '/barang-masuk/tambah',
    name: 'BarangMasukTambah',
    component: FormBarangMasukView,
    meta: { title: 'Tambah Barang Masuk' }
  },
  {
    path: '/barang-masuk/edit/:id',
    name: 'BarangMasukEdit',
    component: FormBarangMasukView,
    meta: { title: 'Edit Barang Masuk' }
  },
  {
    path: '/master/kategori',
    name: 'MasterKategori',
    component: KategoriView,
    meta: { adminOnly: true, title: 'Master Data - Kategori' }
  },
  {
    path: '/master/sub-kategori',
    name: 'MasterSubKategori',
    component: SubKategoriView,
    meta: { adminOnly: true, title: 'Master Data - Sub Kategori' }
  },
  {
    path: '/users',
    name: 'ManajemenUser',
    component: UserView,
    meta: { adminOnly: true, title: 'Manajemen User' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/barang-masuk'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  // Update document title
  document.title = to.meta.title ? `${to.meta.title} | Arrg Inventory` : 'Arrg - Pengelolaan Barang';

  // Check auth
  if (!to.meta.public && !store.currentUser) {
    return next({ name: 'Login' });
  }

  // If logged in and going to login page -> redirect to barang masuk
  if (to.name === 'Login' && store.currentUser) {
    return next({ name: 'BarangMasukList' });
  }

  // Check admin only restriction
  if (to.meta.adminOnly && store.currentUser?.role !== 'Admin') {
    store.showToast('Akses ditolak: Menu ini hanya dapat diakses oleh Admin!', 'error');
    return next({ name: 'BarangMasukList' });
  }

  next();
});

export default router;
