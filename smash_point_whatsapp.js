// Ecuador: country code 593 + mobile number without the first 0.
const WHATSAPP_NUMBER = "593979026721";

function saleDate(){
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(new Date());
}

function sendOrderToWhatsApp(){
  const { count, total } = cartTotals();
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
    `*Comprador:* ${buyerName}`,
    `*Fecha de venta:* ${saleDate()}`,
    '',
    '*Productos:*',
    products,
    '',
    `*Precio total:* ${money(total)}`
  ].join('\n');

  const encodedMessage = encodeURIComponent(message);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
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
    setTimeout(() => {
      if(!desktopAppOpened) window.open(webLink, '_blank', 'noopener');
    }, 1500);
  }

  closeDrawer();
}
