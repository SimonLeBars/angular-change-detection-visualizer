// ─── STATE ───
let totalRenders = 0;
let logCount = 0;
let counter = 0;
let items = ['Premier élément', 'Deuxième élément', 'Troisième élément'];
let formData = { firstname: '', email: '' };
let animationDuration = '1s';
let observedNodes = 0;

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  observedNodes = document.querySelectorAll('.dom-node').length;
  document.getElementById('stat-nodes').textContent = observedNodes;

  renderList(false);

  document.getElementById('duration-select').addEventListener('change', (e) => {
    animationDuration = e.target.value;
    document.documentElement.style.setProperty('--render-duration', animationDuration);
  });
});

// ─── FLASH ENGINE ───
function flashNode(nodeId, component, action, detail) {
  const el = document.getElementById(nodeId);
  if (!el) return;

  el.classList.remove('re-rendered');
  void el.offsetWidth;
  el.classList.add('re-rendered');

  if (document.getElementById('highlight-all').checked) {
    const parent = el.closest('.component-card-body.dom-node');
    if (parent && parent !== el) {
      parent.classList.remove('re-rendered');
      void parent.offsetWidth;
      parent.classList.add('re-rendered');
    }
  }

  const dur = parseFloat(animationDuration) * 1000;
  setTimeout(() => el.classList.remove('re-rendered'), dur + 50);

  addLog(component, action, detail, 'render');

  totalRenders++;
  document.getElementById('total-renders').textContent = totalRenders;
  document.getElementById('stat-total').textContent = totalRenders;
  document.getElementById('stat-last').textContent = component;
}

// ─── LOG ───
function addLog(component, action, detail, type = 'render') {
  const empty = document.getElementById('log-empty');
  if (empty) empty.remove();

  logCount++;
  document.getElementById('log-count-badge').textContent = logCount;

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}.${String(now.getMilliseconds()).padStart(3,'0')}`;

  const entry = document.createElement('div');
  entry.className = `log-entry log-type-${type}`;
  entry.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-component-dot"></span>
    <span class="log-component">${component}</span>
    <span class="log-action"> → ${action}</span>
    ${detail ? `<span class="log-detail"> [${detail}]</span>` : ''}
  `;

  const container = document.getElementById('log-entries');
  container.insertBefore(entry, container.firstChild);

  const entries = container.querySelectorAll('.log-entry');
  if (entries.length > 80) entries[entries.length - 1].remove();
}

function clearLog() {
  const container = document.getElementById('log-entries');
  container.innerHTML = '<div class="log-empty" id="log-empty">Log effacé<br><span style="font-size:0.6rem">Interagissez avec les composants →</span></div>';
  logCount = 0;
  document.getElementById('log-count-badge').textContent = '0';
}

// ─── COUNTER COMPONENT ───
function counterIncrement() {
  counter++;
  updateCounter();
  flashNode('node-count-value', 'CounterComponent', 'counter++', counter);
}

function counterDecrement() {
  counter--;
  updateCounter();
  flashNode('node-count-value', 'CounterComponent', 'counter--', counter);
}

function counterReset() {
  counter = 0;
  updateCounter();
  flashNode('node-counter-wrapper', 'CounterComponent', 'reset()', 0);
}

function updateCounter() {
  const el = document.getElementById('node-count-value');
  el.textContent = counter;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
  setTimeout(() => el.classList.remove('pop'), 300);
}

// ─── LIST COMPONENT ───
function renderList(animate = true) {
  const ul = document.getElementById('node-item-list');
  ul.innerHTML = '';
  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'dom-node';
    li.id = `node-list-item-${i}`;
    li.innerHTML = `<span><span class="item-index">[${i}]</span>${item}</span><button class="item-delete" onclick="listDeleteItem(${i})">✕</button>`;
    ul.appendChild(li);
    if (animate) {
      li.classList.add('re-rendered');
      const dur = parseFloat(animationDuration) * 1000;
      setTimeout(() => li.classList.remove('re-rendered'), dur + 50);
    }
  });
  observedNodes = document.querySelectorAll('.dom-node').length;
  document.getElementById('stat-nodes').textContent = observedNodes;
}

function listAddItem() {
  const names = ['Nouveau composant', 'Service injecté', 'Module chargé', 'Directive appliquée', 'Pipe transformé', 'Guard activé'];
  const name = names[Math.floor(Math.random() * names.length)] + ` #${items.length + 1}`;
  items.push(name);
  renderList(true);
  flashNode('node-list-wrapper', 'ListComponent', 'items.push()', `length=${items.length}`);
  addLog('NgFor', 're-render complet', `${items.length} nœuds`, 'render');
}

function listDeleteItem(index) {
  const removed = items[index];
  items.splice(index, 1);
  renderList(true);
  flashNode('node-list-wrapper', 'ListComponent', 'items.splice()', `"${removed}"`);
  addLog('NgFor', 're-render complet', `${items.length} nœuds restants`, 'render');
}

function listShuffleItems() {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  renderList(true);
  flashNode('node-list-wrapper', 'ListComponent', 'shuffle() → trackBy manquant', 'tous les nœuds re-rendus');
  addLog('NgFor', 'sans trackBy : re-render total', `${items.length} nœuds`, 'render');
}

// ─── FORM COMPONENT ───
function formUpdate(field, value) {
  formData[field] = value;
  const preview = document.getElementById('node-form-json');
  preview.textContent = `{ prénom: "${formData.firstname}", email: "${formData.email}" }`;

  const nodeId = field === 'firstname' ? 'node-input-firstname' : 'node-input-email';
  flashNode(nodeId, 'ReactiveForm', `valueChanges → ${field}`, `"${value}"`);
  flashNode('node-form-preview', 'ReactiveForm', 'FormGroup mis à jour', null);
}

// ─── TOGGLE COMPONENT ───
function togglePanel(id, show) {
  const panel = document.getElementById(`node-panel-${id}`);
  if (show) {
    panel.style.display = 'block';
    flashNode(`node-panel-${id}`, 'NgIf', `showPanel${id.toUpperCase()} = true`, 'nœud inséré');
    addLog('NgIf', `création du nœud #panel-${id}`, 'DOM insert', 'init');
  } else {
    flashNode(`node-panel-${id}`, 'NgIf', `showPanel${id.toUpperCase()} = false`, 'nœud supprimé');
    const dur = parseFloat(animationDuration) * 1000;
    setTimeout(() => { panel.style.display = 'none'; }, dur * 0.5);
    addLog('NgIf', `destruction du nœud #panel-${id}`, 'DOM remove', 'render');
  }
}
