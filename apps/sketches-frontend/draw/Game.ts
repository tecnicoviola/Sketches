// // import { Tool } from "@/components/Canvas";
// // import { getExistingShapes } from "./http";

// // type Shape = {
// //     type: "rect";
// //     x: number;
// //     y: number;
// //     width: number;
// //     height: number;
// // } | {
// //     type: "circle";
// //     centerX: number;
// //     centerY: number;
// //     radius: number;
// // } | {
// //     type: "pencil";
// //     startX: number;
// //     startY: number;
// //     endX: number;
// //     endY: number;
// // }

// // export class Game {

// //     private canvas: HTMLCanvasElement;
// //     private ctx: CanvasRenderingContext2D; //use of this 
// //     private existingShapes: Shape[]
// //     private roomId: string;
// //     private clicked: boolean;
// //     private startX = 0; //circle's dimension
// //     private startY = 0;
// //     private selectedTool: Tool = "circle";

// //     socket: WebSocket;

// //     constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
// //         this.canvas = canvas;
// //         this.ctx = canvas.getContext("2d")!;
// //         this.existingShapes = [];
// //         this.roomId = roomId;
// //         this.socket = socket;
// //         this.clicked = false;
// //         this.init();
// //         this.initHandlers(); //use of this ?
// //         this.initMouseHandlers(); //this is used for what
// //     }
    
// //     destroy() {
// //         this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

// //         this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

// //         this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
// //     }

// //     setTool(tool: "circle" | "pencil" | "rect") {
// //         this.selectedTool = tool;
// //     }

// //     async init() {
// //         this.existingShapes = await getExistingShapes(this.roomId);
// //         console.log(this.existingShapes);
// //         this.clearCanvas();
// //     }

// //     initHandlers() {
// //         this.socket.onmessage = (event) => {
// //             const message = JSON.parse(event.data);

// //             if (message.type == "chat") {
// //                 const parsedShape = JSON.parse(message.message)
// //                 this.existingShapes.push(parsedShape.shape)
// //                 this.clearCanvas();
// //             }
// //         }
// //     }
// //     //this is used with constructor 

// //     clearCanvas() {
// //         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
// //         this.ctx.fillStyle = "rgba(0, 0, 0)"
// //         this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

// //         this.existingShapes.map((shape) => {
// //             if (shape.type === "rect") {
// //                 this.ctx.strokeStyle = "rgba(255, 255, 255)" //strokestyle?
// //                 this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
// //             } else if (shape.type === "circle") {
// //                 console.log(shape);
// //                 this.ctx.beginPath();
// //                 this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
// //                 this.ctx.stroke();
// //                 this.ctx.closePath();                
// //             }
// //         })
// //     }

// //     mouseDownHandler = (e: MouseEvent) => {
// //         this.clicked = true
// //         this.startX = e.clientX
// //         this.startY = e.clientY
// //     }
// //     mouseUpHandler = (e: MouseEvent) => {
// //         this.clicked = false
// //         const width = e.clientX - this.startX; //what is e.clientX - this.startX  use of - ?
// //         const height = e.clientY - this.startY;

// //         const selectedTool = this.selectedTool;
// //         let shape: Shape | null = null;
// //         if (selectedTool === "rect") {

// //             shape = {
// //                 type: "rect",
// //                 x: this.startX,
// //                 y: this.startY,
// //                 height,
// //                 width
// //             }
// //         } else if (selectedTool === "circle") {
// //             const radius = Math.max(width, height) / 2;
// //             shape = {
// //                 type: "circle",
// //                 radius: radius,
// //                 centerX: this.startX + radius,
// //                 centerY: this.startY + radius,
// //             }
// //         }

// //         if (!shape) {
// //             return;
// //         }

// //         this.existingShapes.push(shape);

// //         this.socket.send(JSON.stringify({
// //             type: "chat",
// //             message: JSON.stringify({
// //                 shape
// //             }),
// //             roomId: this.roomId
// //         }))
// //     }
// //     mouseMoveHandler = (e: MouseEvent) => {
// //         if (this.clicked) {
// //             const width = e.clientX - this.startX;
// //             const height = e.clientY - this.startY;
// //             this.clearCanvas();
// //             this.ctx.strokeStyle = "rgba(255, 255, 255)"
// //             const selectedTool = this.selectedTool;
// //             console.log(selectedTool)
// //             if (selectedTool === "rect") {
// //                 this.ctx.strokeRect(this.startX, this.startY, width, height);   
// //             } else if (selectedTool === "circle") {
// //                 const radius = Math.max(width, height) / 2;
// //                 const centerX = this.startX + radius;
// //                 const centerY = this.startY + radius;
// //                 this.ctx.beginPath();
// //                 this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
// //                 this.ctx.stroke();
// //                 this.ctx.closePath();                
// //             }
// //         }
// //     }

