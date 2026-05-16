"use client";

import { WS_URL } from "../config";
import { initDraw } from "../draw";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwNmE0MjM3OS02YjE2LTQ2NjEtOWFhNi0zYWQzM2U3Y2I0ZGIiLCJpYXQiOjE3NzY5MjIyMjF9.b1ZxGLW-pZNKWaTTByj8ldrqGW3-606kBXikzdt2Ma4`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }
        
    }, [])
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}