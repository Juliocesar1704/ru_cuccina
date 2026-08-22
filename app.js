/**
 * RU CUCCINA - Sistema Completo de Delivery, Autenticação e Gestão de Pedidos
 */

// Cardápio de Produtos
const PRODUCTS = [
  {
    id: 'fettuccine-alfredo',
    title: 'FETTUCCINE ALFREDO',
    description: 'Fettuccine ao molho alfredo com parmesão.',
    price: 26.90,
    category: 'massas',
    image: 'IMG_9185.PNG'
  },
  {
    id: 'penne-ao-sugo',
    title: 'PENNE AO SUGO',
    description: 'Penne ao molho sugo com manjericão.',
    price: 24.90,
    category: 'massas',
    image: 'IMG_9185.PNG'
  },
  {
    id: 'risoto-de-parmesao',
    title: 'RISOTO DE PARMESÃO',
    description: 'Risoto cremoso de parmesão com toque de noz-moscada.',
    price: 27.90,
    category: 'risotos',
    image: 'IMG_9185.PNG'
  },
  {
    id: 'penne-com-frango',
    title: 'PENNE COM FRANGO',
    description: 'Penne ao molho branco com frango desfiado.',
    price: 25.90,
    category: 'massas',
    image: 'IMG_9185.PNG'
  },
  {
    id: 'risoto-de-cogumelos',
    title: 'RISOTO DE COGUMELOS',
    description: 'Risoto cremoso de cogumelos frescos com manteiga de ervas e parmesão.',
    price: 29.90,
    category: 'risotos',
    image: 'IMG_9185.PNG'
  },
  {
    id: 'combo-duo-cuccina',
    title: 'COMBO DUO CUCCINA',
    description: 'Escolha 2 massas tradicionais + 2 sobremesas especiais.',
    price: 54.90,
    category: 'combos',
    image: 'IMG_9185.PNG'
  }
];

// Pedidos Iniciais de Demonstração para a Proprietária
const INITIAL_DEMO_ORDERS = [
  {
    id: '1001',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    timeFormatted: 'Há 15 min',
    customer: {
      name: 'Camila Ferreira',
      cpf: '123.456.789-00',
      phone: '(11) 98765-4321',
      street: 'Rua das Palmeiras, 142',
      neighborhood: 'Jardins',
      complement: 'Apto 51'
    },
    payment: {
      method: 'PIX',
      change: ''
    },
    notes: 'Caprichar no queijo parmesão ralado por favor.',
    items: [
      { id: 'fettuccine-alfredo', title: 'FETTUCCINE ALFREDO', price: 26.90, qty: 2 }
    ],
    total: 53.80,
    isPaid: true,
    isDispatched: false,
    isCompleted: false
  },
  {
    id: '1002',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    timeFormatted: 'Há 35 min',
    customer: {
      name: 'Rodrigo Santos',
      cpf: '987.654.321-11',
      phone: '(11) 99123-4567',
      street: 'Av. Paulista, 1578',
      neighborhood: 'Bela Vista',
      complement: 'Bloco B'
    },
    payment: {
      method: 'Cartão de Crédito',
      change: ''
    },
    notes: '',
    items: [
      { id: 'risoto-de-parmesao', title: 'RISOTO DE PARMESÃO', price: 27.90, qty: 1 },
      { id: 'penne-com-frango', title: 'PENNE COM FRANGO', price: 25.90, qty: 1 }
    ],
    total: 53.80,
    isPaid: true,
    isDispatched: true, // 🔴 Em VERMELHO pois já saiu para entrega!
    isCompleted: false
  }
];

// Estado Global
let currentCategory = 'all';
let searchQuery = '';
let cart = [];
let orders = [];
let registeredUsers = [];
let currentUser = null; // { role: 'admin' | 'customer', name, cpf, phone, street, neighborhood, complement }
let currentAdminFilter = 'all';
let lastCreatedOrder = null;

