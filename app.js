/**
 * RU CUCCINA - Sistema Completo de Delivery, Autenticação e Gestão de Pedidos
 * 100% Integrado com Supabase (PostgreSQL & Realtime) + Auto-refresh Contínuo
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

// Estado Global
let currentCategory = 'all';
let searchQuery = '';
let cart = [];
let orders = [];
let registeredUsers = [];
let currentUser = null;
let currentAdminFilter = 'all';
let lastCreatedOrder = null;
let autoRefreshInterval = null;

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

// Status Banco
const dbStatusDot = document.getElementById('dbStatusDot');
const dbStatusText = document.getElementById('dbStatusText');

// Toast
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

// Formatação BRL
function formatCurrency(value) {
  return (parseFloat(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Máscaras de Entrada
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

['regCpf', 'custCpf'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', (e) => e.target.value = maskCPF(e.target.value));
});

['regPhone', 'custPhone'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', (e) => e.target.value = maskPhone(e.target.value));
});

/* ==========================================================================
   INICIALIZAÇÃO & CONEXÃO AUTOMÁTICA COM BANCO DE DADOS
   ========================================================================== */
function isSupabaseConnected() {
  return supabaseClient !== null;
}

function updateDbStatusUI() {
  if (isSupabaseConnected()) {
    if (dbStatusDot) dbStatusDot.classList.add('connected');
    if (dbStatusText) dbStatusText.textContent = '🟢 Ao Vivo';
  } else {
    if (dbStatusDot) dbStatusDot.classList.remove('connected');
    if (dbStatusText) dbStatusText.textContent = '🟡 Local';
  }
}

async function initDatabaseAndLoadData() {
  initSupabase();
  updateDbStatusUI();

  // 1. Carregar Sessão Local
  const savedSession = localStorage.getItem('ru_cuccina_session');
  if (savedSession) {
    try {
      currentUser = JSON.parse(savedSession);
      updateAuthUI();
    } catch (e) {
      currentUser = null;
    }
  }

  // 2. Carregar Pedidos Imediatamente
  await fetchAllOrders();

  // 3. Iniciar Assinatura Realtime (WebSockets)
  if (isSupabaseConnected()) {
    setupRealtimeSubscription();
  }

  // 4. Iniciar Polling Automático Contínuo em Segundo Plano (a cada 4 segundos)
  if (!autoRefreshInterval) {
    autoRefreshInterval = setInterval(() => {
      fetchAllOrders(true); // Atualização silenciosa
    }, 4000);
  }
}

// Buscar Pedidos
async function fetchAllOrders(silent = false) {
  if (isSupabaseConnected()) {
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        orders = data.map(normalizeDbOrder);
        updateAdminMetrics();
        renderAdminOrders();
        return;
      }
    } catch (e) {
      if (!silent) console.warn('Falha ao buscar pedidos do Supabase:', e);
    }
  }

  // Fallback Local
  const saved = localStorage.getItem('ru_cuccina_orders');
  if (saved) {
    try { orders = JSON.parse(saved); } catch (e) { orders = []; }
  }
  updateAdminMetrics();
  renderAdminOrders();
}

function normalizeDbOrder(dbRow) {
  const addressParts = (dbRow.customer_address || '').split(' - ');
  const streetAndNeigh = addressParts[0] || '';
  const complement = addressParts[1] || '';
  
  return {
    id: dbRow.id,
    created_at: dbRow.created_at,
    timeFormatted: new Date(dbRow.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    customer: {
      name: dbRow.customer_name,
      cpf: dbRow.customer_cpf,
      phone: dbRow.customer_phone,
      street: streetAndNeigh,
      neighborhood: '',
      complement: complement
    },
    payment: {
      method: dbRow.payment_method,
      change: dbRow.payment_change
    },
    notes: dbRow.notes,
    items: Array.isArray(dbRow.items) ? dbRow.items : JSON.parse(dbRow.items || '[]'),
    total: parseFloat(dbRow.total) || 0,
    isPaid: !!dbRow.is_paid,
    isDispatched: !!dbRow.is_dispatched,
    isCompleted: !!dbRow.is_completed
  };
}

function setupRealtimeSubscription() {
  if (!supabaseClient) return;

  try {
    supabaseClient
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchAllOrders(true);
      })
      .subscribe();
  } catch (e) {
    console.warn('Erro ao configurar realtime:', e);
  }
}

