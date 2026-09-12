import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  MousePointer2, Pencil, Eraser, Minus, Square, Type, Image as ImageIcon,
  Trash2, Copy, ChevronUp, ChevronDown, ChevronRight, Layers, ZoomIn, ZoomOut,
  Grid3x3, Ruler, Play, Pause, Plus, Radio, Calendar, Clock, Save,
  ArrowRight, ArrowLeft, ArrowDown, ArrowUpRight, X, AlertTriangle, Circle,
  Palette, Eye, Repeat, Zap,
  LayoutDashboard, Map as MapIcon, Activity, BellRing, MonitorSmartphone,
  Users2, Boxes, Library, Send, AlertOctagon, ScrollText, FileBarChart,
  Search, Wifi, WifiOff, Wrench, TriangleAlert, Thermometer, Cpu, HardDrive,
  MemoryStick, Signal, MapPin, XCircle, Download, CheckCircle2, RotateCw,
  Filter, Shield, KeyRound, Gauge, RefreshCw, Power, FileText,
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

function EditorModule({ onBack, seed }) {
  const [tab, setTab] = useState("editor");
  const [panel, setPanel] = useState({ w: 96, h: 48, mode: "amber" });
  const [objects, setObjects] = useState(() => seed?.objects || (seed?.text ? [{ id: uid(), type: "text", x: 3, y: 3, text: seed.text, color: "#FFB000", font: "led5x7", size: 10, bold: false }] : []));
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
  const [scheduleName, setScheduleName] = useState(seed?.name || "");
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
    { id: "shape:x", icon: X, label: "Faixa fechada" },
    { id: "shape:warn", icon: AlertTriangle, label: "Atenção" },
    { id: "shape:circle", icon: Circle, label: "Círculo" },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-slate-950 font-sans text-slate-200" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
                <button onClick={onBack} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[12px] text-slate-300 hover:bg-slate-800"><ChevronRight size={14} className="rotate-180" />Voltar ao NOC</button>
        <div className="flex items-center gap-2">
          <Palette size={15} className="text-amber-400" />
          <input value={scheduleName} onChange={e => setScheduleName(e.target.value)} placeholder="Nome da mensagem" className="w-56 rounded border border-slate-700 bg-slate-800/60 px-2 py-1 text-[13px] font-medium text-slate-100 placeholder:text-slate-600" />
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


/* ============================================================
   PMV NOC — Central de Operações de Painéis de Mensagem Variável
   Suite: NovaStar TB · VNNOX · (preparado p/ JT, NTCIP, MQTT, WebSocket)
   ============================================================ */

const C = {
  online:  { key: "online",  label: "Online",     color: "#22C55E", ring: "ring-emerald-500/40", text: "text-emerald-400", bg: "bg-emerald-500/10", Icon: Wifi },
  alerta:  { key: "alerta",  label: "Alerta",     color: "#F59E0B", ring: "ring-amber-500/40",   text: "text-amber-400",   bg: "bg-amber-500/10",   Icon: TriangleAlert },
  offline: { key: "offline", label: "Offline",    color: "#EF4444", ring: "ring-red-500/40",     text: "text-red-400",     bg: "bg-red-500/10",     Icon: WifiOff },
  manut:   { key: "manut",   label: "Manutenção", color: "#94A3B8", ring: "ring-slate-500/40",   text: "text-slate-400",   bg: "bg-slate-500/10",   Icon: Wrench },
};

// ---------------- Mock data ----------------
const rnd = (a, b) => Math.round(a + Math.random() * (b - a));
const now = () => new Date();
const ago = (min) => new Date(Date.now() - min * 60000);
const fmt = (d) => d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const fmtT = (d) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const PMVS = [
  { id: "PMV-001", nome: "Av. Torquato Tapajós", status: "online", cidade: "Manaus", uf: "AM", lat: -3.0385, lng: -60.0200, endereco: "Av. Torquato Tapajós, 5000 - Flores", cliente: "SMTU Manaus", grupo: "Zona Norte", modelo: "LED P10 Outdoor", pitch: 10, res: "96×48", ctrl: "NovaStar TB40", serie: "TB40-A1X7734", fw: "V3.6.2", mac: "3C:A1:F4:22:81:0A", imei: "356938035643809", ip: "10.20.1.11", oper: "Vivo", temp: 41, cpu: 22, mem: 48, disco: 61, tensao: 218, rede: 42, sinal: 78, uptime: 812, patrimonio: "PT-100341" },
  { id: "PMV-002", nome: "Ponte Rio Negro", status: "online", cidade: "Manaus", uf: "AM", lat: -3.0620, lng: -60.0980, endereco: "Acesso Ponte Rio Negro - BR-319", cliente: "DER-AM", grupo: "Rodovias", modelo: "LED P16 Rodovia", pitch: 16, res: "128×64", ctrl: "NovaStar TB40", serie: "TB40-A1X7739", fw: "V3.6.2", mac: "3C:A1:F4:22:81:0B", imei: "356938035643810", ip: "10.20.1.12", oper: "Claro", temp: 38, cpu: 18, mem: 44, disco: 55, tensao: 221, rede: 51, sinal: 84, uptime: 1240, patrimonio: "PT-100342" },
  { id: "PMV-003", nome: "BR-174 KM 12", status: "alerta", cidade: "Manaus", uf: "AM", lat: -2.9950, lng: -60.0110, endereco: "BR-174, KM 12 - sentido Boa Vista", cliente: "DNIT", grupo: "Rodovias", modelo: "LED P16 Rodovia", pitch: 16, res: "160×32", ctrl: "NovaStar TB40", serie: "TB40-A1X7742", fw: "V3.4.9", mac: "3C:A1:F4:22:81:0C", imei: "356938035643811", ip: "10.20.1.13", oper: "TIM", temp: 71, cpu: 34, mem: 82, disco: 74, tensao: 205, rede: 22, sinal: 41, uptime: 96, patrimonio: "PT-100343", alerta: "Temperatura alta (71°C)" },
  { id: "PMV-004", nome: "Av. das Torres", status: "offline", cidade: "Manaus", uf: "AM", lat: -3.0490, lng: -59.9720, endereco: "Av. Autaz Mirim, 2200 - Tancredo Neves", cliente: "SMTU Manaus", grupo: "Zona Leste", modelo: "LED P10 Outdoor", pitch: 10, res: "96×48", ctrl: "NovaStar TB40", serie: "TB40-A1X7745", fw: "V3.6.2", mac: "3C:A1:F4:22:81:0D", imei: "356938035643812", ip: "10.20.1.14", oper: "Vivo", temp: 0, cpu: 0, mem: 0, disco: 58, tensao: 0, rede: 0, sinal: 0, uptime: 0, patrimonio: "PT-100344", alerta: "Sem comunicação há 2h14" },
  { id: "PMV-005", nome: "Centro - Eduardo Ribeiro", status: "online", cidade: "Manaus", uf: "AM", lat: -3.1305, lng: -60.0230, endereco: "Av. Eduardo Ribeiro, 520 - Centro", cliente: "SMTU Manaus", grupo: "Centro", modelo: "LED P8 Urbano", pitch: 8, res: "128×64", ctrl: "NovaStar TB40", serie: "TB40-A1X7751", fw: "V3.6.2", mac: "3C:A1:F4:22:81:0E", imei: "356938035643813", ip: "10.20.1.15", oper: "Claro", temp: 44, cpu: 26, mem: 51, disco: 63, tensao: 219, rede: 47, sinal: 80, uptime: 430, patrimonio: "PT-100345" },
  { id: "PMV-006", nome: "Distrito Industrial", status: "manut", cidade: "Manaus", uf: "AM", lat: -3.1180, lng: -59.9450, endereco: "Av. Buriti, 1100 - Distrito Industrial", cliente: "Suframa", grupo: "Zona Leste", modelo: "LED P10 Outdoor", pitch: 10, res: "96×48", ctrl: "NovaStar TB40", serie: "TB40-A1X7758", fw: "V3.6.2", mac: "3C:A1:F4:22:81:0F", imei: "356938035643814", ip: "10.20.1.16", oper: "TIM", temp: 36, cpu: 12, mem: 30, disco: 40, tensao: 220, rede: 38, sinal: 66, uptime: 12, patrimonio: "PT-100346", alerta: "Em manutenção programada" },
  { id: "PMV-007", nome: "AM-010 Rodovia", status: "online", cidade: "Itacoatiara", uf: "AM", lat: -3.1430, lng: -58.4440, endereco: "AM-010, KM 176 - acesso Itacoatiara", cliente: "DER-AM", grupo: "Rodovias", modelo: "LED P16 Rodovia", pitch: 16, res: "160×32", ctrl: "NovaStar TB40", serie: "TB40-A1X7760", fw: "V3.6.2", mac: "3C:A1:F4:22:81:10", imei: "356938035643815", ip: "10.20.1.17", oper: "Vivo", temp: 47, cpu: 29, mem: 55, disco: 67, tensao: 216, rede: 33, sinal: 59, uptime: 980, patrimonio: "PT-100347" },
  { id: "PMV-008", nome: "Entrada Ponta Negra", status: "alerta", cidade: "Manaus", uf: "AM", lat: -3.0870, lng: -60.1010, endereco: "Av. Coronel Teixeira - Ponta Negra", cliente: "SMTU Manaus", grupo: "Zona Oeste", modelo: "LED P8 Urbano", pitch: 8, res: "128×64", ctrl: "NovaStar TB40", serie: "TB40-A1X7763", fw: "V3.6.2", mac: "3C:A1:F4:22:81:11", imei: "356938035643816", ip: "10.20.1.18", oper: "Claro", temp: 49, cpu: 31, mem: 58, disco: 70, tensao: 214, rede: 8, sinal: 18, uptime: 305, patrimonio: "PT-100348", alerta: "Sinal de internet fraco (18%)" },
];

const EVENTS = [
  { t: ago(4), pmv: "PMV-003", tipo: "Alerta", msg: "Temperatura acima do limite (71°C)", crit: "alta" },
  { t: ago(9), pmv: "PMV-005", tipo: "Publicação", msg: "Mensagem 'OBRAS À FRENTE' publicada", crit: "info" },
  { t: ago(14), pmv: "PMV-008", tipo: "Alerta", msg: "Qualidade do sinal degradada", crit: "media" },
  { t: ago(28), pmv: "PMV-004", tipo: "Falha", msg: "Perda de comunicação com a controladora", crit: "alta" },
  { t: ago(46), pmv: "PMV-002", tipo: "Publicação", msg: "Playlist atualizada via API VNNOX", crit: "info" },
  { t: ago(70), pmv: "PMV-001", tipo: "Sistema", msg: "Sincronização de firmware concluída", crit: "info" },
  { t: ago(95), pmv: "PMV-006", tipo: "Manutenção", msg: "Equipamento colocado em manutenção", crit: "info" },
  { t: ago(140), pmv: "PMV-007", tipo: "Publicação", msg: "Campanha 'DIRIJA COM CUIDADO' publicada", crit: "info" },
];

const PUBS = [
  { t: ago(9), pmv: "PMV-005", msg: "OBRAS À FRENTE", autor: "M. Andrade", cat: "Obra", origem: "Editor" },
  { t: ago(46), pmv: "PMV-002", msg: "ACIDENTE KM 8 — REDUZA", autor: "API VNNOX", cat: "Acidente", origem: "API" },
  { t: ago(140), pmv: "PMV-007", msg: "DIRIJA COM CUIDADO", autor: "J. Ribeiro", cat: "Campanha", origem: "Editor" },
  { t: ago(210), pmv: "PMV-001", msg: "TRÂNSITO INTENSO", autor: "M. Andrade", cat: "Congestionamento", origem: "Editor" },
  { t: ago(320), pmv: "PMV-003", msg: "PISTA MOLHADA", autor: "API VNNOX", cat: "Emergência", origem: "API" },
];

const ERRORS = [
  { id: "E-5521", t: ago(4), pmv: "PMV-003", cod: "TEMP_HIGH", desc: "Sensor de temperatura acima de 70°C", crit: "Crítica", origem: "Controladora", status: "aberto" },
  { id: "E-5519", t: ago(28), pmv: "PMV-004", cod: "COMM_LOST", desc: "Timeout de heartbeat > 120s", crit: "Crítica", origem: "Gateway", status: "aberto" },
  { id: "E-5510", t: ago(60), pmv: "PMV-008", cod: "NET_WEAK", desc: "RSSI abaixo de 20%", crit: "Média", origem: "Modem", status: "aberto" },
  { id: "E-5498", t: ago(180), pmv: "PMV-003", cod: "MEM_HIGH", desc: "Uso de memória em 82%", crit: "Média", origem: "Controladora", status: "resolvido" },
  { id: "E-5477", t: ago(1440), pmv: "PMV-002", cod: "SYNC_FAIL", desc: "Falha na sincronização de mídia", crit: "Baixa", origem: "API VNNOX", status: "resolvido" },
];

const LOGS = [
  { t: ago(1), tipo: "API", user: "sistema", msg: "GET /vnnox/players/status — 200 (142ms)", ip: "10.0.0.5" },
  { t: ago(2), tipo: "Publicação", user: "m.andrade", msg: "Publicou 'OBRAS À FRENTE' em PMV-005", ip: "177.32.10.4" },
  { t: ago(4), tipo: "Alerta", user: "sistema", msg: "Disparado alerta TEMP_HIGH em PMV-003", ip: "-" },
  { t: ago(8), tipo: "Login", user: "j.ribeiro", msg: "Autenticação bem-sucedida (2FA)", ip: "189.5.44.1" },
  { t: ago(12), tipo: "Config", user: "admin", msg: "Alterou IP de PMV-006: 10.20.1.9 → 10.20.1.16", ip: "10.0.0.2" },
  { t: ago(18), tipo: "API", user: "sistema", msg: "POST /vnnox/program/publish — 200 (318ms)", ip: "10.0.0.5" },
  { t: ago(25), tipo: "Exclusão", user: "supervisor", msg: "Removeu mensagem 'EVENTO ENCERRADO' da biblioteca", ip: "177.32.10.9" },
];

const AUDIT = [
  { t: ago(12), user: "admin", acao: "Alteração de IP", pmv: "PMV-006", antes: "10.20.1.9", depois: "10.20.1.16", ip: "10.0.0.2" },
  { t: ago(90), user: "supervisor", acao: "Troca de responsável", pmv: "PMV-003", antes: "Equipe A", depois: "Equipe B", ip: "177.32.10.9" },
  { t: ago(300), user: "admin", acao: "Atualização firmware", pmv: "PMV-001", antes: "V3.4.9", depois: "V3.6.2", ip: "10.0.0.2" },
];

const MSGS = [
  { nome: "OBRAS À FRENTE", cat: "Obra", prio: "Alta", tempo: 10, autor: "M. Andrade", data: ago(9), ver: 3 },
  { nome: "ACIDENTE — REDUZA", cat: "Acidente", prio: "Máxima", tempo: 12, autor: "API VNNOX", data: ago(46), ver: 5 },
  { nome: "DIRIJA COM CUIDADO", cat: "Campanha", prio: "Baixa", tempo: 8, autor: "J. Ribeiro", data: ago(140), ver: 2 },
  { nome: "TRÂNSITO INTENSO", cat: "Congestionamento", prio: "Média", tempo: 8, autor: "M. Andrade", data: ago(210), ver: 4 },
  { nome: "PISTA MOLHADA", cat: "Emergência", prio: "Alta", tempo: 10, autor: "Sistema", data: ago(320), ver: 1 },
  { nome: "BEM-VINDO A MANAUS", cat: "Institucional", prio: "Baixa", tempo: 15, autor: "SMTU", data: ago(2000), ver: 1 },
];

const USERS = [
  { nome: "Carlos Menezes", email: "admin@pmv.am.gov.br", papel: "Administrador", grupos: "Todos", fa: true, ativo: true },
  { nome: "Marta Andrade", email: "m.andrade@smtu.am", papel: "Supervisor", grupos: "Manaus", fa: true, ativo: true },
  { nome: "João Ribeiro", email: "j.ribeiro@smtu.am", papel: "Operador", grupos: "Zona Norte, Centro", fa: false, ativo: true },
  { nome: "Equipe Campo AM", email: "campo@der.am", papel: "Técnico", grupos: "Rodovias", fa: true, ativo: true },
  { nome: "DNIT Amazonas", email: "portal@dnit.gov.br", papel: "Cliente", grupos: "BR-174", fa: false, ativo: false },
];

const ROLE_PERMS = {
  Administrador: ["Controle total", "Usuários", "Configurações", "Publicação", "Relatórios"],
  Supervisor: ["Equipamentos", "Publicações", "Relatórios", "Usuários"],
  Operador: ["Publica mensagens", "Visualiza equipamentos"],
  Técnico: ["Dados técnicos", "Logs", "Firmware", "Diagnóstico"],
  Cliente: ["Visualiza próprios PMVs", "Publica em autorizados"],
};

const GROUPS = [
  { nome: "Zona Norte", membros: ["PMV-001"], cor: "#22A7F0" },
  { nome: "Rodovias", membros: ["PMV-002", "PMV-003", "PMV-007"], cor: "#FFB000" },
  { nome: "Centro", membros: ["PMV-005"], cor: "#B026FF" },
  { nome: "Zona Leste", membros: ["PMV-004", "PMV-006"], cor: "#2ECC71" },
  { nome: "Zona Oeste", membros: ["PMV-008"], cor: "#FF7A00" },
];

const availSeries = Array.from({ length: 24 }, (_, i) => ({ h: `${i}h`, disp: 92 + Math.round(Math.sin(i / 3) * 4) + (i > 18 ? -3 : 0) }));
const pubBar = PMVS.map(p => ({ name: p.id.replace("PMV-", ""), pub: rnd(4, 40) }));
const errBar = PMVS.map(p => ({ name: p.id.replace("PMV-", ""), err: p.status === "online" ? rnd(0, 2) : rnd(2, 9) }));

// ---------------- shared UI ----------------
const cx = (...a) => a.filter(Boolean).join(" ");

function StatusDot({ s, size = 8 }) {
  const c = C[s];
  return <span className="inline-block rounded-full" style={{ width: size, height: size, background: c.color, boxShadow: `0 0 6px ${c.color}` }} />;
}
function StatusBadge({ s }) {
  const c = C[s];
  return <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium", c.bg, c.text)}><StatusDot s={s} size={6} />{c.label}</span>;
}
function Card({ title, right, children, className }) {
  return (
    <div className={cx("rounded-xl border border-slate-800 bg-slate-900/50", className)}>
      {title && <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5"><h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</h3>{right}</div>}
      {children}
    </div>
  );
}
function Stat({ label, value, sub, icon: Icon, tone = "slate" }) {
  const tones = { slate: "text-slate-300", emerald: "text-emerald-400", amber: "text-amber-400", red: "text-red-400", sky: "text-sky-400" };
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</span>
        {Icon && <Icon size={15} className={tones[tone]} />}
      </div>
      <div className={cx("mt-2 font-mono text-2xl font-semibold", tones[tone])}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}
const chartAxis = { stroke: "#475569", fontSize: 10, tickLine: false };
const tooltipStyle = { contentStyle: { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 11 }, labelStyle: { color: "#cbd5e1" } };

function downloadCSV(name, rows) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
}

// ================= APP =================
export default function App() {
  const [view, setView] = useState("dashboard");
  const [openPmv, setOpenPmv] = useState(null);
  const [editorSeed, setEditorSeed] = useState(null);
  const [editorReturn, setEditorReturn] = useState("dashboard");
  const [editorKey, setEditorKey] = useState(0);
  const openEditor = (seed, from = "biblioteca") => { setEditorSeed(seed || null); setEditorReturn(from || "dashboard"); setEditorKey(k => k + 1); setView("editor"); };
  const [clock, setClock] = useState(now());
  useEffect(() => { const t = setInterval(() => setClock(now()), 1000); return () => clearInterval(t); }, []);

  const counts = useMemo(() => {
    const c = { online: 0, alerta: 0, offline: 0, manut: 0 };
    PMVS.forEach(p => c[p.status]++); return c;
  }, []);

  const nav = [
    { sec: "Operação", items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "mapa", label: "Mapa geral", icon: MapIcon },
      { id: "monitor", label: "Monitoramento", icon: Activity },
      { id: "alertas", label: "Central de alertas", icon: BellRing, badge: counts.alerta + counts.offline },
    ]},
    { sec: "Equipamentos", items: [
      { id: "equip", label: "Equipamentos", icon: MonitorSmartphone },
      { id: "grupos", label: "Grupos", icon: Boxes },
    ]},
    { sec: "Conteúdo", items: [
      { id: "editor", label: "Editor de conteúdo", icon: Palette },
      { id: "biblioteca", label: "Biblioteca", icon: Library },
      { id: "publicar", label: "Publicação & fila", icon: Send },
    ]},
    { sec: "Registros", items: [
      { id: "erros", label: "Histórico de erros", icon: AlertOctagon, badge: ERRORS.filter(e => e.status === "aberto").length },
      { id: "logs", label: "Logs & auditoria", icon: ScrollText },
      { id: "relatorios", label: "Relatórios", icon: FileBarChart },
    ]},
    { sec: "Sistema", items: [
      { id: "usuarios", label: "Usuários & acesso", icon: Users2 },
      { id: "api", label: "API VNNOX", icon: Radio },
    ]},
  ];

  const goDevice = (id) => { setOpenPmv(id); setView("device"); };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900/70">
        <div className="flex items-center gap-2.5 border-b border-slate-800 px-4 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400"><MonitorSmartphone size={17} /></div>
          <div><div className="text-sm font-bold tracking-tight text-slate-100">PMV NOC</div><div className="text-[9px] uppercase tracking-widest text-slate-500">Central de operações</div></div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          {nav.map(g => (
            <div key={g.sec} className="mb-3">
              <div className="px-2 pb-1 text-[9px] font-semibold uppercase tracking-widest text-slate-600">{g.sec}</div>
              {g.items.map(it => (
                <button key={it.id} onClick={() => it.id === "editor" ? openEditor(null, view) : setView(it.id)}
                  className={cx("mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                    view === it.id ? "bg-amber-500/15 font-medium text-amber-300" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200")}>
                  <it.icon size={16} className="shrink-0" />
                  <span className="flex-1 text-left">{it.label}</span>
                  {it.badge > 0 && <span className="rounded-full bg-red-500/20 px-1.5 text-[10px] font-semibold text-red-400">{it.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-2.5 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-slate-950">CM</div>
            <div className="min-w-0 flex-1"><div className="truncate text-[12px] font-medium text-slate-200">Carlos Menezes</div><div className="text-[10px] text-slate-500">Administrador</div></div>
            <Shield size={13} className="text-emerald-400" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-800 bg-slate-900/50 px-5 py-2.5">
          <div className="relative w-72">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input placeholder="Buscar PMV, código, cidade…" className="w-full rounded-lg border border-slate-800 bg-slate-800/50 py-1.5 pl-8 pr-3 text-[12px] text-slate-200 placeholder:text-slate-600 focus:border-amber-500/40 focus:outline-none" />
          </div>
          <div className="ml-auto flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-2.5 py-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /><span className="text-slate-400">VNNOX conectado</span></span>
            <span className="flex items-center gap-1.5 font-mono text-slate-400"><Clock size={13} />{fmtT(clock)}</span>
          </div>
        </header>

        {view === "editor" ? (
          <EditorModule key={editorKey} seed={editorSeed} onBack={() => setView(editorReturn)} />
        ) : (
        <main className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#0c1118_0%,#020408_100%)] p-5">
          {view === "dashboard" && <Dashboard counts={counts} onOpen={goDevice} />}
          {view === "mapa" && <MapView onOpen={goDevice} />}
          {view === "monitor" && <Monitor onOpen={goDevice} />}
          {view === "alertas" && <Alertas onOpen={goDevice} />}
          {view === "equip" && <Equipamentos onOpen={goDevice} />}
          {view === "device" && <Device id={openPmv} onBack={() => setView("equip")} onEdit={openEditor} />}
          {view === "grupos" && <Grupos />}
          {view === "biblioteca" && <Biblioteca onEdit={openEditor} />}
          {view === "publicar" && <Publicar onOpen={goDevice} onEdit={openEditor} />}
          {view === "erros" && <Erros onOpen={goDevice} />}
          {view === "logs" && <Logs />}
          {view === "relatorios" && <Relatorios />}
          {view === "usuarios" && <Usuarios />}
          {view === "api" && <ApiConsole />}
        </main>
        )}
      </div>
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard({ counts, onOpen }) {
  return (
    <div className="space-y-4">
      <PageTitle title="Dashboard operacional" sub="Visão geral em tempo real da malha de PMVs" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total de PMVs" value={PMVS.length} icon={MonitorSmartphone} />
        <Stat label="Online" value={counts.online} tone="emerald" icon={Wifi} />
        <Stat label="Em alerta" value={counts.alerta} tone="amber" icon={TriangleAlert} />
        <Stat label="Offline" value={counts.offline} tone="red" icon={WifiOff} />
        <Stat label="Manutenção" value={counts.manut} tone="slate" icon={Wrench} />
        <Stat label="Mensagens ativas" value={PMVS.filter(p => p.status === "online").length + 3} tone="sky" sub="publicações vigentes" icon={Send} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Disponibilidade dos equipamentos (24h)" className="lg:col-span-2">
          <div className="h-56 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={availSeries}>
                <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="h" {...chartAxis} interval={3} />
                <YAxis domain={[80, 100]} {...chartAxis} unit="%" />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="disp" stroke="#22C55E" fill="url(#g1)" strokeWidth={2} name="Disponibilidade" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Uso da plataforma">
          <div className="grid grid-cols-2 gap-3 p-4">
            {[["Publicações hoje", 128, "sky"], ["Comandos API", 942, "amber"], ["Uptime médio", "99,2%", "emerald"], ["Tempo resp. médio", "184ms", "slate"]].map(([l, v, t]) => (
              <div key={l} className="rounded-lg bg-slate-800/40 p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{l}</div>
                <div className={cx("mt-1 font-mono text-lg font-semibold", { sky: "text-sky-400", amber: "text-amber-400", emerald: "text-emerald-400", slate: "text-slate-200" }[t])}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Publicações por equipamento">
          <div className="h-44 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pubBar}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="name" {...chartAxis} /><YAxis {...chartAxis} /><Tooltip {...tooltipStyle} /><Bar dataKey="pub" fill="#FFB000" radius={[3, 3, 0, 0]} name="Publicações" /></BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Erros por equipamento">
          <div className="h-44 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errBar}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="name" {...chartAxis} /><YAxis {...chartAxis} /><Tooltip {...tooltipStyle} /><Bar dataKey="err" fill="#EF4444" radius={[3, 3, 0, 0]} name="Erros" /></BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Alertas recentes" right={<span className="text-[10px] text-red-400">{ERRORS.filter(e => e.status === "aberto").length} abertos</span>}>
          <div className="divide-y divide-slate-800/60">
            {EVENTS.filter(e => e.tipo === "Alerta" || e.tipo === "Falha").map((e, i) => (
              <button key={i} onClick={() => onOpen(e.pmv)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800/40">
                <TriangleAlert size={15} className={e.crit === "alta" ? "text-red-400" : "text-amber-400"} />
                <div className="min-w-0 flex-1"><div className="truncate text-[12px] text-slate-200">{e.msg}</div><div className="text-[10px] text-slate-500">{e.pmv} · {fmt(e.t)}</div></div>
                <ChevronRight size={14} className="text-slate-600" />
              </button>
            ))}
          </div>
        </Card>
        <Card title="Últimas publicações">
          <div className="divide-y divide-slate-800/60">
            {PUBS.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <Send size={14} className="text-sky-400" />
                <div className="min-w-0 flex-1"><div className="truncate font-mono text-[12px] text-slate-200">{p.msg}</div><div className="text-[10px] text-slate-500">{p.pmv} · {p.autor} · {fmt(p.t)}</div></div>
                <span className={cx("rounded px-1.5 py-0.5 text-[9px]", p.origem === "API" ? "bg-sky-500/15 text-sky-300" : "bg-slate-700 text-slate-300")}>{p.origem}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Eventos das últimas 24 horas">
        <div className="divide-y divide-slate-800/60">
          {EVENTS.map((e, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2 text-[12px]">
              <span className="w-16 font-mono text-[10px] text-slate-500">{fmtT(e.t).slice(0, 5)}</span>
              <span className={cx("w-24 rounded px-1.5 py-0.5 text-center text-[10px]",
                e.tipo === "Alerta" || e.tipo === "Falha" ? "bg-red-500/10 text-red-400" : e.tipo === "Publicação" ? "bg-sky-500/10 text-sky-400" : "bg-slate-700/50 text-slate-400")}>{e.tipo}</span>
              <button onClick={() => onOpen(e.pmv)} className="font-mono text-[11px] text-amber-400/80 hover:underline">{e.pmv}</button>
              <span className="flex-1 truncate text-slate-300">{e.msg}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- MAPA ---------------- */
function MapView({ onOpen }) {
  const [sel, setSel] = useState(null);
  const bounds = { minLat: -3.20, maxLat: -2.95, minLng: -60.15, maxLng: -58.40 };
  const px = (p) => ({
    x: ((p.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100,
    y: (1 - (p.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100,
  });
  const p = PMVS.find(x => x.id === sel);
  return (
    <div className="space-y-4">
      <PageTitle title="Mapa geral" sub="Georreferenciamento da malha — Manaus e região metropolitana" />
      <div className="flex gap-4">
        <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-900" style={{ height: 560 }}>
          {/* schematic map */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs><pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M6 0H0V6" fill="none" stroke="#131b26" strokeWidth="0.3" /></pattern></defs>
            <rect width="100" height="100" fill="#0a0f16" /><rect width="100" height="100" fill="url(#grid)" />
            <path d="M-2 62 C 20 55, 35 72, 55 60 S 85 50, 102 58 L102 102 L-2 102 Z" fill="#0d2436" opacity="0.6" />
            <path d="M-2 62 C 20 55, 35 72, 55 60 S 85 50, 102 58" fill="none" stroke="#1b4d6b" strokeWidth="0.6" />
            <text x="8" y="70" fill="#2b5a78" fontSize="2.4" fontFamily="monospace">RIO NEGRO / SOLIMÕES</text>
            {["BR-174", "AM-010", "BR-319"].map((r, i) => (
              <text key={r} x={20 + i * 26} y={12 + i * 3} fill="#243546" fontSize="2" fontFamily="monospace">{r}</text>
            ))}
          </svg>
          {PMVS.map(pmv => {
            const pos = px(pmv); const c = C[pmv.status];
            return (
              <button key={pmv.id} onClick={() => setSel(pmv.id)} title={pmv.nome}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
                <span className="relative flex items-center justify-center">
                  {pmv.status !== "manut" && <span className="absolute h-6 w-6 animate-ping rounded-full opacity-30" style={{ background: c.color }} />}
                  <MapPin size={26} style={{ color: c.color, filter: `drop-shadow(0 0 4px ${c.color})` }} fill={sel === pmv.id ? c.color : "transparent"} strokeWidth={2} />
                </span>
              </button>
            );
          })}
          {/* legend */}
          <div className="absolute bottom-3 left-3 flex gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2 text-[10px]">
            {Object.values(C).map(c => <span key={c.key} className="flex items-center gap-1.5"><StatusDot s={c.key} size={7} />{c.label}</span>)}
          </div>
        </div>

        {/* side panel */}
        {p ? (
          <div className="w-80 shrink-0 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/70" style={{ maxHeight: 560 }}>
            <div className="flex items-start justify-between border-b border-slate-800 p-4">
              <div><div className="flex items-center gap-2"><StatusBadge s={p.status} /></div><h3 className="mt-1.5 text-base font-semibold text-slate-100">{p.nome}</h3><div className="font-mono text-[11px] text-slate-500">{p.id}</div></div>
              <button onClick={() => setSel(null)} className="rounded p-1 text-slate-500 hover:bg-slate-800"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 text-[11px]">
              {[["Endereço", p.endereco, true], ["Cidade", p.cidade], ["Estado", p.uf], ["Latitude", p.lat], ["Longitude", p.lng], ["Modelo", p.modelo, true], ["Nº série", p.serie], ["Firmware", p.fw], ["Controladora", p.ctrl, true], ["Resolução", p.res], ["IP", p.ip], ["Operadora", p.oper], ["Temperatura", p.status === "offline" ? "—" : `${p.temp}°C`], ["Memória", p.status === "offline" ? "—" : `${p.mem}%`], ["Sinal", p.status === "offline" ? "—" : `${p.sinal}%`], ["Uptime", p.status === "offline" ? "—" : `${Math.floor(p.uptime / 24)}d ${p.uptime % 24}h`]].map(([k, v, full], i) => (
                <div key={i} className={full ? "col-span-2" : ""}><div className="text-[9px] uppercase tracking-wider text-slate-500">{k}</div><div className="mt-0.5 font-mono text-slate-200">{v}</div></div>
              ))}
            </div>
            <div className="border-t border-slate-800 p-3">
              <button onClick={() => onOpen(p.id)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-[12px] font-semibold text-slate-950 hover:bg-amber-400">Abrir equipamento <ArrowUpRight size={14} /></button>
            </div>
          </div>
        ) : (
          <div className="flex w-80 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-800 text-center text-[12px] text-slate-600" style={{ maxHeight: 560 }}>Selecione um PMV no mapa<br />para ver os detalhes</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- MONITORAMENTO ---------------- */
function Monitor({ onOpen }) {
  const [live, setLive] = useState(PMVS.map(p => ({ ...p })));
  const [flt, setFlt] = useState("todos");
  useEffect(() => {
    const t = setInterval(() => setLive(v => v.map(p => p.status === "offline" ? p : ({ ...p, temp: clampN(p.temp + rnd(-2, 2), 30, 78), cpu: clampN(p.cpu + rnd(-4, 4), 5, 60), sinal: clampN(p.sinal + rnd(-3, 3), 5, 99), rede: clampN(p.rede + rnd(-3, 3), 2, 70) }))), 2000);
    return () => clearInterval(t);
  }, []);
  const list = flt === "todos" ? live : live.filter(p => p.status === flt);
  return (
    <div className="space-y-4">
      <PageTitle title="Monitoramento em tempo real" sub="Atualização automática a cada 2s · WebSocket ativo" right={<span className="flex items-center gap-1.5 text-[11px] text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />AO VIVO</span>} />
      <div className="flex gap-1.5">
        {["todos", "online", "alerta", "offline", "manut"].map(f => (
          <button key={f} onClick={() => setFlt(f)} className={cx("rounded-lg border px-3 py-1.5 text-[11px] capitalize", flt === f ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-slate-800 text-slate-400 hover:bg-slate-800/50")}>{f === "manut" ? "Manutenção" : f}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map(p => (
          <button key={p.id} onClick={() => onOpen(p.id)} className={cx("rounded-xl border bg-slate-900/60 p-4 text-left ring-1 transition-colors hover:bg-slate-800/50", `border-slate-800 ${C[p.status].ring}`)}>
            <div className="flex items-center justify-between">
              <div><div className="text-[13px] font-semibold text-slate-100">{p.nome}</div><div className="font-mono text-[10px] text-slate-500">{p.id} · {p.cidade}</div></div>
              <StatusBadge s={p.status} />
            </div>
            {p.status === "offline" ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/5 px-3 py-2 text-[11px] text-red-400"><WifiOff size={14} />{p.alerta}</div>
            ) : (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[[Thermometer, `${p.temp}°`, p.temp > 65 ? "text-red-400" : "text-slate-300"], [Cpu, `${p.cpu}%`, "text-slate-300"], [MemoryStick, `${p.mem}%`, p.mem > 75 ? "text-amber-400" : "text-slate-300"], [Signal, `${p.sinal}%`, p.sinal < 30 ? "text-amber-400" : "text-slate-300"]].map(([Ic, v, t], i) => (
                  <div key={i} className="rounded-lg bg-slate-800/40 p-2 text-center"><Ic size={13} className="mx-auto text-slate-500" /><div className={cx("mt-1 font-mono text-[12px]", t)}>{v}</div></div>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------- ALERTAS ---------------- */
function Alertas({ onOpen }) {
  const alerts = [
    { pmv: "PMV-003", tipo: "Temperatura alta", desc: "71°C — acima do limite de 65°C", crit: "Crítica", t: ago(4), icon: Thermometer },
    { pmv: "PMV-004", tipo: "Offline", desc: "Sem comunicação há 2h14min", crit: "Crítica", t: ago(28), icon: WifiOff },
    { pmv: "PMV-008", tipo: "Sem internet", desc: "Sinal em 18% — instável", crit: "Média", t: ago(14), icon: Signal },
    { pmv: "PMV-003", tipo: "Baixa memória", desc: "Uso de memória em 82%", crit: "Média", t: ago(50), icon: MemoryStick },
    { pmv: "PMV-003", tipo: "Firmware antigo", desc: "V3.4.9 (atual: V3.6.2)", crit: "Baixa", t: ago(200), icon: RotateCw },
    { pmv: "PMV-002", tipo: "Falha de sincronização", desc: "Mídia não confirmada pela controladora", crit: "Baixa", t: ago(300), icon: RefreshCw },
  ];
  const critColor = { "Crítica": "text-red-400 bg-red-500/10", "Média": "text-amber-400 bg-amber-500/10", "Baixa": "text-slate-400 bg-slate-500/10" };
  return (
    <div className="space-y-4">
      <PageTitle title="Central de alertas" sub="Disparos automáticos por telemetria e regras de operação" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Críticos" value={alerts.filter(a => a.crit === "Crítica").length} tone="red" icon={AlertOctagon} />
        <Stat label="Médios" value={alerts.filter(a => a.crit === "Média").length} tone="amber" icon={TriangleAlert} />
        <Stat label="Baixos" value={alerts.filter(a => a.crit === "Baixa").length} tone="slate" icon={BellRing} />
        <Stat label="Resolvidos hoje" value={7} tone="emerald" icon={CheckCircle2} />
      </div>
      <Card title="Alertas ativos">
        <div className="divide-y divide-slate-800/60">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <a.icon size={17} className={critColor[a.crit].split(" ")[0]} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="text-[13px] font-medium text-slate-100">{a.tipo}</span><button onClick={() => onOpen(a.pmv)} className="font-mono text-[10px] text-amber-400/80 hover:underline">{a.pmv}</button></div>
                <div className="text-[11px] text-slate-500">{a.desc} · {fmt(a.t)}</div>
              </div>
              <span className={cx("rounded-full px-2 py-0.5 text-[10px] font-medium", critColor[a.crit])}>{a.crit}</span>
              <button className="rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-800">Reconhecer</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- EQUIPAMENTOS / CADASTRO ---------------- */
function Equipamentos({ onOpen }) {
  const [novo, setNovo] = useState(false);
  return (
    <div className="space-y-4">
      <PageTitle title="Equipamentos" sub={`${PMVS.length} PMVs cadastrados`} right={<button onClick={() => setNovo(true)} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[12px] font-semibold text-slate-950 hover:bg-amber-400"><Plus size={14} />Novo PMV</button>} />
      {novo && <CadastroForm onClose={() => setNovo(false)} />}
      <Card>
        <table className="w-full text-[12px]">
          <thead><tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">
            {["Código", "Nome", "Cidade", "Cliente", "Controladora", "Resolução", "Status", "Última com.", ""].map(h => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-800/60">
            {PMVS.map(p => (
              <tr key={p.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-2.5 font-mono text-amber-400/80">{p.id}</td>
                <td className="px-4 py-2.5 text-slate-200">{p.nome}</td>
                <td className="px-4 py-2.5 text-slate-400">{p.cidade}/{p.uf}</td>
                <td className="px-4 py-2.5 text-slate-400">{p.cliente}</td>
                <td className="px-4 py-2.5 text-slate-400">{p.ctrl}</td>
                <td className="px-4 py-2.5 font-mono text-slate-400">{p.res}</td>
                <td className="px-4 py-2.5"><StatusBadge s={p.status} /></td>
                <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">{p.status === "offline" ? "há 2h14" : "agora"}</td>
                <td className="px-4 py-2.5"><button onClick={() => onOpen(p.id)} className="rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-800">Abrir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function CadastroForm({ onClose }) {
  const groups = [
    ["Identificação", ["Nome", "Código", "Descrição", "Cliente", "Patrimônio"]],
    ["Localização", ["Cidade", "Estado", "Endereço", "Latitude", "Longitude", "Equipe responsável"]],
    ["Painel", ["Modelo do painel", "Pitch (mm)", "Largura (px)", "Altura (px)", "Resolução"]],
    ["Controladora & rede", ["Controladora", "Número de série", "MAC Address", "IMEI", "IP", "Operadora", "SIM Card"]],
  ];
  return (
    <Card title="Cadastro de PMV" right={<button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>}>
      <div className="space-y-5 p-4">
        {groups.map(([sec, fields]) => (
          <div key={sec}>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-500/70">{sec}</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {fields.map(f => (
                <label key={f} className="block"><span className="mb-1 block text-[10px] text-slate-500">{f}</span><input className="w-full rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1.5 text-[12px] text-slate-200 focus:border-amber-500/40 focus:outline-none" /></label>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-500/70">Anexos</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {["Fotos do local", "Foto do painel", "Documentos", "Manual", "Projeto elétrico"].map(a => (
              <button key={a} className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-slate-700 py-4 text-[11px] text-slate-500 hover:border-amber-500/40 hover:text-slate-300"><Plus size={16} />{a}</button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
          <button onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 text-[12px] text-slate-300 hover:bg-slate-800">Cancelar</button>
          <button onClick={onClose} className="rounded-lg bg-amber-500 px-4 py-2 text-[12px] font-semibold text-slate-950 hover:bg-amber-400">Salvar cadastro</button>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- TELA DO EQUIPAMENTO ---------------- */
function Device({ id, onBack, onEdit }) {
  const p = PMVS.find(x => x.id === id) || PMVS[0];
  const [tel, setTel] = useState({ cpu: p.cpu, mem: p.mem, temp: p.temp, tensao: p.tensao, rede: p.rede, sinal: p.sinal });
  const [hist, setHist] = useState(Array.from({ length: 20 }, (_, i) => ({ t: i, cpu: p.cpu + rnd(-6, 6), temp: p.temp + rnd(-3, 3) })));
  useEffect(() => {
    if (p.status === "offline") return;
    const t = setInterval(() => {
      setTel(v => ({ cpu: clampN(v.cpu + rnd(-5, 5), 5, 60), mem: p.mem, temp: clampN(v.temp + rnd(-2, 2), 30, 78), tensao: p.tensao, rede: clampN(v.rede + rnd(-4, 4), 2, 70), sinal: clampN(v.sinal + rnd(-3, 3), 5, 99) }));
      setHist(h => [...h.slice(1), { t: h[h.length - 1].t + 1, cpu: clampN(p.cpu + rnd(-8, 8), 5, 60), temp: clampN(p.temp + rnd(-4, 4), 30, 78) }]);
    }, 1500);
    return () => clearInterval(t);
  }, [id]);
  const off = p.status === "offline";
  const T = ({ icon: Ic, label, val, unit, warn }) => (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
      <div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span><Ic size={14} className="text-slate-500" /></div>
      <div className={cx("mt-1.5 font-mono text-xl font-semibold", warn ? "text-red-400" : "text-slate-200")}>{off ? "—" : val}<span className="ml-0.5 text-[11px] text-slate-500">{off ? "" : unit}</span></div>
    </div>
  );
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-200"><ChevronRight size={14} className="rotate-180" />Voltar aos equipamentos</button>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center gap-3">
          <div className={cx("flex h-11 w-11 items-center justify-center rounded-lg", C[p.status].bg)}><MonitorSmartphone size={22} className={C[p.status].text} /></div>
          <div><div className="flex items-center gap-2"><h2 className="text-lg font-semibold text-slate-100">{p.nome}</h2><StatusBadge s={p.status} /></div><div className="font-mono text-[11px] text-slate-500">{p.id} · {p.ctrl} · {p.res} · {p.endereco}</div></div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-[12px] text-slate-300 hover:bg-slate-800"><Power size={13} />Reiniciar</button>
          <button onClick={() => onEdit(null, "device")} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-[12px] font-semibold text-slate-950 hover:bg-amber-400"><Send size={13} />Publicar mensagem</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        <T icon={Cpu} label="CPU" val={tel.cpu} unit="%" />
        <T icon={MemoryStick} label="Memória" val={tel.mem} unit="%" warn={tel.mem > 75} />
        <T icon={HardDrive} label="Armazenamento" val={p.disco} unit="%" />
        <T icon={Thermometer} label="Temperatura" val={tel.temp} unit="°C" warn={tel.temp > 65} />
        <T icon={Zap} label="Tensão" val={tel.tensao} unit="V" />
        <T icon={Signal} label="Sinal" val={tel.sinal} unit="%" warn={tel.sinal < 30} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Telemetria (tempo real)" className="lg:col-span-2">
          <div className="h-52 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hist}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="t" {...chartAxis} /><YAxis {...chartAxis} /><Tooltip {...tooltipStyle} /><Line type="monotone" dataKey="cpu" stroke="#22A7F0" dot={false} strokeWidth={2} name="CPU %" /><Line type="monotone" dataKey="temp" stroke="#EF4444" dot={false} strokeWidth={2} name="Temp °C" /></LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Estado do dispositivo">
          <div className="grid grid-cols-2 gap-3 p-4 text-[11px]">
            {[["Status", off ? "Offline" : "Online"], ["Último heartbeat", off ? "há 2h14" : "há 3s"], ["Velocidade rede", off ? "—" : `${tel.rede} Mbps`], ["Qualidade sinal", off ? "—" : `${tel.sinal}%`], ["Operadora", p.oper], ["IP", p.ip], ["Firmware", p.fw], ["Uptime", off ? "—" : `${Math.floor(p.uptime / 24)}d ${p.uptime % 24}h`], ["Versão SW", "PMV-NOC 2.4.1"], ["Nº série", p.serie]].map(([k, v], i) => (
              <div key={i}><div className="text-[9px] uppercase tracking-wider text-slate-500">{k}</div><div className="mt-0.5 font-mono text-slate-200">{v}</div></div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Últimos erros">
          <div className="divide-y divide-slate-800/60">
            {ERRORS.filter(e => e.pmv === p.id).length ? ERRORS.filter(e => e.pmv === p.id).map(e => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-[12px]"><XCircle size={14} className="text-red-400" /><span className="font-mono text-[10px] text-slate-500">{e.cod}</span><span className="flex-1 text-slate-300">{e.desc}</span><span className="text-[10px] text-slate-500">{fmt(e.t)}</span></div>
            )) : <div className="px-4 py-6 text-center text-[11px] text-slate-600">Nenhum erro registrado</div>}
          </div>
        </Card>
        <Card title="Histórico de publicações">
          <div className="divide-y divide-slate-800/60">
            {PUBS.filter(x => x.pmv === p.id || Math.random() > 0.5).slice(0, 4).map((x, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-[12px]"><Send size={13} className="text-sky-400" /><span className="flex-1 font-mono text-slate-300">{x.msg}</span><span className="text-[10px] text-slate-500">{fmt(x.t)}</span></div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Histórico de firmware"><div className="space-y-2 p-4 text-[11px]">{[["V3.6.2", ago(300)], ["V3.4.9", ago(20000)], ["V3.2.1", ago(60000)]].map(([v, t], i) => (<div key={i} className="flex items-center justify-between"><span className="font-mono text-slate-300">{v}</span><span className="text-slate-500">{fmt(t).split(" ")[0]}</span></div>))}</div></Card>
        <Card title="Reinicializações"><div className="space-y-2 p-4 text-[11px]">{[["Agendada", ago(1400)], ["Manual (admin)", ago(9000)], ["Watchdog", ago(30000)]].map(([v, t], i) => (<div key={i} className="flex items-center justify-between"><span className="text-slate-300">{v}</span><span className="text-slate-500">{fmt(t)}</span></div>))}</div></Card>
        <Card title="Eventos"><div className="space-y-2 p-4 text-[11px]">{EVENTS.filter(e => e.pmv === p.id).slice(0, 4).map((e, i) => (<div key={i} className="flex items-center justify-between gap-2"><span className="truncate text-slate-300">{e.msg}</span><span className="shrink-0 text-slate-500">{fmtT(e.t).slice(0, 5)}</span></div>))}{!EVENTS.filter(e => e.pmv === p.id).length && <div className="text-slate-600">Sem eventos recentes</div>}</div></Card>
      </div>
    </div>
  );
}

/* ---------------- GRUPOS ---------------- */
function Grupos() {
  return (
    <div className="space-y-4">
      <PageTitle title="Grupos" sub="Agrupe PMVs por zona, cliente, rodovia ou critério personalizado" right={<button className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[12px] font-semibold text-slate-950 hover:bg-amber-400"><Plus size={14} />Novo grupo</button>} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map(g => (
          <Card key={g.nome} className="p-4">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded" style={{ background: g.cor }} /><h3 className="text-[14px] font-semibold text-slate-100">{g.nome}</h3><span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{g.membros.length} PMV</span></div>
            <div className="mt-3 space-y-1.5">
              {g.membros.map(m => { const p = PMVS.find(x => x.id === m); return (<div key={m} className="flex items-center gap-2 rounded-lg bg-slate-800/40 px-2.5 py-1.5 text-[12px]"><StatusDot s={p.status} size={7} /><span className="font-mono text-slate-400">{m}</span><span className="truncate text-slate-300">{p.nome}</span></div>); })}
            </div>
            <button className="mt-3 w-full rounded-lg border border-slate-700 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800">Publicar no grupo</button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- EDITOR (link p/ módulo) ---------------- */
function EditorInfo() {
  return (
    <div className="space-y-4">
      <PageTitle title="Editor de conteúdo" sub="Módulo de criação de mensagens LED pixel a pixel" />
      <Card className="p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400"><Palette size={28} /></div>
        <h3 className="mt-4 text-lg font-semibold text-slate-100">Editor LED — módulo dedicado</h3>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-400">O editor completo (grade de pixels, réguas, fontes LED, ferramentas de desenho, placas de alerta, importação de imagem e programação de playlist) roda como aplicação própria: <span className="font-mono text-amber-400/80">EditorPMV.jsx</span>. Cada mensagem criada gera um payload que entra na fila de publicação deste NOC.</p>
        <div className="mx-auto mt-5 grid max-w-lg grid-cols-2 gap-2 text-left text-[11px] md:grid-cols-4">
          {["Grade por pixel", "Fontes LED 5×7", "Setas & placas", "Cores / RGB", "Réguas", "Camadas", "Imagem → LEDs", "Playlist"].map(f => (<div key={f} className="flex items-center gap-1.5 rounded-lg bg-slate-800/50 px-2.5 py-1.5 text-slate-300"><CheckCircle2 size={12} className="text-emerald-400" />{f}</div>))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- BIBLIOTECA ---------------- */
function Biblioteca({ onEdit }) {
  const [cat, setCat] = useState("Todas");
  const cats = ["Todas", "Acidente", "Obra", "Interdição", "Congestionamento", "Evento", "Emergência", "Campanha", "Institucional"];
  const list = cat === "Todas" ? MSGS : MSGS.filter(m => m.cat === cat);
  const prioColor = { "Máxima": "text-red-400 bg-red-500/10", "Alta": "text-amber-400 bg-amber-500/10", "Média": "text-sky-400 bg-sky-500/10", "Baixa": "text-slate-400 bg-slate-500/10" };
  return (
    <div className="space-y-4">
      <PageTitle title="Biblioteca de mensagens" sub="Mensagens prontas com categoria, prioridade e versionamento" right={<button onClick={() => onEdit(null, "biblioteca")} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[12px] font-semibold text-slate-950 hover:bg-amber-400"><Plus size={14} />Nova mensagem</button>} />
      <div className="flex flex-wrap gap-1.5">
        {cats.map(c => <button key={c} onClick={() => setCat(c)} className={cx("rounded-lg border px-3 py-1.5 text-[11px]", cat === c ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-slate-800 text-slate-400 hover:bg-slate-800/50")}>{c}</button>)}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {list.map((m, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="flex items-center justify-center bg-black p-4" style={{ minHeight: 72 }}>
              <span className="font-mono text-[15px] font-bold tracking-wider" style={{ color: "#FFB000", textShadow: "0 0 8px #FFB000" }}>{m.nome}</span>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2"><span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">{m.cat}</span><span className={cx("rounded px-1.5 py-0.5 text-[10px]", prioColor[m.prio])}>{m.prio}</span><span className="ml-auto text-[10px] text-slate-500">v{m.ver}</span></div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500"><span>{m.autor}</span><span>{m.tempo}s · {fmt(m.data).split(" ")[0]}</span></div>
              <div className="mt-2 flex gap-1.5"><button onClick={() => onEdit({ name: m.nome, text: m.nome }, "biblioteca")} className="flex-1 rounded-lg border border-slate-700 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800">Editar</button><button className="flex-1 rounded-lg bg-amber-500/90 py-1.5 text-[11px] font-medium text-slate-950 hover:bg-amber-400">Publicar</button></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- PUBLICAÇÃO & FILA ---------------- */
function Publicar({ onOpen, onEdit }) {
  const [alvo, setAlvo] = useState("pmv");
  const fila = [
    { msg: "ACIDENTE KM 8 — REDUZA", alvo: "Grupo Rodovias (3 PMVs)", status: "enviando", origem: "API", t: "agora" },
    { msg: "OBRAS À FRENTE", alvo: "PMV-005", status: "publicado", origem: "Editor", t: "há 9min" },
    { msg: "TRÂNSITO INTENSO", alvo: "PMV-001", status: "agendado", origem: "Editor", t: "18:00 hoje" },
    { msg: "DIRIJA COM CUIDADO", alvo: "Cliente DER-AM (2 PMVs)", status: "publicado", origem: "Editor", t: "há 2h" },
  ];
  const stColor = { enviando: "text-sky-400 bg-sky-500/10", publicado: "text-emerald-400 bg-emerald-500/10", agendado: "text-amber-400 bg-amber-500/10", falha: "text-red-400 bg-red-500/10" };
  return (
    <div className="space-y-4">
      <PageTitle title="Publicação & fila de envio" sub="Publique para um PMV, grupo, cidade, cliente ou toda a malha" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Nova publicação" className="lg:col-span-1">
          <div className="space-y-3 p-4">
            <div><span className="mb-1.5 block text-[10px] uppercase tracking-wider text-slate-500">Destino</span>
              <div className="grid grid-cols-3 gap-1.5">{[["pmv", "PMV"], ["grupo", "Grupo"], ["cidade", "Cidade"], ["cliente", "Cliente"], ["todos", "Todos"]].map(([k, l]) => (<button key={k} onClick={() => setAlvo(k)} className={cx("rounded-lg border py-1.5 text-[11px]", alvo === k ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-slate-800 text-slate-400 hover:bg-slate-800/50")}>{l}</button>))}</div>
            </div>
            <label className="block"><span className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">Mensagem <button onClick={() => onEdit(null, "publicar")} className="normal-case text-amber-400 hover:underline">+ criar / editar</button></span><select className="w-full rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1.5 text-[12px] text-slate-200">{MSGS.map(m => <option key={m.nome}>{m.nome}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Modo</span><select className="w-full rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1.5 text-[12px] text-slate-200"><option>Imediata</option><option>Agendada</option><option>Substituição</option></select></label>
              <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-wider text-slate-500">Prioridade</span><select className="w-full rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1.5 text-[12px] text-slate-200"><option>Normal</option><option>Alta</option><option>Emergência</option></select></label>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-[12px] font-semibold text-slate-950 hover:bg-amber-400"><Send size={14} />Enviar publicação</button>
          </div>
        </Card>
        <Card title="Fila de publicação" className="lg:col-span-2">
          <div className="divide-y divide-slate-800/60">
            {fila.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1"><div className="truncate font-mono text-[13px] text-slate-200">{f.msg}</div><div className="text-[10px] text-slate-500">{f.alvo} · {f.t}</div></div>
                <span className={cx("rounded px-1.5 py-0.5 text-[9px]", f.origem === "API" ? "bg-sky-500/15 text-sky-300" : "bg-slate-700 text-slate-300")}>{f.origem}</span>
                <span className={cx("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", stColor[f.status])}>{f.status === "enviando" && <RefreshCw size={10} className="animate-spin" />}{f.status}</span>
                {f.status === "agendado" && <button className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-400 hover:bg-slate-800">Cancelar</button>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- HISTÓRICO DE ERROS ---------------- */
function Erros({ onOpen }) {
  const [flt, setFlt] = useState("todos");
  const [note, setNote] = useState(null);
  const list = flt === "todos" ? ERRORS : ERRORS.filter(e => e.status === flt);
  const critColor = { "Crítica": "text-red-400 bg-red-500/10", "Média": "text-amber-400 bg-amber-500/10", "Baixa": "text-slate-400 bg-slate-500/10" };
  return (
    <div className="space-y-4">
      <PageTitle title="Histórico de erros" sub="Todos os erros reportados pelas controladoras" right={<button onClick={() => downloadCSV("erros_pmv.csv", [["ID", "Data", "PMV", "Código", "Descrição", "Criticidade", "Origem", "Status"], ...ERRORS.map(e => [e.id, fmt(e.t), e.pmv, e.cod, e.desc, e.crit, e.origem, e.status])])} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-[12px] text-slate-300 hover:bg-slate-800"><Download size={13} />Exportar CSV</button>} />
      <div className="flex gap-1.5">{["todos", "aberto", "resolvido"].map(f => <button key={f} onClick={() => setFlt(f)} className={cx("rounded-lg border px-3 py-1.5 text-[11px] capitalize", flt === f ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-slate-800 text-slate-400 hover:bg-slate-800/50")}>{f}</button>)}</div>
      <Card>
        <table className="w-full text-[12px]">
          <thead><tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">{["ID", "Data", "Equipamento", "Código", "Descrição", "Origem", "Criticidade", "Status", ""].map(h => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-800/60">
            {list.map(e => (
              <tr key={e.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-2.5 font-mono text-slate-500">{e.id}</td>
                <td className="px-4 py-2.5 text-slate-400">{fmt(e.t)}</td>
                <td className="px-4 py-2.5"><button onClick={() => onOpen(e.pmv)} className="font-mono text-amber-400/80 hover:underline">{e.pmv}</button></td>
                <td className="px-4 py-2.5 font-mono text-slate-300">{e.cod}</td>
                <td className="px-4 py-2.5 text-slate-300">{e.desc}</td>
                <td className="px-4 py-2.5 text-slate-400">{e.origem}</td>
                <td className="px-4 py-2.5"><span className={cx("rounded-full px-2 py-0.5 text-[10px]", critColor[e.crit])}>{e.crit}</span></td>
                <td className="px-4 py-2.5">{e.status === "aberto" ? <span className="text-red-400">● Aberto</span> : <span className="text-emerald-400">● Resolvido</span>}</td>
                <td className="px-4 py-2.5"><button onClick={() => setNote(note === e.id ? null : e.id)} className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-400 hover:bg-slate-800">Observação</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {note && <div className="border-t border-slate-800 p-4"><span className="mb-1.5 block text-[10px] uppercase tracking-wider text-slate-500">Observação técnica — {note}</span><textarea placeholder="Ex.: substituída fonte 5V, temperatura normalizada após limpeza do dissipador…" className="h-20 w-full rounded-lg border border-slate-800 bg-slate-800/50 p-2.5 text-[12px] text-slate-200" /><div className="mt-2 flex justify-end gap-2"><button onClick={() => setNote(null)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-[11px] text-slate-300">Fechar</button><button onClick={() => setNote(null)} className="rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950">Salvar</button></div></div>}
      </Card>
    </div>
  );
}

/* ---------------- LOGS & AUDITORIA ---------------- */
function Logs() {
  const [tab, setTab] = useState("logs");
  const tipoColor = { API: "text-sky-400", Publicação: "text-emerald-400", Alerta: "text-red-400", Login: "text-amber-400", Config: "text-purple-400", Exclusão: "text-orange-400" };
  return (
    <div className="space-y-4">
      <PageTitle title="Logs & auditoria" sub="Registro completo de operações, comunicação e alterações" />
      <div className="flex gap-1 rounded-lg bg-slate-800/60 p-0.5" style={{ width: "fit-content" }}>
        {[["logs", "Logs do sistema"], ["audit", "Trilha de auditoria"]].map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cx("rounded-md px-3 py-1.5 text-[12px] font-medium", tab === k ? "bg-slate-700 text-white" : "text-slate-400")}>{l}</button>)}
      </div>
      {tab === "logs" ? (
        <Card>
          <div className="max-h-[540px] divide-y divide-slate-800/40 overflow-y-auto font-mono text-[11px]">
            {LOGS.map((l, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2">
                <span className="w-28 text-slate-600">{fmt(l.t)}</span>
                <span className={cx("w-24", tipoColor[l.tipo])}>[{l.tipo}]</span>
                <span className="w-24 text-slate-500">{l.user}</span>
                <span className="flex-1 text-slate-300">{l.msg}</span>
                <span className="text-slate-600">{l.ip}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <table className="w-full text-[12px]">
            <thead><tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">{["Quando", "Quem", "Ação", "Equipamento", "Antes", "Depois", "IP"].map(h => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-800/60">
              {AUDIT.map((a, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="px-4 py-2.5 text-slate-400">{fmt(a.t)}</td>
                  <td className="px-4 py-2.5 text-slate-300">{a.user}</td>
                  <td className="px-4 py-2.5 text-slate-300">{a.acao}</td>
                  <td className="px-4 py-2.5 font-mono text-amber-400/80">{a.pmv}</td>
                  <td className="px-4 py-2.5 font-mono text-red-400/70">{a.antes}</td>
                  <td className="px-4 py-2.5 font-mono text-emerald-400/70">{a.depois}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-500">{a.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ---------------- RELATÓRIOS ---------------- */
function Relatorios() {
  const reports = [
    { nome: "Disponibilidade", desc: "Uptime por equipamento e SLA", icon: Gauge },
    { nome: "Publicações", desc: "Volume e origem das mensagens", icon: Send },
    { nome: "Tempo online", desc: "Horas ativas por PMV", icon: Clock },
    { nome: "Falhas & erros", desc: "Incidentes por criticidade", icon: AlertOctagon },
    { nome: "Temperatura", desc: "Picos térmicos e tendência", icon: Thermometer },
    { nome: "Uso de memória", desc: "Consumo médio e alertas", icon: MemoryStick },
  ];
  const dispData = PMVS.map(p => ({ name: p.id.replace("PMV-", ""), up: p.status === "offline" ? 62 : p.status === "manut" ? 80 : 95 + rnd(0, 4) }));
  return (
    <div className="space-y-4">
      <PageTitle title="Relatórios" sub="Análises operacionais com exportação" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {reports.map(r => (
          <Card key={r.nome} className="p-4">
            <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400"><r.icon size={17} /></div><div><div className="text-[13px] font-semibold text-slate-100">{r.nome}</div><div className="text-[10px] text-slate-500">{r.desc}</div></div></div>
            <div className="mt-3 flex gap-1.5">
              {["PDF", "Excel", "CSV"].map(fmt2 => <button key={fmt2} onClick={() => fmt2 === "CSV" ? downloadCSV(`relatorio_${r.nome}.csv`, [["PMV", "Valor"], ...dispData.map(d => [d.name, d.up])]) : alert(`Relatório "${r.nome}" gerado em ${fmt2} (mock).`)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-700 py-1.5 text-[10px] text-slate-300 hover:bg-slate-800"><Download size={11} />{fmt2}</button>)}
            </div>
          </Card>
        ))}
      </div>
      <Card title="Disponibilidade por equipamento (30 dias)">
        <div className="h-64 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dispData}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="name" {...chartAxis} /><YAxis domain={[0, 100]} {...chartAxis} unit="%" /><Tooltip {...tooltipStyle} /><Bar dataKey="up" radius={[3, 3, 0, 0]} name="Disponibilidade %">{dispData.map((d, i) => <Cell key={i} fill={d.up > 90 ? "#22C55E" : d.up > 75 ? "#F59E0B" : "#EF4444"} />)}</Bar></BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- USUÁRIOS & ACESSO ---------------- */
function Usuarios() {
  const roleColor = { Administrador: "text-red-400 bg-red-500/10", Supervisor: "text-amber-400 bg-amber-500/10", Operador: "text-sky-400 bg-sky-500/10", Técnico: "text-emerald-400 bg-emerald-500/10", Cliente: "text-slate-400 bg-slate-500/10" };
  return (
    <div className="space-y-4">
      <PageTitle title="Usuários & controle de acesso" sub="Níveis de permissão, autenticação e 2FA" right={<button className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[12px] font-semibold text-slate-950 hover:bg-amber-400"><Plus size={14} />Novo usuário</button>} />
      <Card>
        <table className="w-full text-[12px]">
          <thead><tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-500">{["Usuário", "E-mail", "Papel", "Grupos / PMVs", "2FA", "Status"].map(h => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-800/60">
            {USERS.map((u, i) => (
              <tr key={i} className="hover:bg-slate-800/30">
                <td className="px-4 py-2.5 font-medium text-slate-200">{u.nome}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">{u.email}</td>
                <td className="px-4 py-2.5"><span className={cx("rounded-full px-2 py-0.5 text-[10px] font-medium", roleColor[u.papel])}>{u.papel}</span></td>
                <td className="px-4 py-2.5 text-slate-400">{u.grupos}</td>
                <td className="px-4 py-2.5">{u.fa ? <span className="flex items-center gap-1 text-emerald-400"><KeyRound size={12} />Ativo</span> : <span className="text-slate-500">—</span>}</td>
                <td className="px-4 py-2.5">{u.ativo ? <span className="text-emerald-400">● Ativo</span> : <span className="text-slate-500">● Inativo</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {Object.entries(ROLE_PERMS).map(([role, perms]) => (
          <Card key={role} className="p-4">
            <div className="flex items-center gap-1.5"><Shield size={14} className="text-amber-400" /><h3 className="text-[13px] font-semibold text-slate-100">{role}</h3></div>
            <ul className="mt-2.5 space-y-1.5">{perms.map(p => <li key={p} className="flex items-start gap-1.5 text-[11px] text-slate-400"><CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-400/70" />{p}</li>)}</ul>
          </Card>
        ))}
      </div>
      <Card title="Segurança" className="p-0"><div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4 text-[11px]">{[["Autenticação", "JWT + refresh", KeyRound], ["2FA", "TOTP / SMS", Shield], ["Permissões", "Por módulo, equipamento e cliente", Boxes], ["Auditoria", "Registro imutável de alterações", ScrollText]].map(([k, v, Ic], i) => (<div key={i} className="rounded-lg bg-slate-800/40 p-3"><Ic size={15} className="text-amber-400" /><div className="mt-1.5 text-[10px] uppercase tracking-wider text-slate-500">{k}</div><div className="mt-0.5 text-slate-200">{v}</div></div>))}</div></Card>
    </div>
  );
}

/* ---------------- API VNNOX ---------------- */
function ApiConsole() {
  const [live, setLive] = useState([
    { m: "GET", ep: "/vnnox/players/status", code: 200, ms: 142, t: ago(0) },
    { m: "POST", ep: "/vnnox/program/publish", code: 200, ms: 318, t: ago(1) },
    { m: "GET", ep: "/vnnox/players/telemetry", code: 200, ms: 96, t: ago(2) },
    { m: "POST", ep: "/vnnox/program/publish", code: 503, ms: 5001, t: ago(4), retry: true },
    { m: "GET", ep: "/vnnox/media/list", code: 200, ms: 210, t: ago(6) },
  ]);
  useEffect(() => {
    const t = setInterval(() => {
      const eps = ["/vnnox/players/status", "/vnnox/players/telemetry", "/vnnox/program/publish", "/vnnox/media/list"];
      const ok = Math.random() > 0.12;
      setLive(v => [{ m: Math.random() > 0.6 ? "POST" : "GET", ep: eps[rnd(0, 3)], code: ok ? 200 : 503, ms: ok ? rnd(80, 400) : 5000, t: now(), retry: !ok }, ...v].slice(0, 12));
    }, 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="space-y-4">
      <PageTitle title="API VNNOX" sub="Módulo de comunicação — fila, retry automático e logs" right={<span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[11px] text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Conectado</span>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Chamadas (24h)" value="942" tone="sky" icon={Radio} />
        <Stat label="Tempo resp. médio" value="184ms" tone="emerald" icon={Gauge} />
        <Stat label="Taxa de sucesso" value="98,7%" tone="emerald" icon={CheckCircle2} />
        <Stat label="Na fila / retry" value="3" tone="amber" icon={RefreshCw} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Fila de envio" className="lg:col-span-1">
          <div className="divide-y divide-slate-800/60 text-[11px]">
            {[["publish → Grupo Rodovias", "enviando"], ["telemetry poll", "agendado"], ["publish → PMV-005 (retry 2/3)", "retry"]].map(([m, s], i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5"><span className="font-mono text-slate-300">{m}</span><span className={cx("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]", s === "enviando" ? "text-sky-400 bg-sky-500/10" : s === "retry" ? "text-amber-400 bg-amber-500/10" : "text-slate-400 bg-slate-500/10")}>{(s === "enviando" || s === "retry") && <RefreshCw size={9} className="animate-spin" />}{s}</span></div>
            ))}
          </div>
        </Card>
        <Card title="Log de chamadas (ao vivo)" className="lg:col-span-2">
          <div className="max-h-72 divide-y divide-slate-800/40 overflow-y-auto font-mono text-[11px]">
            {live.map((l, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2">
                <span className="w-16 text-slate-600">{fmtT(l.t)}</span>
                <span className={cx("w-12 font-semibold", l.m === "POST" ? "text-amber-400" : "text-sky-400")}>{l.m}</span>
                <span className="flex-1 text-slate-300">{l.ep}</span>
                {l.retry && <span className="text-[9px] text-amber-400">retry</span>}
                <span className={cx("w-10", l.code === 200 ? "text-emerald-400" : "text-red-400")}>{l.code}</span>
                <span className={cx("w-16 text-right", l.ms > 1000 ? "text-red-400" : "text-slate-500")}>{l.ms}ms</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card title="Escalabilidade — controladoras e protocolos">
        <div className="grid grid-cols-2 gap-2 p-4 md:grid-cols-4 lg:grid-cols-8 text-[11px]">
          {[["NovaStar TB", true], ["VNNOX API", true], ["NovaStar JT", false], ["NTCIP 1203", false], ["MQTT", false], ["REST API", true], ["WebSocket", true], ["Órgãos públicos", false]].map(([n, on]) => (
            <div key={n} className={cx("flex items-center gap-1.5 rounded-lg border px-2.5 py-2", on ? "border-emerald-500/30 bg-emerald-500/5 text-slate-200" : "border-slate-800 bg-slate-800/30 text-slate-500")}>
              {on ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Circle size={12} className="text-slate-600" />}{n}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- helpers ---------------- */
function PageTitle({ title, sub, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-xl font-bold tracking-tight text-slate-100">{title}</h1>{sub && <p className="mt-0.5 text-[12px] text-slate-500">{sub}</p>}</div>
      {right}
    </div>
  );
}
