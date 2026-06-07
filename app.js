'use strict';

// ══════════════════════════════════════════════════════════
//  STORAGE & STATE
// ══════════════════════════════════════════════════════════
const STORAGE_KEY = 'masar_v4';
function loadState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch(e){ return null; } }
function saveState()  { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e){} }

const defaults = {
  registered:false, onboardDone:false,
  name:'', income:0, currency:'€', lang:'ar',
  avatar:null, darkMode:false, budgetAlerts:true,
  pin:null,          // 4-digit PIN string or null
  pinEnabled:false,
  email:'',          // for PIN recovery
  page:'home', addSub:'expense',
  expenses:[], savings:[], debts:[], goals:[], investments:[], bills:[], receipts:[], chat:[],
  budgets:{},
  etfMonthly:100, etfYears:10, etfRate:7,
};
const saved = loadState();
const state = saved ? Object.assign({},defaults,saved) : Object.assign({},defaults);
function applyTheme(){ document.documentElement.setAttribute('data-theme', state.darkMode?'dark':'light'); }
applyTheme();

// ══════════════════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════════════════
function fmt(n){ return Number(n||0).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function toast(msg,ms=2400){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),ms); }
function sum(arr,key='amount'){ return arr.reduce((a,b)=>a+(+b[key]||0),0); }
function today(){ return new Date().toISOString().split('T')[0]; }
function daysUntil(d){ if(!d)return null; return Math.ceil((new Date(d)-new Date())/86400000); }
function getMonthKey(dateStr){ return dateStr?(dateStr.slice(0,7)):''; }
function calcGoalsPct(){ if(!state.goals.length)return 0; return Math.round(state.goals.reduce((a,g)=>a+Math.min((g.saved||0)/g.target*100,100),0)/state.goals.length); }
function metricToSub(t){ return{المصاريف:'expense',المدخرات:'saving',الأهداف:'goal',الديون:'debt',الاستثمارات:'investment'}[t]||'expense'; }



// ══════════════════════════════════════════════════════════
//  APP-WIDE i18n — Full UI Translations
// ══════════════════════════════════════════════════════════
const APP_T = {
  ar: {
    dir:'rtl', fontDir:'rtl',
    // Bottom nav
    nav_home:'الرئيسية', nav_reports:'التقارير', nav_add:'إضافة',
    nav_tips:'نصائح', nav_account:'حسابي',
    // Home
    available_balance:'الرصيد المتاح',
    from_total:'من إجمالي',
    expenses:'المصاريف',
    transactions_this_month:'معاملة هذا الشهر',
    savings:'المدخرات',
    savings_buckets:'أوعية ادخارية',
    goals:'الأهداف',
    goals_completed:'هدف — %s% مكتمل',
    debts:'الديون',
    active_loan:'قرض واحد نشط',
    investments:'الاستثمارات',
    active_portfolio:'محفظة نشطة',
    // Settings
    settings:'⚙️ الإعدادات',
    personal_info:'👤 المعلومات الشخصية',
    preferences:'🎨 التفضيلات',
    language:'🌐 اللغة',
    currency:'💱 العملة',
    dark_mode:'🌙 الوضع الليلي',
    notifications:'🔔 الإشعارات',
    budget_alerts:'📊 تنبيهات الميزانية',
    pin_security:'🔒 رمز PIN',
    pin_enable:'تفعيل',
    pin_disable:'إيقاف',
    email_section:'📧 البريد الإلكتروني',
    email_registered:'البريد المسجّل',
    email_used_for:'يُستخدم لاستعادة رمز PIN',
    edit:'تعديل',
    income_section:'💰 الدخل الشهري',
    current_income:'الدخل الحالي',
    income_used_for:'يُستخدم لحساب الرصيد والنسب',
    not_set:'غير محدد',
    back:'← رجوع',
    save:'حفظ',
    // Add expense
    add_transaction:'➕ إضافة معاملة',
    expense:'مصروف',
    income_label:'دخل',
    amount:'المبلغ',
    category:'الفئة',
    note:'ملاحظة',
    date:'التاريخ',
    add_btn:'إضافة',
    // Reports
    reports:'📊 التقارير',
    monthly_summary:'الملخص الشهري',
    // Tips
    tips:'💡 نصائح مالية',
    // Alerts
    budget_exceeded:'مصاريفك تجاوزت %s% من دخلك!',
    goal_half:'وصلت لـ 50% من هدف الادخار! 🎉',
    lang_changed:'✅ تم تغيير اللغة إلى العربية',
  },
  en: {
    dir:'ltr', fontDir:'ltr',
    nav_home:'Home', nav_reports:'Reports', nav_add:'Add',
    nav_tips:'Tips', nav_account:'Account',
    available_balance:'Available Balance',
    from_total:'of total',
    expenses:'Expenses',
    transactions_this_month:'transactions this month',
    savings:'Savings',
    savings_buckets:'savings buckets',
    goals:'Goals',
    goals_completed:'goal — %s% complete',
    debts:'Debts',
    active_loan:'one active loan',
    investments:'Investments',
    active_portfolio:'active portfolio',
    settings:'⚙️ Settings',
    personal_info:'👤 Personal Info',
    preferences:'🎨 Preferences',
    language:'🌐 Language',
    currency:'💱 Currency',
    dark_mode:'🌙 Dark Mode',
    notifications:'🔔 Notifications',
    budget_alerts:'📊 Budget Alerts',
    pin_security:'🔒 PIN Code',
    pin_enable:'Enable',
    pin_disable:'Disable',
    email_section:'📧 Email',
    email_registered:'Registered email',
    email_used_for:'Used to recover PIN',
    edit:'Edit',
    income_section:'💰 Monthly Income',
    current_income:'Current income',
    income_used_for:'Used to calculate balance & ratios',
    not_set:'Not set',
    back:'← Back',
    save:'Save',
    add_transaction:'➕ Add Transaction',
    expense:'Expense',
    income_label:'Income',
    amount:'Amount',
    category:'Category',
    note:'Note',
    date:'Date',
    add_btn:'Add',
    reports:'📊 Reports',
    monthly_summary:'Monthly Summary',
    tips:'💡 Financial Tips',
    budget_exceeded:'Your expenses exceeded %s% of your income!',
    goal_half:'You reached 50% of your savings goal! 🎉',
    lang_changed:'✅ Language changed to English',
  },
  de: {
    dir:'ltr', fontDir:'ltr',
    nav_home:'Startseite', nav_reports:'Berichte', nav_add:'Hinzufügen',
    nav_tips:'Tipps', nav_account:'Konto',
    available_balance:'Verfügbares Guthaben',
    from_total:'von gesamt',
    expenses:'Ausgaben',
    transactions_this_month:'Transaktionen diesen Monat',
    savings:'Ersparnisse',
    savings_buckets:'Sparkonten',
    goals:'Ziele',
    goals_completed:'Ziel — %s% abgeschlossen',
    debts:'Schulden',
    active_loan:'ein aktiver Kredit',
    investments:'Investitionen',
    active_portfolio:'aktives Portfolio',
    settings:'⚙️ Einstellungen',
    personal_info:'👤 Persönliche Daten',
    preferences:'🎨 Einstellungen',
    language:'🌐 Sprache',
    currency:'💱 Währung',
    dark_mode:'🌙 Dunkelmodus',
    notifications:'🔔 Benachrichtigungen',
    budget_alerts:'📊 Budget-Warnungen',
    pin_security:'🔒 PIN-Code',
    pin_enable:'Aktivieren',
    pin_disable:'Deaktivieren',
    email_section:'📧 E-Mail',
    email_registered:'Registrierte E-Mail',
    email_used_for:'Zur PIN-Wiederherstellung',
    edit:'Bearbeiten',
    income_section:'💰 Monatliches Einkommen',
    current_income:'Aktuelles Einkommen',
    income_used_for:'Zur Berechnung von Guthaben & Verhältnissen',
    not_set:'Nicht festgelegt',
    back:'← Zurück',
    save:'Speichern',
    add_transaction:'➕ Transaktion hinzufügen',
    expense:'Ausgabe',
    income_label:'Einkommen',
    amount:'Betrag',
    category:'Kategorie',
    note:'Notiz',
    date:'Datum',
    add_btn:'Hinzufügen',
    reports:'📊 Berichte',
    monthly_summary:'Monatliche Zusammenfassung',
    tips:'💡 Finanztipps',
    budget_exceeded:'Ihre Ausgaben überstiegen %s% Ihres Einkommens!',
    goal_half:'Sie haben 50% Ihres Sparziels erreicht! 🎉',
    lang_changed:'✅ Sprache auf Deutsch geändert',
  },
};

function t(key, val){ 
  const lang = state.lang||'ar';
  const tr = (APP_T[lang]||APP_T.ar)[key]||APP_T.ar[key]||key;
  return val!==undefined ? tr.replace('%s', val) : tr;
}

function changeLang(lang){
  state.lang = lang;
  saveState();
  // Update page direction
  document.documentElement.setAttribute('dir', APP_T[lang]?.dir||'rtl');
  document.documentElement.setAttribute('lang', lang==='ar'?'ar':lang==='de'?'de':'en');
  render();
  toast(t('lang_changed'));
}

function applyAppLang(){
  const lang = state.lang||'ar';
  const dir  = APP_T[lang]?.dir||'rtl';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang==='ar'?'ar':lang==='de'?'de':'en');
  // Apply dir to all main sections
  ['main-content','bottom-nav'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.setAttribute('dir',dir);
  });
  // Bottom nav labels
  const navMap = [
    ['nav-lbl-home', t('nav_home')],
    ['nav-lbl-reports', t('nav_reports')],
    ['nav-lbl-add', t('nav_add')],
    ['nav-lbl-tips', t('nav_tips')],
    ['nav-lbl-account', t('nav_account')],
  ];
  navMap.forEach(([id, txt])=>{
    const el=document.getElementById(id);
    if(el) el.textContent=txt;
  });
  // Settings page title
  const stEl=document.getElementById('settings-title-lbl');
  if(stEl) stEl.textContent=t('settings');
  // Back button
  document.querySelectorAll('.back-btn').forEach(btn=>{
    if(btn.textContent.trim()==='← رجوع'||btn.textContent.trim()==='← Back'||btn.textContent.trim()==='← Zurück')
      btn.textContent=t('back');
  });
}


// ══════════════════════════════════════════════════════════
//  i18n — REGISTER PAGE TRANSLATIONS
// ══════════════════════════════════════════════════════════
const REG_T = {
  ar: {
    dir:'rtl',
    heroTitle:'أهلاً وسهلاً!',
    heroSub:'أنشئ حسابك لتبدأ رحلتك المالية الذكية',
    step:'إعداد الحساب — يستغرق أقل من دقيقة',
    heading:'أهلاً! أخبرنا عنك 👋',
    nameLabel:'👤 اسمك',
    nameRequired:'*',
    namePlaceholder:'اسم المستخدم',
    incomeLabel:'💰 دخلك الشهري',
    incomeOpt:'— اختياري',
    incomePlaceholder:'يمكن إضافته لاحقاً',
    emailLabel:'📧 بريدك الإلكتروني',
    emailOpt:'— اختياري، مطلوب لاستعادة رمز PIN',
    emailPlaceholder:'example@email.com',
    langLabel:'🌐 اللغة',
    curLabel:'💱 العملة',
    startBtn:'🚀 ابدأ رحلتي المالية',
    nameRequiredMsg:'⚠️ أدخل اسمك أولاً',
  },
  en: {
    dir:'ltr',
    heroTitle:'Welcome!',
    heroSub:'Create your account to start your smart financial journey',
    step:'Account setup — takes less than a minute',
    heading:'Hello! Tell us about you 👋',
    nameLabel:'👤 Your name',
    nameRequired:'*',
    namePlaceholder:'Username',
    incomeLabel:'💰 Monthly income',
    incomeOpt:'— optional',
    incomePlaceholder:'Can be added later',
    emailLabel:'📧 Your email',
    emailOpt:'— optional, needed to recover PIN',
    emailPlaceholder:'example@email.com',
    langLabel:'🌐 Language',
    curLabel:'💱 Currency',
    startBtn:'🚀 Start my financial journey',
    nameRequiredMsg:'⚠️ Please enter your name first',
  },
  de: {
    dir:'ltr',
    heroTitle:'Willkommen!',
    heroSub:'Erstelle dein Konto für deine smarte Finanzreise',
    step:'Kontoeinrichtung — dauert weniger als eine Minute',
    heading:'Hallo! Erzähl uns von dir 👋',
    nameLabel:'👤 Dein Name',
    nameRequired:'*',
    namePlaceholder:'Benutzername',
    incomeLabel:'💰 Monatliches Einkommen',
    incomeOpt:'— optional',
    incomePlaceholder:'Kann später hinzugefügt werden',
    emailLabel:'📧 Deine E-Mail',
    emailOpt:'— optional, für PIN-Wiederherstellung',
    emailPlaceholder:'beispiel@email.com',
    langLabel:'🌐 Sprache',
    curLabel:'💱 Währung',
    startBtn:'🚀 Meine Finanzreise starten',
    nameRequiredMsg:'⚠️ Bitte gib zuerst deinen Namen ein',
  },
};

