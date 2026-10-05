const ml = (ms, zh, en) => ({ ms, zh, en });
const loc = value => typeof value === "string" ? value : value[state.lang] || value.ms;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const escapeHTML = value => String(value).replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));

const TEXT = {
  title: ml("Jom Teroka Data!", "一起来探索数据！", "Let's Explore Data!"),
  subtitle: ml("Bina carta, analisis data dan uji kebolehjadian.", "构造图表、分析数据并模拟可能性。", "Build charts, analyse data and simulate chance."),
  soundOn: ml("Bunyi: Buka", "声音：开", "Sound: On"), soundOff: ml("Bunyi: Tutup", "声音：关", "Sound: Off"),
  tabBuild: ml("Bina Carta", "构造图表", "Build Charts"), tabAnalyse: ml("Analisis Data", "分析数据", "Analyse Data"), tabChance: ml("Kebolehjadian", "可能性", "Chance"),
  chooseActivity: ml("Pilih alat", "选择工具", "Choose a tool"), grade: ml("Tahun", "年级", "Year"), activity: ml("Alat", "工具", "Tool"),
  teacherMode: ml("Tetapan guru", "老师设置", "Teacher settings"), resetTool: ml("Tetapkan semula alat", "重置工具", "Reset tool"),
  tryIt: ml("Cuba sendiri!", "动手试试！", "Try it!"), stepObserve: ml("Perhatikan", "仔细观察", "Observe"), stepTry: ml("Gerakkan & bina", "拖动与构造", "Move & build"), stepCheck: ml("Terangkan perubahan", "说明变化", "Explain change"),
  customSettings: ml("Tetapkan data demonstrasi", "设置示范数据", "Set demonstration data"), customHelp: ml("Gunakan empat nilai ini sebagai data permulaan alat semasa.", "把这四个数值设为当前工具的起始数据。", "Use these four values as the starting data for the current tool."),
  cancel: ml("Batal", "取消", "Cancel"), useSettings: ml("Gunakan data", "使用数据", "Use data"),
};

const MODE_LABELS = { build: TEXT.tabBuild, analyse: TEXT.tabAnalyse, chance: TEXT.tabChance };
const ACTIVITIES = {
  pictograph: { label: ml("Pembina piktograf", "象形统计图构造器", "Pictograph builder"), scope: ml("Tahun 4 · 8.1.1 Piktograf", "四年级 · 8.1.1 象形统计图", "Year 4 · 8.1.1 Pictographs"), tip: ml("Seret token data ke baris A, B, C atau D. Tekan simbol untuk mengeluarkannya.", "把数据标记拖入 A、B、C 或 D 行；点击图标可以移除。", "Drag a data token into row A, B, C or D. Tap a symbol to remove it.") },
  barChart: { label: ml("Pembina carta palang", "条形统计图构造器", "Bar-chart builder"), scope: ml("Tahun 4 · 8.1.1 Carta palang", "四年级 · 8.1.1 条形统计图", "Year 4 · 8.1.1 Bar charts"), tip: ml("Tarik pemegang di atas setiap palang. Nilai dan ketinggian berubah bersama.", "拖动每个柱顶的控制点，数值和高度会同步变化。", "Drag the handle above each bar. Its value and height change together.") },
  chartCompare: { label: ml("Paparan data sepadan", "同一数据对照板", "Matching data views"), scope: ml("Tahun 4 · 8.1.2 Mentafsir carta", "四年级 · 8.1.2 解读统计图", "Year 4 · 8.1.2 Interpreting charts"), tip: ml("Ubah satu nilai dan perhatikan piktograf serta carta palang berubah serentak.", "改变一个数据，观察象形图和条形图怎样同时改变。", "Change one value and watch both representations update together.") },
  pieExplorer: { label: ml("Peneroka carta pai", "饼图探索器", "Pie-chart explorer"), scope: ml("Tahun 5–6 · Carta pai", "五至六年级 · 饼图", "Years 5–6 · Pie charts"), tip: ml("Ubah data dan pilih satu bahagian untuk melihat kuantiti serta peratusnya.", "改变数据并选择一个扇形，查看数量和百分比。", "Change the data and select a sector to inspect its quantity and percentage.") },
  statisticsLab: { label: ml("Makmal statistik", "统计量实验室", "Statistics lab"), scope: ml("Tahun 5 · 8.2.1 Mod, median, min dan julat", "五年级 · 8.2.1 众数、中位数、平均数与极差", "Year 5 · 8.2.1 Mode, median, mean and range"), tip: ml("Tarik setiap kad nombor di atas garis. Keempat-empat ukuran dikira semula serta-merta.", "沿数轴拖动数字卡，四个统计量会即时重新计算。", "Drag each number card along the line. All four measures recalculate instantly.") },
  pieComposer: { label: ml("Pembina carta pai 45°", "45° 饼图构造器", "45° pie-chart builder"), scope: ml("Tahun 6 · 8.1.1 Sudut 45°, 90° dan 180°", "六年级 · 8.1.1 角度 45°、90° 与 180°", "Year 6 · 8.1.1 Angles of 45°, 90° and 180°"), tip: ml("Setiap token mengisi 45°. Seret lapan token ke bulatan untuk melengkapkan carta pai.", "每个标记代表 45°，把八个标记拖入圆内完成饼图。", "Each token fills 45°. Drag eight tokens into the circle to complete the pie chart.") },
  probabilityLab: { label: ml("Simulator kebolehjadian", "可能性模拟器", "Chance simulator"), scope: ml("Tahun 6 · 8.2 Kebolehjadian", "六年级 · 8.2 可能性", "Year 6 · 8.2 Chance"), tip: ml("Ubah bilangan dua warna dan buat cabutan. Label kebolehjadian berubah mengikut kandungan beg.", "改变两种颜色的数量并进行抽取，可能性标签会随袋中组成变化。", "Change the two colour counts and draw. The chance label follows the bag's contents.") },
};

