"use strict";
const scenery=new Image();scenery.src="assets/sierra.webp";
const steel="#293d40", mint="#8fc9b4", brass="#db9656", black="#1b2c32";
const fill=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
function line(x,y,a,b,c,w=2){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(a,b);ctx.stroke();}
function poly(points,c){ctx.fillStyle=c;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function label(s,x,y,col="#f6edd1",size=12,align="center"){
  ctx.font="bold "+size+"px Consolas, monospace";ctx.textAlign=align;ctx.fillStyle=col;ctx.fillText(s,Math.round(x),Math.round(y));
}
function tag(s,x,y,color="#e5e9c5"){
  const w=s.length*7.2+16;fill(x-w/2,y-15,w,20,"#1c3033");fill(x-w/2,y+4,w,2,color);label(s,x,y,color,12);
}
function wheel(x,y,r){
  ctx.fillStyle=steel;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=brass;ctx.lineWidth=3;ctx.stroke();
  for(let j=0;j<4;j++){let a=j*Math.PI/2+game.t*.22;line(x,y,x+(r-2)*Math.cos(a),y+(r-2)*Math.sin(a),mint,2);}fill(x-2,y-2,4,4,"#e8c686");
}
function trestle(x,y,span,height){
  for(const xx of [x,x+span]){fill(xx-4,y,8,height,steel);fill(xx-4,y,2,height,"#6b8279");}
  for(let yy=y;yy<y+height-5;yy+=40){line(x,yy,x+span,yy+39,"#4a6362",4);line(x+span,yy,x,yy+39,steel,4);fill(x,yy,span,4,"#516765");}
}
function rail(a,b,y){
  for(let x=a;x<b;x+=34){fill(x,y-26,3,26,"#637c73");fill(x,y-27,4,3,"#c9c89e");}
  fill(a,y-25,b-a,2,"#727d69");fill(a,y-13,b-a,1,"#7c8b78");
}
function deck(a,b,y,railOn=true){
  if(railOn)rail(a+3,b-3,y);
  fill(a,y,b-a,5,"#e7b773");fill(a,y+5,b-a,5,"#986941");fill(a,y+10,b-a,11,steel);
  for(let x=a+6;x<b-2;x+=16)fill(x,y+12,3,3,"#8a9f8f");
  for(let x=a+13;x<b-10;x+=87)trestle(x,y+21,41,100);
  fill(a,y+19,b-a,3,"#111f26");
}
function crane(x){
  trestle(x,165,23,156);fill(x-8,155,158,9,steel);fill(x-7,153,157,3,brass);
  for(let i=0;i<6;i++)line(x+3+i*22,154,x+24+i*22,137,"#586b62",3);
  fill(x-4,135,147,4,steel);line(x+8,166,x+70,138,steel,5);
  wheel(x+137,145,10);line(x+140,154,x+140,195,"#354646",2);
  fill(x+139,194,4,11,brass);fill(x+135,203,8,3,brass);fill(x+133,199,3,5,brass);
}
function terminal(x,y){
  fill(x-23,y-48,46,48,black);fill(x-20,y-45,39,31,"#506862");fill(x-16,y-41,30,19,"#172e33");
  const c=machine.solved?"#d2ed7b":"#8adacb";
  fill(x-12,y-38,22,3,c);fill(x-12,y-32,10,2,c);fill(x+4,y-32,6,2,c);
  fill(x-24,y-16,48,6,"#ad8b65");fill(x-17,y-9,5,5,brass);
  for(let i=0;i<3;i++)fill(x+1+i*6,y-8,4,3,i===0?c:"#6d8277");
  fill(x-27,y-52,54,4,"#e1c48c");tag("TABLERO",x,y-65,c);
}
function itemArt(it,x,y,small=false){
  ctx.save();ctx.translate(Math.round(x),Math.round(y));if(small)ctx.scale(.68,.68);
  if(game.level===0){
    fill(-12,-19,24,19,black);fill(-9,-23,6,5,"#8cb7a3");fill(4,-23,6,5,"#8cb7a3");
    fill(-10,-17,19,13,"#e6a243");fill(-9,-16,4,10,"#f9d376");poly([[0,-16],[-3,-10],[0,-10],[-1,-5],[5,-12],[2,-12],[4,-16]],"#533f33");fill(-12,-3,24,3,"#706b4b");
  }else{let w=it.i?15:32,h=it.i?26:12;fill(-w/2,-h,w,h,black);fill(-w/2+2,-h+2,w-4,h-4,it.i?brass:mint);fill(-w/2+4,-h+4,3,3,"#e7d39c");}
  ctx.restore();
}
const liaPixels=[
"       oooooo       ","     ooYYYYYYoo     ","    oYyyyyYYYYYo    ","    oYYYYYYWwwWo    ","   ooOOOOOOOOOOoo   ",
"    oHHHsssssso     ","    oHHssssskso     ","     oHssssssso     ","    ohhssSssso      ","    ohhoottoo       ",
"   obbottTTtoo      ","   oBBotTTTTtso     ","   oBBottOOttoo     ","   oBBotttttgooo    ","    oooOTTTogGggo   ",
"      otTTTogGYYo   ","      ooOOOooggoo   "];
const palette={o:"#1c3036",Y:"#efb44c",y:"#ffd374",W:"#c6f4dd",w:"#efffea",O:"#ad683e",H:"#493638",h:"#654140",s:"#e7a478",S:"#b97155",k:"#243236",t:"#277574",T:"#53b0a1",b:"#81593d",B:"#aa8158",g:"#93553b",G:"#e69a54"};
function character(){
  const running=hero.grounded&&(game.keys.has("d")||game.keys.has("a")||game.keys.has("arrowright")||game.keys.has("arrowleft"));
  const step=running?Math.round(Math.sin(hero.walk)*5):0;
  ctx.save();ctx.translate(Math.round(hero.x),Math.round(hero.y));ctx.scale(hero.face*1.8,1.8);
  const bob=running?Math.abs(step)/5:0;ctx.translate(-10,-23+bob);
  fill(6-step/2,15,5,6,black);fill(7-step/2,16,3,4,"#377577");fill(5-step/2,20,7,3,"#382e31");
  fill(10+step/2,15-(hero.grounded?0:2),5,7,black);fill(11+step/2,16,3,4,"#468f88");fill(10+step/2,20,7,3,"#6a4e3f");
  liaPixels.forEach((row,y)=>{for(let x=0;x<row.length;x++)if(palette[row[x]])fill(x,y,1,1,palette[row[x]]);});
  ctx.restore();
  if(hero.carry)itemArt(hero.carry,hero.x+hero.face*17,hero.y-10,true);
}
function cableCar(x,y,depart=false){
  line(x-200,y-74,x+180,y-116,steel,3);
  if(depart){const dx=game.departure**1.5*36;x+=dx;y-=dx*.11;}
  wheel(x,y-96,6);line(x,y-88,x,y-55,black,4);
  fill(x-36,y-52,72,50,black);fill(x-39,y-54,78,5,brass);fill(x-32,y-47,64,40,"#ad613f");
  for(let i=0;i<3;i++){fill(x-27+i*19,y-43,15,19,"#a5d9c9");fill(x-26+i*19,y-42,4,17,"#d0e4cb");}
  fill(x-35,y-16,70,5,"#f4c77b");fill(x-30,y-4,60,5,"#283a3b");
}
function signpost(x,y,s){fill(x-3,y-54,6,54,"#50544a");fill(x-30,y-56,60,22,black);fill(x-28,y-54,56,18,"#d39c5f");label(s,x,y-41,"#263433",12);}
function atmosphere(){
  if(scenery.complete&&scenery.naturalWidth){
    let w=WW+128,h=w*scenery.naturalHeight/scenery.naturalWidth;
    if(h<WH){h=WH;w=h*scenery.naturalWidth/scenery.naturalHeight;}
    ctx.drawImage(scenery,-(game.cam/476)*(w-WW),-(h-WH)*.44,w,h);
  }else{
    fill(0,0,WW,WH,"#e8cb98");
    [0,1,2,3].forEach(j=>{const p=[[0,WH]];for(let x=-10;x<WW+20;x+=8)p.push([x,100+j*45+Math.sin((x+j*87+game.cam*.2)/(72-j*6))*32+Math.cos(x/23)*9]);p.push([WW,WH]);poly(p,["#b8b89c","#8da39a","#688c83","#496f69"][j]);});
  }
  if(game.level===1)fill(0,0,WW,WH,"#487e8616");if(game.level===2)fill(0,0,WW,WH,"#e0916621");
  for(let i=0;i<13;i++){const x=(i*103+game.t*(3+i%4))%WW,y=125+(i*37)%230+Math.sin(game.t+i)*4;fill(x,y,2,1,"#fff6bb95");}
}
function drawWorld(){
  ctx.imageSmoothingEnabled=false;atmosphere();ctx.save();ctx.translate(-Math.round(game.cam),0);
  crane(game.level===1?52:475);signpost(179,ground,"SALTA ›");
  deck(0,270,ground);deck(321,game.level===1?826:815,ground);
  if(game.level===0){
    deck(1070,1500,ground);
    const tilt=(machine.solved?.17*(1-machine.opened):.17), span=55+200*machine.opened;
    ctx.save();ctx.translate(815,ground);ctx.rotate(tilt);rail(0,span,0);fill(0,0,span,7,"#d39a59");fill(0,7,span,12,steel);
    for(let x=3;x<span-4;x+=18)fill(x,10,5,3,"#80998b");ctx.restore();wheel(815,ground+9,10);
  }
  if(game.level===1){
    deck(965,1500,ground-75);trestle(840,125,105,195);wheel(853,123,11);wheel(945,123,11);
    const ly=ground-machine.lift;line(853,123,853,ly,black);line(945,123,945,ly,black);fill(826,ly,139,7,"#eab46f");fill(826,ly+7,139,11,steel);
    for(let i=0;i<11;i++)fill(830+i*12,ly+8,6,7,brass);
  }
  if(game.level===2){
    deck(815,1500,ground);deck(570,740,ground-60);
    trestle(975,147,25,173);trestle(1094,147,20,173);fill(970,138,149,12,steel);wheel(1043,144,12);
    const gy=ground-machine.opened*118;line(1043,150,1043,gy-81,black,3);
    ctx.beginPath();ctx.moveTo(984,gy);ctx.quadraticCurveTo(1043,gy-164,1102,gy);ctx.closePath();ctx.fillStyle="#47625d";ctx.fill();ctx.strokeStyle=brass;ctx.lineWidth=4;ctx.stroke();
    fill(1040,gy-36,6,6,mint);fill(1038,gy-83,10,4,brass);
  }
  terminal(consoleX,game.level===2?ground-60:ground);
  if(items.every(it=>it.placed)&&items.length)fill(consoleX+26,ground-8,14,8,brass);
  for(const it of items)if(!it.placed&&it!==hero.carry){
    const y=ground-3;const near=Math.abs(hero.x-it.x)<52;
    if(near){ctx.shadowColor="#fbef8a";ctx.shadowBlur=12;}
    itemArt(it,it.x,y);ctx.shadowBlur=0;tag(it.label,it.x,y-31,near?"#e9f68c":"#f2cf91");
  }
  const ey=game.level===1?ground-75:ground;
  signpost(1230,ey,game.level===2?"ANDÉN ›":"SALIDA ›");
  if(game.level===2)cableCar(1350,ey,game.finish);else{
    fill(1324,ey-76,7,76,steel);poly([[1331,ey-75],[1366,ey-69],[1331,ey-57]],machine.solved?"#d1ed81":"#d49158");
  }
  if(!game.finish)character();
  if(hero.x<150&&game.level===0&&!machine.checkpoint)tag("LÍA",hero.x,hero.y-53,"#b9e6ca");
  ctx.restore();
}
