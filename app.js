// ================= CART =================
const cart = new Map(); // key -> { name, price, qty }
const CART_KEY = "varan_cart";

// ================= DATA =================
let DATA = null;

// ================= DELIVERY =================
let DELIVERY_FEE = 100;
let FREE_DELIVERY_FROM = 700;

// ================= DOM =================
const tabsEl = document.getElementById("tabs");
const menuEl = document.getElementById("menu");
const sectionTitleEl = document.getElementById("sectionTitle");
const promosEl = document.getElementById("promos");

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

const deliveryType = document.getElementById("deliveryType");
const addrWrap = document.getElementById("addrWrap");
const deliveryCostEl = document.getElementById("deliveryCost");
const itemsSumEl = document.getElementById("itemsSum");

// Order options modal
const orderOptions = document.getElementById("orderOptions");
const closeOrderOptionsBtn = document.getElementById("closeOrderOptions");
const orderTelegram = document.getElementById("orderTelegram");
const orderViber = document.getElementById("orderViber");
const orderCopy = document.getElementById("orderCopy");
const orderOptionsHint = document.getElementById("orderOptionsHint");

// ================= STATE =================
let activeCat = "pizza";

// ================= HELPERS =================
function currency() {
  return DATA?.currency || "грн";
}
function money(n) {
  return Number.isFinite(n) ? `${n} ${currency()}` : "—";
}
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function safeImg(p) {
  return p?.image ? escapeHtml(p.image) : "images/pizza.jpg";
}
function getDeliveryCost(sum) {
  return sum >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
}

// ================= STORAGE =================
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify([...cart.entries()]));
}
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw);
    cart.clear();
    arr.forEach(([k, v]) => {
      if (v?.name && v.qty > 0 && Number.isFinite(v.price)) cart.set(k, v);
    });
  } catch (e) {
    console.warn("Cart restore failed", e);
  }
}

// ================= ORDER TEXT / OPTIONS =================
function buildOrderText() {
  const name = document.getElementById("custName")?.value?.trim() || "";
  const phone = document.getElementById("custPhone")?.value?.trim() || "";
  const addr = document.getElementById("custAddr")?.value?.trim() || "";
  const comment = document.getElementById("custComment")?.value?.trim() || "";
  const isDelivery = deliveryType?.value === "delivery";

  let itemsSum = 0;
  const lines = [];

  for (const item of cart.values()) {
    const line = item.qty * item.price;
    itemsSum += line;
    lines.push(`• ${item.name} — ${item.qty} × ${item.price} = ${line} ${currency()}`);
  }

  const delivery = isDelivery ? getDeliveryCost(itemsSum) : 0;
  const total = itemsSum + delivery;

  const parts = [];
  parts.push("🛒 Замовлення Varan");
  if (name) parts.push(`👤 Імʼя: ${name}`);
  if (phone) parts.push(`📞 Телефон: ${phone}`);
  parts.push(isDelivery ? "🚚 Доставка" : "🏠 Самовивіз");
  if (isDelivery && addr) parts.push(`📍 Адреса: ${addr}`);
  if (comment) parts.push(`📝 Коментар: ${comment}`);

  parts.push("");
  parts.push("🍽️ Позиції:");
  parts.push(...lines);

  parts.push("");
  parts.push(`💰 Сума: ${itemsSum} ${currency()}`);
  parts.push(
    isDelivery
      ? `🚚 Доставка: ${delivery === 0 ? "Безкоштовно ✅" : `${delivery} ${currency()}`}`
      : "🚚 Доставка: 0"
  );
  parts.push(`✅ Разом: ${total} ${currency()}`);

  return parts.join("\n");
}
function openOrderOptions() {
  if (!orderOptions) return;

  if (orderOptionsHint) orderOptionsHint.textContent = "";
  const text = buildOrderText();

  // Telegram через номер (username не потрібен)
  const TG_PHONE = "+380973719397";
  const tgUrl = `https://t.me/${TG_PHONE.replace("+", "")}?text=${encodeURIComponent(text)}`;

  if (orderTelegram) orderTelegram.href = tgUrl;

  orderOptions.classList.add("show");
}


function closeOrderOptions() {
  orderOptions?.classList.remove("show");
}

