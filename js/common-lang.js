
const I18N = {
  ua: {
    nav_catalog: "Каталог",
    nav_delivery: "Доставка і оплата",
    nav_warranty: "Гарантія та повернення",
    nav_contact: "Контакти",
    login_btn: "Увійти",
    menu_orders: "Мої замовлення",
    menu_support: "Написати в підтримку",
    menu_lang: "Мова",
  },
  en: {
    nav_catalog: "Catalog",
    nav_delivery: "Shipping & payment",
    nav_warranty: "Warranty & returns",
    nav_contact: "Contacts",
    login_btn: "Sign in",
    menu_orders: "My orders",
    menu_support: "Support",
    menu_lang: "Language",
  }
};

function getLang() {
  return localStorage.getItem("LANG") || "ua";
}

function setLang(l) {
  localStorage.setItem("LANG", l);
}

function applyLang() {
  const lang = getLang();
  const dict = I18N[lang] || I18N.ua;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  const badge = document.getElementById("langCurrent");
  if (badge) {
    badge.textContent = lang.toUpperCase();
  }
}
document.addEventListener("DOMContentLoaded", applyLang);
