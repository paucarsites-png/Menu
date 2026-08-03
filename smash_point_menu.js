const cart = {};
const optionMenus = {};
let currentView = 'home';
let currentCategory = null;
let currentModalProduct = null;
let IVA_RATE = 0.15;

function money(n) { return '$' + n.toFixed(2); }

function getIvaRate() {
  return MENU_DATA?.settings?.ivaRate ?? 0.15;
}

function findItem(id) {
  for (const cat of Object.values(MENU)) {
    const found = cat.items.find(i => i.id === id);
    if (found) return { ...found, parentId: found.id };
    for (const item of cat.items) {
      const option = item.options?.find(c => c.id === id);
      if (option) return { ...item, ...option, price: option.price ?? item.price, parentId: item.id };
    }
  }
}

function cartTotals() {
  let count = 0, subtotal = 0;
  for (const id in cart) {
    const qty = cart[id];
    if (qty > 0) {
      count += qty;
      subtotal += qty * findItem(id).price;
    }
  }
  const iva = subtotal * getIvaRate();
  return { count, subtotal, iva, total: subtotal + iva };
}

function setQty(id, qty) {
  cart[id] = Math.max(0, qty);
  renderStepper(id);
  const item = findItem(id);
  if (item && item.parentId !== id) renderStepper(item.parentId);
  renderCartUI();
  if (document.getElementById('drawer').classList.contains('show')) renderDrawer();
}

function renderStepper(id) {
  const el = document.getElementById('stepper-' + id);
  if (!el) return;
  const qty = cart[id] || 0;
  const item = findItem(id);
  if (!item) return;

  if (item.options) {
    const isOpen = optionMenus[id];
    const buttonText = id.startsWith('b1') ? 'Elegir sabor' : 'Elegir cola';
    el.innerHTML = `
      <button class="add-btn" onclick="event.stopPropagation(); toggleOptions('${id}')">${buttonText}</button>
      ${isOpen ? `<div class="option-picker" onclick="event.stopPropagation()">
        ${item.options.map(opt => `
          <div class="option-row">
            <span>${opt.label}</span>
            ${(cart[opt.id] || 0) === 0
              ? `<button class="option-add-btn" onclick="event.stopPropagation(); addFirst('${opt.id}')">Agregar</button>`
              : `<div class="option-stepper">
                  <button onclick="event.stopPropagation(); setQty('${opt.id}', ${(cart[opt.id] || 0) - 1})">−</button>
                  <span>${cart[opt.id]}</span>
                  <button onclick="event.stopPropagation(); setQty('${opt.id}', ${(cart[opt.id] || 0) + 1})">+</button>
                </div>`}
          </div>`).join('')}
      </div>` : ''}`;
    return;
  }

  if (qty === 0) {
    el.innerHTML = `<button class="add-btn" onclick="event.stopPropagation(); addFirst('${id}')">Agregar</button>`;
  } else {
    el.innerHTML = `
      <div class="stepper">
        <button onclick="event.stopPropagation(); setQty('${id}', ${qty - 1})">−</button>
        <div class="qty">${qty}</div>
        <button onclick="event.stopPropagation(); setQty('${id}', ${qty + 1})">+</button>
      </div>`;
  }
}

function toggleOptions(id) {
  optionMenus[id] = !optionMenus[id];
  renderStepper(id);
}

function addFirst(id) {
  setQty(id, 1);
  showToast(findItem(id).name + ' agregado ✓');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1400);
}

function renderCartUI() {
  const { count } = cartTotals();
  const badge = document.getElementById('fabBadge');
  badge.textContent = count;
  badge.dataset.count = count;
}