const GRADE_MODES = {
  4: { build: ["pictograph", "barChart"], analyse: ["chartCompare"], chance: [] },
  5: { build: [], analyse: ["pieExplorer", "statisticsLab"], chance: [] },
  6: { build: ["pieComposer"], analyse: ["pieExplorer"], chance: ["probabilityLab"] },
};

const COLORS = ["#138b75", "#7758c7", "#df5a5a", "#efa62f"];
const LIGHT_COLORS = ["#bdebdc", "#d9cdf7", "#ffd0ca", "#ffe3a1"];
const CATEGORIES = ["A", "B", "C", "D"];

const state = { lang: "ms", grade: 4, mode: "build", activity: "pictograph", tool: null, teacherData: [4, 7, 5, 8], sound: true };
const els = {
  grade: document.querySelector("#gradeSelect"), activity: document.querySelector("#activitySelect"), sideTitle: document.querySelector("#sideTitle"),
  scope: document.querySelector("#scopeNote"), tip: document.querySelector("#tipBox span:last-child"), title: document.querySelector("#activityTitle"), badge: document.querySelector("#gradeBadge"),
  challenge: document.querySelector("#challengePanel"), stage: document.querySelector("#visualStage"), controls: document.querySelector("#controlArea"), summary: document.querySelector("#liveSummary"),
  sound: document.querySelector("#soundToggle"), teacherButton: document.querySelector("#teacherButton"), teacher: document.querySelector("#teacherDialog"), teacherPreview: document.querySelector("#teacherPreview"), teacherError: document.querySelector("#teacherError"),
};

function beep(tone = "tap") {
  if (!state.sound) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.frequency.value = tone === "done" ? 720 : tone === "drop" ? 540 : 430; gain.gain.setValueAtTime(.045, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .08);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .08); osc.addEventListener("ended", () => ctx.close());
}

function applyStaticLanguage() {
  document.documentElement.lang = state.lang === "zh" ? "zh-Hans" : state.lang;
  document.querySelectorAll("[data-i18n]").forEach(node => { const item = TEXT[node.dataset.i18n]; if (item) node.textContent = loc(item); });
  document.querySelectorAll("[data-lang]").forEach(button => button.classList.toggle("active", button.dataset.lang === state.lang));
  els.sound.querySelector("span:last-child").textContent = loc(state.sound ? TEXT.soundOn : TEXT.soundOff);
  els.sound.setAttribute("aria-pressed", String(state.sound));
  els.grade.querySelectorAll("option").forEach(option => { option.textContent = gradeLabel(option.value); });
}

function gradeLabel(value) { return state.lang === "zh" ? `${value}年级` : `${loc(ml("Tahun", "年级", "Year"))} ${value}`; }

function availableModes() { return GRADE_MODES[state.grade]; }
function refreshNavigation({ keepActivity = false } = {}) {
  const modes = availableModes();
  document.querySelectorAll("[data-mode]").forEach(button => {
    const disabled = !modes[button.dataset.mode].length; button.disabled = disabled;
    button.classList.toggle("active", button.dataset.mode === state.mode && !disabled);
  });
  if (!modes[state.mode].length) state.mode = Object.keys(modes).find(mode => modes[mode].length);
  const activities = modes[state.mode];
  if (!keepActivity || !activities.includes(state.activity)) state.activity = activities[0];
  els.activity.innerHTML = activities.map(id => `<option value="${id}">${loc(ACTIVITIES[id].label)}</option>`).join("");
  els.activity.value = state.activity; els.sideTitle.textContent = loc(MODE_LABELS[state.mode]);
  document.querySelectorAll("[data-mode]").forEach(button => button.classList.toggle("active", button.dataset.mode === state.mode));
}

function defaults(activity) {
  const counts = [...state.teacherData];
  return {
    pictograph: { counts, selected: false, interacted: false },
    barChart: { counts, interacted: false },
    chartCompare: { counts, interacted: false },
    pieExplorer: { counts, selected: 0, interacted: false },
    statisticsLab: { values: [...counts, 5, 3, 5], interacted: false },
    pieComposer: { sectors: ["A", "A", "B", "C", "C", "C", "C", "D"], selected: null, interacted: false },
    probabilityLab: { green: clamp(counts[0], 0, 8), purple: clamp(counts[1], 0, 8), draws: [], last: null, interacted: false },
  }[activity];
}

