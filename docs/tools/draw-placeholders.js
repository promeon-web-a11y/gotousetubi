// 仮イラスト生成（コード描画のSVG → WebP）。実在の社員・現場・事業所を描いたものではない。
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = process.argv[2];
const SRC = path.join(OUT, 'src');
fs.mkdirSync(SRC, { recursive: true });

const C = {
  wall: '#e7edf2', wall2: '#d6dfe8', floor: '#c9d3dc', navy: '#1b3350', navy2: '#2b4a6f',
  steel: '#9aa8b6', steelD: '#6d7b89', steelL: '#c9d2db', copper: '#c07a4b', copperD: '#93593a', copperL: '#dca07a',
  pvc: '#b8c1ca', pvcD: '#8e99a4', insul: '#f5f7f9', insulD: '#d5dce3', wood: '#d9b98f', woodD: '#b8956a',
  wear: '#5f7891', wearD: '#4a6077', glove: '#dfe3e7', gloveD: '#b5bec7', helmet: '#f7f8f9', helmetD: '#d3d9df',
  hair: '#3a3a3a', skin: '#d9a982', blue: '#4f86b8', pink: '#d98b8b', yellow: '#e8b84a', concrete: '#cfd5da', concreteD: '#b4bcc3',
};

// 共通：配管（太線＋ハイライト）
function pipe(d, w, col, colD, colL) {
  return `<path d="${d}" fill="none" stroke="${colD}" stroke-width="${w + 6}" stroke-linecap="butt" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="butt" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${colL}" stroke-width="${Math.max(3, w * 0.18)}" stroke-linecap="butt" stroke-linejoin="round" transform="translate(0,${-w * 0.22})" opacity=".8"/>`;
}
function band(x, y, w, h, col) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${col}"/>`; }
function hanger(x, y1, y2) { return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${C.steelD}" stroke-width="6"/>`; }

// 後ろ姿の作業者（顔は描かない）
function workerBack(x, y, s = 1, armPose = 'reach') {
  const arm = armPose === 'reach'
    ? `<path d="M${-40} ${-150} C ${-120} ${-200}, ${-170} ${-250}, ${-190} ${-300}" stroke="${C.wear}" stroke-width="46" stroke-linecap="round" fill="none"/>
       <path d="M${40} ${-150} C ${-20} ${-220}, ${-80} ${-270}, ${-110} ${-320}" stroke="${C.wearD}" stroke-width="46" stroke-linecap="round" fill="none"/>
       <circle cx="-195" cy="-312" r="26" fill="${C.glove}" stroke="${C.gloveD}" stroke-width="4"/>
       <circle cx="-115" cy="-332" r="26" fill="${C.glove}" stroke="${C.gloveD}" stroke-width="4"/>`
    : `<path d="M${-40} ${-150} C ${-110} ${-150}, ${-170} ${-170}, ${-230} ${-200}" stroke="${C.wear}" stroke-width="44" stroke-linecap="round" fill="none"/>
       <circle cx="-238" cy="-204" r="24" fill="${C.glove}" stroke="${C.gloveD}" stroke-width="4"/>
       <path d="M${40} ${-150} C ${60} ${-80}, ${50} ${-40}, ${40} ${0}" stroke="${C.wearD}" stroke-width="44" stroke-linecap="round" fill="none"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M-70 -10 L-60 210 L-15 210 L-5 40 L5 40 L15 210 L60 210 L70 -10 Z" fill="${C.wearD}"/>
    <rect x="-70" y="200" width="56" height="30" rx="10" fill="#333c45"/><rect x="14" y="200" width="56" height="30" rx="10" fill="#333c45"/>
    <path d="M-80 -200 Q 0 -230 80 -200 L 85 0 Q 0 15 -85 0 Z" fill="${C.wear}"/>
    <rect x="-85" y="-20" width="170" height="22" fill="${C.wearD}"/>
    ${arm}
    <ellipse cx="0" cy="-238" rx="46" ry="50" fill="${C.hair}"/>
    <rect x="-22" y="-212" width="44" height="24" fill="${C.skin}"/>
    <path d="M-62 -250 Q -60 -320 0 -324 Q 60 -320 62 -250 Z" fill="${C.helmet}" stroke="${C.helmetD}" stroke-width="5"/>
    <rect x="-72" y="-256" width="144" height="14" rx="7" fill="${C.helmetD}"/>
    <path d="M0 -322 L0 -258" stroke="${C.helmetD}" stroke-width="6"/>
  </g>`;
}

// 横向きの人物（顔の表情なし・シルエット的）
function personSide(x, y, s, dir, pose) {
  const f = dir === 'left' ? -1 : 1;
  const armFront = pose === 'point'
    ? `<path d="M${10 * f} -160 L ${150 * f} -230" stroke="${C.wear}" stroke-width="40" stroke-linecap="round"/><circle cx="${160 * f}" cy="-236" r="20" fill="${C.glove}" stroke="${C.gloveD}" stroke-width="4"/>`
    : pose === 'hold'
      ? `<path d="M${10 * f} -160 Q ${70 * f} -110 ${110 * f} -140" stroke="${C.wear}" stroke-width="40" stroke-linecap="round" fill="none"/><rect x="${f > 0 ? 100 : -170}" y="-190" width="70" height="90" rx="6" fill="#f8fafb" stroke="${C.steelD}" stroke-width="4"/><circle cx="${120 * f}" cy="-140" r="20" fill="${C.glove}" stroke="${C.gloveD}" stroke-width="4"/>`
      : `<path d="M${10 * f} -160 L ${20 * f} -20" stroke="${C.wear}" stroke-width="40" stroke-linecap="round"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M-45 -10 L-50 210 L-10 210 L0 40 L10 210 L50 210 L45 -10 Z" fill="${C.wearD}"/>
    <rect x="-55" y="200" width="${f > 0 ? 60 : 50}" height="26" rx="10" fill="#333c45"/><rect x="5" y="200" width="${f > 0 ? 60 : 50}" height="26" rx="10" fill="#333c45"/>
    <path d="M-60 -200 Q 0 -222 60 -200 L 62 0 L -62 0 Z" fill="${C.wear}"/>
    <path d="M${-10 * f} -170 L ${-20 * f} -30" stroke="${C.wearD}" stroke-width="38" stroke-linecap="round"/>
    ${armFront}
    <ellipse cx="${8 * f}" cy="-240" rx="40" ry="44" fill="${C.skin}"/>
    <path d="M${-38 * f} -250 Q ${-40 * f} -230 ${-30 * f} -215 L ${-10 * f} -215 L ${-12 * f} -260 Z" fill="${C.hair}"/>
    <path d="M-52 -250 Q -48 -310 8 -314 Q 64 -310 66 -250 Z" fill="${C.helmet}" stroke="${C.helmetD}" stroke-width="5"/>
    <path d="M${f > 0 ? -58 : -86} -254 L ${f > 0 ? 86 : 58} -254" stroke="${C.helmetD}" stroke-width="12" stroke-linecap="round"/>
  </g>`;
}

function pipeWrench(x, y, rot, s = 1) {
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">
    <rect x="0" y="-16" width="300" height="32" rx="14" fill="#c0392b"/>
    <rect x="150" y="-16" width="150" height="32" rx="14" fill="#a83226"/>
    <rect x="-70" y="-30" width="90" height="60" rx="8" fill="${C.steelD}"/>
    <path d="M-70 -30 L-120 -60 L-120 -20 L-70 -10 Z" fill="${C.steelD}"/>
    <rect x="-110" y="18" width="70" height="20" rx="4" fill="${C.steel}"/>
    <circle cx="-20" cy="0" r="12" fill="${C.steelL}"/>
  </g>`;
}

const svgs = {};

// 1 トップ：作業者が配管を締める一般的な作業イメージ（後ろ姿）
svgs['top-work'] = { w: 1600, h: 1200, body: `
  <rect width="1600" height="1200" fill="${C.wall}"/>
  <rect y="960" width="1600" height="240" fill="${C.floor}"/>
  <rect x="0" y="0" width="1600" height="90" fill="${C.wall2}"/>
  ${[180, 520, 860, 1200].map(x => `<rect x="${x}" y="90" width="16" height="870" fill="${C.wall2}"/>`).join('')}
  ${pipe('M0 300 L 640 300 Q 700 300 700 360 L 700 960', 46, C.steel, C.steelD, C.steelL)}
  ${pipe('M0 410 L 1600 410', 36, C.copper, C.copperD, C.copperL)}
  ${pipe('M1600 250 L 980 250 Q 920 250 920 310 L 920 960', 70, C.pvc, C.pvcD, '#d7dde3')}
  ${band(674, 560, 52, 26, C.steelD)}${band(894, 640, 52, 30, C.pvcD)}${band(528, 390, 34, 40, C.copperD)}
  ${hanger(300, 90, 300)}${hanger(1300, 90, 250)}
  ${workerBack(760, 860, 1.4, 'reach')}
  <rect x="1180" y="840" width="230" height="120" rx="10" fill="${C.navy2}"/><rect x="1180" y="840" width="230" height="30" rx="10" fill="${C.navy}"/>
  <rect x="1250" y="820" width="90" height="24" rx="8" fill="none" stroke="${C.navy}" stroke-width="10"/>
` };

// 2 給排水：手元で継手を接続
svgs['work-water'] = { w: 1200, h: 900, body: `
  <rect width="1200" height="900" fill="${C.wall}"/>
  <rect x="0" y="700" width="1200" height="200" fill="${C.wall2}"/>
  ${pipe('M0 360 L 560 360', 90, C.pvc, C.pvcD, '#dfe4e9')}
  <rect x="520" y="300" width="120" height="120" rx="14" fill="#a9b3bd" stroke="${C.pvcD}" stroke-width="6"/>
  ${pipe('M640 360 L 760 360 Q 820 360 820 420 L 820 900', 90, C.pvc, C.pvcD, '#dfe4e9')}
  ${pipe('M0 170 L 1200 170', 34, C.steel, C.steelD, C.steelL)}
  ${band(300, 148, 28, 44, C.steelD)}${band(900, 148, 28, 44, C.steelD)}
  <!-- 左手（パイプを支える） -->
    <path d="M300 640 L 400 450" stroke="${C.wear}" stroke-width="110" stroke-linecap="round"/>
  <rect x="330" y="430" width="120" height="50" rx="14" fill="${C.navy}" transform="rotate(-62 390 455)"/>
  <rect x="365" y="285" width="130" height="170" rx="40" fill="${C.glove}" stroke="${C.gloveD}" stroke-width="6"/>${[320,355,390].map(y=>`<line x1="380" y1="${y}" x2="480" y2="${y}" stroke="${C.gloveD}" stroke-width="5" stroke-linecap="round"/>`).join("")}
  <!-- 右手（継手を回す） -->
    <path d="M780 680 L 660 460" stroke="${C.wearD}" stroke-width="110" stroke-linecap="round"/>
  <rect x="610" y="430" width="120" height="50" rx="14" fill="${C.navy}" transform="rotate(60 670 455)"/>
  <rect x="590" y="275" width="130" height="180" rx="40" fill="${C.glove}" stroke="${C.gloveD}" stroke-width="6"/>${[310,345,380].map(y=>`<line x1="605" y1="${y}" x2="705" y2="${y}" stroke="${C.gloveD}" stroke-width="5" stroke-linecap="round"/>`).join("")}
  <path d="M560 300 A 90 90 0 0 1 700 320" fill="none" stroke="${C.navy2}" stroke-width="6" stroke-dasharray="14 10"/>
  <path d="M700 320 l -8 -26 l 26 10 z" fill="${C.navy2}"/>
` };

// 3 冷暖房・空調：保温材付き配管と計測器を確認
svgs['work-hvac'] = { w: 1200, h: 900, body: `
  <rect width="1200" height="900" fill="${C.wall}"/>
  <rect width="1200" height="120" fill="${C.concrete}"/>
  ${hanger(200, 120, 260)}${hanger(560, 120, 260)}${hanger(920, 120, 260)}
  ${pipe('M0 270 L 1200 270', 64, C.insul, C.insulD, '#ffffff')}
  ${pipe('M0 360 L 760 360 Q 820 360 820 420 L 820 560', 48, C.insul, C.insulD, '#ffffff')}
  ${[150, 450, 750, 1050].map(x => band(x, 236, 18, 68, C.insulD)).join('')}
  ${band(380, 332, 18, 56, C.insulD)}
  <rect x="700" y="560" width="300" height="200" rx="16" fill="#f1f4f7" stroke="${C.insulD}" stroke-width="6"/>
  ${[600, 630, 660, 690, 720].map(y => `<line x1="730" y1="${y}" x2="970" y2="${y}" stroke="${C.insulD}" stroke-width="6"/>`).join('')}
  <!-- 計測器（ゲージ）を手に持つ -->
  <g transform="translate(330,600)">
    <rect x="-150" y="-60" width="300" height="120" rx="20" fill="${C.steel}" stroke="${C.steelD}" stroke-width="6"/>
    <circle cx="-70" cy="-70" r="62" fill="#fff" stroke="${C.blue}" stroke-width="12"/><circle cx="70" cy="-70" r="62" fill="#fff" stroke="#c0574f" stroke-width="12"/>
    <line x1="-70" y1="-70" x2="-40" y2="-105" stroke="${C.navy}" stroke-width="6"/><line x1="70" y1="-70" x2="95" y2="-40" stroke="${C.navy}" stroke-width="6"/>
    <path d="M-110 60 Q -140 200 -60 300" stroke="${C.blue}" stroke-width="16" fill="none"/>
    <path d="M110 60 Q 150 200 80 300" stroke="#c0574f" stroke-width="16" fill="none"/>
    <path d="M-200 40 C -220 0, -210 -40, -170 -40 L -150 -30 L -150 60 Z" fill="${C.glove}" stroke="${C.gloveD}" stroke-width="6"/>
    <path d="M-260 260 L -195 30" stroke="${C.wear}" stroke-width="100" stroke-linecap="round"/>
  </g>
` };

// 4 戸建住宅：住宅内部（壁下地・床）の給水給湯配管
svgs['work-house'] = { w: 1200, h: 900, body: `
  <rect width="1200" height="900" fill="#efe9e1"/>
  <rect y="700" width="1200" height="200" fill="${C.wood}"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="0" y1="${720 + i * 25}" x2="1200" y2="${720 + i * 25}" stroke="${C.woodD}" stroke-width="3" opacity=".5"/>`).join('')}
  ${[80, 330, 580, 830, 1080].map(x => `<rect x="${x}" y="0" width="60" height="700" fill="${C.wood}" stroke="${C.woodD}" stroke-width="4"/>`).join('')}
  <rect x="0" y="0" width="1200" height="40" fill="${C.woodD}"/>
  <rect x="0" y="380" width="1200" height="36" fill="${C.wood}" stroke="${C.woodD}" stroke-width="4"/>
  ${pipe('M0 560 L 470 560 Q 520 560 520 510 L 520 200', 26, C.blue, '#3b6a96', '#86afd4')}
  ${pipe('M0 620 L 520 620 Q 570 620 570 570 L 570 200', 26, C.pink, '#b86d6d', '#efb3b3')}
  ${pipe('M760 700 L 760 470 Q 760 430 800 430 L 1200 430', 60, C.pvc, C.pvcD, '#dfe4e9')}
  <rect x="490" y="170" width="110" height="40" rx="8" fill="${C.steel}" stroke="${C.steelD}" stroke-width="5"/>
  <circle cx="520" cy="190" r="12" fill="${C.blue}"/><circle cx="570" cy="190" r="12" fill="${C.pink}"/>
  ${[150, 400].map(x => `<rect x="${x - 8}" y="548" width="16" height="84" rx="4" fill="${C.steelD}"/>`).join('')}
  <!-- 床置きのヘッダー -->
  <rect x="160" y="660" width="260" height="56" rx="10" fill="${C.steel}" stroke="${C.steelD}" stroke-width="5"/>
  ${[200, 260, 320, 380].map(x => `<rect x="${x - 10}" y="640" width="20" height="24" fill="${C.steelD}"/>`).join('')}
` };

// 5 施設等：建物内部の天井配管（複数系統）と脚立
svgs['work-facility'] = { w: 1200, h: 900, body: `
  <rect width="1200" height="900" fill="${C.wall}"/>
  <rect width="1200" height="160" fill="${C.concrete}"/>
  ${[0, 300, 600, 900].map(x => `<rect x="${x}" y="0" width="12" height="160" fill="${C.concreteD}"/>`).join('')}
  <rect y="760" width="1200" height="140" fill="${C.concreteD}"/>
  ${[150, 500, 850].map(x => `${hanger(x, 160, 420)}<rect x="${x - 230}" y="410" width="460" height="14" fill="${C.steelD}"/>`).join('')}
  ${pipe('M0 236 L 1200 236', 70, C.insul, C.insulD, '#fff')}
  ${pipe('M0 330 L 1200 330', 44, C.steel, C.steelD, C.steelL)}
  ${pipe('M0 388 L 1200 388', 30, C.copper, C.copperD, C.copperL)}
  ${[100, 400, 700, 1000].map(x => band(x, 196, 18, 80, C.insulD)).join('')}
  ${pipe('M980 330 Q 1040 330 1040 390 L 1040 760', 44, C.steel, C.steelD, C.steelL)}
  ${band(1012, 560, 56, 26, C.steelD)}
  <!-- 脚立 -->
  <g stroke="${C.yellow}" stroke-width="18" stroke-linecap="round">
    <line x1="420" y1="760" x2="520" y2="470"/><line x1="620" y1="760" x2="520" y2="470"/>
  </g>
  ${[560, 620, 680, 740].map((y, i) => `<line x1="${447 + i * 0}" y1="${y}" x2="${593}" y2="${y}" stroke="#c99a2e" stroke-width="12" transform="translate(${(760 - y) * 0.0},0)"/>`).join('')}
  <rect x="480" y="455" width="80" height="22" rx="6" fill="#c99a2e"/>
  <rect x="80" y="690" width="180" height="70" rx="8" fill="${C.navy2}"/>
` };

// 6 事業所外観の枠：汎用の建物イメージ（看板・社名なし）
svgs['about-exterior'] = { w: 1500, h: 1000, body: `
  <rect width="1500" height="1000" fill="#dfe8f0"/>
  <rect y="760" width="1500" height="240" fill="#b9c4ce"/>
  <rect y="740" width="1500" height="24" fill="#a3afba"/>
  <rect x="300" y="300" width="760" height="450" fill="#eef1f4" stroke="#aab5c0" stroke-width="6"/>
  <path d="M270 310 L 680 170 L 1090 310 Z" fill="#7d8b99"/>
  ${[380, 560, 740, 920].map(x => `<rect x="${x}" y="380" width="110" height="90" fill="#bcd0e2" stroke="#9fb0c0" stroke-width="5"/>`).join('')}
  <rect x="380" y="540" width="200" height="210" fill="#c6cfd8" stroke="#9fb0c0" stroke-width="5"/>
  ${[560, 590, 620, 650, 680, 710].map(y => `<line x1="385" y1="${y}" x2="575" y2="${y}" stroke="#aab5c0" stroke-width="4"/>`).join('')}
  <rect x="760" y="560" width="90" height="190" fill="#9fb0c0"/>
  <!-- 汎用の作業車（ロゴなし） -->
  <g transform="translate(1080,640)">
    <path d="M0 0 L 260 0 L 300 50 L 300 120 L 0 120 Z" fill="#f4f6f8" stroke="#9aa6b2" stroke-width="5"/>
    <path d="M200 10 L 255 10 L 285 50 L 200 50 Z" fill="#bcd0e2"/>
    <circle cx="70" cy="125" r="30" fill="#39424b"/><circle cx="235" cy="125" r="30" fill="#39424b"/>
  </g>
  <circle cx="160" cy="620" r="90" fill="#b5c7a8"/><rect x="150" y="640" width="20" height="110" fill="#8a7a66"/>
` };

// 7 職場の集合写真枠：明確な仮表現（線画の人物アイコン。人数・服装は実際と無関係）
function iconPerson(x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${C.navy2}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M-48 -112 Q -46 -165 0 -168 Q 46 -165 48 -112 Z" fill="#ffffff"/>
    <circle cx="0" cy="-95" r="40" fill="#ffffff"/>
    <path d="M-80 60 L -80 10 Q -80 -40 -30 -45 L 30 -45 Q 80 -40 80 10 L 80 60" fill="#ffffff"/>
    <line x1="-56" y1="-114" x2="56" y2="-114"/>
  </g>`;
}
svgs['people-group'] = { w: 1600, h: 1000, body: `
  <rect width="1600" height="1000" fill="${C.wall}"/>
  <rect x="80" y="80" width="1440" height="840" rx="24" fill="none" stroke="#b3c1cf" stroke-width="6" stroke-dasharray="26 18"/>
  ${iconPerson(560, 610, 1.6)}${iconPerson(1040, 610, 1.6)}${iconPerson(800, 640, 1.8)}
  <rect x="300" y="700" width="1000" height="16" rx="8" fill="#c6d2dd"/>
` };

// 8 指導場面：説明している一般的な場面（表情なし）
svgs['people-teach'] = { w: 1200, h: 1200, body: `
  <rect width="1200" height="1200" fill="${C.wall}"/>
  <rect y="980" width="1200" height="220" fill="${C.floor}"/>
  ${pipe('M0 300 L 1200 300', 40, C.steel, C.steelD, C.steelL)}
  ${pipe('M1020 300 Q 1080 300 1080 360 L 1080 980', 40, C.steel, C.steelD, C.steelL)}
  ${band(1060, 560, 40, 28, C.steelD)}${band(300, 280, 28, 40, C.steelD)}
  ${personSide(330, 800, 1.45, 'right', 'point')}
  ${personSide(820, 830, 1.4, 'left', 'hold')}
` };

// 9 工具：配管作業の工具（平置き）
svgs['people-tools'] = { w: 1200, h: 1200, body: `
  <rect width="1200" height="1200" fill="#d9cdb8"/>
  ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="0" y1="${i * 200 + 100}" x2="1200" y2="${i * 200 + 100}" stroke="#c8b99f" stroke-width="6"/>`).join('')}
  ${pipeWrench(260, 300, 0, 1.35)}
  <!-- パイプカッター -->
  <g transform="translate(300,620) rotate(-10)">
    <rect x="0" y="-18" width="280" height="36" rx="16" fill="${C.navy2}"/>
    <path d="M-40 -70 L 40 -70 L 40 70 L -40 70 Z" fill="${C.steel}" stroke="${C.steelD}" stroke-width="6"/>
    <circle cx="0" cy="-30" r="22" fill="${C.steelL}" stroke="${C.steelD}" stroke-width="5"/>
  </g>
  <!-- 水平器 -->
  <g transform="translate(200,880)"><rect width="520" height="70" rx="10" fill="${C.yellow}" stroke="#c99a2e" stroke-width="5"/><rect x="230" y="18" width="60" height="34" rx="16" fill="#cfe6b8" stroke="#8da86f" stroke-width="4"/></g>
  <!-- メジャー -->
  <g transform="translate(900,360)"><rect x="-110" y="-110" width="220" height="220" rx="40" fill="${C.navy}"/><circle r="56" fill="${C.steel}"/><rect x="100" y="60" width="160" height="34" fill="${C.yellow}"/></g>
  <!-- 配管の切れ端 -->
  ${pipe('M780 700 L 1080 760', 50, C.copper, C.copperD, C.copperL)}
  ${pipe('M800 900 L 1100 860', 70, C.pvc, C.pvcD, '#e2e6ea')}
  <!-- 手袋 -->
  <path d="M780 1040 Q 800 980 860 990 L 960 1000 Q 1010 1010 1000 1060 L 980 1110 L 800 1100 Z" fill="${C.glove}" stroke="${C.gloveD}" stroke-width="6"/>
` };

// 10 代表写真枠：明確な仮表現（線画のシルエット）
svgs['message-rep'] = { w: 960, h: 1200, body: `
  <rect width="960" height="1200" fill="${C.wall}"/>
  <rect x="60" y="60" width="840" height="1080" rx="24" fill="none" stroke="#b3c1cf" stroke-width="6" stroke-dasharray="26 18"/>
  <g fill="#ffffff" stroke="${C.navy2}" stroke-width="10" stroke-linejoin="round">
    <circle cx="480" cy="480" r="150"/>
    <path d="M200 1080 L 200 940 Q 200 720 400 700 L 560 700 Q 760 720 760 940 L 760 1080 Z"/>
  </g>
` };

(async () => {
  const report = [];
  for (const [name, { w, h, body }] of Object.entries(svgs)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
    const srcPath = path.join(SRC, `${name}.svg`);
    fs.writeFileSync(srcPath, svg);
    const half = Math.round(w / 2);
    for (const [suffix, width] of [['', w], [`-${half}w`, half]]) {
      const out = path.join(OUT, `${name}${suffix}.webp`);
      const info = await sharp(Buffer.from(svg), { density: 72 }).resize(width).webp({ quality: 80 }).toFile(out);
      report.push(`${path.basename(out)}\t${info.width}x${info.height}\t${Math.round(info.size / 1024)}KB`);
    }
  }
  console.log(report.join('\n'));
})();
