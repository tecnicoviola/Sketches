import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";
export function useSocket() { 
    const [loading  , setLoading] = useState(true); 
    const [socket , setSocket] = useState<WebSocket>();

    useEffect(() => { 
        const ws =new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4YWJmMzhjZS05MTA2LTQyYzMtOTJiYS0yYTkzZDQ2MDRlM2YiLCJpYXQiOjE3NDU0OTMxODd9.m3iGmwlCp9_fYSO2qIoO8Y6dEQSDnedV4ChE9PsUKK0`);
        ws.onopen = () => { 
            setLoading(false); 
            setSocket(ws)
        }
    } , []);
    return{ 
        socket,
        loading
    }

}