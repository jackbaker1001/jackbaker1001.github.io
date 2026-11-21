import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const font = (f: string) => readFileSync(join(root, 'src/og/fonts', f));
const fonts = [
  { name: 'NCM', data: font('NewCM10-Book.otf'), weight: 400 as const, style: 'normal' as const },
  { name: 'CMUSans', data: font('cmunss.otf'), weight: 400 as const, style: 'normal' as const },
];
const markSvg = readFileSync(join(root, 'brand/graph-state/logo/mark-light.svg'), 'utf8');
const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

/** Honeycomb lattice that fades towards the left, as on the brand's social card. */
function lattice(w: number, h: number, a = 34) {
  const dx = a * Math.sqrt(3), lines: string[] = [], nodes: string[] = [];
  const pts: [number, number][] = [];
  for (let row = -1; row * a * 1.5 < h + a * 2; row++)
    for (let col = -1; col * dx < w + dx; col++) {
      const x = col * dx + (row % 2 ? dx / 2 : 0), y = row * a * 1.5;
      pts.push([x, y], [x, y + a]);
      lines.push(`M${x} ${y}v${a}`, `M${x} ${y}l${dx / 2} ${-a / 2}`, `M${x} ${y}l${-dx / 2} ${-a / 2}`);
    }
  pts.forEach(([x, y], i) => {
    const hot = i === 137 || i === 221 || i === 260;
    nodes.push(`<circle cx="${x}" cy="${y}" r="${hot ? 5 : 3.2}" fill="${hot ? '#2E4BC6' : '#7F828A'}" opacity="${hot ? 0.9 : 0.55}"/>`);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${lines.join('')}" stroke="#D9DAD5" stroke-width="1.4" fill="none"/>${nodes.join('')}</svg>`;
}

type Node = { type: string; props: Record<string, any> };
const h = (type: string, style: Record<string, any>, ...children: any[]): Node => ({ type, props: { style, children } });

export async function ogImage({ kicker, title }: { kicker: string; title: string }) {
  const W = 1200, H = 630;
  const size = title.length > 70 ? 54 : title.length > 40 ? 62 : 72;
  const tree = h('div', { width: W, height: H, display: 'flex', position: 'relative', background: '#F6F6F3', fontFamily: 'NCM', color: '#1A1B1F' },
    { type: 'img', props: { src: dataUri(lattice(620, H)), width: 620, height: H, style: { position: 'absolute', right: 0, top: 0 } } },
    h('div', { position: 'absolute', right: 0, top: 0, width: 620, height: H, display: 'flex', backgroundImage: 'linear-gradient(90deg, #F6F6F3 0%, rgba(246,246,243,0.75) 45%, rgba(246,246,243,0.1) 100%)' }),
    h('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', width: '100%', position: 'relative' },
      h('div', { display: 'flex', alignItems: 'center', gap: 18 },
        { type: 'img', props: { src: dataUri(markSvg), height: 54, width: 62 } },
        h('div', { fontSize: 34, letterSpacing: '-0.005em' }, 'Jack S. Baker')),
      h('div', { display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 },
        h('div', { fontFamily: 'CMUSans', fontSize: 20, letterSpacing: '0.14em', color: '#2E4BC6', textTransform: 'uppercase' }, kicker),
        h('div', { fontSize: size, lineHeight: 1.12, letterSpacing: '-0.01em' }, title)),
      h('div', { fontFamily: 'CMUSans', fontSize: 22, color: '#5B5E67', letterSpacing: '0.02em' }, 'jackstephenbaker.com')),
  );
  const svg = await satori(tree as any, { width: W, height: H, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
}
