"use strict";
const $ = id => document.getElementById(id);
const world=$("world"), ctx=world.getContext("2d"), panel=$("panel");
const WW=1024, WH=410, ground=320, endX=1330, consoleX=655;
const rooms=[
  {title:"La pasarela de carga",area:"MUELLE DE CARGA",topic:"Masas puntuales",mission:"Cruza el hueco y recoge la batería de 8 kg.",intro:"Lía, el último funicular sigue en el andén. Salta hasta la batería amarilla y llévala al tablero con tu guante."},
  {title:"El elevador del taller",area:"TALLER DE MONTAJE",topic:"Figuras compuestas",mission:"Lleva las dos placas al banco de montaje.",intro:"Necesitamos una pieza en L para el elevador. Recoge cada placa con E y entrégala en el tablero."},
  {title:"La última compuerta",area:"ESTACIÓN CUMBRE",topic:"Región bajo una curva",mission:"Salta a la cabina y escanea la compuerta.",intro:"La compuerta está trabada. Sube al tablero, examina sus franjas y calibra el aparejo de izaje."}
];
const game={level:0,t:0,cam:0,keys:new Set(),modal:"",sound:false,results:[],finish:false};
const hero={x:78,y:ground,vy:0,grounded:true,face:1,walk:0,carry:null};
let items=[], machine, lastTime=0, audioCtx;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function fmt(n,p=2){return n.toLocaleString("es-SV",{minimumFractionDigits:0,maximumFractionDigits:p,useGrouping:false}).replace(".",",")}
function tone(hz=420,duration=.10,type="sine"){
  if(!game.sound)return;
  try{
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    audioCtx.resume();
    const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
    osc.type=type; osc.frequency.value=hz; gain.gain.setValueAtTime(.055,audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);
    osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration);
  }catch{}
}
function radio(msg){$("radio").textContent=msg}
function objective(msg){$("objective").textContent=msg}
function startRoom(level){
  game.level=level;game.cam=0;game.finish=false;game.departure=0;game.arrived=false;game.keys.clear();game.results.length=level;
  Object.assign(hero,{x:78,y:ground,vy:0,grounded:true,face:1,walk:0,carry:null});
  items=(level===0?[["batería de 8 kg",429,"8 kg"]]:level===1?[["placa base",391,"6 × 2 m"],["placa vertical",500,"2 × 3 m"]]:[]).map(([name,x,label],i)=>({name,x,label,i,placed:false}));
  machine={solved:false,opened:0,right:false,dest:false,attempts:0,mark:{x:0,y:0},n:4,scan:0,extra:"",axis:"",guided:false,checkpoint:false,lift:0,ride:false};
  const r=rooms[level]; $("stationNo").textContent="ESTACIÓN 0"+(level+1)+" / 03";
  $("roomTitle").textContent=r.title;$("zone").textContent=r.area;
  $("route").innerHTML=rooms.map((rm,i)=>(i?"<i></i>":"")+'<span class="'+(i===level?"active":i<level?"done":"")+'" title="'+rm.title+'">'+(i<level?"✓ ":"")+"0"+(i+1)+"</span>").join("");
  objective(r.mission);radio(r.intro);contextUpdate();
}
function respawn(){
  hero.x=machine.checkpoint?615:78;hero.y=ground-35;hero.vy=0;hero.grounded=false;
  radio(hero.carry?"Conservas la carga. Puedes volver a intentar el salto.":"De vuelta al punto de control. Toma impulso y pulsa espacio cerca del borde.");
}
function surfaces(){
  const floor=[[0,270,ground],[321,game.level===1?826:815,ground]];
  if(game.level===0){floor.push([1070,1500,ground]);if(machine.solved)floor.push([815,1070,ground]);}
  if(game.level===1){floor.push([965,1500,ground-75],[826,965,ground-machine.lift]);}
  if(game.level===2){floor.push([815,1500,ground],[570,740,ground-60]);}
  return floor;
}
function consoleNear(){
  if(game.level===2)return Math.abs(hero.x-consoleX)<68&&Math.abs(hero.y-(ground-60))<18;
  return Math.abs(hero.x-consoleX)<73;
}
function nearbyItem(){
  return items.find(it=>!it.placed&&it!==hero.carry&&Math.abs(it.x-hero.x)<52&&Math.abs(hero.y-ground)<48);
}
function actionText(){
  if(game.finish)return "Ver resultados";
  if(machine.solved)return "";
  if(consoleNear()){
    if(hero.carry)return "Acoplar "+hero.carry.name;
    if(items.every(it=>it.placed))return "Operar tablero";
  }
  if(hero.carry)return "Soltar "+hero.carry.name;
  const it=nearbyItem();return it?"Recoger "+it.name:"";
}
function contextUpdate(){
  const t=actionText(), b=$("context");b.hidden=!t;
  if(t)b.textContent="E  ·  "+t;
}
function act(){
  if(game.modal)return;
  if(game.finish){showVictory();return;}
  if(machine.solved)return;
  if(consoleNear()&&hero.carry){
    hero.carry.placed=true;hero.carry=null;machine.checkpoint=true;tone(590);
    if(items.every(it=>it.placed)){
      objective("Opera el tablero y calibra la máquina.");radio("Carga lista. Pulsa E junto al tablero para trabajar en la cuadrícula.");
    }else{objective("Recoge la otra placa y tráela al tablero.");radio("Primera placa acoplada. La segunda te espera a la izquierda.");}
  }else if(consoleNear()&&items.every(it=>it.placed)){machine.checkpoint=true;openMachine();}
  else if(hero.carry){
    const floor=surfaces().find(([a,b,y])=>hero.x>=a&&hero.x<=b&&y===ground);
    if(!floor){radio("Aterriza sobre el muelle para soltar la pieza.");return;}
    hero.carry.x=hero.x;hero.carry=null;radio("Pieza en el suelo. Acércate y pulsa E para recuperarla.");
  }else{
    const it=nearbyItem();
    if(it){hero.carry=it;tone(740);objective("Lleva "+it.name+" al tablero de la derecha.");radio("Guante acoplado. Camina al tablero iluminado y pulsa E para entregar la carga.");}
  }
  contextUpdate();
}
function jump(){if(hero.grounded&&!game.finish){hero.vy=-443;hero.grounded=false;tone(310,.07,"triangle");}}
function keyDown(k,repeat){
  if(game.modal)return;
  if(!repeat){if(k==="e")act();if(k==="r"&&!game.finish)respawn();if(k===" "||k==="w"||k==="arrowup")jump();}
  if(!game.modal)game.keys.add(k);
}
document.addEventListener("keydown",e=>{
  if(game.modal)return;
  const k=e.key.toLowerCase();if(["a","d","w","arrowleft","arrowright","arrowup"," ","e","r"].includes(k)&&!(e.target.tagName==="BUTTON"&&k===" ")){e.preventDefault();keyDown(k,e.repeat);}
});
document.addEventListener("keyup",e=>game.keys.delete(e.key.toLowerCase()));
window.addEventListener("blur",()=>game.keys.clear());
document.querySelectorAll("[data-control]").forEach(b=>{
  b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keyDown(b.dataset.control,false);};
  b.onpointerup=b.onpointercancel=()=>game.keys.delete(b.dataset.control);
});
$("context").onclick=()=>{act();if(!game.modal)world.focus({preventScroll:true})};
$("restart").onclick=()=>{startRoom(game.level);world.focus({preventScroll:true})};
$("guide").onclick=()=>openBook();
$("sound").onclick=()=>{game.sound=!game.sound;$("sound").setAttribute("aria-pressed",String(game.sound));$("sound").innerHTML="♪ <span>Sonido "+(game.sound?"on":"off")+"</span>";tone();world.focus({preventScroll:true})};
function showPanel(mode,kicker,title,html){
  game.keys.clear();game.modal=mode;$("panelTitle").textContent=title;$("panelKicker").textContent=kicker;$("panelBody").innerHTML=html;if(!panel.open)panel.showModal();
}
function closePanel(){panel.close();}
$("close").onclick=closePanel;
panel.addEventListener("close",()=>{game.modal="";game.keys.clear();world.focus({preventScroll:true});contextUpdate();});
function currentCalc(){return game.level===0?Fisica.masas(machine.dest):game.level===1?Fisica.placas(machine.right):Fisica.curva();}
function tick(dt){
  game.t+=dt;
  if(game.modal)return;
  if(game.finish){
    game.departure=Math.min(2,game.departure+dt);
    if(game.departure>=2&&!game.arrived){game.arrived=true;showVictory();}
    return;
  }
  const dir=Number(game.keys.has("d")||game.keys.has("arrowright"))-Number(game.keys.has("a")||game.keys.has("arrowleft"));
  const oldX=hero.x;
  hero.x=clamp(hero.x+dir*245*dt,14,1450);
  if(dir){hero.face=dir;hero.walk+=dt*12;}
  if(game.level===1&&hero.x>954&&oldX<=954&&(!machine.solved||hero.y>ground-70))hero.x=954;
  if(game.level===2&&!machine.solved)hero.x=Math.min(hero.x,958);
  if(machine.solved)machine.opened=Math.min(1,machine.opened+dt*1.5);
  if(game.level===1&&machine.solved&&hero.x>838&&hero.x<963&&hero.grounded)machine.ride=true;
  if(machine.ride){
    const before=machine.lift;machine.lift=Math.min(75,machine.lift+dt*65);
    if(hero.x>=826&&hero.x<=965&&hero.grounded)hero.y-=machine.lift-before;
  }
  const oldY=hero.y;hero.vy+=1125*dt;hero.y+=hero.vy*dt;hero.grounded=false;
  if(hero.vy>=0){
    const land=surfaces().filter(([a,b,y])=>hero.x+7>=a&&hero.x-7<=b&&oldY<=y+1.5&&hero.y>=y).sort((a,b)=>a[2]-b[2])[0];
    if(land){hero.y=land[2];hero.vy=0;hero.grounded=true;}
  }
  if(hero.y>WH+65)respawn();
  if(machine.solved&&hero.x>=endX){
    if(game.level<2){startRoom(game.level+1);tone(750,.18);}
    else{game.finish=true;game.keys.clear();objective("¡A bordo! El último funicular parte hacia la cumbre.");radio("Buen trabajo, Lía. El cable vuelve a moverse.");tone(950,.3);}
  }
  game.cam+=(clamp(hero.x-360,0,1500-WW)-game.cam)*(1-Math.exp(-8*dt));contextUpdate();
}
function frame(ts){
  let remaining=Math.min(.08,(ts-lastTime)/1000||0);lastTime=ts;
  while(remaining>0){const step=Math.min(remaining,1/90);tick(step);remaining-=step;}
  drawWorld();requestAnimationFrame(frame);
}
