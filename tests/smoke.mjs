const endpoint = process.argv[2] || "http://127.0.0.1:9444";
const targetUrl = process.argv[3] || "file:///C:/Users/User/Desktop/SmartDataProbabilityTool/index.html";

const targets = await fetch(`${endpoint}/json/list`).then(response => response.json());
const target = targets.find(item => item.type === "page");
if (!target) throw new Error("No browser page target.");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let callId = 0;
const pending = new Map();
const runtimeErrors = [];
socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const call = pending.get(message.id); pending.delete(message.id);
    message.error ? call.reject(new Error(message.error.message)) : call.resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
});

function send(method, params = {}) {
  const id = ++callId; socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}
async function evaluate(expression) {
  const output = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (output.exceptionDetails) throw new Error(output.exceptionDetails.exception?.description || output.exceptionDetails.text);
  return output.result.value;
}

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send("Page.navigate", { url: targetUrl });
await new Promise(resolve => setTimeout(resolve, 900));

const initial = await evaluate(`(() => ({
  grades:[...document.querySelectorAll('#gradeSelect option')].map(x=>x.value),
  modes:[...document.querySelectorAll('[data-mode]')].map(x=>x.dataset.mode),
  title:document.title,
  overflow:document.documentElement.scrollWidth-window.innerWidth
}))()`);
if (initial.grades.join(",") !== "4,5,6") throw new Error(`Unexpected grades: ${initial.grades}`);
if (initial.modes.join(",") !== "build,analyse,chance") throw new Error(`Unexpected modes: ${initial.modes}`);
if (!initial.title.includes("Data")) throw new Error(`Unexpected title: ${initial.title}`);
if (initial.overflow > 1) throw new Error(`Initial mobile overflow: ${initial.overflow}px`);

const expected = {
  4: { build: ["pictograph", "barChart"], analyse: ["chartCompare"] },
  5: { analyse: ["pieExplorer", "statisticsLab"] },
  6: { build: ["pieComposer"], analyse: ["pieExplorer"], chance: ["probabilityLab"] },
};
const coverage = [];
for (const [grade, modes] of Object.entries(expected)) {
  for (const [mode, activities] of Object.entries(modes)) {
    const result = await evaluate(`(() => {
      const grade=document.getElementById('gradeSelect'); grade.value=${JSON.stringify(grade)}; grade.dispatchEvent(new Event('change',{bubbles:true}));
      document.querySelector('[data-mode=${mode}]').click();
      const list=[...document.querySelectorAll('#activitySelect option')].map(x=>x.value); const checks=[];
      for(const value of list){ const select=document.getElementById('activitySelect'); select.value=value; select.dispatchEvent(new Event('change',{bubbles:true})); checks.push({value,stage:document.querySelectorAll('#visualStage > *').length,interactive:document.querySelectorAll('#visualStage button,#controlArea button,#controlArea input').length,summary:document.getElementById('liveSummary').textContent.trim().length,overflow:document.documentElement.scrollWidth-window.innerWidth}); }
      return {list,checks};
    })()`);
    if (result.list.join(",") !== activities.join(",")) throw new Error(`${grade}/${mode}: ${result.list}`);
    if (result.checks.some(item => !item.stage || !item.interactive || !item.summary || item.overflow > 1)) throw new Error(`${grade}/${mode} incomplete: ${JSON.stringify(result.checks)}`);
    coverage.push(...result.checks.map(item => item.value));
  }
}

