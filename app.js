/**
 * RU CUCCINA - Cardápio Digital & Sistema de Pedidos
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

// Estado da Aplicação
let currentCategory = 'all';
let searchQuery = '';
let cart = [];

// Elementos DOM
const productsListEl = document.getElementById('productsList');
const categoriesContainer = document.getElementById('categoriesContainer');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const emptyStateEl = document.getElementById('emptyState');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

const cartBadge = document.getElementById('cartBadge');
const cartOpenBtn = document.getElementById('cartOpenBtn');
const cartCloseBtn = document.getElementById('cartCloseBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const toastNotification = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');

// Formatação monetária BRL
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Renderização dos Produtos
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

// Filtros de Categoria
categoriesContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.cat-pill');
  if (!btn) return;

  document.querySelectorAll('.cat-pill').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');

  currentCategory = btn.dataset.category;
  renderProducts();
});

// Busca em Tempo Real
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

// Gerenciamento do Carrinho
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

  // Atualiza Badge
  cartBadge.textContent = totalCount;
  cartBadge.classList.add('bump');
  setTimeout(() => cartBadge.classList.remove('bump'), 300);

  // Renderiza Itens do Carrinho
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

// Drawer do Carrinho
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

// Toast
let toastTimeout;
function showToast(message) {
  toastMessage.textContent = message;
  toastNotification.classList.add('show');
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastNotification.classList.remove('show');
  }, 2200);
}

// Finalizar Pedido (WhatsApp / Notificação)
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Sua sacola está vazia!');
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let orderSummary = `*RU CUCCINA - Novo Pedido*%0A%0A`;
  
  cart.forEach(item => {
    orderSummary += `• ${item.qty}x ${item.title} - ${formatCurrency(item.price * item.qty)}%0A`;
  });

  orderSummary += `%0A*Total: ${formatCurrency(subtotal)}*`;

  // Se houver número de WhatsApp do estabelecimento, pode direcionar:
  // window.open(`https://wa.me/5500000000000?text=${orderSummary}`, '_blank');
  
  alert(`Pedido pronto para envio!\n\n${decodeURIComponent(orderSummary.replace(/%0A/g, '\n').replace(/\*/g, ''))}`);
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartUI();
});
