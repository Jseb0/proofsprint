"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.signUp({
            email,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Check your email for the confirmation link.");
        }

        setLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-black text-white">
            <form
                onSubmit={handleSignup}
                className="flex flex-col gap-4 bg-zinc-900 p-8 rounded-lg"
            >
                <h1 className="text-2xl font-bold">Sign Up</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="p-2 rounded bg-black border border-gray-600"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black p-2 rounded font-semibold"
                >
                    {loading ? "Signing up..." : "Create Account"}
                </button>

                {message && <p className="text-sm text-gray-400">{message}</p>}
            </form>
        </main>
    );
}
