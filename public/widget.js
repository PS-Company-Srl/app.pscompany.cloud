(function () {
  'use strict';

  var script = document.currentScript;
  var apiKey = script && script.getAttribute('data-api-key');
  var apiUrl = (script && script.getAttribute('data-api-url')) || '';

  if (!apiKey || !apiUrl) return;

  apiUrl = apiUrl.replace(/\/$/, '');
  var base = apiUrl + '/api/chatbot';

  var history = [];
  var open = false;
  var config = { company_name: 'Assistente', welcome_message: 'Ciao! Come posso aiutarti?', primary_color: '#4f46e5', position: 'bottom-right', icon_url: null };
  var sessionStorageKey = 'pscompany_sid_' + (apiKey ? apiKey.replace(/\W/g, '_').slice(0, 20) : 'default');
  function getSessionId() {
    try {
      return localStorage.getItem(sessionStorageKey) || '';
    } catch (e) { return ''; }
  }
  function setSessionId(id) {
    try {
      if (id) localStorage.setItem(sessionStorageKey, id);
    } catch (e) {}
  }
  // Genera subito un session_id lato client se manca, così email e telefono restano nella stessa conversazione
  if (!getSessionId()) {
    setSessionId('sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12));
  }

  function darkenHex(hex, pct) {
    var n = hex.replace(/^#/, '');
    var r = Math.max(0, parseInt(n.substr(0, 2), 16) * (1 - pct));
    var g = Math.max(0, parseInt(n.substr(2, 2), 16) * (1 - pct));
    var b = Math.max(0, parseInt(n.substr(4, 2), 16) * (1 - pct));
    return '#' + [r, g, b].map(function (x) { return ('0' + Math.round(x).toString(16)).slice(-2); }).join('');
  }

  var root = document.createElement('div');
  root.id = 'pscompany-chatbot-root';
  root.setAttribute('data-position', config.position);
  root.style.setProperty('--pscompany-primary', config.primary_color);
  root.style.setProperty('--pscompany-primary-dark', darkenHex(config.primary_color, 0.12));
  root.innerHTML =
    '<style>' +
    '#pscompany-chatbot-root{font-family:system-ui,sans-serif;position:fixed;bottom:20px;right:20px;left:auto;z-index:99999;}' +
    '#pscompany-chatbot-root[data-position="bottom-left"]{left:20px;right:auto;}' +
    '#pscompany-chatbot-btn{width:56px;height:56px;border-radius:50%;border:none;background:var(--pscompany-primary,#4f46e5);color:#fff;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;font-size:24px;}' +
    '#pscompany-chatbot-btn:hover{background:var(--pscompany-primary-dark,#4338ca);}' +
    '#pscompany-chatbot-panel{display:none;position:absolute;bottom:70px;right:0;left:auto;width:380px;max-width:calc(100vw - 40px);height:480px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.12);flex-direction:column;overflow:hidden;}' +
    '#pscompany-chatbot-root[data-position="bottom-left"] #pscompany-chatbot-panel{left:0;right:auto;}' +
    '#pscompany-chatbot-panel.open{display:flex;}' +
    '#pscompany-chatbot-header{padding:16px;background:var(--pscompany-primary,#4f46e5);color:#fff;font-weight:600;}' +
    '#pscompany-chatbot-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;}' +
    '#pscompany-chatbot-messages .msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:14px;}' +
    '#pscompany-chatbot-messages .msg.user{align-self:flex-end;background:var(--pscompany-primary,#4f46e5);color:#fff;}' +
    '#pscompany-chatbot-messages .msg.assistant{align-self:flex-start;background:#f1f5f9;color:#1e293b;}' +
    '#pscompany-chatbot-form{display:flex;gap:8px;padding:12px;border-top:1px solid #e2e8f0;}' +
    '#pscompany-chatbot-input{flex:1;padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;}' +
    '#pscompany-chatbot-send{padding:10px 16px;background:var(--pscompany-primary,#4f46e5);color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:500;}' +
    '#pscompany-chatbot-send:hover{background:var(--pscompany-primary-dark,#4338ca);}' +
    '#pscompany-chatbot-send:disabled{opacity:.6;cursor:not-allowed;}' +
    '#pscompany-chatbot-btn img{width:28px;height:28px;object-fit:contain;pointer-events:none;}' +
    '.pscompany-typing{color:#64748b;font-size:13px;}' +
    '</style>' +
    '<button id="pscompany-chatbot-btn" aria-label="Apri chat">💬</button>' +
    '<div id="pscompany-chatbot-panel">' +
    '  <div id="pscompany-chatbot-header"></div>' +
    '  <div id="pscompany-chatbot-messages"></div>' +
    '  <form id="pscompany-chatbot-form">' +
    '    <input id="pscompany-chatbot-input" type="text" placeholder="Scrivi un messaggio..." autocomplete="off">' +
    '    <button id="pscompany-chatbot-send" type="submit">Invia</button>' +
    '  </form>' +
    '</div>';
  document.body.appendChild(root);
  fetchConfig();

  var btn = document.getElementById('pscompany-chatbot-btn');
  var panel = document.getElementById('pscompany-chatbot-panel');
  var header = document.getElementById('pscompany-chatbot-header');
  var messagesEl = document.getElementById('pscompany-chatbot-messages');
  var form = document.getElementById('pscompany-chatbot-form');
  var input = document.getElementById('pscompany-chatbot-input');
  var sendBtn = document.getElementById('pscompany-chatbot-send');

  function setOpen(o) {
    open = o;
    panel.classList.toggle('open', open);
  }

  function addMessage(role, content) {
    var div = document.createElement('div');
    div.className = 'msg ' + role;
    div.textContent = content;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function applyConfig() {
    root.setAttribute('data-position', config.position || 'bottom-right');
    var primary = config.primary_color || '#4f46e5';
    root.style.setProperty('--pscompany-primary', primary);
    root.style.setProperty('--pscompany-primary-dark', darkenHex(primary, 0.12));
    var btnEl = document.getElementById('pscompany-chatbot-btn');
    if (btnEl) {
      if (config.icon_url) {
        btnEl.innerHTML = '<img src="' + config.icon_url.replace(/"/g, '&quot;') + '" alt="">';
      } else {
        btnEl.textContent = '\uD83D\uDCAC';
      }
    }
  }

  function fetchConfig() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', base + '/config', true);
    xhr.setRequestHeader('X-API-Key', apiKey);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          config = JSON.parse(xhr.responseText);
          applyConfig();
          header.textContent = config.company_name || 'Chat';
          if (config.welcome_message && messagesEl.children.length === 0) {
            addMessage('assistant', config.welcome_message);
          }
        } catch (e) {}
      }
    };
    xhr.send();
  }

  function sendMessage() {
    var text = (input.value || '').trim();
    if (!text) return;

    addMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    sendBtn.disabled = true;

    var typing = document.createElement('div');
    typing.className = 'msg assistant pscompany-typing';
    typing.textContent = 'Sto pensando...';
    typing.id = 'pscompany-typing';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', base + '/message', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-API-Key', apiKey);
    xhr.onload = function () {
      var el = document.getElementById('pscompany-typing');
      if (el) el.remove();
      sendBtn.disabled = false;
      var reply = 'Mi dispiace, si è verificato un errore.';
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          reply = data.reply || reply;
          if (data.session_id) setSessionId(data.session_id);
        } catch (e) {}
      }
      addMessage('assistant', reply);
      history.push({ role: 'assistant', content: reply });
      messagesEl.scrollTop = messagesEl.scrollHeight;
    };
    xhr.onerror = function () {
      var el = document.getElementById('pscompany-typing');
      if (el) el.remove();
      sendBtn.disabled = false;
      addMessage('assistant', 'Errore di connessione. Riprova.');
    };
    var payload = { message: text, history: history.slice(-20), session_id: getSessionId() };
    xhr.send(JSON.stringify(payload));
  }

  btn.addEventListener('click', function () {
    setOpen(!open);
    if (open && messagesEl.children.length === 0) fetchConfig();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    sendMessage();
  });
})();