function getRegT(){ return REG_T[regLang]||REG_T.ar; }

function renderRegisterForm(){
  const t   = getRegT();
  const dir = t.dir;
  const reg = document.getElementById('register');
  const body= document.getElementById('reg-body-area');
  if(!reg || !body) return;

  // Set page direction
  reg.setAttribute('dir', dir);
  body.setAttribute('dir', dir);

  // Update hero
  const heroTitle = document.getElementById('reg-hero-title');
  const heroSub   = document.getElementById('reg-hero-sub');
  if(heroTitle) heroTitle.textContent = t.heroTitle;
  if(heroSub)   heroSub.textContent   = t.heroSub;

  // Update all text labels
  const setText = (id, txt) => { const el=document.getElementById(id); if(el) el.textContent=txt; };
  setText('reg-step-txt',    t.step);
  setText('reg-heading-txt', t.heading);
  setText('reg-income-label',t.incomeLabel);
  setText('reg-income-opt',  ' ' + t.incomeOpt);
  setText('reg-email-label', t.emailLabel);
  setText('reg-email-opt',   ' ' + t.emailOpt);
  setText('reg-lang-label',  t.langLabel);
  setText('reg-cur-label',   t.curLabel);
  setText('reg-start-btn',   t.startBtn);

  // Update name label (keep the * span)
  const nameLbl = document.getElementById('reg-name-label');
  if(nameLbl) nameLbl.innerHTML = t.nameLabel + ' <span style="color:var(--red);font-size:.8rem">*</span>';

  // Update placeholders
  const nameEl   = document.getElementById('r-name');
  const incomeEl = document.getElementById('r-income');
  if(nameEl && !nameEl.value.trim())   nameEl.placeholder   = t.namePlaceholder;
  if(incomeEl) incomeEl.placeholder = t.incomePlaceholder;

  // Update currency labels based on language
  const curLabels = {
    '€' : dir==='rtl'?'€ يورو':'€ Euro',
    '$' : dir==='rtl'?'$ دولار':'$ Dollar',
    '£' : dir==='rtl'?'£ جنيه':'£ Pound',
    '﷼' : dir==='rtl'?'﷼ ريال':'﷼ Riyal',
    'د.إ': dir==='rtl'?'د.إ درهم':'د.إ Dirham',
    'TL' : dir==='rtl'?'TL ليرة':'TL Lira',
  };
  document.querySelectorAll('#cur-grid .opt-btn').forEach(btn=>{
    const lbl = curLabels[btn.dataset.val];
    if(lbl) btn.textContent = lbl;
    btn.classList.toggle('selected', btn.dataset.val===regCur);
  });

  // Sync lang buttons selection
  document.querySelectorAll('#lang-grid .opt-btn').forEach(btn=>{
    btn.classList.toggle('selected', btn.dataset.val===regLang);
  });
}

function updateNamePlaceholder(input){
  // placeholder follows the typed name in real-time
  if(input.value.trim()){
    input.placeholder = input.value.trim();
  } else {
    input.placeholder = getRegT().namePlaceholder;
  }
}

// ══════════════════════════════════════════════════════════
//  REGISTER
// ══════════════════════════════════════════════════════════
let regLang=state.lang||'ar', regCur=state.currency||'€';
function selectOpt(btn,type){
  const g=btn.closest('.opt-group');
  if(g) g.querySelectorAll('.opt-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  if(type==='lang'){ regLang=btn.dataset.val; renderRegisterForm(); return; }
  if(type==='cur')  regCur =btn.dataset.val;
}
function completeRegister(){
  const name=document.getElementById('r-name')?.value.trim();
  const income=parseFloat(document.getElementById('r-income')?.value)||0;
  const regEmail=(document.getElementById('r-email')?.value.trim()||'').toLowerCase();
  if(!name){ toast(getRegT().nameRequiredMsg); return; }
  // income & email are optional
  state.name=name; state.income=income||0; state.currency=regCur; state.lang=regLang; state.email=regEmail; state.registered=true;
  saveState();
  document.getElementById('register').style.display='none';
  startOnboarding();
}

// ══════════════════════════════════════════════════════════
//  PIN LOCK  — with email-based recovery
// ══════════════════════════════════════════════════════════
let pinUnlocked = false;
let pinBuffer   = '';
let pinMode     = 'unlock'; // 'unlock'|'set'|'confirm'|'forgot'|'sent'|'reset'|'reset-confirm'
let pinTempNew  = '';
let pinResetEmail = '';
let pinResetCode  = '';

function showPinScreen(mode='unlock'){
  pinMode=mode; pinBuffer=''; pinTempNew=''; pinResetEmail=''; pinResetCode='';
  const overlay=document.getElementById('pin-overlay');
  overlay.style.display='flex';
  renderPinUI();
}
function hidePinScreen(){
  document.getElementById('pin-overlay').style.display='none';
  pinBuffer='';
}
function genCode(){ return String(Math.floor(100000+Math.random()*900000)); }
function maskEmail(email){
  if(!email||!email.includes('@')) return email||'';
  const [name,domain]=email.split('@');
  const m=name.length<=2?name+'*':name[0]+'*'.repeat(name.length-2)+name.slice(-1);
  return m+'@'+domain;
}

function renderPinUI(){
  const ov=document.getElementById('pin-overlay');

  /* ── UNLOCK ── */
  if(pinMode==='unlock'){
    ov.innerHTML=`
      <div class="pin-box">
        <div class="pin-logo">💰</div>
        <div class="pin-title">🔐 أدخل رمز PIN</div>
        <div class="pin-sub">${state.name||'مسار'}</div>
        <div class="pin-dots" id="pin-dots">${[0,1,2,3].map(i=>`<div class="pin-dot" id="pd${i}"></div>`).join('')}</div>
        <div class="pin-err" id="pin-err"></div>
        <div class="pin-grid">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k=>`
            <button class="pin-key ${k===''?'pin-key-empty':''}" ${k!==''?`onclick="pinPress('${k}')"`:''}>
              ${k==='⌫'?'⌫':k}</button>`).join('')}
        </div>
        <button class="pin-forgot" onclick="goPinForgot()">نسيت الرمز؟</button>
      </div>`;
    return;
  }

  /* ── SET / CONFIRM ── */
  if(pinMode==='set'||pinMode==='confirm'){
    const title=pinMode==='set'?'🔑 أنشئ رمز PIN جديداً (4 أرقام)':'🔄 أعد إدخال الرمز للتأكيد';
    ov.innerHTML=`
      <button onclick="hidePinScreen()" style="position:absolute;top:18px;right:18px;background:rgba(255,255,255,.18);border:none;border-radius:10px;padding:7px 14px;color:#fff;font-family:Cairo,sans-serif;font-weight:700;font-size:.82rem;cursor:pointer">← رجوع</button>
      <div class="pin-box">
        <div class="pin-logo">🔑</div>
        <div class="pin-title">${title}</div>
        <div class="pin-dots" id="pin-dots">${[0,1,2,3].map(i=>`<div class="pin-dot" id="pd${i}"></div>`).join('')}</div>
        <div class="pin-err" id="pin-err"></div>
        <div class="pin-grid">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k=>`
            <button class="pin-key ${k===''?'pin-key-empty':''}" ${k!==''?`onclick="pinPress('${k}')"`:''}>
              ${k==='⌫'?'⌫':k}</button>`).join('')}
        </div>
      </div>`;
    return;
  }

  /* ── FORGOT — أدخل الإيميل ── */
  if(pinMode==='forgot'){
    const saved=state.email||'';
    ov.innerHTML=`
      <button onclick="showPinScreen('unlock')" style="position:absolute;top:18px;right:18px;background:rgba(255,255,255,.18);border:none;border-radius:10px;padding:7px 14px;color:#fff;font-family:Cairo,sans-serif;font-weight:700;font-size:.82rem;cursor:pointer">← رجوع</button>
      <div class="pin-box">
        <div style="font-size:2.4rem;margin-bottom:10px">📧</div>
        <div class="pin-title">استعادة رمز PIN</div>
        <div class="pin-sub" style="font-size:.85rem;color:var(--muted);margin:6px 0 16px;line-height:1.6">
          أدخل بريدك الإلكتروني المسجّل وسنرسل لك رمز التأكيد
        </div>
        ${saved?`<div style="font-size:.78rem;color:var(--muted);margin-bottom:8px;text-align:right">📌 البريد المسجّل: <b>${saved}</b></div>`:''}
        <input type="email" id="rst-email" value="${saved}"
          placeholder="example@email.com"
          autocomplete="email"
          style="border:2px solid var(--border);border-radius:13px;padding:12px 14px;font-family:Cairo,sans-serif;font-size:.92rem;background:var(--bg);color:var(--text);width:100%;text-align:center;direction:ltr;outline:none;transition:border .2s;margin-bottom:6px"
          onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        <div class="pin-err" id="pin-err"></div>
        <button class="btn-primary" onclick="pinSendResetCode()" style="margin-top:10px">📤 إرسال رمز التأكيد</button>
      </div>`;
    setTimeout(()=>{ const i=document.getElementById('rst-email'); if(i){ i.focus(); i.select(); } },200);
    return;
  }

  /* ── SENT — أدخل الكود المُرسَل ── */
  if(pinMode==='sent'){
    const masked=maskEmail(pinResetEmail);
    ov.innerHTML=`
      <button onclick="showPinScreen('forgot')" style="position:absolute;top:18px;right:18px;background:rgba(255,255,255,.18);border:none;border-radius:10px;padding:7px 14px;color:#fff;font-family:Cairo,sans-serif;font-weight:700;font-size:.82rem;cursor:pointer">← رجوع</button>
      <div class="pin-box">
        <div style="font-size:2.4rem;margin-bottom:10px">✉️</div>
        <div class="pin-title">تحقق من بريدك!</div>
        <div style="background:var(--green-l);border-radius:12px;padding:12px 14px;margin:12px 0;font-size:.84rem;color:var(--green);font-weight:700;line-height:1.7;text-align:center">
          تم إرسال رمز مكون من 6 أرقام إلى<br>
          <span style="font-size:.78rem;color:var(--muted);word-break:break-all">${masked}</span>
        </div>
        <div style="font-size:.84rem;color:var(--muted);margin-bottom:8px">أدخل رمز التأكيد:</div>
        <input type="text" id="rst-code" maxlength="6" inputmode="numeric" autocomplete="one-time-code"
          placeholder="_ _ _ _ _ _"
          style="border:2px solid var(--border);border-radius:13px;padding:12px 14px;font-family:Cairo,sans-serif;font-size:1.3rem;font-weight:900;background:var(--bg);color:var(--text);width:100%;text-align:center;letter-spacing:8px;direction:ltr;outline:none;transition:border .2s;margin-bottom:4px"
          onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border)'">
        <div style="font-size:.74rem;color:var(--muted);margin-bottom:10px">⏱ صالح لمدة 10 دقائق</div>
        <div class="pin-err" id="pin-err"></div>
        <button class="btn-primary" onclick="pinVerifyCode()">✅ تأكيد الرمز</button>
        <button onclick="pinResendCode()" style="margin-top:10px;background:none;border:none;color:var(--primary);font-family:Cairo,sans-serif;font-size:.83rem;font-weight:700;cursor:pointer;text-decoration:underline;text-underline-offset:2px">🔄 إعادة إرسال الرمز</button>
      </div>`;
    setTimeout(()=>document.getElementById('rst-code')?.focus(),200);
    return;
  }

  /* ── RESET / RESET-CONFIRM — أدخل PIN الجديد ── */
  if(pinMode==='reset'||pinMode==='reset-confirm'){
    const title=pinMode==='reset'?'🔑 أدخل رمز PIN الجديد':'🔄 أعد إدخال الرمز للتأكيد';
    ov.innerHTML=`
      <div class="pin-box">
        <div class="pin-logo">✅</div>
        <div class="pin-title">${title}</div>
        <div class="pin-dots" id="pin-dots">${[0,1,2,3].map(i=>`<div class="pin-dot" id="pd${i}"></div>`).join('')}</div>
        <div class="pin-err" id="pin-err"></div>
        <div class="pin-grid">
          ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k=>`
            <button class="pin-key ${k===''?'pin-key-empty':''}" ${k!==''?`onclick="pinPress('${k}')"`:''}>
              ${k==='⌫'?'⌫':k}</button>`).join('')}
        </div>
      </div>`;
    return;
  }
}

function goPinForgot(){
  if(!state.email){
    toast('⚠️ لم تُسجّل بريداً إلكترونياً — يمكنك إضافته من الإعدادات',3500);
    return;
  }
  pinMode='forgot'; renderPinUI();
}

function pinSendResetCode(){
  const emailEl=document.getElementById('rst-email');
  const email=(emailEl?.value||'').trim().toLowerCase();
  const err=document.getElementById('pin-err');
  const emailRx=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRx.test(email)){
    if(err) err.textContent='⚠️ أدخل بريداً إلكترونياً صحيحاً'; return;
  }
  if(state.email && email!==state.email.toLowerCase()){
    if(err) err.textContent='❌ هذا البريد غير مسجّل في حسابك'; return;
  }
  pinResetEmail=email;
  pinResetCode=genCode();
  // تنبيه المستخدم بالرمز (محاكاة — لا يوجد سيرفر حقيقي)
  toast('📧 رمز الاسترداد: ' + pinResetCode, 15000);
  console.info('[MASAR] Reset code for demo:', pinResetCode);
  pinMode='sent'; renderPinUI();
}

