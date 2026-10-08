// Rich self-contained canvas illustrations shared by the three arcade games.
// The artwork is deliberately friendly to primary-school children and needs no external assets.
export type ArcadeKind = 'chicken' | 'airplane' | 'tank';
type C = CanvasRenderingContext2D;
const ellipse = (c:C,x:number,y:number,rx:number,ry:number,fill:string,rot=0) => {
  c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,Math.PI*2);c.fill();
};
const rounded=(c:C,x:number,y:number,w:number,h:number,r:number,color:string|CanvasGradient)=>{
  c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();
};
const star=(c:C,x:number,y:number,r:number,fill:string,n=5)=>{
  c.fillStyle=fill;c.beginPath();for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n;const radius=i%2?r*.5:r;const xx=x+Math.cos(a)*radius, yy=y+Math.sin(a)*radius;if(i===0)c.moveTo(xx,yy);else c.lineTo(xx,yy);}c.closePath();c.fill();
};
const balloon=(c:C,x:number,y:number,s:number,t:number)=>{
  c.save();c.translate(x,y+Math.sin(t*.017+x)*5);c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2;
  c.beginPath();c.moveTo(0,s);c.quadraticCurveTo(12,s+12,1,s+28);c.stroke();
  ellipse(c,0,0,s*.65,s,'#ffb0c9');ellipse(c,-s*.24,-s*.25,s*.16,s*.32,'rgba(255,255,255,.65)',-.4);c.restore();
};
export function drawArcadeBackground(c:C,kind:ArcadeKind,w:number,h:number,t:number):void{
  const g=c.createLinearGradient(0,0,0,h);
  if(kind==='chicken'){g.addColorStop(0,'#7fdcff');g.addColorStop(.58,'#d6f5ff');g.addColorStop(1,'#ffe5a6');}
  else if(kind==='tank'){g.addColorStop(0,'#97aafc');g.addColorStop(.7,'#c7e6ed');g.addColorStop(1,'#e8dcff');}
  else {g.addColorStop(0,'#101b59');g.addColorStop(.55,'#2c4c9e');g.addColorStop(1,'#9a7cf1');}
  c.fillStyle=g;c.fillRect(0,0,w,h);
  c.save();
  if(kind==='airplane'){
    // Nebula clouds, planets and starfield with three distinct parallax layers.
    for(let i=0;i<7;i++){const x=(i*97+30+t*(i%3+1)*.04)%w;const y=(i*111+30)%h;
      const nebula=c.createRadialGradient(x,y,4,x,y,100);nebula.addColorStop(0,i%2?'rgba(255,165,217,.13)':'rgba(98,221,255,.19)');nebula.addColorStop(1,'transparent');c.fillStyle=nebula;c.fillRect(x-100,y-100,200,200);
    }
    for(let i=0;i<85;i++){let x=(i*67.5+Math.sin(i*12)*77+w)%w;let y=(i*41.31+t*(.22+i%3*.25))%h;
      ellipse(c,x,y,i%8===0?2.6:1.1,i%8===0?2.6:1.1,i%7===0?'#ffda96':'rgba(255,255,255,.73)');
    }
    const px=w-63,py=73;const p=c.createRadialGradient(px-15,py-16,5,px,py,60);
    p.addColorStop(0,'#ffdfba');p.addColorStop(.55,'#ff9db9');p.addColorStop(1,'#a46fe0');
    ellipse(c,px,py,49,49,p as unknown as string);
    c.strokeStyle='rgba(255,225,244,.8)';c.lineWidth=9;c.beginPath();c.ellipse(px,py,68,20,-.35,0,Math.PI*2);c.stroke();
  } else {
    // Soft drifting toy clouds, hills and playful landscape details.
    for(let i=0;i<5;i++){const x=((i*133-t*(.22+i*.05))%(w+160)+w+160)%(w+160)-80;const y=42+(i*73)%176;
      c.fillStyle='rgba(255,255,255,.58)';c.beginPath();c.ellipse(x,y,43,15,0,0,Math.PI*2);c.ellipse(x-20,y-7,22,19,0,0,Math.PI*2);c.ellipse(x+11,y-12,29,22,0,0,Math.PI*2);c.fill();
    }
    if(kind==='chicken'){
      c.fillStyle='#a1dbb6';c.beginPath();c.moveTo(0,h-85);c.quadraticCurveTo(w*.45,h-185,w,h-92);c.lineTo(w,h);c.lineTo(0,h);c.fill();
      c.fillStyle='#5cbf96';c.beginPath();c.moveTo(0,h-55);c.quadraticCurveTo(w*.63,h-135,w,h-54);c.lineTo(w,h);c.lineTo(0,h);c.fill();
      for(let i=0;i<10;i++){const x=(i*67)%w;const y=h-47-(i*19)%50;const color=['#fc87b1','#fee078','#8fd0ff'][i%3];star(c,x,y,6,color,5);}
      balloon(c,w-65,130,23,t);
    }else{
      c.fillStyle='#7298d8';c.beginPath();c.moveTo(0,h-115);c.quadraticCurveTo(w*.35,h-210,w*.6,h-121);c.quadraticCurveTo(w*.8,h-170,w,h-100);c.lineTo(w,h);c.lineTo(0,h);c.fill();
      c.fillStyle='#71c9b6';c.beginPath();c.moveTo(0,h-45);c.quadraticCurveTo(w*.6,h-145,w,h-60);c.lineTo(w,h);c.lineTo(0,h);c.fill();
      for(let i=0;i<7;i++){const x=i*73+15;const y=h-26-(i%3)*19;rounded(c,x,y,13,21,4,'#ffde92');rounded(c,x+3,y+4,7,8,2,'#fff');}
    }
  }
  const vignette=c.createLinearGradient(0,0,0,h);
  vignette.addColorStop(0,'rgba(0,0,0,.03)');vignette.addColorStop(1,'rgba(10,30,65,.10)');
  c.fillStyle=vignette;c.fillRect(0,0,w,h);c.restore();
}

