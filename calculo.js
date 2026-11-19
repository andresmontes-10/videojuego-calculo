"use strict";
const Fisica = (() => {
  function ponderar(partes) {
    const total = partes.reduce((s, p) => s + p.peso, 0);
    const my = partes.reduce((s, p) => s + p.peso * p.x, 0);
    const mx = partes.reduce((s, p) => s + p.peso * p.y, 0);
    return {total, my, mx, x: my / total, y: mx / total, partes};
  }
  function masas(destino) {
    return ponderar([{peso:3,x:-1,y:1},{peso:4,x:2,y:-1},{peso:8,x:destino?3:-2,y:2}]);
  }
  function placas(derecha) {
    const rects = [[0,0,6,2],[derecha?4:0,2,2,3]];
    return {...ponderar(rects.map(([x,y,w,h]) => ({peso:w*h,x:x+w/2,y:y+h/2}))), rects};
  }
  const altura = x => 4-x*x;
  function franjas(n) {
    const dx=4/n;
    return Array.from({length:n},(_,i)=>({x:-2+(i+0.5)*dx,dx,h:altura(-2+(i+0.5)*dx)}));
  }
  function curva() {
    const integral = F => F(2)-F(-2);
    const total=integral(x=>4*x-x**3/3);
    const mx=integral(x=>8*x-4*x**3/3+x**5/10);
    return {total,mx,my:0,x:0,y:mx/total};
  }
  return {masas,placas,altura,franjas,curva};
})();
