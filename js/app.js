(function(){
  const $ = selector => document.querySelector(selector);
  const qs = selector => document.querySelectorAll(selector);

  const form = $('#todo-form');
  const input = $('#todo-input');
  const dateInput = $('#date-input');
  const listEl = $('#todo-list');
  const emptyEl = $('#empty');
  const errorEl = $('#error');
  const filterEl = $('#filter-status');
  const searchEl = $('#search');

  const STORAGE_KEY = 'codingcamp_todos_v1';

  let todos = load();

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      console.error('Gagal membaca storage', e);
      return [];
    }
  }

  function uid(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  }

  function validateTask(text, date){
    if(!text || text.trim().length === 0) return 'Teks tugas tidak boleh kosong.';
    if(!date) return 'Tanggal harus diisi.';
    const selected = new Date(date);
    const today = new Date();
    // zero time for comparison
    today.setHours(0,0,0,0);
    selected.setHours(0,0,0,0);
    if(selected < today) return 'Tanggal harus hari ini atau setelahnya.';
    return null;
  }

  function addTodo(text, date){
    const id = uid();
    todos.push({id,text: text.trim(), date, completed:false});
    save();
    render();
  }

  function removeTodo(id){
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  function toggleCompleted(id){
    const item = todos.find(t => t.id === id);
    if(item) item.completed = !item.completed;
    save();
    render();
  }

  function formatDate(iso){
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { year:'numeric', month:'short', day:'numeric' });
  }

  function applyFilter(items){
    const fs = filterEl.value;
    if(fs === 'pending') return items.filter(i => !i.completed);
    if(fs === 'completed') return items.filter(i => i.completed);
    return items;
  }

  function applySearch(items){
    const q = searchEl.value.trim().toLowerCase();
    if(!q) return items;
    return items.filter(i => i.text.toLowerCase().includes(q));
  }

  function render(){
    // clear
    listEl.innerHTML = '';
    if(todos.length === 0){
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';

    let items = [...todos];
    items = applyFilter(items);
    items = applySearch(items);

    if(items.length === 0){
      listEl.innerHTML = '<li class="muted">Tidak ada tugas sesuai filter/hasil pencarian.</li>';
      return;
    }

    items.sort((a,b)=> new Date(a.date) - new Date(b.date));

    for(const t of items){
      const li = document.createElement('li');
      li.className = 'todo-item' + (t.completed ? ' completed' : '');

      const checkbox = document.createElement('button');
      checkbox.className = 'small-btn complete';
      checkbox.setAttribute('aria-label','Tandai selesai');
      checkbox.textContent = t.completed ? '✓' : '○';
      checkbox.addEventListener('click', ()=> toggleCompleted(t.id));

      const main = document.createElement('div');
      main.className = 'todo-main';
      const title = document.createElement('div');
      title.className = 'todo-title';
      title.textContent = t.text;
      const date = document.createElement('div');
      date.className = 'todo-date';
      date.textContent = formatDate(t.date);

      main.appendChild(title);
      main.appendChild(date);

      const btns = document.createElement('div');
      btns.className = 'btns';

      const del = document.createElement('button');
      del.className = 'small-btn delete';
      del.textContent = 'Hapus';
      del.addEventListener('click', ()=>{
        if(confirm('Hapus tugas ini?')) removeTodo(t.id);
      });

      btns.appendChild(del);

      li.appendChild(checkbox);
      li.appendChild(main);
      li.appendChild(btns);

      listEl.appendChild(li);
    }
  }

  // event handlers
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    errorEl.textContent = '';
    const text = input.value;
    const date = dateInput.value;
    const err = validateTask(text,date);
    if(err){ errorEl.textContent = err; return; }
    addTodo(text,date);
    form.reset();
    // set date to today for convenience
    dateInput.value = '';
  });

  filterEl.addEventListener('change', ()=> render());
  searchEl.addEventListener('input', ()=> render());

  // initial render
  render();

  // expose for debug (optional)
  window._todos = todos;
})();
