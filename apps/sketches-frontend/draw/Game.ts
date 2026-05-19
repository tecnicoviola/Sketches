// import { Tool } from "@/components/Canvas";
// import { getExistingShapes } from "./http";

// type Shape =
//   | { type: "rect";    x: number; y: number; width: number; height: number; color: string; lineWidth: number }
//   | { type: "diamond"; x: number; y: number; width: number; height: number; color: string; lineWidth: number }
//   | { type: "circle";  centerX: number; centerY: number; radius: number; color: string; lineWidth: number }
//   | { type: "line";    x1: number; y1: number; x2: number; y2: number; color: string; lineWidth: number }
//   | { type: "arrow";   x1: number; y1: number; x2: number; y2: number; color: string; lineWidth: number }
//   | { type: "pencil";  points: { x: number; y: number }[]; color: string; lineWidth: number }
//   | { type: "text";    x: number; y: number; text: string; color: string; lineWidth: number }
//   | { type: "star";    cx: number; cy: number; r: number; color: string; lineWidth: number }
//   | { type: "image";   x: number; y: number; width: number; height: number; src: string; color: string; lineWidth: number }
//   | { type: "laser";   points: { x: number; y: number }[] };

// interface RemoteCursor { userId: string; x: number; y: number; color: string; }

// const USER_COLORS = ["#f87171","#4ade80","#60a5fa","#facc15","#c084fc","#fb923c","#34d399"];

// function dataURItoBlob(dataURI: string): Blob {
//   const arr = dataURI.split(",");
//   const mime = arr[0]!.match(/:(.*?);/)![1];
//   const bstr = atob(arr[1]!);
//   let n = bstr.length;
//   const u8arr = new Uint8Array(n);
//   while (n--) u8arr[n] = bstr.charCodeAt(n);
//   return new Blob([u8arr], { type: mime });
// }

// function drawSmoothPath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) {
//   if (points.length < 2) return;
//   ctx.beginPath();
//   ctx.moveTo(points[0]!.x, points[0]!.y);
//   for (let i = 1; i < points.length - 1; i++) {
//     const midX = (points[i]!.x + points[i + 1]!.x) / 2;
//     const midY = (points[i]!.y + points[i + 1]!.y) / 2;
//     ctx.quadraticCurveTo(points[i]!.x, points[i]!.y, midX, midY);
//   }
//   ctx.lineTo(points[points.length - 1]!.x, points[points.length - 1]!.y);
//   ctx.stroke();
// }

// export class Game {
//   private canvas: HTMLCanvasElement;
//   private ctx: CanvasRenderingContext2D;
//   private existingShapes: Shape[] = [];
//   private roomId: string;
//   private clicked = false;
//   private startX = 0;
//   private startY = 0;
//   private selectedTool: Tool = "pencil";
//   private pencilPoints: { x: number; y: number }[] = [];
//   private laserPoints: { x: number; y: number }[] = [];
//   private undoStack: Shape[][] = [];
//   private strokeColor = "#ffffff";
//   private lineWidth = 2;
//   private isPanning = false;
//   private panStartX = 0;
//   private panStartY = 0;
//   private offsetX = 0;
//   private offsetY = 0;
//   private locked = false;
//   private remoteCursors: Map<string, RemoteCursor> = new Map();
//   private lastCursorSend = 0;
//   private lastPencilShape: Extract<Shape, { type: "pencil" }> | null = null;
//   private laserFadeTimer: ReturnType<typeof setTimeout> | null = null;
//   private imageCache: Map<string, ImageBitmap> = new Map();
//   private bgColor = "#1b1b1f";
//   private showGrid = false;
//   private highlightShape: Shape | null = null;
//   private highlightTimer: ReturnType<typeof setTimeout> | null = null;

//   public onCursorsUpdate?: (cursors: RemoteCursor[]) => void;
//   public onToolChange?: (tool: string) => void;
//   public onAIResult?: (shape: Shape) => void;

//   socket: WebSocket;

//   constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
//     this.canvas = canvas;
//     this.ctx = canvas.getContext("2d")!;
//     this.roomId = roomId;
//     this.socket = socket;
//     this.init();
//     this.initHandlers();
//     this.initMouseHandlers();
//     this.initKeyHandlers();
//   }

//   destroy() {
//     this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
//     this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
//     this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
//     this.canvas.removeEventListener("dblclick", this.dblClickHandler);
//     window.removeEventListener("keydown", this.keyHandler);
//   }

//   setTool(tool: Tool) { this.selectedTool = tool; }
//   setColor(color: string) { this.strokeColor = color; }
//   setLineWidth(w: number) { this.lineWidth = w; }
//   setLocked(v: boolean) { this.locked = v; }

//   setBackground(color: string) {
//     this.bgColor = color;
//     this.clearCanvas();
//   }

//   setShowGrid(show: boolean) {
//     this.showGrid = show;
//     this.clearCanvas();
//   }

//   resetCanvas() {
//     this.existingShapes = [];
//     this.undoStack = [];
//     this.clearCanvas();
//   }

//   insertShape(shape: any) {
//     this.existingShapes.push(shape as Shape);
//     this.clearCanvas();
//     this.socket.send(JSON.stringify({
//       type: "chat",
//       message: JSON.stringify({ shape }),
//       roomId: this.roomId,
//     }));
//   }

//   findText(query: string): { found: boolean; matchCount: number } {
//     if (!query.trim()) return { found: false, matchCount: 0 };
//     const q = query.toLowerCase();
//     const matches = this.existingShapes.filter(
//       s => s.type === "text" && s.text.toLowerCase().includes(q)
//     );
//     if (matches.length === 0) {
//       this.canvas.style.outline = "3px solid #f87171";
//       setTimeout(() => { this.canvas.style.outline = "none"; }, 800);
//       return { found: false, matchCount: 0 };
//     }
//     const first = matches[0]!;
//     if (first.type === "text") {
//       this.offsetX = this.canvas.width / 2 - first.x;
//       this.offsetY = this.canvas.height / 2 - first.y;
//     }
//     this.highlightShape = first;
//     if (this.highlightTimer) clearTimeout(this.highlightTimer);
//     this.highlightTimer = setTimeout(() => {
//       this.highlightShape = null;
//       this.clearCanvas();
//     }, 2000);
//     this.clearCanvas();
//     return { found: true, matchCount: matches.length };
//   }

