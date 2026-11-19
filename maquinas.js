"use strict";
const units=()=>game.level===2?"dm":"m";
const tol=.050000001;
function numero(s){
  const t=String(s).trim().replace(",",".").replace("−","-");
  if(!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[-+]?\d+(?:\.\d*)?)?$/.test(t))return NaN;
  const [a,b]=t.split("/").map(Number);return b===undefined?a:(b===0?NaN:a/b);
}
function mathHelp(i){
  if(i===0)return "<b>Promedio ponderado por masa.</b> Cada carga aporta su masa por su distancia con signo. Mᵧ = Σmᵢxᵢ y Mₓ = Σmᵢyᵢ. Divide por la masa total para hallar x̄ = Mᵧ/m e ȳ = Mₓ/m.";
  if(i===1)return "<b>Promedio ponderado por área.</b> Con igual densidad y espesor, la masa es proporcional al área. El centro de cada rectángulo queda a mitad de su ancho y altura. x̄ = ΣAᵢxᵢ/A e ȳ = ΣAᵢyᵢ/A.";
  return "<b>De franjas a integrales.</b> Cada franja aporta f(x) dx de área y su centro está a f(x)/2 de altura. Entre −2 y 2, A = ∫ f(x) dx, x̄ = ∫ x f(x) dx / A e ȳ = ∫ f(x)²/2 dx / A. La simetría cancela el momento horizontal.";
}
function development(){
  const r=currentCalc();
  if(game.level===0)return "m = 3 + 4 + 8 = 15 kg. Mᵧ = 3(−1) + 4(2) + 8("+r.partes[2].x+") = "+fmt(r.my)+" kg·m. Mₓ = 3(1) + 4(−1) + 8(2) = 15 kg·m. Divide cada momento por 15.";
  if(game.level===1)return "A = 6·2 + 2·3 = 18 m². La base tiene centro (3; 1) m y la placa superior ("+r.partes[1].x+"; 3,5) m. Usa x̄ = (12·3 + 6·"+r.partes[1].x+")/18 e ȳ = (12·1 + 6·3,5)/18.";
  return "f(1) = 4 − 1² = 3 dm. La mitad da la altura central de esa franja. Por simetría x̄ = 0. Entre −2 y 2, A = [4x − x³/3] = 32/3 dm² y Mₓ = [8x − 4x³/3 + x⁵/10] = 256/15 dm³. Divide Mₓ por A.";
}
function openBook(){
  showPanel("book","CUADERNO DE LÍA","Notas de mecánica",'<div class="book">'+rooms.map((r,i)=>"<h3>"+r.topic+"</h3><p>"+mathHelp(i)+"</p>").join("")+'<button id="back" class="primary">Volver al taller</button></div>');$("back").onclick=closePanel;
}
function showVictory(){
  const lines=game.results.map((r,i)=>"<h3>0"+(i+1)+" · "+rooms[i].title+"</h3><p>"+r+"</p>").join("");
  showPanel("victory","RUTA COMPLETADA · 3 / 3","¡El funicular vuelve a la cumbre!",'<div class="book"><p>Lía llega al andén. Las tres máquinas están calibradas y el último vagón puede partir.</p>'+lines+'<button id="again" class="primary">Volver a jugar</button></div>');
  $("again").onclick=()=>{closePanel();startRoom(0);};objective("Ruta completa. Las tres máquinas están en servicio.");
}
function openMachine(){
  const i=game.level;
  const instruction=["Acopla la batería en el destino (3; 2) m. Marca el centro de masa y calcula el momento respecto al eje y.","Encaja la placa vertical a un lado de la base. Marca el centroide de la figura completa y calcula su área.","La compuerta está bajo f(x) = 4 − x² entre −2 y 2 dm. Barre hasta x = 1 dm y determina el centro de esa franja, el eje de simetría y el centroide de toda la placa."][i];
  const options=i===2?'<label>Escáner · <b id="scanRead"></b><input id="scan" type="range" min="-2" max="2" step=".05"></label><div class="switches" aria-label="Número de franjas">'+[4,8,16].map(n=>'<button data-n="'+n+'">'+n+' franjas</button>').join("")+'</div><p id="sum" class="readout"></p>':'<div class="switches"><button id="opt0">'+(i===0?"Banco alternativo":"Encaje izquierdo")+'</button><button id="opt1">'+(i===0?"Banco de destino":"Encaje derecho")+'</button></div>';
  const extraLabel=["Momento Mᵧ (kg·m)","Área de la pieza (m²)","Centro de franja en x = 1 · altura (dm)"][i];
  showPanel("machine","TABLERO 0"+(i+1)+" / 03",rooms[i].topic,'<div class="panelgrid"><div class="graph-wrap"><canvas id="graph" width="440" height="355" tabindex="0" aria-label="Cuadrícula interactiva. Clic para colocar la marca, flechas para ajuste fino."></canvas><p class="graph-note">Clic en la cuadrícula para marcar. Flechas para afinar ±0,01 '+units()+'. '+(i===0?"Arrastra la batería entre los dos bancos.":i===1?"Arrastra la placa superior para reflejar la pieza.":"Mueve el escáner con el deslizador.")+'</p>'+options+'</div><div class="form"><p>'+instruction+'</p><div class="coords"><label>Marca x ('+units()+')<input id="markX" inputmode="decimal"></label><label>Marca y ('+units()+')<input id="markY" inputmode="decimal"></label></div>'+(i===2?'<label>Eje de simetría · x (dm)<input id="axis" inputmode="decimal"></label>':'')+'<label>'+extraLabel+'<input id="extra" inputmode="decimal"></label><button id="test" class="primary">Probar calibración</button><p class="feedback" id="feedback" role="status"></p><details id="help"><summary>Consultar el cálculo</summary><p>'+mathHelp(i)+'</p><p id="dev"></p></details></div></div>');
  $("extra").value=machine.extra;$("extra").oninput=()=>{machine.extra=$("extra").value;clearFeedback();};
  if(i===2){$("axis").value=machine.axis;$("axis").oninput=()=>{machine.axis=$("axis").value;clearFeedback();};
    $("scan").value=machine.scan;$("scan").oninput=()=>{machine.scan=+$("scan").value;clearFeedback();refreshGraph();};
    document.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>{machine.n=+b.dataset.n;refreshGraph();});
  }else{[0,1].forEach(v=>$("opt"+v).onclick=()=>changeSide(Boolean(v)));}
  ["X","Y"].forEach(k=>{$("mark"+k).oninput=()=>{
    clearFeedback();const v=numero($("mark"+k).value);if(Number.isFinite(v)){machine.mark[k.toLowerCase()]=v;refreshGraph();}
  };});
  $("test").onclick=checkMachine;
  bindGraph();syncMark();refreshGraph();
}
function clearFeedback(){$("feedback").textContent="";}
function syncMark(){
  $("markX").value=fmt(machine.mark.x);$("markY").value=fmt(machine.mark.y);
}
function changeSide(right){
  if(game.level===0)machine.dest=right;else machine.right=right;
  $("feedback").textContent=game.level===0?(right?"Batería en el destino (3; 2) m.":"Batería en (−2; 2) m. Observa cómo cambia el giro."):(right?"Placa encajada a la derecha.":"Placa encajada a la izquierda.");
  tone(470,.07);refreshGraph();
}
function graphSpace(){
  const cfg=[[-3,4,-2,3],[ -1,7,-1,6],[-3,3,-.5,4.8]][game.level];
  const [xmin,xmax,ymin,ymax]=cfg,s=Math.min(373/(xmax-xmin),259/(ymax-ymin)),ox=33+(373-(xmax-xmin)*s)/2-xmin*s,oy=298-(259-(ymax-ymin)*s)/2+ymin*s;
  return {xmin,xmax,ymin,ymax,s,X:x=>ox+s*x,Y:y=>oy-s*y,invX:px=>(px-ox)/s,invY:py=>(oy-py)/s};
}
function bindGraph(){
  const c=$("graph");let drag="";
  function point(e){const b=c.getBoundingClientRect(),g=graphSpace();return {x:g.invX((e.clientX-b.left)*440/b.width),y:g.invY((e.clientY-b.top)*355/b.height)};}
  function mark(p){const g=graphSpace();machine.mark={x:Math.round(100*clamp(p.x,g.xmin,g.xmax))/100,y:Math.round(100*clamp(p.y,g.ymin,g.ymax))/100};clearFeedback();syncMark();refreshGraph();}
  c.onpointerdown=e=>{
    const p=point(e);c.focus();c.setPointerCapture(e.pointerId);
    drag=game.level===0&&Math.hypot(p.x-(machine.dest?3:-2),p.y-2)<.39?"battery":game.level===1&&p.y>2&&p.y<=5&&p.x>=(machine.right?4:0)&&p.x<=(machine.right?6:2)?"plate":"mark";
    if(drag==="mark")mark(p);
  };
  c.onpointermove=e=>{if(drag==="mark")mark(point(e));};
  c.onpointerup=e=>{if(drag==="battery")changeSide(point(e).x>.5);if(drag==="plate")changeSide(point(e).x>3);drag="";};
  c.onpointercancel=()=>drag="";
  c.onkeydown=e=>{
    const d={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key];
    if(d){e.preventDefault();mark({x:machine.mark.x+.01*d[0],y:machine.mark.y+.01*d[1]});}
  };
}
function refreshGraph(){
  const i=game.level,g=graphSpace(),c=$("graph"),p=c.getContext("2d"),{X,Y,s}=g;
  const r=currentCalc();$("dev").textContent=development();
  const ln=(x,y,a,b,col,w=1)=>{p.beginPath();p.moveTo(x,y);p.lineTo(a,b);p.strokeStyle=col;p.lineWidth=w;p.stroke();};
  const tx=(str,x,y,color="#c0d2c8",align="center")=>{p.font="bold 12px Consolas,monospace";p.textAlign=align;p.fillStyle=color;p.fillText(str,x,y);};
  const dot=(x,y,rad,col)=>{p.beginPath();p.arc(x,y,rad,0,Math.PI*2);p.fillStyle=col;p.fill();};
  const block=(x,y,w,h,color)=>{p.fillStyle=color;p.fillRect(X(x),Y(y+h),w*s,h*s);};
  p.clearRect(0,0,440,355);p.fillStyle="#102328";p.fillRect(0,0,440,355);
  if(i===1){
    r.rects.forEach(([x,y,w,h],k)=>{block(x,y,w,h,k?"#ad754a":"#568d80");p.strokeStyle=k?"#f5bd86":"#a9d8bd";p.strokeRect(X(x),Y(y+h),w*s,h*s);});
    p.setLineDash([5,4]);p.strokeStyle="#7d9990";p.strokeRect(X(machine.right?0:4),Y(5),2*s,3*s);p.setLineDash([]);
  }
  if(i===2){
    const strips=Fisica.franjas(machine.n);strips.forEach(({x,dx,h},k)=>block(x-dx/2,0,dx,h,k%2?"#446f67":"#385e59"));
    p.beginPath();for(let k=0;k<=100;k++){const x=-2+.04*k;const y=Y(Fisica.altura(x));if(k)p.lineTo(X(x),y);else p.moveTo(X(x),y);}
    p.strokeStyle="#e6c587";p.lineWidth=3;p.stroke();const sx=machine.scan,h=Fisica.altura(sx);
    ln(X(sx),Y(0),X(sx),Y(h),"#fbb979",5);dot(X(sx),Y(h/2),5,"#ffedbe");
    $("scanRead").textContent="x = "+fmt(sx)+" dm · f(x) = "+fmt(h)+" dm";$("sum").textContent="Área aproximada ≈ "+fmt(strips.reduce((v,a)=>v+a.h*a.dx,0),4)+" dm²";
    document.querySelectorAll("[data-n]").forEach(b=>b.classList.toggle("chosen",+b.dataset.n===machine.n));
    if(machine.guided){block(-1.7,.1,3.4,.55,"#efd68f39");}
  }
  for(let x=Math.ceil(g.xmin);x<=g.xmax;x++){ln(X(x),Y(g.ymin),X(x),Y(g.ymax),"#aec3a929");tx(String(x),X(x),Y(g.ymin)+15);}
  for(let y=Math.ceil(g.ymin);y<=g.ymax;y++){ln(X(g.xmin),Y(y),X(g.xmax),Y(y),"#aec3a929");tx(String(y),X(g.xmin)-7,Y(y)+4,"#b0c7b9","right");}
  ln(X(0),Y(g.ymin),X(0),Y(g.ymax),"#a2b6a3",1.5);ln(X(g.xmin),Y(0),X(g.xmax),Y(0),"#a2b6a3",1.5);
  tx("y ("+units()+")",X(0)+8,22,"#c8dccb","left");tx("x ("+units()+")",425,Y(0)-7,"#c8dccb","right");
  if(i===0){
    const bx=machine.dest?-2:3;p.setLineDash([3,3]);p.strokeStyle=mint;p.strokeRect(X(bx)-12,Y(2)-12,24,24);p.setLineDash([]);
    for(const z of r.partes){dot(X(z.x),Y(z.y),z.peso+7,z.peso===8?"#ffc16e":"#8bcabb");tx(z.peso+" kg",X(z.x),Y(z.y)-20,"#f7eccc");}
    const slope=clamp((r.x-machine.mark.x)*.035,-.095,.095);
    const support=X(clamp(machine.mark.x,g.xmin+.25,g.xmax-.25));
    const a=X(g.xmin),b=X(g.xmax);
    ln(a,328+(a-support)*slope,b,328+(b-support)*slope,"#dbab6c",5);tx("▲",support,342,"#9ad1b0");
    const active=machine.dest;$("opt0").classList.toggle("chosen",!active);$("opt1").classList.toggle("chosen",active);
    if(machine.guided){p.strokeStyle="#fff1a1";p.lineWidth=3;p.strokeRect(X(r.partes[2].x)-19,Y(2)-19,38,38);}
  }
  if(i===1){$("opt0").classList.toggle("chosen",!machine.right);$("opt1").classList.toggle("chosen",machine.right);if(machine.guided)r.partes.forEach(z=>{dot(X(z.x),Y(z.y),5,"#ffe9a8");tx(z.peso+" m²",X(z.x),Y(z.y)-9,"#ffebb8");});}
  const px=X(machine.mark.x),py=Y(machine.mark.y);
  if(Number.isFinite(px)&&Number.isFinite(py)){p.beginPath();p.arc(px,py,8,0,Math.PI*2);p.strokeStyle="#e0f778";p.lineWidth=2;p.stroke();ln(px-13,py,px+13,py,"#e0f778",2);ln(px,py-13,px,py+13,"#e0f778",2);}
  tx("⊕ TU MARCA",14,18,"#d4ee80","left");
}
function checkMachine(){
  const i=game.level,r=currentCalc(),x=numero($("markX").value),y=numero($("markY").value),n=numero(machine.extra);
  const errX=Math.abs(r.x-x)>tol,errY=Math.abs(r.y-y)>tol;
  let msg="";
  if(![x,y,n].every(Number.isFinite))msg="Completa los tres valores. Puedes escribir 1,93 o una fracción como 29/15.";
  else if(i===0&&!machine.dest)msg="Mueve la batería al alojamiento de destino (3; 2) m y vuelve a calcular.";
  else if(i===2&&Math.abs(machine.scan-1)>.026)msg="Sitúa el escáner en x = 1 dm para medir la franja de muestra.";
  else if(i===2&&(!Number.isFinite(numero(machine.axis))||Math.abs(numero(machine.axis))>tol))msg="Observa dónde se reflejan las dos mitades de la parábola. Introduce esa coordenada x.";
  else if(i===0&&Math.abs(n-r.my)>tol)msg="Para Mᵧ usa las x con su signo. La carga de 3 kg aporta 3·(−1) = −3 kg·m.";
  else if(i===1&&Math.abs(n-r.total)>tol)msg="Cuenta las celdas de las dos placas. El borde compartido ocupa cero área.";
  else if(i===2&&Math.abs(n-Fisica.altura(1)/2)>tol)msg="La franja mide 3 dm de alto. Su centro está a la mitad de esa altura.";
  else if(errX||errY){
    if(i===0)msg=errX?"El bastidor gira. ¿Cuál de las tres posiciones pesa más en el promedio? Observa la batería de 8 kg.":"El apoyo ya está alineado. Revisa la altura con Mₓ = Σmᵢyᵢ.";
    if(i===1)msg="Mira los centros de las placas. La base tiene el doble de área y aporta el doble al promedio.";
    if(i===2)msg=errX?"La placa se refleja alrededor de x = 0. Coloca la marca sobre ese eje.":"Observa la parte ancha de la placa. Para su altura usa ∫ f²/2 dx dividido entre el área.";
  }
  if(msg){machine.attempts++;machine.guided=true;$("feedback").textContent=msg;if(machine.attempts>=2)$("help").open=true;refreshGraph();tone(155,.14,"triangle");return;}
  machine.solved=true;tone(840,.24);const center="C = ("+fmt(r.x,3)+"; "+fmt(r.y,3)+") "+units();
  const detail=[ "Mᵧ = "+fmt(r.my)+" kg·m","A = "+fmt(r.total)+" m²","A = 32/3 dm² · Mₓ = 256/15 dm³"][i];
  game.results[i]=detail+" · "+center;
  const next=["Cruza la pasarela hasta la bandera.","Sube al elevador y camina hasta la bandera.","Cruza la compuerta y llega al vagón."][i];
  objective(next);radio("Calibración correcta. "+next);
  showPanel("success","CALIBRACIÓN ACEPTADA",["¡Pasarela nivelada!","¡Elevador en marcha!","¡Compuerta liberada!"][i],'<div class="book"><p class="result">'+center+'</p><p>'+detail+'</p><p>'+development()+'</p><p>'+next+'</p><button class="primary" id="continue">Volver al recorrido →</button></div>');$("continue").onclick=closePanel;
}
startRoom(0);requestAnimationFrame(frame);