// //     initMouseHandlers() {
// //         this.canvas.addEventListener("mousedown", this.mouseDownHandler)

// //         this.canvas.addEventListener("mouseup", this.mouseUpHandler)

// //         this.canvas.addEventListener("mousemove", this.mouseMoveHandler)    

// //     }
// // }

// import { Tool } from "@/components/Canvas";
// import { getExistingShapes } from "./http";

// type Shape =
//   | { type: "rect"; x: number; y: number; width: number; height: number; color: string; lineWidth: number }
//   | { type: "circle"; centerX: number; centerY: number; radius: number; color: string; lineWidth: number }
//   | { type: "line"; x1: number; y1: number; x2: number; y2: number; color: string; lineWidth: number }
//   | { type: "pencil"; points: { x: number; y: number }[]; color: string; lineWidth: number };

// export class Game {
//   private canvas: HTMLCanvasElement;
//   private ctx: CanvasRenderingContext2D;
//   private existingShapes: Shape[];
//   private roomId: string;
//   private clicked: boolean;
//   private startX = 0;
//   private startY = 0;
//   private selectedTool: Tool = "circle";
//   private pencilPoints: { x: number; y: number }[] = [];
//   private undoStack: Shape[][] = [];

//   // styling
//   private strokeColor: string = "#ffffff";
//   private lineWidth: number = 2;

//   // pan
//   private isPanning = false;
//   private panStartX = 0;
//   private panStartY = 0;
//   private offsetX = 0;
//   private offsetY = 0;

//   socket: WebSocket;

//   constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
//     this.canvas = canvas;
//     this.ctx = canvas.getContext("2d")!;
//     this.existingShapes = [];
//     this.roomId = roomId;
//     this.socket = socket;
//     this.clicked = false;
//     this.init();
//     this.initHandlers();
//     this.initMouseHandlers();
//     this.initKeyHandlers();
//   }

//   destroy() {
//     this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
//     this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
//     this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
//     window.removeEventListener("keydown", this.keyHandler);
//   }

//   setTool(tool: Tool) {
//     this.selectedTool = tool;
//   }

//   setColor(color: string) {
//     this.strokeColor = color;
//   }

//   setLineWidth(width: number) {
//     this.lineWidth = width;
//   }

//   undo() {
//     if (this.existingShapes.length === 0) return;
//     this.undoStack.push([...this.existingShapes]);
//     this.existingShapes.pop();
//     this.clearCanvas();
//   }

//   redo() {
//     if (this.undoStack.length === 0) return;
//     const last = this.undoStack.pop();
//     if (last) {
//       this.existingShapes = last;
//       this.clearCanvas();
//     }
//   }

//   async init() {
//     this.existingShapes = await getExistingShapes(this.roomId);
//     this.clearCanvas();
//   }

//   initHandlers() {
//     this.socket.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       if (message.type === "chat") {
//         const parsedShape = JSON.parse(message.message);
//         this.existingShapes.push(parsedShape.shape);
//         this.clearCanvas();
//       }
//     };
//   }

//   clearCanvas() {
//     const ctx = this.ctx;
//     ctx.save();
//     ctx.setTransform(1, 0, 0, 1, 0, 0);
//     ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
//     ctx.fillStyle = "#000000";
//     ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
//     ctx.restore();

//     ctx.save();
//     ctx.translate(this.offsetX, this.offsetY);

//     this.existingShapes.forEach((shape) => {
//       ctx.strokeStyle = shape.color || "#ffffff";
//       ctx.lineWidth = shape.lineWidth || 2;
//       ctx.lineCap = "round";
//       ctx.lineJoin = "round";

//       if (shape.type === "rect") {
//         ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

//       } else if (shape.type === "circle") {
//         ctx.beginPath();
//         ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
//         ctx.stroke();
//         ctx.closePath();

//       } else if (shape.type === "line") {
//         ctx.beginPath();
//         ctx.moveTo(shape.x1, shape.y1);
//         ctx.lineTo(shape.x2, shape.y2);
//         ctx.stroke();
//         ctx.closePath();