// ================= CART UI =================
function updateBadge() {
  let count = 0;
  let sum = 0;

  for (const item of cart.values()) {
    count += item.qty;
    sum += item.qty * item.price;
  }

  if (cartCount) cartCount.textContent = count;

  // показуємо суму в floating з валютою
  if (cartFabSum) cartFabSum.textContent = `${sum} ${currency()}`;

  if (cartFab) cartFab.classList.toggle("show", count > 0);
}

function addToCart(key, name, price) {
  if (!Number.isFinite(price)) return;

  if (cart.has(key)) cart.get(key).qty += 1;
  else cart.set(key, { name, price, qty: 1 });

  saveCart();
  updateBadge();
  if (modal?.classList.contains("show")) renderCart();
}

// ================= TABS =================
function buildTabs() {
  if (!tabsEl) return;
  const cats = DATA?.categories || [];

  tabsEl.innerHTML = cats
    .map(
      (c) => `
      <button type="button"
        class="tab ${c.id === activeCat ? "active" : ""}"
        data-cat="${escapeHtml(c.id)}">
        ${escapeHtml(c.title)}
      </button>`
    )
    .join("");

  tabsEl.querySelectorAll("[data-cat]").forEach((btn) => {
    btn.onclick = () => {
      activeCat = btn.dataset.cat;
      buildTabs();
      renderMenu();
    };
  });
}

// ================= PROMOS =================
function renderPromos() {
  if (!promosEl) return;
  const promos = DATA?.promos || [];

  promosEl.innerHTML = promos
    .map(
      (p) => `
      <div class="promo">
        <div>
          <div class="promo__title">${escapeHtml(p.title)}</div>
          <div class="promo__sub">${escapeHtml(p.desc || "")}</div>
        </div>
        ${p.image ? `<img class="promo__img" src="${escapeHtml(p.image)}">` : ""}
      </div>
    `
    )
    .join("");
}

// ================= MENU =================
function badgeHtml(badges = []) {
  const map = { hit: "ХІТ", hot: "ГОСТРА", new: "НОВИНКА" };
  return (badges || [])
    .map((b) => `<span class="badge ${escapeHtml(b)}">${escapeHtml(map[b] || "")}</span>`)
    .join("");
}

function normalizeVariants(p) {
  if (Array.isArray(p?.variants) && p.variants.length) {
    return p.variants.map((v) => ({
      key: String(v.key ?? ""),
      label: String(v.label ?? v.key ?? ""),
      price: Number(v.price),
    }));
  }
  if (Array.isArray(p?.options) && p.options.length) {
    return p.options.map((o) => ({
      key: String(o.key ?? o.label ?? ""),
      label: String(o.label ?? o.key ?? ""),
      price: Number(o.price),
    }));
  }
  return null;
}

function renderCardWithSelect(p, variants) {
  const opts = variants
    .map(
      (v) =>
        `<option value="${escapeHtml(v.key)}" data-price="${Number(v.price)}">
          ${escapeHtml(v.label)} — ${money(v.price)}
        </option>`
    )
    .join("");

  const firstPrice = Number(variants?.[0]?.price);

  return `
    <div class="card" data-prod="${escapeHtml(p.id)}">
      <img src="${safeImg(p)}" alt="${escapeHtml(p.name)}">
      <div class="card__body">
        <div class="card__title">
          ${escapeHtml(p.name)} ${badgeHtml(p.badges)}
        </div>

        ${p.desc ? `<div class="card__desc desc--weight">${escapeHtml(p.desc)}</div>` : ""}
        ${p.ingredients ? `<div class="card__ingredients">${escapeHtml(p.ingredients)}</div>` : ""}

        <select class="select" data-variant-select>
          ${opts}
        </select>

        <div class="row" style="margin-top:12px">
          <span class="price" data-variant-price>
            ${Number.isFinite(firstPrice) ? `від ${money(firstPrice)}` : ""}
          </span>
          <button type="button" data-add-variant>+ Додати</button>
        </div>
      </div>
    </div>
  `;
}