/* ==========================================================================
   AUTENTICAÇÃO: LOGIN & CADASTRO
   ========================================================================== */
/* ==========================================================================
   ALERTA CUSTOMIZADO & NOTIFICAÇÕES (Substitui alerts nativos do navegador)
   ========================================================================== */
const customDialogOverlay = document.getElementById('customDialogOverlay');
const dialogTitle = document.getElementById('dialogTitle');
const dialogMessage = document.getElementById('dialogMessage');
const dialogIcon = document.getElementById('dialogIcon');
const dialogOkBtn = document.getElementById('dialogOkBtn');

function showAppAlert(title, message, type = 'error') {
  if (!customDialogOverlay) {
    console.warn(title, message);
    return;
  }
  dialogTitle.textContent = title;
  dialogMessage.textContent = message;

  if (type === 'success') {
    dialogIcon.className = 'dialog-icon-circle success';
    dialogIcon.textContent = '✓';
  } else if (type === 'info') {
    dialogIcon.className = 'dialog-icon-circle info';
    dialogIcon.textContent = 'ℹ️';
  } else {
    dialogIcon.className = 'dialog-icon-circle';
    dialogIcon.textContent = '⚠️';
  }

  customDialogOverlay.classList.add('open');
}

if (dialogOkBtn) {
  dialogOkBtn.addEventListener('click', () => {
    customDialogOverlay.classList.remove('open');
  });
}

function showAuthError(boxId, msg) {
  const box = document.getElementById(boxId);
  if (box) {
    box.textContent = msg;
    box.style.display = 'flex';
  }
}

function clearAuthErrors() {
  const lBox = document.getElementById('loginErrorBox');
  const rBox = document.getElementById('regErrorBox');
  if (lBox) lBox.style.display = 'none';
  if (rBox) rBox.style.display = 'none';
}

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

authModalOpenBtn.addEventListener('click', () => {
  clearAuthErrors();
  if (currentUser && currentUser.role === 'admin') {
    openAdminDashboard();
  } else if (currentUser) {
    showAppAlert('Conta Conectada', `Você está conectado como: ${currentUser.name}\n\nPara sair, acesse o painel ou use o botão de logout.`, 'info');
  } else {
    authModalOverlay.classList.add('open');
  }
});

adminFooterLoginBtn.addEventListener('click', () => {
  clearAuthErrors();
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
  clearAuthErrors();
});

authTabLogin.addEventListener('click', () => {
  clearAuthErrors();
  authTabLogin.classList.add('active');
  authTabRegister.classList.remove('active');
  loginForm.style.display = 'flex';
  registerForm.style.display = 'none';
});

authTabRegister.addEventListener('click', () => {
  clearAuthErrors();
  authTabRegister.classList.add('active');
  authTabLogin.classList.remove('active');
  registerForm.style.display = 'flex';
  loginForm.style.display = 'none';
});

