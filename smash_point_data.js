const STORAGE_KEY = 'smash_point_menu_data_v1';
const DEFAULT_MENU_DATA = null;

let MENU_DATA = null;
let MENU = {};

function getSupabaseClient() {
  if (!window.__SUPABASE_CONFIG__) return null;
  if (window.__SUPABASE_CLIENT__) return window.__SUPABASE_CLIENT__;

  const { url, anonKey } = window.__SUPABASE_CONFIG__;
  if (!url || !anonKey || url.includes('TU_')) return null;

  try {
    const lib = window.supabase;
    if (!lib || typeof lib.createClient !== 'function') {
      return null;
    }

    const client = lib.createClient(url, anonKey);
    window.__SUPABASE_CLIENT__ = client;
    return client;
  } catch (error) {
    console.warn('No se pudo crear el cliente de Supabase:', error);
    return null;
  }
}

function normalizeLogoPath(path) {
  const safe = typeof path === 'string' ? path.trim() : '';
  if (!safe || safe === 'assets/logo.png' || safe.endsWith('/logo.png')) {
    return 'assets/mascota smash point.png';
  }
  return safe;
}

function normalizeMenuData(data) {
  if (!data || typeof data !== 'object') return data;
  if (!data.settings) data.settings = {};
  data.settings.logo = normalizeLogoPath(data.settings.logo || 'assets/mascota smash point.png');
  data.id = data.id || 'default';
  return data;
}

async function loadMenuData() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('menu_data').select('*').limit(1).maybeSingle();
      if (!error && data) {
        MENU_DATA = normalizeMenuData(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MENU_DATA));
        return MENU_DATA;
      }
      if (error) console.warn('Supabase no disponible, usando fallback local:', error.message);
    } catch (error) {
      console.warn('Error al cargar datos desde Supabase:', error);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      MENU_DATA = normalizeMenuData(JSON.parse(stored));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MENU_DATA));
      return MENU_DATA;
    } catch (e) {
      console.warn('Datos locales corruptos, cargando defaults.');
    }
  }

  const res = await fetch('menu-data.json');
  MENU_DATA = normalizeMenuData(await res.json());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MENU_DATA));
  return MENU_DATA;
}

async function saveMenuData(data) {
  MENU_DATA = normalizeMenuData(data);
  MENU_DATA.id = 'default';
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MENU_DATA));

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const payload = {
        id: 'default',
        settings: MENU_DATA.settings,
        categories: MENU_DATA.categories,
        products: MENU_DATA.products,
        recommended: MENU_DATA.recommended,
        popular: MENU_DATA.popular,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('menu_data').upsert(payload, { onConflict: 'id' });
      if (error) console.warn('No se pudo guardar en Supabase:', error.message);
    } catch (error) {
      console.warn('Error al sincronizar con Supabase:', error);
    }
  }

  buildMenuFromData(MENU_DATA);
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
