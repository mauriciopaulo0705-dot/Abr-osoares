// Gera as páginas de link de cada imóvel (imovel/<ref>/index.html).
// Elas servem para o WhatsApp (e outras redes) mostrar a foto, o nome e o preço
// do imóvel quando o link é enviado, e levam a pessoa direto para a ficha.
// Rodar depois de adicionar, mudar ou tirar um imóvel da lista LISTINGS:
//   node ferramentas/gerar-links.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const code = /<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/.exec(html)[1];
class DCLogic { constructor() { this.props = {}; this.state = {}; } setState() {} }
const { LISTINGS, Component, brl, SITE, slugOf } = new Function('DCLogic', code + '\nreturn { LISTINGS, Component, brl, SITE, slugOf };')(DCLogic);
const c = new Component();

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const abs = u => /^https?:/.test(u) ? u : `${SITE}/${u.replace(/^\.?\//, '')}`;

const dir = path.join(root, 'imovel');
fs.rmSync(dir, { recursive: true, force: true });
for (const p of LISTINGS) {
  const slug = slugOf(p.reference);
  const price = p.price ? brl(p.price) : 'Valor sob consulta';
  const specs = c.specsFor(p).map(s => `${s.label} ${s.value}`).filter(s => !p.location.includes(s) && !s.includes('A confirmar') && !s.startsWith('Tipo '));
  const desc = [price, ...specs, p.location].join(' · ');
  const title = `${p.title} · ${price}`;
  const url = `${SITE}/imovel/${slug}`;
  const img = abs(p.shareImage || p.images[0]);
  const target = `/#imovel/${slug}`;
  const page = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)} · Abrão Soares Corretores de Imóveis</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Abrão Soares Corretores de Imóveis">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<script>location.replace(${JSON.stringify(target)});</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#faf9f6;color:#1b3043;font-family:system-ui,sans-serif}a{color:#8b7755;font-weight:600}</style>
</head>
<body>
<p>Abrindo o imóvel… <a href="${esc(target)}">Toque aqui se não abrir</a></p>
</body>
</html>
`;
  fs.mkdirSync(path.join(dir, slug), { recursive: true });
  fs.writeFileSync(path.join(dir, slug, 'index.html'), page);
  console.log(`${url}  ←  ${title}`);
}