export function drawArcadeHero(c:C,kind:ArcadeKind,x:number,y:number,player:number,t:number):void{
  c.save();c.translate(x,y+Math.sin(t*.09)*2);
  c.shadowColor=player===1?'rgba(51,181,244,.48)':'rgba(206,111,254,.6)';c.shadowBlur=19;
  if(kind==='tank'){
    // Tiny wheeled rescue robot: smiling face, articulated arms and rotating light.
    const col=player===1?'#5edfb0':'#be94ff';
    ellipse(c,3,35,33,9,'rgba(21,42,71,.19)');
    rounded(c,-26,17,52,24,12,'#4a5980');
    for(const xx of [-18,0,18])ellipse(c,xx,35,8,8,'#243856');
    rounded(c,-22,0,44,32,14,col);
    rounded(c,-14,5,28,18,9,'#2c4770');
    ellipse(c,-6,14,4,5,'#fff');ellipse(c,6,14,4,5,'#fff');
    c.strokeStyle='#9be8f1';c.lineWidth=2;c.beginPath();c.arc(0,16,7,.25,Math.PI-.25);c.stroke();
    rounded(c,-6,-35,12,38,6,'#5f75a5');rounded(c,-9,-37,18,8,4,'#e0f8ff');
    ellipse(c,0,-38,5,5,t%30<15?'#ffe07b':'#ff90ab');
    rounded(c,-32,-3,12,20,7,'#8ba5f5');rounded(c,20,-3,12,20,7,'#8ba5f5');
  } else {
    // Glossy rescue spaceship with a friendly visor, engine flames and wing decals.
    const main=player===1?'#58d3f6':'#d49aff';
    const darker=player===1?'#3761bb':'#8b57bd';
    ellipse(c,0,32,33,10,'rgba(6,34,71,.18)');
    c.fillStyle=darker;c.beginPath();c.moveTo(-14,-8);c.lineTo(-38,23);c.lineTo(-34,35);c.lineTo(-4,20);c.lineTo(4,20);c.lineTo(34,35);c.lineTo(38,23);c.lineTo(14,-8);c.closePath();c.fill();
    c.fillStyle=main;c.beginPath();c.moveTo(0,-37);c.quadraticCurveTo(20,-15,20,17);c.lineTo(0,34);c.lineTo(-20,17);c.quadraticCurveTo(-20,-15,0,-37);c.fill();
    const shine=c.createLinearGradient(-16,-34,15,24);shine.addColorStop(0,'rgba(255,255,255,.88)');shine.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=shine;c.beginPath();c.moveTo(0,-32);c.quadraticCurveTo(13,-10,14,7);c.lineTo(-4,10);c.closePath();c.fill();
    rounded(c,-12,-11,24,20,10,'#26467e');rounded(c,-10,-10,20,16,8,'#9feefb');
    ellipse(c,-4,-6,3,3,'#fff');
    for(const side of [-1,1]){star(c,side*25,19,5,'#fff5a9');}
    c.fillStyle='#ffb058';c.beginPath();c.moveTo(-11,28);c.lineTo(0,47+Math.sin(t*.34)*6);c.lineTo(11,28);c.fill();
    c.fillStyle='#fff2a8';c.beginPath();c.moveTo(-5,27);c.lineTo(0,39+Math.sin(t*.31)*4);c.lineTo(5,27);c.fill();
  }
  c.restore();
}

