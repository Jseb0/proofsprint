"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                router.push("/dashboard");
            } else {
                router.push("/login");
            }
        };

        checkSession();
    }, [router]);

    return null;
}