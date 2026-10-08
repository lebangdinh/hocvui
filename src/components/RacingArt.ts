// Self-contained vector art for the live racing canvas. No external image requests.
type TrackTheme = 'light' | 'dark' | 'candy' | 'forest' | 'space' | string;
type Context = CanvasRenderingContext2D;

const rr = (ctx: Context, x: number, y: number, w: number, h: number, r: number, fill: string) => {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
};

const roadsideTree = (ctx: Context, x: number, y: number, size: number, night: boolean, tick: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(tick * 0.015 + y * 0.01) * 0.024);
  ctx.fillStyle = 'rgba(7,65,42,.17)';
  ctx.beginPath();
  ctx.ellipse(6, 12, size * .77, size * .38, 0, 0, Math.PI * 2);
  ctx.fill();
  rr(ctx, -3, -2, 6, size * .73, 3, '#98664d');
  const leaf = ctx.createRadialGradient(-size * .26, -size * .46, 3, 0, -size * .12, size);
  leaf.addColorStop(0, night ? '#85ddcf' : '#9ff4a3');
  leaf.addColorStop(.6, night ? '#247a78' : '#3cc777');
  leaf.addColorStop(1, night ? '#165562' : '#16775a');
  ctx.fillStyle = leaf;
  ctx.beginPath();
  ctx.arc(0, -size * .22, size * .61, 0, Math.PI * 2);
  ctx.arc(-size * .36, -size * .05, size * .44, 0, Math.PI * 2);
  ctx.arc(size * .34, -size * .04, size * .43, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.38)';
  ctx.beginPath(); ctx.arc(-size * .23, -size * .48, size * .14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};

export function drawRacingTrack(ctx: Context, w: number, h: number, offset: number, tick: number, theme: TrackTheme): void {
  const night = theme === 'dark' || theme === 'space';
  const candy = theme === 'candy';
  const lawn = ctx.createLinearGradient(0, 0, w, 0);
  lawn.addColorStop(0, night ? '#23576a' : candy ? '#d3f7b5' : '#7fe4a6');
  lawn.addColorStop(.5, night ? '#203c61' : candy ? '#a9dfb4' : '#60d699');
  lawn.addColorStop(1, night ? '#255668' : candy ? '#b9f4bb' : '#85e1aa');
  ctx.fillStyle = lawn; ctx.fillRect(0, 0, w, h);

  // Landscaped shoulders, flower patches and moving scenery.
  const cycle = 110;
  const scroll = offset % cycle;
  for (let i = -2; i <= Math.ceil(h / cycle) + 2; i++) {
    const cy = i * cycle + scroll;
    for (const left of [true, false]) {
      const side = left ? 0 : w - 60;
      ctx.fillStyle = night ? 'rgba(192,239,236,.08)' : 'rgba(255,255,255,.25)';
      ctx.beginPath();
      ctx.ellipse(side + 24, cy + 33, 24, 40, .3, 0, Math.PI * 2);
      ctx.fill();
      if (i % 3 !== 0) {
        roadsideTree(ctx, side + (i % 2 ? 20 : 43), cy + 30, 20 + (i % 3) * 2, night, tick);
      } else {
        ctx.save(); ctx.translate(side + 30, cy + 16);
        ctx.fillStyle = '#f6cc68'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff7d2'; ctx.beginPath(); ctx.arc(-3, -3, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      for (let n = 0; n < 3; n++) {
        ctx.fillStyle = ['#ff85a2', '#ffdb73', '#fff6f1'][((i + 12) * 3 + n) % 3];
        ctx.beginPath();
        ctx.arc(side + 8 + (n * 13 + i * i * 3) % 39, cy + 66 + n * 10, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.fillStyle = 'rgba(12,47,76,.20)';
  ctx.fillRect(53, 0, w - 106, h);
  const asphalt = ctx.createLinearGradient(55, 0, w - 55, 0);
  asphalt.addColorStop(0, night ? '#293957' : '#374967');
  asphalt.addColorStop(.13, night ? '#43547c' : '#536a87');
  asphalt.addColorStop(.5, night ? '#374868' : '#405875');
  asphalt.addColorStop(.87, night ? '#43547c' : '#536a87');
  asphalt.addColorStop(1, night ? '#293957' : '#374967');
  ctx.fillStyle = asphalt;
  ctx.fillRect(59, 0, w - 118, h);

  // Painted rumble-strip curbs move with the road.
  const tileHeight = 26;
  for (let y = -tileHeight + (offset % (tileHeight * 2)); y < h; y += tileHeight) {
    ctx.fillStyle = Math.floor((y - offset) / tileHeight) % 2 === 0 ? '#fff9ec' : '#ff7077';
    ctx.fillRect(60, y, 9, tileHeight + 1);
    ctx.fillRect(w - 69, y, 9, tileHeight + 1);
  }
  ctx.fillStyle = 'rgba(255,255,255,.65)';
  ctx.fillRect(73, 0, 2, h); ctx.fillRect(w - 75, 0, 2, h);

  // Three generous lanes, dashed markings and a warm center glow.
  for (const laneX of [w / 3, w * 2 / 3]) {
    for (let y = -60 + (offset % 94); y < h + 50; y += 94) {
      rr(ctx, laneX - 2.5, y, 5, 48, 3, 'rgba(255,255,255,.85)');
    }
  }

  const glow = ctx.createLinearGradient(0, 0, 0, h);
  glow.addColorStop(0, 'rgba(255,255,255,.055)');
  glow.addColorStop(.65, 'rgba(255,255,255,0)');
  glow.addColorStop(1, 'rgba(255,255,255,.045)');
  ctx.fillStyle = glow; ctx.fillRect(75, 0, w - 150, h);

  // Cheery overhead arch banners that pass under the car.
  if (Math.floor(tick / 360) % 3 === 1) {
    const archY = ((offset * .9) % (h + 130)) - 120;
    ctx.save();
    ctx.globalAlpha = .9;
    rr(ctx, 75, archY, w - 150, 17, 8, '#fcba6e');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('★  VƯỢT CHƯỚNG NGẠI VẬT  ★', w / 2, archY + 12);
    ctx.restore();
  }
}

const darken = (hex: string, factor: number) => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return '#5260a1';
  const n = parseInt(hex.slice(1), 16);
  const f = (shift: number) => Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * factor)));
  return `rgb(${f(16)},${f(8)},${f(0)})`;
};

