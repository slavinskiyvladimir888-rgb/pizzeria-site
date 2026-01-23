// ===== КАТЕГОРІЇ =====
const CATEGORIES = [
  { id: "pizza", title: "Піца" },
  { id: "salads", title: "Салати" },
  { id: "wok", title: "WOK (Удони)" },
  { id: "nuggets", title: "Нагетси" },
  { id: "fries", title: "Картопля фрі" },
  { id: "strips", title: "Стріпси" },
  { id: "cheese", title: "Сирні кульки" },
  { id: "sets", title: "Сети" },
  { id: "soon", title: "Скоро" },
];

// ===== ПІЦИ (1 картка = 1 піца, вибір 30/40) =====
const PIZZAS = [
  { name: "Мʼясний вайб", prices: { "30": 190, "40": 345 }, hit: true },
  { name: "Гавайська", prices: { "30": 149, "40": 255 } },
  { name: "Кватро формаджо", prices: { "30": 178, "40": 320 } },
  { name: "BBQ", prices: { "30": 195, "40": 345 } },
  { name: "Діабло", prices: { "30": 215, "40": 380 }, hot: true },
  { name: "Дует", prices: { "30": 195, "40": 345 } },
  { name: "Маргарита", prices: { "30": 195, "40": 205 } },
  { name: "Мисливська", prices: { "30": 175, "40": 305 } },
  { name: "Паприка", prices: { "30": 215, "40": 385 } },
  { name: "Пепероні", prices: { "30": 155, "40": 260 } },
  { name: "Тіаро", prices: { "30": 168, "40": 299 } },
  { name: "Цезар", prices: { "30": 205, "40": 389 } },
  { name: "Чікен чіз", prices: { "30": 165, "40": 280 } },
  { name: "Токіо", prices: { "30": 198, "40": 400 }, new: true },
];

// ===== ОПЦІЇ (1 картка з вибором) =====
const NUGGETS = {
  name: "Курячі нагетси",
  options: [
    { label: "6 шт", price: 89 },
    { label: "9 шт", price: 125 },
    { label: "20 шт", price: 264 },
  ],
};

const FRIES = {
  name: "Картопля фрі",
  options: [
    { label: "90 г", price: 60 },
    { label: "120 г", price: 75 },
  ],
};
const PARTY_MIX = {
  name: "Паті мікс",
  options: [
    { label: "500 г", price: 335 },
    { label: "1 кг", price: 648 },
  ],
  desc: "стріпси + фрі + сирні кульки + гриби фрі",
};
// ===== ІНШЕ МЕНЮ =====
const ITEMS = [
  // САЛАТИ
  { cat: "salads", name: "Цезар", desc: "300 г", price: 195 },
  { cat: "salads", name: "Гарячий салат з креветкою", desc: "300 г", price: 235 },
  { cat: "salads", name: "Салат з куркою блючіз", desc: "300 г", price: 195 },

  // WOK
  { cat: "wok", name: "Удон з куркою", desc: "300 г", price: 148 },
  { cat: "wok", name: "Удон з креветкою", desc: "300 г", price: 195 },

  // СИРНІ КУЛЬКИ
  { cat: "cheese", name: "Сирні кульки", desc: "125 г", price: 89 },

  // СТРІПСИ
  { cat: "strips", name: "Курячі стріпси", desc: "120 г", price: 89 },

  // СЕТИ

  // СКОРО
  { cat: "soon", name: "Бургери", desc: "Скоро в меню", price: null },
  { cat: "soon", name: "Хот-доги", desc: "Скоро в меню", price: null },
];

// ===== КОШИК =====
const cart = new Map(); // key -> {name, price, qty}

// DOM
const tabsEl = document.getElementById("tabs");
const menuEl = document.getElementById("menu");
const sectionTitleEl = document.getElementById("sectionTitle");
const searchEl = document.getElementById("search");

const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const clearCart = document.getElementById("clearCart");
const orderBtn = document.getElementById("orderBtn");
const orderHint = document.getElementById("orderHint");
const cartFab = document.getElementById("cartFab");
const cartFabSum = document.getElementById("cartFabSum");
const cartFabBtn = document.getElementById("cartFabBtn");

// state
let activeCat = "pizza";

function money(n){ return `${n} грн`; }

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
function updateBadge(){
  let count = 0;
  for (const item of cart.values()) count += item.qty;
  cartCount.textContent = count;
  updateCartFab(); // ← ОСЬ ЦЕЙ РЯДОК
}

function updateCartFab(){
  let sum = 0;
  let count = 0;

  for(const item of cart.values()){
    sum += item.price * item.qty;
    count += item.qty;
  }

  if(cartFab && cartFabSum){
    cartFabSum.textContent = String(sum);
    if(count > 0) cartFab.classList.add("show");
    else cartFab.classList.remove("show");
  }
}

