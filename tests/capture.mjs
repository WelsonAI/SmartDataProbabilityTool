import fs from "node:fs";
const [endpoint,targetUrl,output,widthText="1365",heightText="900",grade="4",lang="zh",mode="build",activity="pictograph",scenario=""] = process.argv.slice(2);
const targets = await fetch(`${endpoint}/json/list`).then(r=>r.json());
const target = targets.find(x=>x.type==="page");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener("open",resolve,{once:true});socket.addEventListener("error",reject,{once:true});});
let id=0; const pending=new Map();
socket.addEventListener("message",event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}});
function send(method,params={}){const call=++id;socket.send(JSON.stringify({id:call,method,params}));return new Promise((resolve,reject)=>pending.set(call,{resolve,reject}));}
await send("Page.enable"); await send("Emulation.setDeviceMetricsOverride",{width:Number(widthText),height:Number(heightText),deviceScaleFactor:1,mobile:Number(widthText)<600});
await send("Page.navigate",{url:targetUrl}); await new Promise(r=>setTimeout(r,1000));
await send("Runtime.evaluate",{expression:`(()=>{const g=document.getElementById('gradeSelect');g.value=${JSON.stringify(grade)};g.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-lang=${lang}]')?.click();document.querySelector('[data-mode=${mode}]')?.click();const a=document.getElementById('activitySelect');if([...a.options].some(x=>x.value===${JSON.stringify(activity)})){a.value=${JSON.stringify(activity)};a.dispatchEvent(new Event('change',{bubbles:true}));}})()`});
await new Promise(r=>setTimeout(r,700));
const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false,fromSurface:true});fs.writeFileSync(output,Buffer.from(shot.data,"base64"));console.log(output);socket.close();
