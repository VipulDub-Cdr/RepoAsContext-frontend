"use client"
import { useState } from "react"
import { useRouter } from "next/navigation";

export default function Signup(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [toaster, setToaster] = useState(false);
    const [toasterData, setToasterData] = useState("");

    const router = useRouter();

    async function handleSignup(){
        const res = await fetch(`${process.env.BACKEND_URL}/auth/signup`,{
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email, password}),
        })
        const data = await res.json();
        setToasterData(data.message);
        setToaster(true);
        setTimeout(()=>{
            setToaster(false);
        }, 6000)
    }

    return(
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <div className="text-xl">SignUp Page</div>
            <input onChange={(e)=>setEmail(e.target.value)} type="text" placeholder="email" />
            <input onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="password" />
            <button onClick={handleSignup} className="cursor-pointer">Sign Up</button>
            {toaster && <div className="bg-white text-black">{toasterData}</div>}
        </div>
    )
}