//   undo() {
//     if (!this.existingShapes.length) return;
//     this.undoStack.push([...this.existingShapes]);
//     this.existingShapes.pop();
//     this.clearCanvas();
//   }

//   redo() {
//     const last = this.undoStack.pop();
//     if (last) { this.existingShapes = last; this.clearCanvas(); }
//   }

//   async recognizeShape() {
//     if (!this.lastPencilShape || this.lastPencilShape.points.length < 3) {
//       alert("Draw something with pencil first!"); return;
//     }
//     try {
//       const res = await fetch("/api/recognize-shape", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ points: this.lastPencilShape.points }),
//       });
//       const data = await res.json();
//       if (!data.shape) return;
//       const idx = this.existingShapes.indexOf(this.lastPencilShape);
//       if (idx !== -1) this.existingShapes.splice(idx, 1);
//       const newShape: Shape = { ...data.shape, color: this.strokeColor, lineWidth: this.lineWidth };
//       this.existingShapes.push(newShape);
//       this.lastPencilShape = null;
//       this.clearCanvas();
//       this.socket.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape: newShape }), roomId: this.roomId }));
//     } catch (e) { console.error("AI failed:", e); }
//   }

//   async init() {
//     this.existingShapes = await getExistingShapes(this.roomId);
//     this.clearCanvas();
//   }

//   initHandlers() {
//     this.socket.onmessage = (event) => {
//       const msg = JSON.parse(event.data);
//       if (msg.type === "chat") {
//         this.existingShapes.push(JSON.parse(msg.message).shape);
//         this.clearCanvas();
//       }
//       if (msg.type === "cursor") {
//         this.remoteCursors.set(msg.userId, {
//           userId: msg.userId, x: msg.x, y: msg.y,
//           color: this.colorForUser(msg.userId),
//         });
//         this.onCursorsUpdate?.([...this.remoteCursors.values()]);
//         this.clearCanvas();
//       }
//     };
//   }

//   private colorForUser(id: string) {
//     let h = 0;
//     for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
//     return USER_COLORS[Math.abs(h) % USER_COLORS.length]!;
//   }

//   private drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
//     const angle = Math.atan2(y2 - y1, x2 - x1);
//     const len = 14;
//     ctx.beginPath();
//     ctx.moveTo(x1, y1);
//     ctx.lineTo(x2, y2);
//     ctx.stroke();
//     ctx.beginPath();
//     ctx.moveTo(x2, y2);
//     ctx.lineTo(x2 - len * Math.cos(angle - 0.4), y2 - len * Math.sin(angle - 0.4));
//     ctx.lineTo(x2 - len * Math.cos(angle + 0.4), y2 - len * Math.sin(angle + 0.4));
//     ctx.closePath();
//     ctx.fillStyle = ctx.strokeStyle as string;
//     ctx.fill();
//   }

//   private drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
//     ctx.beginPath();
//     ctx.moveTo(x + w / 2, y);
//     ctx.lineTo(x + w, y + h / 2);
//     ctx.lineTo(x + w / 2, y + h);
//     ctx.lineTo(x, y + h / 2);
//     ctx.closePath();
//     ctx.stroke();
//   }

//   private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
//     const spikes = 5;
//     const inner = r * 0.4;
//     ctx.beginPath();
//     for (let i = 0; i < spikes * 2; i++) {
//       const rad = (i * Math.PI) / spikes - Math.PI / 2;
//       const radius = i % 2 === 0 ? r : inner;
//       ctx.lineTo(cx + Math.cos(rad) * radius, cy + Math.sin(rad) * radius);
//     }
//     ctx.closePath();
//     ctx.stroke();
//   }

//   private async loadImage(src: string): Promise<ImageBitmap | null> {
//     if (this.imageCache.has(src)) return this.imageCache.get(src)!;
//     try {
//       const blob = dataURItoBlob(src);
//       const bitmap = await createImageBitmap(blob);
//       this.imageCache.set(src, bitmap);
//       return bitmap;
//     } catch { return null; }
//   }

//   private drawGrid(ctx: CanvasRenderingContext2D) {
//     const spacing = 32;
//     const dotRadius = 1;
//     const w = this.canvas.width;
//     const h = this.canvas.height;
//     const startX = ((this.offsetX % spacing) + spacing) % spacing;
//     const startY = ((this.offsetY % spacing) + spacing) % spacing;
//     ctx.save();
//     ctx.fillStyle = "rgba(255,255,255,0.12)";
//     for (let x = startX; x < w; x += spacing) {
//       for (let y = startY; y < h; y += spacing) {
//         ctx.beginPath();
//         ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
//         ctx.fill();
//       }
//     }
//     ctx.restore();
//   }

//   clearCanvas() {
//     const ctx = this.ctx;
//     ctx.save();
//     ctx.setTransform(1, 0, 0, 1, 0, 0);
//     ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
//     ctx.fillStyle = this.bgColor;
//     ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
//     ctx.restore();

//     if (this.showGrid) this.drawGrid(ctx);

//     ctx.save();
//     ctx.translate(this.offsetX, this.offsetY);

//     this.existingShapes.forEach(shape => {
//       if (shape.type === "laser") return;
//       ctx.strokeStyle = (shape as any).color || "#fff";
//       ctx.lineWidth = (shape as any).lineWidth || 2;
//       ctx.lineCap = "round";
//       ctx.lineJoin = "round";

//       if (this.highlightShape && shape === this.highlightShape) {
//         ctx.save();
//         ctx.shadowColor = "#facc15";
//         ctx.shadowBlur = 24;
//       }

