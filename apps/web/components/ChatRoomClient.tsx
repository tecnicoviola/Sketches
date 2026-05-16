"use client"

import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export default function  ChatRoomClient({
    messages ,
    id
}: { 
    messages : {message : string}[]; 
    id: string
})
{
    const [chats , setChats] = useState(messages);
    const [currentM , setCurrentM ] = useState("");
    const {socket , loading } = useSocket(); 

    useEffect(()=> { 
        if(socket && !loading){  


            socket.send(JSON.stringify({
                type: "join_room", 
                roomId : id 
            }));
            socket.onmessage = (event) => { 
                const parseData = JSON.parse(event.data);
                if(parseData.type === "chat"){ 
                    setChats(c => [ ...c , {message : parseData.message}])
                }
            }
        }
    },[socket , loading , id])
    return <div>
        {chats.map((m) => <div>{m.message}</div>)}

        <input type="text"  value={currentM} onChange={(e)=> {setCurrentM(e.target.value )}} />
        <button onClick={()=> { 
            socket?.send(JSON.stringify({
                type : "chat" , 
                roomId : id , 
                message : currentM
            }))
            setCurrentM("")
        }}>Send message</button>
    </div>
}