function pinResendCode(){
  pinResetCode=genCode();
  toast('📧 رمز جديد: ' + pinResetCode, 15000);
  console.info('[MASAR] New reset code:', pinResetCode);
  const err=document.getElementById('pin-err');
  if(err){ err.style.color='var(--green)'; err.textContent='✅ تم إعادة الإرسال'; }
}

function pinVerifyCode(){
  const code=(document.getElementById('rst-code')?.value||'').trim();
  const err=document.getElementById('pin-err');
  if(code!==pinResetCode){
    if(err) err.textContent='❌ الرمز غير صحيح، تحقق مجدداً';
    document.getElementById('rst-code')?.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:300});
    return;
  }
  pinBuffer=''; pinTempNew=''; pinMode='reset'; renderPinUI();
}

function updatePinDots(){
  for(let i=0;i<4;i++){
    const d=document.getElementById('pd'+i);
    if(d) d.classList.toggle('filled', i<pinBuffer.length);
  }
}
function pinPress(k){
  if(k==='⌫'){ pinBuffer=pinBuffer.slice(0,-1); updatePinDots(); return; }
  if(pinBuffer.length>=4) return;
  pinBuffer+=k; updatePinDots();
  if(pinBuffer.length===4) setTimeout(()=>checkPin(),150);
}
function checkPin(){
  if(pinMode==='unlock'){
    if(pinBuffer===state.pin){
      pinUnlocked=true; hidePinScreen(); showMainUI();
    } else {
      const e=document.getElementById('pin-err');
      if(e) e.textContent='❌ رمز خاطئ، حاول مجدداً';
      pinBuffer=''; updatePinDots();
      document.getElementById('pin-dots')?.animate(
        [{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'none'}],{duration:300});
    }
  } else if(pinMode==='set'){
    pinTempNew=pinBuffer; pinBuffer='';
    pinMode='confirm'; renderPinUI();
  } else if(pinMode==='confirm'){
    if(pinBuffer===pinTempNew){
      state.pin=pinBuffer; state.pinEnabled=true; saveState();
      hidePinScreen(); toast('✅ تم تفعيل رمز PIN!'); render();
    } else {
      const e=document.getElementById('pin-err');
      if(e) e.textContent='❌ الرمزان غير متطابقان';
      pinBuffer=''; pinTempNew=''; pinMode='set';
      setTimeout(()=>renderPinUI(),800);
    }
  } else if(pinMode==='reset'){
    pinTempNew=pinBuffer; pinBuffer='';
    pinMode='reset-confirm'; renderPinUI();
  } else if(pinMode==='reset-confirm'){
    if(pinBuffer===pinTempNew){
      state.pin=pinBuffer; state.pinEnabled=true; saveState();
      hidePinScreen(); toast('🔐 تم تغيير رمز PIN بنجاح!'); showMainUI();
    } else {
      const e=document.getElementById('pin-err');
      if(e) e.textContent='❌ الرمزان غير متطابقان';
      pinBuffer=''; pinTempNew=''; pinMode='reset';
      setTimeout(()=>renderPinUI(),800);
    }
  }
}
function enablePinCheck(){
  // If no email registered, ask for it first
  if(!state.email){
    const em=prompt('📧 لتفعيل رمز PIN يجب إضافة بريد إلكتروني أولاً:\n(يُستخدم فقط لاستعادة الرمز إذا نسيته)');
    if(!em||!em.trim()){ toast('⚠️ يجب إدخال بريد إلكتروني لتفعيل PIN'); return; }
    const rx=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!rx.test(em.trim())){ toast('⚠️ بريد إلكتروني غير صحيح'); return; }
    state.email=em.trim().toLowerCase(); saveState();
    toast('✅ تم حفظ البريد: '+state.email, 3000);
  }
  showPinScreen('set');
}
function disablePin(){
  if(!confirm('هل تريد إيقاف رمز PIN؟')) return;
  state.pin=null; state.pinEnabled=false; saveState(); toast('🔓 تم إيقاف الرمز'); render();
}

// ══════════════════════════════════════════════════════════
//  SPLASH
// ══════════════════════════════════════════════════════════
function initApp(){
  const splash=document.getElementById('splash');
  let d=0; const dots=splash.querySelectorAll('.splash-dot');
  const di=setInterval(()=>{ dots.forEach(x=>x.classList.remove('active')); dots[d%3].classList.add('active'); d++; },400);
  setTimeout(()=>{
    clearInterval(di);
    splash.style.transition='opacity .5s'; splash.style.opacity='0';
    setTimeout(()=>{
      splash.style.display='none';
      if(!state.registered){
        regLang = state.lang || 'ar';
        regCur  = state.currency || '€';
        document.getElementById('register').style.display='flex';
        renderRegisterForm();
      }
      else if(state.pinEnabled && state.pin){ showPinScreen('unlock'); }
      else if(!state.onboardDone){ showMainUI(); startOnboarding(); }
      else { showMainUI(); }
    },500);
  },2200);
}
function showMainUI(){
  document.getElementById('bottom-nav').style.display='grid';
  navigate(state.page||'home');
}

// ══════════════════════════════════════════════════════════
//  ONBOARDING
// ══════════════════════════════════════════════════════════
const STEPS=[
  {target:'nb-home',    title:'🏠 الرئيسية',    desc:'ملخص كامل لوضعك المالي — رصيدك، مصاريفك، وأهدافك دفعة واحدة.'},
  {target:'nb-add',     title:'➕ الإضافة',     desc:'سجّل مصروفاً أو مدخرات أو صوّر وصل شراء بضغطة واحدة.'},
  {target:'nb-reports', title:'📊 التقارير',    desc:'تحليل مرئي لإنفاقك ومقارنة الأشهر بمخططات تفاعلية.'},
  {target:'nb-tips',    title:'💡 النصائح',     desc:'مساعد ذكي يجيب على أسئلتك المالية ويقترح خطط مخصصة.'},
  {target:'nb-account', title:'👤 حسابي',       desc:'صورتك، رمز PIN، الوضع الليلي، ومشاركة تقريرك الشهري PDF.'},
];
let obStep=0;
function startOnboarding(){ obStep=0; const ob=document.getElementById('onboard'); ob.classList.add('active'); showObStep(); }
function showObStep(){
  const ob=document.getElementById('onboard'); ob.innerHTML='';
  if(obStep>=STEPS.length){ ob.classList.remove('active'); ob.innerHTML=''; state.onboardDone=true; saveState(); navigate('add'); toast('🎉 يمكنك الآن إدخال بياناتك!'); return; }
  const step=STEPS[obStep];
  const targetEl=document.getElementById(step.target);
  const hl=document.createElement('div'); hl.className='ob-highlight';
  if(targetEl){ const r=targetEl.getBoundingClientRect(); hl.style.cssText=`left:${r.left-6}px;top:${r.top-6}px;width:${r.width+12}px;height:${r.height+12}px;`; }
  ob.appendChild(hl);
  const card=document.createElement('div'); card.className='ob-card';
  const cardW=260; let left=0;
  if(targetEl){ const r=targetEl.getBoundingClientRect(); left=Math.max(8,Math.min(r.left+r.width/2-cardW/2,window.innerWidth-cardW-8)); }
  card.style.cssText=`bottom:90px;left:${left}px;width:${cardW}px;`;
  card.innerHTML=`<div class="ob-step">خطوة ${obStep+1} من ${STEPS.length}</div><div class="ob-title">${step.title}</div><div class="ob-desc">${step.desc}</div><button class="ob-next" onclick="nextObStep()">${obStep<STEPS.length-1?'التالي ←':'🚀 ابدأ الآن!'}</button>`;
  ob.appendChild(card);
  const skip=document.createElement('button'); skip.className='ob-skip'; skip.textContent='تخطي';
  skip.onclick=()=>{ obStep=STEPS.length; showObStep(); }; ob.appendChild(skip);
  const prog=document.createElement('div'); prog.className='ob-progress';
  STEPS.forEach((_,i)=>{ const p=document.createElement('div'); p.className='ob-pip'+(i===obStep?' active':''); prog.appendChild(p); });
  ob.appendChild(prog);
}
function nextObStep(){ obStep++; showObStep(); }
function resetOnboarding(){ state.onboardDone=false; saveState(); startOnboarding(); }

// ══════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════
function navigate(page,sub){
  state.page=page; if(sub) state.addSub=sub; saveState();
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const nb=document.getElementById('nav-'+page); if(nb) nb.classList.add('active');
  render(); document.getElementById('content').scrollTop=0;
}
function render(){
  const c=document.getElementById('content');
  if     (state.page==='home')     c.innerHTML=renderHome();
  else if(state.page==='add')      c.innerHTML=renderAdd();
  else if(state.page==='reports')  c.innerHTML=renderReports();
  else if(state.page==='tips')     c.innerHTML=renderTips();
  else if(state.page==='account')  c.innerHTML=renderAccount();
  else if(state.page==='settings') c.innerHTML=renderSettings();
  else if(state.page==='receipts') c.innerHTML=renderReceipts();
  else if(state.page==='compare')  c.innerHTML=renderCompare();
  applyAppLang();
}