//       } else if (shape.type === "pencil") {
//         if (shape.points.length < 2) return;
//         ctx.beginPath();
//         ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
//         shape.points.forEach((p) => ctx.lineTo(p.x, p.y));
//         ctx.stroke();
//         ctx.closePath();
//       }
//     });

//     ctx.restore();
//   }

//   // ─── Mouse Handlers ───────────────────────────────────────────

//   mouseDownHandler = (e: MouseEvent) => {
//     // middle mouse or pan tool = pan
//     if (e.button === 1 || this.selectedTool === "pan") {
//       this.isPanning = true;
//       this.panStartX = e.clientX - this.offsetX;
//       this.panStartY = e.clientY - this.offsetY;
//       return;
//     }

//     this.clicked = true;
//     this.startX = e.clientX - this.offsetX;
//     this.startY = e.clientY - this.offsetY;

//     if (this.selectedTool === "pencil") {
//       this.pencilPoints = [{ x: this.startX, y: this.startY }];
//     }
//   };

//   mouseUpHandler = (e: MouseEvent) => {
//     if (this.isPanning) {
//       this.isPanning = false;
//       return;
//     }

//     this.clicked = false;
//     const endX = e.clientX - this.offsetX;
//     const endY = e.clientY - this.offsetY;
//     const width = endX - this.startX;
//     const height = endY - this.startY;

//     let shape: Shape | null = null;

//     if (this.selectedTool === "rect") {
//       shape = {
//         type: "rect",
//         x: this.startX,
//         y: this.startY,
//         width,
//         height,
//         color: this.strokeColor,
//         lineWidth: this.lineWidth,
//       };

//     } else if (this.selectedTool === "circle") {
//       const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
//       shape = {
//         type: "circle",
//         centerX: this.startX + radius,
//         centerY: this.startY + radius,
//         radius,
//         color: this.strokeColor,
//         lineWidth: this.lineWidth,
//       };

//     } else if (this.selectedTool === "line") {
//       shape = {
//         type: "line",
//         x1: this.startX,
//         y1: this.startY,
//         x2: endX,
//         y2: endY,
//         color: this.strokeColor,
//         lineWidth: this.lineWidth,
//       };

//     } else if (this.selectedTool === "pencil") {
//       if (this.pencilPoints.length > 1) {
//         shape = {
//           type: "pencil",
//           points: this.pencilPoints,
//           color: this.strokeColor,
//           lineWidth: this.lineWidth,
//         };
//       }
//       this.pencilPoints = [];

//     } else if (this.selectedTool === "eraser") {
//       // remove shapes near click point
//       this.existingShapes = this.existingShapes.filter((s) => {
//         if (s.type === "rect") {
//           return !(endX >= s.x && endX <= s.x + s.width && endY >= s.y && endY <= s.y + s.height);
//         }
//         return true;
//       });
//       this.clearCanvas();
//       return;
//     }

//     if (!shape) return;

//     this.undoStack = []; // clear redo stack on new action
//     this.existingShapes.push(shape);
//     this.clearCanvas();

//     this.socket.send(
//       JSON.stringify({
//         type: "chat",
//         message: JSON.stringify({ shape }),
//         roomId: this.roomId,
//       })
//     );
//   };

//   mouseMoveHandler = (e: MouseEvent) => {
//     // panning
//     if (this.isPanning) {
//       this.offsetX = e.clientX - this.panStartX;
//       this.offsetY = e.clientY - this.panStartY;
//       this.clearCanvas();
//       return;
//     }

//     if (!this.clicked) return;

//     const currentX = e.clientX - this.offsetX;
//     const currentY = e.clientY - this.offsetY;
//     const width = currentX - this.startX;
//     const height = currentY - this.startY;

//     this.clearCanvas();
//     this.ctx.save();
//     this.ctx.translate(this.offsetX, this.offsetY);
//     this.ctx.strokeStyle = this.strokeColor;
//     this.ctx.lineWidth = this.lineWidth;
//     this.ctx.lineCap = "round";
//     this.ctx.lineJoin = "round";

//     if (this.selectedTool === "pencil") {
//       this.pencilPoints.push({ x: currentX, y: currentY });
//       this.ctx.beginPath();
//       this.ctx.moveTo(this.pencilPoints[0]!.x, this.pencilPoints[0]!.y);
//       this.pencilPoints.forEach((p) => this.ctx.lineTo(p.x, p.y));
//       this.ctx.stroke();

