const STORAGE_KEY = 'smash_point_menu_data_v1';

let MENU_DATA = null;
let MENU = {};

async function loadMenuData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      MENU_DATA = JSON.parse(stored);
      return MENU_DATA;
    } catch (e) {
      console.warn('Datos locales corruptos, cargando defaults.');
    }
  }

  const res = await fetch('menu-data.json');
  MENU_DATA = await res.json();
  return MENU_DATA;
}

function saveMenuData(data) {
  MENU_DATA = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  buildMenuFromData(data);
}

function buildMenuFromData(data) {
  MENU = {};
  const sorted = [...data.categories].sort((a, b) => a.order - b.order);
  for (const cat of sorted) {
    MENU[cat.id] = {
      label: cat.label,
      icon: cat.icon || '',
      items: data.products
        .filter(p => p.categoryId === cat.id)
        .map(p => ({
          id: p.id,
          icon: p.icon || '',
          image: p.image,
          name: p.name,
          desc: p.desc,
          price: p.price,
          note: p.note,
          options: p.options
        }))
    };
  }
}

function getSettings() {
  return MENU_DATA?.settings || {};
}

function exportMenuData() {
  const blob = new Blob([JSON.stringify(MENU_DATA, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'menu-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importMenuData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        saveMenuData(data);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function resetToDefaults() {
  localStorage.removeItem(STORAGE_KEY);
}

function imageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function generateId(prefix) {
  return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
