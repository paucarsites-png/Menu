const cart = {}; // id -> qty
const optionMenus = {}; // parent product id -> is open
const IVA_RATE = 0.15;

function money(n){ return "$" + n.toFixed(2); }

function findItem(id){
  for(const cat of Object.values(MENU)){
    const found = cat.items.find(i => i.id === id);
    if(found) return { ...found, parentId: found.id };
    for(const item of cat.items){
      const option = item.options?.find(choice => choice.id === id);
      if(option) return { ...item, ...option, price: option.price ?? item.price, parentId: item.id };
    }
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
  const item = findItem(id);
  if(item && item.parentId !== id) renderStepper(item.parentId);
  if(item && cart[id] === 0 && !productHasItems(item.parentId)) collapseProduct(item.parentId);
  renderCartBar();
  if(document.getElementById('drawer').classList.contains('show')) renderDrawer();
}

function productHasItems(parentId){
  return Object.keys(cart).some(id => cart[id] > 0 && findItem(id)?.parentId === parentId);
}

function renderStepper(id){
  const el = document.getElementById('stepper-' + id);
  if(!el) return;
  const qty = cart[id] || 0;
  const item = findItem(id);
  if(item.options){
    const isOpen = optionMenus[id];
    const buttonText = id === 'b1' ? 'Elegir sabor' : 'Elegir cola';
    el.innerHTML = `
      <button class="add-btn" onclick="event.stopPropagation(); toggleOptions('${id}')">${buttonText}</button>
      ${isOpen ? `<div class="option-picker" onclick="event.stopPropagation()">
        ${item.options.map(option => `
          <div class="option-row">
            <span>${option.label}</span>
            ${(cart[option.id] || 0) === 0
              ? `<button class="option-add-btn" onclick="event.stopPropagation(); addFirst('${option.id}')">Agregar</button>`
              : `<div class="option-stepper">
                  <button onclick="event.stopPropagation(); setQty('${option.id}', ${(cart[option.id] || 0) - 1})">−</button>
                  <span>${cart[option.id]}</span>
                  <button onclick="event.stopPropagation(); setQty('${option.id}', ${(cart[option.id] || 0) + 1})">+</button>
                </div>`}
          </div>`).join('')}
      </div>` : ''}`;
    return;
  }
  if(qty === 0){
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

function toggleOptions(id){
  optionMenus[id] = !optionMenus[id];
  expandProduct(id);
  renderStepper(id);
}

function toggleProduct(id){
  const card = document.getElementById('card-' + id);
  if(card){
    const isExpanded = card.classList.toggle('is-expanded');
    card.setAttribute('aria-expanded', String(isExpanded));
    if(!isExpanded && optionMenus[id]){
      optionMenus[id] = false;
      renderStepper(id);
    }
  }
}

function expandProduct(id){
  const card = document.getElementById('card-' + id);
  if(card){
    card.classList.add('is-expanded');
    card.setAttribute('aria-expanded', 'true');
  }
}

function collapseProduct(id){
  const card = document.getElementById('card-' + id);
  if(card){
    card.classList.remove('is-expanded');
    card.setAttribute('aria-expanded', 'false');
  }
  if(optionMenus[id]){
    optionMenus[id] = false;
    renderStepper(id);
  }
}

function addFirst(id){
  setQty(id, 1);
  expandProduct(findItem(id).parentId);
  showToast(findItem(id).name + " agregado ✓");
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
        <div class="card" id="card-${item.id}" role="button" tabindex="0" aria-expanded="false" onclick="toggleProduct('${item.id}')" onkeydown="if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); toggleProduct('${item.id}'); }">
          <div class="card-icon"><img src="${item.image}" alt="${item.name}" loading="lazy"></div>
          <div class="card-body">
            <p class="card-name">${item.name}</p>
            <p class="card-hint">Toca para ver detalles</p>
            <div class="card-details"><div class="card-details-inner">
              <p class="card-desc">${item.desc}</p>
              ${item.note ? `<div class="note">${item.note}</div>` : ''}
            </div></div>
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
