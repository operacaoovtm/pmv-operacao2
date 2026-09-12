import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MousePointer2, Pencil, Eraser, Minus, Square, Type, Image as ImageIcon,
  Trash2, Copy, ChevronUp, ChevronDown, Layers, ZoomIn, ZoomOut, Grid3x3,
  Ruler, Play, Pause, Plus, Radio, Calendar, Clock, Save,
  ArrowRight, ArrowLeft, ArrowDown, X as XIcon, AlertTriangle, Circle,
  Monitor, Sun, Palette, Eye, Repeat, Zap
} from "lucide-react";

/* ============================================================
   PMV STUDIO — Editor de conteúdo para Painéis de Mensagem Variável
   Núcleo do sistema de gestão (NovaStar / VNNOX). Módulo: Editor + Programação
   ============================================================ */

// ---- Fonte bitmap 5x7 clássica de PMV (a autêntica de rodovia) ----
const F = {
  A:["01110","10001","10001","11111","10001","10001","10001"],
  B:["11110","10001","10001","11110","10001","10001","11110"],
  C:["01110","10001","10000","10000","10000","10001","01110"],
  D:["11110","10001","10001","10001","10001","10001","11110"],
  E:["11111","10000","10000","11110","10000","10000","11111"],
  F:["11111","10000","10000","11110","10000","10000","10000"],
  G:["01110","10001","10000","10111","10001","10001","01111"],
  H:["10001","10001","10001","11111","10001","10001","10001"],
  I:["11111","00100","00100","00100","00100","00100","11111"],
  J:["00111","00010","00010","00010","00010","10010","01100"],
  K:["10001","10010","10100","11000","10100","10010","10001"],
  L:["10000","10000","10000","10000","10000","10000","11111"],
  M:["10001","11011","10101","10101","10001","10001","10001"],
  N:["10001","10001","11001","10101","10011","10001","10001"],
  O:["01110","10001","10001","10001","10001","10001","01110"],
  P:["11110","10001","10001","11110","10000","10000","10000"],
  Q:["01110","10001","10001","10001","10101","10010","01101"],
  R:["11110","10001","10001","11110","10100","10010","10001"],
  S:["01111","10000","10000","01110","00001","00001","11110"],
  T:["11111","00100","00100","00100","00100","00100","00100"],
  U:["10001","10001","10001","10001","10001","10001","01110"],
  V:["10001","10001","10001","10001","10001","01010","00100"],
  W:["10001","10001","10001","10101","10101","11011","10001"],
  X:["10001","10001","01010","00100","01010","10001","10001"],
  Y:["10001","10001","01010","00100","00100","00100","00100"],
  Z:["11111","00001","00010","00100","01000","10000","11111"],
  "0":["01110","10001","10011","10101","11001","10001","01110"],
  "1":["00100","01100","00100","00100","00100","00100","01110"],
  "2":["01110","10001","00001","00010","00100","01000","11111"],
  "3":["11111","00010","00100","00010","00001","10001","01110"],
  "4":["00010","00110","01010","10010","11111","00010","00010"],
  "5":["11111","10000","11110","00001","00001","10001","01110"],
  "6":["00110","01000","10000","11110","10001","10001","01110"],
  "7":["11111","00001","00010","00100","01000","01000","01000"],
  "8":["01110","10001","10001","01110","10001","10001","01110"],
  "9":["01110","10001","10001","01111","00001","00010","01100"],
  " ":["00000","00000","00000","00000","00000","00000","00000"],
  ".":["00000","00000","00000","00000","00000","01100","01100"],
  ",":["00000","00000","00000","00000","01100","00100","01000"],
  ":":["00000","01100","01100","00000","01100","01100","00000"],
  "!":["00100","00100","00100","00100","00100","00000","00100"],
  "?":["01110","10001","00001","00010","00100","00000","00100"],
  "-":["00000","00000","00000","11111","00000","00000","00000"],
  "/":["00001","00010","00100","00100","01000","10000","10000"],
  "+":["00000","00100","00100","11111","00100","00100","00000"],
  "(":["00010","00100","01000","01000","01000","00100","00010"],
  ")":["01000","00100","00010","00010","00010","00100","01000"],
  "º":["01100","10010","10010","01100","00000","00000","00000"],
};

const PRESETS = [
  { name: "PMV Rodovia 96×48", w: 96, h: 48 },
  { name: "PMV Urbano 128×64", w: 128, h: 64 },
  { name: "PMV Compacto 64×32", w: 64, h: 32 },
  { name: "Faixa 160×32", w: 160, h: 32 },
  { name: "Grande 192×96", w: 192, h: 96 },
];

const MODES = [
  { id: "amber", name: "Âmbar", color: "#FFB000" },
  { id: "red", name: "Vermelho", color: "#FF3B30" },
  { id: "rgb", name: "RGB Full-color", color: null },
];

const PALETTE = ["#FFB000", "#FFFFFF", "#FF3B30", "#FFD400", "#2ECC71", "#22A7F0", "#FF7A00", "#B026FF"];

const FONTS = [
  { id: "led5x7", name: "LED 5×7 (clássica)" },
  { id: "monospace", name: "Monoespaçada" },
  { id: "Arial", name: "Arial" },
  { id: "Impact", name: "Impact (condensada)" },
  { id: "Georgia", name: "Georgia" },
];

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const CAT = ["Acidente", "Obra", "Interdição", "Congestionamento", "Evento", "Emergência", "Campanha", "Institucional"];

const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- Rasterização de texto ----------
function rasterTextLED(txt, color) {
  const px = [];
  let cx = 0;
  for (const ch of txt.toUpperCase()) {
    const g = F[ch] || F["?"];
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++)
      if (g[r][c] === "1") px.push([cx + c, r, color]);
    cx += 6;
  }
  return { pixels: px, w: Math.max(0, cx - 1), h: 7 };
}

function rasterTextSystem(txt, font, size, bold, color) {
  const cv = document.createElement("canvas");
  const ctx = cv.getContext("2d");
  ctx.font = `${bold ? "bold " : ""}${size}px ${font}`;
  const m = ctx.measureText(txt);
  const w = Math.max(1, Math.ceil(m.width));
  const h = Math.ceil(size * 1.35);
  cv.width = w; cv.height = h;
  const c2 = cv.getContext("2d");
  c2.imageSmoothingEnabled = false;
  c2.font = `${bold ? "bold " : ""}${size}px ${font}`;
  c2.textBaseline = "top";
  c2.fillStyle = "#fff";
  c2.fillText(txt, 0, Math.floor(size * 0.12));
  const data = c2.getImageData(0, 0, w, h).data;
  const px = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (data[(y * w + x) * 4 + 3] > 100) px.push([x, y, color]);
  return { pixels: px, w, h };
}