// Elementos DOM - Telas
const clientStoreView = document.getElementById('clientStoreView');
const adminDashboardView = document.getElementById('adminDashboardView');

// Elementos DOM - Cardápio
const productsListEl = document.getElementById('productsList');
const categoriesContainer = document.getElementById('categoriesContainer');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const emptyStateEl = document.getElementById('emptyState');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

// Elementos DOM - Carrinho
const cartBadge = document.getElementById('cartBadge');
const cartOpenBtn = document.getElementById('cartOpenBtn');
const cartCloseBtn = document.getElementById('cartCloseBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Elementos DOM - Autenticação
const authModalOverlay = document.getElementById('authModalOverlay');
const authModalOpenBtn = document.getElementById('authModalOpenBtn');
const authCloseBtn = document.getElementById('authCloseBtn');
const navAuthLabel = document.getElementById('navAuthLabel');
const authTabLogin = document.getElementById('authTabLogin');
const authTabRegister = document.getElementById('authTabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const adminFooterLoginBtn = document.getElementById('adminFooterLoginBtn');

// Elementos DOM - Checkout & Sucesso
const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
const checkoutCloseBtn = document.getElementById('checkoutCloseBtn');
const deliveryForm = document.getElementById('deliveryForm');
const paymentMethodSelect = document.getElementById('paymentMethod');
const changeGroup = document.getElementById('changeGroup');
const modalTotalAmount = document.getElementById('modalTotalAmount');
const successModalOverlay = document.getElementById('successModalOverlay');
const successOrderDetails = document.getElementById('successOrderDetails');
const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
const successBackBtn = document.getElementById('successBackBtn');

// Elementos DOM - Painel Admin
const adminOrdersList = document.getElementById('adminOrdersList');
const adminEmptyOrders = document.getElementById('adminEmptyOrders');
const adminRefreshBtn = document.getElementById('adminRefreshBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminBackToMenuBtn = document.getElementById('adminBackToMenuBtn');
const metricTotalOrders = document.getElementById('metricTotalOrders');
const metricPendingOrders = document.getElementById('metricPendingOrders');
const metricPaidOrders = document.getElementById('metricPaidOrders');
const metricDispatchedOrders = document.getElementById('metricDispatchedOrders');

// Elementos DOM - Toast
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

// Formatação BRL
function formatCurrency(value) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Máscaras de CPF e Telefone
function maskCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

function maskPhone(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

// Aplicar máscaras nos inputs
['regCpf', 'custCpf'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', (e) => e.target.value = maskCPF(e.target.value));
});

['regPhone', 'custPhone'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', (e) => e.target.value = maskPhone(e.target.value));
});

/* ==========================================================================
   PERSISTÊNCIA & CARREGAMENTO (LocalStorage)
   ========================================================================== */
function loadData() {
  // Pedidos
  const savedOrders = localStorage.getItem('ru_cuccina_orders');
  if (savedOrders) {
    try { orders = JSON.parse(savedOrders); } catch (e) { orders = INITIAL_DEMO_ORDERS; }
  } else {
    orders = INITIAL_DEMO_ORDERS;
    saveOrders();
  }

  // Usuários Cadastrados
  const savedUsers = localStorage.getItem('ru_cuccina_users');
  if (savedUsers) {
    try { registeredUsers = JSON.parse(savedUsers); } catch (e) { registeredUsers = []; }
  }

  // Sessão do Usuário
  const savedSession = localStorage.getItem('ru_cuccina_session');
  if (savedSession) {
    try {
      currentUser = JSON.parse(savedSession);
      updateAuthUI();
    } catch (e) {
      currentUser = null;
    }
  }
}

function saveOrders() {
  localStorage.setItem('ru_cuccina_orders', JSON.stringify(orders));
  updateAdminMetrics();
  renderAdminOrders();
}

function saveUsers() {
  localStorage.setItem('ru_cuccina_users', JSON.stringify(registeredUsers));
}

function saveSession(user) {
  currentUser = user;
  if (user) {
    localStorage.setItem('ru_cuccina_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('ru_cuccina_session');
  }
  updateAuthUI();
}

// Sincronização entre abas
window.addEventListener('storage', (e) => {
  if (e.key === 'ru_cuccina_orders') {
    loadData();
    updateAdminMetrics();
    renderAdminOrders();
  }
});

/* ==========================================================================
   AUTENTICAÇÃO: LOGIN & CADASTRO
   ========================================================================== */
function updateAuthUI() {
  if (currentUser) {
    if (currentUser.role === 'admin') {
      navAuthLabel.textContent = '👑 Gerência';
    } else {
      const firstName = currentUser.name.split(' ')[0];
      navAuthLabel.textContent = `Olá, ${firstName}`;
    }
  } else {
    navAuthLabel.textContent = 'Entrar';
  }
}

// Abrir Modal de Login/Cadastro
authModalOpenBtn.addEventListener('click', () => {
  if (currentUser && currentUser.role === 'admin') {
    openAdminDashboard();
  } else if (currentUser) {
    if (confirm(`Conectado como: ${currentUser.name}\n\nDeseja sair da sua conta?`)) {
      saveSession(null);
      showToast('Você saiu da sua conta.');
    }
  } else {
    authModalOverlay.classList.add('open');
  }
});

adminFooterLoginBtn.addEventListener('click', () => {
  if (currentUser && currentUser.role === 'admin') {
    openAdminDashboard();
  } else {
    authTabLogin.click();
    document.getElementById('loginIdentifier').value = 'admin';
    document.getElementById('loginPassword').value = 'admin123';
    authModalOverlay.classList.add('open');
  }
});

authCloseBtn.addEventListener('click', () => {
  authModalOverlay.classList.remove('open');
});

// Alternar abas do modal
authTabLogin.addEventListener('click', () => {
  authTabLogin.classList.add('active');
  authTabRegister.classList.remove('active');
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
});

authTabRegister.addEventListener('click', () => {
  authTabRegister.classList.add('active');
  authTabLogin.classList.remove('active');
  registerForm.style.display = 'flex';
  loginForm.style.display = 'none';
});

// Submeter Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const ident = document.getElementById('loginIdentifier').value.trim().toLowerCase();
  const pass = document.getElementById('loginPassword').value.trim();

  // 1. Verificação de Acesso Admin
  if ((ident === 'admin' || ident === 'admin@rucuccina.com') && pass === 'admin123') {
    saveSession({ role: 'admin', name: 'Administrador' });
    authModalOverlay.classList.remove('open');
    loginForm.reset();
    showToast('Acesso concedido ao Painel de Gestão!');
    openAdminDashboard();
    return;
  }

  // 2. Verificação de Cliente Cadastrado
  const user = registeredUsers.find(u => 
    (u.cpf === ident || u.phone === ident || (u.email && u.email.toLowerCase() === ident)) && u.password === pass
  );

  if (user) {
    saveSession({ ...user, role: 'customer' });
    authModalOverlay.classList.remove('open');
    loginForm.reset();
    showToast(`Bem-vindo(a) de volta, ${user.name.split(' ')[0]}!`);
  } else {
    alert('Credenciais incorretas.\n\nPara acesso Admin: use admin / admin123\nPara cliente: cadastre-se na aba "Criar Conta".');
  }
});

// Submeter Cadastro de Cliente
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const cpf = document.getElementById('regCpf').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const street = document.getElementById('regStreet').value.trim();
  const neighborhood = document.getElementById('regNeighborhood').value.trim();
  const complement = document.getElementById('regComplement').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (registeredUsers.some(u => u.cpf === cpf)) {
    alert('Este CPF já está cadastrado. Faça login na aba "Entrar".');
    return;
  }

  const newUser = {
    id: 'user_' + Date.now(),
    name,
    cpf,
    phone,
    street,
    neighborhood,
    complement,
    password
  };

  registeredUsers.push(newUser);
  saveUsers();
  saveSession({ ...newUser, role: 'customer' });

  authModalOverlay.classList.remove('open');
  registerForm.reset();
  showToast(`Cadastro realizado com sucesso! Olá, ${name.split(' ')[0]}.`);
});

