const AUTH_KEY = 'sp_admin_auth';
let editingType = null;
let editingId = null;

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2000);
}

function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

function showAdmin() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminApp').style.display = 'block';
  renderAll();
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminApp').style.display = 'none';
  sessionStorage.removeItem(AUTH_KEY);
}

async function checkSupabaseConnection() {
  const config = window.__SUPABASE_CONFIG__ || {};
  const isPlaceholder = !config.url || !config.anonKey || config.url.includes('TU_') || config.anonKey.includes('TU_');
  if (isPlaceholder) {
    document.getElementById('loginError').textContent = 'Supabase no está configurado. Completa URL y anon key en supabase-config.js.';
    return false;
  }
  return true;
}

async function init() {
  await loadMenuData();

  const isConfigured = await checkSupabaseConnection();
  if (!isConfigured) return;

  const client = getSupabaseClient();
  if (!client) {
    document.getElementById('loginError').textContent = 'Supabase JS no está cargado. Revisa el script en sp-gestion.html.';
    return;
  }

  const { data: { session } } = await client.auth.getSession();
  if (session) {
    sessionStorage.setItem(AUTH_KEY, '1');
    showAdmin();
  } else {
    showLogin();
  }

  const logo = normalizeLogoPath(MENU_DATA.settings?.logo || 'assets/mascota smash point.png');
  document.getElementById('loginLogo').src = logo;

  client.auth.onAuthStateChange((_event, session) => {
    if (session) {
      sessionStorage.setItem(AUTH_KEY, '1');
      showAdmin();
    } else {
      sessionStorage.removeItem(AUTH_KEY);
      showLogin();
    }
  });
}

// ── Login ──
document.getElementById('loginForm').onsubmit = async (event) => {
  event.preventDefault();

  const client = getSupabaseClient();
  if (!client) {
    document.getElementById('loginError').textContent = 'Supabase no está disponible';
    return;
  }

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    document.getElementById('loginError').textContent = 'Ingresa correo y contraseña';
    return;
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    document.getElementById('loginError').textContent = error.message || 'Error al iniciar sesión';
    return;
  }

  if (data?.user) {
    sessionStorage.setItem(AUTH_KEY, '1');
    document.getElementById('loginError').textContent = '';
    showAdmin();
  }
};

document.getElementById('logoutBtn').onclick = async () => {
  const client = getSupabaseClient();
  if (!client) return;

  const { error } = await client.auth.signOut();
  if (error) {
    showToast(error.message || 'No se pudo cerrar sesión');
    return;
  }

  sessionStorage.removeItem(AUTH_KEY);
  showLogin();
};

// ── Tabs ──
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  };
});

// ── Settings ──
function fillSettingsForm() {
  const s = MENU_DATA.settings;
  document.getElementById('s-businessName').value = s.businessName || '';
  document.getElementById('s-locationName').value = s.locationName || '';
  document.getElementById('s-phone').value = s.phone || '';
  document.getElementById('s-whatsapp').value = s.whatsapp || '';
  document.getElementById('s-hours').value = s.hours || '';
  document.getElementById('s-address').value = s.address || '';
  document.getElementById('s-tagline').value = s.tagline || '';
  document.getElementById('s-ivaRate').value = Math.round((s.ivaRate || 0.15) * 100);
  document.getElementById('s-adminPassword').value = s.adminPassword || '';
  const logo = normalizeLogoPath(s.logo || 'assets/mascota smash point.png');
  document.getElementById('s-logoPreview').src = logo;
  document.getElementById('adminLogo').src = logo;
}

document.getElementById('settingsForm').onsubmit = e => {
  e.preventDefault();
  MENU_DATA.settings = {
    ...MENU_DATA.settings,
    businessName: document.getElementById('s-businessName').value,
    locationName: document.getElementById('s-locationName').value,
    phone: document.getElementById('s-phone').value,
    whatsapp: document.getElementById('s-whatsapp').value,
    hours: document.getElementById('s-hours').value,
    address: document.getElementById('s-address').value,
    tagline: document.getElementById('s-tagline').value,
    ivaRate: parseInt(document.getElementById('s-ivaRate').value, 10) / 100,
    adminPassword: document.getElementById('s-adminPassword').value,
    logo: MENU_DATA.settings.logo
  };
  saveMenuData(MENU_DATA);
  showToast('Configuración guardada ✓');
};