function setChallenge(title, subtitle) { els.challenge.innerHTML = `<span>${loc(ml("Cuba sendiri!", "动手试试！", "Try it!"))}</span><h3>${title}</h3><p>${subtitle}</p>`; }
function setSummary(text, tone = "neutral") { els.summary.className = `feedback ${tone}`; els.summary.innerHTML = text; }
function changeTool(mutator, tone = "tap") { mutator(state.tool); beep(tone); renderTool(); }
function slider(id, label, min, max, value, suffix = "") { return `<label class="range-control" for="${id}"><span>${label}</span><strong>${value}${suffix}</strong><input id="${id}" type="range" min="${min}" max="${max}" step="1" value="${value}" data-suffix="${escapeHTML(suffix)}"></label>`; }

function attachCopyPointerDrag(source, targets, onDrop) {
  source.draggable = false;
  source.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    const start = { x: event.clientX, y: event.clientY };
    let dragging = false; let ghost = null; let currentTarget = null;
    source.setPointerCapture?.(event.pointerId);
    const locate = (x, y) => targets.find(target => { const rect = target.getBoundingClientRect(); return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom; }) || null;
    const move = pointerEvent => {
      if (!dragging && Math.hypot(pointerEvent.clientX - start.x, pointerEvent.clientY - start.y) > 7) {
        dragging = true; ghost = source.cloneNode(true); ghost.removeAttribute("id"); ghost.classList.add("drag-ghost"); document.body.appendChild(ghost);
      }
      if (!dragging) return;
      pointerEvent.preventDefault(); ghost.style.left = `${pointerEvent.clientX}px`; ghost.style.top = `${pointerEvent.clientY}px`;
      const nextTarget = locate(pointerEvent.clientX, pointerEvent.clientY);
      if (nextTarget !== currentTarget) { currentTarget?.classList.remove("is-over"); nextTarget?.classList.add("is-over"); currentTarget = nextTarget; }
    };
    const end = pointerEvent => {
      source.removeEventListener("pointermove", move); source.removeEventListener("pointerup", end); source.removeEventListener("pointercancel", end);
      currentTarget?.classList.remove("is-over"); ghost?.remove();
      if (dragging) { source.dataset.draggedAt = String(Date.now()); const target = locate(pointerEvent.clientX, pointerEvent.clientY); if (target) onDrop(target); }
    };
    source.addEventListener("pointermove", move); source.addEventListener("pointerup", end); source.addEventListener("pointercancel", end);
  });
}

function countsTable(counts, extra = "") {
  return `<div class="data-table ${extra}">${CATEGORIES.map((category, index) => `<div><span class="category-dot" style="--dot:${COLORS[index]}">${category}</span><strong>${counts[index]}</strong></div>`).join("")}</div>`;
}

function pictographRows(counts, interactive = false) {
  return `<div class="pictograph-board">${CATEGORIES.map((category, index) => `<div class="pictograph-row ${interactive ? "drop-row" : ""}" ${interactive ? `data-category="${index}" role="button" tabindex="0"` : ""}><strong class="row-label" style="--row:${COLORS[index]}">${category}</strong><div class="picture-symbols">${Array.from({ length: counts[index] }, (_, symbol) => interactive ? `<button type="button" class="picture-symbol" data-remove="${index}" aria-label="${loc(ml("Keluarkan satu", "移除一个", "Remove one"))}"><i style="--symbol:${COLORS[index]}"></i></button>` : `<span class="picture-symbol"><i style="--symbol:${COLORS[index]}"></i></span>`).join("") || `<small>${loc(ml("Seret token ke sini", "把标记拖到这里", "Drag a token here"))}</small>`}</div><b>${counts[index]}</b></div>`).join("")}<footer><span class="picture-key"><i></i> = 1</span><span>${loc(ml("Jumlah data", "数据总数", "Total data"))}: <strong>${counts.reduce((a, b) => a + b, 0)}</strong></span></footer></div>`;
}