//       if (shape.type === "rect") {
//         ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
//       } else if (shape.type === "diamond") {
//         this.drawDiamond(ctx, shape.x, shape.y, shape.width, shape.height);
//       } else if (shape.type === "circle") {
//         ctx.beginPath();
//         ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
//         ctx.stroke(); ctx.closePath();
//       } else if (shape.type === "line") {
//         ctx.beginPath();
//         ctx.moveTo(shape.x1, shape.y1);
//         ctx.lineTo(shape.x2, shape.y2);
//         ctx.stroke(); ctx.closePath();
//       } else if (shape.type === "arrow") {
//         this.drawArrow(ctx, shape.x1, shape.y1, shape.x2, shape.y2);
//       } else if (shape.type === "pencil") {
//         drawSmoothPath(ctx, shape.points);
//       } else if (shape.type === "star") {
//         this.drawStar(ctx, shape.cx, shape.cy, shape.r);
//       } else if (shape.type === "text") {
//         ctx.fillStyle = shape.color;
//         ctx.font = `${14 + shape.lineWidth * 2}px sans-serif`;
//         ctx.fillText(shape.text, shape.x, shape.y);
//       } else if (shape.type === "image") {
//         const cached = this.imageCache.get(shape.src);
//         if (cached) {
//           ctx.drawImage(cached, shape.x, shape.y, shape.width, shape.height);
//         } else {
//           this.loadImage(shape.src).then(bitmap => {
//             if (bitmap) this.clearCanvas();
//           });
//         }
//       }

//       if (this.highlightShape && shape === this.highlightShape) {
//         ctx.restore();
//       }
//     });

//     ctx.restore();

//     if (this.laserPoints.length > 1) {
//       ctx.save();
//       ctx.strokeStyle = "rgba(255, 50, 50, 0.85)";
//       ctx.lineWidth = 3;
//       ctx.lineCap = "round";
//       ctx.shadowColor = "rgba(255,0,0,0.6)";
//       ctx.shadowBlur = 8;
//       ctx.beginPath();
//       ctx.moveTo(this.laserPoints[0]!.x, this.laserPoints[0]!.y);
//       this.laserPoints.forEach(p => ctx.lineTo(p.x, p.y));
//       ctx.stroke();
//       ctx.restore();
//     }

//     this.remoteCursors.forEach(c => this.drawCursor(c.x, c.y, c.color, c.userId));
//   }

//   private drawCursor(x: number, y: number, color: string, userId: string) {
//     const ctx = this.ctx;
//     ctx.save();
//     ctx.fillStyle = color;
//     ctx.strokeStyle = "#000";
//     ctx.lineWidth = 1;
//     ctx.beginPath();
//     ctx.moveTo(x, y);
//     ctx.lineTo(x + 12, y + 4);
//     ctx.lineTo(x + 4, y + 12);
//     ctx.closePath();
//     ctx.fill(); ctx.stroke();
//     ctx.fillStyle = color;
//     ctx.font = "bold 11px sans-serif";
//     const label = userId.slice(0, 6);
//     const w = ctx.measureText(label).width + 10;
//     ctx.beginPath();
//     ctx.roundRect(x + 14, y, w, 18, 4);
//     ctx.fill();
//     ctx.fillStyle = "#000";
//     ctx.fillText(label, x + 19, y + 13);
//     ctx.restore();
//   }

//   mouseDownHandler = (e: MouseEvent) => {
//     if (e.button === 1 || this.selectedTool === "pan") {
//       this.isPanning = true;
//       this.panStartX = e.clientX - this.offsetX;
//       this.panStartY = e.clientY - this.offsetY;
//       return;
//     }
//     this.clicked = true;
//     this.startX = e.clientX - this.offsetX;
//     this.startY = e.clientY - this.offsetY;
//     if (this.selectedTool === "pencil" || this.selectedTool === "lasso") {
//       this.pencilPoints = [{ x: this.startX, y: this.startY }];
//     }
//     if (this.selectedTool === "laser") {
//       this.laserPoints = [{ x: e.clientX, y: e.clientY }];
//     }
//   };

//   mouseUpHandler = (e: MouseEvent) => {
//     if (this.isPanning) { this.isPanning = false; return; }
//     this.clicked = false;

//     const endX = e.clientX - this.offsetX;
//     const endY = e.clientY - this.offsetY;
//     const width = endX - this.startX;
//     const height = endY - this.startY;

//     let shape: Shape | null = null;

//     switch (this.selectedTool) {
//       case "rect":
//         shape = { type: "rect", x: this.startX, y: this.startY, width, height, color: this.strokeColor, lineWidth: this.lineWidth };
//         break;
//       case "diamond":
//         shape = { type: "diamond", x: this.startX, y: this.startY, width, height, color: this.strokeColor, lineWidth: this.lineWidth };
//         break;
//       case "circle": {
//         const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
//         shape = { type: "circle", centerX: this.startX + radius, centerY: this.startY + radius, radius, color: this.strokeColor, lineWidth: this.lineWidth };
//         break;
//       }
//       case "line":
//         shape = { type: "line", x1: this.startX, y1: this.startY, x2: endX, y2: endY, color: this.strokeColor, lineWidth: this.lineWidth };
//         break;
//       case "arrow":
//         shape = { type: "arrow", x1: this.startX, y1: this.startY, x2: endX, y2: endY, color: this.strokeColor, lineWidth: this.lineWidth };
//         break;
//       case "star": {
//         const r = Math.max(Math.abs(width), Math.abs(height)) / 2;
//         shape = { type: "star", cx: this.startX + r, cy: this.startY + r, r, color: this.strokeColor, lineWidth: this.lineWidth };
//         break;
//       }
//       case "pencil":
//         if (this.pencilPoints.length > 1) {
//           shape = { type: "pencil", points: [...this.pencilPoints], color: this.strokeColor, lineWidth: this.lineWidth };
//           this.lastPencilShape = shape as Extract<Shape, { type: "pencil" }>;
//         }
//         this.pencilPoints = [];
//         break;
//       case "laser":
//         if (this.laserFadeTimer) clearTimeout(this.laserFadeTimer);
//         this.laserFadeTimer = setTimeout(() => {
//           this.laserPoints = [];
//           this.clearCanvas();
//         }, 1200);
//         return;
//       case "eraser": {
//         const THRESHOLD = 20;
//         this.existingShapes = this.existingShapes.filter(s => {
//           if (s.type === "rect" || s.type === "diamond" || s.type === "image") {
//             return !(endX >= s.x - THRESHOLD && endX <= s.x + s.width + THRESHOLD &&
//                      endY >= s.y - THRESHOLD && endY <= s.y + s.height + THRESHOLD);
//           }
//           if (s.type === "circle") {
//             const dist = Math.sqrt((endX - s.centerX) ** 2 + (endY - s.centerY) ** 2);
//             return dist > s.radius + THRESHOLD;
//           }
//           if (s.type === "line" || s.type === "arrow") {
//             const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
//             const len2 = dx * dx + dy * dy;
//             const t = Math.max(0, Math.min(1, ((endX - s.x1) * dx + (endY - s.y1) * dy) / len2));
//             const nearX = s.x1 + t * dx, nearY = s.y1 + t * dy;
//             const dist = Math.sqrt((endX - nearX) ** 2 + (endY - nearY) ** 2);
//             return dist > THRESHOLD;
//           }
//           if (s.type === "pencil") {
//             return !s.points.some(p =>
//               Math.sqrt((endX - p.x) ** 2 + (endY - p.y) ** 2) < THRESHOLD * 2
//             );
//           }
//           return true;
//         });
//         this.clearCanvas();
//         return;
//       }