document.getElementById('s-logoFile').onchange = async e => {
  const file = e.target.files[0];
  if (!file) return;
  MENU_DATA.settings.logo = await imageToDataUrl(file);
  document.getElementById('s-logoPreview').src = MENU_DATA.settings.logo;
  document.getElementById('adminLogo').src = MENU_DATA.settings.logo;
  saveMenuData(MENU_DATA);
  showToast('Logo actualizado ✓');
};

// ── Modal helpers ──
function openModal(title, bodyHtml, onSave) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modalBg').classList.add('show');
  document.getElementById('editModal').classList.add('show');
  document.getElementById('modalSave').onclick = onSave;
}

function closeModal() {
  document.getElementById('modalBg').classList.remove('show');
  document.getElementById('editModal').classList.remove('show');
  editingType = null;
  editingId = null;
}

document.getElementById('modalClose').onclick = closeModal;
document.getElementById('modalCancel').onclick = closeModal;
document.getElementById('modalBg').onclick = closeModal;

function formField(label, id, value, type = 'text', extra = '') {
  if (type === 'textarea') {
    return `<div class="form-group"><label>${label}</label><textarea id="${id}">${value || ''}</textarea></div>`;
  }
  if (type === 'select') {
    return `<div class="form-group"><label>${label}</label><select id="${id}">${extra}</select></div>`;
  }
  return `<div class="form-group"><label>${label}</label><input type="${type}" id="${id}" value="${value ?? ''}"></div>`;
}

// ── Categories CRUD ──
function renderCategories() {
  const list = document.getElementById('categoryList');
  const sorted = [...MENU_DATA.categories].sort((a, b) => a.order - b.order);
  list.innerHTML = sorted.map(cat => `
    <div class="item-card">
      <div class="item-card-info">
        <div class="item-card-name">${cat.icon || ''} ${cat.label}</div>
        <div class="item-card-meta">ID: ${cat.id} · Orden: ${cat.order}</div>
      </div>
      <div class="item-card-actions">
        <button class="btn-icon" onclick="editCategory('${cat.id}')">Editar</button>
        <button class="btn-icon danger" onclick="deleteCategory('${cat.id}')">Eliminar</button>
      </div>
    </div>
  `).join('') || '<p style="color:var(--muted)">No hay categorías.</p>';

  updateProductFilter();
}

document.getElementById('addCategoryBtn').onclick = () => {
  editingType = 'category';
  editingId = null;
  openModal('Nueva categoría', `
    ${formField('Nombre', 'f-label', '')}
    ${formField('Icono (emoji)', 'f-icon', '🍔')}
    ${formField('Orden', 'f-order', MENU_DATA.categories.length, 'number')}
  `, saveCategoryModal);
};

window.editCategory = id => {
  const cat = MENU_DATA.categories.find(c => c.id === id);
  editingType = 'category';
  editingId = id;
  openModal('Editar categoría', `
    ${formField('Nombre', 'f-label', cat.label)}
    ${formField('Icono (emoji)', 'f-icon', cat.icon)}
    ${formField('Orden', 'f-order', cat.order, 'number')}
  `, saveCategoryModal);
};

function saveCategoryModal() {
  const label = document.getElementById('f-label').value.trim();
  if (!label) return showToast('El nombre es obligatorio');
  const data = {
    label,
    icon: document.getElementById('f-icon').value,
    order: parseInt(document.getElementById('f-order').value, 10) || 0
  };
  if (editingId) {
    const cat = MENU_DATA.categories.find(c => c.id === editingId);
    Object.assign(cat, data);
  } else {
    MENU_DATA.categories.push({ id: generateId('cat'), ...data });
  }
  saveMenuData(MENU_DATA);
  closeModal();
  renderCategories();
  showToast('Categoría guardada ✓');
}

window.deleteCategory = id => {
  if (!confirm('¿Eliminar esta categoría y todos sus productos?')) return;
  MENU_DATA.categories = MENU_DATA.categories.filter(c => c.id !== id);
  MENU_DATA.products = MENU_DATA.products.filter(p => p.categoryId !== id);
  saveMenuData(MENU_DATA);
  renderCategories();
  renderProducts();
  showToast('Categoría eliminada');
};