function renderPictograph() {
  const t = state.tool;
  setChallenge(loc(ml("Bina piktograf dengan token data", "用数据标记构造象形统计图", "Build a pictograph with data tokens")), loc(ml("Seret token +1 ke mana-mana baris. Tekan simbol bulat untuk mengeluarkan satu data.", "把 +1 标记拖到任意一行；点击圆形图标可移除一个数据。", "Drag the +1 token into any row. Tap a round symbol to remove one item.")));
  els.stage.innerHTML = `<div class="pictograph-workbench">${pictographRows(t.counts, true)}<aside class="data-token-tray"><span>${loc(ml("Token data", "数据标记", "Data token"))}</span><button type="button" draggable="true" id="dataToken" class="data-token ${t.selected ? "selected" : ""}"><i>＋1</i><small>${loc(ml("Seret", "拖动", "Drag"))}</small></button><p>${loc(ml("Satu token menghasilkan satu simbol.", "一个标记会产生一个图标。", "One token creates one symbol."))}</p></aside></div>`;
  els.controls.innerHTML = `<div class="board-actions"><button type="button" id="clearPictograph" class="secondary-button compact">↻ ${loc(ml("Kosongkan carta", "清空统计图", "Clear chart"))}</button><button type="button" id="teacherDataPictograph" class="primary-button compact">▦ ${loc(ml("Gunakan data guru", "使用老师数据", "Use teacher data"))}</button></div>`;
  const add = index => changeTool(x => { x.counts[index] = Math.min(12, x.counts[index] + 1); x.selected = false; x.interacted = true; }, "drop");
  const token = document.querySelector("#dataToken");
  token.addEventListener("click", () => { if (Date.now() - Number(token.dataset.draggedAt || 0) < 400) return; changeTool(x => { x.selected = !x.selected; }); });
  token.addEventListener("dragstart", event => { event.dataTransfer.setData("text/plain", "data"); event.dataTransfer.effectAllowed = "copy"; });
  els.stage.querySelectorAll("[data-category]").forEach(row => {
    row.addEventListener("dragover", event => { event.preventDefault(); row.classList.add("is-over"); }); row.addEventListener("dragleave", () => row.classList.remove("is-over"));
    row.addEventListener("drop", event => { event.preventDefault(); row.classList.remove("is-over"); if (event.dataTransfer.getData("text/plain") === "data") add(Number(row.dataset.category)); });
    row.addEventListener("click", () => { if (state.tool.selected) add(Number(row.dataset.category)); });
    row.addEventListener("keydown", event => { if ((event.key === "Enter" || event.key === " ") && state.tool.selected) { event.preventDefault(); add(Number(row.dataset.category)); } });
  });
  attachCopyPointerDrag(token, [...els.stage.querySelectorAll("[data-category]")], row => add(Number(row.dataset.category)));
  els.stage.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", event => { event.stopPropagation(); const index = Number(button.dataset.remove); changeTool(x => { x.counts[index] = Math.max(0, x.counts[index] - 1); x.interacted = true; }); }));
  document.querySelector("#clearPictograph").addEventListener("click", () => changeTool(x => { x.counts = [0, 0, 0, 0]; x.selected = false; }));
  document.querySelector("#teacherDataPictograph").addEventListener("click", () => changeTool(x => { x.counts = [...state.teacherData]; x.selected = false; }, "done"));
  setSummary(`${loc(ml("Setiap simbol mewakili 1 data", "每个图标代表 1 个数据", "Each symbol represents 1 item"))} · <strong>${t.counts.reduce((a, b) => a + b, 0)}</strong> ${loc(ml("data dipaparkan", "个数据已显示", "items shown"))}`);
}

function barChartHTML(counts, interactive = false) {
  const ticks = Array.from({ length: 7 }, (_, index) => 12 - index * 2);
  return `<div class="bar-chart-shell"><div class="y-axis">${ticks.map(value => `<span>${value}</span>`).join("")}</div><div class="bar-plot">${ticks.map(() => `<i class="grid-line"></i>`).join("")}<div class="bars">${counts.map((value, index) => `<div class="bar-column"><div class="bar-value">${value}</div><div class="bar-fill" style="height:${value / 12 * 100}%;--bar:${COLORS[index]};--bar-light:${LIGHT_COLORS[index]}">${interactive ? `<button type="button" class="bar-handle" data-bar="${index}" aria-label="${loc(ml("Laraskan palang", "调整柱形", "Adjust bar"))}"></button>` : ""}</div><strong>${CATEGORIES[index]}</strong></div>`).join("")}</div></div></div>`;
}

function attachBarDrag() {
  els.stage.querySelectorAll("[data-bar]").forEach(handle => {
    handle.addEventListener("pointerdown", event => {
      event.preventDefault(); const index = Number(handle.dataset.bar); const plot = handle.closest(".bar-plot");
      const move = pointerEvent => { const rect = plot.getBoundingClientRect(); const value = clamp(Math.round((rect.bottom - 34 - pointerEvent.clientY) / (rect.height - 50) * 12), 0, 12); if (state.tool.counts[index] !== value) { state.tool.counts[index] = value; state.tool.interacted = true; renderTool(); } };
      const end = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", end); beep("drop"); };
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", end, { once: true });
    });
  });
}

function renderBarChart() {
  const t = state.tool; const max = Math.max(...t.counts); const maxCategories = CATEGORIES.filter((_, i) => t.counts[i] === max).join(", ");
  setChallenge(loc(ml("Tarik palang untuk mengubah data", "拖动柱形改变数据", "Drag the bars to change the data")), loc(ml("Pemegang bulat bergerak terus bersama penuding. Skala menegak kekal 0 hingga 12.", "圆形控制点会跟随鼠标移动，纵轴保持 0 至 12。", "The round handle follows the pointer. The vertical scale stays from 0 to 12.")));
  els.stage.innerHTML = `<div class="chart-workbench">${barChartHTML(t.counts, true)}${countsTable(t.counts)}</div>`;
  els.controls.innerHTML = `<div class="range-grid">${t.counts.map((value, index) => slider(`barValue${index}`, CATEGORIES[index], 0, 12, value)).join("")}</div>`;
  t.counts.forEach((_, index) => document.querySelector(`#barValue${index}`).addEventListener("input", event => { state.tool.counts[index] = Number(event.target.value); state.tool.interacted = true; renderTool(); }));
  attachBarDrag();
  setSummary(`${loc(ml("Palang tertinggi", "最高的柱形", "Tallest bar"))}: <strong>${maxCategories}</strong> · ${loc(ml("Nilai", "数值", "Value"))} <strong>${max}</strong>`);
}