const interactions = await evaluate(`(() => {
  const choose=(grade,mode,activity)=>{const g=document.getElementById('gradeSelect');g.value=grade;g.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-mode='+mode+']').click();const a=document.getElementById('activitySelect');a.value=activity;a.dispatchEvent(new Event('change',{bubbles:true}));};
  choose('4','build','pictograph'); const beforePicture=state.tool.counts[0]; document.getElementById('dataToken').click(); document.querySelector('[data-category="0"]').click(); const picture={before:beforePicture,after:state.tool.counts[0],symbols:document.querySelectorAll('[data-remove="0"]').length};
  choose('4','build','barChart'); const bar=document.getElementById('barValue0'); bar.value='12'; bar.dispatchEvent(new Event('input',{bubbles:true})); const fillRect=document.querySelector('[data-bar-column="0"] .bar-fill').getBoundingClientRect();const plotRect=document.querySelector('.bar-plot').getBoundingClientRect();const bars={value:state.tool.counts[0],label:document.querySelector('.bar-handle').textContent,same:bar===document.getElementById('barValue0'),topGap:Math.abs(fillRect.top-plotRect.top),progress:bar.closest('.range-control').style.getPropertyValue('--range-pct')};
  choose('4','analyse','chartCompare'); const compare=document.getElementById('compare1'); compare.value='3'; compare.dispatchEvent(new Event('input',{bubbles:true})); const matching={value:state.tool.counts[1],symbols:document.querySelectorAll('.dual-chart section:first-child .pictograph-row:nth-child(2) .picture-symbol').length,same:compare===document.getElementById('compare1')};
  choose('5','analyse','pieExplorer'); const pie=document.getElementById('pieValue2'); pie.value='9'; pie.dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('[data-pie="2"]').click(); const explorer={selected:state.tool.selected,value:state.tool.counts[2],card:document.querySelector('.selected-sector').textContent,same:pie===document.getElementById('pieValue2')};
  choose('5','analyse','statisticsLab'); const chip=document.querySelector('[data-number-chip="0"]'); const beforeNumber=state.tool.values[0]; chip.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); const statistics={before:beforeNumber,after:state.tool.values[0],metrics:document.querySelectorAll('.stat-metrics > div').length};
  document.querySelector('[data-add-number="11"]').click(); statistics.added=state.tool.values.at(-1); statistics.formulas=document.querySelectorAll('.formula-summary-grid > div').length;
  choose('6','build','pieComposer'); const composerStructure={slices:document.querySelectorAll('.composer-pie-svg path').length,relationships:document.querySelectorAll('.angle-relationship > div').length,empty:state.tool.sectors.length}; document.getElementById('clearPie').click(); document.querySelector('[data-sector-token="B"]').click(); document.getElementById('pieDrop').click(); const composer={...composerStructure,parts:state.tool.sectors.length,angle:document.getElementById('liveSummary').textContent};
  choose('6','chance','probabilityLab'); const green=document.getElementById('greenCount');const purple=document.getElementById('purpleCount');const teacherHidden=document.getElementById('teacherButton').classList.contains('hidden');green.value='0';green.dispatchEvent(new Event('input',{bubbles:true}));purple.value='8';purple.dispatchEvent(new Event('input',{bubbles:true}));const impossible=document.getElementById('liveSummary').textContent;const sameSlider=green===document.getElementById('greenCount');green.value='8';green.dispatchEvent(new Event('input',{bubbles:true}));purple.value='0';purple.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('drawOnce').click();const chance={impossible,certain:document.getElementById('liveSummary').textContent,draws:state.tool.draws.length,categories:document.querySelectorAll('.chance-categories > div').length,targets:document.querySelectorAll('[data-target-colour]').length,teacherHidden,sameSlider};
  document.querySelector('[data-lang=zh]').click(); const language={lang:document.documentElement.lang,title:document.querySelector('h1').textContent,badge:document.getElementById('gradeBadge').textContent,overflow:document.documentElement.scrollWidth-window.innerWidth};
  return {picture,bars,matching,explorer,statistics,composer,chance,language};
})()`);

if (interactions.picture.after !== interactions.picture.before + 1 || interactions.picture.symbols !== interactions.picture.after) throw new Error(`Pictograph failed: ${JSON.stringify(interactions.picture)}`);
if (interactions.bars.value !== 12 || interactions.bars.label !== "12" || !interactions.bars.same || interactions.bars.topGap > 1 || interactions.bars.progress !== "100%") throw new Error(`Bar chart failed: ${JSON.stringify(interactions.bars)}`);
if (interactions.matching.value !== 3 || interactions.matching.symbols !== 3 || !interactions.matching.same) throw new Error(`Matching views failed: ${JSON.stringify(interactions.matching)}`);
if (interactions.explorer.selected !== 2 || interactions.explorer.value !== 9 || !interactions.explorer.card.includes("9") || !interactions.explorer.same) throw new Error(`Pie explorer failed: ${JSON.stringify(interactions.explorer)}`);
if (interactions.statistics.after !== Math.min(12, interactions.statistics.before + 1) || interactions.statistics.metrics !== 4 || interactions.statistics.added !== 11 || interactions.statistics.formulas !== 4) throw new Error(`Statistics failed: ${JSON.stringify(interactions.statistics)}`);
if (interactions.composer.empty !== 0 || interactions.composer.slices !== 8 || interactions.composer.relationships !== 4 || interactions.composer.parts !== 1 || !interactions.composer.angle.includes("45")) throw new Error(`Pie composer failed: ${JSON.stringify(interactions.composer)}`);
if (!interactions.chance.impossible.includes("Mustahil") || !interactions.chance.certain.includes("Pasti") || interactions.chance.draws !== 1 || interactions.chance.categories !== 5 || interactions.chance.targets !== 2 || !interactions.chance.teacherHidden || !interactions.chance.sameSlider) throw new Error(`Probability failed: ${JSON.stringify(interactions.chance)}`);
if (interactions.language.lang !== "zh-Hans" || !interactions.language.title.includes("数据") || interactions.language.badge !== "6年级" || interactions.language.overflow > 1) throw new Error(`Chinese UI failed: ${JSON.stringify(interactions.language)}`);
if (runtimeErrors.length) throw new Error(`Runtime errors: ${runtimeErrors.join(" | ")}`);

console.log(JSON.stringify({ ok: true, uniqueTools: new Set(coverage).size, initial, interactions }, null, 2));
socket.close();
