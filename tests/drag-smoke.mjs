const endpoint = process.argv[2] || "http://127.0.0.1:9444";
const targetUrl = process.argv[3] || "file:///C:/Users/User/Desktop/SmartDataProbabilityTool/index.html";
const targets = await fetch(`${endpoint}/json/list`).then(response => response.json());
const target = targets.find(item => item.type === "page");
if (!target) throw new Error("No browser page target.");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let callId = 0; const pending = new Map();
socket.addEventListener("message", event => { const message = JSON.parse(event.data); if (message.id && pending.has(message.id)) { const call = pending.get(message.id); pending.delete(message.id); message.error ? call.reject(new Error(message.error.message)) : call.resolve(message.result); } });
function send(method, params = {}) { const id = ++callId; socket.send(JSON.stringify({ id, method, params })); return new Promise((resolve, reject) => pending.set(id, { resolve, reject })); }
async function evaluate(expression) { const output = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (output.exceptionDetails) throw new Error(output.exceptionDetails.text); return output.result.value; }
async function choose(grade, mode, activity) { await evaluate(`(()=>{const g=document.getElementById('gradeSelect');g.value=${JSON.stringify(grade)};g.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-mode=${mode}]').click();const a=document.getElementById('activitySelect');a.value=${JSON.stringify(activity)};a.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.activity-card').scrollIntoView({block:'start'});})()`); await new Promise(resolve => setTimeout(resolve, 120)); }
async function centre(selector) { return evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`); }
async function drag(from, to) {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: from.x, y: from.y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: from.x, y: from.y, button: "left", clickCount: 1 });
  for (let step = 1; step <= 6; step += 1) await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: from.x + (to.x - from.x) * step / 6, y: from.y + (to.y - from.y) * step / 6, button: "left", buttons: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: to.x, y: to.y, button: "left", clickCount: 1 });
  await new Promise(resolve => setTimeout(resolve, 100));
}

await send("Page.enable"); await send("Runtime.enable"); await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: targetUrl }); await new Promise(resolve => setTimeout(resolve, 700));

await choose("4", "build", "pictograph");
const pictureBefore = await evaluate("state.tool.counts[0]");
await drag(await centre("#dataToken"), await centre('[data-category="0"]'));
const pictureAfter = await evaluate("state.tool.counts[0]");
if (pictureAfter !== pictureBefore + 1) throw new Error(`Pictograph pointer drag failed: ${pictureBefore} -> ${pictureAfter}`);

await choose("4", "build", "barChart");
const handle = await centre('[data-bar="0"]'); const plot = await evaluate(`(()=>{const r=document.querySelector('.bar-plot').getBoundingClientRect();return{x:r.left+r.width*.22,y:r.top+45};})()`);
await drag(handle, plot);
const barValue = await evaluate("state.tool.counts[0]");
if (barValue < 8) throw new Error(`Bar pointer drag failed: ${barValue}`);

await choose("5", "analyse", "statisticsLab");
const chipBefore = await evaluate("state.tool.values[0]"); const chip = await centre('[data-number-chip="0"]'); const lineEnd = await evaluate(`(()=>{const r=document.querySelector('.number-line').getBoundingClientRect();return{x:r.right-4,y:r.top+r.height*.35};})()`);
await drag(chip, lineEnd);
const chipAfter = await evaluate("state.tool.values[0]");
if (chipAfter <= chipBefore) throw new Error(`Number-chip pointer drag failed: ${chipBefore} -> ${chipAfter}`);

await choose("6", "build", "pieComposer");
await evaluate("document.getElementById('clearPie').click()");
await drag(await centre('[data-sector-token="A"]'), await centre("#pieDrop"));
const parts = await evaluate("state.tool.sectors.length");
if (parts !== 1) throw new Error(`Pie-sector pointer drag failed: ${parts}`);

console.log(JSON.stringify({ ok: true, picture: [pictureBefore, pictureAfter], barValue, number: [chipBefore, chipAfter], pieParts: parts }, null, 2));
socket.close();