function addToCart(key, name, price){
  const existing = cart.get(key);
  if(existing) existing.qty += 1;
  else cart.set(key, { name, price, qty: 1 });
  updateBadge();
}
function updateCartFab(){
  let sum = 0;
  let count = 0;

  for(const item of cart.values()){
    sum += item.price * item.qty;
    count += item.qty;
  }
}

// ===== UI =====
function buildTabs(){
  tabsEl.innerHTML = CATEGORIES.map(c =>
    `<button class="tab ${c.id === activeCat ? "active" : ""}" data-cat="${c.id}">${c.title}</button>`
  ).join("");

  tabsEl.querySelectorAll("[data-cat]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      activeCat = btn.dataset.cat;
      buildTabs();
    renderSkeleton(6);
setTimeout(() => renderMenu(), 350);
    });
  });
}

function renderPizza(){
  const q = (searchEl.value || "").trim().toLowerCase();
  const filtered = PIZZAS.filter(p => (p.name.toLowerCase().includes(q) || !q));

  if(filtered.length === 0){
    menuEl.innerHTML = `<p class="note">Нічого не знайдено.</p>`;
    return;
  }

  menuEl.innerHTML = filtered.map(p=>{
    const name = escapeHtml(p.name);
  return `
  <div class="card">
    <img src="images/pizza.jpg" alt="Піца">
    <h3>...
  ${name}
  ${p.hit ? '<span class="badge hit">ХІТ</span>' : ''}
  ${p.hot ? '<span class="badge hot">ГОСТРА</span>' : ''}
  ${p.new ? '<span class="badge new">НОВИНКА</span>' : ''}
</h3>
 
        <p>Оберіть розмір</p>
        <div class="row" style="gap:12px;">
          <select class="select" data-pizza="${name}">
            <option value="30">30 см — ${money(p.prices["30"])}</option>
            <option value="40">40 см — ${money(p.prices["40"])}</option>
          </select>
          <button data-add-pizza="${name}">Додати</button>
        </div>
      </div>
    `;
  }).join("");

  menuEl.querySelectorAll("[data-add-pizza]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const name = btn.dataset.addPizza;
      const select = menuEl.querySelector(`select[data-pizza="${CSS.escape(name)}"]`);
      const size = select ? select.value : "30";

      const pizza = PIZZAS.find(x => x.name === name);
      const price = pizza.prices[size];

      addToCart(`pizza:${name}:${size}`, `${name} (${size} см)`, price);
    });
  });
}

function renderSingleWithOptions(item, catId){
  const q = (searchEl.value || "").trim().toLowerCase();
  if(q && !item.name.toLowerCase().includes(q)){
    menuEl.innerHTML = `<p class="note">Нічого не знайдено.</p>`;
    return;
  }

  const optionsHtml = item.options.map(o =>
    `<option value="${escapeHtml(o.label)}">${escapeHtml(o.label)} — ${money(o.price)}</option>`
  ).join("");

  menuEl.innerHTML = `
    <div class="card">
      <h3>${escapeHtml(item.name)}</h3>
      <p>Оберіть варіант</p>
      <div class="row" style="gap:12px;">
        <select class="select" id="optSelect_${catId}">
          ${optionsHtml}
        </select>
        <button id="optAdd_${catId}">Додати</button>
      </div>
    </div>
  `;

  document.getElementById(`optAdd_${catId}`).addEventListener("click", ()=>{
    const select = document.getElementById(`optSelect_${catId}`);
    const label = select.value;
    const opt = item.options.find(o => o.label === label);

    addToCart(`${catId}:${item.name}:${label}`, `${item.name} (${label})`, opt.price);
  });
}

function renderOther(){
  const q = (searchEl.value || "").trim().toLowerCase();
  const filtered = ITEMS.filter(it=>{
    if(it.cat !== activeCat) return false;
    const hay = `${it.name} ${it.desc || ""}`.toLowerCase();
    return q ? hay.includes(q) : true;
  });

  if(filtered.length === 0){
    menuEl.innerHTML = `<p class="note">Нічого не знайдено.</p>`;
    return;
  }

  menuEl.innerHTML = filtered.map(it=>{
    const disabled = it.price === null;
    return `
      <div class="card">
        <h3>${escapeHtml(it.name)}</h3>
        <p>${escapeHtml(it.desc || "")}</p>
        <div class="row">
          <span class="price">${disabled ? "Скоро" : money(it.price)}</span>
          <button ${disabled ? "disabled" : ""} data-add="${escapeHtml(it.name)}" data-price="${it.price ?? ""}">
            ${disabled ? "—" : "Додати"}
          </button>
        </div>
      </div>
    `;
  }).join("");

  menuEl.querySelectorAll("button[data-add]:not([disabled])").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const name = btn.dataset.add;
      const price = Number(btn.dataset.price);
      addToCart(`${activeCat}:${name}`, name, price);
    });
  });
}
function renderSkeleton(count = 6){
  sectionTitleEl.textContent = "Завантаження…";

  const cards = Array.from({length: count}).map(()=>`
    <div class="card">
      <div class="skeleton skel-img"></div>
      <div class="skeleton skel-line"></div>
      <div class="skeleton skel-line small"></div>
      <div class="skel-row">
        <div class="skeleton skel-pill"></div>
        <div class="skeleton skel-btn"></div>
      </div>
    </div>
  `).join("");

  menuEl.innerHTML = cards;
}