// ══════════════════════════════════════════════════════════
//  AVATAR
// ══════════════════════════════════════════════════════════
function renderAvatarEl(size=44,radius=14){
  if(state.avatar) return `<img src="${state.avatar}" style="width:${size}px;height:${size}px;border-radius:${radius}px;object-fit:cover;flex-shrink:0;" alt="">`;
  return `<div class="avatar" style="width:${size}px;height:${size}px;border-radius:${radius}px;">${state.name.charAt(0)||'م'}</div>`;
}
function triggerAvatarUpload(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
  inp.onchange=e=>{ const file=e.target.files[0]; if(!file)return; const reader=new FileReader();
    reader.onload=ev=>{ const img=new Image(); img.onload=()=>{ const canvas=document.createElement('canvas'); const MAX=200; let w=img.width,h=img.height;
      if(w>h){if(w>MAX){h=h*MAX/w;w=MAX;}}else{if(h>MAX){w=w*MAX/h;h=MAX;}}
      canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
      state.avatar=canvas.toDataURL('image/jpeg',0.8); saveState(); render(); toast('✅ تم تحديث الصورة!');
    }; img.src=ev.target.result; }; reader.readAsDataURL(file); };
  inp.click();
}

// ══════════════════════════════════════════════════════════
//  HOME
// ══════════════════════════════════════════════════════════
function renderHome(){
  const c=state.currency;
  const totalExp=sum(state.expenses), totalSav=sum(state.savings);
  const totalDebt=state.debts.reduce((a,d)=>a+(d.total-(d.paid||0)),0);
  const totalInv=sum(state.investments);
  const balance=state.income>0?(state.income-totalExp):0;
  const pct=state.income>0?Math.min(Math.round(balance/state.income*100),100):0;
  const circ=2*Math.PI*36, dash=circ-(pct/100*circ);
  const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const now=new Date();

  let alerts='';
  state.bills.forEach(b=>{ const d=daysUntil(b.nextDate); if(d!==null&&d<=7&&d>=0) alerts+=`<div class="notif-box nb-yellow">📅 فاتورة "${b.name}" ${d===0?'اليوم':'بعد '+d+' أيام'} — ${fmt(b.amount)} ${c}</div>`; });
  if(!state.income) alerts+=`<div class="notif-box nb-yellow" style="cursor:pointer" onclick="navigate('account')">💡 لم تُحدّد دخلك الشهري بعد — <u>اضغط للإضافة</u></div>`;
  if(state.budgetAlerts&&state.income>0){
    if(balance<0) alerts+=`<div class="notif-box nb-red">🔴 مصاريفك تتجاوز دخلك بـ ${fmt(Math.abs(balance))} ${c}!</div>`;
    if(totalDebt>state.income*0.5) alerts+=`<div class="notif-box nb-yellow">⚠️ ديونك تجاوزت 50% من الدخل</div>`;
    if((totalSav/Math.max(state.income,1))*100<10) alerts+=`<div class="notif-box nb-yellow">💡 معدل ادخارك أقل من 10%</div>`;
    if(balance>0&&totalSav/Math.max(state.income,1)>=0.2) alerts+=`<div class="notif-box nb-green">✅ وضعك المالي ممتاز هذا الشهر!</div>`;
  }

  const metrics=[
    {icon:'🧾',bg:'ic-teal',  title:'المصاريف',   sub:`${state.expenses.length} معاملة`, val:`${fmt(totalExp)} ${c}`,  trend:`${state.income>0?Math.round(totalExp/state.income*100):0}%`, tc:'trend-up'},
    {icon:'💰',bg:'ic-green', title:'المدخرات',   sub:`${state.savings.length} وعاء`,    val:`${fmt(totalSav)} ${c}`,  trend:`${state.income>0?Math.round(totalSav/state.income*100):0}%`, tc:'trend-ok'},
    {icon:'🎯',bg:'ic-yellow',title:'الأهداف',    sub:`${state.goals.length} هدف`,       val:`${calcGoalsPct()}%`,     trend:'↑ جيد',tc:'trend-ok'},
    {icon:'💳',bg:'ic-red',   title:'الديون',     sub:'القروض النشطة',                  val:`${fmt(totalDebt)} ${c}`, trend:'↓',tc:'trend-up'},
    {icon:'📈',bg:'ic-blue',  title:'الاستثمارات',sub:'محفظة نشطة',                    val:`${fmt(totalInv)} ${c}`,  trend:'+8.3%↑',tc:'trend-ok'},
  ];
  const metricsHTML=metrics.map(m=>`
    <div class="metric-card" onclick="navigate('add','${metricToSub(m.title)}')">
      <span class="arrow">‹</span>
      <div class="metric-right"><div class="metric-val">${m.val}</div><div class="${m.tc}">${m.trend}</div></div>
      <div class="metric-mid"><div class="metric-title">${m.title}</div><div class="metric-sub">${m.sub}</div></div>
      <div class="metric-icon ${m.bg}">${m.icon}</div>
    </div>`).join('');

  return `
    <div class="top-header">
      <div style="display:flex;gap:8px;align-items:center">
        <button class="notif-btn" onclick="toast('لا توجد إشعارات جديدة')"></button>
        <button class="icon-btn" onclick="navigate('settings')" title="الإعدادات">⚙️</button>
      </div>
      <div class="user-meta"><div class="user-name">${state.name}</div><div class="user-date">${months[now.getMonth()]} ${now.getFullYear()}</div></div>
      <div onclick="navigate('account')" style="cursor:pointer">${renderAvatarEl(44,14)}</div>
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

// ══════════════════════════════════════════════════════════
//  ADD PAGE
// ══════════════════════════════════════════════════════════
function renderAdd(){
  const c=state.currency;
  const tabs=[
    {key:'expense',icon:'🧾',label:'المصاريف'},{key:'saving',icon:'🏦',label:'المدخرات'},
    {key:'goal',icon:'🎯',label:'الأهداف'},{key:'debt',icon:'💳',label:'الديون'},
    {key:'investment',icon:'📈',label:'الاستثمار'},{key:'bill',icon:'📅',label:'الفواتير'},
    {key:'receipt',icon:'📸',label:'الوصولات'},
  ];
  const tabsHTML=tabs.map(t=>`
    <div class="add-card ${state.addSub===t.key?'active':''}" onclick="navigate('add','${t.key}')">
      <span class="add-icon">${t.icon}</span><span class="add-label">${t.label}</span>
    </div>`).join('');

  let formHTML='';
  const sub=state.addSub;

  if(sub==='expense'){
    const cats=['🏠 سكن','🍔 طعام','🚗 مواصلات','💊 صحة','📚 تعليم','🎮 ترفيه','👗 ملابس','💡 فواتير','📦 أخرى'];
    const catTotals={};
    state.expenses.forEach(e=>{catTotals[e.cat]=(catTotals[e.cat]||0)+e.amount;});
    let bw='';
    Object.entries(state.budgets||{}).forEach(([cat,bgt])=>{ const spent=catTotals[cat]||0; if(bgt>0&&spent/bgt>=0.8) bw+=`<div class="notif-box nb-yellow">⚠️ ${cat}: صرفت ${Math.round(spent/bgt*100)}% من ميزانيتك</div>`; });
    const list=state.expenses.slice().reverse().map((e,i)=>`
      <div class="list-item">
        <button class="li-del" onclick="delItem('expenses',${state.expenses.length-1-i})">🗑️</button>
        <div class="li-info"><div class="li-name">${e.cat}</div><div class="li-sub">${e.date||''} ${e.note?'— '+e.note:''}</div></div>
        <div class="li-amount">${fmt(e.amount)} ${c}</div>
      </div>`).join('');
    formHTML=`${bw}<div class="form-wrap"><div class="form-card">
      <div class="form-title">➕ إضافة مصروف</div>
      <div class="form-group"><label>التصنيف</label><select id="f-cat">${cats.map(x=>`<option>${x}</option>`).join('')}</select></div>
      <div class="form-group"><label>المبلغ (${c})</label><input type="number" id="f-amt" placeholder="0.00" min="0" step="0.01"></div>
      <div class="form-group"><label>التاريخ</label><input type="date" id="f-date" value="${today()}"></div>
      <div class="form-group"><label>ملاحظة</label><input type="text" id="f-note" placeholder="اختياري"></div>
      <button class="btn-primary" onclick="addExpense()">💾 حفظ المصروف</button>
    </div></div>
    ${list?`<div class="sec-head">🧾 المصاريف — ${fmt(sum(state.expenses))} ${c}</div><div class="list-wrap">${list}</div>`:''}`;

  } else if(sub==='saving'){
    const list=state.savings.slice().reverse().map((s,i)=>`
      <div class="list-item">
        <button class="li-del" onclick="delItem('savings',${state.savings.length-1-i})">🗑️</button>
        <div class="li-info"><div class="li-name">🏦 ${s.name}</div><div class="li-sub">${s.date||''}</div></div>
        <div class="li-amount">${fmt(s.amount)} ${c}</div>
      </div>`).join('');
    formHTML=`<div class="form-wrap"><div class="form-card">
      <div class="form-title">➕ إضافة مدخرات</div>
      <div class="form-group"><label>اسم الوعاء</label><input type="text" id="f-name" placeholder="مثال: صندوق الطوارئ"></div>
      <div class="form-group"><label>المبلغ (${c})</label><input type="number" id="f-amt" placeholder="0.00" min="0" step="0.01"></div>
      <div class="form-group"><label>التاريخ</label><input type="date" id="f-date" value="${today()}"></div>
      <button class="btn-primary" onclick="addSaving()">💾 حفظ</button>
    </div></div>
    ${list?`<div class="sec-head">🏦 المدخرات — ${fmt(sum(state.savings))} ${c}</div><div class="list-wrap">${list}</div>`:''}`;

  } else if(sub==='goal'){
    const list=state.goals.slice().reverse().map((g,i)=>{
      const pct=Math.min(Math.round((g.saved||0)/g.target*100),100);
      return `<div class="list-item" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button class="li-del" onclick="delItem('goals',${state.goals.length-1-i})">🗑️</button>
          <div class="li-info"><div class="li-name">🎯 ${g.name}</div></div>
          <div class="li-amount">${fmt(g.saved||0)}/${fmt(g.target)} ${c}</div>
        </div>
        <div class="prog-wrap"><div class="prog-fill" style="width:${pct}%"></div></div>
        <div style="font-size:.75rem;color:var(--muted);text-align:left">${pct}%</div>
      </div>`;}).join('');
    formHTML=`<div class="form-wrap"><div class="form-card">
      <div class="form-title">➕ هدف جديد</div>
      <div class="form-group"><label>اسم الهدف</label><input type="text" id="f-name" placeholder="مثال: سيارة جديدة"></div>
      <div class="form-group"><label>المبلغ المستهدف (${c})</label><input type="number" id="f-target" min="1" step="1"></div>
      <div class="form-group"><label>المدخر حتى الآن (${c})</label><input type="number" id="f-saved" min="0" step="1" value="0"></div>
      <button class="btn-primary" onclick="addGoal()">💾 حفظ</button>
    </div></div>
    ${list?`<div class="sec-head">🎯 الأهداف</div><div class="list-wrap">${list}</div>`:''}`;

  } else if(sub==='debt'){
    const list=state.debts.slice().reverse().map((d,i)=>{
      const rem=d.total-(d.paid||0); const pct=Math.min(Math.round((d.paid||0)/d.total*100),100);
      return `<div class="list-item" style="flex-direction:column;align-items:stretch;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button class="li-del" onclick="delItem('debts',${state.debts.length-1-i})">🗑️</button>
          <div class="li-info"><div class="li-name">💳 ${d.name}</div></div>
          <div class="li-amount" style="color:var(--red)">${fmt(rem)} ${c}</div>
        </div>
        <div class="prog-wrap"><div class="prog-fill" style="width:${pct}%;background:var(--green)"></div></div>
      </div>`;}).join('');
    formHTML=`<div class="form-wrap"><div class="form-card">
      <div class="form-title">➕ إضافة دين</div>
      <div class="form-group"><label>اسم الدين</label><input type="text" id="f-name" placeholder="مثال: قرض السيارة"></div>
      <div class="form-group"><label>إجمالي الدين (${c})</label><input type="number" id="f-total" min="1" step="1"></div>
      <div class="form-group"><label>المدفوع حتى الآن (${c})</label><input type="number" id="f-paid" min="0" step="1" value="0"></div>
      <div class="form-group"><label>القسط الشهري (${c})</label><input type="number" id="f-monthly" min="0" step="1"></div>
      <button class="btn-primary" onclick="addDebt()">💾 حفظ</button>
    </div></div>
    ${list?`<div class="sec-head">💳 الديون — ${fmt(state.debts.reduce((a,d)=>a+(d.total-(d.paid||0)),0))} ${c}</div><div class="list-wrap">${list}</div>`:''}`;

  } else if(sub==='investment'){
    const platforms=['Trade Republic','Scalable Capital','Bitpanda','DEGIRO','أخرى'];
    const list=state.investments.slice().reverse().map((inv,i)=>`
      <div class="list-item">
        <button class="li-del" onclick="delItem('investments',${state.investments.length-1-i})">🗑️</button>
        <div class="li-info"><div class="li-name">📈 ${inv.platform}</div><div class="li-sub">${inv.date||''} ${inv.note?'— '+inv.note:''}</div></div>
        <div class="li-amount">${fmt(inv.amount)} ${c}</div>
      </div>`).join('');
    formHTML=`<div class="form-wrap"><div class="form-card">
      <div class="form-title">➕ تسجيل استثمار</div>
      <div class="form-group"><label>المنصة</label><select id="f-platform">${platforms.map(p=>`<option>${p}</option>`).join('')}</select></div>
      <div class="form-group"><label>المبلغ (${c})</label><input type="number" id="f-amt" min="0" step="0.01" placeholder="0.00"></div>
      <div class="form-group"><label>التاريخ</label><input type="date" id="f-date" value="${today()}"></div>
      <div class="form-group"><label>ملاحظة</label><input type="text" id="f-note" placeholder="اختياري"></div>
      <button class="btn-primary" onclick="addInvestment()">💾 حفظ</button>
    </div></div>
    ${list?`<div class="sec-head">📈 الاستثمارات — ${fmt(sum(state.investments))} ${c}</div><div class="list-wrap">${list}</div>`:''}`;

  } else if(sub==='bill'){
    const list=state.bills.slice().reverse().map((b,i)=>{
      const d=daysUntil(b.nextDate);
      const tag=d===null?'':d<=3?`<span style="color:var(--red);font-weight:800">بعد ${d===0?'اليوم':d+' أيام'}</span>`:d<=7?`<span style="color:var(--orange)">بعد ${d} أيام</span>`:`<span style="color:var(--muted)">${b.nextDate}</span>`;
      return `<div class="list-item">
        <button class="li-del" onclick="delItem('bills',${state.bills.length-1-i})">🗑️</button>
        <div class="li-info"><div class="li-name">📅 ${b.name}</div><div class="li-sub">${tag}</div></div>
        <div class="li-amount">${fmt(b.amount)} ${c}</div>
      </div>`;}).join('');
    formHTML=`<div class="form-wrap"><div class="form-card">
      <div class="form-title">📅 فاتورة متكررة</div>
      <div class="form-group"><label>اسم الفاتورة</label><input type="text" id="f-bname" placeholder="مثال: إيجار، نت"></div>
      <div class="form-group"><label>المبلغ (${c})</label><input type="number" id="f-bamt" min="0" step="0.01" placeholder="0.00"></div>
      <div class="form-group"><label>تاريخ الاستحقاق القادم</label><input type="date" id="f-bdate" value="${today()}"></div>
      <button class="btn-primary" onclick="addBill()">💾 حفظ الفاتورة</button>
    </div></div>
    ${list?`<div class="sec-head">📅 الفواتير المتكررة</div><div class="list-wrap">${list}</div>`:''}`;

  } else if(sub==='receipt'){
    // 📸 RECEIPT SCANNER
    const list=state.receipts.slice().reverse().map((r,i)=>`
      <div class="list-item" style="flex-direction:column;gap:8px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <button class="li-del" onclick="delItem('receipts',${state.receipts.length-1-i})">🗑️</button>
          <div class="li-info"><div class="li-name">📸 ${r.name||'وصل'}</div><div class="li-sub">${r.date||''} — ${r.cat||''}</div></div>
          <div class="li-amount">${fmt(r.amount)} ${c}</div>
        </div>
        ${r.image?`<img src="${r.image}" style="width:100%;max-height:120px;object-fit:cover;border-radius:10px;" onclick="viewReceiptImage('${i}')">`:'' }
      </div>`).join('');
    formHTML=`<div class="form-wrap"><div class="form-card">
      <div class="form-title">📸 مسح وصل الشراء</div>
      <div class="receipt-upload-area" onclick="triggerReceiptCapture()" id="receipt-area">
        <div style="font-size:2.5rem">📷</div>
        <div style="font-weight:800;margin-top:8px">اضغط لتصوير الوصل</div>
        <div style="font-size:.78rem;color:var(--muted);margin-top:4px">أو اختر صورة من المعرض</div>
      </div>
      <div id="receipt-preview" style="display:none;margin-top:10px;">
        <img id="receipt-img-preview" style="width:100%;max-height:160px;object-fit:cover;border-radius:12px;">
      </div>
      <div class="form-group" style="margin-top:10px"><label>اسم المتجر / الوصل</label><input type="text" id="f-rname" placeholder="مثال: Lidl، REWE"></div>
      <div class="form-group"><label>المبلغ (${c})</label><input type="number" id="f-ramt" placeholder="0.00" min="0" step="0.01"></div>
      <div class="form-group"><label>التصنيف</label>
        <select id="f-rcat">
          ${['🍔 طعام','🏠 سكن','🚗 مواصلات','💊 صحة','📚 تعليم','🎮 ترفيه','👗 ملابس','💡 فواتير','📦 أخرى'].map(x=>`<option>${x}</option>`).join('')}
        </select></div>
      <div class="form-group"><label>التاريخ</label><input type="date" id="f-rdate" value="${today()}"></div>
      <button class="btn-primary" onclick="addReceipt()">💾 حفظ الوصل كمصروف</button>
    </div></div>
    ${list?`<div class="sec-head">📸 الوصولات المحفوظة</div><div class="list-wrap">${list}</div>`:''}`;
  }

  return `
    <div class="top-header"><div class="user-name">➕ إضافة</div></div>
    <div class="add-grid">${tabsHTML}</div>
    ${formHTML}`;
}

// ══════════════════════════════════════════════════════════
//  RECEIPT FUNCTIONS
// ══════════════════════════════════════════════════════════
let receiptImageData=null;
function triggerReceiptCapture(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.capture='environment';
  inp.onchange=e=>{
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=new Image(); img.onload=()=>{
        const canvas=document.createElement('canvas'); const MAX=600;
        let w=img.width,h=img.height;
        if(w>h){if(w>MAX){h=h*MAX/w;w=MAX;}}else{if(h>MAX){w=w*MAX/h;h=MAX;}}
        canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
        receiptImageData=canvas.toDataURL('image/jpeg',0.7);
        const area=document.getElementById('receipt-area');
        const preview=document.getElementById('receipt-preview');
        const imgEl=document.getElementById('receipt-img-preview');
        if(area) area.style.display='none';
        if(preview) preview.style.display='block';
        if(imgEl) imgEl.src=receiptImageData;
        toast('✅ تم تحميل الصورة! أدخل المبلغ والتفاصيل');
      }; img.src=ev.target.result;
    }; reader.readAsDataURL(file);
  }; inp.click();
}
function addReceipt(){
  const name=document.getElementById('f-rname')?.value||'وصل';
  const amt=parseFloat(document.getElementById('f-ramt')?.value);
  const cat=document.getElementById('f-rcat')?.value||'📦 أخرى';
  const date=document.getElementById('f-rdate')?.value||today();
  if(!amt||amt<=0){ toast('⚠️ أدخل المبلغ'); return; }
  const rec={name,amount:amt,cat,date,image:receiptImageData};
  state.receipts.push(rec);
  state.expenses.push({cat,amount:amt,date,note:'📸 '+name});
  receiptImageData=null; saveState(); toast('✅ تم حفظ الوصل كمصروف!'); render();
}
function viewReceiptImage(idx){
  // show full-screen image
  const r=state.receipts[state.receipts.length-1-parseInt(idx)];
  if(!r||!r.image)return;
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:9999;display:flex;align-items:center;justify-content:center;';
  ov.innerHTML=`<img src="${r.image}" style="max-width:95%;max-height:90vh;border-radius:16px;"><button style="position:absolute;top:18px;right:18px;background:#fff;border:none;border-radius:50%;width:36px;height:36px;font-size:1.1rem;cursor:pointer;" onclick="this.closest('div').remove()">✕</button>`;
  document.body.appendChild(ov);
}
function renderReceipts(){ navigate('add','receipt'); return ''; }

// ══════════════════════════════════════════════════════════
//  CRUD
// ══════════════════════════════════════════════════════════
function addExpense(){ const cat=document.getElementById('f-cat')?.value; const amt=parseFloat(document.getElementById('f-amt')?.value); if(!amt||amt<=0){toast('⚠️ أدخل مبلغاً صحيحاً');return;} state.expenses.push({cat,amount:amt,date:document.getElementById('f-date')?.value,note:document.getElementById('f-note')?.value}); saveState();toast('✅ تم حفظ المصروف');render(); }
function addSaving(){ const name=document.getElementById('f-name')?.value; const amt=parseFloat(document.getElementById('f-amt')?.value); if(!name||!amt||amt<=0){toast('⚠️ أكمل البيانات');return;} state.savings.push({name,amount:amt,date:document.getElementById('f-date')?.value}); saveState();toast('✅ تم الحفظ');render(); }
function addGoal(){ const name=document.getElementById('f-name')?.value; const target=parseFloat(document.getElementById('f-target')?.value); const saved=parseFloat(document.getElementById('f-saved')?.value)||0; if(!name||!target||target<=0){toast('⚠️ أكمل البيانات');return;} state.goals.push({name,target,saved}); saveState();toast('✅ تم الحفظ');render(); }
function addDebt(){ const name=document.getElementById('f-name')?.value; const total=parseFloat(document.getElementById('f-total')?.value); const paid=parseFloat(document.getElementById('f-paid')?.value)||0; const monthly=parseFloat(document.getElementById('f-monthly')?.value)||0; if(!name||!total||total<=0){toast('⚠️ أكمل البيانات');return;} state.debts.push({name,total,paid,monthly}); saveState();toast('✅ تم الحفظ');render(); }
function addInvestment(){ const platform=document.getElementById('f-platform')?.value; const amt=parseFloat(document.getElementById('f-amt')?.value); if(!amt||amt<=0){toast('⚠️ أدخل مبلغاً صحيحاً');return;} state.investments.push({platform,amount:amt,date:document.getElementById('f-date')?.value,note:document.getElementById('f-note')?.value}); saveState();toast('✅ تم الحفظ');render(); }
function addBill(){ const name=document.getElementById('f-bname')?.value; const amt=parseFloat(document.getElementById('f-bamt')?.value); const date=document.getElementById('f-bdate')?.value; if(!name||!amt||amt<=0){toast('⚠️ أكمل البيانات');return;} state.bills.push({name,amount:amt,nextDate:date}); saveState();toast('✅ تم حفظ الفاتورة');render(); }
function delItem(key,idx){ if(!confirm('حذف هذا العنصر؟'))return; state[key].splice(idx,1); saveState();toast('🗑️ تم الحذف');render(); }

// ══════════════════════════════════════════════════════════
//  REPORTS + MONTH COMPARE
// ══════════════════════════════════════════════════════════
function renderReports(){
  const c=state.currency;
  const totalExp=sum(state.expenses),totalSav=sum(state.savings);
  const totalDebt=state.debts.reduce((a,d)=>a+(d.total-(d.paid||0)),0);
  const totalInv=sum(state.investments);
  const balance=state.income-totalExp;
  const savePct=state.income>0?totalSav/state.income*100:0;
  const debtPct=state.income>0?totalDebt/state.income*100:0;
  let score=100;
  if(!state.income) score=0;
  else{ if(balance<0)score-=40; if(savePct<10)score-=20; else if(savePct<20)score-=10; if(debtPct>50)score-=30; else if(debtPct>30)score-=15; }
  score=Math.max(score,0);
  const scoreColor=score>=80?'var(--green)':score>=60?'var(--orange)':'var(--red)';
  const scoreLbl=score>=80?'ممتاز 🏆':score>=60?'جيد 👍':'يحتاج تحسين ⚠️';
  const kpis=[
    {icon:'💰',label:'الدخل',val:`${fmt(state.income)} ${c}`,bg:'#e8fff3'},
    {icon:'🧾',label:'المصاريف',val:`${fmt(totalExp)} ${c}`,bg:'#fff0f0'},
    {icon:'🏦',label:'المدخرات',val:`${fmt(totalSav)} ${c}`,bg:'#eef0ff'},
    {icon:'💳',label:'الديون',val:`${fmt(totalDebt)} ${c}`,bg:'#fff8e1'},
    {icon:'📈',label:'الاستثمار',val:`${fmt(totalInv)} ${c}`,bg:'#dff3f1'},
    {icon:'⚖️',label:'الرصيد',val:`${fmt(balance)} ${c}`,bg:'#f4f7fc'},
  ];
  const kpiHTML=kpis.map(k=>`<div class="kpi-box" style="background:${k.bg}"><div class="kpi-icon">${k.icon}</div><div class="kpi-lbl">${k.label}</div><div class="kpi-val">${k.val}</div></div>`).join('');

  const cats={};
  state.expenses.forEach(e=>{cats[e.cat]=(cats[e.cat]||0)+e.amount;});
  const catHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>{
    const pct=totalExp>0?Math.round(amt/totalExp*100):0;
    const bgt=state.budgets[cat]||0;
    const over=bgt>0&&amt>bgt;
    return `<div class="cat-bar" style="${over?'border:1.5px solid var(--red)':''}">
      <div class="cat-row"><span class="cat-name">${cat}${over?' ⚠️':''}</span><span class="cat-amt">${fmt(amt)} ${c} (${pct}%)</span></div>
      <div class="prog-wrap"><div class="prog-fill" style="width:${pct}%;${over?'background:var(--red)':''}"></div></div>
      ${bgt>0?`<div style="font-size:.72rem;color:var(--muted)">الميزانية: ${fmt(bgt)} ${c}</div>`:''}
    </div>`;}).join('');

  return `
    <div class="top-header"><div class="user-name">📊 التقارير</div></div>
    <div class="score-card"><div class="score-num" style="color:${scoreColor}">${score}</div><div class="score-lbl" style="color:${scoreColor}">${scoreLbl}</div></div>
    <button class="compare-btn" onclick="navigate('compare')">📊 مقارنة الأشهر ←</button>
    <div class="kpi-grid">${kpiHTML}</div>
    ${catHTML?`<div class="sec-head">🧾 المصاريف حسب التصنيف</div><div style="padding:0 12px">${catHTML}</div>`:''}
    <div style="padding:12px"><button class="btn-primary" onclick="generatePDF()">📤 مشاركة التقرير PDF</button><button class="btn-primary" style="background:var(--surface);color:var(--text);border:1.5px solid var(--border);margin-top:8px" onclick="exportData()">📥 تصدير البيانات JSON</button></div>`;
}

// ══════════════════════════════════════════════════════════
//  MONTH COMPARE
// ══════════════════════════════════════════════════════════
function renderCompare(){
  const c=state.currency;
  // Build list of available months
  const allMonths=[...new Set(state.expenses.map(e=>getMonthKey(e.date)).filter(Boolean))].sort().reverse();
  const monthNames={'01':'يناير','02':'فبراير','03':'مارس','04':'أبريل','05':'مايو','06':'يونيو','07':'يوليو','08':'أغسطس','09':'سبتمبر','10':'أكتوبر','11':'نوفمبر','12':'ديسمبر'};
  function mLabel(k){ const [y,m]=k.split('-'); return (monthNames[m]||m)+' '+y; }

  if(allMonths.length<1){
    return `<div class="top-header"><button onclick="navigate('reports')" class="back-btn">← رجوع</button><div class="user-name">📊 مقارنة الأشهر</div></div>
    <div style="padding:40px 20px;text-align:center;color:var(--muted)"><div style="font-size:3rem">📊</div><div style="font-size:1rem;font-weight:700;margin-top:12px">لا توجد بيانات كافية للمقارنة</div><div style="font-size:.85rem;margin-top:6px">أضف مصاريف بتواريخ مختلفة أولاً</div></div>`;
  }

  const selA=allMonths[0];
  const selB=allMonths.length>1?allMonths[1]:allMonths[0];

  function monthExpenses(mk){ return state.expenses.filter(e=>getMonthKey(e.date)===mk); }
  const expA=sum(monthExpenses(selA)), expB=sum(monthExpenses(selB));
  const savA=sum(state.savings.filter(s=>getMonthKey(s.date)===selA));
  const savB=sum(state.savings.filter(s=>getMonthKey(s.date)===selB));

  // Category breakdown both months
  const catsA={},catsB={};
  monthExpenses(selA).forEach(e=>{catsA[e.cat]=(catsA[e.cat]||0)+e.amount;});
  monthExpenses(selB).forEach(e=>{catsB[e.cat]=(catsB[e.cat]||0)+e.amount;});
  const allCats=[...new Set([...Object.keys(catsA),...Object.keys(catsB)])];
  const maxVal=Math.max(expA,expB,1);

  const bars=allCats.map(cat=>{
    const a=catsA[cat]||0, b=catsB[cat]||0;
    const diff=a-b;
    return `<div style="margin-bottom:10px">
      <div style="font-size:.8rem;font-weight:800;margin-bottom:5px">${cat}</div>
      <div style="display:flex;gap:6px;align-items:center">
        <div style="flex:1">
          <div style="height:10px;background:var(--primary);border-radius:6px;width:${a/maxVal*100}%;min-width:${a>0?4:0}px"></div>
          <div style="font-size:.73rem;color:var(--muted);margin-top:2px">${fmt(a)} ${c}</div>
        </div>
        <div style="font-size:.75rem;color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--muted)'};font-weight:800;min-width:40px;text-align:center">
          ${diff>0?'▲':'▼'} ${fmt(Math.abs(diff))}
        </div>
        <div style="flex:1">
          <div style="height:10px;background:var(--orange);border-radius:6px;width:${b/maxVal*100}%;min-width:${b>0?4:0}px"></div>
          <div style="font-size:.73rem;color:var(--muted);margin-top:2px">${fmt(b)} ${c}</div>
        </div>
      </div>
    </div>`;}).join('');

  const monthOpts=allMonths.map(m=>`<option value="${m}">${mLabel(m)}</option>`).join('');

  return `
    <div class="top-header">
      <button onclick="navigate('reports')" class="back-btn">← رجوع</button>
      <div class="user-name">📊 مقارنة</div>
    </div>

    <div style="padding:0 14px;display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">
      <div>
        <div style="font-size:.75rem;font-weight:800;color:var(--primary);margin-bottom:4px">الشهر الأول</div>
        <select onchange="compareSelChange('A',this.value)" style="width:100%;border:2px solid var(--border);border-radius:12px;padding:9px 10px;font-family:Cairo,sans-serif;font-size:.88rem;background:var(--surface);color:var(--text)">${monthOpts}</select>
      </div>
      <div>
        <div style="font-size:.75rem;font-weight:800;color:var(--orange);margin-bottom:4px">الشهر الثاني</div>
        <select onchange="compareSelChange('B',this.value)" style="width:100%;border:2px solid var(--border);border-radius:12px;padding:9px 10px;font-family:Cairo,sans-serif;font-size:.88rem;background:var(--surface);color:var(--text)">
          ${allMonths.length>1?allMonths.map((m,i)=>`<option value="${m}" ${i===1?'selected':''}>${mLabel(m)}</option>`).join(''):monthOpts}
        </select>
      </div>
    </div>

    <!-- Summary Cards -->
    <div style="padding:12px 14px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="compare-card" style="border-top:3px solid var(--primary)">
        <div class="cc-month">${mLabel(selA)}</div>
        <div class="cc-exp">مصاريف: <strong>${fmt(expA)} ${c}</strong></div>
        <div class="cc-sav">ادخار: <strong>${fmt(savA)} ${c}</strong></div>
      </div>
      <div class="compare-card" style="border-top:3px solid var(--orange)">
        <div class="cc-month">${mLabel(selB)}</div>
        <div class="cc-exp">مصاريف: <strong>${fmt(expB)} ${c}</strong></div>
        <div class="cc-sav">ادخار: <strong>${fmt(savB)} ${c}</strong></div>
      </div>
    </div>

    <!-- Diff Banner -->
    <div style="margin:10px 14px;padding:12px 16px;border-radius:14px;background:${expA>expB?'var(--red-l)':'var(--green-l)'};color:${expA>expB?'var(--red)':'var(--green)'}">
      ${expA>expB?`📈 أنفقت <strong>${fmt(expA-expB)} ${c}</strong> أكثر في ${mLabel(selA)}`:`🎉 وفّرت <strong>${fmt(expB-expA)} ${c}</strong> مقارنةً بـ ${mLabel(selB)}`}
    </div>

    <!-- Bar Chart -->
    <div class="sec-head">📊 مقارنة التصنيفات</div>
    <div style="padding:0 14px 24px">
      <!-- Legend -->
      <div style="display:flex;gap:14px;margin-bottom:10px;font-size:.78rem;font-weight:700">
        <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:4px;background:var(--primary);display:inline-block"></span>${mLabel(selA)}</span>
        <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:12px;border-radius:4px;background:var(--orange);display:inline-block"></span>${mLabel(selB)}</span>
      </div>
      ${bars||`<div style="color:var(--muted);font-size:.88rem">لا توجد بيانات مصاريف للمقارنة</div>`}
    </div>`;
}

let compareA='', compareB='';
function compareSelChange(which, val){
  if(which==='A') compareA=val; else compareB=val;
  // re-render with new selection — simple approach: reload page
  state.compareA=compareA; state.compareB=compareB;
  navigate('compare');
}

// ══════════════════════════════════════════════════════════
//  PDF SHARE
// ══════════════════════════════════════════════════════════
function generatePDF(){
  const c=state.currency;
  const now=new Date();
  const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const totalExp=sum(state.expenses),totalSav=sum(state.savings);
  const totalDebt=state.debts.reduce((a,d)=>a+(d.total-(d.paid||0)),0);
  const totalInv=sum(state.investments);
  const balance=state.income-totalExp;
  const cats={};
  state.expenses.forEach(e=>{cats[e.cat]=(cats[e.cat]||0)+e.amount;});
  const catRows=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>`<tr><td>${cat}</td><td style="text-align:left">${fmt(amt)} ${c}</td><td style="text-align:left">${totalExp>0?Math.round(amt/totalExp*100):0}%</td></tr>`).join('');

  const html=`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>تقرير مالي — ${state.name}</title>
  <style>
    body{font-family:'Cairo',Tahoma,sans-serif;padding:30px;color:#1a1d24;max-width:700px;margin:auto}
    h1{color:#0b7a7f;font-size:1.6rem;margin-bottom:4px}
    .sub{color:#888;font-size:.85rem;margin-bottom:24px}
    .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px}
    .kpi{background:#f4f8fc;border-radius:12px;padding:14px;text-align:center}
    .kpi-v{font-size:1.2rem;font-weight:900;color:#0b7a7f}
    .kpi-l{font-size:.78rem;color:#888;margin-top:4px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th{background:#0b7a7f;color:#fff;padding:8px 12px;text-align:right;font-size:.85rem}
    td{padding:8px 12px;border-bottom:1px solid #eee;font-size:.85rem}
    h2{font-size:1rem;color:#0b7a7f;margin:20px 0 8px}
    @media print{body{padding:0}}
  </style>
  </head><body>
  <h1>📊 التقرير المالي الشهري</h1>
  <div class="sub">${state.name} — ${months[now.getMonth()]} ${now.getFullYear()}</div>
  <div class="grid">
    <div class="kpi"><div class="kpi-v">${fmt(state.income)} ${c}</div><div class="kpi-l">الدخل</div></div>
    <div class="kpi"><div class="kpi-v">${fmt(totalExp)} ${c}</div><div class="kpi-l">المصاريف</div></div>
    <div class="kpi"><div class="kpi-v">${fmt(totalSav)} ${c}</div><div class="kpi-l">المدخرات</div></div>
    <div class="kpi"><div class="kpi-v">${fmt(totalDebt)} ${c}</div><div class="kpi-l">الديون</div></div>
    <div class="kpi"><div class="kpi-v">${fmt(totalInv)} ${c}</div><div class="kpi-l">الاستثمار</div></div>
    <div class="kpi"><div class="kpi-v" style="color:${balance>=0?'#27a663':'#d14e4e'}">${fmt(balance)} ${c}</div><div class="kpi-l">الرصيد</div></div>
  </div>
  <h2>🧾 المصاريف حسب التصنيف</h2>
  <table><thead><tr><th>التصنيف</th><th>المبلغ</th><th>النسبة</th></tr></thead><tbody>${catRows||'<tr><td colspan="3">لا توجد مصاريف</td></tr>'}</tbody></table>
  <p style="margin-top:24px;font-size:.8rem;color:#aaa;text-align:center">تم إنشاؤه بواسطة تطبيق مسار 💰</p>
  </body></html>`;

  const blob=new Blob([html],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);

  // Try Web Share API first (mobile)
  if(navigator.share){
    const file=new File([html],`masar-report-${today()}.html`,{type:'text/html'});
    navigator.share({title:`تقرير مسار — ${state.name}`,text:`تقريري المالي لشهر ${months[now.getMonth()]} ${now.getFullYear()}`,files:[file]})
      .catch(()=>{ window.open(url,'_blank'); });
  } else {
    // Fallback: open print dialog
    const win=window.open(url,'_blank');
    if(win) setTimeout(()=>win.print(),500);
    else toast('افتح الرابط وأطبع/احفظ كـ PDF');
  }
  toast('📤 جارٍ مشاركة التقرير...');
}

function exportData(){
  const blob=new Blob([JSON.stringify({...state,avatar:undefined},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`masar-${today()}.json`;a.click();
  toast('📥 تم تصدير البيانات!');
}

// ══════════════════════════════════════════════════════════
//  TIPS / CHAT
// ══════════════════════════════════════════════════════════
function renderTips(){
  const c=state.currency;
  if(!state.chat.length) state.chat=[{role:'ai',text:`مرحباً ${state.name}! 👋 أنا مساعدك المالي الذكي. اسألني عن الادخار، الاستثمار، أو كيف تحسّن وضعك المالي 💰`}];
  const chatHTML=state.chat.map(m=>`<div class="chat-msg ${m.role==='ai'?'msg-ai':'msg-user'}">${m.text}</div>`).join('');
  const income=state.income,totalExp=sum(state.expenses),totalSav=sum(state.savings);
  const totalDebt=state.debts.reduce((a,d)=>a+(d.total-(d.paid||0)),0);
  const savePct=income>0?totalSav/income*100:0;
  const debtPct=income>0?totalDebt/income*100:0;
  let tips='';
  if(!income) tips=`<div class="tip-box tip-b">💡 أضف دخلك من الإعدادات للحصول على نصائح مخصصة</div>`;
  else{
    const balance=income-totalExp;
    if(balance<0) tips+=`<div class="tip-box tip-r">🔴 مصاريفك تتجاوز دخلك — راجع بنود الإنفاق</div>`;
    if(savePct<10) tips+=`<div class="tip-box tip-y">💛 ادخارك أقل من 10% — ابدأ بـ 50 ${c} شهرياً</div>`;
    else if(savePct<20) tips+=`<div class="tip-box tip-b">💙 ادخارك جيد، حاول الوصول لـ 20%</div>`;
    else tips+=`<div class="tip-box tip-g">💚 معدل ادخارك ممتاز! فوق 20%</div>`;
    if(debtPct>50) tips+=`<div class="tip-box tip-r">🔴 ديونك مرتفعة — ركز على السداد أولاً</div>`;
    const upcoming=state.bills.filter(b=>{const d=daysUntil(b.nextDate);return d!==null&&d<=7&&d>=0;});
    if(upcoming.length) tips+=`<div class="tip-box tip-y">📅 لديك ${upcoming.length} فاتورة تستحق خلال أسبوع</div>`;
  }
  const m=state.etfMonthly,y=state.etfYears,r=state.etfRate;
  const n=y*12,ri=r/100/12;
  const total=ri>0?m*((Math.pow(1+ri,n)-1)/ri)*(1+ri):m*n;
  const dep=m*n;
  return `
    <div class="top-header"><div class="user-name">💡 نصائح وتحليل</div></div>
    <div class="ai-header"><div class="ai-title">🤖 المساعد المالي الذكي</div><div class="ai-sub">اسألني أي شيء عن وضعك المالي</div></div>
    <div class="chat-wrap" id="chat-wrap">${chatHTML}</div>
    <div class="chat-input-wrap">
      <button class="chat-send" onclick="sendChat()">↑</button>
      <input class="chat-input" id="chat-input" placeholder="مثال: كيف أوفر أكثر؟" onkeydown="if(event.key==='Enter')sendChat()">
    </div>
    <div class="sec-head">💡 نصائح مخصصة لك</div>${tips}
    <div class="sec-head">🧮 حاسبة ETF التراكمية</div>
    <div class="range-wrap"><label>القسط الشهري: <strong>${m} ${c}</strong></label><input type="range" min="10" max="2000" step="10" value="${m}" oninput="state.etfMonthly=+this.value;saveState();render()"></div>
    <div class="range-wrap"><label>عدد السنوات: <strong>${y} سنة</strong></label><input type="range" min="1" max="40" value="${y}" oninput="state.etfYears=+this.value;saveState();render()"></div>
    <div class="range-wrap"><label>معدل العائد: <strong>${r}%</strong></label><input type="range" min="1" max="15" step="0.5" value="${r}" oninput="state.etfRate=+this.value;saveState();render()"></div>
    <div class="etf-card"><div class="etf-grid">
      <div><div class="etf-lbl">الإيداع</div><div class="etf-val">${fmt(dep)} ${c}</div></div>
      <div><div class="etf-lbl">الأرباح</div><div class="etf-val etf-profit">+${fmt(total-dep)} ${c}</div></div>
      <div><div class="etf-lbl">النهائي</div><div class="etf-val etf-total">${fmt(total)} ${c}</div></div>
    </div></div>`;
}
function sendChat(){
  const input=document.getElementById('chat-input'); if(!input)return;
  const text=input.value.trim(); if(!text)return;
  state.chat.push({role:'user',text}); input.value='';
  const c=state.currency;
  const balance=state.income-sum(state.expenses);
  const savePct=state.income>0?Math.round(sum(state.savings)/state.income*100):0;
  const q=text.toLowerCase();
  let reply='';
  if(q.includes('وفر')||q.includes('ادخار')||q.includes('ادخر')) reply=`💡 رصيدك المتاح ${fmt(balance)} ${c}. خصص ${fmt(balance*0.3)} ${c} للادخار الفوري. معدلك ${savePct}% ${savePct<20?'— حاول رفعه لـ 20%':'— ممتاز!'}.`;
  else if(q.includes('استثمار')||q.includes('etf')||q.includes('سهم')) reply=`📈 ابدأ بـ Trade Republic أو Scalable Capital بـ 50-100 ${c} شهرياً في MSCI World ETF. على 10 سنوات بعائد 7% ستصل ~17,000 ${c}!`;
  else if(q.includes('دين')||q.includes('قرض')) reply=`💳 استراتيجية السداد:\n• كرة الثلج: ابدأ بأصغر دين\n• الانهيار الجليدي: ابدأ بأعلى فائدة\nبعد السداد حوّل القسط للادخار.`;
  else if(q.includes('مصار')||q.includes('إنفاق')) reply=`🧾 راجع اشتراكاتك وأوقف غير الضروري. الطهي المنزلي يوفر حتى 30% من ميزانية الطعام.`;
  else if(q.includes('pdf')||q.includes('تقرير')) reply=`📤 اذهب لصفحة التقارير واضغط "مشاركة التقرير PDF" لتصدير ومشاركة تقريرك الشهري.`;
  else reply=`💰 رصيدك ${fmt(balance)} ${c} ومعدل ادخارك ${savePct}%.\nاسأل عن: الادخار، الاستثمار، تقليل المصاريف، سداد الديون، أو PIN.`;
  state.chat.push({role:'ai',text:reply}); saveState(); render();
  setTimeout(()=>{const cw=document.getElementById('chat-wrap');if(cw)cw.scrollTop=cw.scrollHeight;},100);
}

// ══════════════════════════════════════════════════════════
//  ACCOUNT
// ══════════════════════════════════════════════════════════
function renderAccount(){
  const c=state.currency;
  return `
    <div class="top-header"><div class="user-name">👤 حسابي</div></div>
    <div class="account-card" style="text-align:center;padding:24px 20px;">
      <div style="position:relative;display:inline-block;margin-bottom:12px;">
        ${renderAvatarEl(90,22)}
        <button onclick="triggerAvatarUpload()" style="position:absolute;bottom:0;right:0;width:30px;height:30px;border-radius:50%;background:var(--primary);color:#fff;border:2px solid var(--surface);font-size:.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✏️</button>
      </div>
      <div style="font-size:1.4rem;font-weight:900;">${state.name}</div>
      <div style="font-size:.88rem;color:var(--muted);margin-top:3px;">الدخل: ${fmt(state.income)} ${c}</div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:14px">
        <button onclick="navigate('settings')" style="background:var(--primary-l);color:var(--primary);border:none;border-radius:12px;padding:10px 18px;font-family:Cairo,sans-serif;font-weight:800;font-size:.88rem;cursor:pointer;">⚙️ الإعدادات</button>
        <button onclick="generatePDF()" style="background:var(--green-l);color:var(--green);border:none;border-radius:12px;padding:10px 18px;font-family:Cairo,sans-serif;font-weight:800;font-size:.88rem;cursor:pointer;">📤 مشاركة PDF</button>
      </div>
    </div>
    <div class="sec-head">📋 ملخص بياناتي</div>
    <div class="list-wrap">
      ${[['🧾 المصاريف',state.expenses.length,`${fmt(sum(state.expenses))} ${c}`],
         ['🏦 المدخرات',state.savings.length,`${fmt(sum(state.savings))} ${c}`],
         ['🎯 الأهداف',state.goals.length,`${calcGoalsPct()}% مكتمل`],
         ['💳 الديون',state.debts.length,`${fmt(state.debts.reduce((a,d)=>a+(d.total-(d.paid||0)),0))} ${c}`],
         ['📈 الاستثمارات',state.investments.length,`${fmt(sum(state.investments))} ${c}`],
         ['📸 الوصولات',state.receipts.length,'مصروف مع صورة'],
        ].map(([l,n,v])=>`
        <div class="list-item">
          <div class="li-info"><div class="li-name">${l}</div><div class="li-sub">${n} عنصر</div></div>
          <div class="li-amount">${v}</div>
        </div>`).join('')}
    </div>
    <div style="padding:12px">
      <button class="btn-primary" onclick="resetOnboarding()">🔄 إعادة عرض الإرشادات</button>
      <button class="btn-primary" style="background:#d46b6b;margin-top:8px" onclick="if(confirm('مسح كل البيانات نهائياً؟')){localStorage.clear();location.reload()}">🗑️ مسح كل البيانات</button>
    </div>`;
}

// ══════════════════════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════════════════════
function renderSettings(){
  const c=state.currency;
  const cats=['🏠 سكن','🍔 طعام','🚗 مواصلات','💊 صحة','📚 تعليم','🎮 ترفيه','👗 ملابس','💡 فواتير','📦 أخرى'];
  const budgetRows=cats.map(cat=>`
    <div class="setting-row">
      <span class="sr-label">${cat}</span>
      <input type="number" min="0" step="1" placeholder="0" value="${state.budgets[cat]||''}"
        style="max-width:100px;border:1.5px solid var(--border);border-radius:9px;padding:5px 10px;font-family:Cairo,sans-serif;font-size:.88rem;direction:rtl;background:var(--surface);color:var(--text);"
        onchange="state.budgets['${cat}']=+this.value||0;saveState();toast('✅ تم الحفظ')">
    </div>`).join('');
  return `
    <div class="top-header">
      <button onclick="navigate('account')" class="back-btn">← رجوع</button>
      <div class="user-name" id="settings-title-lbl">⚙️ الإعدادات</div>
    </div>
    <div class="sec-head">👤 المعلومات الشخصية</div>
    <div class="settings-section">
      <div class="setting-row" style="gap:12px">
        ${renderAvatarEl(52,14)}
        <div style="flex:1">
          <div style="font-weight:800;font-size:.9rem">${state.name}</div>
          <button onclick="triggerAvatarUpload()" style="background:var(--primary-l);color:var(--primary);border:none;border-radius:8px;padding:5px 12px;font-family:Cairo,sans-serif;font-weight:700;font-size:.78rem;cursor:pointer;margin-top:4px;">📷 تغيير الصورة</button>
          ${state.avatar?`<button onclick="state.avatar=null;saveState();render()" style="background:var(--red-l);color:var(--red);border:none;border-radius:8px;padding:5px 10px;font-family:Cairo,sans-serif;font-weight:700;font-size:.78rem;cursor:pointer;margin-top:4px;margin-right:4px;">🗑️ حذف</button>`:''}
        </div>
      </div>
      <div class="setting-row"><span class="sr-label">الاسم</span><input value="${state.name}" onchange="state.name=this.value;saveState();render()" style="max-width:140px;border:1.5px solid var(--border);border-radius:9px;padding:5px 10px;font-family:Cairo,sans-serif;text-align:right;background:var(--surface);color:var(--text)"></div>
      <div class="setting-row"><span class="sr-label">الدخل الشهري</span><input type="number" value="${state.income}" onchange="state.income=+this.value;saveState();render()" style="max-width:110px;border:1.5px solid var(--border);border-radius:9px;padding:5px 10px;font-family:Cairo,sans-serif;background:var(--surface);color:var(--text)"></div>
    </div>
    <div class="sec-head">🎨 التفضيلات</div>
    <div class="settings-section">
      <div class="setting-row">
        <span class="sr-label" id="sl-lang-lbl">🌐 اللغة</span>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
          <button onclick="changeLang('ar')" id="sl-btn-ar"
            style="border:2px solid ${state.lang==='ar'?'var(--primary)':'var(--border)'};background:${state.lang==='ar'?'var(--primary-l)':'var(--surface)'};color:${state.lang==='ar'?'var(--primary)':'var(--text)'};border-radius:10px;padding:5px 12px;font-family:Cairo,sans-serif;font-size:.82rem;font-weight:700;cursor:pointer">🇸🇦 عربي</button>
          <button onclick="changeLang('en')" id="sl-btn-en"
            style="border:2px solid ${state.lang==='en'?'var(--primary)':'var(--border)'};background:${state.lang==='en'?'var(--primary-l)':'var(--surface)'};color:${state.lang==='en'?'var(--primary)':'var(--text)'};border-radius:10px;padding:5px 12px;font-family:Cairo,sans-serif;font-size:.82rem;font-weight:700;cursor:pointer">🇬🇧 English</button>
          <button onclick="changeLang('de')" id="sl-btn-de"
            style="border:2px solid ${state.lang==='de'?'var(--primary)':'var(--border)'};background:${state.lang==='de'?'var(--primary-l)':'var(--surface)'};color:${state.lang==='de'?'var(--primary)':'var(--text)'};border-radius:10px;padding:5px 12px;font-family:Cairo,sans-serif;font-size:.82rem;font-weight:700;cursor:pointer">🇩🇪 Deutsch</button>
        </div>
      </div>
      <div class="setting-row"><span class="sr-label" id="sl-cur-lbl">💱 العملة</span>
        <select onchange="state.currency=this.value;saveState();render()" style="border:1.5px solid var(--border);border-radius:9px;padding:5px 10px;font-family:Cairo,sans-serif;background:var(--surface);color:var(--text)">
          ${['€','$','£','﷼','د.إ','TL'].map(x=>`<option ${state.currency===x?'selected':''}>${x}</option>`).join('')}
        </select></div>
      <div class="setting-row"><span class="sr-label">🌙 الوضع الليلي</span>
        <label class="toggle-switch"><input type="checkbox" ${state.darkMode?'checked':''} onchange="state.darkMode=this.checked;applyTheme();saveState();render()"><span class="toggle-slider"></span></label></div>
      <div class="setting-row"><span class="sr-label">🔔 تنبيهات الميزانية</span>
        <label class="toggle-switch"><input type="checkbox" ${state.budgetAlerts?'checked':''} onchange="state.budgetAlerts=this.checked;saveState();toast('✅ تم الحفظ')"><span class="toggle-slider"></span></label></div>
    </div>
    <div class="sec-head">💰 الدخل الشهري</div>
    <div class="settings-section" style="margin:0 14px 8px">
      <div class="setting-row">
        <span class="sr-label">الدخل الحالي</span>
        <span style="font-size:.9rem;font-weight:900;color:var(--primary)">${state.income>0?fmt(state.income)+' '+c:'غير محدد'}</span>
      </div>
      <div class="setting-row">
        <span class="sr-label" style="font-size:.82rem;color:var(--muted)">يُستخدم لحساب الرصيد والنسب</span>
        <button onclick="editIncome()" style="background:var(--primary-l);border:none;border-radius:9px;padding:6px 14px;font-family:Cairo,sans-serif;font-weight:700;font-size:.8rem;cursor:pointer;color:var(--primary)">تعديل</button>
      </div>
    </div>
    <div class="sec-head">📧 البريد الإلكتروني</div>
    <div class="settings-section" style="margin:0 14px 8px">
      <div class="setting-row">
        <span class="sr-label">البريد المسجّل</span>
        <span style="font-size:.82rem;color:var(--muted);direction:ltr">${state.email||'غير محدد'}</span>
      </div>
      <div class="setting-row">
        <span class="sr-label" style="font-size:.82rem;color:var(--muted)">يُستخدم لاستعادة رمز PIN</span>
        <button onclick="editEmail()" style="background:var(--primary-l);border:none;border-radius:9px;padding:6px 14px;font-family:Cairo,sans-serif;font-weight:700;font-size:.8rem;cursor:pointer;color:var(--primary)">تعديل</button>
      </div>
    </div>
    <div class="sec-head">🔐 حماية PIN</div>
    <div class="settings-section">
      <div class="setting-row">
        <span class="sr-label">${state.pinEnabled?'🔒 رمز PIN مفعّل':'🔓 رمز PIN معطّل'}</span>
        ${state.pinEnabled
          ? `<button onclick="disablePin()" style="background:var(--red-l);color:var(--red);border:none;border-radius:10px;padding:8px 16px;font-family:Cairo,sans-serif;font-weight:800;font-size:.82rem;cursor:pointer;">إيقاف</button>`
          : `<button onclick="enablePinCheck()" style="background:var(--primary-l);color:var(--primary);border:none;border-radius:10px;padding:8px 16px;font-family:Cairo,sans-serif;font-weight:800;font-size:.82rem;cursor:pointer;">تفعيل</button>`}
      </div>
      ${state.pinEnabled?`<div class="setting-row"><span class="sr-label" style="color:var(--muted);font-size:.82rem">يحمي تطبيقك عند كل فتح</span><button onclick="enablePinCheck()" style="background:var(--border);border:none;border-radius:9px;padding:6px 14px;font-family:Cairo,sans-serif;font-weight:700;font-size:.8rem;cursor:pointer;color:var(--text)">تغيير الرمز</button></div>`:''}
    </div>
    <div class="sec-head">💰 ميزانية لكل تصنيف (${c})</div>
    <div class="settings-section">${budgetRows}</div>
    <div class="sec-head">⚠️ منطقة الخطر</div>
    <div style="padding:0 12px 24px">
      <button class="btn-primary" onclick="resetOnboarding()" style="background:var(--surface);color:var(--text);border:1.5px solid var(--border);margin-bottom:8px;">🔄 إعادة الإرشادات</button>
      <button class="btn-primary" onclick="if(confirm('مسح كل بياناتك نهائياً؟')){localStorage.clear();location.reload()}" style="background:#d46b6b;">🗑️ مسح كل البيانات</button>
    </div>`;
}

// ══════════════════════════════════════════════════════════
//  PWA
// ══════════════════════════════════════════════════════════
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault(); deferredPrompt=e;
  setTimeout(()=>{
    const b=document.createElement('div');
    b.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);width:calc(min(480px,100%)-24px);background:linear-gradient(135deg,#0b7a7f,#0a9ea6);color:#fff;padding:12px 16px;border-radius:16px;display:flex;align-items:center;justify-content:space-between;gap:10px;z-index:9000;box-shadow:0 4px 20px rgba(11,122,127,.4)';
    b.innerHTML=`<div style="font-size:.88rem;font-weight:700">📱 ثبّت مسار على شاشتك!</div><button onclick="deferredPrompt.prompt();this.closest('div').remove()" style="background:#fff;color:#0b7a7f;border:none;border-radius:10px;padding:8px 14px;font-family:Cairo,sans-serif;font-weight:800;font-size:.85rem;cursor:pointer;white-space:nowrap">تثبيت</button><button onclick="this.closest('div').remove()" style="background:none;border:none;color:#fff;font-size:1.1rem;cursor:pointer">✕</button>`;
    document.body.appendChild(b);
  },5000);
});

initApp();

// ── Edit email from settings
function editEmail(){
  const cur=state.email||'';
  const neo=prompt('أدخل بريدك الإلكتروني الجديد:', cur);
  if(neo===null) return;
  const emailRx=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(neo.trim()&&!emailRx.test(neo.trim())){ toast('⚠️ بريد غير صحيح'); return; }
  state.email=neo.trim().toLowerCase();
  saveState(); toast('✅ تم تحديث البريد الإلكتروني'); render();
}

// ── Edit income from settings (since it's optional at register)
function editIncome(){
  const cur=state.income||0;
  const neo=prompt('💰 أدخل دخلك الشهري:', cur||'');
  if(neo===null) return;
  const val=parseFloat(neo)||0;
  state.income=val; saveState();
  toast(val>0?`✅ تم تحديث الدخل: ${fmt(val)} ${state.currency}`:'✅ تم مسح الدخل');
  render();
}