function renderChartCompare() {
  const t = state.tool;
  setChallenge(loc(ml("Satu data, dua perwakilan", "同一组数据，两种表示方式", "One data set, two representations")), loc(ml("Ubah mana-mana nilai. Kira simbol dan bandingkan dengan ketinggian palang.", "改变任一数值，数一数图标并对照柱形高度。", "Change any value. Count the symbols and compare them with the bar height.")));
  els.stage.innerHTML = `<div class="dual-chart"><section><h3>${loc(ml("Piktograf", "象形统计图", "Pictograph"))}</h3>${pictographRows(t.counts)}</section><section><h3>${loc(ml("Carta palang", "条形统计图", "Bar chart"))}</h3>${barChartHTML(t.counts)}</section></div>`;
  els.controls.innerHTML = `<div class="range-grid">${t.counts.map((value, index) => slider(`compare${index}`, CATEGORIES[index], 0, 12, value)).join("")}</div>`;
  t.counts.forEach((_, index) => document.querySelector(`#compare${index}`).addEventListener("input", event => { state.tool.counts[index] = Number(event.target.value); state.tool.interacted = true; renderTool(); }));
  setSummary(loc(ml("Kedua-dua carta mewakili jumlah yang sama; hanya bentuk perwakilannya berbeza.", "两种统计图表示相同的数据，只是呈现方式不同。", "Both charts represent the same data; only the form of representation differs.")));
}

function pieGradient(counts) {
  const sum = counts.reduce((a, b) => a + b, 0); if (!sum) return "conic-gradient(#eee5d3 0deg 360deg)";
  const total = sum; let current = 0; const stops = [];
  counts.forEach((value, index) => { const next = current + value / total * 360; stops.push(`${COLORS[index]} ${current}deg ${next}deg`); current = next; });
  return `conic-gradient(${stops.join(",")})`;
}

function renderPieExplorer() {
  const t = state.tool; const total = t.counts.reduce((a, b) => a + b, 0); const value = t.counts[t.selected]; const percent = total ? value / total * 100 : 0;
  setChallenge(loc(ml("Ubah data dan tafsir carta pai", "改变数据并解读饼图", "Change the data and interpret the pie chart")), loc(ml("Pilih A, B, C atau D. Bahagian yang dipilih diterangkan tanpa mengubah jumlah data.", "选择 A、B、C 或 D，查看所选部分在总数中所占的比例。", "Choose A, B, C or D to inspect that part of the total.")));
  els.stage.innerHTML = `<div class="pie-explorer"><div class="pie-wrap"><div class="pie-chart" style="background:${pieGradient(t.counts)}"><span>${total}<small>${loc(ml("jumlah", "总数", "total"))}</small></span></div></div><div class="pie-legend">${CATEGORIES.map((category, index) => `<button type="button" data-pie="${index}" class="${t.selected === index ? "active" : ""}" style="--legend:${COLORS[index]}"><i></i><strong>${category}</strong><span>${t.counts[index]}</span></button>`).join("")}</div><div class="selected-sector" style="--selected:${COLORS[t.selected]}"><span>${loc(ml("Bahagian dipilih", "所选部分", "Selected part"))}</span><strong>${CATEGORIES[t.selected]}</strong><p>${value} ${loc(ml("daripada", "占总数", "out of"))} ${total || 0}</p><b>${percent.toFixed(1)}%</b></div></div>`;
  els.controls.innerHTML = `<div class="range-grid">${t.counts.map((count, index) => slider(`pieValue${index}`, CATEGORIES[index], 0, 12, count)).join("")}</div>`;
  els.stage.querySelectorAll("[data-pie]").forEach(button => button.addEventListener("click", () => changeTool(x => { x.selected = Number(button.dataset.pie); x.interacted = true; })));
  t.counts.forEach((_, index) => document.querySelector(`#pieValue${index}`).addEventListener("input", event => { state.tool.counts[index] = Number(event.target.value); state.tool.interacted = true; renderTool(); }));
  setSummary(`${CATEGORIES[t.selected]} = <strong>${value}</strong> · ${value}/${total || 0} = <strong>${percent.toFixed(1)}%</strong>`);
}

function statistics(values) {
  const sorted = [...values].sort((a, b) => a - b); const mean = values.reduce((a, b) => a + b, 0) / values.length; const middle = Math.floor(sorted.length / 2); const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  const frequencies = new Map(); sorted.forEach(value => frequencies.set(value, (frequencies.get(value) || 0) + 1)); const highest = Math.max(...frequencies.values()); const modes = highest === 1 ? [] : [...frequencies].filter(([, count]) => count === highest).map(([value]) => value);
  return { sorted, mean, median, modes, range: sorted.at(-1) - sorted[0] };
}

function attachNumberDrag() {
  els.stage.querySelectorAll("[data-number-chip]").forEach(chip => {
    chip.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].includes(event.key)) return;
      event.preventDefault(); const index = Number(chip.dataset.numberChip); const delta = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1;
      changeTool(x => { x.values[index] = clamp(x.values[index] + delta, 0, 12); x.interacted = true; }, "drop");
    });
    chip.addEventListener("pointerdown", event => {
      event.preventDefault(); const index = Number(chip.dataset.numberChip); const track = chip.closest(".number-line");
      const move = pointerEvent => { const rect = track.getBoundingClientRect(); const value = clamp(Math.round((pointerEvent.clientX - rect.left) / rect.width * 12), 0, 12); if (state.tool.values[index] !== value) { state.tool.values[index] = value; state.tool.interacted = true; renderTool(); } };
      const end = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", end); beep("drop"); };
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", end, { once: true });
    });
  });
}

