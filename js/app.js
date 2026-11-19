(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const usd = (n) => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
  const toast = $('#toast');
  let tT; const showToast = (m) => { toast.textContent = m; toast.classList.add('show'); clearTimeout(tT); tT = setTimeout(() => toast.classList.remove('show'), 2600); };

  /* =========================================================
     Opening hours & time helpers
     ========================================================= */
  // [open, close] in minutes after midnight; null = closed. Index = getDay()
  const HOURS = [[8 * 60, 13 * 60], null, [7 * 60, 15 * 60], [7 * 60, 15 * 60], [7 * 60, 15 * 60], [7 * 60, 15 * 60], [7 * 60 + 30, 14 * 60]];
  const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const SAME_DAY_CUTOFF = 13 * 60;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const fmtT = (m) => { const h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am'; return `${h % 12 || 12}${mm ? ':' + String(mm).padStart(2, '0') : ''}${ap}`; };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0, 0, 0, 0); return x; };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nice = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const md = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const openNow = HOURS[now.getDay()] && mins >= HOURS[now.getDay()][0] && mins < HOURS[now.getDay()][1];

  // status pill
  (function status() {
    const el = $('#status'), t = $('#status-text');
    if (openNow) { t.textContent = `Open now · until ${fmtT(HOURS[now.getDay()][1])}`; return; }
    el.classList.add('closed');
    for (let i = 0; i < 8; i++) {
      const d = addDays(now, i), h = HOURS[d.getDay()];
      if (h && (i > 0 || mins < h[0])) { t.textContent = `Closed now · opens ${i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAY[d.getDay()]} at ${fmtT(h[0])}`; return; }
    }
  })();
  $('#hours').innerHTML = [2, 3, 4, 5, 6, 0, 1].map((i) => `<div class="${i === now.getDay() ? 'today' : ''}"><span>${DAY[i]}${i === now.getDay() ? ' (today)' : ''}</span><span>${HOURS[i] ? fmtT(HOURS[i][0]) + '–' + fmtT(HOURS[i][1]) : 'Closed'}</span></div>`).join('');

  /* ---------------- Mobile menu ---------------- */
  const menuBtn = $('#menu-btn'), nav = $('#site-nav');
  menuBtn.addEventListener('click', () => { const o = menuBtn.getAttribute('aria-expanded') !== 'true'; menuBtn.setAttribute('aria-expanded', o); nav.classList.toggle('open', o); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) { menuBtn.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); } });

  /* ---------------- Bake schedule ---------------- */
  const BAKES = [['06:45', 'Croissants & pastries', 'Butter, chocolate, almond'], ['07:30', 'Cardamom buns', 'Swirled and sugared'], ['08:00', 'Country sourdough', '48-hour ferment'],
    ['09:30', 'Seeded rye', 'Sunflower and sesame'], ['11:00', 'Focaccia', 'Friday to Sunday'], ['12:00', 'Cookies', 'Still warm at lunch']];
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const latest = openNow ? BAKES.filter((b) => toMin(b[0]) <= mins).pop() : null;
  $('#timeline').innerHTML = BAKES.map((b) => `<li class="tl${latest === b ? ' now' : ''}"><span class="t">${fmtT(toMin(b[0])).replace(/(am|pm)/, '')}</span><b>${b[1]}</b><span>${b[2]}</span>${latest === b ? '<br><span class="tag-now">Just out</span>' : ''}</li>`).join('');

  /* =========================================================
     Today's bake
     ========================================================= */
  const ALLERGENS = [['wheat', 'Wheat / gluten'], ['milk', 'Milk'], ['egg', 'Egg'], ['nuts', 'Tree nuts'], ['sesame', 'Sesame'], ['soy', 'Soy']];
  const MENU = [
    { id: 'sour', cat: 'bread', name: 'Country sourdough', price: 9, stock: 6, desc: 'Crackly crust, open crumb, 48-hour ferment.', contains: ['wheat'], vegan: true, out: '8am' },
    { id: 'rye', cat: 'bread', name: 'Seeded rye', price: 10, stock: 0, desc: 'Dense and nutty with sunflower and sesame.', contains: ['wheat', 'sesame'], vegan: true, out: '9:30am' },
    { id: 'foc', cat: 'bread', name: 'Rosemary focaccia', price: 7, stock: 11, desc: 'Olive oil, sea salt, fresh rosemary.', contains: ['wheat'], vegan: true, out: '11am' },
    { id: 'gfl', cat: 'bread', name: 'Gluten-free loaf', price: 11, stock: 3, desc: 'Buckwheat and brown rice, baked first each morning.', contains: ['egg'], gf: true, out: '7am' },
    { id: 'cro', cat: 'pastry', name: 'Butter croissant', price: 4.5, stock: 18, desc: '27 layers of cultured butter.', contains: ['wheat', 'milk', 'egg'], out: '6:45am' },
    { id: 'pac', cat: 'pastry', name: 'Pain au chocolat', price: 5, stock: 1, desc: 'Two batons of dark chocolate.', contains: ['wheat', 'milk', 'egg', 'soy'], out: '6:45am' },
    { id: 'car', cat: 'pastry', name: 'Cardamom bun', price: 5, stock: 0, desc: 'Our bestseller. Knotted, sticky, fragrant.', contains: ['wheat', 'milk', 'egg'], out: '7:30am' },
    { id: 'alm', cat: 'pastry', name: 'Almond croissant', price: 5.5, stock: 7, desc: 'Twice-baked with frangipane.', contains: ['wheat', 'milk', 'egg', 'nuts'], out: '6:45am' },
    { id: 'vcs', cat: 'pastry', name: 'Vegan cinnamon swirl', price: 5, stock: 9, desc: 'Oat milk dough, brown sugar, cinnamon.', contains: ['wheat'], vegan: true, out: '7:30am' },
    { id: 'coo', cat: 'sweet', name: 'Brown butter cookie', price: 3.5, stock: 20, desc: 'Sea salt and dark chocolate chunks.', contains: ['wheat', 'milk', 'egg'], out: '12pm' },
    { id: 'lem', cat: 'sweet', name: 'Lemon drizzle slice', price: 4.5, stock: 5, desc: 'Sharp, sticky, sunny.', contains: ['wheat', 'milk', 'egg'], out: '10am' },
    { id: 'flc', cat: 'sweet', name: 'Flourless chocolate cake', price: 5.5, stock: 4, desc: 'Rich, fudgy and naturally gluten-free.', contains: ['milk', 'egg'], gf: true, out: '10am' },
  ];
  const M = Object.fromEntries(MENU.map((m) => [m.id, m]));
  $('#allergen-filters').innerHTML = ALLERGENS.map(([k, l]) => `<label class="pill-check"><input type="checkbox" name="hide" value="${k}" /><span>${l}</span></label>`).join('');
  const filters = $('#menu-filters');
  const cart = {}; // id -> qty
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const ALG = Object.fromEntries(ALLERGENS);

  function stockBadge(m) {
    if (m.stock === 0) return '<span class="stock out">Sold out today</span>';
    if (m.stock <= 3) return `<span class="stock low">Only ${m.stock} left</span>`;
    return `<span class="stock ok">${m.stock} left</span>`;
  }
  function renderMenu() {
    const fd = new FormData(filters);
    const cat = fd.get('cat'), hide = fd.getAll('hide'), vegan = fd.get('vegan') === 'on';
    const list = MENU.filter((m) => (!cat || m.cat === cat) && !m.contains.some((a) => hide.includes(a)) && (!vegan || m.vegan));
    const n = list.length;
    $('#menu-count').innerHTML = `<span>Showing <b>${n}</b> of ${MENU.length} items${hide.length ? ` · hiding items with ${hide.map((h) => ALG[h].toLowerCase()).join(', ')}` : ''}</span>${(cat || hide.length || vegan) ? '<button type="button" class="text-btn" id="m-clear">Clear filters</button>' : ''}`;
    $('#items').innerHTML = n ? list.map((m) => {
      const inCart = cart[m.id] || 0;
      return `<li class="item${m.stock === 0 ? ' out' : ''}">
        <div class="item-top"><h3>${m.name}</h3><span class="price">${usd(m.price)}</span></div>
        <div class="badges">${m.vegan ? '<span class="b v">Vegan</span>' : ''}${m.gf ? '<span class="b gf">Gluten-free</span>' : ''}<span class="b time">Out at ${m.out}</span></div>
        <p>${m.desc}</p>
        <p class="contains"><b>Contains:</b> ${m.contains.map((c) => ALG[c].toLowerCase()).join(', ')}</p>
        <div class="item-foot">${stockBadge(m)}
          <button type="button" class="btn ${m.stock ? 'btn-crust' : 'btn-line'}" data-add="${m.id}">${m.stock ? 'Reserve' : 'Pre-order for tomorrow'}${inCart ? ` · ${inCart} in order` : ''}<span class="sr-only"> ${m.name}</span></button></div>
      </li>`;
    }).join('') : '<li class="empty"><p><b>Nothing matches those filters.</b></p><p>Try removing an allergen filter, or <button type="button" class="text-btn" data-clear>clear all filters</button>.</p></li>';
  }
  filters.addEventListener('change', renderMenu);
  $('#today').addEventListener('click', (e) => {
    if (e.target.id === 'm-clear' || e.target.closest('[data-clear]')) { filters.reset(); renderMenu(); $('#cats input').focus(); return; }
    const b = e.target.closest('[data-add]'); if (!b) return;
    const m = M[b.dataset.add];
    cart[m.id] = (cart[m.id] || 0) + 1;
    if (m.stock === 0 && order.day === iso(now)) order.day = '';
    renderMenu(); renderBagCount();
    $(`[data-add="${m.id}"]`).focus();
    showToast(m.stock ? `${m.name} reserved · open your order to choose a time` : `${m.name} pre-ordered for tomorrow`);
  });

  /* =========================================================
     Pickup order drawer
     ========================================================= */
  const dlg = $('#order');
  const order = { day: '', time: '', name: '', phone: '' };
  const renderBagCount = () => { const c = cartCount(); $('#bag-count').textContent = c; $('#bag-count').dataset.n = c; };
  const hasSoldOut = () => Object.keys(cart).some((id) => M[id].stock < cart[id]);

  function pickupDays() {
    const out = [];
    for (let i = 0; out.length < 6 && i < 10; i++) {
      const d = addDays(now, i), h = HOURS[d.getDay()];
      if (!h) continue;
      if (i === 0 && (mins >= Math.min(SAME_DAY_CUTOFF, h[1] - 30))) continue;
      out.push(d);
    }
    return out;
  }
  function slots(dayIso) {
    if (!dayIso) return [];
    const d = new Date(dayIso + 'T00:00'), h = HOURS[d.getDay()];
    const today = dayIso === iso(now);
    const res = [];
    for (let m = h[0]; m <= h[1] - 30; m += 30) if (!today || m >= mins + 30) res.push(m);
    return res;
  }

  function renderOrder(errs) {
    const ids = Object.keys(cart);
    const body = $('#order-body'), foot = $('#order-foot');
    if (!ids.length) {
      body.innerHTML = '<p style="text-align:center;padding:40px 0;color:var(--crust-2)">Your pickup order is empty.<br>Reserve something from today\'s bake.</p>';
      foot.innerHTML = '<a class="btn btn-crust btn-block" href="#today" id="go-menu">See today\'s bake</a>';
      return;
    }
    const E = errs || {};
    const todayIso = iso(now);
    const days = pickupDays();
    const lines = ids.map((id) => {
      const m = M[id], q = cart[id];
      const short = order.day === todayIso && m.stock < q;
      return `<div class="line"><div><b>${m.name}</b><br><span class="hint">${usd(m.price)} each</span></div>
        <div class="qty" role="group" aria-label="Quantity of ${m.name}"><button type="button" data-q="-1" data-id="${id}" aria-label="One fewer ${m.name}">−</button><output aria-live="polite">${q}</output><button type="button" data-q="1" data-id="${id}" aria-label="One more ${m.name}">+</button></div>
        ${short ? `<p class="warn" id="warn-${id}">${m.stock === 0 ? 'Sold out today. Choose a later day, or remove it.' : `Only ${m.stock} left today. Choose a later day, or reduce to ${m.stock}.`}</p>` : ''}</div>`;
    }).join('');
    const total = ids.reduce((s, id) => s + M[id].price * cart[id], 0);
    const sum = Object.keys(E).length ? `<div class="err-summary" role="alert" tabindex="-1" id="o-err"><b>Please fix ${Object.keys(E).length > 1 ? 'these' : 'this'}:</b><ul>${Object.entries(E).map(([k, v]) => `<li><a href="#o-${k}">${v}</a></li>`).join('')}</ul></div>` : '';
    const sl = slots(order.day);
    if (order.time && !sl.includes(+order.time)) order.time = '';
    body.innerHTML = `${sum}${lines}
      <div class="field"><label for="o-day">Pickup day</label>
        <select id="o-day" ${E.day ? 'aria-invalid="true" aria-describedby="o-day-err"' : ''}><option value="">Choose a day</option>${days.map((d) => `<option value="${iso(d)}" ${iso(d) === order.day ? 'selected' : ''}>${iso(d) === todayIso ? 'Today' : addDays(now, 1).getTime() === d.getTime() ? 'Tomorrow' : DAY[d.getDay()]}, ${md(d)}${iso(d) === todayIso && hasSoldOut() ? ' (some items sold out)' : ''}</option>`).join('')}</select>
        ${E.day ? `<p class="err" id="o-day-err">${E.day}</p>` : '<p class="hint">Closed Mondays. Same-day reservations close at 1pm.</p>'}</div>
      <div class="field"><label for="o-time">Pickup time</label>
        <select id="o-time" ${order.day ? '' : 'disabled'} ${E.time ? 'aria-invalid="true" aria-describedby="o-time-err"' : ''}><option value="">${order.day ? 'Choose a time' : 'Choose a day first'}</option>${sl.map((m) => `<option value="${m}" ${String(m) === String(order.time) ? 'selected' : ''}>${fmtT(m)}</option>`).join('')}</select>
        ${E.time ? `<p class="err" id="o-time-err">${E.time}</p>` : ''}</div>
      <div class="row2">
        <div class="field"><label for="o-name">Name for the order</label><input id="o-name" autocomplete="given-name" value="${esc(order.name)}" ${E.name ? 'aria-invalid="true" aria-describedby="o-name-err"' : ''} />${E.name ? `<p class="err" id="o-name-err">${E.name}</p>` : ''}</div>
        <div class="field"><label for="o-phone">Mobile</label><input id="o-phone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(order.phone)}" ${E.phone ? 'aria-invalid="true" aria-describedby="o-phone-err"' : ''} />${E.phone ? `<p class="err" id="o-phone-err">${E.phone}</p>` : ''}</div>
      </div>`;
    foot.innerHTML = `<p class="d-total"><span>Pay at pickup</span><span>${usd(Math.round(total * 100) / 100)}</span></p><button type="button" class="btn btn-berry btn-block" id="place">Reserve for pickup</button>`;
    if (Object.keys(E).length) setTimeout(() => $('#o-err').focus(), 0);
  }
  const keepInputs = () => { const n = $('#o-name'), p = $('#o-phone'); if (n) order.name = n.value; if (p) order.phone = p.value; };
  $('#bag-open').addEventListener('click', () => { renderOrder(); dlg.showModal(); });
  $('#order-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); if (e.target.id === 'go-menu') dlg.close(); });
  dlg.addEventListener('close', () => $('#bag-open').focus());
  dlg.addEventListener('change', (e) => {
    keepInputs();
    if (e.target.id === 'o-day') { order.day = e.target.value; order.time = ''; renderOrder(); $('#o-day').focus(); }
    if (e.target.id === 'o-time') order.time = e.target.value;
  });
  dlg.addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]');
    if (q) {
      keepInputs();
      const id = q.dataset.id; cart[id] += +q.dataset.q;
      if (cart[id] <= 0) { delete cart[id]; showToast('Removed from order'); }
      renderOrder(); renderBagCount(); renderMenu();
      const again = $(`[data-q="${q.dataset.q}"][data-id="${id}"]`, dlg); (again || $('#order-close')).focus();
      return;
    }
    if (e.target.id === 'place') {
      keepInputs();
      const E = {};
      if (!order.day) E.day = 'Choose a pickup day';
      else if (order.day === iso(now) && hasSoldOut()) E.day = 'Some items are sold out today. Pick a later day or reduce quantities';
      if (!order.time) E.time = 'Choose a pickup time';
      if (!order.name.trim()) E.name = 'Enter a name for the order';
      if (!order.phone.trim()) E.phone = 'Enter a mobile number';
      else if (order.phone.replace(/\D/g, '').length < 10) E.phone = 'Enter a 10-digit mobile number like (555) 014-8810';
      if (Object.keys(E).length) { renderOrder(E); return; }
      confirmOrder();
    }
  });

  const modal = $('#modal'), mi = $('#m-inner');
  let modalReturn = null;
  modal.addEventListener('close', () => { if (modalReturn && document.contains(modalReturn)) modalReturn.focus(); });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

  function confirmOrder() {
    const code = 'OE-' + Math.floor(1000 + Math.random() * 9000);
    const d = new Date(order.day + 'T00:00');
    const items = Object.keys(cart).map((id) => `${cart[id]} × ${M[id].name}`);
    const total = Object.keys(cart).reduce((s, id) => s + M[id].price * cart[id], 0);
    if (order.day === iso(now)) Object.keys(cart).forEach((id) => { M[id].stock -= cart[id]; });
    mi.innerHTML = `<h2 id="m-title" tabindex="-1">Reserved, ${esc(order.name.trim())}!</h2>
      <p>Show this code at the counter. Your order will be on the pickup shelf by the door.</p>
      <p class="code" aria-label="Pickup code ${code.split('').join(' ')}">${code}</p>
      <dl class="review">
        <div><dt>Pickup</dt><dd>${order.day === iso(now) ? 'Today' : DAY[d.getDay()]}, ${md(d)} at ${fmtT(+order.time)}</dd></div>
        <div><dt>Items</dt><dd>${items.join('<br>')}</dd></div>
        <div><dt>Pay at pickup</dt><dd>${usd(Math.round(total * 100) / 100)}</dd></div>
      </dl>
      <p class="hint">Demo: we'd also text this code to ${esc(order.phone)}. Nothing is actually sent.</p>
      <button type="button" class="btn btn-crust" id="m-done">Done</button>`;
    Object.keys(cart).forEach((k) => delete cart[k]);
    order.day = ''; order.time = '';
    renderBagCount(); renderMenu();
    dlg.close();
    modalReturn = $('#bag-open');
    modal.showModal();
    setTimeout(() => $('#m-title').focus(), 30);
  }
  mi.addEventListener('click', (e) => { if (e.target.id === 'm-done') modal.close(); });

  /* =========================================================
     Cake builder
     ========================================================= */
  const SIZES = [{ id: 's6', name: '6-inch', sub: 'Serves 8–10', price: 48, w: 170, tiers: 1 }, { id: 's8', name: '8-inch', sub: 'Serves 14–18', price: 68, w: 220, tiers: 1 },
    { id: 't2', name: 'Two-tier', sub: 'Serves 30–35', price: 140, w: 220, tiers: 2 }];
  const SPONGES = [{ id: 'van', name: 'Vanilla bean', c: '#f1dca6', add: 0 }, { id: 'cho', name: 'Chocolate', c: '#6b3e26', add: 0 }, { id: 'lem', name: 'Lemon', c: '#f3dd6b', add: 0 },
    { id: 'car', name: 'Carrot & spice', c: '#c9874a', add: 4 }, { id: 'gfc', name: 'Gluten-free chocolate', c: '#55301d', add: 8 }];
  const FROSTS = [{ id: 'vb', name: 'Vanilla buttercream', c: '#fff6e6', add: 0 }, { id: 'ga', name: 'Chocolate ganache', c: '#4a2a1a', add: 6 },
    { id: 'st', name: 'Strawberry', c: '#f2b3c0', add: 0 }, { id: 'cc', name: 'Cream cheese', c: '#fbefd6', add: 4 }];
  const DECOS = [{ id: 'none', name: 'Simple & smooth', add: 0 }, { id: 'spr', name: 'Sprinkles', add: 0 }, { id: 'ber', name: 'Fresh berries', add: 8 }, { id: 'flo', name: 'Pressed flowers', add: 12 }];
  const GROUPS = { size: SIZES, sponge: SPONGES, frost: FROSTS, deco: DECOS };
  const opt = (name, o, i) => `<label class="opt"><input type="radio" name="${name}" value="${o.id}" ${i === 0 ? 'checked' : ''} /><span>${o.c ? `<i class="sw" style="background:${o.c}" aria-hidden="true"></i>` : ''}<span class="txt"><b>${o.name}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</span><span class="add">${o.price ? '$' + o.price : o.add ? '+$' + o.add : 'Included'}</span><span class="tick" aria-hidden="true"></span></span></label>`;
  $('#o-size').innerHTML = SIZES.map((o, i) => opt('size', o, i)).join('');
  $('#o-sponge').innerHTML = SPONGES.map((o, i) => opt('sponge', o, i)).join('');
  $('#o-frost').innerHTML = FROSTS.map((o, i) => opt('frost', o, i)).join('');
  $('#o-deco').innerHTML = DECOS.map((o, i) => opt('deco', o, i)).join('');

  // earliest date: 3 days' notice, never a Monday
  const LEAD = 3;
  let earliest = addDays(now, LEAD); while (earliest.getDay() === 1) earliest = addDays(earliest, 1);
  const dateIn = $('#c-date');
  dateIn.min = iso(earliest); dateIn.max = iso(addDays(now, 90));
  $('#c-date-hint').textContent = `Earliest: ${nice(earliest)}. We're closed on Mondays.`;

  const cakeForm = $('#cake-form');
  const pick = () => { const fd = new FormData(cakeForm); return { size: SIZES.find((x) => x.id === fd.get('size')), sponge: SPONGES.find((x) => x.id === fd.get('sponge')), frost: FROSTS.find((x) => x.id === fd.get('frost')), deco: DECOS.find((x) => x.id === fd.get('deco')), msg: (fd.get('msg') || '').trim(), date: fd.get('date') }; };
  const priceOf = (c) => c.size.price + c.sponge.add + c.frost.add + c.deco.add;

  function tierSVG(cx, bottom, w, h, c, k) {
    const rx = w / 2, ry = Math.max(10, w * 0.09), top = bottom - h;
    const layers = 3, band = h / (layers * 2 - 1);
    let s = `<path d="M${cx - rx} ${top} V${bottom} A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom} V${top} Z" fill="${c.frost.c}" opacity=".55"/>`;
    for (let i = 0; i < layers * 2 - 1; i++) {
      const y = top + i * band, fill = i % 2 === 0 ? c.sponge.c : c.frost.c;
      s += `<path d="M${cx - rx + 3} ${y} V${y + band} A${rx - 3} ${ry} 0 0 0 ${cx + rx - 3} ${y + band} V${y} A${rx - 3} ${ry} 0 0 1 ${cx - rx + 3} ${y} Z" fill="${fill}"/>`;
    }
    // top frosting + drips
    let drips = '';
    for (let i = 0; i < 9; i++) { const x = cx - rx + 10 + i * ((w - 20) / 8), len = 8 + ((i * 7 + k * 3) % 5) * 5; drips += `<path d="M${x - 6} ${top} q0 ${len} 6 ${len} q6 0 6 -${len} Z" fill="${c.frost.c}"/>`; }
    s += drips + `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${c.frost.c}" stroke="rgba(58,36,23,.12)"/>`;
    // decorations on top
    if (c.deco.id === 'spr') for (let i = 0; i < 22; i++) { const a = i * 2.4, r = (i % 5 + 1) / 6 * (rx - 12); s += `<rect x="${cx + Math.cos(a) * r}" y="${top + Math.sin(a) * r * (ry / rx)}" width="7" height="2.5" rx="1.2" transform="rotate(${i * 37} ${cx + Math.cos(a) * r} ${top + Math.sin(a) * r * (ry / rx)})" fill="${['#e36b4f', '#f2c14e', '#6fa3c7', '#9b2f45', '#7fb07a'][i % 5]}"/>`; }
    if (c.deco.id === 'ber') for (let i = 0; i < 9; i++) { const a = i * 0.7 - 2.6, r = rx * 0.55; s += `<circle cx="${cx + Math.cos(a) * r}" cy="${top + Math.sin(a) * r * (ry / rx) - 4}" r="${i % 3 ? 6 : 8}" fill="${i % 3 ? '#3d4f8f' : '#b3263c'}"/>`; }
    if (c.deco.id === 'flo') for (let i = 0; i < 5; i++) { const fx = cx - rx * 0.5 + i * rx * 0.25, fy = top - 2 + (i % 2) * 5; for (let p = 0; p < 5; p++) { const a = p * 1.256; s += `<circle cx="${fx + Math.cos(a) * 5}" cy="${fy + Math.sin(a) * 4}" r="4" fill="${['#f4a7b9', '#f6d365', '#b8a1e3', '#f4a7b9', '#ffffff'][i]}"/>`; } s += `<circle cx="${fx}" cy="${fy}" r="2.5" fill="#e3a43a"/>`; }
    return s;
  }
  function renderCake() {
    const c = pick();
    let g = `<ellipse cx="180" cy="268" rx="${c.size.w / 2 + 34}" ry="22" fill="#e8d6bb"/><ellipse cx="180" cy="264" rx="${c.size.w / 2 + 30}" ry="19" fill="#fffdf9" stroke="#eadcc6"/>`;
    if (c.size.tiers === 2) { g += tierSVG(180, 258, 220, 92, c, 1) + tierSVG(180, 166, 140, 74, c, 2); }
    else { g += tierSVG(180, 258, c.size.w, c.size.id === 's6' ? 110 : 124, c, 1); }
    if (c.msg) g += `<text x="180" y="305" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="20" fill="#3a2417">${esc(c.msg)}</text>`;
    $('#cake-svg').innerHTML = `<desc id="cake-desc">${c.size.name} ${c.sponge.name} cake with ${c.frost.name.toLowerCase()}, ${c.deco.name.toLowerCase()}${c.msg ? `, message: ${esc(c.msg)}` : ''}</desc>` + g;
    const p = priceOf(c);
    $('#p-price').textContent = '$' + p;
    $('#p-sub').textContent = `${c.size.name} · ${c.size.sub.toLowerCase()}`;
    $('#cake-lines').innerHTML = [[`${c.size.name} cake`, '$' + c.size.price], [c.sponge.name, c.sponge.add ? '+$' + c.sponge.add : 'Included'], [c.frost.name, c.frost.add ? '+$' + c.frost.add : 'Included'], [c.deco.name, c.deco.add ? '+$' + c.deco.add : 'Included']]
      .map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('') + `<dt class="tot">Total</dt><dd class="tot">$${p}</dd>`;
    $('#c-msg-left').textContent = 24 - (cakeForm.msg.value || '').length;
  }
  cakeForm.addEventListener('input', renderCake);
  cakeForm.addEventListener('change', (e) => { if (e.target === dateIn) validateDate(); renderCake(); });

  function validateDate() {
    const v = dateIn.value, err = $('#c-date-err');
    let msg = '';
    if (!v) msg = 'Choose a collection date';
    else {
      const d = new Date(v + 'T00:00');
      if (d < earliest) msg = `We need three days' notice. The earliest is ${nice(earliest)}`;
      else if (d.getDay() === 1) msg = "We're closed on Mondays. Choose another day";
      else if (d > addDays(now, 90)) msg = 'We take cake orders up to 90 days ahead';
    }
    err.hidden = !msg; err.textContent = msg; err.id = 'c-date-err';
    if (msg) { dateIn.setAttribute('aria-invalid', 'true'); dateIn.setAttribute('aria-describedby', 'c-date-hint c-date-err'); }
    else { dateIn.removeAttribute('aria-invalid'); dateIn.setAttribute('aria-describedby', 'c-date-hint'); }
    return !msg;
  }

  cakeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateDate()) { dateIn.focus(); return; }
    openCakeRequest(pick());
  });

  function openCakeRequest(c, errs, vals) {
    const E = errs || {}, V = vals || { name: '', email: '', notes: '' };
    const d = new Date(c.date + 'T00:00');
    mi.innerHTML = `<h2 id="m-title" tabindex="-1">Request your cake</h2>
      <dl class="review">
        <div><dt>Cake</dt><dd>${c.size.name}, ${c.sponge.name}, ${c.frost.name}, ${c.deco.name}</dd></div>
        ${c.msg ? `<div><dt>Message</dt><dd>"${esc(c.msg)}"</dd></div>` : ''}
        <div><dt>Collect</dt><dd>${DAY[d.getDay()]}, ${md(d)}</dd></div>
        <div><dt>Price</dt><dd>$${priceOf(c)}, paid at collection</dd></div>
      </dl>
      ${Object.keys(E).length ? `<div class="err-summary" role="alert" tabindex="-1" id="r-err"><b>Please fix ${Object.keys(E).length > 1 ? 'these' : 'this'}:</b><ul>${Object.entries(E).map(([k, v]) => `<li><a href="#r-${k}">${v}</a></li>`).join('')}</ul></div>` : ''}
      <form class="cake-form" id="req-form" novalidate style="gap:14px">
        <div class="field"><label for="r-name">Your name</label><input id="r-name" autocomplete="name" value="${esc(V.name)}" ${E.name ? 'aria-invalid="true" aria-describedby="r-name-err"' : ''} />${E.name ? `<p class="err" id="r-name-err">${E.name}</p>` : ''}</div>
        <div class="field"><label for="r-email">Email</label><input id="r-email" type="email" autocomplete="email" value="${esc(V.email)}" ${E.email ? 'aria-invalid="true" aria-describedby="r-email-err"' : ''} />${E.email ? `<p class="err" id="r-email-err">${E.email}</p>` : ''}</div>
        <div class="field"><label for="r-notes">Allergies or special requests (optional)</label><textarea id="r-notes" placeholder="For example: one guest has a nut allergy">${esc(V.notes)}</textarea></div>
        <button class="btn btn-berry" type="submit">Send request</button>
      </form>`;
    if (!modal.open) { modalReturn = cakeForm.querySelector('button[type=submit]'); modal.showModal(); }
    setTimeout(() => (Object.keys(E).length ? $('#r-err') : $('#r-name')).focus(), 30);
    $('#req-form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      const v = { name: $('#r-name').value.trim(), email: $('#r-email').value.trim(), notes: $('#r-notes').value.trim() };
      const er = {};
      if (!v.name) er.name = 'Enter your name';
      if (!v.email) er.email = 'Enter your email address';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) er.email = 'Enter an email address like name@example.com';
      if (Object.keys(er).length) { openCakeRequest(c, er, v); return; }
      mi.innerHTML = `<h2 id="m-title" tabindex="-1">Request sent!</h2>
        <p>Thanks, ${esc(v.name)}. We'll confirm your ${c.size.name.toLowerCase()} ${c.sponge.name.toLowerCase()} cake by email within one working day.</p>
        <dl class="review"><div><dt>Collect</dt><dd>${DAY[d.getDay()]}, ${md(d)}</dd></div><div><dt>Total</dt><dd>$${priceOf(c)}</dd></div></dl>
        <p class="hint">Demo: nothing is actually sent.</p>
        <button type="button" class="btn btn-crust" id="m-done">Done</button>`;
      setTimeout(() => $('#m-title').focus(), 30);
    });
  }

  // If the hero photo/illustration is missing, draw a simple loaf instead of a broken image
  const heroImg = $('#hero-img');
  const loaf = () => {
    const svg = `<svg viewBox="0 0 400 400" role="img" aria-label="Illustration of a sourdough loaf and a croissant" style="width:100%;height:auto;border-radius:48% 48% 28px 28px / 36% 36% 28px 28px;background:#f4ead8">
      <circle cx="300" cy="90" r="46" fill="#f2c14e" opacity=".7"/>
      <ellipse cx="200" cy="300" rx="150" ry="22" fill="#e8d6bb"/>
      <path d="M70 280c0-80 60-140 130-140s130 60 130 140z" fill="#b8763f"/>
      <path d="M95 270c10-60 50-105 105-110M130 272c8-45 35-80 75-88M300 272c-10-55-45-95-95-104" stroke="#f1dca6" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M248 300c10-30 50-40 80-28-10-14-2-30 18-28-10-16 6-30 26-18-2 30-30 62-124 74z" fill="#d79a4f"/>
    </svg>`;
    heroImg.insertAdjacentHTML('afterend', svg); heroImg.remove();
  };
  if (heroImg.complete && heroImg.naturalWidth === 0) loaf(); else heroImg.addEventListener('error', loaf);

  renderMenu(); renderBagCount(); renderCake();
})();
