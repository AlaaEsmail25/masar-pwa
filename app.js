
'use strict';

// ── State ──────────────────────────────────────────────────────────────
const state = {
  page: 'home',
  addSub: 'expense',
  name: 'علاء عبدو',
  income: 3200,
  currency: '€',
  expenses: [],
  savings: [],
  debts: [],
  goals: [],
  investments: [],
  chat: [{ role: 'ai', text: 'مرحباً! أنا مساعدك المالي في مسار. اسألني عن ادخارك، مصاريفك، أو خطة استثمارية 💰' }],
  etfMonthly: 100, etfYears: 10, etfRate: 7,
};

function save() { try { localStorage.setItem('masar', JSON.stringify(state)); } catch(e){} }
function load() {
  try {
    const d = JSON.parse(localStorage.getItem('masar') || 'null');
    if (d) Object.assign(state, d);
  } catch(e){}
}
load();

// ── Utils ──────────────────────────────────────────────────────────────
function fmt(n) { return Number(n).toLocaleString('de-DE', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function toast(msg, ms=2200) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
}
function sum(arr, key='amount') { return arr.reduce((a,b) => a + (+b[key]||0), 0); }
function today() { return new Date().toISOString().split('T')[0]; }

// ── Navigation ──────────────────────────────────────────────────────────
function navigate(page, sub) {
  state.page = page;
  if (sub) state.addSub = sub;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const nb = document.getElementById('nav-' + page);
  if (nb) nb.classList.add('active');
  render();
  document.getElementById('content').scrollTop = 0;
}

// ── Render ──────────────────────────────────────────────────────────────
function render() {
  const c = document.getElementById('content');
  if (state.page === 'home')    c.innerHTML = renderHome();
  else if (state.page === 'add')     c.innerHTML = renderAdd();
  else if (state.page === 'reports') c.innerHTML = renderReports();
  else if (state.page === 'tips')    c.innerHTML = renderTips();
  else if (state.page === 'account') c.innerHTML = renderAccount();
  bindEvents();
}

// ── HOME ────────────────────────────────────────────────────────────────
function renderHome() {
  const c = state.currency;
  const totalExp = sum(state.expenses);
  const totalSav = sum(state.savings);
  const totalDebt = state.debts.reduce((a,d) => a + (d.total - (d.paid||0)), 0);
  const totalInv = sum(state.investments);
  const balance = state.income - totalExp;
  const pct = state.income > 0 ? Math.min(Math.round(balance / state.income * 100), 100) : 0;
  const circ = 2 * Math.PI * 36;
  const dash = circ - (pct / 100 * circ);
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const now = new Date();
  const dateStr = months[now.getMonth()] + ' ' + now.getFullYear();

  // alerts
  let alerts = '';
  if (state.income > 0) {
    if (balance < 0) alerts += `<div class="notif-box nb-red">🔴 مصاريفك تتجاوز دخلك بـ ${fmt(Math.abs(balance))} ${c}!</div>`;
    if (totalDebt > state.income * 0.5) alerts += `<div class="notif-box nb-yellow">⚠️ ديونك تتجاوز 50% من دخلك الشهري</div>`;
    if (totalSav / state.income * 100 < 10 && state.income > 0) alerts += `<div class="notif-box nb-yellow">💡 معدل ادخارك أقل من 10% — حاول رفعه</div>`;
    if (balance > 0 && totalSav / state.income >= 0.2) alerts += `<div class="notif-box nb-green">✅ وضعك المالي ممتاز هذا الشهر!</div>`;
  }

  const metrics = [
    { icon:'🧾', bg:'ic-teal',   title:'المصاريف',    sub:`${state.expenses.length} معاملة هذا الشهر`, pill:null, val:`${fmt(totalExp)} ${c}`, trend:`${state.income>0?Math.round(totalExp/state.income*100):0}%+↑`, tc:'trend-up' },
    { icon:'💰', bg:'ic-green',  title:'المدخرات',    sub:`${state.savings.length} أوعية ادخارية`, pill:null, val:`${fmt(totalSav)} ${c}`, trend:`${state.income>0?Math.round(totalSav/state.income*100):0}%+↑`, tc:'trend-up' },
    { icon:'🎯', bg:'ic-yellow', title:'الأهداف',     sub:`${state.goals.length} هدف — ${calcGoalsPct()}% مكتمل`, pill:'جيد', val:`${calcGoalsPct()}%`, trend:'↑ جيد', tc:'trend-ok' },
    { icon:'💳', bg:'ic-red',    title:'الديون',      sub:'قرض واحد نشط', pill:null, val:`${fmt(totalDebt)} ${c}`, trend:'3%-↓', tc:'trend-up' },
    { icon:'📈', bg:'ic-blue',   title:'الاستثمارات', sub:'محفظة نشطة', pill:null, val:`${fmt(totalInv)} ${c}`, trend:'+8.3%↑ ممتاز', tc:'trend-up' },
  ];

  const metricsHTML = metrics.map(m => `
    <div class="metric-card" onclick="navigate('add','${metricToSub(m.title)}')">
      <span class="arrow">‹</span>
      <div class="metric-right">
        <div class="metric-val">${m.val}</div>
        <div class="${m.tc}">${m.trend}</div>
      </div>
      <div class="metric-mid">
        <div class="metric-title">${m.title}</div>
        <div class="metric-sub">${m.sub}</div>
        ${m.pill ? `<span class="pill">${m.pill}</span>` : ''}
      </div>
      <div class="metric-icon ${m.bg}">${m.icon}</div>
    </div>`).join('');

  return `
    <div class="top-header">
      <button class="notif-btn" onclick="toast('لا توجد إشعارات جديدة')"></button>
      <div class="user-meta">
        <div class="user-name">${state.name}</div>
        <div class="user-date">${dateStr}</div>
      </div>
      <div class="avatar">${state.name.charAt(0)}</div>
    </div>

    <div class="balance-card">
      <div class="balance-info">
        <div class="balance-label">الرصيد المتاح</div>
        <div class="balance-value">${fmt(balance)} ${c}</div>
        <div class="balance-sub">من إجمالي ${fmt(state.income)} ${c}</div>
      </div>
      <div class="ring-wrap">
        <svg viewBox="0 0 88 88"><circle class="ring-bg" cx="44" cy="44" r="36"/><circle class="ring-fill" cx="44" cy="44" r="36" stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${dash.toFixed(1)}"/></svg>
        <div class="ring-label">${pct}%</div>
      </div>
    </div>

    ${alerts}

    <div class="cards-list">${metricsHTML}</div>`;
}

function metricToSub(title) {
  const m = {المصاريف:'expense',المدخرات:'saving',الأهداف:'goal',الديون:'debt',الاستثمارات:'investment'};
  return m[title] || 'expense';
}
function calcGoalsPct() {
  if (!state.goals.length) return 0;
  return Math.round(state.goals.reduce((a,g) => a + Math.min((g.saved||0)/g.target*100,100), 0) / state.goals.length);
}

// ── ADD PAGE ────────────────────────────────────────────────────────────
function renderAdd() {
  const tabs = [
    {key:'expense',icon:'🧾',label:'المصاريف'},
    {key:'saving',icon:'🏦',label:'المدخرات'},
    {key:'goal',icon:'🎯',label:'الأهداف'},
    {key:'debt',icon:'💳',label:'الديون'},
    {key:'investment',icon:'📈',label:'الاستثمار'},
  ];
  const c = state.currency;
  const tabsHTML = tabs.map(t => `
    <div class="add-card ${state.addSub===t.key?'active':''}" onclick="navigate('add','${t.key}')">
      <span class="add-icon">${t.icon}</span>
      <span class="add-label">${t.label}</span>
    </div>`).join('');

  let formHTML = '';
  const sub = state.addSub;
  if (sub === 'expense') {
    const cats = ['🏠 سكن','🍔 طعام','🚗 مواصلات','💊 صحة','📚 تعليم','🎮 ترفيه','👗 ملابس','💡 فواتير','📦 أخرى'];
    const list = state.expenses.slice().reverse().map((e,i) => `
      <div class="list-item">
        <button class="li-del" onclick="delItem('expenses',${state.expenses.length-1-i})">🗑️</button>
        <div class="li-info">
          <div class="li-name">${e.cat}</div>
          <div class="li-sub">${e.date||''} ${e.note?'— '+e.note:''}</div>
        </div>
        <div class="li-amount">${fmt(e.amount)} ${c}</div>
      </div>`).join('');
    formHTML = `
      <div class="form-wrap">
        <div class="form-card">
          <div class="form-title">➕ إضافة مصروف</div>
          <div class="form-group"><label>التصنيف</label>
            <select id="f-cat">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div>
          <div class="form-group"><label>المبلغ (${c})</label><input type="number" id="f-amt" placeholder="0.00" min="0" step="0.01"></div>
          <div class="form-group"><label>التاريخ</label><input type="date" id="f-date" value="${today()}"></div>
          <div class="form-group"><label>ملاحظة (اختياري)</label><input type="text" id="f-note" placeholder="وصف قصير"></div>
          <button class="btn-primary" onclick="addExpense()">💾 حفظ المصروف</button>
        </div>
      </div>
      ${list.length ? `<div class="sec-head">🧾 المصاريف<span class="li-total">الإجمالي: ${fmt(sum(state.expenses))} ${c}</span></div><div class="list-wrap">${list}</div>` : ''}`;
  } else if (sub === 'saving') {
    const list = state.savings.slice().reverse().map((s,i) => `
      <div class="list-item">
        <button class="li-del" onclick="delItem('savings',${state.savings.length-1-i})">🗑️</button>
        <div class="li-info"><div class="li-name">🏦 ${s.name}</div><div class="li-sub">${s.date||''}</div></div>
        <div class="li-amount">${fmt(s.amount)} ${c}</div>
      </div>`).join('');
    formHTML = `
      <div class="form-wrap">
        <div class="form-card">
          <div class="form-title">➕ إضافة مدخرات</div>
          <div class="form-group"><label>اسم الوعاء</label><input type="text" id="f-name" placeholder="مثال: صندوق الطوارئ"></div>
          <div class="form-group"><label>المبلغ (${c})</label><input type="number" id="f-amt" placeholder="0.00" min="0" step="0.01"></div>
          <div class="form-group"><label>التاريخ</label><input type="date" id="f-date" value="${today()}"></div>
          <button class="btn-primary" onclick="addSaving()">💾 حفظ</button>
        </div>
      </div>
      ${list.length ? `<div class="sec-head">🏦 المدخرات<span class="li-total">${fmt(sum(state.savings))} ${c}</span></div><div class="list-wrap">${list}</div>` : ''}`;
  } else if (sub === 'goal') {
    const list = state.goals.slice().reverse().map((g,i) => {
      const pct = Math.min(Math.round((g.saved||0)/g.target*100),100);
      return `<div class="list-item" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button class="li-del" onclick="delItem('goals',${state.goals.length-1-i})">🗑️</button>
          <div class="li-info"><div class="li-name">🎯 ${g.name}</div></div>
          <div class="li-amount">${fmt(g.saved||0)}/${fmt(g.target)} ${c}</div>
        </div>
        <div class="prog-wrap"><div class="prog-fill" style="width:${pct}%"></div></div>
        <div style="font-size:.75rem;color:var(--muted);text-align:left">${pct}%</div>
      </div>`;
    }).join('');
    formHTML = `
      <div class="form-wrap">
        <div class="form-card">
          <div class="form-title">➕ هدف جديد</div>
          <div class="form-group"><label>اسم الهدف</label><input type="text" id="f-name" placeholder="مثال: سيارة جديدة"></div>
          <div class="form-group"><label>المبلغ المستهدف (${c})</label><input type="number" id="f-target" min="1" step="1"></div>
          <div class="form-group"><label>المدخر حتى الآن (${c})</label><input type="number" id="f-saved" min="0" step="1" value="0"></div>
          <button class="btn-primary" onclick="addGoal()">💾 حفظ</button>
        </div>
      </div>
      ${list.length ? `<div class="sec-head">🎯 الأهداف</div><div class="list-wrap">${list}</div>` : ''}`;
  } else if (sub === 'debt') {
    const list = state.debts.slice().reverse().map((d,i) => {
      const rem = d.total - (d.paid||0);
      const pct = Math.min(Math.round((d.paid||0)/d.total*100),100);
      return `<div class="list-item" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button class="li-del" onclick="delItem('debts',${state.debts.length-1-i})">🗑️</button>
          <div class="li-info"><div class="li-name">💳 ${d.name}</div></div>
          <div class="li-amount" style="color:var(--red)">${fmt(rem)} ${c}</div>
        </div>
        <div class="prog-wrap"><div class="prog-fill" style="width:${pct}%;background:var(--green)"></div></div>
      </div>`;
    }).join('');
    formHTML = `
      <div class="form-wrap">
        <div class="form-card">
          <div class="form-title">➕ إضافة دين</div>
          <div class="form-group"><label>اسم الدين</label><input type="text" id="f-name" placeholder="مثال: قرض السيارة"></div>
          <div class="form-group"><label>إجمالي الدين (${c})</label><input type="number" id="f-total" min="1" step="1"></div>
          <div class="form-group"><label>المدفوع حتى الآن (${c})</label><input type="number" id="f-paid" min="0" step="1" value="0"></div>
          <div class="form-group"><label>القسط الشهري (${c})</label><input type="number" id="f-monthly" min="0" step="1"></div>
          <button class="btn-primary" onclick="addDebt()">💾 حفظ</button>
        </div>
      </div>
      ${list.length ? `<div class="sec-head">💳 الديون<span class="li-total">${fmt(state.debts.reduce((a,d)=>a+(d.total-(d.paid||0)),0))} ${c}</span></div><div class="list-wrap">${list}</div>` : ''}`;
  } else if (sub === 'investment') {
    const platforms = ['Trade Republic','Scalable Capital','Bitpanda','DEGIRO','أخرى'];
    const list = state.investments.slice().reverse().map((inv,i) => `
      <div class="list-item">
        <button class="li-del" onclick="delItem('investments',${state.investments.length-1-i})">🗑️</button>
        <div class="li-info"><div class="li-name">📈 ${inv.platform}</div><div class="li-sub">${inv.date||''} ${inv.note?'— '+inv.note:''}</div></div>
        <div class="li-amount">${fmt(inv.amount)} ${c}</div>
      </div>`).join('');
    formHTML = `
      <div class="form-wrap">
        <div class="form-card">
          <div class="form-title">➕ تسجيل استثمار</div>
          <div class="form-group"><label>المنصة</label>
            <select id="f-platform">${platforms.map(p=>`<option>${p}</option>`).join('')}</select></div>
          <div class="form-group"><label>المبلغ (${c})</label><input type="number" id="f-amt" min="0" step="0.01" placeholder="0.00"></div>
          <div class="form-group"><label>التاريخ</label><input type="date" id="f-date" value="${today()}"></div>
          <div class="form-group"><label>ملاحظة</label><input type="text" id="f-note" placeholder="اختياري"></div>
          <button class="btn-primary" onclick="addInvestment()">💾 حفظ</button>
        </div>
      </div>
      ${list.length ? `<div class="sec-head">📈 الاستثمارات<span class="li-total">${fmt(sum(state.investments))} ${c}</span></div><div class="list-wrap">${list}</div>` : ''}`;
  }
  return `
    <div class="top-header">
      <div class="user-name">➕ إضافة</div>
    </div>
    <div class="add-grid" style="margin-top:12px;">${tabsHTML}</div>
    ${formHTML}`;
}

// ── CRUD ────────────────────────────────────────────────────────────────
function addExpense() {
  const cat  = document.getElementById('f-cat')?.value;
  const amt  = parseFloat(document.getElementById('f-amt')?.value);
  const date = document.getElementById('f-date')?.value;
  const note = document.getElementById('f-note')?.value;
  if (!amt || amt <= 0) { toast('⚠️ أدخل مبلغاً صحيحاً'); return; }
  state.expenses.push({ cat, amount: amt, date, note });
  save(); toast('✅ تم حفظ المصروف'); render();
}
function addSaving() {
  const name = document.getElementById('f-name')?.value;
  const amt  = parseFloat(document.getElementById('f-amt')?.value);
  const date = document.getElementById('f-date')?.value;
  if (!name || !amt || amt <= 0) { toast('⚠️ أكمل البيانات'); return; }
  state.savings.push({ name, amount: amt, date });
  save(); toast('✅ تم الحفظ'); render();
}
function addGoal() {
  const name   = document.getElementById('f-name')?.value;
  const target = parseFloat(document.getElementById('f-target')?.value);
  const saved  = parseFloat(document.getElementById('f-saved')?.value) || 0;
  if (!name || !target || target <= 0) { toast('⚠️ أكمل البيانات'); return; }
  state.goals.push({ name, target, saved });
  save(); toast('✅ تم الحفظ'); render();
}
function addDebt() {
  const name    = document.getElementById('f-name')?.value;
  const total   = parseFloat(document.getElementById('f-total')?.value);
  const paid    = parseFloat(document.getElementById('f-paid')?.value) || 0;
  const monthly = parseFloat(document.getElementById('f-monthly')?.value) || 0;
  if (!name || !total || total <= 0) { toast('⚠️ أكمل البيانات'); return; }
  state.debts.push({ name, total, paid, monthly });
  save(); toast('✅ تم الحفظ'); render();
}
function addInvestment() {
  const platform = document.getElementById('f-platform')?.value;
  const amt  = parseFloat(document.getElementById('f-amt')?.value);
  const date = document.getElementById('f-date')?.value;
  const note = document.getElementById('f-note')?.value;
  if (!amt || amt <= 0) { toast('⚠️ أدخل مبلغاً صحيحاً'); return; }
  state.investments.push({ platform, amount: amt, date, note });
  save(); toast('✅ تم الحفظ'); render();
}
function delItem(key, idx) {
  if (!confirm('حذف هذا العنصر؟')) return;
  state[key].splice(idx, 1);
  save(); toast('🗑️ تم الحذف'); render();
}

// ── REPORTS ─────────────────────────────────────────────────────────────
function renderReports() {
  const c = state.currency;
  const totalExp = sum(state.expenses);
  const totalSav = sum(state.savings);
  const totalDebt = state.debts.reduce((a,d) => a + (d.total-(d.paid||0)), 0);
  const totalInv = sum(state.investments);
  const balance = state.income - totalExp;
  const savePct = state.income > 0 ? totalSav/state.income*100 : 0;
  const debtPct = state.income > 0 ? totalDebt/state.income*100 : 0;
  let score = 100;
  if (state.income === 0) score = 0;
  else {
    if (balance < 0) score -= 40;
    if (savePct < 10) score -= 20; else if (savePct < 20) score -= 10;
    if (debtPct > 50) score -= 30; else if (debtPct > 30) score -= 15;
  }
  score = Math.max(score, 0);
  const scoreColor = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--orange)' : 'var(--red)';
  const scoreLbl = score >= 80 ? 'ممتاز 🏆' : score >= 60 ? 'جيد 👍' : 'يحتاج تحسين ⚠️';

  const kpis = [
    {icon:'💰',label:'الدخل',val:`${fmt(state.income)} ${c}`,bg:'#e8fff3'},
    {icon:'🧾',label:'المصاريف',val:`${fmt(totalExp)} ${c}`,bg:'#fff0f0'},
    {icon:'🏦',label:'المدخرات',val:`${fmt(totalSav)} ${c}`,bg:'#eef0ff'},
    {icon:'💳',label:'الديون',val:`${fmt(totalDebt)} ${c}`,bg:'#fff8e1'},
    {icon:'📈',label:'الاستثمار',val:`${fmt(totalInv)} ${c}`,bg:'#dff3f1'},
    {icon:'⚖️',label:'الرصيد',val:`${fmt(balance)} ${c}`,bg:'#f4f7fc'},
  ];
  const kpiHTML = kpis.map(k => `
    <div class="kpi-box" style="background:${k.bg}">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-lbl">${k.label}</div>
      <div class="kpi-val">${k.val}</div>
    </div>`).join('');

  const cats = {};
  state.expenses.forEach(e => { cats[e.cat] = (cats[e.cat]||0) + e.amount; });
  const catHTML = Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,amt]) => {
    const pct = totalExp > 0 ? Math.round(amt/totalExp*100) : 0;
    return `<div class="cat-bar">
      <div class="cat-row"><span class="cat-name">${cat}</span><span class="cat-amt">${fmt(amt)} ${c} (${pct}%)</span></div>
      <div class="prog-wrap"><div class="prog-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');

  return `
    <div class="top-header"><div class="user-name">📊 التقارير</div></div>
    <div class="score-card">
      <div class="score-num" style="color:${scoreColor}">${score}</div>
      <div class="score-lbl" style="color:${scoreColor}">${scoreLbl}</div>
    </div>
    <div class="kpi-grid">${kpiHTML}</div>
    ${catHTML ? `<div class="sec-head">🧾 المصاريف حسب التصنيف</div><div style="padding:0 12px">${catHTML}</div>` : ''}
    <div style="padding:12px">
      <button class="btn-primary" onclick="exportData()">📤 تصدير البيانات (JSON)</button>
    </div>`;
}

function exportData() {
  const data = JSON.stringify({...state, exported: today()}, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `masar-${today()}.json`;
  a.click();
  toast('📤 تم التصدير!');
}

// ── TIPS ────────────────────────────────────────────────────────────────
function renderTips() {
  const c = state.currency;
  const chatHTML = state.chat.map(m => `
    <div class="chat-msg ${m.role==='ai'?'msg-ai':'msg-user'}">${m.text}</div>`).join('');

  const monthly = state.etfMonthly, years = state.etfYears, rate = state.etfRate;
  const n = years*12, r = rate/100/12;
  const total = r > 0 ? monthly*((Math.pow(1+r,n)-1)/r)*(1+r) : monthly*n;
  const deposited = monthly*n;
  const profit = total-deposited;

  const income = state.income, totalExp = sum(state.expenses), totalSav = sum(state.savings);
  const totalDebt = state.debts.reduce((a,d)=>a+(d.total-(d.paid||0)),0);
  const savePct = income > 0 ? totalSav/income*100 : 0;
  const debtPct = income > 0 ? totalDebt/income*100 : 0;
  let tips = '';
  if (income === 0) tips = `<div class="tip-box tip-b">💡 أضف دخلك الشهري من صفحة حسابي للحصول على نصائح مخصصة</div>`;
  else {
    if (income-totalExp < 0) tips += `<div class="tip-box tip-r">🔴 مصاريفك تتجاوز دخلك — راجع بنود الإنفاق الكبيرة أولاً</div>`;
    if (savePct < 10) tips += `<div class="tip-box tip-y">💛 معدل ادخارك أقل من 10% — ابدأ بـ 50 ${c} شهرياً</div>`;
    else if (savePct < 20) tips += `<div class="tip-box tip-b">💙 ادخارك جيد، حاول الوصول لـ 20% من الدخل</div>`;
    else tips += `<div class="tip-box tip-g">💚 معدل ادخارك ممتاز! فوق 20%</div>`;
    if (debtPct > 50) tips += `<div class="tip-box tip-r">🔴 ديونك مرتفعة — ركز على سداد أعلى فائدة أولاً</div>`;
    else if (debtPct > 30) tips += `<div class="tip-box tip-y">⚠️ ديونك معقولة لكن حاول تقليلها</div>`;
    else tips += `<div class="tip-box tip-g">✅ نسبة ديونك آمنة</div>`;
  }

  return `
    <div class="top-header"><div class="user-name">💡 نصائح وتحليل</div></div>
    <div class="ai-header">
      <div class="ai-title">🤖 المساعد المالي الذكي</div>
      <div class="ai-sub">اسألني أي شيء عن وضعك المالي</div>
    </div>
    <div class="chat-wrap" id="chat-wrap">${chatHTML}</div>
    <div class="chat-input-wrap">
      <button class="chat-send" onclick="sendChat()">↑</button>
      <input class="chat-input" id="chat-input" placeholder="اسألني مثلاً: كيف أوفر أكثر؟" onkeydown="if(event.key==='Enter')sendChat()">
    </div>
    <div class="sec-head">💡 نصائح ذكية بناءً على بياناتك</div>
    ${tips}
    <div class="sec-head">📊 قاعدة 50/30/20</div>
    ${renderBudgetRule()}
    <div class="sec-head">🧮 حاسبة ETF التراكمية</div>
    <div class="range-wrap">
      <label>القسط الشهري: <strong>${monthly} ${state.currency}</strong></label>
      <input type="range" min="10" max="2000" step="10" value="${monthly}" oninput="state.etfMonthly=+this.value;render()">
    </div>
    <div class="range-wrap">
      <label>عدد السنوات: <strong>${years} سنة</strong></label>
      <input type="range" min="1" max="40" value="${years}" oninput="state.etfYears=+this.value;render()">
    </div>
    <div class="range-wrap">
      <label>معدل العائد: <strong>${rate}%</strong></label>
      <input type="range" min="1" max="15" step="0.5" value="${rate}" oninput="state.etfRate=+this.value;render()">
    </div>
    <div class="etf-card">
      <div class="etf-grid">
        <div><div class="etf-lbl">إجمالي الإيداع</div><div class="etf-val">${fmt(deposited)} ${c}</div></div>
        <div><div class="etf-lbl">الأرباح</div><div class="etf-val etf-profit">+${fmt(profit)} ${c}</div></div>
        <div><div class="etf-lbl">القيمة النهائية</div><div class="etf-val etf-total">${fmt(total)} ${c}</div></div>
      </div>
    </div>`;
}

function renderBudgetRule() {
  const c = state.currency;
  const inc = state.income;
  if (!inc) return `<div class="tip-box tip-b">أضف دخلك لرؤية التوزيع المثالي</div>`;
  const n50=inc*.5, n30=inc*.3, n20=inc*.2;
  const exp=sum(state.expenses), sav=sum(state.savings);
  const rows = [
    {label:'50% — الضروريات',cur:exp,max:n50,bg:'#e8fff3'},
    {label:'30% — الرغبات',cur:0,max:n30,bg:'#fff8e1'},
    {label:'20% — الادخار',cur:sav,max:n20,bg:'#eef0ff'},
  ];
  return rows.map(r => {
    const pct = Math.min(r.max>0?Math.round(r.cur/r.max*100):0, 100);
    return `<div style="background:${r.bg};border-radius:14px;padding:11px 14px;margin:0 12px 8px">
      <div style="display:flex;justify-content:space-between;font-weight:800;font-size:.88rem;margin-bottom:5px">
        <span>${r.label}</span><span>${fmt(r.cur)}/${fmt(r.max)} ${state.currency}</span>
      </div>
      <div class="prog-wrap"><div class="prog-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

function sendChat() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  state.chat.push({ role: 'user', text });
  input.value = '';
  const c = state.currency;
  const balance = state.income - sum(state.expenses);
  const savePct = state.income > 0 ? Math.round(sum(state.savings)/state.income*100) : 0;
  let reply = '';
  const q = text.toLowerCase();
  if (q.includes('وفر') || q.includes('ادخار') || q.includes('ادخر')) {
    reply = `💡 بناءً على بياناتك، رصيدك المتاح ${fmt(balance)} ${c}.\n\nاقتراحي: خصص ${fmt(balance*0.3)} ${c} (30%) للادخار الفوري، والباقي للطوارئ. معدل ادخارك الحالي ${savePct}% ${savePct<20?'— حاول رفعه لـ 20%':'— ممتاز! استمر على هذا المستوى'}.`;
  } else if (q.includes('استثمار') || q.includes('etf') || q.includes('سهم')) {
    reply = `📈 للمبتدئين في ألمانيا، أنصح بـ:\n1. **Trade Republic** — بدون رسوم، يدعم ETF\n2. **Scalable Capital** — محافظ آلية\n\nابدأ بـ 50-100 ${c} شهرياً في صندوق MSCI World ETF. على 10 سنوات بعائد 7% ستصل ~17,000 ${c}!`;
  } else if (q.includes('دين') || q.includes('قرض')) {
    reply = `💳 استراتيجية سداد الديون:\n• طريقة كرة الثلج: ابدأ بأصغر دين\n• طريقة الانهيار الجليدي: ابدأ بأعلى فائدة\n\nبعد السداد، حوّل القسط الشهري للادخار مباشرة.`;
  } else if (q.includes('مصار') || q.includes('إنفاق') || q.includes('خفف')) {
    const top = Object.entries(state.expenses.reduce((a,e)=>({...a,[e.cat]:(a[e.cat]||0)+e.amount}),{})).sort((a,b)=>b[1]-a[1])[0];
    reply = `🧾 أكبر بند إنفاق لديك: ${top ? top[0]+' بـ '+fmt(top[1])+' '+c : 'لا توجد بيانات بعد'}.\n\nنصيحة: راجع اشتراكاتك الشهرية وأوقف غير الضروري. وفّر على الطعام بالطهي المنزلي.`;
  } else {
    reply = `💰 شكراً على سؤالك! رصيدك الحالي ${fmt(balance)} ${c} ومعدل ادخارك ${savePct}%.\n\nللحصول على نصيحة أدق، اسأل عن: الادخار، الاستثمار، تقليل المصاريف، أو سداد الديون.`;
  }
  state.chat.push({ role: 'ai', text: reply });
  render();
  setTimeout(() => {
    const cw = document.getElementById('chat-wrap');
    if (cw) cw.scrollTop = cw.scrollHeight;
  }, 100);
}