//     } else if (this.selectedTool === "rect") {
//       this.ctx.strokeRect(this.startX, this.startY, width, height);

//     } else if (this.selectedTool === "circle") {
//       const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
//       const centerX = this.startX + radius;
//       const centerY = this.startY + radius;
//       this.ctx.beginPath();
//       this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
//       this.ctx.stroke();
//       this.ctx.closePath();

//     } else if (this.selectedTool === "line") {
//       this.ctx.beginPath();
//       this.ctx.moveTo(this.startX, this.startY);
//       this.ctx.lineTo(currentX, currentY);
//       this.ctx.stroke();
//       this.ctx.closePath();
//     }

//     this.ctx.restore();
//   };

//   // ─── Keyboard Shortcuts ───────────────────────────────────────

//   keyHandler = (e: KeyboardEvent) => {
//     if ((e.ctrlKey || e.metaKey) && e.key === "z") {
//       e.preventDefault();
//       this.undo();
//     }
//     if ((e.ctrlKey || e.metaKey) && e.key === "y") {
//       e.preventDefault();
//       this.redo();
//     }
//   };

//   initKeyHandlers() {
//     window.addEventListener("keydown", this.keyHandler);
//   }

//   initMouseHandlers() {
//     this.canvas.addEventListener("mousedown", this.mouseDownHandler);
//     this.canvas.addEventListener("mouseup", this.mouseUpHandler);
//     this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
//   }
// }

import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number; color: string; lineWidth: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number; color: string; lineWidth: number }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number; color: string; lineWidth: number }
  | { type: "pencil"; points: { x: number; y: number }[]; color: string; lineWidth: number };

interface RemoteCursor {
  userId: string;
  x: number;
  y: number;
  color: string;
}

const USER_COLORS = ["#f87171", "#4ade80", "#60a5fa", "#facc15", "#c084fc", "#fb923c", "#34d399"];

function randomColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]!;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "pencil";
  private pencilPoints: { x: number; y: number }[] = [];
  private undoStack: Shape[][] = [];
  private strokeColor: string = "#ffffff";
  private lineWidth: number = 2;
  private isPanning = false;
  private panStartX = 0;
  private panStartY = 0;
  private offsetX = 0;
  private offsetY = 0;

  private remoteCursors: Map<string, RemoteCursor> = new Map();
  private myColor: string = randomColor();
  private lastCursorSend = 0;

  private lastPencilShape: { type: "pencil"; points: { x: number; y: number }[]; color: string; lineWidth: number } | null = null;

  public onCursorsUpdate?: (cursors: RemoteCursor[]) => void;
  public onAIResult?: (shape: Shape) => void;

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
    this.initKeyHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    window.removeEventListener("keydown", this.keyHandler);
  }

  setTool(tool: Tool) { this.selectedTool = tool; }
  setColor(color: string) { this.strokeColor = color; }
  setLineWidth(width: number) { this.lineWidth = width; }

  undo() {
    if (this.existingShapes.length === 0) return;
    this.undoStack.push([...this.existingShapes]);
    this.existingShapes.pop();
    this.clearCanvas();
  }

  redo() {
    if (this.undoStack.length === 0) return;
    const last = this.undoStack.pop();
    if (last) { this.existingShapes = last; this.clearCanvas(); }
  }

  async recognizeShape() {
    if (!this.lastPencilShape || this.lastPencilShape.points.length < 3) {
      alert("Draw something with pencil first!");
      return;
    }

    const points = this.lastPencilShape.points;

    try {
      const res = await fetch("/api/recognize-shape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });

      const data = await res.json();
      if (!data.shape) return;

      const idx = this.existingShapes.indexOf(this.lastPencilShape);
      if (idx !== -1) this.existingShapes.splice(idx, 1);

      const newShape: Shape = { ...data.shape, color: this.strokeColor, lineWidth: this.lineWidth };
      this.existingShapes.push(newShape);
      this.lastPencilShape = null;
      this.clearCanvas();

      this.socket.send(JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape: newShape }),
        roomId: this.roomId,
      }));
    } catch (e) {
      console.error("AI recognition failed:", e);
    }
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      }

      if (message.type === "cursor") {
        this.remoteCursors.set(message.userId, {
          userId: message.userId,
          x: message.x,
          y: message.y,
          color: this.getColorForUser(message.userId),
        });
        this.onCursorsUpdate?.([...this.remoteCursors.values()]);
        this.clearCanvas();
      }
    };
  }

  private getColorForUser(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length]!;
  }

  clearCanvas() {
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);

    this.existingShapes.forEach((shape) => {
      ctx.strokeStyle = shape.color || "#ffffff";
      ctx.lineWidth = shape.lineWidth || 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (shape.type === "rect") {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        ctx.beginPath();
        ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      } else if (shape.type === "line") {
        ctx.beginPath();
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
        ctx.closePath();
      } else if (shape.type === "pencil") {
        if (shape.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
        shape.points.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.closePath();
      }
    });

    ctx.restore();

    // draw remote cursors on top
    this.remoteCursors.forEach((cursor) => {
      this.drawCursor(cursor.x, cursor.y, cursor.color, cursor.userId);
    });
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
    ctx.fill();
    ctx.stroke();

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
    if (e.button === 1 || this.selectedTool === "pan") {
      this.isPanning = true;
      this.panStartX = e.clientX - this.offsetX;
      this.panStartY = e.clientY - this.offsetY;
      return;
    }
    this.clicked = true;
    this.startX = e.clientX - this.offsetX;
    this.startY = e.clientY - this.offsetY;
    if (this.selectedTool === "pencil") {
      this.pencilPoints = [{ x: this.startX, y: this.startY }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (this.isPanning) { this.isPanning = false; return; }
    this.clicked = false;
    const endX = e.clientX - this.offsetX;
    const endY = e.clientY - this.offsetY;
    const width = endX - this.startX;
    const height = endY - this.startY;

    let shape: Shape | null = null;

    if (this.selectedTool === "rect") {
      shape = { type: "rect", x: this.startX, y: this.startY, width, height, color: this.strokeColor, lineWidth: this.lineWidth };
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      shape = { type: "circle", centerX: this.startX + radius, centerY: this.startY + radius, radius, color: this.strokeColor, lineWidth: this.lineWidth };
    } else if (this.selectedTool === "line") {
      shape = { type: "line", x1: this.startX, y1: this.startY, x2: endX, y2: endY, color: this.strokeColor, lineWidth: this.lineWidth };
    } else if (this.selectedTool === "pencil") {
      if (this.pencilPoints.length > 1) {
        shape = { type: "pencil", points: this.pencilPoints, color: this.strokeColor, lineWidth: this.lineWidth };
        this.lastPencilShape = shape;
      }
      this.pencilPoints = [];
    } else if (this.selectedTool === "eraser") {
      this.existingShapes = this.existingShapes.filter((s) => {
        if (s.type === "rect") return !(endX >= s.x && endX <= s.x + s.width && endY >= s.y && endY <= s.y + s.height);
        return true;
      });
      this.clearCanvas();
      return;
    }

    if (!shape) return;
    this.undoStack = [];
    this.existingShapes.push(shape);
    this.clearCanvas();

    this.socket.send(JSON.stringify({
      type: "chat",
      message: JSON.stringify({ shape }),
      roomId: this.roomId,
    }));
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.isPanning) {
      this.offsetX = e.clientX - this.panStartX;
      this.offsetY = e.clientY - this.panStartY;
      this.clearCanvas();
      return;
    }

    const now = Date.now();
    if (now - this.lastCursorSend > 50) {
      this.lastCursorSend = now;
      this.socket.send(JSON.stringify({
        type: "cursor",
        x: e.clientX,
        y: e.clientY,
        roomId: this.roomId,
      }));
    }

    if (!this.clicked) return;

    const currentX = e.clientX - this.offsetX;
    const currentY = e.clientY - this.offsetY;
    const width = currentX - this.startX;
    const height = currentY - this.startY;

    this.clearCanvas();
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (this.selectedTool === "pencil") {
      this.pencilPoints.push({ x: currentX, y: currentY });
      this.ctx.beginPath();
      this.ctx.moveTo(this.pencilPoints[0]!.x, this.pencilPoints[0]!.y);
      this.pencilPoints.forEach((p) => this.ctx.lineTo(p.x, p.y));
      this.ctx.stroke();
    } else if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      this.ctx.beginPath();
      this.ctx.arc(this.startX + radius, this.startY + radius, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
      this.ctx.closePath();
    }

    this.ctx.restore();
  };

  keyHandler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); this.undo(); }
    if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); this.redo(); }
  };

  initKeyHandlers() { window.addEventListener("keydown", this.keyHandler); }

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}