/* ==========================================================================
   PAINEL DE GESTÃO DA PROPRIETÁRIA (Admin)
   ========================================================================== */
function openAdminDashboard() {
  clientStoreView.style.display = 'none';
  adminDashboardView.style.display = 'flex';
  renderAdminOrders();
  updateAdminMetrics();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeAdminDashboard() {
  adminDashboardView.style.display = 'none';
  clientStoreView.style.display = 'flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

adminBackToMenuBtn.addEventListener('click', closeAdminDashboard);

adminLogoutBtn.addEventListener('click', () => {
  saveSession(null);
  closeAdminDashboard();
  showToast('Você saiu do painel administrativo.');
});

adminRefreshBtn.addEventListener('click', () => {
  loadData();
  renderAdminOrders();
  updateAdminMetrics();
  showToast('Pedidos atualizados!');
});

function updateAdminMetrics() {
  const total = orders.length;
  const pending = orders.filter(o => !o.isCompleted && !o.isDispatched).length;
  const paid = orders.filter(o => o.isPaid && !o.isCompleted).length;
  const dispatched = orders.filter(o => o.isDispatched && !o.isCompleted).length;

  metricTotalOrders.textContent = total;
  metricPendingOrders.textContent = pending;
  metricPaidOrders.textContent = paid;
  metricDispatchedOrders.textContent = dispatched;
}

// Filtros do Painel
document.querySelectorAll('.admin-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAdminFilter = btn.dataset.statusFilter;
    renderAdminOrders();
  });
});