function renderDrawer() {
  const container = document.getElementById('drawerItems');
  const { count, subtotal, iva, total } = cartTotals();
  if (count === 0) {
    container.innerHTML = `<div class="empty-cart">Tu carrito está vacío.<br>Agrega algo delicioso 🍔</div>`;
  } else {
    container.innerHTML = Object.keys(cart)
      .filter(id => cart[id] > 0)
      .map(id => {
        const item = findItem(id);
        const qty = cart[id];
        return `
          <div class="drawer-item">
            <div>
              <div class="drawer-item-name">${item.icon || ''} ${item.name}</div>
              <div class="drawer-item-sub">${qty} × ${money(item.price)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="stepper">
                <button onclick="setQty('${id}', ${qty - 1})">−</button>
                <div class="qty">${qty}</div>
                <button onclick="setQty('${id}', ${qty + 1})">+</button>
              </div>
              <div class="drawer-item-price">${money(item.price * qty)}</div>
            </div>
          </div>`;
      }).join('');
  }
  document.getElementById('drawerSubtotal').textContent = money(subtotal);
  document.getElementById('drawerTax').textContent = money(iva);
  document.getElementById('drawerTotal').textContent = money(total);
  const ivaPct = Math.round(getIvaRate() * 100);
  document.getElementById('ivaLabel').textContent = `IVA (${ivaPct}%)`;
}

function openDrawer() {
  renderDrawer();
  document.getElementById('overlay').classList.add('show');
  document.getElementById('drawer').classList.add('show');
}

function closeDrawer() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('drawer').classList.remove('show');
}

function openProductModal(productId) {
  const item = findItem(productId);
  if (!item) return;
  currentModalProduct = productId;

  document.getElementById('modalImage').src = item.image;
  document.getElementById('modalImage').alt = item.name;
  document.getElementById('modalName').textContent = item.name;
  document.getElementById('modalDesc').textContent = item.desc || '';
  const noteEl = document.getElementById('modalNote');
  if (item.note) {
    noteEl.textContent = item.note;
    noteEl.style.display = 'block';
  } else {
    noteEl.style.display = 'none';
  }
  document.getElementById('modalPrice').textContent = money(item.price);

  const stepperEl = document.getElementById('modalStepper');
  stepperEl.innerHTML = `<div id="stepper-${productId}"></div>`;
  renderStepper(productId);

  document.getElementById('modalOverlay').classList.add('show');
  document.getElementById('productModal').classList.add('show');
}

function closeProductModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('productModal').classList.remove('show');
  currentModalProduct = null;
}

