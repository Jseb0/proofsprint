"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
            return;
        }

        // Important: give Supabase time to persist cookie
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Force server refresh so middleware sees session
        router.refresh();

        // Then navigate
        router.push("/dashboard");

        setLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-black text-white">
            <form
                onSubmit={handleLogin}
                className="flex flex-col gap-4 bg-zinc-900 p-8 rounded-lg"
            >
                <h1 className="text-2xl font-bold">Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="p-2 rounded bg-black border border-gray-600"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="p-2 rounded bg-black border border-gray-600"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black p-2 rounded font-semibold"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {message && (
                    <p className="text-sm text-red-400 text-center">{message}</p>
                )}
            </form>
        </main>
    );
}