function saveSession(user) {
  currentUser = user;
  if (user) {
    localStorage.setItem('ru_cuccina_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('ru_cuccina_session');
  }
  updateAuthUI();
}

// Botão de preenchimento rápido Admin na tela de login
const quickAdminFillBtn = document.getElementById('quickAdminFillBtn');
if (quickAdminFillBtn) {
  quickAdminFillBtn.addEventListener('click', () => {
    clearAuthErrors();
    document.getElementById('loginIdentifier').value = 'admin';
    document.getElementById('loginPassword').value = 'admin123';
  });
}

// 1. Login com Verificação no Banco / Admin
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAuthErrors();
  const ident = (document.getElementById('loginIdentifier').value || '').trim();
  const pass = (document.getElementById('loginPassword').value || '').trim();
  const lowerIdent = ident.toLowerCase();
  const digitsOnly = ident.replace(/\D/g, '');

  const submitBtn = document.getElementById('loginSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Verificando...';
  }

  try {
    // A. Verificação de Acesso Admin Mestre (Tolerante a maiúsculas/espaços)
    if (lowerIdent === 'admin' || lowerIdent === 'admin@rucuccina.com' || lowerIdent === 'gerencia') {
      if (pass === 'admin123' || pass === 'admin') {
        saveSession({ role: 'admin', name: 'Administrador' });
        authModalOverlay.classList.remove('open');
        loginForm.reset();
        showToast('Acesso concedido ao Painel de Gestão!');
        openAdminDashboard();
        return;
      } else {
        showAuthError('loginErrorBox', 'Senha incorreta para a Gerência. Utilize admin123');
        return;
      }
    }

    // B. Verificação no Banco Supabase (Busca inteligente por CPF, Telefone ou Nome)
    if (isSupabaseConnected()) {
      const { data, error } = await supabaseClient.from('users').select('*');
      if (!error && data && data.length > 0) {
        const found = data.find(u => {
          const uCpfDigits = (u.cpf || '').replace(/\D/g, '');
          const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
          const uNameLower = (u.name || '').toLowerCase();
          return (
            (digitsOnly && (uCpfDigits === digitsOnly || uPhoneDigits === digitsOnly)) ||
            (u.cpf && u.cpf.trim() === ident) ||
            (u.phone && u.phone.trim() === ident) ||
            (uNameLower.includes(lowerIdent) && lowerIdent.length >= 3)
          );
        });

        if (found) {
          if (found.password === pass) {
            saveSession({ ...found, role: 'customer' });
            authModalOverlay.classList.remove('open');
            loginForm.reset();
            showToast(`Bem-vindo(a) de volta, ${found.name.split(' ')[0]}!`);
            return;
          } else {
            showAuthError('loginErrorBox', 'A senha digitada está incorreta para este cadastro.');
            return;
          }
        }
      }
    }

    // C. Verificação Local (Fallback)
    const savedUsers = JSON.parse(localStorage.getItem('ru_cuccina_users') || '[]');
    const localUser = savedUsers.find(u => {
      const uCpfDigits = (u.cpf || '').replace(/\D/g, '');
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
      return (
        (digitsOnly && (uCpfDigits === digitsOnly || uPhoneDigits === digitsOnly)) ||
        u.cpf === ident || u.phone === ident
      );
    });

    if (localUser) {
      if (localUser.password === pass) {
        saveSession({ ...localUser, role: 'customer' });
        authModalOverlay.classList.remove('open');
        loginForm.reset();
        showToast(`Bem-vindo(a) de volta, ${localUser.name.split(' ')[0]}!`);
        return;
      } else {
        showAuthError('loginErrorBox', 'A senha digitada está incorreta.');
        return;
      }
    }

    // Se nenhuma conta foi encontrada
    showAuthError('loginErrorBox', 'Nenhuma conta encontrada com este CPF ou Telefone. Cadastre-se na aba "Criar Conta".');

  } catch (err) {
    console.warn('Erro ao autenticar:', err);
    showAuthError('loginErrorBox', 'Erro de conexão com o banco. Verifique sua rede.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Entrar na Conta';
    }
  }
});

