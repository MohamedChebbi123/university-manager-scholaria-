"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function create_class(){



    const [roleuser, setRole] = useState<string | null>(null);
    const router=useRouter()

 useEffect(() => {
        const token = localStorage.getItem("token");
       
        if(!token){
            router.push("/UserLogin")
        }else{
            setRole(localStorage.getItem("role"))
            
        }
    }, []);




}