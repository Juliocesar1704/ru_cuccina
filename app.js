/**
 * RU CUCCINA - Sistema de Delivery & Gestão de Pedidos
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

// Dados Iniciais de Demonstração para a Proprietária (se estiver vazio)
const INITIAL_DEMO_ORDERS = [
  {
    id: '1001',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    timeFormatted: 'Há 15 min',
    customer: {
      name: 'Camila Ferreira',
      phone: '11987654321',
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
      phone: '11991234567',
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
    isDispatched: true, // 🔴 Este está em VERMELHO pois já saiu para entrega!
    isCompleted: false
  }
];

// Estado da Aplicação
let currentCategory = 'all';
let searchQuery = '';
let cart = [];
let orders = [];
let currentAdminFilter = 'all';
let lastCreatedOrder = null;

// Elementos DOM - Abas do Sistema
const tabMenuBtn = document.getElementById('tabMenuBtn');
const tabAdminBtn = document.getElementById('tabAdminBtn');
const clientMenuView = document.getElementById('clientMenuView');
const adminOrdersView = document.getElementById('adminOrdersView');
const adminPendingCounter = document.getElementById('adminPendingCounter');

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

// Elementos DOM - Checkout & Sucesso
const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutCloseBtn = document.getElementById('checkoutCloseBtn');
const deliveryForm = document.getElementById('deliveryForm');
const paymentMethodSelect = document.getElementById('paymentMethod');
const changeGroup = document.getElementById('changeGroup');
const modalTotalAmount = document.getElementById('modalTotalAmount');

const successModalOverlay = document.getElementById('successModalOverlay');
const successOrderDetails = document.getElementById('successOrderDetails');
const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
const successBackBtn = document.getElementById('successBackBtn');

// Elementos DOM - Painel da Administradora
const adminOrdersList = document.getElementById('adminOrdersList');
const adminEmptyOrders = document.getElementById('adminEmptyOrders');
const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
const metricTotalOrders = document.getElementById('metricTotalOrders');
const metricPendingOrders = document.getElementById('metricPendingOrders');
const metricPaidOrders = document.getElementById('metricPaidOrders');
const metricDispatchedOrders = document.getElementById('metricDispatchedOrders');

// Toast Notification
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

// Formatação Monetária BRL
function formatCurrency(value) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ==========================================================================
   CARREGAMENTO E PERSISTÊNCIA DE PEDIDOS
   ========================================================================== */
function loadOrders() {
  const saved = localStorage.getItem('ru_cuccina_orders');
  if (saved) {
    try {
      orders = JSON.parse(saved);
    } catch (e) {
      orders = INITIAL_DEMO_ORDERS;
    }
  } else {
    orders = INITIAL_DEMO_ORDERS;
    saveOrders();
  }
}

function saveOrders() {
  localStorage.setItem('ru_cuccina_orders', JSON.stringify(orders));
  updateAdminCounters();
  renderAdminOrders();
}

// Sincronização em tempo real entre abas
window.addEventListener('storage', (e) => {
  if (e.key === 'ru_cuccina_orders') {
    loadOrders();
    updateAdminCounters();
    renderAdminOrders();
  }
});

/* ==========================================================================
   SISTEMA DE ALTERNÂNCIA DE VISÃO (Cardápio / Painel da Gerente)
   ========================================================================== */
function switchView(viewName) {
  if (viewName === 'menu') {
    tabMenuBtn.classList.add('active');
    tabAdminBtn.classList.remove('active');
    clientMenuView.style.display = 'flex';
    adminOrdersView.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (viewName === 'admin') {
    tabAdminBtn.classList.add('active');
    tabMenuBtn.classList.remove('active');
    clientMenuView.style.display = 'none';
    adminOrdersView.style.display = 'flex';
    renderAdminOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

tabMenuBtn.addEventListener('click', () => switchView('menu'));
tabAdminBtn.addEventListener('click', () => switchView('admin'));

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
   CHECKOUT & FINALIZAÇÃO DO PEDIDO DE DELIVERY
   ========================================================================== */
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Sua sacola está vazia!');
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  modalTotalAmount.textContent = formatCurrency(subtotal);

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
    isPaid: false,          // Inicialmente não pago (o gestor pode marcar)
    isDispatched: false,    // Inicialmente não saiu para entrega
    isCompleted: false
  };

  // Adiciona ao topo dos pedidos
  orders.unshift(newOrder);
  saveOrders();
  lastCreatedOrder = newOrder;

  // Limpa formulário e carrinho
  deliveryForm.reset();
  cart = [];
  updateCartUI();

  // Fecha modal de checkout e abre modal de sucesso
  checkoutModalOverlay.classList.remove('open');
  showSuccessModal(newOrder);
});

