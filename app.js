// Data Geometry Structure
const NODES = {
    sfo: { x: 200, y: 200, label: "SFO", status: "active" },
    nyc: { x: 350, y: 180, label: "NYC", status: "active" },
    lon: { x: 550, y: 150, label: "LON", status: "amber" },
    mum: { x: 700, y: 250, label: "MUM", status: "idle" },
    tok: { x: 850, y: 200, label: "TOK", status: "idle" }
};

const ROUTES = [
    { from: "sfo", to: "nyc", type: "normal" },
    { from: "sfo", to: "lon", type: "normal" },
    { from: "nyc", to: "lon", type: "conflict" }, // Simulating geographic routing leakage
    { from: "tok", to: "sfo", type: "normal" }
];

// Helper to generate SVG Hexagon path
function getHexPath(x, y, radius) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle_deg = 60 * i - 30;
        const angle_rad = Math.PI / 180 * angle_deg;
        points.push(`${x + radius * Math.cos(angle_rad)},${y + radius * Math.sin(angle_rad)}`);
    }
    return `M ${points.join(' L ')} Z`;
}

function initMSD() {
    drawMapLayer();
    buildRibbon();
    setInterval(simulateData, 2000);
}

function drawMapLayer() {
    const chordsGroup = document.getElementById('chords');
    const nodesGroup = document.getElementById('nodes');

    // Draw Routing Chords (Quadratic Bezier Curves for arc effect)
    ROUTES.forEach(route => {
        const n1 = NODES[route.from];
        const n2 = NODES[route.to];
        // Calculate curve control point (arc height)
        const cx = (n1.x + n2.x) / 2;
        const cy = Math.min(n1.y, n2.y) - 80; // Bow upwards
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${n1.x} ${n1.y} Q ${cx} ${cy} ${n2.x} ${n2.y}`);
        path.setAttribute('class', `chord ${route.type === 'conflict' ? 'conflict' : ''}`);
        chordsGroup.appendChild(path);
    });

    // Draw Infrastructure Nodes
    Object.keys(NODES).forEach(key => {
        const node = NODES[key];
        
        // Hexagon shape
        const hex = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hex.setAttribute('d', getHexPath(node.x, node.y, 15));
        hex.setAttribute('class', `node-hex ${node.status}`);
        
        // Text Label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x - 12);
        text.setAttribute('y', node.y + 35);
        text.setAttribute('class', 'node-label');
        text.textContent = node.label;

        nodesGroup.appendChild(hex);
        nodesGroup.appendChild(text);
    });
}

function buildRibbon() {
    const track = document.getElementById('ribbon-track');
    const regions = [
        { name: 'TOKYO', level: 2, state: 'warn' },
        { name: 'MUMBAI', level: 1, state: 'warn' },
        { name: 'LONDON', level: 6, state: 'on' },
        { name: 'NYC', level: 8, state: 'on' },
        { name: 'SFO', level: 5, state: 'on' }
    ];

    track.innerHTML = regions.map(r => `
        <div class="region-block">
            <span class="region-name">${r.name}</span>
            ${Array(8).fill(0).map((_, i) => 
                `<div class="hex-indicator ${i < r.level ? r.state : ''}"></div>`
            ).join('')}
        </div>
    `).join('');
}

function simulateData() {
    // Add subtle randomization to the top KPIs
    const pulseElement = document.getElementById('stat-pulses');
    const current = parseInt(pulseElement.innerText.replace(',', ''));
    const jitter = Math.floor(Math.random() * 50) - 25;
    pulseElement.innerText = (current + jitter).toLocaleString();
}

window.onload = initMSD;