function renderMenu(){
  const catTitle = CATEGORIES.find(c => c.id === activeCat)?.title || "Меню";
  sectionTitleEl.textContent = catTitle;

if(activeCat === "pizza") return renderPizza();
if(activeCat === "nuggets") return renderSingleWithOptions(NUGGETS, "nuggets");
if(activeCat === "fries") return renderSingleWithOptions(FRIES, "fries");
if(activeCat === "sets") return renderSingleWithOptionsWithDesc(PARTY_MIX, "party");
return renderOther();
}function renderSingleWithOptionsWithDesc(item, id){
  const q = (searchEl.value || "").trim().toLowerCase();
  if(q && !item.name.toLowerCase().includes(q)){
    menuEl.innerHTML = `<p class="note">Нічого не знайдено.</p>`;
    return;
  }

  const optionsHtml = item.options.map(o =>
    `<option value="${escapeHtml(o.label)}">${escapeHtml(o.label)} — ${money(o.price)}</option>`
  ).join("");

  menuEl.innerHTML = `
    <div class="card">
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.desc || "")}</p>
      <div class="row" style="gap:12px;">
        <select class="select" id="optSelect_${id}">
          ${optionsHtml}
        </select>
        <button id="optAdd_${id}">Додати</button>
      </div>
    </div>
  `;

  document.getElementById(`optAdd_${id}`).addEventListener("click", ()=>{
    const select = document.getElementById(`optSelect_${id}`);
    const label = select.value;
    const opt = item.options.find(o => o.label === label);

    addToCart(`sets:${item.name}:${label}`, `${item.name} (${label})`, opt.price);
  });
}


// ===== КОШИК UI =====
function renderCart(){
  if(cart.size === 0){
    cartItems.innerHTML = `<p class="note">Кошик порожній. Додай позиції з меню 🙂</p>`;
    cartTotal.textContent = "0";
    return;
  }

  let sum = 0;
  const rows = [];

  for (const [key, item] of cart.entries()){
    const line = item.price * item.qty;
    sum += line;

    rows.push(`
      <div class="cart-row">
        <div>
          <b>${escapeHtml(item.name)}</b><br>
          <small style="color:#a7adbb">${money(item.price)} × ${item.qty} = ${money(line)}</small>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn-ghost" data-minus="${escapeHtml(key)}">−</button>
          <button data-plus="${escapeHtml(key)}">+</button>
        </div>
      </div>
    `);
  }

  cartItems.innerHTML = rows.join("");
  cartTotal.textContent = String(sum);

  cartItems.querySelectorAll("[data-minus]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const key = btn.dataset.minus;
      const it = cart.get(key);
      if(!it) return;
      if(it.qty <= 1) cart.delete(key);
      else it.qty -= 1;
      updateBadge();
      renderCart();
    });
  });

  cartItems.querySelectorAll("[data-plus]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const key = btn.dataset.plus;
      const it = cart.get(key);
      if(!it) return;
      it.qty += 1;
      updateBadge();
      renderCart();
    });
  });
}

function openCart(){
  orderHint.textContent = "";
  renderCart();
  modal.classList.add("show");
}
function closeCartModal(){
  modal.classList.remove("show");
}

// events
searchEl.addEventListener("input", renderMenu);

cartBtn.addEventListener("click", openCart);
closeModal.addEventListener("click", closeCartModal);
modal.addEventListener("click", (e)=>{ if(e.target === modal) closeCartModal(); });

clearCart.addEventListener("click", ()=>{
  cart.clear();
  updateBadge();
  renderCart();
});

// ===== ЗАМОВЛЕННЯ В TELEGRAM =====
orderBtn.addEventListener("click", ()=>{
  if(cart.size === 0){
    orderHint.textContent = "Кошик порожній 🙂";
    return;
  }

  let sum = 0;
  const lines = ["🍕 Замовлення:", "—"];

  for(const item of cart.values()){
    const line = item.price * item.qty;
    sum += line;
    lines.push(`${item.name} × ${item.qty} = ${line} грн`);
  }

  lines.push("—");
  lines.push(`💰 Разом: ${sum} грн`);
  lines.push("");
  lines.push("👤 Ім'я:");
  lines.push("📞 Телефон:");
  lines.push("📍 Адреса / Самовивіз:");

  const text = encodeURIComponent(lines.join("\n"));

  // TELEGRAM номер (без +)
  const phone = "380973719397";

  const tgLink = `https://t.me/${phone}?text=${text}`;
  window.open(tgLink, "_blank");
});

// ===== ІНІЦІАЛІЗАЦІЯ =====
buildTabs();
renderSkeleton(6);
updateBadge();

setTimeout(() => {
  renderMenu();
}, 500);