export function drawArcadeEnemy(c:C,kind:ArcadeKind,x:number,y:number,size:number,t:number):void{
  c.save();c.translate(x,y+Math.sin(t*.06+x*.03)*3);
  c.shadowColor='rgba(40,45,85,.22)';c.shadowBlur=11;
  if(kind==='chicken'){
    const s=size/28;c.scale(s,s);
    ellipse(c,0,2,28,25,'#ffe38b');ellipse(c,-5,-5,19,18,'#fff5ca');
    ellipse(c,-25,7,13,18,'#ffcd6d',-.6);ellipse(c,25,7,13,18,'#ffcd6d',.6);
    c.fillStyle='#ff748f';c.beginPath();c.moveTo(-16,-20);c.lineTo(-9,-36);c.lineTo(0,-24);c.lineTo(8,-38);c.lineTo(18,-20);c.fill();
    ellipse(c,-10,-5,4,6,'#324460');ellipse(c,11,-5,4,6,'#324460');
    ellipse(c,-11,-7,1.5,2,'#fff');ellipse(c,10,-7,1.5,2,'#fff');
    ellipse(c,-18,7,7,4,'#ff9c9d');ellipse(c,18,7,7,4,'#ff9c9d');
    c.fillStyle='#ef8743';c.beginPath();c.moveTo(-6,6);c.lineTo(10,10);c.lineTo(-6,13);c.fill();
    c.strokeStyle='#ed9142';c.lineWidth=3;c.beginPath();c.moveTo(-7,23);c.lineTo(-10,29);c.moveTo(7,23);c.lineTo(10,29);c.stroke();
  }else if(kind==='tank'){
    const s=size/25;c.scale(s,s);
    rounded(c,-27,-22,54,44,18,'#fdc87d');rounded(c,-22,-24,44,41,18,'#fdf0bf');
    rounded(c,-17,-12,34,22,9,'#50659a');ellipse(c,-8,-2,4,5,'#a4fcfe');ellipse(c,8,-2,4,5,'#a4fcfe');
    rounded(c,-14,18,28,8,4,'#a172cf');rounded(c,-3,-38,6,14,3,'#e9f4ff');
    star(c,0,-40,9,'#ff94bb');
  }else{
    const s=size/26;c.scale(s,s);
    c.fillStyle='#ffa5cb';c.beginPath();c.moveTo(-30,8);c.lineTo(-13,-14);c.lineTo(14,-14);c.lineTo(30,8);c.lineTo(10,19);c.lineTo(-10,19);c.fill();
    ellipse(c,0,-9,20,15,'#ffd8eb');
    rounded(c,-12,-15,24,15,8,'#6a89ce');ellipse(c,-4,-10,4,3,'#a8f0ff');
    star(c,-23,8,5,'#fff3a1');star(c,23,8,5,'#fff3a1');
  }
  c.restore();
}

export function drawArcadeProjectile(c:C,x:number,y:number,player:number,t:number):void{
  c.save();
  const glow=c.createRadialGradient(x,y,1,x,y,18);
  glow.addColorStop(0,'#fff');glow.addColorStop(.28,player===1?'#ffe887':'#e6b5ff');glow.addColorStop(1,'rgba(255,255,255,0)');
  ellipse(c,x,y,18,18,glow as unknown as string);
  ellipse(c,x,y,4+Math.sin(t*.3)*.6,9,player===1?'#ffce58':'#c6a0ff');
  c.restore();
}
