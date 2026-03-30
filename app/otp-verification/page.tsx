"use client"
import {useState} from "react"
import { useRouter } from "next/navigation";

export default function OtpVerification(){

    const [otpInput, setOtpInput] = useState("");
    const [toaster, setToaster] = useState(false);
    const [toasterData, setToasterData] = useState("");

    const router = useRouter();

    async function handleSubmit(){
        const res = await fetch(`${process.env.BACKEND_URL}/auth/otp-verification`,{
            method:'POST',
            headers:{
                "CONTENT-TYPE":"application/json"
            },
            body: JSON.stringify({otpInput})
        })

        const data = await res.json();
        if(data.success){
            localStorage.setItem("token", data.token);
            router.push("/dashboard");
        }
        setToaster(true);
        setToasterData(data.message);
        setTimeout(()=>{
            setToaster(false);
        }, 6000)
    }

    return(
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <div className="text-xl">OTP Verification Page</div>
            <input onChange={(e)=>setOtpInput(e.target.value)} type="number" placeholder="Enter OTP" />
            <button onClick={handleSubmit} className="cursor-pointer">Submit OTP</button>
        </div>
    )
}