function renderSimpleCard(p) {
  const hasPrice = Number.isFinite(p.price);

  return `
    <div class="card" data-prod="${escapeHtml(p.id)}">
      <img src="${safeImg(p)}" alt="${escapeHtml(p.name)}">
      <div class="card__body">
        <div class="card__title">
          ${escapeHtml(p.name)} ${badgeHtml(p.badges)}
        </div>

        ${p.desc ? `<div class="card__desc desc--weight">${escapeHtml(p.desc)}</div>` : ""}
        ${p.ingredients ? `<div class="card__ingredients">${escapeHtml(p.ingredients)}</div>` : ""}

        <div class="row">
          <span class="price">${hasPrice ? money(p.price) : "Скоро"}</span>
          <button type="button" data-add-item ${hasPrice ? "" : "disabled"}>
            ${hasPrice ? "Додати" : "—"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function paintCardVariantPrice(card) {
  const sel = card.querySelector("[data-variant-select]");
  const priceEl = card.querySelector("[data-variant-price]");
  if (!sel || !priceEl) return;

  const opt = sel.selectedOptions?.[0];
  const pr = Number(opt?.dataset?.price);
  priceEl.textContent = Number.isFinite(pr) ? `від ${money(pr)}` : "";
}

function renderMenu() {
  if (!menuEl || !sectionTitleEl) return;

  const cats = DATA?.categories || [];
  const products = DATA?.products || [];

  const title = cats.find((c) => c.id === activeCat)?.title || "Меню";
  sectionTitleEl.textContent = title;

  const filtered = products.filter((p) => p.categoryId === activeCat);

  if (!filtered.length) {
    menuEl.innerHTML = `<p class="note">Поки що порожньо 🙂</p>`;
    return;
  }

  menuEl.innerHTML = filtered
    .map((p) => {
      const variants = normalizeVariants(p);
      if (variants) return renderCardWithSelect(p, variants);
      return renderSimpleCard(p);
    })
    .join("");

  menuEl.querySelectorAll(".card").forEach((card) => paintCardVariantPrice(card));
}

// ================= EVENTS (MENU) =================
menuEl?.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const products = DATA?.products || [];
  const id = card.getAttribute("data-prod");
  const prod = products.find((x) => x.id === id);
  if (!prod) return;

  // Add variant
  const addVar = e.target.closest("[data-add-variant]");
  if (addVar) {
    const variants = normalizeVariants(prod) || [];
    const sel = card.querySelector("[data-variant-select]");
    const key = sel?.value;
    const v = variants.find((x) => String(x.key) === String(key));
    if (!v) return;
    addToCart(`var:${id}:${v.key}`, `${prod.name} (${v.label})`, Number(v.price));
    return;
  }

  // Add simple item
  const addItem = e.target.closest("[data-add-item]");
  if (addItem) addToCart(`item:${id}`, prod.name, Number(prod.price));
});

menuEl?.addEventListener("change", (e) => {
  const sel = e.target.closest("[data-variant-select]");
  if (!sel) return;
  const card = sel.closest(".card");
  if (!card) return;
  paintCardVariantPrice(card);
});

// ================= CART MODAL =================
function renderCart() {
  if (!cartItems || !cartTotal) return;

  if (!cart.size) {
    cartItems.innerHTML = `<p class="note">Кошик порожній 🙂</p>`;
    if (itemsSumEl) itemsSumEl.textContent = money(0);
    if (deliveryCostEl) deliveryCostEl.textContent = money(0);
    cartTotal.textContent = money(0);
    return;
  }

  let itemsSum = 0;

  cartItems.innerHTML = [...cart.entries()]
    .map(([key, item]) => {
      const line = item.qty * item.price;
      itemsSum += line;

      return `
        <div class="cart-row">
          <div>
            <b>${escapeHtml(item.name)}</b><br>
            <small>${money(item.price)} × ${item.qty}</small>
          </div>
          <div>
            <button type="button" class="btn-ghost" data-minus="${escapeHtml(key)}">−</button>
            <button type="button" data-plus="${escapeHtml(key)}">+</button>
          </div>
        </div>
      `;
    })
    .join("");

  const isDelivery = deliveryType?.value === "delivery";
  const delivery = isDelivery ? getDeliveryCost(itemsSum) : 0;

  if (itemsSumEl) itemsSumEl.textContent = money(itemsSum);

  if (deliveryCostEl) {
    if (!isDelivery) deliveryCostEl.textContent = "0 грн";
    else if (itemsSum >= FREE_DELIVERY_FROM) deliveryCostEl.textContent = "Безкоштовно ✅";
    else deliveryCostEl.textContent = money(DELIVERY_FEE);
  }

  cartTotal.textContent = money(itemsSum + delivery);

  cartItems.querySelectorAll("[data-minus]").forEach((b) => {
    b.onclick = () => {
      const it = cart.get(b.dataset.minus);
      if (!it) return;
      if (it.qty <= 1) cart.delete(b.dataset.minus);
      else it.qty -= 1;

      saveCart();
      updateBadge();
      renderCart();
    };
  });

  cartItems.querySelectorAll("[data-plus]").forEach((b) => {
    b.onclick = () => {
      const it = cart.get(b.dataset.plus);
      if (!it) return;
      it.qty += 1;

      saveCart();
      updateBadge();
      renderCart();
    };
  });
}

function openCart() {
  if (orderHint) orderHint.textContent = "";
  renderCart();
  modal?.classList.add("show");
}
function closeCart() {
  modal?.classList.remove("show");
}

// Auto-open cart on cart page
if (document.body.classList.contains("page-cart")) {
  modal?.classList.add("show");
}

// ================= ORDER =================
orderBtn?.addEventListener("click", () => {
  if (!cart.size) {
    if (orderHint) orderHint.textContent = "Кошик порожній 🙂";
    return;
  }
  openOrderOptions();
});

// ================= INIT =================
async function init() {
  loadCart();

  const res = await fetch("products.json");
  DATA = await res.json();

  DELIVERY_FEE = DATA?.delivery?.fee ?? DELIVERY_FEE;
  FREE_DELIVERY_FROM = DATA?.delivery?.freeFrom ?? FREE_DELIVERY_FROM;

  activeCat = DATA?.categories?.[0]?.id || "pizza";

  buildTabs();
  renderPromos();
  renderMenu();
  updateBadge();

  // адреса видима тільки для доставки
  if (addrWrap && deliveryType) {
    addrWrap.style.display = deliveryType.value === "delivery" ? "" : "none";
  }
}

// ================= GLOBAL EVENTS =================
cartBtn?.addEventListener("click", openCart);
cartFabBtn?.addEventListener("click", openCart);
closeModal?.addEventListener("click", closeCart);

clearCart?.addEventListener("click", () => {
  cart.clear();
  saveCart();
  updateBadge();
  renderCart();
});

deliveryType?.addEventListener("change", () => {
  if (addrWrap) addrWrap.style.display = deliveryType.value === "delivery" ? "" : "none";
  renderCart();
});

// ===== ORDER OPTIONS EVENTS =====
orderViber?.addEventListener("click", async () => {
  const text = buildOrderText();

  // 1) копіюємо текст замовлення
  try {
    await navigator.clipboard.writeText(text);
    if (orderOptionsHint) {
      orderOptionsHint.textContent = "✅ Текст скопійовано. Зараз відкрию Viber — встав (Paste) і відправ.";
    }
  } catch (e) {
    if (orderOptionsHint) {
      orderOptionsHint.textContent = "⚠️ Не вдалось скопіювати автоматично. Натисни кнопку 'Скопіювати текст замовлення'.";
    }
  }

  // 2) відкриваємо Viber чат
  const VIBER_NUMBER = "+380973719397";
  const viberUrl = `viber://chat?number=${encodeURIComponent(VIBER_NUMBER)}`;
  window.location.href = viberUrl;
});
orderCopy?.addEventListener("click", async () => {
  try {
    const text = buildOrderText();
    await navigator.clipboard.writeText(text);
    if (orderOptionsHint) {
      orderOptionsHint.textContent =
        "✅ Текст скопійовано. Встав у Viber/Telegram або скажи по телефону.";
    }
  } catch (e) {
    if (orderOptionsHint) {
      orderOptionsHint.textContent =
        "⚠️ Не вдалось скопіювати. Спробуй з компʼютера або інший браузер.";
    }
  }
});

closeOrderOptionsBtn?.addEventListener("click", closeOrderOptions);

// ===== START =====
init();

// ===== MOBILE DRAWER (burger menu) =====
(() => {
  const burger = document.getElementById("burgerBtn");
  const drawer = document.getElementById("mobileDrawer");
  const close = document.getElementById("closeDrawer");
  if (!burger || !drawer || !close) return;

  const openDrawer = () => {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeDrawer = () => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  burger.addEventListener("click", openDrawer);
  close.addEventListener("click", closeDrawer);

  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) closeDrawer();
  });

  drawer.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeDrawer);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
})();
