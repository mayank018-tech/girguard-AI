/**
 * Mock GIS Map Component
 *
 * Renders a canvas-based pseudo-map visualization of the Gir Forest region.
 * Uses DEMO coordinates ??? not real wildlife locations.
 *
 * Future: Replace with Leaflet.js / Mapbox GL with real GIS data from IBM Cloud.
 */

import { useEffect, useRef } from 'react';

const GIR_CENTER = { lat: 21.05, lng: 70.65 };
const SCALE = { lat: 600, lng: 500 }; // pixels per degree

function project(lat, lng, w, h) {
  const x = (lng - GIR_CENTER.lng) * SCALE.lng + w / 2;
  const y = -(lat - GIR_CENTER.lat) * SCALE.lat + h / 2;
  return { x, y };
}

const VILLAGE_COLORS = {
  CRITICAL: '#f87171',
  HIGH:     '#fb923c',
  ELEVATED: '#fbbf24',
  MODERATE: '#34d399',
  LOW:      '#6ee7b7',
};

export default function GirMap({ villages = [], sightings = [], hotspots = [], teams = [], height = 400 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Background ??? forest green gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, '#14532d');
    grad.addColorStop(0.5, '#166534');
    grad.addColorStop(1, '#052e16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Grid overlay
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
    for (let gy = 0; gy < h; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

    // Hotspot risk zones (circles)
    hotspots.forEach(hs => {
      const p = project(hs.lat, hs.lng, w, h);
      const r = (hs.radius || 1) * 22;
      const zGrad = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, r);
      const base = hs.severity === 'CRITICAL' ? '239,68,68' : hs.severity === 'HIGH' ? '249,115,22' : '251,191,36';
      zGrad.addColorStop(0, `rgba(${base},0.35)`);
      zGrad.addColorStop(1, `rgba(${base},0)`);
      ctx.fillStyle = zGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Wildlife sightings (diamonds)
    sightings.forEach(s => {
      const p = project(s.lat, s.lng, w, h);
      const sz = 7;
      ctx.fillStyle = s.species.includes('Lion') ? '#fde68a' : '#a78bfa';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - sz);
      ctx.lineTo(p.x + sz, p.y);
      ctx.lineTo(p.x, p.y + sz);
      ctx.lineTo(p.x - sz, p.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Response teams (triangles)
    teams.filter(t => t.status !== 'OFF_DUTY').forEach(t => {
      const p = project(t.lat, t.lng, w, h);
      ctx.fillStyle = t.status === 'DEPLOYED' ? '#f97316' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 9);
      ctx.lineTo(p.x + 8, p.y + 6);
      ctx.lineTo(p.x - 8, p.y + 6);
      ctx.closePath();
      ctx.fill();
    });

    // Villages (circles with risk color)
    villages.forEach(v => {
      const p = project(v.lat, v.lng, w, h);
      const col = VILLAGE_COLORS[v.riskLevel] || '#9ca3af';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Label
      ctx.fillStyle = '#f9fafb';
      ctx.font = '10px system-ui';
      ctx.fillText(v.name, p.x + 9, p.y + 3);
    });

    // Forest label
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = 'bold 13px system-ui';
    ctx.fillText('GIR FOREST NATIONAL PARK', 12, 20);

    // Demo watermark
    ctx.fillStyle = 'rgba(255,200,0,0.18)';
    ctx.font = 'bold 11px system-ui';
    ctx.fillText('??? DEMO COORDINATES ??? NOT REAL WILDLIFE LOCATIONS', 10, h - 8);

    // Legend
    const legX = w - 160; const legY = h - 100;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect(legX - 6, legY - 14, 154, 100, 6);
    ctx.fill();
    const legendItems = [
      { col: '#fde68a', label: '??? Asiatic Lion' },
      { col: '#a78bfa', label: '??? Leopard' },
      { col: '#f97316', label: '??? Response Team' },
      { col: '#f87171', label: '??? Critical Village' },
      { col: '#34d399', label: '??? Low Risk Village' },
    ];
    legendItems.forEach((item, i) => {
      ctx.fillStyle = item.col;
      ctx.font = '10px system-ui';
      ctx.fillText(item.label, legX, legY + i * 17);
    });
  }, [villages, sightings, hotspots, teams]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-700">
      <canvas
        ref={canvasRef}
        width={900}
        height={height}
        className="w-full"
        style={{ display: 'block' }}
      />
      <div className="absolute top-2 right-2 text-xs bg-black/60 text-gray-300 px-2 py-1 rounded border border-gray-700">
        Mock Geospatial View ?? Future: IBM Cloud GIS
      </div>
    </div>
  );
}
