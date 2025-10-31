
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let CART = JSON.parse(localStorage.getItem('AUTOPARTS_CART')||'[]');
let currentCategory = 'suspension';
let showUAH = false;

function eurToUah(eur){ return (eur*window.EUR_TO_UAH).toFixed(2); }


function populateBrandSelect() {
  const brandSel = document.getElementById('carBrandSelect');
  if (!brandSel) return;
  brandSel.innerHTML = Object.keys(window.CAR_DATA).map(brand => {
    return `<option value="${brand}">${brand}</option>`;
  }).join('');
}

function populateModelSelect() {
  const brandSel = document.getElementById('carBrandSelect');
  const modelSel = document.getElementById('carModelSelect');
  if (!brandSel || !modelSel) return;
  const currentBrand = brandSel.value;
  const models = window.CAR_DATA[currentBrand] || [];
  modelSel.innerHTML = models.map(model => {
    return `<option value="${model}">${model}</option>`;
  }).join('');
}


function getProducts(){
  let list = (window.PRODUCTS||[]).slice();
  list = list.filter(p=>p.cat===currentCategory);

  // filter by selected car model
  const modelSel = document.getElementById('carModelSelect');
  if (modelSel && modelSel.value){
    list = list.filter(p => (p.models||[]).includes(modelSel.value));
  }

  // filter by stock only
  const stockOnlyEl = document.getElementById('stockOnly');
  if (stockOnlyEl && stockOnlyEl.checked){
    list = list.filter(p=>p.stock);
  }

  // sort
  const sortSel = document.getElementById('sortBy');
  if (sortSel){
    if (sortSel.value === 'priceAsc'){
      list.sort((a,b)=>a.price-b.price);
    } else if (sortSel.value === 'priceDesc'){
      list.sort((a,b)=>b.price-a.price);
    }
  }

  return list;
}



function renderList(){
  const wrap = $('.product-list');
  if(!wrap) return;
  wrap.innerHTML = '';

  const prods = getProducts();
  prods.forEach(p=>{
    const row = document.createElement('div');
    row.className='prod-row';

    const priceNow = showUAH ? eurToUah(p.price)+' грн' : p.price.toFixed(2)+' €';
    const priceOld = showUAH ? eurToUah(p.old)+' грн' : p.old.toFixed(2)+' €';
    const altLine  = showUAH ? (p.price.toFixed(2)+' €') : (eurToUah(p.price)+' грн орієнтовно');

    const oemText = (p.oem && p.oem.length) ? 'OE / OEM: '+p.oem.join(', ') : '';

    row.innerHTML = `
      <div class="prod-img-wrap">
        <a href="product/product.html?id=${encodeURIComponent(p.brand+'|'+p.article)}">
          <img src="img/${p.img_file}" alt="${p.brand} ${p.article}">
        </a>
      </div>

      <div class="prod-main">
        <div class="brandline">${p.brand} · ${p.article}</div>
        <div class="artline">${p.title}</div>
        <div class="compat">${p.compat}</div>
        <div class="oemline">${oemText}</div>
        <ul class="params">
          ${(p.params||[]).map(x=>`<li>${x}</li>`).join('')}
        </ul>
      </div>

      <div class="prod-buy">
        <div class="sale-badge">${p.sale||''}</div>
        <div class="price-now">${priceNow}</div>
        <div class="price-old">${priceOld}</div>
        <div class="price-alt">${altLine}</div><div class="cod-note">Накладений платіж: оплата при отриманні</div>
        <div class="stockline">${p.stock ? "В наявності ✓" : "Немає"}</div>
        <a class="add-btn" data-id="${p.brand}|${p.article}">У кошик</a>
        <div class="added-note" data-note="${p.brand}|${p.article}"></div>
      </div>
    `;
    wrap.appendChild(row);
  });
}


