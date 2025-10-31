
function readOrdersMap(){
  try {
    return JSON.parse(localStorage.getItem('AUTOPARTS_ORDERS_BY_PHONE')||'{}');
  } catch(e){
    return {};
  }
}
function writeOrdersMap(map){
  localStorage.setItem('AUTOPARTS_ORDERS_BY_PHONE', JSON.stringify(map));
}

function fmtDate(ts){
  const d = new Date(ts);
  return d.toLocaleString('uk-UA',{
    year:'numeric',
    month:'2-digit',
    day:'2-digit',
    hour:'2-digit',
    minute:'2-digit'
  });
}

function renderOrders(phone){
  const listNode = document.getElementById('ordersList');
  const userPhoneLabel = document.getElementById('userPhoneLabel');
  userPhoneLabel.textContent = `Телефон: ${phone}`;

  const map = readOrdersMap();
  const arr = map[phone] || [];

  if(arr.length === 0){
    listNode.innerHTML = `<div class="empty">Поки що немає замовлень 😔</div>`;
    return;
  }

  listNode.innerHTML = arr.map(order => {

    const itemsHtml = order.cart.map(item=>{
      return `<div class="order-item-row">
        <div class="order-item-main">
          <div class="order-item-title">${item.name}</div>
          <div class="order-item-qty">x${item.qty}</div>
        </div>
        <div class="order-item-price">${item.price_eur} €</div>
      </div>`;
    }).join('');

    let payline = '';
    if(order.payMethod === 'card'){
      payline = `Онлайн (картка / PayPal), включно з доставкою ${order.deliveryPrice || 0} ₴`;
    } else {
      payline = `Накладений платіж (післяплата) · передоплата ${order.prepayUAH || 0} ₴`;
    }

    return `<div class="order-card">
      <div class="order-head row between align-start">
        <div>
          <div class="order-id">Замовлення #${order.orderId}</div>
          <div class="order-date">${fmtDate(order.createdAt)}</div>
        </div>
        <div class="order-status">${order.status || 'Очікує обробки'}</div>
      </div>

      <div class="order-items">${itemsHtml}</div>

      <div class="order-summary row between">
        <div class="order-paymethod">${payline}</div>
        <div class="order-total"><strong>${order.totalEUR} €</strong></div>
      </div>
    </div>`;
  }).join('');
}

function showSection(id, show){
  const node = document.getElementById(id);
  if(show){
    node.classList.remove('hidden');
  }else{
    node.classList.add('hidden');
  }
}

// минимальный апдейт мини-корзины (в хедере)
function updateMiniCartCount(){
  const cart = JSON.parse(localStorage.getItem('AUTOPARTS_CART')||'[]');
  const count = cart.reduce((sum,i)=> sum + (parseInt(i.qty)||1),0);
  const el = document.getElementById('miniCartCount');
  if(el) el.textContent = count;
}

function initAccountPage(){
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const phoneInput = document.getElementById('accPhone');

  loginBtn?.addEventListener('click', ()=>{
    const p = phoneInput.value.trim();
    if(!p){
      alert('Введіть номер телефону');
      return;
    }
    localStorage.setItem('AUTOPARTS_LAST_PHONE', p);
    renderOrders(p);
    showSection('loginSection', false);
    showSection('ordersSection', true);
  });

  logoutBtn?.addEventListener('click', ()=>{
    showSection('ordersSection', false);
    showSection('loginSection', true);
  });

  // авто-вхід з останнього номеру
  const last = localStorage.getItem('AUTOPARTS_LAST_PHONE');
  if(last){
    phoneInput.value = last;
    renderOrders(last);
    showSection('loginSection', false);
    showSection('ordersSection', true);
  }

  updateMiniCartCount();
}

document.addEventListener('DOMContentLoaded', initAccountPage);


// ---- Auto-login from URL parameter ?phone=...
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
function tryAutoLoginFromURL() {
  const p = getQueryParam('phone');
  if (!p) return false;
  const phone = decodeURIComponent(p).trim();
  if (!phone) return false;
  localStorage.setItem('AUTOPARTS_LAST_PHONE', phone);
  renderOrders(phone);
  showSection('loginSection', false);
  showSection('ordersSection', true);
  return true;
}
// try auto-login earlier than existing last-phone auto-login
document.addEventListener('DOMContentLoaded', function(){
  // if there's no last phone or URL param present, try URL param
  tryAutoLoginFromURL();
});