function showView(view, categoryId) {
  currentView = view;
  currentCategory = categoryId || null;

  document.getElementById('viewHome').classList.toggle('active', view === 'home');
  document.getElementById('viewCategory').classList.toggle('active', view === 'category');

  document.querySelectorAll('.cat-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.cat === categoryId);
  });

  document.querySelectorAll('.nav-item[data-nav]').forEach(n => {
    n.classList.toggle('active', n.dataset.nav === 'home' && view === 'home');
  });

  if (view === 'category' && categoryId) {
    renderCategoryView(categoryId);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCategoryView(categoryId) {
  const cat = MENU[categoryId];
  if (!cat) return;

  document.getElementById('catHeading').textContent = cat.label;

  const grid = document.getElementById('productGrid');
  grid.innerHTML = cat.items.map(item => `
    <div class="prod-card" onclick="openProductModal('${item.id}')">
      <img class="prod-card-img" src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="prod-card-body">
        <p class="prod-card-name">${item.name}</p>
        <p class="prod-card-desc">${item.desc || ''}</p>
        <button class="prod-card-btn" onclick="event.stopPropagation(); openProductModal('${item.id}')">VER DETALLES</button>
      </div>
    </div>
  `).join('');
}

function renderRecommended() {
  const grid = document.getElementById('recGrid');
  const items = MENU_DATA.recommended || [];
  grid.innerHTML = items.map(rec => {
    const isLarge = rec.size === 'large';
    const clickAction = rec.categoryId ? `showView('category','${rec.categoryId}')` : rec.productId ? `openProductModal('${rec.productId}')` : '';

    return `
      <div class="rec-card ${isLarge ? 'large' : 'small'}" ${clickAction ? `onclick="${clickAction}"` : ''}>
        <img src="${rec.image}" alt="${rec.title}" loading="lazy">
        <div class="rec-card-overlay">
          <div class="rec-card-title">${rec.title}</div>
          ${rec.subtitle ? `<div class="rec-card-sub">${rec.subtitle}</div>` : ''}
        </div>
      </div>`;
  }).join('');
}

function renderPopular() {
  const list = document.getElementById('popularList');
  const items = MENU_DATA.popular || [];
  list.innerHTML = items.map(pop => {
    const clickAction = pop.productId ? `openProductModal('${pop.productId}')` : '';
    return `
      <div class="pop-card" ${clickAction ? `onclick="${clickAction}"` : ''}>
        <img src="${pop.image}" alt="${pop.name}" loading="lazy">
        <div class="pop-card-text">
          <p class="pop-card-name">${pop.name}</p>
          ${pop.subtitle ? `<p class="pop-card-sub">${pop.subtitle}</p>` : ''}
        </div>
      </div>`;
  }).join('');
}

function renderCategoryBar() {
  const bar = document.getElementById('catBar');
  const cats = [...MENU_DATA.categories].sort((a, b) => a.order - b.order);
  bar.innerHTML = cats.map(cat => `
    <button class="cat-pill" data-cat="${cat.id}" onclick="showView('category','${cat.id}')">${cat.label}</button>
  `).join('');
}

function renderSideNav() {
  const nav = document.getElementById('sideNav');
  const cats = [...MENU_DATA.categories].sort((a, b) => a.order - b.order);
  nav.innerHTML = `
    <button class="side-nav-item" onclick="showView('home'); closeSideMenu()">
      <span class="nav-icon">🏠</span> Inicio
    </button>
    ${cats.map(cat => `
      <button class="side-nav-item" onclick="showView('category','${cat.id}'); closeSideMenu()">
        <span class="nav-icon">${cat.icon || '🍔'}</span> ${cat.label}
      </button>
    `).join('')}
  `;
}

function applySettings() {
  const s = getSettings();
  const logo = s.logo || 'assets/mascota smash point.png';

  document.getElementById('brandLogo').src = logo;
  document.getElementById('sideLogo').src = logo;
  document.getElementById('brandName').textContent = s.businessName || 'Smash Point';
  document.getElementById('locationText').textContent = s.locationName || s.businessName || 'Smash Point';
  document.title = (s.businessName || 'Smash Point') + ' — Menú';

  const infoHtml = `
    📞 Pedidos: <b>${s.phone || ''}</b><br>
    🕔 ${s.hours || ''}<br>
    📍 <b>${s.address || ''}</b>
  `;
  document.getElementById('infoBlock').innerHTML = infoHtml;
  document.getElementById('sideInfo').innerHTML = infoHtml;
}

function openSideMenu() {
  document.getElementById('sideOverlay').classList.add('show');
  document.getElementById('sideMenu').classList.add('show');
}

function closeSideMenu() {
  document.getElementById('sideOverlay').classList.remove('show');
  document.getElementById('sideMenu').classList.remove('show');
}

function buildUI() {
  applySettings();
  renderCategoryBar();
  renderRecommended();
  renderPopular();
  renderSideNav();
  showView('home');
  renderCartUI();
}

function reloadDataFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) return;
    MENU_DATA = data;
    buildMenuFromData(data);
    buildUI();
  } catch (error) {
    console.warn('No se pudieron recargar los datos del menú:', error);
  }
}

// Event listeners
document.getElementById('menuBtn').onclick = openSideMenu;
document.getElementById('sideClose').onclick = closeSideMenu;
document.getElementById('sideOverlay').onclick = closeSideMenu;
document.getElementById('navFab').onclick = openDrawer;
document.getElementById('drawerClose').onclick = closeDrawer;
document.getElementById('overlay').onclick = closeDrawer;
document.getElementById('modalClose').onclick = closeProductModal;
document.getElementById('modalOverlay').onclick = closeProductModal;
document.getElementById('checkoutBtn').onclick = () => sendOrderToWhatsApp();

document.querySelectorAll('.nav-item[data-nav]').forEach(btn => {
  btn.onclick = () => {
    if (btn.dataset.nav === 'home') showView('home');
  };
});

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) reloadDataFromStorage();
});

// Init
loadMenuData().then(data => {
  buildMenuFromData(data);
  buildUI();
});
