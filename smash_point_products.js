// Catálogo del menú: edita aquí productos, precios, imágenes y opciones.
const MENU = {
  hamburguesas: {
    label: "Hamburguesas", icon: "🍔",
    items: [
      { id:"h1", icon:"🍔", image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=160&q=80", name:"La clásica smash", desc:"Pan de papa, carne 130g, queso cheddar, cebolla caramelizada, pepinillo, salsa de la casa.", price:4.00 },
      { id:"h2", icon:"🥓", image:"https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=160&q=80", name:"Bacon smash", desc:"Pan de papa, carne 130g, cheddar, bacon, lechuga, tomate, pepinillo.", price:5.50 },
      { id:"h3", icon:"🍍", image:"https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=160&q=80", name:"Tropical brutal", desc:"Pan de papa, carne 130g, cheddar, bacon, piña, salsa de la casa.", price:6.50 },
      { id:"h4", icon:"🧀", image:"https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=160&q=80", name:"Bacon jam supreme", desc:"Pan de papa, carne, cheddar, mermelada de bacon y pepinillos.", price:6.99 },
      { id:"h5", icon:"🍔", image:"https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=160&q=80", name:"Doble smash", desc:"Pan de papa, doble carne, doble cheddar, pepinillos y salsa de la casa.", price:7.50 }
    ]
  },
  hotdog: {
    label: "Hot dog", icon: "🌭",
    items: [
      { id:"d1", icon:"🌭", image:"https://images.unsplash.com/photo-1612392062798-2d7d7a0c0c0a?auto=format&fit=crop&w=160&q=80", name:"Tropi fresh", desc:"Salchicha, papas fritas, cheddar y bacon crujiente.", price:3.99 },
      { id:"d2", icon:"🍍", image:"https://images.unsplash.com/photo-1612392062798-2d7d7a0c0c0a?auto=format&fit=crop&w=160&q=80", name:"El fresco", desc:"Salchicha, pico de gallo, bacon salteado con piña y salsa de la casa.", price:5.00 },
      { id:"d3", icon:"🌶️", image:"https://images.unsplash.com/photo-1612392062798-2d7d7a0c0c0a?auto=format&fit=crop&w=160&q=80", name:"Verano smash", desc:"Salchicha, carne asada, bacon crujiente, cheddar, salsa chipotle.", price:15.99, note:"Puedes agregar porción de papa por $1 en Extras." }
    ]
  },
  bebidas: {
    label: "Bebidas", icon: "🥤",
    items: [
      { id:"b1", icon:"🥤", image:"https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=160&q=80", name:"Batidos", desc:"Chocolate, fresa, oreo o durazno.", price:2.75, options:[
        { id:"b1-chocolate", label:"Chocolate", name:"Batido de chocolate" }, { id:"b1-fresa", label:"Fresa", name:"Batido de fresa" }, { id:"b1-oreo", label:"Oreo", name:"Batido de Oreo" }, { id:"b1-durazno", label:"Durazno", name:"Batido de durazno" }
      ] },
      { id:"b2", icon:"🥤", image:"https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=160&q=80", name:"Colas P", desc:"Sprite, Coca-Cola, Fanta o Inca.", price:0.75, options:[
        { id:"b2-sprite", label:"Sprite", name:"Sprite P" }, { id:"b2-coca-cola", label:"Coca-Cola", name:"Coca-Cola P" }, { id:"b2-fanta", label:"Fanta", name:"Fanta P" }, { id:"b2-inca", label:"Inca", name:"Inca P" }
      ] },
      { id:"b3", icon:"💧", image:"https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=160&q=80", name:"Agua", desc:"Botella de agua.", price:0.75 },
      { id:"b4", icon:"🍵", image:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=160&q=80", name:"Té", desc:"Té de jamaica.", price:1.25 }
    ]
  },
  extras: {
    label: "Extras", icon: "🍟",
    items: [
      { id:"e1", icon:"🍟", image:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=160&q=80", name:"Papa bacon cheese", desc:"Porción de papas con bacon y queso cheddar.", price:3.99 },
      { id:"e2", icon:"🌭", image:"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=160&q=80", name:"Chorizo power", desc:"Porción cargada con chorizo.", price:4.75 },
      { id:"e3", icon:"🍟", image:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=160&q=80", name:"Porción papa", desc:"Papas fritas clásicas.", price:1.00 },
      { id:"e4", icon:"🧀", image:"https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=160&q=80", name:"Queso cheddar", desc:"Extra de queso cheddar.", price:0.50 },
      { id:"e5", icon:"🥩", image:"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=160&q=80", name:"Carne", desc:"Carne extra 130g.", price:1.50 },
      { id:"e6", icon:"🥓", image:"https://images.unsplash.com/photo-1528607929212-2636ec44253e?auto=format&fit=crop&w=160&q=80", name:"Tocino", desc:"Órdenes de 50 gr.", price:1.00 }
    ]
  }
};
