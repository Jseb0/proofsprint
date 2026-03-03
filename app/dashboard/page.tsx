"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();

    const [email, setEmail] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            setEmail(session.user.email ?? null);

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            if (profile) {
                setRole(profile.role);
            }
        };

        loadUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="bg-zinc-900 p-8 rounded-lg text-center">
                <h1 className="text-2xl font-bold mb-4">
                    {role === "employer"
                        ? "Employer Dashboard"
                        : "Candidate Dashboard"}
                </h1>

                {email && (
                    <p className="mb-4 text-gray-400">
                        Logged in as: {email}
                    </p>
                )}

                <button
                    onClick={handleLogout}
                    className="bg-white text-black px-4 py-2 rounded font-semibold"
                >
                    Logout
                </button>
            </div>
        </main>
    );
}