// ── ACCOUNT ─────────────────────────────────────────────────────────────
function renderAccount() {
  const c = state.currency;
  return `
    <div class="top-header"><div class="user-name">👤 حسابي</div></div>
    <div class="account-card">
      <div class="acc-name">${state.name}</div>
      <div class="acc-sub">الدخل الشهري: ${fmt(state.income)} ${c}</div>
    </div>
    <div class="sec-head">⚙️ الإعدادات</div>
    <div class="settings-section">
      <div class="setting-row">
        <span class="sr-label">الاسم</span>
        <input id="s-name" value="${state.name}" onchange="state.name=this.value;save();render()">
      </div>
      <div class="setting-row">
        <span class="sr-label">الدخل الشهري</span>
        <input id="s-income" type="number" value="${state.income}" style="max-width:110px" onchange="state.income=+this.value;save();render()">
      </div>
      <div class="setting-row">
        <span class="sr-label">العملة</span>
        <select id="s-cur" onchange="state.currency=this.value;save();render()">
          ${['€','$','£','﷼','د.إ','TL'].map(cur=>`<option ${state.currency===cur?'selected':''}>${cur}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="sec-head">📋 ملخص البيانات</div>
    <div class="list-wrap">
      ${[['🧾 المصاريف',state.expenses.length],['🏦 المدخرات',state.savings.length],
         ['🎯 الأهداف',state.goals.length],['💳 الديون',state.debts.length],
         ['📈 الاستثمارات',state.investments.length]].map(([l,n])=>`
        <div class="list-item">
          <div class="li-info"><div class="li-name">${l}</div></div>
          <div class="li-amount">${n} عنصر</div>
        </div>`).join('')}
    </div>
    <div style="padding:12px">
      <button class="btn-primary" style="background:#d46b6b" onclick="if(confirm('مسح كل البيانات؟')){localStorage.clear();location.reload()}">🗑️ مسح كل البيانات</button>
    </div>`;
}

// ── Events ──────────────────────────────────────────────────────────────
function bindEvents() {
  // prevent double-tap zoom on buttons
  document.querySelectorAll('button,.add-card,.metric-card').forEach(el => {
    el.addEventListener('touchend', e => e.preventDefault(), {passive:false});
  });
}

// ── Install Prompt ────────────────────────────────────────────────────
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  // show install banner after 3 seconds
  setTimeout(() => {
    const banner = document.createElement('div');
    banner.className = 'install-banner';
    banner.innerHTML = `
      <div class="ib-text">📱 ثبّت مسار على شاشتك الرئيسية!</div>
      <button class="ib-btn" id="ib-install">تثبيت</button>
      <button class="ib-close" id="ib-close">✕</button>`;
    document.getElementById('content').prepend(banner);
    document.getElementById('ib-install').onclick = () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => { banner.remove(); deferredPrompt = null; });
    };
    document.getElementById('ib-close').onclick = () => banner.remove();
  }, 3000);
});

// ── Service Worker ────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ── Init ──────────────────────────────────────────────────────────────
render();