//       // ✅ FIXED image case
//       case "image": {
//         const input = document.createElement("input");
//         input.type = "file";
//         input.accept = "image/*";
//         input.style.display = "none";
//         document.body.appendChild(input); // ✅ append to body before click

//         input.onchange = () => {
//           const file = input.files?.[0];
//           document.body.removeChild(input); // ✅ cleanup
//           if (!file) return;

//           const reader = new FileReader();
//           reader.onload = (ev) => {
//             const src = ev.target?.result as string;
//             const img = new window.Image(); // ✅ window.Image to avoid naming conflict
//             img.onload = () => {
//               const maxW = 400;
//               const scale = Math.min(1, maxW / img.width);
//               const w = img.width * scale;
//               const h = img.height * scale;
//               const imgShape: Shape = {
//                 type: "image",
//                 x: this.startX,
//                 y: this.startY,
//                 width: w,
//                 height: h,
//                 src,
//                 color: "#ffffff",
//                 lineWidth: 1,
//               };
//               this.loadImage(src).then(() => {
//                 this.existingShapes.push(imgShape);
//                 this.clearCanvas();
//                 this.socket.send(JSON.stringify({
//                   type: "chat",
//                   message: JSON.stringify({ shape: imgShape }),
//                   roomId: this.roomId,
//                 }));
//               });
//             };
//             img.src = src;
//           };
//           reader.readAsDataURL(file);
//         };

//         input.click(); // ✅ click after everything is set up
//         return;
//       }
//     }

//     if (!shape) return;
//     if (!this.locked) this.onToolChange?.(this.selectedTool);
//     this.undoStack = [];
//     this.existingShapes.push(shape);
//     this.clearCanvas();
//     this.socket.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape }), roomId: this.roomId }));
//   };

//   dblClickHandler = (e: MouseEvent) => {
//     if (this.selectedTool !== "text") return;
//     const x = e.clientX - this.offsetX;
//     const y = e.clientY - this.offsetY;
//     const input = document.createElement("input");
//     input.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;background:transparent;border:none;border-bottom:1px solid white;color:white;font-size:${14 + this.lineWidth * 2}px;outline:none;z-index:999;min-width:120px;font-family:sans-serif;`;
//     document.body.appendChild(input);
//     input.focus();
//     input.onblur = () => {
//       const text = input.value.trim();
//       document.body.removeChild(input);
//       if (!text) return;
//       const shape: Shape = { type: "text", x, y, text, color: this.strokeColor, lineWidth: this.lineWidth };
//       this.existingShapes.push(shape);
//       this.clearCanvas();
//       this.socket.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape }), roomId: this.roomId }));
//     };
//     input.onkeydown = (ev) => { if (ev.key === "Enter") input.blur(); };
//   };

//   mouseMoveHandler = (e: MouseEvent) => {
//     if (this.isPanning) {
//       this.offsetX = e.clientX - this.panStartX;
//       this.offsetY = e.clientY - this.panStartY;
//       this.clearCanvas(); return;
//     }

//     const now = Date.now();
//     if (now - this.lastCursorSend > 50) {
//       this.lastCursorSend = now;
//       this.socket.send(JSON.stringify({ type: "cursor", x: e.clientX, y: e.clientY, roomId: this.roomId }));
//     }

//     if (!this.clicked) return;

//     const currentX = e.clientX - this.offsetX;
//     const currentY = e.clientY - this.offsetY;
//     const width = currentX - this.startX;
//     const height = currentY - this.startY;

//     if (this.selectedTool === "laser") {
//       this.laserPoints.push({ x: e.clientX, y: e.clientY });
//       this.clearCanvas(); return;
//     }

//     this.clearCanvas();
//     this.ctx.save();
//     this.ctx.translate(this.offsetX, this.offsetY);
//     this.ctx.strokeStyle = this.strokeColor;
//     this.ctx.lineWidth = this.lineWidth;
//     this.ctx.lineCap = "round";
//     this.ctx.lineJoin = "round";

//     if (this.selectedTool === "pencil" || this.selectedTool === "lasso") {
//       this.pencilPoints.push({ x: currentX, y: currentY });
//       this.ctx.setLineDash(this.selectedTool === "lasso" ? [4, 4] : []);
//       drawSmoothPath(this.ctx, this.pencilPoints);
//       this.ctx.setLineDash([]);
//     } else if (this.selectedTool === "rect") {
//       this.ctx.strokeRect(this.startX, this.startY, width, height);
//     } else if (this.selectedTool === "diamond") {
//       this.drawDiamond(this.ctx, this.startX, this.startY, width, height);
//     } else if (this.selectedTool === "circle") {
//       const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
//       this.ctx.beginPath();
//       this.ctx.arc(this.startX + radius, this.startY + radius, radius, 0, Math.PI * 2);
//       this.ctx.stroke(); this.ctx.closePath();
//     } else if (this.selectedTool === "line") {
//       this.ctx.beginPath();
//       this.ctx.moveTo(this.startX, this.startY);
//       this.ctx.lineTo(currentX, currentY);
//       this.ctx.stroke(); this.ctx.closePath();
//     } else if (this.selectedTool === "arrow") {
//       this.drawArrow(this.ctx, this.startX, this.startY, currentX, currentY);
//     }

//     this.ctx.restore();
//   };

