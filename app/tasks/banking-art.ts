export const bankingMotifs = {
  "banking operations": "vault",
  "business and commercial banking": "briefcase",
  "consumer banking and channels": "atm",
  "customer servicing and recovery": "headset",
  "enterprise services": "gears",
  "finance and treasury": "coins",
  "governance and strategy": "compass",
  "institutional banking": "columns",
  "markets and investment services": "market",
  "payments and merchant services": "terminal",
  "products and growth": "sprout",
  "risk and assurance": "balance",
  "technology and data": "database",
} as const;

type BankingMotif = typeof bankingMotifs[keyof typeof bankingMotifs];
export type ObjectMotif = Exclude<BankingMotif, "coins" | "gears">;
export type Ink = { paper: string; light: string; mid: string; dark: string; line: string };

// Raised silhouettes share the coin engravings' ink, side wall and lit face.
// Scene coordinates are centred on the object so moving parts rotate on their pins.
export function drawBankingObject(ctx: CanvasRenderingContext2D, motif: ObjectMotif, t: number, ink: Ink) {
  ctx.save();
  ctx.translate(180, 99);
  ctx.transform(1, -.095, .13, .96, 0, 0);
  ctx.lineCap = "round";
  function relief(path: Path2D, depth = 5, colour = ink.light) {
    ctx.save();
    ctx.translate(depth, depth);
    ctx.fillStyle = ink.dark; ctx.fill(path); ctx.stroke(path);
    ctx.fillStyle = ink.mid;
    for (let i = 0; i < depth; i++) { ctx.translate(-1, -1); ctx.fill(path); }
    ctx.fillStyle = colour; ctx.fill(path); ctx.stroke(path);
    ctx.restore();
  }
  function plate(x: number, y: number, w: number, h: number, radius: number, depth = 4, colour = ink.light) {
    const path = new Path2D(); path.roundRect(x, y, w, h, radius); relief(path, depth, colour);
  }
  function disc(x: number, y: number, radius: number, depth = 2, colour = ink.light) {
    const path = new Path2D(); path.arc(x, y, radius, 0, Math.PI * 2); relief(path, depth, colour);
  }
  function shape(path: string, depth = 4, colour = ink.light) { relief(new Path2D(path), depth, colour); }
  function engrave(path: string, width = 1.2) {
    ctx.save(); ctx.lineWidth = width; ctx.stroke(new Path2D(path)); ctx.restore();
  }
  function spokes(radius: number, count: number, from: number, angle: number) {
    ctx.save(); ctx.rotate(angle);
    for (let i = 0; i < count; i++) {
      engrave(`M0 ${-from}V${-radius}`, 2); ctx.rotate(Math.PI * 2 / count);
    }
    ctx.restore();
  }
  switch (motif) {
    case "vault":
      plate(-53,-48,106,93,7,10); plate(-46,-41,92,79,5,2,ink.mid);
      plate(-51,-29,9,16,2); plate(-51,15,9,16,2);
      disc(0,0,28,4); disc(0,0,23,0,ink.mid);
      spokes(23, 5, 5, t * .95); disc(0,0,7);
      for (const x of [-35,35]) for (const y of [-31,29]) disc(x,y,2,0);
      break;
    case "briefcase":
      plate(-21,-46,42,22,6,5,ink.mid); plate(-13,-40,26,13,3,0,ink.paper);
      plate(-62,-29,124,75,6,7); plate(-62,-29-5*t,124,38,5,3,ink.mid);
      for (const x of [-38,31]) {
        plate(x,3-5*t,9,16,2,2); engrave(`M${x+2} ${10-5*t}h5`);
      }
      engrave("M-54 20v18h108V20"); break;
    case "atm":
      plate(-44,-53,88,98,7,8,ink.mid); plate(-35,-44,70,40,4);
      plate(-29,-38,58,27,2,0,ink.mid); engrave("M-22 -28h18m-18 7h28");
      plate(-29,4,58,8,2,0,ink.dark);
      ctx.save(); ctx.translate(0, 8);
      shape(`M-23 0h46v${16+24*t}l-5 -3 -5 3 -5 -3 -5 3 -5 -3 -5 3 -5 -3 -6 3Z`,1);
      engrave("M-16 6H9m-25 5h16");
      if(t>.4) engrave(`M-16 16h${26*t}`); ctx.restore(); break;
    case "headset":
      shape("M-47 14V-6a47 47 0 0 1 94 0v20h-10V-6a37 37 0 0 0-74 0v20Z",6);
      plate(-51,-3,18,41,8,4,ink.mid); plate(32,-3,18,41,8,4,ink.mid);
      ctx.save(); ctx.translate(41,21); ctx.rotate(t*.33);
      shape("M-2 0h5v12q0 20-23 20h-16v-5h17q17 0 17-15Z",2);
      plate(-46,24,18,10,5,2,ink.dark); ctx.restore(); disc(41,21,4); break;
    case "compass":
      disc(0,-49,10,3); disc(0,-49,5,0,ink.paper);
      disc(0,1,48,7); disc(0,1,41,1,ink.mid); disc(0,1,36,0);
      spokes(35,16,31,0); ctx.save(); ctx.rotate(-.65+t*1.03);
      shape("M0 -31L8 1 0 30 -8 1Z",2); shape("M0 -31L8 1 -8 1Z",0,ink.dark);
      ctx.restore(); disc(0,1,4); break;
    case "columns":
      plate(-60,31,120,9,2,5,ink.mid); plate(-65,41,130,7,1);
      for(const x of [-43,-15,13,41]) {
        const rise=t*(x+50)*.10;
        plate(x-5,-18-rise,11,48+rise,1,3);
        engrave(`M${x-1} ${-12-rise}V24m4 -36v36`);
        plate(x-8,-22-rise,17,5,1,2); plate(x-8,26,17,5,1,2);
      }
      ctx.save(); ctx.rotate(-.10*t); ctx.translate(0,-5*t);
      shape("M-61 -23L0 -51 61 -23v7H-61Z",5); engrave("M-42 -24L0 -43 42 -24Z");ctx.restore(); break;
    case "market":
      plate(-65,-48,130,94,6,6); engrave("M-50 -32v63H52");
      for(const y of [-20,0,20]) engrave(`M-49 ${y}H52`,.55);
      for(const [i,base,h,delta] of [[0,24,17,5],[1,10,22,-6],[2,13,17,8],[3,-2,24,-10],[4,-10,15,-13]]) {
        const x=-38+i*20, top=base-h+delta*t;
        engrave(`M${x} ${top-6}V${base+6}`); plate(x-4,top,8,base-top,1,2,i%2?ink.mid:ink.light);
      } break;
    case "terminal":
      plate(-47,-32,74,82,8,7,ink.mid); plate(-39,-23,58,27,3);
      for(let i=0;i<9;i++)plate(-35+(i%3)*15,12+Math.floor(i/3)*9,10,4,1,1);
      ctx.save(); ctx.translate(26-10*t,-35+13*t);ctx.rotate(.14-.17*t);
      plate(-30,-18,64,40,4,3); plate(-23,-6,13,11,2,0,ink.mid);
      engrave("M-18 -6V5m-5 -5h13m9 14h21");ctx.restore(); break;
    case "sprout":
      shape("M-28 10H28L21 44H-20Z",5,ink.mid);plate(-32,4,64,10,2);
      ctx.save();ctx.translate(0,4);ctx.scale(1,1+.22*t);
      engrave("M0 0Q1 -21 10 -41",3);
      shape("M3 -16Q-20 -13 -34 -41Q-5 -42 3 -16Z",2,ink.mid);
      shape("M7 -28Q7 -53 38 -58Q34 -32 7 -28Z",2);
      engrave("M3 -16L-23 -34m29 7 22 -23");ctx.restore();break;
    case "balance":
      plate(-31,38,62,9,3,4);plate(-4,-30,8,69,2,2,ink.mid);
      for(const side of [-1,1]) {
        const x=side*47, y=-27+side*(10-10*t);
        engrave(`M0 -27L${x} ${y}`,3);
        engrave(`M${x-21} ${y+38}L${x} ${y}l21 38`);
        shape(`M${x-22} ${y+38}h44q-18 23 -44 0Z`,2);
      }disc(0,-27,6);break;
    case "database":
      for(let i=0;i<3;i++){
        const y=25-i*24-i*t*4;
        shape(`M-45 ${y-15}a45 13 0 0 1 90 0v16a45 13 0 0 1 -90 0Z`,2,ink.mid);
        const lid=new Path2D();lid.ellipse(0,y-15,45,13,0,0,Math.PI*2);relief(lid,0);
        disc(24,y+2,2,0,ink.light);disc(32,y,2,0,ink.dark);
      }break;
  }
  ctx.restore();
}