function showSuccessModal(order) {
  successOrderDetails.innerHTML = `
    <div style="margin-bottom: 8px;"><strong>Pedido #${order.id}</strong> • ${order.timeFormatted}</div>
    <div style="margin-bottom: 6px;">👤 <strong>${order.customer.name}</strong> (${order.customer.phone})</div>
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
   PAINEL DE GESTÃO DA PROPRIETÁRIA (Métricas, Filtros e Ações de Status)
   ========================================================================== */
function updateAdminCounters() {
  const total = orders.length;
  const pending = orders.filter(o => !o.isCompleted && !o.isDispatched).length;
  const paid = orders.filter(o => o.isPaid && !o.isCompleted).length;
  const dispatched = orders.filter(o => o.isDispatched && !o.isCompleted).length;

  metricTotalOrders.textContent = total;
  metricPendingOrders.textContent = pending;
  metricPaidOrders.textContent = paid;
  metricDispatchedOrders.textContent = dispatched;

  if (pending > 0) {
    adminPendingCounter.textContent = pending;
    adminPendingCounter.style.display = 'inline-block';
  } else {
    adminPendingCounter.style.display = 'none';
  }
}

// Filtros do Painel
document.querySelectorAll('.admin-filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAdminFilter = btn.dataset.statusFilter;
    renderAdminOrders();
  });
});

refreshOrdersBtn.addEventListener('click', () => {
  loadOrders();
  renderAdminOrders();
  showToast('Painel de pedidos atualizado!');
});

function renderAdminOrders() {
  let filtered = [...orders];

  if (currentAdminFilter === 'pending') {
    filtered = filtered.filter(o => !o.isCompleted && !o.isDispatched);
  } else if (currentAdminFilter === 'paid') {
    filtered = filtered.filter(o => o.isPaid && !o.isCompleted);
  } else if (currentAdminFilter === 'dispatched') {
    // 🔴 Filtra os que saíram para entrega
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
        
        <!-- Header do Card de Pedido -->
        <div class="order-card-top">
          <div class="order-id-wrap">
            <span class="order-num">#${order.id}</span>
            <span class="order-time">${order.timeFormatted || 'Hoje'}</span>
          </div>
          
          <div class="order-badges-wrap">
            <!-- Badge de Pagamento -->
            ${isPaid 
              ? `<span class="badge-paid">🟢 Pago</span>` 
              : `<span class="badge-unpaid">🟡 Pag. Pendente</span>`}
            
            <!-- Badge de Saída para Entrega (VERMELHO) -->
            ${isDispatched 
              ? `<span class="badge-dispatched-red">🛵 SAIU P/ ENTREGA</span>` 
              : ''}

            <!-- Badge de Concluído -->
            ${order.isCompleted 
              ? `<span class="badge-completed">✓ Entregue</span>` 
              : ''}
          </div>
        </div>

        <!-- Dados do Cliente e Endereço -->
        <div class="order-customer-info">
          <div class="order-cust-name">
            👤 <strong>${order.customer.name}</strong>
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
              <span class="order-item-qty-name"><strong>${item.qty}x</strong> ${item.title}</span>
              <span class="order-item-val">${formatCurrency(item.price * item.qty)}</span>
            </div>
          `).join('')}
        </div>

        <!-- Total e Pagamento -->
        <div class="order-total-row">
          <span>Forma: <strong>${order.payment.method}</strong></span>
          <span>Total: <strong>${formatCurrency(order.total)}</strong></span>
        </div>

        <!-- Ações do Gestor de Pedidos -->
        <div class="order-actions-bar">
          <!-- Botão Marcar como Pago -->
          <button class="order-action-btn btn-toggle-paid ${isPaid ? 'is-paid' : ''}" onclick="togglePaidStatus('${order.id}')">
            ${isPaid ? '✓ Pago 🟢' : 'Marcar como Pago'}
          </button>

          <!-- Botão Marcar como Saiu para Entrega (FICA VERMELHO) -->
          <button class="order-action-btn btn-toggle-dispatch ${isDispatched ? 'is-dispatched' : ''}" onclick="toggleDispatchStatus('${order.id}')">
            ${isDispatched ? '🛵 Em Rota 🔴' : '🛵 Saiu p/ Entrega'}
          </button>
        </div>

        <div class="order-footer-actions">
          <button class="btn-complete-order" onclick="toggleCompleteStatus('${order.id}')">
            ${order.isCompleted ? 'Reabrir Pedido' : '✓ Marcar como Concluído'}
          </button>
          <button class="btn-delete-order" onclick="deleteOrder('${order.id}')">
            Excluir
          </button>
        </div>

      </div>
    `;
  }).join('');
}

// Ações de Controle da Proprietária
function togglePaidStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  order.isPaid = !order.isPaid;
  saveOrders();
  showToast(`Pedido #${order.id}: ${order.isPaid ? 'Marcado como Pago 🟢' : 'Marcado como Pendente de Pagamento'}`);
}

function toggleDispatchStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  order.isDispatched = !order.isDispatched;
  if (order.isDispatched) {
    order.isCompleted = false; // Se saiu para entrega, não está finalizado ainda
  }
  saveOrders();
  showToast(`Pedido #${order.id}: ${order.isDispatched ? 'Saiu para Entrega! 🔴' : 'Retornado para preparo'}`);
}

function toggleCompleteStatus(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  order.isCompleted = !order.isCompleted;
  if (order.isCompleted) {
    order.isDispatched = false;
  }
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
   TOAST NOTIFICATIONS
   ========================================================================== */
let toastTimeout;
function showToast(message) {
  toastMessage.textContent = message;
  toastNotification.classList.add('show');
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastNotification.classList.remove('show');
  }, 2300);
}

/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  renderProducts();
  updateCartUI();
  updateAdminCounters();
});