//   keyHandler = (e: KeyboardEvent) => {
//     if (e.target instanceof HTMLInputElement) return;
//     if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); this.undo(); }
//     if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); this.redo(); }
//   };

//   initKeyHandlers() { window.addEventListener("keydown", this.keyHandler); }

//   initMouseHandlers() {
//     this.canvas.addEventListener("mousedown", this.mouseDownHandler);
//     this.canvas.addEventListener("mouseup", this.mouseUpHandler);
//     this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
//     this.canvas.addEventListener("dblclick", this.dblClickHandler);
//   }
// }


import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | { type: "rect";    x: number; y: number; width: number; height: number; color: string; lineWidth: number }
  | { type: "diamond"; x: number; y: number; width: number; height: number; color: string; lineWidth: number }
  | { type: "circle";  centerX: number; centerY: number; radius: number; color: string; lineWidth: number }
  | { type: "line";    x1: number; y1: number; x2: number; y2: number; color: string; lineWidth: number }
  | { type: "arrow";   x1: number; y1: number; x2: number; y2: number; color: string; lineWidth: number }
  | { type: "pencil";  points: { x: number; y: number }[]; color: string; lineWidth: number }
  | { type: "text";    x: number; y: number; width: number; height: number; text: string; color: string; lineWidth: number }
  | { type: "star";    cx: number; cy: number; r: number; color: string; lineWidth: number }
  | { type: "image";   x: number; y: number; width: number; height: number; src: string; color: string; lineWidth: number }
  | { type: "laser";   points: { x: number; y: number }[] };

interface RemoteCursor { userId: string; x: number; y: number; color: string; }

const USER_COLORS = ["#f87171","#4ade80","#60a5fa","#facc15","#c084fc","#fb923c","#34d399"];