function rasterText(obj) {
  if (obj.font === "led5x7") return rasterTextLED(obj.text, obj.color);
  return rasterTextSystem(obj.text, obj.font, obj.size, obj.bold, obj.color);
}

// ---------- Placas / setas (vetor -> pixels) ----------
function rasterShape(kind, w, h, color) {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#fff";
  ctx.lineWidth = Math.max(2, Math.round(h * 0.09));
  const drawArrow = (rot) => {
    ctx.save();
    ctx.translate(w / 2, h / 2); ctx.rotate(rot);
    const L = Math.min(w, h) * 0.42;
    ctx.beginPath();
    ctx.moveTo(-L, 0); ctx.lineTo(L * 0.35, 0); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(L, 0); ctx.lineTo(L * 0.2, -L * 0.55);
    ctx.lineTo(L * 0.2, L * 0.55); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  if (kind === "arrowR") drawArrow(0);
  else if (kind === "arrowL") drawArrow(Math.PI);
  else if (kind === "arrowD") drawArrow(Math.PI / 2);
  else if (kind === "x") {
    ctx.lineWidth = Math.max(3, Math.round(w * 0.14));
    const p = Math.min(w, h) * 0.16;
    ctx.beginPath(); ctx.moveTo(p, p); ctx.lineTo(w - p, h - p);
    ctx.moveTo(w - p, p); ctx.lineTo(p, h - p); ctx.stroke();
  } else if (kind === "warn") {
    ctx.lineWidth = Math.max(2, Math.round(h * 0.08));
    ctx.beginPath();
    ctx.moveTo(w / 2, h * 0.1); ctx.lineTo(w * 0.08, h * 0.9);
    ctx.lineTo(w * 0.92, h * 0.9); ctx.closePath(); ctx.stroke();
    ctx.lineWidth = Math.max(2, Math.round(w * 0.08));
    ctx.beginPath(); ctx.moveTo(w / 2, h * 0.38); ctx.lineTo(w / 2, h * 0.66); ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2, h * 0.78, ctx.lineWidth * 0.6, 0, 7); ctx.fill();
  } else if (kind === "circle") {
    ctx.lineWidth = Math.max(3, Math.round(w * 0.12));
    ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.38, 0, 7); ctx.stroke();
  }
  const data = ctx.getImageData(0, 0, w, h).data;
  const px = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (data[(y * w + x) * 4 + 3] > 100) px.push([x, y, color]);
  return px;
}

// ---------- Imagem -> pixels ----------
function rasterImage(img, w, h, threshold, mono) {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const px = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const a = data[i + 3];
    if (a < 60) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < threshold) continue;
    const col = mono ? "#fff" : `rgb(${r},${g},${b})`;
    px.push([x, y, col]);
  }
  return px;
}