function renderStatisticsLab() {
  const t = state.tool; const result = statistics(t.values);
  setChallenge(loc(ml("Gerakkan data, lihat statistik berubah", "移动数据，观察统计量变化", "Move the data and watch the statistics change")), loc(ml("Tarik kad nombor di sepanjang garis 0 hingga 12. Susunan di bawah sentiasa daripada kecil kepada besar.", "沿着 0 至 12 的数轴拖动数字卡；下方会自动从小到大排列。", "Drag the number cards along the 0–12 line. The row below always sorts them from least to greatest.")));
  els.stage.innerHTML = `<div class="statistics-board"><div class="number-line">${Array.from({ length: 13 }, (_, value) => `<i style="left:${value / 12 * 100}%"><span>${value}</span></i>`).join("")}${t.values.map((value, index) => `<button type="button" class="number-chip" data-number-chip="${index}" style="left:${value / 12 * 100}%;top:${12 + index % 3 * 46}px;--chip:${COLORS[index % 4]}">${value}</button>`).join("")}</div><div class="sorted-row"><span>${loc(ml("Susunan", "排序", "Sorted"))}</span>${result.sorted.map((value, index) => `<b class="${index === Math.floor(result.sorted.length / 2) ? "middle" : ""}">${value}</b>`).join("")}</div><div class="stat-metrics"><div><span>${loc(ml("Mod", "众数", "Mode"))}</span><strong>${result.modes.length ? result.modes.join(", ") : "—"}</strong><small>${loc(ml("paling kerap", "出现最多", "most frequent"))}</small></div><div><span>${loc(ml("Median", "中位数", "Median"))}</span><strong>${result.median}</strong><small>${loc(ml("nilai tengah", "中间的数", "middle value"))}</small></div><div><span>${loc(ml("Min", "平均数", "Mean"))}</span><strong>${result.mean.toFixed(2)}</strong><small>${loc(ml("jumlah ÷ bilangan", "总和 ÷ 个数", "sum ÷ count"))}</small></div><div><span>${loc(ml("Julat", "极差", "Range"))}</span><strong>${result.range}</strong><small>${loc(ml("terbesar − terkecil", "最大值 − 最小值", "largest − smallest"))}</small></div></div></div>`;
  els.controls.innerHTML = `<div class="board-actions"><button type="button" id="addNumber" class="primary-button compact">＋ ${loc(ml("Tambah kad", "增加数字卡", "Add card"))}</button><button type="button" id="removeNumber" class="secondary-button compact" ${t.values.length <= 3 ? "disabled" : ""}>− ${loc(ml("Keluarkan kad terakhir", "移除最后一张", "Remove last card"))}</button></div>`;
  attachNumberDrag();
  document.querySelector("#addNumber").addEventListener("click", () => changeTool(x => { if (x.values.length < 10) x.values.push(6); x.interacted = true; }));
  document.querySelector("#removeNumber").addEventListener("click", () => changeTool(x => { if (x.values.length > 3) x.values.pop(); x.interacted = true; }));
  setSummary(`${loc(ml("Data", "数据", "Data"))}: ${t.values.join(", ")} · ${loc(ml("Min", "平均数", "Mean"))} = ${t.values.reduce((a, b) => a + b, 0)} ÷ ${t.values.length} = <strong>${result.mean.toFixed(2)}</strong>`);
}

function sectorCounts(sectors) { return CATEGORIES.map(category => sectors.filter(item => item === category).length); }

