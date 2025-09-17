// サンプル装置・日付・時間帯
const devices = [
  { device_id: 1, device_name: "装置A" },
  { device_id: 2, device_name: "装置B" }
];
const dates = ["2025-09-17", "2025-09-18"];
const timeslots = ["午前", "午後", "夜間"];

// テンプレート定義
const templates = [
  { name: "赤背景", bgcolor: "#f88", fontcolor: "#000", borderstyle: "solid" },
  { name: "青背景", bgcolor: "#88f", fontcolor: "#fff", borderstyle: "dashed" },
  { name: "緑背景", bgcolor: "#8f8", fontcolor: "#222", borderstyle: "double" },
  { name: "黄背景", bgcolor: "#ff8", fontcolor: "#333", borderstyle: "groove" },
  { name: "グレー", bgcolor: "#ccc", fontcolor: "#111", borderstyle: "ridge" },
  { name: "ピンク", bgcolor: "#f8c", fontcolor: "#222", borderstyle: "solid" },
  { name: "オレンジ", bgcolor: "#fa4", fontcolor: "#fff", borderstyle: "dotted" },
  { name: "紫", bgcolor: "#a8f", fontcolor: "#fff", borderstyle: "solid" },
  { name: "黒", bgcolor: "#222", fontcolor: "#fff", borderstyle: "solid" },
  { name: "白", bgcolor: "#fff", fontcolor: "#000", borderstyle: "solid" }
];

// グリッド生成
const grid = document.getElementById('grid');
let cellMap = {}; // "deviceId_date_timeslot" => cellDiv

devices.forEach(device => {
  dates.forEach(date => {
    timeslots.forEach(timeslot => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.deviceId = device.device_id;
      cell.dataset.date = date;
      cell.dataset.timeslot = timeslot;
      cell.title = `${device.device_name} ${date} ${timeslot}`;
      cellMap[`${device.device_id}_${date}_${timeslot}`] = cell;
      cell.addEventListener('click', e => openModal(cell));
      grid.appendChild(cell);
    });
  });
});

// テンプレート選択肢
const templateSelect = document.getElementById('templateSelect');
templates.forEach((tpl, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = tpl.name;
  templateSelect.appendChild(opt);
});

// モーダル制御
const modal = document.getElementById('modal');
let currentCell = null;
document.getElementById('closeModalBtn').onclick = () => modal.classList.remove('show');
function openModal(cell) {
  currentCell = cell;
  document.getElementById('commentInput').value = '';
  templateSelect.selectedIndex = 0;
  modal.classList.add('show');
}

// ラベル生成
document.getElementById('saveLabelBtn').onclick = function() {
  const tpl = templates[templateSelect.value];
  const comment = document.getElementById('commentInput').value;
  if (!comment) return alert('コメント必須');
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = comment;
  label.style.background = tpl.bgcolor;
  label.style.color = tpl.fontcolor;
  label.style.border = `2px ${tpl.borderstyle} ${tpl.fontcolor}`;
  label.style.left = '10px';
  label.style.top = '10px';
  label.style.width = '80px';
  label.style.height = '30px';
  label.draggable = true;
  label.dataset.bgcolor = tpl.bgcolor;
  label.dataset.fontcolor = tpl.fontcolor;
  label.dataset.borderstyle = tpl.borderstyle;
  label.dataset.comment = comment;
  // ドラッグ移動
  label.onmousedown = dragLabel;
  // リサイズ
  label.onpointerdown = resizeLabel;
  currentCell.appendChild(label);
  modal.classList.remove('show');
};

// ドラッグ移動
function dragLabel(e) {
  if (e.target.className !== 'label') return;
  const label = e.target;
  let offsetX = e.offsetX, offsetY = e.offsetY;
  function move(ev) {
    label.style.left = (ev.clientX - currentCell.getBoundingClientRect().left - offsetX) + 'px';
    label.style.top = (ev.clientY - currentCell.getBoundingClientRect().top - offsetY) + 'px';
  }
  function up() {
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
  }
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', up);
}

// リサイズ
function resizeLabel(e) {
  if (!e.target.classList.contains('label')) return;
  const label = e.target;
  if (e.offsetX > label.offsetWidth - 10 && e.offsetY > label.offsetHeight - 10) {
    e.preventDefault();
    function move(ev) {
      label.style.width = (ev.clientX - label.getBoundingClientRect().left) + 'px';
      label.style.height = (ev.clientY - label.getBoundingClientRect().top) + 'px';
    }
    function up() {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }
}

// 登録ボタン
document.getElementById('registerBtn').onclick = function() {
  const labels = [];
  Object.values(cellMap).forEach(cell => {
    Array.from(cell.getElementsByClassName('label')).forEach(label => {
      labels.push({
        id: Date.now() + Math.floor(Math.random()*10000),
        device_id: cell.dataset.deviceId,
        date: cell.dataset.date,
        timeslot: cell.dataset.timeslot,
        comment: label.dataset.comment,
        bgcolor: label.dataset.bgcolor,
        fontcolor: label.dataset.fontcolor,
        borderstyle: label.dataset.borderstyle,
        pos_x: parseInt(label.style.left),
        pos_y: parseInt(label.style.top),
        width: parseInt(label.style.width),
        height: parseInt(label.style.height)
      });
    });
  });
  fetch('AllocationServlet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(labels)
  }).then(r => {
    if (r.ok) alert('登録完了');
    else alert('登録失敗');
  });
};

// 初期表示（DBから取得して再現）
window.onload = function() {
  fetch('AllocationServlet')
    .then(r => r.json())
    .then(data => {
      data.forEach(l => {
        const key = `${l.device_id}_${l.date}_${l.timeslot}`;
        const cell = cellMap[key];
        if (!cell) return;
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = l.comment;
        label.style.background = l.bgcolor;
        label.style.color = l.fontcolor;
        label.style.border = `2px ${l.borderstyle} ${l.fontcolor}`;
        label.style.left = l.pos_x + 'px';
        label.style.top = l.pos_y + 'px';
        label.style.width = l.width + 'px';
        label.style.height = l.height + 'px';
        label.draggable = true;
        label.dataset.bgcolor = l.bgcolor;
        label.dataset.fontcolor = l.fontcolor;
        label.dataset.borderstyle = l.borderstyle;
        label.dataset.comment = l.comment;
        label.onmousedown = dragLabel;
        label.onpointerdown = resizeLabel;
        cell.appendChild(label);
      });
    });
};