// 2. Cadastro com Salvamento no Banco
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAuthErrors();
  const name = document.getElementById('regName').value.trim();
  const cpf = document.getElementById('regCpf').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const street = document.getElementById('regStreet').value.trim();
  const neighborhood = document.getElementById('regNeighborhood').value.trim();
  const complement = document.getElementById('regComplement').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const cpfDigits = cpf.replace(/\D/g, '');

  const submitBtn = registerForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Cadastrando...';
  }

  try {
    // A. Checar duplicidade no Supabase
    if (isSupabaseConnected()) {
      const { data } = await supabaseClient.from('users').select('cpf');
      if (data && data.some(u => (u.cpf || '').replace(/\D/g, '') === cpfDigits)) {
        showAuthError('regErrorBox', 'Este CPF já está cadastrado no sistema. Acesse a aba "Entrar".');
        return;
      }
    }

    const newUser = {
      cpf,
      name,
      phone,
      street,
      neighborhood,
      complement,
      password,
      role: 'customer'
    };

    // B. Salvar no Supabase
    if (isSupabaseConnected()) {
      const { error } = await supabaseClient.from('users').insert([newUser]);
      if (error) {
        console.warn('Erro no insert do Supabase:', error);
      } else {
        console.log('✅ Usuário registrado no Supabase!');
      }
    }

    // C. Salvar Local
    const savedUsers = JSON.parse(localStorage.getItem('ru_cuccina_users') || '[]');
    savedUsers.push(newUser);
    localStorage.setItem('ru_cuccina_users', JSON.stringify(savedUsers));
    saveSession(newUser);

    authModalOverlay.classList.remove('open');
    registerForm.reset();
    showToast(`Cadastro salvo com sucesso! Olá, ${name.split(' ')[0]}.`);

  } catch (err) {
    console.error('Erro no cadastro:', err);
    showAuthError('regErrorBox', 'Ocorreu um erro ao salvar o cadastro. Tente novamente.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Concluir Cadastro';
    }
  }
});

/* ==========================================================================
   PAINEL DE GESTÃO DA PROPRIETÁRIA (Admin)
   ========================================================================== */
function openAdminDashboard() {
  clientStoreView.style.display = 'none';
  adminDashboardView.style.display = 'flex';
  fetchAllOrders();
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

adminRefreshBtn.addEventListener('click', async () => {
  showToast('Atualizando pedidos...');
  await fetchAllOrders();
  showToast('Pedidos sincronizados!');
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

        <div class="order-customer-info">
          <div class="order-cust-name">
            👤 <strong>${order.customer.name}</strong> ${order.customer.cpf ? `<small style="font-weight:400;color:#666;">(CPF: ${order.customer.cpf})</small>` : ''}
          </div>
          <div>
            <a href="https://wa.me/55${(order.customer.phone || '').replace(/\D/g, '')}" target="_blank" class="order-cust-phone">
              📱 WhatsApp: ${order.customer.phone}
            </a>
          </div>
          <div class="order-address-box">
            📍 <strong>Endereço:</strong> ${order.customer.street} ${order.customer.neighborhood ? ', ' + order.customer.neighborhood : ''} 
            ${order.customer.complement ? ' - ' + order.customer.complement : ''}
          </div>
          ${order.notes ? `<div style="font-size: 11.5px; color: #b45309; margin-top: 2px;">📝 Obs: ${order.notes}</div>` : ''}
        </div>

        <div class="order-items-list">
          ${order.items.map(item => `
            <div class="order-item-row">
              <span><strong>${item.qty}x</strong> ${item.title}</span>
              <span>${formatCurrency(item.price * item.qty)}</span>
            </div>
          `).join('')}
        </div>

        <div class="order-total-row">
          <span>Forma: <strong>${order.payment.method}</strong></span>
          <span>Total: <strong>${formatCurrency(order.total)}</strong></span>
        </div>

        <div class="order-actions-bar">
          <button class="order-action-btn btn-toggle-paid ${isPaid ? 'is-paid' : ''}" onclick="togglePaidStatus('${order.id}')">
            ${isPaid ? '✓ Pago 🟢' : 'Marcar como Pago'}
          </button>

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

async function updateOrderInDatabase(orderId, updates) {
  if (isSupabaseConnected()) {
    try {
      await supabaseClient
        .from('orders')
        .update(updates)
        .eq('id', orderId);
    } catch (e) {
      console.warn('Erro ao atualizar no Supabase:', e);
    }
  }
  fetchAllOrders(true);
}

function togglePaidStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.isPaid = !order.isPaid;
  updateOrderInDatabase(orderId, { is_paid: order.isPaid });
  showToast(`Pedido #${order.id}: ${order.isPaid ? 'Marcado como Pago 🟢' : 'Marcado como Pagamento Pendente'}`);
}

function toggleDispatchStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.isDispatched = !order.isDispatched;
  if (order.isDispatched) order.isCompleted = false;
  updateOrderInDatabase(orderId, { is_dispatched: order.isDispatched, is_completed: order.isCompleted });
  showToast(`Pedido #${order.id}: ${order.isDispatched ? 'Saiu para Entrega! 🔴' : 'Retornado para preparo'}`);
}

function toggleCompleteStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.isCompleted = !order.isCompleted;
  if (order.isCompleted) order.isDispatched = false;
  updateOrderInDatabase(orderId, { is_completed: order.isCompleted, is_dispatched: order.isDispatched });
  showToast(`Pedido #${order.id}: ${order.isCompleted ? 'Concluído com sucesso! ✓' : 'Reaberto'}`);
}