function renderPieComposer() {
  const t = state.tool; const counts = sectorCounts(t.sectors); const full = t.sectors.length === 8;
  setChallenge(loc(ml("Lengkapkan satu bulatan dengan bahagian 45°", "用 45° 的部分完成一个圆", "Complete a circle with 45° parts")), loc(ml("Seret token A, B, C atau D ke bulatan. Lapan token membentuk 360°.", "把 A、B、C 或 D 标记拖入圆内；八个标记组成 360°。", "Drag A, B, C or D into the circle. Eight tokens make 360°.")));
  els.stage.innerHTML = `<div class="pie-composer"><div class="sector-bank">${CATEGORIES.map((category, index) => `<button type="button" draggable="true" data-sector-token="${category}" class="sector-token ${t.selected === category ? "selected" : ""}" style="--sector:${COLORS[index]}"><strong>${category}</strong><span>45°</span></button>`).join("")}</div><div class="pie-drop ${full ? "full" : ""}" id="pieDrop" role="button" tabindex="0"><div class="pie-chart composed" style="background:${pieGradient(counts)}"><span>${t.sectors.length}/8<small>${full ? "360°" : `${t.sectors.length * 45}°`}</small></span></div><p>${full ? loc(ml("Carta pai lengkap", "饼图已完成", "Pie chart complete")) : loc(ml("Lepaskan token di sini", "把标记拖到这里", "Drop a token here"))}</p></div><div class="angle-table">${CATEGORIES.map((category, index) => `<div><span class="category-dot" style="--dot:${COLORS[index]}">${category}</span><strong>${counts[index]} × 45°</strong><b>${counts[index] * 45}°</b></div>`).join("")}</div></div>`;
  els.controls.innerHTML = `<div class="board-actions"><button type="button" id="removeSector" class="secondary-button compact" ${!t.sectors.length ? "disabled" : ""}>↶ ${loc(ml("Keluarkan bahagian terakhir", "移除最后一个部分", "Remove last part"))}</button><button type="button" id="clearPie" class="secondary-button compact">↻ ${loc(ml("Kosongkan bulatan", "清空圆形", "Clear circle"))}</button></div>`;
  const add = category => changeTool(x => { if (x.sectors.length < 8) x.sectors.push(category); x.selected = null; x.interacted = true; }, "drop");
  els.stage.querySelectorAll("[data-sector-token]").forEach(button => { button.addEventListener("click", () => { if (Date.now() - Number(button.dataset.draggedAt || 0) < 400) return; changeTool(x => { x.selected = x.selected === button.dataset.sectorToken ? null : button.dataset.sectorToken; }); }); button.addEventListener("dragstart", event => { event.dataTransfer.setData("text/plain", button.dataset.sectorToken); event.dataTransfer.effectAllowed = "copy"; }); });
  const drop = document.querySelector("#pieDrop"); drop.addEventListener("dragover", event => { event.preventDefault(); drop.classList.add("is-over"); }); drop.addEventListener("dragleave", () => drop.classList.remove("is-over")); drop.addEventListener("drop", event => { event.preventDefault(); drop.classList.remove("is-over"); const category = event.dataTransfer.getData("text/plain"); if (CATEGORIES.includes(category)) add(category); }); drop.addEventListener("click", () => { if (state.tool.selected) add(state.tool.selected); });
  els.stage.querySelectorAll("[data-sector-token]").forEach(button => attachCopyPointerDrag(button, [drop], () => add(button.dataset.sectorToken)));
  document.querySelector("#removeSector").addEventListener("click", () => changeTool(x => { x.sectors.pop(); x.interacted = true; })); document.querySelector("#clearPie").addEventListener("click", () => changeTool(x => { x.sectors = []; x.selected = null; }));
  setSummary(`${t.sectors.length} × 45° = <strong>${t.sectors.length * 45}°</strong>${full ? ` · ✓ ${loc(ml("Satu bulatan penuh", "一个完整的圆", "One full circle"))}` : ""}`, full ? "success" : "neutral");
}

function chanceLabel(target, other) {
  const total = target + other;
  if (target === 0) return ml("Mustahil", "不可能", "Impossible");
  if (other === 0) return ml("Pasti", "肯定", "Certain");
  if (target === other) return ml("Sama kemungkinan", "可能性相同", "Equally likely");
  if (target < other) return ml("Kecil kemungkinan", "可能性小", "Less likely");
  return ml("Besar kemungkinan", "可能性大", "More likely");
}

function drawFromBag(t, times = 1) {
  const total = t.green + t.purple; if (!total) return;
  for (let i = 0; i < times; i += 1) { const result = Math.random() * total < t.green ? "green" : "purple"; t.draws.push(result); t.last = result; }
  if (t.draws.length > 100) t.draws = t.draws.slice(-100); t.interacted = true;
}

function renderProbabilityLab() {
  const t = state.tool; const total = t.green + t.purple; const label = chanceLabel(t.green, t.purple); const greenDraws = t.draws.filter(item => item === "green").length; const purpleDraws = t.draws.length - greenDraws;
  setChallenge(loc(ml("Ubah kandungan beg dan buat cabutan", "改变袋中组成并进行抽取", "Change the bag and make draws")), loc(ml("Fokus pada token hijau. Bandingkan kandungan beg dengan hasil cabutan berulang.", "以绿色标记为观察对象，对照袋中组成与重复抽取结果。", "Focus on the green token. Compare the bag contents with repeated draw results.")));
  els.stage.innerHTML = `<div class="probability-board"><div class="chance-scale"><span>${loc(ml("Mustahil", "不可能", "Impossible"))}</span><span>${loc(ml("Kecil kemungkinan", "可能性小", "Less likely"))}</span><span>${loc(ml("Sama kemungkinan", "可能性相同", "Equally likely"))}</span><span>${loc(ml("Besar kemungkinan", "可能性大", "More likely"))}</span><span>${loc(ml("Pasti", "肯定", "Certain"))}</span><i style="left:${total ? t.green / total * 100 : 0}%"></i></div><div class="bag-and-result"><div class="token-bag"><div class="bag-mouth"></div><div class="bag-tokens">${Array.from({ length: t.green }, () => `<i class="green"></i>`).join("")}${Array.from({ length: t.purple }, () => `<i class="purple"></i>`).join("")}</div><strong>${loc(ml("Kandungan beg", "袋中组成", "Bag contents"))}</strong></div><div class="chance-focus"><span>${loc(ml("Peluang mendapat hijau", "抽到绿色的可能性", "Chance of drawing green"))}</span><strong>${loc(label)}</strong><div class="last-draw ${t.last || "none"}">${t.last ? `<i></i><b>${loc(t.last === "green" ? ml("Hijau", "绿色", "Green") : ml("Ungu", "紫色", "Purple"))}</b>` : `<b>${loc(ml("Belum dicabut", "尚未抽取", "No draw yet"))}</b>`}</div></div></div><div class="draw-history"><div><i class="green"></i><span>${loc(ml("Hijau diperoleh", "抽到绿色", "Green drawn"))}</span><strong>${greenDraws}</strong></div><div><i class="purple"></i><span>${loc(ml("Ungu diperoleh", "抽到紫色", "Purple drawn"))}</span><strong>${purpleDraws}</strong></div><div><span>${loc(ml("Jumlah cabutan", "抽取次数", "Total draws"))}</span><strong>${t.draws.length}</strong></div></div></div>`;
  els.controls.innerHTML = `<div class="range-grid">${slider("greenCount", loc(ml("Token hijau", "绿色标记", "Green tokens")), 0, 8, t.green)}${slider("purpleCount", loc(ml("Token ungu", "紫色标记", "Purple tokens")), 0, 8, t.purple)}</div><div class="board-actions"><button type="button" id="drawOnce" class="primary-button compact" ${!total ? "disabled" : ""}>● ${loc(ml("Cabut sekali", "抽取一次", "Draw once"))}</button><button type="button" id="drawTwenty" class="primary-button compact" ${!total ? "disabled" : ""}>20× ${loc(ml("Cabut 20 kali", "抽取 20 次", "Draw 20 times"))}</button><button type="button" id="clearDraws" class="secondary-button compact">↻ ${loc(ml("Kosongkan hasil", "清除结果", "Clear results"))}</button></div>`;
  ["green", "purple"].forEach(color => document.querySelector(`#${color}Count`).addEventListener("input", event => { state.tool[color] = Number(event.target.value); state.tool.draws = []; state.tool.last = null; state.tool.interacted = true; renderTool(); }));
  document.querySelector("#drawOnce").addEventListener("click", () => changeTool(x => drawFromBag(x, 1), "drop")); document.querySelector("#drawTwenty").addEventListener("click", () => changeTool(x => drawFromBag(x, 20), "done")); document.querySelector("#clearDraws").addEventListener("click", () => changeTool(x => { x.draws = []; x.last = null; }));
  setSummary(`${loc(ml("Token hijau", "绿色标记", "Green token"))}: <strong>${loc(label)}</strong> · ${loc(ml("Kandungan beg", "袋中组成", "Bag contents"))} ${t.green}:${t.purple}`);
}