// ── Products CRUD ──
function updateProductFilter() {
  const sel = document.getElementById('productFilter');
  const val = sel.value;
  sel.innerHTML = `<option value="">Todas las categorías</option>` +
    MENU_DATA.categories.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
  sel.value = val;
}

function renderProducts() {
  const filter = document.getElementById('productFilter').value;
  const products = filter
    ? MENU_DATA.products.filter(p => p.categoryId === filter)
    : MENU_DATA.products;

  const list = document.getElementById('productList');
  list.innerHTML = products.map(p => {
    const cat = MENU_DATA.categories.find(c => c.id === p.categoryId);
    return `
      <div class="item-card">
        ${p.image ? `<img src="${p.image}" alt="">` : ''}
        <div class="item-card-info">
          <div class="item-card-name">${p.name}</div>
          <div class="item-card-meta">${cat?.label || ''} · $${p.price?.toFixed(2)}</div>
        </div>
        <div class="item-card-actions">
          <button class="btn-icon" onclick="editProduct('${p.id}')">Editar</button>
          <button class="btn-icon danger" onclick="deleteProduct('${p.id}')">Eliminar</button>
        </div>
      </div>`;
  }).join('') || '<p style="color:var(--muted)">No hay productos.</p>';
}

document.getElementById('productFilter').onchange = renderProducts;

document.getElementById('addProductBtn').onclick = () => {
  editingType = 'product';
  editingId = null;
  const catOptions = MENU_DATA.categories.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
  openModal('Nuevo producto', `
    ${formField('Nombre', 'f-name', '')}
    ${formField('Descripción', 'f-desc', '', 'textarea')}
    ${formField('Precio', 'f-price', '0', 'number')}
    ${formField('Categoría', 'f-categoryId', '', 'select', catOptions)}
    ${formField('Nota (opcional)', 'f-note', '')}
    <div class="form-group">
      <label>Imagen</label>
      <input type="file" id="f-imageFile" accept="image/*">
      <input type="text" id="f-image" placeholder="O pegar URL de imagen" style="margin-top:6px">
    </div>
  `, saveProductModal);
};

window.editProduct = id => {
  const p = MENU_DATA.products.find(x => x.id === id);
  editingType = 'product';
  editingId = id;
  const catOptions = MENU_DATA.categories.map(c =>
    `<option value="${c.id}" ${c.id === p.categoryId ? 'selected' : ''}>${c.label}</option>`
  ).join('');
  openModal('Editar producto', `
    ${formField('Nombre', 'f-name', p.name)}
    ${formField('Descripción', 'f-desc', p.desc, 'textarea')}
    ${formField('Precio', 'f-price', p.price, 'number')}
    ${formField('Categoría', 'f-categoryId', '', 'select', catOptions)}
    ${formField('Nota (opcional)', 'f-note', p.note || '')}
    <div class="form-group">
      <label>Imagen</label>
      <input type="file" id="f-imageFile" accept="image/*">
      <input type="text" id="f-image" value="${p.image || ''}" placeholder="O pegar URL" style="margin-top:6px">
    </div>
  `, saveProductModal);
};

async function saveProductModal() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) return showToast('El nombre es obligatorio');

  let image = document.getElementById('f-image').value.trim();
  const fileInput = document.getElementById('f-imageFile');
  if (fileInput?.files[0]) {
    image = await imageToDataUrl(fileInput.files[0]);
  }

  const data = {
    name,
    desc: document.getElementById('f-desc').value,
    price: parseFloat(document.getElementById('f-price').value) || 0,
    categoryId: document.getElementById('f-categoryId').value,
    note: document.getElementById('f-note').value || undefined,
    image,
    icon: '🍔'
  };

  if (editingId) {
    const p = MENU_DATA.products.find(x => x.id === editingId);
    Object.assign(p, data);
  } else {
    MENU_DATA.products.push({ id: generateId('p'), ...data });
  }
  saveMenuData(MENU_DATA);
  closeModal();
  renderProducts();
  showToast('Producto guardado ✓');
}

window.deleteProduct = id => {
  if (!confirm('¿Eliminar este producto?')) return;
  MENU_DATA.products = MENU_DATA.products.filter(p => p.id !== id);
  saveMenuData(MENU_DATA);
  renderProducts();
  showToast('Producto eliminado');
};