export function drawRacingCar(
  ctx: Context, x: number, y: number, color: string, pattern: string, player: boolean, tick: number
): void {
  ctx.save();
  ctx.translate(x, y);
  // Car is centered at x/y; body is about 51x81px, legible on mobile.
  const tilt = player ? Math.sin(tick * .055) * .013 : 0;
  ctx.rotate(tilt);
  ctx.fillStyle = 'rgba(5,19,33,.32)';
  ctx.beginPath(); ctx.ellipse(5, 37, 36, 15, 0, 0, Math.PI * 2); ctx.fill();

  // Tires & sporty rim highlights.
  for (const ty of [-27, 21]) {
    rr(ctx, -31, ty, 12, 25, 5, '#18233c');
    rr(ctx, 19, ty, 12, 25, 5, '#18233c');
    rr(ctx, -29, ty + 6, 4, 11, 2, '#aab8c9');
    rr(ctx, 25, ty + 6, 4, 11, 2, '#aab8c9');
  }

  // Body silhouette with soft highlights, hood and roof.
  const body = ctx.createLinearGradient(-26, -42, 26, 38);
  body.addColorStop(0, '#fff2dc');
  body.addColorStop(.14, color);
  body.addColorStop(.65, color);
  body.addColorStop(1, darken(color, .72));
  ctx.fillStyle = body;
  ctx.strokeStyle = darken(color, .55);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-17, -43);
  ctx.quadraticCurveTo(-28, -41, -26, -22);
  ctx.lineTo(-26, 27);
  ctx.quadraticCurveTo(-26, 40, -13, 43);
  ctx.lineTo(13, 43);
  ctx.quadraticCurveTo(26, 40, 26, 27);
  ctx.lineTo(26, -22);
  ctx.quadraticCurveTo(28, -41, 17, -43);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,.4)';
  rr(ctx, -20, -36, 5, 64, 2, 'rgba(255,255,255,.36)');

  // Cockpit and windscreen.
  const windshield = ctx.createLinearGradient(0, -28, 0, 22);
  windshield.addColorStop(0, '#99e9ff');
  windshield.addColorStop(.6, '#335d8c');
  windshield.addColorStop(1, '#1b3359');
  rr(ctx, -18, -23, 36, 25, 9, '#243b58');
  rr(ctx, -16, -22, 32, 22, 7, windshield);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.beginPath(); ctx.moveTo(-11, -20); ctx.lineTo(-3, -20); ctx.lineTo(-12, -4); ctx.lineTo(-16, -4); ctx.closePath(); ctx.fill();
  rr(ctx, -18, 15, 36, 14, 6, '#263a59');
  rr(ctx, -15, 16, 30, 11, 4, '#79bdd6');

  if (pattern === 'stripes') {
    rr(ctx, -4, -41, 8, 16, 2, 'rgba(255,255,255,.9)');
    rr(ctx, -4, 3, 8, 10, 2, 'rgba(255,255,255,.9)');
    rr(ctx, -4, 31, 8, 7, 2, 'rgba(255,255,255,.9)');
  } else if (pattern === 'dots') {
    for (const [dx,dy] of [[-16,6],[14,8],[-14,35],[14,35]]) {
      ctx.fillStyle = '#fff4ac'; ctx.beginPath(); ctx.arc(dx,dy,4,0,Math.PI*2); ctx.fill();
    }
  } else if (pattern === 'flames') {
    ctx.fillStyle = '#ffde7c';
    ctx.beginPath(); ctx.moveTo(-13,-37);ctx.lineTo(-5,-23);ctx.lineTo(1,-37);ctx.lineTo(8,-22);ctx.lineTo(15,-37);ctx.closePath();ctx.fill();
  } else if (pattern === 'lightning') {
    ctx.fillStyle = '#fff1a3';
    ctx.beginPath();ctx.moveTo(-3,1);ctx.lineTo(9,1);ctx.lineTo(0,13);ctx.lineTo(10,13);ctx.lineTo(-5,35);ctx.lineTo(0,19);ctx.lineTo(-11,19);ctx.closePath();ctx.fill();
  }

  // Small front face, headlights, spoiler and sparkles.
  rr(ctx, -15, -42, 12, 7, 3, '#fff2bb');
  rr(ctx, 3, -42, 12, 7, 3, '#fff2bb');
  rr(ctx, -15, 37, 9, 5, 2, '#fa7280');
  rr(ctx, 6, 37, 9, 5, 2, '#fa7280');
  rr(ctx, -29, 32, 58, 5, 3, darken(color, .72));
  if (player && tick % 18 < 7) {
    ctx.strokeStyle = 'rgba(255,244,179,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-34,36);ctx.lineTo(-39,45);ctx.moveTo(34,36);ctx.lineTo(39,45);ctx.stroke();
  }
  ctx.restore();
}
