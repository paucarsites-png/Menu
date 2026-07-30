const MENU = {
  hamburguesas: {
    label: "Hamburguesas",
    icon: "🍔",
    items: [
      { id:"h1", icon:"🍔", name:"La clásica smash", desc:"Pan de papa, carne 130g, queso cheddar, cebolla caramelizada, pepinillo, salsa de la casa.", price:4.00 },
      { id:"h2", icon:"🥓", name:"Bacon smash", desc:"Pan de papa, carne 130g, cheddar, bacon, lechuga, tomate, pepinillo.", price:5.50 },
      { id:"h3", icon:"🍍", name:"Tropical brutal", desc:"Pan de papa, carne 130g, cheddar, bacon, piña, salsa de la casa.", price:6.50 },
      { id:"h4", icon:"🧀", name:"Bacon jam supreme", desc:"Pan de papa, carne, cheddar, mermelada de bacon y pepinillos.", price:6.99 },
      { id:"h5", icon:"🍔", name:"Doble smash", desc:"Pan de papa, doble carne, doble cheddar, pepinillos y salsa de la casa.", price:7.50 },
    ]
  },
  hotdog: {
    label: "Hot dog",
    icon: "🌭",
    items: [
      { id:"d1", icon:"🌭", name:"Tropi fresh", desc:"Salchicha, papas fritas, cheddar y bacon crujiente.", price:3.99 },
      { id:"d2", icon:"🍍", name:"El fresco", desc:"Salchicha, pico de gallo, bacon salteado con piña y salsa de la casa.", price:5.00 },
      { id:"d3", icon:"🌶️", name:"Verano smash", desc:"Salchicha, carne asada, bacon crujiente, cheddar, salsa chipotle.", price:15.99, note:"Puedes agregar porción de papa por $1 en Extras." },
    ]
  },
  bebidas: {
    label: "Bebidas",
    icon: "🥤",
    items: [
      { id:"b1", icon:"🥤", name:"Batidos", desc:"Chocolate, fresa, oreo o durazno.", price:2.75 },
      { id:"b2", icon:"🥤", name:"Colas P", desc:"Sprite, Coca-Cola, Fanta o Inca.", price:0.75 },
      { id:"b3", icon:"💧", name:"Agua", desc:"Botella de agua.", price:0.75 },
      { id:"b4", icon:"🍵", name:"Té", desc:"Té de jamaica.", price:1.25 },
    ]
  },
  extras: {
    label: "Extras",
    icon: "🍟",
    items: [
      { id:"e1", icon:"🍟", name:"Papa bacon cheese", desc:"Porción de papas con bacon y queso cheddar.", price:3.99 },
      { id:"e2", icon:"🌭", name:"Chorizo power", desc:"Porción cargada con chorizo.", price:4.75 },
      { id:"e3", icon:"🍟", name:"Porción papa", desc:"Papas fritas clásicas.", price:1.00 },
      { id:"e4", icon:"🧀", name:"Queso cheddar", desc:"Extra de queso cheddar.", price:0.50 },
      { id:"e5", icon:"🥩", name:"Carne", desc:"Carne extra 130g.", price:1.50 },
      { id:"e6", icon:"🥓", name:"Tocino", desc:"Órdenes de 50 gr.", price:1.00 },
    ]
  }
};

const cart = {}; // id -> qty
const IVA_RATE = 0.15;
// Ecuador: country code 593 + mobile number without the first 0.
const WHATSAPP_NUMBER = "593979026721";

function money(n){ return "$" + n.toFixed(2); }

function findItem(id){
  for(const cat of Object.values(MENU)){
    const found = cat.items.find(i => i.id === id);
    if(found) return found;
  }
}

function cartTotals(){
  let count = 0, subtotal = 0;
  for(const id in cart){
    const qty = cart[id];
    if(qty > 0){
      count += qty;
      subtotal += qty * findItem(id).price;
    }
  }
  const iva = subtotal * IVA_RATE;
  return { count, subtotal, iva, total: subtotal + iva };
}

function setQty(id, qty){
  cart[id] = Math.max(0, qty);
  renderStepper(id);
  renderCartBar();
  if(document.getElementById('drawer').classList.contains('show')) renderDrawer();
}

function renderStepper(id){
  const el = document.getElementById('stepper-' + id);
  if(!el) return;
  const qty = cart[id] || 0;
  const item = findItem(id);
  if(qty === 0){
    el.innerHTML = `<button class="add-btn" onclick="addFirst('${id}')">Agregar</button>`;
  } else {
    el.innerHTML = `
      <div class="stepper">
        <button onclick="setQty('${id}', ${qty - 1})">−</button>
        <div class="qty">${qty}</div>
        <button onclick="setQty('${id}', ${qty + 1})">+</button>
      </div>`;
  }
}

function addFirst(id){
  setQty(id, 1);
  showToast(findItem(id).name + " agregado ✅");
}