// ── Recommended CRUD ──
function renderRecommended() {
  const list = document.getElementById('recList');
  list.innerHTML = (MENU_DATA.recommended || []).map(r => `
    <div class="item-card">
      ${r.image ? `<img src="${r.image}" alt="">` : ''}
      <div class="item-card-info">
        <div class="item-card-name">${r.title}</div>
        <div class="item-card-meta">${r.size === 'large' ? 'Grande' : 'Pequeña'} · ${r.subtitle || ''}</div>
      </div>
      <div class="item-card-actions">
        <button class="btn-icon" onclick="editRec('${r.id}')">Editar</button>
        <button class="btn-icon danger" onclick="deleteRec('${r.id}')">Eliminar</button>
      </div>
    </div>
  `).join('') || '<p style="color:var(--muted)">No hay tarjetas.</p>';
}

document.getElementById('addRecBtn').onclick = () => {
  editingType = 'rec';
  editingId = null;
  const catOptions = `<option value="">— Ninguna —</option>` +
    MENU_DATA.categories.map(c => `<option value="${c.id}">${c.label}</option>`).join('');
  openModal('Nueva tarjeta recomendada', `
    ${formField('Título', 'f-title', '')}
    ${formField('Subtítulo', 'f-subtitle', '')}
    ${formField('Tamaño', 'f-size', '', 'select', '<option value="large">Grande (izquierda)</option><option value="small">Pequeña</option>')}
    ${formField('Categoría vinculada', 'f-categoryId', '', 'select', catOptions)}
    <div class="form-group">
      <label>Imagen</label>
      <input type="file" id="f-imageFile" accept="image/*">
      <input type="text" id="f-image" placeholder="URL de imagen" style="margin-top:6px">
    </div>
  `, saveRecModal);
};

window.editRec = id => {
  const r = MENU_DATA.recommended.find(x => x.id === id);
  editingType = 'rec';
  editingId = id;
  const catOptions = `<option value="">— Ninguna —</option>` +
    MENU_DATA.categories.map(c => `<option value="${c.id}" ${c.id === r.categoryId ? 'selected' : ''}>${c.label}</option>`).join('');
  const sizeOptions = `<option value="large" ${r.size === 'large' ? 'selected' : ''}>Grande</option><option value="small" ${r.size === 'small' ? 'selected' : ''}>Pequeña</option>`;
  openModal('Editar tarjeta', `
    ${formField('Título', 'f-title', r.title)}
    ${formField('Subtítulo', 'f-subtitle', r.subtitle || '')}
    ${formField('Tamaño', 'f-size', '', 'select', sizeOptions)}
    ${formField('Categoría vinculada', 'f-categoryId', '', 'select', catOptions)}
    <div class="form-group">
      <label>Imagen</label>
      <input type="file" id="f-imageFile" accept="image/*">
      <input type="text" id="f-image" value="${r.image || ''}" style="margin-top:6px">
    </div>
  `, saveRecModal);
};

async function saveRecModal() {
  let image = document.getElementById('f-image')?.value?.trim() || '';
  const fileInput = document.getElementById('f-imageFile');
  if (fileInput?.files[0]) image = await imageToDataUrl(fileInput.files[0]);

  const catId = document.getElementById('f-categoryId').value;
  const data = {
    title: document.getElementById('f-title').value,
    subtitle: document.getElementById('f-subtitle').value,
    size: document.getElementById('f-size').value,
    image,
    categoryId: catId || undefined
  };

  if (editingId) {
    const r = MENU_DATA.recommended.find(x => x.id === editingId);
    Object.assign(r, data);
  } else {
    if (!MENU_DATA.recommended) MENU_DATA.recommended = [];
    MENU_DATA.recommended.push({ id: generateId('rec'), ...data });
  }
  saveMenuData(MENU_DATA);
  closeModal();
  renderRecommended();
  showToast('Tarjeta guardada ✓');
}

window.deleteRec = id => {
  if (!confirm('¿Eliminar esta tarjeta?')) return;
  MENU_DATA.recommended = MENU_DATA.recommended.filter(r => r.id !== id);
  saveMenuData(MENU_DATA);
  renderRecommended();
  showToast('Tarjeta eliminada');
};

function renderAll() {
  fillSettingsForm();
  renderCategories();
  renderProducts();
  renderRecommended();
}

init();
