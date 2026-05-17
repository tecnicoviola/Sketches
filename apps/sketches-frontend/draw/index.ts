import { HTTP_BACKEND } from "../config";
import axios from "axios";

type Shape =
  | { type: "rect"; x: number; y: number; width: number; height: number }
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number }
  | { type: "pencil"; points: { x: number; y: number }[] };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");
  let existingShapes: Shape[] = await getExistingShapes(roomId);

  if (!ctx) return;

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape.shape);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  // ✅ pencil points array
  let pencilPoints: { x: number; y: number }[] = [];

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;

    // @ts-ignore
    const selectedTool = window.selectedTool;

    // ✅ reset pencil points on new stroke
    if (selectedTool === "pencil") {
      pencilPoints = [{ x: e.clientX, y: e.clientY }];
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;

    // @ts-ignore
    const selectedTool = window.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      shape = { type: "rect", x: startX, y: startY, width, height };

    } else if (selectedTool === "circle") {
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      shape = {
        type: "circle",
        centerX: startX + radius,
        centerY: startY + radius,
        radius,
      };

    } else if (selectedTool === "line") {
      shape = { type: "line", x1: startX, y1: startY, x2: e.clientX, y2: e.clientY };

    } else if (selectedTool === "pencil") {
      // ✅ save all collected points as one pencil shape
      if (pencilPoints.length > 1) {
        shape = { type: "pencil", points: pencilPoints };
      }
      pencilPoints = [];
    }

    if (!shape) return;

    existingShapes.push(shape);
    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId,
      })
    );
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!clicked) return;

    // @ts-ignore
    const selectedTool = window.selectedTool;

    if (selectedTool === "pencil") {
      // ✅ collect points while drawing
      pencilPoints.push({ x: e.clientX, y: e.clientY });
      clearCanvas(existingShapes, canvas, ctx);

      // draw current pencil stroke live
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(pencilPoints[0]!.x, pencilPoints[0]!.y);
      pencilPoints.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      return;
    }

    const width = e.clientX - startX;
    const height = e.clientY - startY;
    clearCanvas(existingShapes, canvas, ctx);
    ctx.strokeStyle = "rgba(255,255,255)";
    ctx.lineWidth = 2;

    if (selectedTool === "rect") {
      ctx.strokeRect(startX, startY, width, height);

    } else if (selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      const centerX = startX + radius;
      const centerY = startY + radius;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();

    } else if (selectedTool === "line") {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
      ctx.closePath();
    }
  });
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.forEach((shape) => {
    ctx.strokeStyle = "rgba(255,255,255)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();

    } else if (shape.type === "line") {
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
      ctx.closePath();

    } else if (shape.type === "pencil") {
      // draw all pencil points as a smooth path
      if (shape.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(shape.points[0]!.x, shape.points[0]!.y);
      shape.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.closePath();
    }
  });
}

async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
  const messages = res.data.messages;
  return messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });
}