function renderCart(){
  const box = $('.cart-items');
  const sumBox = $('.cart-sum');
  if(!box || !sumBox) return;

  if(!CART.length){
    box.innerHTML = '<div>Кошик порожній</div>';
    sumBox.textContent = 'Разом: 0.00 €';
    return;
  }

  let totalEur = 0;
  let totalUah = 0;
  let html = '';

  CART.forEach((item,idx)=>{
    totalEur += item.price;
    totalUah += item.price*window.EUR_TO_UAH;
    const linePrice = showUAH ? eurToUah(item.price)+' грн' : item.price.toFixed(2)+' €';
    html += `
      <div class="cart-itemline">
        <div class="cart-itemtext"><strong>${item.brand} ${item.article}</strong> — ${item.title} — ${linePrice}</div>
        <button class="cart-del" data-del="${idx}">✕</button>
      </div>
    `;
  });

  box.innerHTML = html;
  sumBox.textContent = 'Разом: ' + (showUAH ? totalUah.toFixed(2)+' грн' : totalEur.toFixed(2)+' €');
}


function addToCart(id){
  // We take all products, not just current filtered list,
  // so user can change category but keep adding.
  const item = (window.PRODUCTS||[]).find(p=>(p.brand+"|"+p.article)===id);
  if(!item) return;
  CART.push(item);
  localStorage.setItem('AUTOPARTS_CART',JSON.stringify(CART));
  renderCart();
  const note = document.querySelector(`[data-note="${id}"]`);
  if(note){
    note.textContent='Додано в кошик ✓';
  }
}

function removeFromCart(idx){
  if(idx<0 || idx>=CART.length) return;
  CART.splice(idx,1);
  localStorage.setItem('AUTOPARTS_CART',JSON.stringify(CART));
  renderCart();
}


function updateCategoryLabel(){
  const map = {
    suspension:"Підвіска / Шарова / Сайлентблок",
    brake:"Гальмівні диски та колодки",
    oilfilter:"Олива / фільтри двигуна / паливні"
  };
  const lbl = $('#currentCatLabel');
  if(lbl && map[currentCategory]) lbl.textContent = map[currentCategory];
}

function attachEvents(){
  // бренд / модель залежні селекти
  const brandSel = document.getElementById('carBrandSelect');
  const modelSel = document.getElementById('carModelSelect');
  if (brandSel) {
    brandSel.addEventListener('change', ()=>{
      populateModelSelect();
      renderList();
    });
  }
  if (modelSel) {
    modelSel.addEventListener('change', ()=>{
      renderList();
    });
  }
  // category buttons
  $$('.cat-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      $$('.cat-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat');
      updateCategoryLabel();
      renderList();
    });
  });

  // add to cart (delegation)
  document.addEventListener('click', e=>{
    if(e.target.matches('.add-btn')){
      const id = e.target.getAttribute('data-id');
      addToCart(id);
    }
  });

  // sort/filter
  $('#sortBy')?.addEventListener('change', renderList);
  $('#stockOnly')?.addEventListener('change', renderList);

  // currency
  $('#uahToggle')?.addEventListener('change', ()=>{
    showUAH = $('#uahToggle').checked;
    renderList();
    renderCart();
  });

  // contact form submit (VIN request)
  const formEl = $('#orderForm');
  if(formEl){
    const okBox = $('#resp-ok');
    const errBox = $('#resp-err');
    formEl.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd = new FormData(formEl);
      fd.append('cart_json', JSON.stringify(CART));
      try{
        const resp = await fetch('backend/send.php',{method:'POST',body:fd});
        if(resp.ok){
          if(okBox){okBox.style.display='block';okBox.textContent='Запит відправлено. Ми зв\'яжемося з вами.';}
          if(errBox){errBox.style.display='none';}
          formEl.reset();
        }else{
          if(errBox){errBox.style.display='block';errBox.textContent='Помилка відправки. Спробуйте ще раз.';}
          if(okBox){okBox.style.display='none';}
        }
      }catch(err){
        if(errBox){errBox.style.display='block';errBox.textContent='Немає з\'єднання. Спробуйте пізніше.';}
        if(okBox){okBox.style.display='none';}
      }
    });
  }

  // delete from cart
  document.addEventListener('click', e=>{
    if(e.target.matches('.cart-del')){
      const idx = parseInt(e.target.getAttribute('data-del'),10);
      removeFromCart(idx);
    }
  });

}


document.addEventListener('DOMContentLoaded', ()=>{
  updateCategoryLabel();

  populateBrandSelect();
  populateModelSelect();

  renderList();
  renderCart();
  attachEvents();
});