async function deleteOrder(orderId) {
  if (confirm(`Tem certeza que deseja excluir o Pedido #${orderId}?`)) {
    if (isSupabaseConnected()) {
      try {
        await supabaseClient.from('orders').delete().eq('id', orderId);
      } catch (e) {
        console.warn('Erro ao excluir no Supabase:', e);
      }
    }
    orders = orders.filter(o => o.id !== orderId);
    updateAdminMetrics();
    renderAdminOrders();
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

deliveryForm.addEventListener('submit', async (e) => {
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
  const fullAddress = `${street}, ${neighborhood}${complement ? ' - ' + complement : ''}`;

  const newOrderObj = {
    id: newId,
    customer_name: name,
    customer_cpf: cpf,
    customer_phone: phone,
    customer_address: fullAddress,
    payment_method: paymentMethod,
    payment_change: change,
    notes: notes,
    items: cart,
    total: subtotal,
    is_paid: false,
    is_dispatched: false,
    is_completed: false
  };

  // Salvar no Supabase
  if (isSupabaseConnected()) {
    try {
      await supabaseClient.from('orders').insert([newOrderObj]);
      console.log('✅ Pedido salvo no Supabase!');
    } catch (err) {
      console.warn('Falha ao inserir pedido no Supabase:', err);
    }
  }

  fetchAllOrders(true);

  deliveryForm.reset();
  cart = [];
  updateCartUI();

  checkoutModalOverlay.classList.remove('open');
  showSuccessModal({
    id: newId,
    timeFormatted: 'Agora',
    customer: { name, cpf, phone, street, neighborhood, complement },
    payment: { method: paymentMethod, change },
    notes,
    items: newOrderObj.items,
    total: subtotal
  });
});

function showSuccessModal(order) {
  successOrderDetails.innerHTML = `
    <div style="margin-bottom: 8px;"><strong>Pedido #${order.id}</strong> • ${order.timeFormatted}</div>
    <div style="margin-bottom: 6px;">👤 <strong>${order.customer.name}</strong> ${order.customer.cpf ? `<br><small style="color:#666;">CPF: ${order.customer.cpf}</small>` : ''}</div>
    <div style="margin-bottom: 6px;">📱 ${order.customer.phone}</div>
    <div style="margin-bottom: 6px;">📍 ${order.customer.street} ${order.customer.neighborhood ? ', ' + order.customer.neighborhood : ''} ${order.customer.complement ? '- ' + order.customer.complement : ''}</div>
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
  msg += `📍 *Endereço:* ${lastCreatedOrder.customer.street} ${lastCreatedOrder.customer.neighborhood ? ', ' + lastCreatedOrder.customer.neighborhood : ''} ${lastCreatedOrder.customer.complement ? '- ' + lastCreatedOrder.customer.complement : ''}%0A%0A`;
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
  initDatabaseAndLoadData();
  renderProducts();
  updateCartUI();
});