function renderAdminOrders() {
  let filtered = [...orders];

  if (currentAdminFilter === 'pending') {
    filtered = filtered.filter(o => !o.isCompleted && !o.isDispatched);
  } else if (currentAdminFilter === 'paid') {
    filtered = filtered.filter(o => o.isPaid && !o.isCompleted);
  } else if (currentAdminFilter === 'dispatched') {
    filtered = filtered.filter(o => o.isDispatched && !o.isCompleted);
  } else if (currentAdminFilter === 'completed') {
    filtered = filtered.filter(o => o.isCompleted);
  }

  if (filtered.length === 0) {
    adminOrdersList.innerHTML = '';
    adminEmptyOrders.style.display = 'block';
    return;
  }

  adminEmptyOrders.style.display = 'none';
  adminOrdersList.innerHTML = filtered.map(order => {
    const isDispatched = order.isDispatched && !order.isCompleted;
    const isPaid = order.isPaid;
    
    return `
      <div class="order-card ${isDispatched ? 'status-dispatched' : ''}" data-id="${order.id}">
        
        <!-- Top Row do Pedido -->
        <div class="order-card-top">
          <div class="order-id-wrap">
            <span class="order-num">#${order.id}</span>
            <span class="order-time">${order.timeFormatted || 'Hoje'}</span>
          </div>
          
          <div class="order-badges-wrap">
            ${isPaid 
              ? `<span class="badge-paid">🟢 Pago</span>` 
              : `<span class="badge-unpaid">🟡 Pag. Pendente</span>`}
            
            <!-- 🔴 DESTAQUE EM VERMELHO PARA PEDIDOS QUE SAÍRAM PARA ENTREGA -->
            ${isDispatched 
              ? `<span class="badge-dispatched-red">🛵 SAIU P/ ENTREGA</span>` 
              : ''}

            ${order.isCompleted 
              ? `<span class="badge-completed">✓ Entregue</span>` 
              : ''}
          </div>
        </div>

        <!-- Dados do Cliente e Endereço -->
        <div class="order-customer-info">
          <div class="order-cust-name">
            👤 <strong>${order.customer.name}</strong> ${order.customer.cpf ? `<small style="font-weight:400;color:#666;">(CPF: ${order.customer.cpf})</small>` : ''}
          </div>
          <div>
            <a href="https://wa.me/55${order.customer.phone.replace(/\D/g, '')}" target="_blank" class="order-cust-phone">
              📱 WhatsApp: ${order.customer.phone}
            </a>
          </div>
          <div class="order-address-box">
            📍 <strong>Endereço:</strong> ${order.customer.street}, ${order.customer.neighborhood} 
            ${order.customer.complement ? ' - ' + order.customer.complement : ''}
          </div>
          ${order.notes ? `<div style="font-size: 11.5px; color: #b45309; margin-top: 2px;">📝 Obs: ${order.notes}</div>` : ''}
        </div>

        <!-- Itens do Pedido -->
        <div class="order-items-list">
          ${order.items.map(item => `
            <div class="order-item-row">
              <span><strong>${item.qty}x</strong> ${item.title}</span>
              <span>${formatCurrency(item.price * item.qty)}</span>
            </div>
          `).join('')}
        </div>

        <!-- Total e Forma de Pagamento -->
        <div class="order-total-row">
          <span>Forma: <strong>${order.payment.method}</strong></span>
          <span>Total: <strong>${formatCurrency(order.total)}</strong></span>
        </div>

        <!-- Controles de Ação da Gerente -->
        <div class="order-actions-bar">
          <!-- Marcar / Desmarcar como Pago -->
          <button class="order-action-btn btn-toggle-paid ${isPaid ? 'is-paid' : ''}" onclick="togglePaidStatus('${order.id}')">
            ${isPaid ? '✓ Pago 🟢' : 'Marcar como Pago'}
          </button>

          <!-- Marcar / Desmarcar como Saiu para Entrega (FICA EM VERMELHO) -->
          <button class="order-action-btn btn-toggle-dispatch ${isDispatched ? 'is-dispatched' : ''}" onclick="toggleDispatchStatus('${order.id}')">
            ${isDispatched ? '🛵 Em Rota 🔴' : '🛵 Saiu p/ Entrega'}
          </button>
        </div>

        <div class="order-footer-actions">
          <button class="btn-complete-order" onclick="toggleCompleteStatus('${order.id}')">
            ${order.isCompleted ? 'Reabrir Pedido' : '✓ Marcar como Entregue'}
          </button>
          <button class="btn-delete-order" onclick="deleteOrder('${order.id}')">
            Excluir
          </button>
        </div>

      </div>
    `;
  }).join('');
}

function togglePaidStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.isPaid = !order.isPaid;
  saveOrders();
  showToast(`Pedido #${order.id}: ${order.isPaid ? 'Marcado como Pago 🟢' : 'Marcado como Pagamento Pendente'}`);
}

function toggleDispatchStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.isDispatched = !order.isDispatched;
  if (order.isDispatched) order.isCompleted = false;
  saveOrders();
  showToast(`Pedido #${order.id}: ${order.isDispatched ? 'Saiu para Entrega! 🔴' : 'Retornado para preparo'}`);
}

function toggleCompleteStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.isCompleted = !order.isCompleted;
  if (order.isCompleted) order.isDispatched = false;
  saveOrders();
  showToast(`Pedido #${order.id}: ${order.isCompleted ? 'Concluído com sucesso! ✓' : 'Reaberto'}`);
}

function deleteOrder(orderId) {
  if (confirm(`Tem certeza que deseja excluir o Pedido #${orderId}?`)) {
    orders = orders.filter(o => o.id !== orderId);
    saveOrders();
    showToast(`Pedido #${orderId} excluído.`);
  }
}

/* ==========================================================================
   CARDÁPIO (Renderização, Filtros e Busca)
   ========================================================================== */
function renderProducts() {
  const filtered = PRODUCTS.filter(product => {
    const matchesCategory = (currentCategory === 'all' || product.category === currentCategory);
    const matchesSearch = searchQuery === '' || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    productsListEl.innerHTML = '';
    emptyStateEl.style.display = 'block';
    return;
  }

  emptyStateEl.style.display = 'none';
  productsListEl.innerHTML = filtered.map(product => `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-details">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description">${product.description}</p>
        </div>
        <div class="product-bottom-row">
          <span class="product-price">${formatCurrency(product.price)}</span>
          <button class="add-btn" onclick="addToCart('${product.id}')" aria-label="Adicionar ${product.title}">
            + Adicionar
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

categoriesContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.cat-pill');
  if (!btn) return;

  document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');

  currentCategory = btn.dataset.category;
  renderProducts();
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
  renderProducts();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.style.display = 'none';
  renderProducts();
  searchInput.focus();
});

resetFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.style.display = 'none';
  currentCategory = 'all';
  document.querySelectorAll('.cat-pill').forEach((el, idx) => {
    el.classList.toggle('active', idx === 0);
  });
  renderProducts();
});

/* ==========================================================================
   SACOLA DE COMPRAS
   ========================================================================== */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
  showToast(`${product.title} adicionado à sacola!`);
}

function changeQuantity(productId, delta) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex === -1) return;

  cart[itemIndex].qty += delta;

  if (cart[itemIndex].qty <= 0) {
    cart.splice(itemIndex, 1);
  }

  updateCartUI();
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  cartBadge.textContent = totalCount;
  cartBadge.classList.add('bump');
  setTimeout(() => cartBadge.classList.remove('bump'), 300);

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <p>Sua sacola está vazia.</p>
        <p style="font-size: 12px; margin-top: 6px; opacity: 0.8;">Escolha uma deliciosa massa ou risoto acima!</p>
      </div>
    `;
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.title}</h4>
          <span class="cart-item-price">${formatCurrency(item.price * item.qty)}</span>
        </div>
        <div class="cart-item-qty-ctrl">
          <button class="qty-btn" onclick="changeQuantity('${item.id}', -1)" aria-label="Diminuir quantidade">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQuantity('${item.id}', 1)" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
    `).join('');
  }

  cartSubtotalEl.textContent = formatCurrency(subtotal);
}

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

cartOpenBtn.addEventListener('click', openCart);
cartCloseBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

/* ==========================================================================
   CHECKOUT DO CLIENTE
   ========================================================================== */
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Sua sacola está vazia!');
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  modalTotalAmount.textContent = formatCurrency(subtotal);

  // Auto-preenchimento caso o cliente esteja logado
  if (currentUser && currentUser.role === 'customer') {
    document.getElementById('custName').value = currentUser.name || '';
    document.getElementById('custCpf').value = currentUser.cpf || '';
    document.getElementById('custPhone').value = currentUser.phone || '';
    document.getElementById('custStreet').value = currentUser.street || '';
    document.getElementById('custNeighborhood').value = currentUser.neighborhood || '';
    document.getElementById('custComplement').value = currentUser.complement || '';
  }

  closeCart();
  checkoutModalOverlay.classList.add('open');
});

checkoutCloseBtn.addEventListener('click', () => {
  checkoutModalOverlay.classList.remove('open');
});

paymentMethodSelect.addEventListener('change', (e) => {
  changeGroup.style.display = e.target.value === 'Dinheiro' ? 'flex' : 'none';
});

deliveryForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('custName').value.trim();
  const cpf = document.getElementById('custCpf').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const street = document.getElementById('custStreet').value.trim();
  const neighborhood = document.getElementById('custNeighborhood').value.trim();
  const complement = document.getElementById('custComplement').value.trim();
  const paymentMethod = paymentMethodSelect.value;
  const change = document.getElementById('custChange').value.trim();
  const notes = document.getElementById('orderNotes').value.trim();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const newId = (1000 + orders.length + 1).toString();

  const newOrder = {
    id: newId,
    createdAt: new Date().toISOString(),
    timeFormatted: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    customer: {
      name,
      cpf,
      phone,
      street,
      neighborhood,
      complement
    },
    payment: {
      method: paymentMethod,
      change
    },
    notes,
    items: [...cart],
    total: subtotal,
    isPaid: false,
    isDispatched: false,
    isCompleted: false
  };

  orders.unshift(newOrder);
  saveOrders();
  lastCreatedOrder = newOrder;

  deliveryForm.reset();
  cart = [];
  updateCartUI();

  checkoutModalOverlay.classList.remove('open');
  showSuccessModal(newOrder);
});

function showSuccessModal(order) {
  successOrderDetails.innerHTML = `
    <div style="margin-bottom: 8px;"><strong>Pedido #${order.id}</strong> • ${order.timeFormatted}</div>
    <div style="margin-bottom: 6px;">👤 <strong>${order.customer.name}</strong> ${order.customer.cpf ? `<br><small style="color:#666;">CPF: ${order.customer.cpf}</small>` : ''}</div>
    <div style="margin-bottom: 6px;">📱 ${order.customer.phone}</div>
    <div style="margin-bottom: 6px;">📍 ${order.customer.street}, ${order.customer.neighborhood} ${order.customer.complement ? '- ' + order.customer.complement : ''}</div>
    <div style="margin-bottom: 8px;">💳 Pagamento: <strong>${order.payment.method}</strong> ${order.payment.change ? '(' + order.payment.change + ')' : ''}</div>
    <hr style="border: 0; border-top: 1px dashed #ded8cb; margin: 8px 0;">
    <div style="margin-bottom: 6px;">
      ${order.items.map(it => `<div>• ${it.qty}x ${it.title} - ${formatCurrency(it.price * it.qty)}</div>`).join('')}
    </div>
    <div style="font-size: 15px; font-weight: 700; color: #0b1f14; margin-top: 6px;">Total: ${formatCurrency(order.total)}</div>
  `;

  successModalOverlay.classList.add('open');
}

sendWhatsAppBtn.addEventListener('click', () => {
  if (!lastCreatedOrder) return;
  
  let msg = `*RU CUCCINA - Novo Pedido #${lastCreatedOrder.id}*%0A%0A`;
  msg += `👤 *Cliente:* ${lastCreatedOrder.customer.name}%0A`;
  if (lastCreatedOrder.customer.cpf) {
    msg += `📄 *CPF:* ${lastCreatedOrder.customer.cpf}%0A`;
  }
  msg += `📞 *WhatsApp:* ${lastCreatedOrder.customer.phone}%0A`;
  msg += `📍 *Endereço:* ${lastCreatedOrder.customer.street}, ${lastCreatedOrder.customer.neighborhood} ${lastCreatedOrder.customer.complement ? '- ' + lastCreatedOrder.customer.complement : ''}%0A%0A`;
  msg += `🍝 *Itens do Pedido:*%0A`;
  lastCreatedOrder.items.forEach(it => {
    msg += `• ${it.qty}x ${it.title} (${formatCurrency(it.price * it.qty)})%0A`;
  });
  if (lastCreatedOrder.notes) {
    msg += `%0A📝 *Observações:* ${lastCreatedOrder.notes}%0A`;
  }
  msg += `%0A💳 *Pagamento:* ${lastCreatedOrder.payment.method} ${lastCreatedOrder.payment.change ? '(' + lastCreatedOrder.payment.change + ')' : ''}%0A`;
  msg += `💰 *TOTAL: ${formatCurrency(lastCreatedOrder.total)}*%0A`;

  window.open(`https://wa.me/?text=${msg}`, '_blank');
});

successBackBtn.addEventListener('click', () => {
  successModalOverlay.classList.remove('open');
});

/* ==========================================================================
   TOAST
   ========================================================================== */
let toastTimeout;
function showToast(message) {
  toastMessage.textContent = message;
  toastNotification.classList.add('show');
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastNotification.classList.remove('show');
  }, 2400);
}

/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderProducts();
  updateCartUI();
  updateAdminMetrics();
});