function showToast(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1400);
}

function renderCartBar(){
  const { count, total } = cartTotals();
  const bar = document.getElementById('cartBar');
  document.getElementById('cartCount').textContent = count + (count === 1 ? " producto" : " productos");
  document.getElementById('cartTotal').textContent = money(total);
  bar.classList.toggle('show', count > 0);
}

function renderDrawer(){
  const container = document.getElementById('drawerItems');
  const { count, subtotal, iva, total } = cartTotals();
  if(count === 0){
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
              <div class="drawer-item-name">${item.icon} ${item.name}</div>
              <div class="drawer-item-sub">${qty} × ${money(item.price)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
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
}

function requestId(){
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('');
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(value => String(value).padStart(2, '0')).join('');
  return `SP-${date}-${time}`;
}

function saleDate(){
  return new Intl.DateTimeFormat('es-EC', { dateStyle: 'full', timeStyle: 'short' }).format(new Date());
}

function sendOrderToWhatsApp(){
  const { count, subtotal, iva, total } = cartTotals();
  const buyerName = document.getElementById('buyerName').value.trim();
  if(count === 0) return;
  if(!buyerName){
    showToast('Escribe el nombre del comprador ✍️');
    document.getElementById('buyerName').focus();
    return;
  }

  const products = Object.keys(cart)
    .filter(id => cart[id] > 0)
    .map(id => {
      const item = findItem(id);
      const qty = cart[id];
      return `• ${qty} × ${item.name} — ${money(item.price * qty)}`;
    })
    .join('\n');
  const message = [
    '🍔 *Nuevo pedido — Smash Point*',
    '',
    `*ID de solicitud:* ${requestId()}`,
    `*Comprador:* ${buyerName}`,
    `*Fecha de venta:* ${saleDate()}`,
    '',
    '*Productos:*',
    products,
    '',
    `*Precio (subtotal):* ${money(subtotal)}`,
    `*IVA (15%):* ${money(iva)}`,
    `*Precio total:* ${money(total)}`
  ].join('\n');

  const encodedMessage = encodeURIComponent(message);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  // wa.me hands the order to WhatsApp on phones. WhatsApp Desktop uses its
  // native protocol, including the recipient and prepared order message.
  const whatsappLink = isMobile
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
    : `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
  if(isMobile){
    window.open(whatsappLink, '_blank', 'noopener');
  } else {
    const webLink = `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
    let desktopAppOpened = false;
    window.addEventListener('blur', () => { desktopAppOpened = true; }, { once: true });
    window.location.href = whatsappLink;
    // If the desktop application is not installed, continue with WhatsApp Web.
    setTimeout(() => {
      if(!desktopAppOpened) window.open(webLink, '_blank', 'noopener');
    }, 1500);
  }
  closeDrawer();
}

function openDrawer(){
  renderDrawer();
  document.getElementById('overlay').classList.add('show');
  document.getElementById('drawer').classList.add('show');
}
function closeDrawer(){
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('drawer').classList.remove('show');
}

function buildUI(){
  const tabsEl = document.getElementById('tabs');
  const panelsEl = document.getElementById('panels');
  const catKeys = Object.keys(MENU);

  catKeys.forEach((key, idx) => {
    const cat = MENU[key];
    const tab = document.createElement('div');
    tab.className = 'tab' + (idx === 0 ? ' active' : '');
    tab.textContent = cat.icon + ' ' + cat.label;
    tab.onclick = () => selectTab(key);
    tab.id = 'tab-' + key;
    tabsEl.appendChild(tab);

    const panel = document.createElement('div');
    panel.className = 'panel' + (idx === 0 ? ' active' : '');
    panel.id = 'panel-' + key;
    panel.innerHTML = `<div class="panel-title">${cat.icon} ${cat.label}</div>` +
      cat.items.map(item => `
        <div class="card">
          <div class="card-icon">${item.icon}</div>
          <div class="card-body">
            <p class="card-name">${item.name}</p>
            <p class="card-desc">${item.desc}</p>
            ${item.note ? `<div class="note">${item.note}</div>` : ''}
            <div class="card-footer">
              <div class="price">${money(item.price)}</div>
              <div id="stepper-${item.id}"></div>
            </div>
          </div>
        </div>
      `).join('');
    panelsEl.appendChild(panel);
  });

  catKeys.forEach(key => MENU[key].items.forEach(item => renderStepper(item.id)));
}

function selectTab(key){
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + key).classList.add('active');
  document.getElementById('panel-' + key).classList.add('active');
}

document.getElementById('cartBar').onclick = openDrawer;
document.getElementById('drawerClose').onclick = closeDrawer;
document.getElementById('overlay').onclick = closeDrawer;
document.getElementById('checkoutBtn').onclick = () => {
  sendOrderToWhatsApp();
};

buildUI();
renderCartBar();