function renderTool() {
  const info = ACTIVITIES[state.activity]; els.title.textContent = loc(info.label); els.scope.textContent = loc(info.scope); els.tip.textContent = loc(info.tip); els.badge.textContent = gradeLabel(state.grade);
  els.stage.replaceChildren(); els.controls.replaceChildren();
  const renderers = { pictograph: renderPictograph, barChart: renderBarChart, chartCompare: renderChartCompare, pieExplorer: renderPieExplorer, statisticsLab: renderStatisticsLab, pieComposer: renderPieComposer, probabilityLab: renderProbabilityLab };
  renderers[state.activity]();
}

function startTool() { applyStaticLanguage(); refreshNavigation({ keepActivity: true }); state.tool ||= defaults(state.activity); renderTool(); }
function updateTeacherPreview() { const values = ["A", "B", "C", "D"].map(key => clamp(Number(document.querySelector(`#teacher${key}`).value) || 0, 0, 12)); els.teacherPreview.textContent = CATEGORIES.map((category, index) => `${category} ${values[index]}`).join(" · "); els.teacherError.textContent = ""; }

document.querySelectorAll("[data-lang]").forEach(button => button.addEventListener("click", () => { state.lang = button.dataset.lang; applyStaticLanguage(); refreshNavigation({ keepActivity: true }); renderTool(); }));
document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => { if (button.disabled) return; state.mode = button.dataset.mode; state.activity = GRADE_MODES[state.grade][state.mode][0]; state.tool = defaults(state.activity); beep(); startTool(); }));
els.grade.addEventListener("change", () => { state.grade = Number(els.grade.value); const modes = availableModes(); if (!modes[state.mode].length) state.mode = Object.keys(modes).find(mode => modes[mode].length); state.activity = modes[state.mode][0]; state.tool = defaults(state.activity); startTool(); });
els.activity.addEventListener("change", () => { state.activity = els.activity.value; state.tool = defaults(state.activity); startTool(); });
els.sound.addEventListener("click", () => { state.sound = !state.sound; applyStaticLanguage(); if (state.sound) beep(); });
document.querySelector("#resetToolButton").addEventListener("click", () => { state.tool = defaults(state.activity); beep("done"); renderTool(); });
els.teacherButton.addEventListener("click", () => { state.teacherData.forEach((value, index) => { document.querySelector(`#teacher${CATEGORIES[index]}`).value = value; }); updateTeacherPreview(); els.teacher.showModal(); });
document.querySelectorAll(".data-inputs input").forEach(input => input.addEventListener("input", updateTeacherPreview));
document.querySelector("#useTeacherSettings").addEventListener("click", () => { state.teacherData = CATEGORIES.map(category => clamp(Number(document.querySelector(`#teacher${category}`).value) || 0, 0, 12)); state.tool = defaults(state.activity); els.teacher.close(); beep("done"); renderTool(); });
document.addEventListener("input", event => { if (event.target.matches('input[type="range"][data-suffix]')) { const output = event.target.closest(".range-control")?.querySelector("strong"); if (output) output.textContent = `${event.target.value}${event.target.dataset.suffix || ""}`; } });

startTool();