export default function PMVStudio() {
  const [tab, setTab] = useState("editor");
  const [panel, setPanel] = useState({ w: 96, h: 48, mode: "amber" });
  const [objects, setObjects] = useState([]);
  const [selId, setSelId] = useState(null);
  const [tool, setTool] = useState("select");
  const [color, setColor] = useState("#FFB000");
  const [fill, setFill] = useState(false);
  const [fontFamily, setFontFamily] = useState("led5x7");
  const [fontSize, setFontSize] = useState(10);
  const [bold, setBold] = useState(false);
  const [zoom, setZoom] = useState(9);
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [mode2, setMode2] = useState("edit"); // edit | play
  const [playlist, setPlaylist] = useState([]);
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleCat, setScheduleCat] = useState("Institucional");

  const canvasRef = useRef(null);
  const imgCache = useRef({}); // id -> HTMLImageElement
  const dragRef = useRef(null);
  const draftRef = useRef(null);
  const animRef = useRef(null);

  const modeColor = MODES.find(m => m.id === panel.mode)?.color;
  const MARGIN = showRuler ? 20 : 4;

  const sel = objects.find(o => o.id === selId);

  // Compute composite grid (Map "x,y"->color) from objects, bottom->top
  const buildGrid = useCallback((objs) => {
    const grid = new Map();
    const put = (x, y, c) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= panel.w || y >= panel.h) return;
      const col = panel.mode === "rgb" ? c : modeColor;
      grid.set(x + "," + y, col);
    };
    for (const o of objs) {
      if (o.hidden) continue;
      if (o.type === "pixels") {
        for (const k in o.px) { const [x, y] = k.split(",").map(Number); put(x, y, o.px[k]); }
      } else if (o.type === "text") {
        const r = rasterText(o);
        for (const [dx, dy, c] of r.pixels) put(o.x + dx, o.y + dy, c);
      } else if (o.type === "rect") {
        for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) {
          const edge = x === 0 || y === 0 || x === o.w - 1 || y === o.h - 1;
          if (o.fill || edge) put(o.x + x, o.y + y, o.color);
        }
      } else if (o.type === "line") {
        let { x1, y1, x2, y2 } = o;
        const dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
        let err = dx - dy, x = x1, y = y1;
        for (let i = 0; i < 999; i++) {
          put(x, y, o.color);
          if (x === x2 && y === y2) break;
          const e2 = 2 * err;
          if (e2 > -dy) { err -= dy; x += sx; }
          if (e2 < dx) { err += dx; y += sy; }
        }
      } else if (o.type === "shape") {
        for (const [dx, dy, c] of rasterShape(o.kind, o.w, o.h, o.color)) put(o.x + dx, o.y + dy, c);
      } else if (o.type === "image" && o.cache) {
        for (const [dx, dy, c] of o.cache) put(o.x + dx, o.y + dy, c);
      }
    }
    return grid;
  }, [panel.w, panel.h, panel.mode, modeColor]);

  // Bounds of an object for selection
  const objBounds = (o) => {
    if (o.type === "text") { const r = rasterText(o); return { x: o.x, y: o.y, w: r.w, h: r.h }; }
    if (o.type === "line") return { x: Math.min(o.x1, o.x2), y: Math.min(o.y1, o.y2), w: Math.abs(o.x2 - o.x1) + 1, h: Math.abs(o.y2 - o.y1) + 1 };
    if (o.type === "pixels") { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const k in o.px) { const [x, y] = k.split(",").map(Number); a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return c < 0 ? null : { x: a, y: b, w: c - a + 1, h: d - b + 1 }; }
    return { x: o.x, y: o.y, w: o.w, h: o.h };
  };

  // ---------- draw to display canvas ----------
  const draw = useCallback((gridOverride) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = panel.w, H = panel.h, z = zoom;
    cv.width = W * z + MARGIN + 4;
    cv.height = H * z + MARGIN + 4;
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#05070a";
    ctx.fillRect(0, 0, cv.width, cv.height);

    // panel body
    ctx.fillStyle = "#0a0d12";
    ctx.fillRect(MARGIN, MARGIN, W * z, H * z);

    const grid = gridOverride || buildGrid(objects);
    const rad = z * 0.4;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = grid.get(x + "," + y);
      const cx = MARGIN + x * z + z / 2, cy = MARGIN + y * z + z / 2;
      if (c) {
        ctx.beginPath(); ctx.fillStyle = c;
        ctx.shadowColor = c; ctx.shadowBlur = z * 0.5;
        ctx.arc(cx, cy, rad, 0, 7); ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath(); ctx.fillStyle = "#14181e";
        ctx.arc(cx, cy, rad * 0.55, 0, 7); ctx.fill();
      }
    }

    // grid lines
    if (showGrid && z >= 5 && mode2 === "edit") {
      ctx.strokeStyle = "rgba(120,140,160,0.10)"; ctx.lineWidth = 1;
      for (let x = 0; x <= W; x++) { ctx.beginPath(); ctx.moveTo(MARGIN + x * z, MARGIN); ctx.lineTo(MARGIN + x * z, MARGIN + H * z); ctx.stroke(); }
      for (let y = 0; y <= H; y++) { ctx.beginPath(); ctx.moveTo(MARGIN, MARGIN + y * z); ctx.lineTo(MARGIN + W * z, MARGIN + y * z); ctx.stroke(); }
    }

    // rulers
    if (showRuler && mode2 === "edit") {
      ctx.fillStyle = "#0e1218"; ctx.fillRect(0, 0, cv.width, MARGIN); ctx.fillRect(0, 0, MARGIN, cv.height);
      ctx.fillStyle = "#6b7d8f"; ctx.font = "8px ui-monospace, monospace"; ctx.textBaseline = "middle";
      const step = z < 7 ? 16 : 8;
      for (let x = 0; x <= W; x += step) { ctx.fillText(String(x), MARGIN + x * z - (x >= 100 ? 8 : x >= 10 ? 5 : 2), MARGIN / 2); ctx.strokeStyle = "rgba(120,140,160,0.25)"; ctx.beginPath(); ctx.moveTo(MARGIN + x * z, MARGIN - 3); ctx.lineTo(MARGIN + x * z, MARGIN); ctx.stroke(); }
      ctx.save(); ctx.textAlign = "center";
      for (let y = 0; y <= H; y += step) { ctx.fillText(String(y), MARGIN / 2, MARGIN + y * z); }
      ctx.restore();
    }

    // selection + draft
    if (mode2 === "edit") {
      const outline = (b, col) => { if (!b) return; ctx.strokeStyle = col; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.strokeRect(MARGIN + b.x * z - 1, MARGIN + b.y * z - 1, b.w * z + 2, b.h * z + 2); ctx.setLineDash([]); };
      if (sel) outline(objBounds(sel), "#FFB000");
      if (draftRef.current) {
        const d = draftRef.current;
        if (d.type === "rect") outline({ x: d.x, y: d.y, w: d.w, h: d.h }, "rgba(255,176,0,0.7)");
        if (d.type === "line") { ctx.strokeStyle = "rgba(255,176,0,0.7)"; ctx.beginPath(); ctx.moveTo(MARGIN + d.x1 * z + z / 2, MARGIN + d.y1 * z + z / 2); ctx.lineTo(MARGIN + d.x2 * z + z / 2, MARGIN + d.y2 * z + z / 2); ctx.stroke(); }
      }
    }
  }, [panel, zoom, objects, buildGrid, showGrid, showRuler, mode2, sel, MARGIN]);

  useEffect(() => { draw(); }, [draw]);

  // ---------- mouse -> pixel ----------
  const toPixel = (e) => {
    const cv = canvasRef.current; const r = cv.getBoundingClientRect();
    const sx = cv.width / r.width, sy = cv.height / r.height;
    const px = ((e.clientX - r.left) * sx - MARGIN) / zoom;
    const py = ((e.clientY - r.top) * sy - MARGIN) / zoom;
    return { x: Math.floor(px), y: Math.floor(py) };
  };

  const hitTest = (p) => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const b = objBounds(objects[i]);
      if (b && p.x >= b.x && p.x < b.x + b.w && p.y >= b.y && p.y < b.y + b.h) return objects[i];
    }
    return null;
  };

  const onDown = (e) => {
    if (mode2 !== "edit") return;
    const p = toPixel(e);
    if (p.x < 0 || p.y < 0 || p.x >= panel.w || p.y >= panel.h) return;

    if (tool === "select") {
      const hit = hitTest(p);
      setSelId(hit ? hit.id : null);
      if (hit) dragRef.current = { id: hit.id, start: p, orig: JSON.parse(JSON.stringify(hit)) };
    } else if (tool === "pencil" || tool === "eraser") {
      dragRef.current = { paint: true };
      paintPixel(p, tool === "eraser");
    } else if (tool === "line") {
      draftRef.current = { type: "line", x1: p.x, y1: p.y, x2: p.x, y2: p.y };
    } else if (tool === "rect") {
      draftRef.current = { type: "rect", ox: p.x, oy: p.y, x: p.x, y: p.y, w: 1, h: 1 };
    } else if (tool === "text") {
      const o = { id: uid(), type: "text", x: p.x, y: p.y, text: "TEXTO", color, font: fontFamily, size: fontSize, bold };
      setObjects(v => [...v, o]); setSelId(o.id); setTool("select");
    } else if (tool && tool.startsWith("shape:")) {
      const kind = tool.split(":")[1];
      const o = { id: uid(), type: "shape", kind, x: p.x, y: p.y, w: Math.min(24, panel.w - p.x), h: Math.min(24, panel.h - p.y), color };
      setObjects(v => [...v, o]); setSelId(o.id); setTool("select");
    }
  };

  const onMove = (e) => {
    if (mode2 !== "edit") return;
    const p = toPixel(e);
    const d = dragRef.current;
    if (d?.paint) { paintPixel(p, tool === "eraser"); return; }
    if (d?.id) {
      const dx = p.x - d.start.x, dy = p.y - d.start.y;
      setObjects(v => v.map(o => {
        if (o.id !== d.id) return o;
        const g = d.orig;
        if (g.type === "line") return { ...o, x1: g.x1 + dx, y1: g.y1 + dy, x2: g.x2 + dx, y2: g.y2 + dy };
        if (g.type === "pixels") { const np = {}; for (const k in g.px) { const [x, y] = k.split(",").map(Number); np[(x + dx) + "," + (y + dy)] = g.px[k]; } return { ...o, px: np }; }
        return { ...o, x: g.x + dx, y: g.y + dy };
      }));
      return;
    }
    if (draftRef.current?.type === "line") { draftRef.current.x2 = clamp(p.x, 0, panel.w - 1); draftRef.current.y2 = clamp(p.y, 0, panel.h - 1); draw(); }
    if (draftRef.current?.type === "rect") { const d2 = draftRef.current; d2.x = Math.min(d2.ox, p.x); d2.y = Math.min(d2.oy, p.y); d2.w = Math.abs(p.x - d2.ox) + 1; d2.h = Math.abs(p.y - d2.oy) + 1; draw(); }
  };

  const onUp = () => {
    const d = draftRef.current;
    if (d?.type === "line") { setObjects(v => [...v, { id: uid(), type: "line", x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2, color }]); }
    if (d?.type === "rect") { setObjects(v => [...v, { id: uid(), type: "rect", x: d.x, y: d.y, w: d.w, h: d.h, color, fill }]); }
    draftRef.current = null; dragRef.current = null;
  };

  const paintPixel = (p, erase) => {
    if (p.x < 0 || p.y < 0 || p.x >= panel.w || p.y >= panel.h) return;
    setObjects(v => {
      let layer = v.find(o => o.type === "pixels" && o.brush);
      if (!layer) { layer = { id: uid(), type: "pixels", brush: true, px: {} }; v = [...v, layer]; }
      return v.map(o => {
        if (o.id !== layer.id) return o;
        const np = { ...o.px };
        if (erase) delete np[p.x + "," + p.y]; else np[p.x + "," + p.y] = color;
        return { ...o, px: np };
      });
    });
  };

  // ---------- object ops ----------
  const updateSel = (patch) => setObjects(v => v.map(o => o.id === selId ? { ...o, ...patch } : o));
  const delObj = (id) => { setObjects(v => v.filter(o => o.id !== id)); if (id === selId) setSelId(null); };
  const dupObj = (o) => { const n = JSON.parse(JSON.stringify(o)); n.id = uid(); if (n.x != null) { n.x += 3; n.y += 3; } setObjects(v => [...v, n]); setSelId(n.id); };
  const move = (id, dir) => setObjects(v => { const i = v.findIndex(o => o.id === id); if (i < 0) return v; const j = i + dir; if (j < 0 || j >= v.length) return v; const a = [...v];[a[i], a[j]] = [a[j], a[i]]; return a; });

  const onImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const iw = Math.min(panel.w, 48), ih = Math.round(iw * img.height / img.width);
        const id = uid();
        imgCache.current[id] = img;
        const cache = rasterImage(img, iw, ih, 90, panel.mode !== "rgb");
        setObjects(v => [...v, { id, type: "image", x: 2, y: 2, w: iw, h: ih, threshold: 90, mono: panel.mode !== "rgb", cache, src: rd.result }]);
        setSelId(id);
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(file);
    e.target.value = "";
  };

  const recalcImage = (o, patch) => {
    const merged = { ...o, ...patch };
    const img = imgCache.current[o.id];
    if (img) merged.cache = rasterImage(img, merged.w, merged.h, merged.threshold, merged.mono);
    setObjects(v => v.map(x => x.id === o.id ? merged : x));
  };

  const clearAll = () => { if (confirm("Limpar todo o conteúdo do painel?")) { setObjects([]); setSelId(null); } };

  // ---------- Playlist ----------
  const snapshot = () => {
    const grid = buildGrid(objects);
    const px = []; grid.forEach((c, k) => { const [x, y] = k.split(",").map(Number); px.push([x, y, c]); });
    return { w: panel.w, h: panel.h, mode: panel.mode, px };
  };
  const addToPlaylist = () => {
    if (!objects.length) { alert("Desenhe algo no editor antes de salvar na playlist."); return; }
    setPlaylist(v => [...v, {
      id: uid(), name: scheduleName || `Mensagem ${v.length + 1}`, cat: scheduleCat, source: "design",
      snap: snapshot(), duration: 8, priority: 3, loop: true, transition: "corte",
      dateStart: "", dateEnd: "", timeStart: "00:00", timeEnd: "23:59",
      days: [true, true, true, true, true, true, true],
    }]);
    setScheduleName("");
  };
  const addApiSource = () => setPlaylist(v => [...v, {
    id: uid(), name: "Fila VNNOX (API)", cat: "Emergência", source: "api", endpoint: "vnnox://program/incoming",
    snap: null, duration: 10, priority: 9, loop: false, transition: "corte",
    dateStart: "", dateEnd: "", timeStart: "00:00", timeEnd: "23:59",
    days: [true, true, true, true, true, true, true],
  }]);
  const updItem = (id, patch) => setPlaylist(v => v.map(i => i.id === id ? { ...i, ...patch } : i));
  const delItem = (id) => setPlaylist(v => v.filter(i => i.id !== id));
  const moveItem = (id, dir) => setPlaylist(v => { const i = v.findIndex(x => x.id === id); const j = i + dir; if (j < 0 || j >= v.length) return v; const a = [...v];[a[i], a[j]] = [a[j], a[i]]; return a; });

  // ---------- Play preview (cycling) ----------
  const playRef = useRef({ idx: 0, t: 0, blink: 0 });
  useEffect(() => {
    if (mode2 !== "play") { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    const items = playlist.filter(i => i.snap).sort((a, b) => b.priority - a.priority);
    const seq = items.length ? items : (objects.length ? [{ snap: snapshot(), duration: 6 }] : []);
    let last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000; last = now;
      const st = playRef.current;
      st.t += dt; st.blink += dt;
      if (seq.length && st.t > (seq[st.idx % seq.length].duration || 6)) { st.t = 0; st.idx = (st.idx + 1) % seq.length; }
      const cur = seq[st.idx % seq.length];
      if (cur) {
        const grid = new Map();
        for (const [x, y, c] of cur.snap.px) grid.set(x + "," + y, c);
        draw(grid);
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => animRef.current && cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line
  }, [mode2, playlist, objects, zoom, panel]);

  // ================= UI =================
  const Btn = ({ active, children, ...p }) => (
    <button {...p} className={`flex items-center justify-center gap-1.5 rounded-md border text-xs transition-colors ${active ? "border-amber-500/60 bg-amber-500/15 text-amber-300" : "border-slate-700/70 bg-slate-800/40 text-slate-300 hover:bg-slate-700/50"} ${p.className || ""}`}>{children}</button>
  );

  const tools = [
    { id: "select", icon: MousePointer2, label: "Selecionar" },
    { id: "pencil", icon: Pencil, label: "Pixel a pixel" },
    { id: "eraser", icon: Eraser, label: "Borracha" },
    { id: "line", icon: Minus, label: "Linha" },
    { id: "rect", icon: Square, label: "Retângulo" },
    { id: "text", icon: Type, label: "Texto" },
    { id: "image", icon: ImageIcon, label: "Imagem" },
  ];
  const shapes = [
    { id: "shape:arrowR", icon: ArrowRight, label: "Seta →" },
    { id: "shape:arrowL", icon: ArrowLeft, label: "Seta ←" },
    { id: "shape:arrowD", icon: ArrowDown, label: "Seta ↓" },
    { id: "shape:x", icon: XIcon, label: "Faixa fechada" },
    { id: "shape:warn", icon: AlertTriangle, label: "Atenção" },
    { id: "shape:circle", icon: Circle, label: "Círculo" },
  ];

  return (
    <div className="flex h-screen w-full flex-col bg-slate-950 font-sans text-slate-200" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-500/20 text-amber-400"><Monitor size={16} /></div>
          <div>
            <div className="text-[13px] font-semibold tracking-tight text-slate-100">PMV Studio</div>
            <div className="text-[9px] uppercase tracking-widest text-slate-500">NovaStar · VNNOX · Editor de conteúdo</div>
          </div>
        </div>
        <div className="ml-4 flex gap-1 rounded-lg bg-slate-800/60 p-0.5">
          {[["editor", "Editor", Grid3x3], ["schedule", "Programação", Calendar]].map(([id, lb, Ic]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${tab === id ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-700/50"}`}>
              <Ic size={13} />{lb}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 font-mono text-[10px] text-slate-500">
          <span className="rounded bg-slate-800 px-2 py-1">{panel.w}×{panel.h}px</span>
          <span className="rounded bg-slate-800 px-2 py-1">{objects.length} camadas</span>
        </div>
      </header>

      {tab === "editor" ? (
        <div className="flex min-h-0 flex-1">
          {/* Left toolbar */}
          <aside className="flex w-16 flex-col items-center gap-1 border-r border-slate-800 bg-slate-900/60 py-3">
            {tools.map(t => (
              <button key={t.id} title={t.label} onClick={() => t.id === "image" ? document.getElementById("imgin").click() : setTool(t.id)}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${tool === t.id ? "border-amber-500/60 bg-amber-500/15 text-amber-400" : "border-transparent text-slate-400 hover:bg-slate-800"}`}>
                <t.icon size={18} />
                <span className="pointer-events-none absolute left-14 z-20 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-200 group-hover:block">{t.label}</span>
              </button>
            ))}
            <input id="imgin" type="file" accept="image/*" onChange={onImage} className="hidden" />
            <div className="my-1 h-px w-8 bg-slate-800" />
            <div className="text-[8px] uppercase tracking-wider text-slate-600">Placas</div>
            <div className="grid grid-cols-2 gap-1 px-1">
              {shapes.map(s => (
                <button key={s.id} title={s.label} onClick={() => setTool(s.id)}
                  className={`flex h-8 w-6 items-center justify-center rounded border transition-colors ${tool === s.id ? "border-amber-500/60 bg-amber-500/15 text-amber-400" : "border-transparent text-slate-400 hover:bg-slate-800"}`}>
                  <s.icon size={14} />
                </button>
              ))}
            </div>
            <div className="my-1 h-px w-8 bg-slate-800" />
            <button title="Limpar tudo" onClick={clearAll} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/15 hover:text-red-400"><Trash2 size={16} /></button>
          </aside>

          {/* Center */}
          <main className="flex min-w-0 flex-1 flex-col">
            {/* Sub toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900/40 px-3 py-2">
              <div className="flex items-center gap-1 rounded-lg bg-slate-800/60 p-0.5">
                <button onClick={() => setMode2("edit")} className={`rounded px-2.5 py-1 text-[11px] font-medium ${mode2 === "edit" ? "bg-slate-700 text-white" : "text-slate-400"}`}>Editar</button>
                <button onClick={() => setMode2("play")} className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium ${mode2 === "play" ? "bg-emerald-500 text-slate-950" : "text-slate-400"}`}><Play size={11} />Energizar painel</button>
              </div>
              <div className="mx-1 h-5 w-px bg-slate-800" />
              {/* mode color */}
              <div className="flex items-center gap-1">
                {MODES.map(m => (
                  <button key={m.id} onClick={() => setPanel(p => ({ ...p, mode: m.id }))} title={m.name}
                    className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] ${panel.mode === m.id ? "border-amber-500/60 bg-amber-500/10 text-slate-100" : "border-slate-700 text-slate-400"}`}>
                    {m.color ? <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }} /> : <Palette size={11} />}
                    {m.name}
                  </button>
                ))}
              </div>
              <div className="mx-1 h-5 w-px bg-slate-800" />
              <Btn active={showGrid} onClick={() => setShowGrid(g => !g)} className="px-2 py-1"><Grid3x3 size={12} />Grade</Btn>
              <Btn active={showRuler} onClick={() => setShowRuler(r => !r)} className="px-2 py-1"><Ruler size={12} />Régua</Btn>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setZoom(z => clamp(z - 1, 3, 20))} className="rounded bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"><ZoomOut size={13} /></button>
                <span className="w-10 text-center font-mono text-[11px] text-slate-400">{zoom}px</span>
                <button onClick={() => setZoom(z => clamp(z + 1, 3, 20))} className="rounded bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700"><ZoomIn size={13} /></button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_center,#0d1219_0%,#05070a_100%)] p-6">
              <canvas ref={canvasRef} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                className="max-w-full rounded-md ring-1 ring-slate-700/50"
                style={{ cursor: tool === "select" ? "default" : "crosshair", imageRendering: "auto" }} />
            </div>

            {/* Panel config */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 bg-slate-900/60 px-3 py-2 text-[11px]">
              <span className="font-mono uppercase tracking-wider text-slate-500">Painel</span>
              <select onChange={e => { const p = PRESETS[e.target.value]; if (p) setPanel(v => ({ ...v, w: p.w, h: p.h })); }}
                className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200">
                <option>Presets…</option>
                {PRESETS.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
              </select>
              <label className="flex items-center gap-1 text-slate-400">L
                <input type="number" value={panel.w} min={16} max={256} onChange={e => setPanel(v => ({ ...v, w: clamp(+e.target.value, 16, 256) }))} className="w-16 rounded border border-slate-700 bg-slate-800 px-1.5 py-1 text-slate-200" /></label>
              <label className="flex items-center gap-1 text-slate-400">A
                <input type="number" value={panel.h} min={8} max={192} onChange={e => setPanel(v => ({ ...v, h: clamp(+e.target.value, 8, 192) }))} className="w-16 rounded border border-slate-700 bg-slate-800 px-1.5 py-1 text-slate-200" /></label>
              <span className="text-slate-500">= {(panel.w * panel.h).toLocaleString()} LEDs</span>
              <div className="ml-auto flex items-center gap-2">
                <input value={scheduleName} onChange={e => setScheduleName(e.target.value)} placeholder="Nome da mensagem" className="w-40 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-200 placeholder:text-slate-600" />
                <select value={scheduleCat} onChange={e => setScheduleCat(e.target.value)} className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">
                  {CAT.map(c => <option key={c}>{c}</option>)}
                </select>
                <button onClick={addToPlaylist} className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-amber-400"><Save size={13} />Salvar na playlist</button>
              </div>
            </div>
          </main>

          {/* Right panel: props + layers */}
          <aside className="flex w-72 flex-col border-l border-slate-800 bg-slate-900/60">
            {/* Color / props */}
            <div className="border-b border-slate-800 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500"><Palette size={12} />Cor {panel.mode !== "rgb" && <span className="text-amber-500/70">(monocromático: {MODES.find(m=>m.id===panel.mode).name})</span>}</div>
              <div className="mb-2 grid grid-cols-8 gap-1.5">
                {PALETTE.map(c => (
                  <button key={c} onClick={() => { setColor(c); if (sel && sel.color != null) updateSel({ color: c }); }}
                    className={`h-6 w-full rounded ${color === c ? "ring-2 ring-white ring-offset-1 ring-offset-slate-900" : ""}`} style={{ background: c }} />
                ))}
              </div>
              <input type="color" value={color} onChange={e => { setColor(e.target.value); if (sel && sel.color != null) updateSel({ color: e.target.value }); }} className="h-7 w-full cursor-pointer rounded bg-transparent" />

              {tool === "text" || sel?.type === "text" ? (
                <div className="mt-3 space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Texto</div>
                  {sel?.type === "text" && (
                    <input value={sel.text} onChange={e => updateSel({ text: e.target.value })} className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100" />
                  )}
                  <select value={sel?.type === "text" ? sel.font : fontFamily} onChange={e => { setFontFamily(e.target.value); if (sel?.type === "text") updateSel({ font: e.target.value }); }} className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-xs text-slate-200">
                    {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                    {(sel?.type === "text" ? sel.font : fontFamily) !== "led5x7" && (
                      <label className="flex flex-1 items-center gap-1 text-[11px] text-slate-400">Tam
                        <input type="range" min={7} max={40} value={sel?.type === "text" ? sel.size : fontSize} onChange={e => { setFontSize(+e.target.value); if (sel?.type === "text") updateSel({ size: +e.target.value }); }} className="flex-1 accent-amber-500" />
                        <span className="w-6 font-mono">{sel?.type === "text" ? sel.size : fontSize}</span>
                      </label>
                    )}
                    <button onClick={() => { setBold(b => !b); if (sel?.type === "text") updateSel({ bold: !sel.bold }); }} className={`rounded border px-2 py-1 text-xs font-bold ${(sel?.type === "text" ? sel.bold : bold) ? "border-amber-500/60 bg-amber-500/15 text-amber-400" : "border-slate-700 text-slate-400"}`}>N</button>
                  </div>
                </div>
              ) : null}

              {(tool === "rect" || sel?.type === "rect") && (
                <label className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                  <input type="checkbox" checked={sel?.type === "rect" ? sel.fill : fill} onChange={e => { setFill(e.target.checked); if (sel?.type === "rect") updateSel({ fill: e.target.checked }); }} className="accent-amber-500" />
                  Preencher retângulo
                </label>
              )}

              {sel?.type === "image" && (
                <div className="mt-3 space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Imagem → LEDs</div>
                  <label className="flex items-center gap-1 text-[11px] text-slate-400">Largura
                    <input type="range" min={8} max={panel.w} value={sel.w} onChange={e => { const w = +e.target.value; recalcImage(sel, { w, h: Math.round(w * (sel.h / sel.w)) }); }} className="flex-1 accent-amber-500" />
                    <span className="w-8 font-mono">{sel.w}</span></label>
                  <label className="flex items-center gap-1 text-[11px] text-slate-400">Limiar
                    <input type="range" min={20} max={230} value={sel.threshold} onChange={e => recalcImage(sel, { threshold: +e.target.value })} className="flex-1 accent-amber-500" />
                    <span className="w-8 font-mono">{sel.threshold}</span></label>
                </div>
              )}

              {sel?.type === "shape" && (
                <label className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">Tamanho
                  <input type="range" min={8} max={Math.min(panel.w, panel.h)} value={sel.w} onChange={e => updateSel({ w: +e.target.value, h: +e.target.value })} className="flex-1 accent-amber-500" />
                  <span className="w-8 font-mono">{sel.w}</span></label>
              )}

              {sel && (
                <div className="mt-3 flex gap-1.5">
                  <button onClick={() => dupObj(sel)} className="flex flex-1 items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800 py-1.5 text-[11px] text-slate-300 hover:bg-slate-700"><Copy size={12} />Duplicar</button>
                  <button onClick={() => delObj(sel.id)} className="flex flex-1 items-center justify-center gap-1 rounded border border-red-900/50 bg-red-500/10 py-1.5 text-[11px] text-red-400 hover:bg-red-500/20"><Trash2 size={12} />Excluir</button>
                </div>
              )}
              {sel && (
                <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-[10px] text-slate-500">
                  <span>x: {sel.x ?? sel.x1 ?? "—"}</span><span>y: {sel.y ?? sel.y1 ?? "—"}</span>
                </div>
              )}
            </div>

            {/* Layers */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500"><Layers size={12} />Camadas</div>
              <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                {objects.length === 0 && <div className="px-2 py-6 text-center text-[11px] text-slate-600">Adicione texto, formas<br />ou desenhe pixel a pixel</div>}
                {[...objects].reverse().map((o) => {
                  const label = o.type === "text" ? `"${o.text}"` : o.type === "pixels" ? "Pixels" : o.type === "shape" ? "Placa/Seta" : o.type[0].toUpperCase() + o.type.slice(1);
                  const Ic = o.type === "text" ? Type : o.type === "image" ? ImageIcon : o.type === "line" ? Minus : o.type === "rect" ? Square : o.type === "shape" ? AlertTriangle : Pencil;
                  return (
                    <div key={o.id} onClick={() => setSelId(o.id)} className={`group mb-1 flex items-center gap-2 rounded-md border px-2 py-1.5 text-[11px] ${selId === o.id ? "border-amber-500/50 bg-amber-500/10" : "border-transparent bg-slate-800/40 hover:bg-slate-800"}`}>
                      <Ic size={13} className="text-slate-400" />
                      <span className="flex-1 truncate text-slate-300">{label}</span>
                      <button onClick={e => { e.stopPropagation(); updateSel; setObjects(v => v.map(x => x.id === o.id ? { ...x, hidden: !x.hidden } : x)); }} className="text-slate-500 hover:text-slate-200"><Eye size={12} className={o.hidden ? "opacity-30" : ""} /></button>
                      <button onClick={e => { e.stopPropagation(); move(o.id, 1); }} className="text-slate-500 hover:text-slate-200"><ChevronUp size={12} /></button>
                      <button onClick={e => { e.stopPropagation(); move(o.id, -1); }} className="text-slate-500 hover:text-slate-200"><ChevronDown size={12} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <ScheduleView playlist={playlist} addApiSource={addApiSource} updItem={updItem} delItem={delItem} moveItem={moveItem} />
      )}
    </div>
  );
}

/* ==================== PROGRAMAÇÃO / PLAYLIST ==================== */
function ScheduleView({ playlist, addApiSource, updItem, delItem, moveItem }) {
  const [selId, setSelId] = useState(playlist[0]?.id || null);
  const sel = playlist.find(i => i.id === selId) || playlist[0];
  const sorted = [...playlist].sort((a, b) => b.priority - a.priority);
  const cycle = playlist.filter(i => i.source !== "api").reduce((s, i) => s + i.duration, 0);

  const Snap = ({ snap, size = 120 }) => {
    const ref = useRef(null);
    useEffect(() => {
      const cv = ref.current; if (!cv || !snap) return;
      const z = Math.max(1, Math.floor(size / snap.w));
      cv.width = snap.w * z; cv.height = snap.h * z;
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#07090c"; ctx.fillRect(0, 0, cv.width, cv.height);
      for (const [x, y, c] of snap.px) { ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = z * 0.6; ctx.beginPath(); ctx.arc(x * z + z / 2, y * z + z / 2, z * 0.4, 0, 7); ctx.fill(); }
    }, [snap, size]);
    return <canvas ref={ref} className="rounded ring-1 ring-slate-700/50" style={{ maxWidth: size }} />;
  };

  return (
    <div className="flex min-h-0 flex-1">
      {/* list */}
      <aside className="flex w-80 flex-col border-r border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between px-3 py-3">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><Repeat size={13} />Playlist do painel</span>
          <button onClick={addApiSource} title="Adicionar fonte de API" className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-sky-300 hover:bg-slate-700"><Radio size={11} />Fonte API</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {playlist.length === 0 && (
            <div className="mx-2 mt-6 rounded-lg border border-dashed border-slate-700 p-5 text-center text-[11px] text-slate-500">
              Vá ao <span className="text-amber-400">Editor</span>, monte uma mensagem e clique em <span className="text-slate-300">"Salvar na playlist"</span>. Ela aparecerá aqui para agendar entrada e saída.
            </div>
          )}
          {playlist.map((i, idx) => (
            <div key={i.id} onClick={() => setSelId(i.id)} className={`mb-1.5 flex items-center gap-2 rounded-lg border p-2 ${selId === i.id ? "border-amber-500/50 bg-amber-500/10" : "border-slate-800 bg-slate-800/40 hover:bg-slate-800"}`}>
              <span className="font-mono text-[10px] text-slate-500">{String(idx + 1).padStart(2, "0")}</span>
              {i.source === "api" ? <div className="flex h-9 w-14 items-center justify-center rounded bg-sky-500/10 text-sky-400"><Radio size={16} /></div> : <Snap snap={i.snap} size={56} />}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium text-slate-200">{i.name}</div>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                  <span className={`rounded px-1 ${i.source === "api" ? "bg-sky-500/15 text-sky-300" : "bg-slate-700 text-slate-300"}`}>{i.source === "api" ? "API" : i.cat}</span>
                  <span>{i.duration}s</span><span>·</span><span>P{i.priority}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <button onClick={e => { e.stopPropagation(); moveItem(i.id, -1); }} className="text-slate-600 hover:text-slate-300"><ChevronUp size={13} /></button>
                <button onClick={e => { e.stopPropagation(); moveItem(i.id, 1); }} className="text-slate-600 hover:text-slate-300"><ChevronDown size={13} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 px-3 py-2 text-[10px] text-slate-500">
          Ciclo local: <span className="font-mono text-slate-300">{cycle}s</span> · {playlist.length} itens
        </div>
      </aside>

      {/* detail + timeline */}
      <main className="min-w-0 flex-1 overflow-y-auto p-5">
        {/* timeline 24h */}
        <section className="mb-5 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><Clock size={13} />Janela de exibição (24h) — quando cada conteúdo entra e sai</div>
          <div className="relative ml-24">
            <div className="mb-1 flex justify-between font-mono text-[9px] text-slate-600">
              {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => <span key={h}>{String(h).padStart(2, "0")}h</span>)}
            </div>
          </div>
          <div className="space-y-1.5">
            {playlist.map(i => {
              const s = parseInt(i.timeStart.split(":")[0]) + parseInt(i.timeStart.split(":")[1]) / 60;
              const e = parseInt(i.timeEnd.split(":")[0]) + parseInt(i.timeEnd.split(":")[1]) / 60;
              return (
                <div key={i.id} className="flex items-center gap-2">
                  <div className="w-24 truncate text-right text-[10px] text-slate-400">{i.name}</div>
                  <div className="relative h-5 flex-1 rounded bg-slate-800/60">
                    <div className={`absolute inset-y-0 rounded ${i.source === "api" ? "bg-sky-500/70" : "bg-amber-500/70"}`} style={{ left: `${(s / 24) * 100}%`, width: `${((e - s) / 24) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {playlist.length === 0 && <div className="py-3 text-center text-[11px] text-slate-600">Sem itens agendados ainda.</div>}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-amber-500/70" />Conteúdo do editor</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-sky-500/70" />Injeção via API (VNNOX)</span>
          </div>
        </section>

        {/* API injection note */}
        <section className="mb-5 flex items-start gap-3 rounded-xl border border-sky-900/50 bg-sky-500/5 p-4">
          <Zap size={18} className="mt-0.5 shrink-0 text-sky-400" />
          <div className="text-[12px] leading-relaxed text-slate-300">
            <span className="font-semibold text-sky-300">Dinâmica de prioridade.</span> Conteúdo que chega pela API (ex.: alerta de acidente vindo do órgão de trânsito) entra com <span className="font-mono text-sky-300">prioridade alta</span> e <span className="text-white">preempta</span> a playlist local: assume o painel imediatamente, exibe pela duração definida e, ao encerrar (ou ao receber o comando de cancelamento), devolve o painel para o ciclo normal. Prioridade maior sempre vence — é assim que uma emergência sobrepõe uma campanha.
          </div>
        </section>

        {/* selected item schedule */}
        {sel ? (
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="mb-4 flex items-center gap-3">
              {sel.source === "api" ? <div className="flex h-16 w-24 items-center justify-center rounded bg-sky-500/10 text-sky-400"><Radio size={22} /></div> : <Snap snap={sel.snap} size={110} />}
              <div className="flex-1">
                <input value={sel.name} onChange={e => updItem(sel.id, { name: e.target.value })} className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm font-medium text-slate-100" />
                {sel.source === "api" && <div className="mt-1.5 font-mono text-[10px] text-sky-400/80">{sel.endpoint}</div>}
              </div>
              <button onClick={() => delItem(sel.id)} className="rounded-lg border border-red-900/50 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"><Trash2 size={15} /></button>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-[11px] md:grid-cols-4">
              <Field label="Duração (s)"><input type="number" min={1} value={sel.duration} onChange={e => updItem(sel.id, { duration: +e.target.value })} className="inp" /></Field>
              <Field label="Prioridade (1-9)"><input type="number" min={1} max={9} value={sel.priority} onChange={e => updItem(sel.id, { priority: clamp(+e.target.value, 1, 9) })} className="inp" /></Field>
              <Field label="Transição">
                <select value={sel.transition} onChange={e => updItem(sel.id, { transition: e.target.value })} className="inp">
                  <option value="corte">Corte seco</option><option value="fade">Fade</option><option value="rolagem">Rolagem</option>
                </select>
              </Field>
              <Field label="Loop">
                <button onClick={() => updItem(sel.id, { loop: !sel.loop })} className={`flex w-full items-center justify-center gap-1 rounded border py-1.5 ${sel.loop ? "border-amber-500/60 bg-amber-500/15 text-amber-400" : "border-slate-700 text-slate-400"}`}><Repeat size={12} />{sel.loop ? "Sim" : "Não"}</button>
              </Field>

              <Field label="Data início"><input type="date" value={sel.dateStart} onChange={e => updItem(sel.id, { dateStart: e.target.value })} className="inp" /></Field>
              <Field label="Data fim"><input type="date" value={sel.dateEnd} onChange={e => updItem(sel.id, { dateEnd: e.target.value })} className="inp" /></Field>
              <Field label="Hora entra"><input type="time" value={sel.timeStart} onChange={e => updItem(sel.id, { timeStart: e.target.value })} className="inp" /></Field>
              <Field label="Hora sai"><input type="time" value={sel.timeEnd} onChange={e => updItem(sel.id, { timeEnd: e.target.value })} className="inp" /></Field>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Dias da semana</div>
              <div className="flex gap-1.5">
                {DAYS.map((d, idx) => (
                  <button key={d} onClick={() => { const days = [...sel.days]; days[idx] = !days[idx]; updItem(sel.id, { days }); }}
                    className={`h-8 w-11 rounded text-[11px] font-medium ${sel.days[idx] ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-500"}`}>{d}</button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-slate-800/50 p-3 text-[11px] text-slate-400">
              <span className="text-slate-300">Resumo:</span> exibe por <span className="font-mono text-amber-300">{sel.duration}s</span>, prioridade <span className="font-mono text-amber-300">{sel.priority}</span>,
              das <span className="font-mono text-amber-300">{sel.timeStart}</span> às <span className="font-mono text-amber-300">{sel.timeEnd}</span>
              {sel.dateStart && <> a partir de <span className="font-mono text-amber-300">{sel.dateStart}</span></>}
              {sel.dateEnd && <> até <span className="font-mono text-amber-300">{sel.dateEnd}</span></>}, nos dias {DAYS.filter((_, i) => sel.days[i]).join(", ") || "—"}.
            </div>
          </section>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-500">Selecione um item da playlist para configurar entrada e saída.</div>
        )}

        <style>{`.inp{width:100%;border-radius:.375rem;border:1px solid #334155;background:#1e293b;padding:.35rem .5rem;color:#e2e8f0;font-size:11px}.field-label{font-size:9px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-bottom:.25rem;display:block}`}</style>
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return <div><span className="field-label">{label}</span>{children}</div>;
}