function dataURItoBlob(dataURI: string): Blob {
  const arr = dataURI.split(",");
  const mime = arr[0]!.match(/:(.*?);/)![1];
  const bstr = atob(arr[1]!);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

function drawSmoothPath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i]!.x + points[i + 1]!.x) / 2;
    const midY = (points[i]!.y + points[i + 1]!.y) / 2;
    ctx.quadraticCurveTo(points[i]!.x, points[i]!.y, midX, midY);
  }
  ctx.lineTo(points[points.length - 1]!.x, points[points.length - 1]!.y);
  ctx.stroke();
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private clicked = false;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "pencil";
  private pencilPoints: { x: number; y: number }[] = [];
  private laserPoints: { x: number; y: number }[] = [];
  private undoStack: Shape[][] = [];
  private strokeColor = "#ffffff";
  private lineWidth = 2;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private locked = false;
  private remoteCursors: Map<string, RemoteCursor> = new Map();
  private lastCursorSend = 0;
  private lastPencilShape: Extract<Shape, { type: "pencil" }> | null = null;
  private laserFadeTimer: ReturnType<typeof setTimeout> | null = null;
  private imageCache: Map<string, ImageBitmap> = new Map();
  private bgColor = "#1b1b1f";
  private showGrid = false;
  private highlightShape: Shape | null = null;
  private highlightTimer: ReturnType<typeof setTimeout> | null = null;

  // ── NEW TEXT BOX SELECTION & DRAG TRACKING VARIABLES ──
  private selectedShapeForDrag: Shape | null = null;
  private isDraggingShape = false;
  private dragStartX = 0;
  private dragStartY = 0;

  public onCursorsUpdate?: (cursors: RemoteCursor[]) => void;
  public onToolChange?: (tool: string) => void;
  public onAIResult?: (shape: Shape) => void;

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    this.initKeyHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("dblclick", this.dblClickHandler);
    window.removeEventListener("keydown", this.keyHandler);
  }

  setTool(tool: Tool) { this.selectedTool = tool; }
  setColor(color: string) { this.strokeColor = color; }
  setLineWidth(w: number) { this.lineWidth = w; }
  setLocked(v: boolean) { this.locked = v; }

  setBackground(color: string) {
    this.bgColor = color;
    this.clearCanvas();
  }

  setShowGrid(show: boolean) {
    this.showGrid = show;
    this.clearCanvas();
  }

  resetCanvas() {
    this.existingShapes = [];
    this.undoStack = [];
    this.clearCanvas();
  }

  insertShape(shape: any) {
    this.existingShapes.push(shape as Shape);
    this.clearCanvas();
    this.socket.send(JSON.stringify({
      type: "chat",
      message: JSON.stringify({ shape }),
      roomId: this.roomId,
    }));
  }

  findText(query: string): { found: boolean; matchCount: number } {
    if (!query.trim()) return { found: false, matchCount: 0 };
    const q = query.toLowerCase();
    const matches = this.existingShapes.filter(
      s => s.type === "text" && s.text.toLowerCase().includes(q)
    );
    if (matches.length === 0) {
      this.canvas.style.outline = "3px solid #f87171";
      setTimeout(() => { this.canvas.style.outline = "none"; }, 800);
      return { found: false, matchCount: 0 };
    }
    const first = matches[0]!;
    if (first.type === "text") {
      this.offsetX = this.canvas.width / 2 - first.x;
      this.offsetY = this.canvas.height / 2 - first.y;
    }
    this.highlightShape = first;
    if (this.highlightTimer) clearTimeout(this.highlightTimer);
    this.highlightTimer = setTimeout(() => {
      this.highlightShape = null;
      this.clearCanvas();
    }, 2000);
    this.clearCanvas();
    return { found: true, matchCount: matches.length };
  }

  undo() {
    if (!this.existingShapes.length) return;
    this.undoStack.push([...this.existingShapes]);
    this.existingShapes.pop();
    this.clearCanvas();
  }

  redo() {
    const last = this.undoStack.pop();
    if (last) { this.existingShapes = last; this.clearCanvas(); }
  }

  async recognizeShape() {
    if (!this.lastPencilShape || this.lastPencilShape.points.length < 3) {
      alert("Draw something with pencil first!"); return;
    }
    try {
      const res = await fetch("/api/recognize-shape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: this.lastPencilShape.points }),
      });
      const data = await res.json();
      if (!data.shape) return;
      const idx = this.existingShapes.indexOf(this.lastPencilShape);
      if (idx !== -1) this.existingShapes.splice(idx, 1);
      const newShape: Shape = { ...data.shape, color: this.strokeColor, lineWidth: this.lineWidth };
      this.existingShapes.push(newShape);
      this.lastPencilShape = null;
      this.clearCanvas();
      this.socket.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape: newShape }), roomId: this.roomId }));
    } catch (e) { console.error("AI failed:", e); }
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "chat") {
        const payload = JSON.parse(msg.message);
        // Sync edits/move updates seamlessly
        if (payload.action === "update_shape") {
          const idx = this.existingShapes.findIndex(s => (s as any).id === payload.shape.id);
          if (idx !== -1) {
            this.existingShapes[idx] = payload.shape;
          } else {
            this.existingShapes.push(payload.shape);
          }
        } else {
          this.existingShapes.push(payload.shape);
        }
        this.clearCanvas();
      }
      if (msg.type === "cursor") {
        this.remoteCursors.set(msg.userId, {
          userId: msg.userId, x: msg.x, y: msg.y,
          color: this.colorForUser(msg.userId),
        });
        this.onCursorsUpdate?.([...this.remoteCursors.values()]);
        this.clearCanvas();
      }
    };
  }

  private colorForUser(id: string) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
    return USER_COLORS[Math.abs(h) % USER_COLORS.length]!;
  }

  private drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = 14;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - len * Math.cos(angle - 0.4), y2 - len * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - len * Math.cos(angle + 0.4), y2 - len * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle as string;
    ctx.fill();
  }

  private drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x, y + h / 2);
    ctx.closePath();
    ctx.stroke();
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    const spikes = 5;
    const inner = r * 0.4;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const rad = (i * Math.PI) / spikes - Math.PI / 2;
      const radius = i % 2 === 0 ? r : inner;
      ctx.lineTo(cx + Math.cos(rad) * radius, cy + Math.sin(rad) * radius);
    }
    ctx.closePath();
    ctx.stroke();
  }

  private async loadImage(src: string): Promise<ImageBitmap | null> {
    if (this.imageCache.has(src)) return this.imageCache.get(src)!;
    try {
      const blob = dataURItoBlob(src);
      const bitmap = await createImageBitmap(blob);
      this.imageCache.set(src, bitmap);
      return bitmap;
    } catch { return null; }
  }

  private drawGrid(ctx: CanvasRenderingContext2D) {
    const spacing = 32;
    const dotRadius = 1;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const startX = ((this.offsetX % spacing) + spacing) % spacing;
    const startY = ((this.offsetY % spacing) + spacing) % spacing;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let x = startX; x < w; x += spacing) {
      for (let y = startY; y < h; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Helper metric tool to intelligently wrap multi-line strings within sizing boxes
  private getLinesForText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const sections = text.split("\n");
    const lines: string[] = [];
    sections.forEach(section => {
      const words = section.split(" ");
      let currentLine = words[0] || "";
      for (let i = 1; i < words.length; i++) {
        const word = words[i]!;
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
    });
    return lines;
  }

  clearCanvas() {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();

    if (this.showGrid) this.drawGrid(ctx);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);

    this.existingShapes.forEach(shape => {
      if (shape.type === "laser") return;
      ctx.strokeStyle = (shape as any).color || "#fff";
      ctx.lineWidth = (shape as any).lineWidth || 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (this.highlightShape && shape === this.highlightShape) {
        ctx.save();
        ctx.shadowColor = "#facc15";
        ctx.shadowBlur = 24;
      }

      if (shape.type === "rect") {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "diamond") {
        this.drawDiamond(ctx, shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        ctx.beginPath();
        ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
        ctx.stroke(); ctx.closePath();
      } else if (shape.type === "line") {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke(); ctx.closePath();
      } else if (shape.type === "arrow") {
        this.drawArrow(ctx, shape.x1, shape.y1, shape.x2, shape.y2);
      } else if (shape.type === "pencil") {
        drawSmoothPath(ctx, shape.points);
      } else if (shape.type === "star") {
        this.drawStar(ctx, shape.cx, shape.cy, shape.r);
      } else if (shape.type === "text") {
        // ── VISUAL IMPROVEMENT FOR THE TEXT BOX COMPONENT ──
        ctx.save();
        ctx.fillStyle = shape.color;
        const fontSize = 14 + shape.lineWidth * 2;
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textBaseline = "top";

        // Draw selection helper bounds if currently highlighted/dragged
        if (this.selectedShapeForDrag === shape) {
          ctx.strokeStyle = "rgba(167, 139, 250, 0.4)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(shape.x - 4, shape.y - 4, shape.width + 8, shape.height + 8);
          ctx.setLineDash([]);
        }

        const lines = this.getLinesForText(ctx, shape.text, shape.width);
        lines.forEach((line, index) => {
          ctx.fillText(line, shape.x, shape.y + index * (fontSize + 4));
        });
        ctx.restore();
      } else if (shape.type === "image") {
        const cached = this.imageCache.get(shape.src);
        if (cached) {
          ctx.drawImage(cached, shape.x, shape.y, shape.width, shape.height);
        } else {
          this.loadImage(shape.src).then(bitmap => {
            if (bitmap) this.clearCanvas();
          });
        }
      }

      if (this.highlightShape && shape === this.highlightShape) {
        ctx.restore();
      }
    });

    ctx.restore();

    if (this.laserPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 50, 50, 0.85)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.shadowColor = "rgba(255,0,0,0.6)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(this.laserPoints[0]!.x, this.laserPoints[0]!.y);
      this.laserPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();
    }

    this.remoteCursors.forEach(c => this.drawCursor(c.x, c.y, c.color, c.userId));
  }

  private drawCursor(x: number, y: number, color: string, userId: string) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 12, y + 4);
    ctx.lineTo(x + 4, y + 12);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = "bold 11px sans-serif";
    const label = userId.slice(0, 6);
    const w = ctx.measureText(label).width + 10;
    ctx.beginPath();
    ctx.roundRect(x + 14, y, w, 18, 4);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.fillText(label, x + 19, y + 13);
    ctx.restore();
  }

  mouseDownHandler = (e: MouseEvent) => {
    const mouseCanvasX = e.clientX - this.offsetX;
    const mouseCanvasY = e.clientY - this.offsetY;

    if (e.button === 1 || this.selectedTool === "pan") {
      this.isPanning = true;
      this.panStartX = e.clientX - this.offsetX;
      this.panStartY = e.clientY - this.offsetY;
      return;
    }

    // ── LOGIC FOR SELECT TOOL: PICK AND DRAG ANYWHERE ──
    if (this.selectedTool === "select") {
      // Find bounding collision reverse order to prioritize elements drawn on top
      const hit = [...this.existingShapes].reverse().find(s => {
        if (s.type === "text" || s.type === "rect" || s.type === "image" || s.type === "diamond") {
          const x = (s as any).x;
          const y = (s as any).y;
          const w = (s as any).width;
          const h = (s as any).height;
          return mouseCanvasX >= x && mouseCanvasX <= x + w && mouseCanvasY >= y && mouseCanvasY <= y + h;
        }
        return false;
      });

      if (hit) {
        this.selectedShapeForDrag = hit;
        this.isDraggingShape = true;
        this.dragStartX = mouseCanvasX - (hit as any).x;
        this.dragStartY = mouseCanvasY - (hit as any).y;
        this.clearCanvas();
        return;
      } else {
        this.selectedShapeForDrag = null;
        this.clearCanvas();
      }
    }

    this.clicked = true;
    this.startX = mouseCanvasX;
    this.startY = mouseCanvasY;
    
    if (this.selectedTool === "pencil" || this.selectedTool === "lasso") {
      this.pencilPoints = [{ x: this.startX, y: this.startY }];
    }
    if (this.selectedTool === "laser") {
      this.laserPoints = [{ x: e.clientX, y: e.clientY }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.isPanning) { this.isPanning = false; return; }
    if (this.isDraggingShape) {
      this.isDraggingShape = false;
      // Broadcast final position movement sync
      if (this.selectedShapeForDrag) {
        this.socket.send(JSON.stringify({
          type: "chat",
          message: JSON.stringify({ action: "update_shape", shape: this.selectedShapeForDrag }),
          roomId: this.roomId
        }));
      }
      return;
    }
    
    this.clicked = false;

    const endX = e.clientX - this.offsetX;
    const endY = e.clientY - this.offsetY;
    const width = endX - this.startX;
    const height = endY - this.startY;

    let shape: Shape | null = null;

    switch (this.selectedTool) {
      case "rect":
        shape = { type: "rect", x: this.startX, y: this.startY, width, height, color: this.strokeColor, lineWidth: this.lineWidth };
        break;
      case "diamond":
        shape = { type: "diamond", x: this.startX, y: this.startY, width, height, color: this.strokeColor, lineWidth: this.lineWidth };
        break;
      case "circle": {
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        shape = { type: "circle", centerX: this.startX + radius, centerY: this.startY + radius, radius, color: this.strokeColor, lineWidth: this.lineWidth };
        break;
      }
      case "line":
        shape = { type: "line", x1: this.startX, y1: this.startY, x2: endX, y2: endY, color: this.strokeColor, lineWidth: this.lineWidth };
        break;
      case "arrow":
        shape = { type: "arrow", x1: this.startX, y1: this.startY, x2: endX, y2: endY, color: this.strokeColor, lineWidth: this.lineWidth };
        break;
      case "star": {
        const r = Math.max(Math.abs(width), Math.abs(height)) / 2;
        shape = { type: "star", cx: this.startX + r, cy: this.startY + r, r, color: this.strokeColor, lineWidth: this.lineWidth };
        break;
      }
      case "pencil":
        if (this.pencilPoints.length > 1) {
          shape = { type: "pencil", points: [...this.pencilPoints], color: this.strokeColor, lineWidth: this.lineWidth };
          this.lastPencilShape = shape as Extract<Shape, { type: "pencil" }>;
        }
        this.pencilPoints = [];
        break;
      case "laser":
        if (this.laserFadeTimer) clearTimeout(this.laserFadeTimer);
        this.laserFadeTimer = setTimeout(() => {
          this.laserPoints = [];
          this.clearCanvas();
        }, 1200);
        return;
      case "eraser": {
        const THRESHOLD = 20;
        this.existingShapes = this.existingShapes.filter(s => {
          if (s.type === "rect" || s.type === "diamond" || s.type === "image" || s.type === "text") {
            return !(endX >= s.x - THRESHOLD && endX <= s.x + s.width + THRESHOLD &&
                     endY >= s.y - THRESHOLD && endY <= s.y + s.height + THRESHOLD);
          }
          if (s.type === "circle") {
            const dist = Math.sqrt((endX - s.centerX) ** 2 + (endY - s.centerY) ** 2);
            return dist > s.radius + THRESHOLD;
          }
          if (s.type === "line" || s.type === "arrow") {
            const dx = s.x2 - s.x1, dy = s.y2 - s.y1;
            const len2 = dx * dx + dy * dy;
            const t = Math.max(0, Math.min(1, ((endX - s.x1) * dx + (endY - s.y1) * dy) / len2));
            const nearX = s.x1 + t * dx, nearY = s.y1 + t * dy;
            const dist = Math.sqrt((endX - nearX) ** 2 + (endY - nearY) ** 2);
            return dist > THRESHOLD;
          }
          if (s.type === "pencil") {
            return !s.points.some(p =>
              Math.sqrt((endX - p.x) ** 2 + (endY - p.y) ** 2) < THRESHOLD * 2
            );
          }
          return true;
        });
        this.clearCanvas();
        return;
      }

      case "image": {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";
        document.body.appendChild(input);

        input.onchange = () => {
          const file = input.files?.[0];
          document.body.removeChild(input);
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (ev) => {
            const src = ev.target?.result as string;
            const img = new window.Image();
            img.onload = () => {
              const maxW = 400;
              const scale = Math.min(1, maxW / img.width);
              const w = img.width * scale;
              const h = img.height * scale;
              const imgShape: Shape = {
                type: "image",
                x: this.startX,
                y: this.startY,
                width: w,
                height: h,
                src,
                color: "#ffffff",
                lineWidth: 1,
              };
              this.loadImage(src).then(() => {
                this.existingShapes.push(imgShape);
                this.clearCanvas();
                this.socket.send(JSON.stringify({
                  type: "chat",
                  message: JSON.stringify({ shape: imgShape }),
                  roomId: this.roomId,
                }));
              });
            };
            img.src = src;
          };
          reader.readAsDataURL(file);
        };

        input.click();
        return;
      }

      // ── CONVERT TEXT CLICK-AND-DRAG BOX GENERATION ──
      case "text": {
        const boxWidth = Math.max(Math.abs(width), 180);
        const boxHeight = Math.max(Math.abs(height), 40);
        this.spawnTextInputOverlay(this.startX, this.startY, boxWidth, boxHeight);
        return;
      }
    }

    if (!shape) return;
    if (!this.locked) this.onToolChange?.(this.selectedTool);
    this.undoStack = [];
    this.existingShapes.push(shape);
    this.clearCanvas();
    this.socket.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape }), roomId: this.roomId }));
  };

  // Dedicated generator method for spawning real-time customizable HTML Input fields over context window
  private spawnTextInputOverlay(x: number, y: number, initialWidth: number, initialHeight: number) {
    const fontSize = 14 + this.lineWidth * 2;
    const container = document.createElement("div");
    
    // Create wrapper with built-in styling for clean sizing handles
    container.style.cssText = `
      position: fixed;
      left: ${x + this.offsetX}px;
      top: ${y + this.offsetY}px;
      width: ${initialWidth}px;
      height: ${initialHeight}px;
      z-index: 9999;
      border: 1px dashed #a78bfa;
      background: rgba(167, 139, 250, 0.05);
      padding: 2px;
      box-sizing: border-box;
    `;

    const textarea = document.createElement("textarea");
    textarea.style.cssText = `
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      color: ${this.strokeColor};
      font-size: ${fontSize}px;
      font-family: sans-serif;
      outline: none;
      resize: none;
      overflow: hidden;
      margin: 0;
      padding: 0;
      line-height: 1.2;
    `;
    
    container.appendChild(textarea);
    document.body.appendChild(container);
    textarea.focus();

    // Dynamically auto-expand vertical content bounds if text overflows container
    textarea.oninput = () => {
      if (textarea.scrollHeight > container.clientHeight) {
        container.style.height = `${textarea.scrollHeight + 10}px`;
      }
    };

    const commitText = () => {
      const text = textarea.value.trim();
      const finalWidth = container.clientWidth;
      const finalHeight = container.clientHeight;
      
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      
      if (!text) return;

      const id = crypto.randomUUID();
      const shape: Shape = {
        type: "text",
        x,
        y,
        width: finalWidth,
        height: finalHeight,
        text,
        color: this.strokeColor,
        lineWidth: this.lineWidth
      };
      
      (shape as any).id = id;
      this.existingShapes.push(shape);
      this.clearCanvas();
      this.socket.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape }), roomId: this.roomId }));
      
      if (!this.locked) {
        this.selectedTool = "select";
        this.onToolChange?.("select");
      }
    };

    textarea.onblur = commitText;
    textarea.onkeydown = (ev) => {
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        textarea.blur();
      }
    };
  }

  dblClickHandler = (e: MouseEvent) => {
    if (this.selectedTool !== "text") return;
    const x = e.clientX - this.offsetX;
    const y = e.clientY - this.offsetY;
    this.spawnTextInputOverlay(x, y, 220, 50);
  };

  mouseMoveHandler = (e: MouseEvent) => {
    const mouseCanvasX = e.clientX - this.offsetX;
    const mouseCanvasY = e.clientY - this.offsetY;

    if (this.isPanning) {
      this.offsetX = e.clientX - this.panStartX;
      this.offsetY = e.clientY - this.panStartY;
      this.clearCanvas(); return;
    }

    // Handle selection translation movement
    if (this.isDraggingShape && this.selectedShapeForDrag) {
      (this.selectedShapeForDrag as any).x = mouseCanvasX - this.dragStartX;
      (this.selectedShapeForDrag as any).y = mouseCanvasY - this.dragStartY;
      this.clearCanvas();
      return;
    }

    const now = Date.now();
    if (now - this.lastCursorSend > 50) {
      this.lastCursorSend = now;
      this.socket.send(JSON.stringify({ type: "cursor", x: e.clientX, y: e.clientY, roomId: this.roomId }));
    }

    if (!this.clicked) return;

    if (this.selectedTool === "laser") {
      this.laserPoints.push({ x: e.clientX, y: e.clientY });
      this.clearCanvas(); return;
    }

    this.clearCanvas();
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (this.selectedTool === "pencil" || this.selectedTool === "lasso") {
      this.pencilPoints.push({ x: mouseCanvasX, y: mouseCanvasY });
      this.ctx.setLineDash(this.selectedTool === "lasso" ? [4, 4] : []);
      drawSmoothPath(this.ctx, this.pencilPoints);
      this.ctx.setLineDash([]);
    } else if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, mouseCanvasX - this.startX, mouseCanvasY - this.startY);
    } else if (this.selectedTool === "diamond") {
      this.drawDiamond(this.ctx, this.startX, this.startY, mouseCanvasX - this.startX, mouseCanvasY - this.startY);
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(Math.abs(mouseCanvasX - this.startX), Math.abs(mouseCanvasY - this.startY)) / 2;
      this.ctx.beginPath();
      this.ctx.arc(this.startX + radius, this.startY + radius, radius, 0, Math.PI * 2);
      this.ctx.stroke(); this.ctx.closePath();
    } else if (this.selectedTool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(mouseCanvasX, mouseCanvasY);
      this.ctx.stroke(); this.ctx.closePath();
    } else if (this.selectedTool === "arrow") {
      this.drawArrow(this.ctx, this.startX, this.startY, mouseCanvasX, mouseCanvasY);
    } else if (this.selectedTool === "text") {
      // Draw live text container bounding preview line
      this.ctx.strokeStyle = "rgba(167, 139, 250, 0.5)";
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([4, 4]);
      this.ctx.strokeRect(this.startX, this.startY, mouseCanvasX - this.startX, mouseCanvasY - this.startY);
      this.ctx.setLineDash([]);
    }

    this.ctx.restore();
  };

  keyHandler = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); this.undo(); }
    if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); this.redo(); }
  };

  initKeyHandlers() { window.addEventListener("keydown", this.keyHandler); }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.addEventListener("dblclick", this.dblClickHandler);
  }
}