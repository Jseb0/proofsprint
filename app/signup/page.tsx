"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUp() {
    const router = useRouter();

    const [role, setRole] = useState("candidate");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
            setLoading(false);
            return;
        }

        const user = data.user;

        if (user) {
            const { error: profileError } = await supabase
                .from("profiles")
                .insert([
                    {
                        id: user.id,
                        email: user.email,
                        role: role,
                    },
                ]);

            if (profileError) {
                console.error(profileError);
                setMessage("Profile creation failed.");
                setLoading(false);
                return;
            }
        }

        setLoading(false);
        router.push("/login");
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-black text-white">
            <form
                onSubmit={handleSignup}
                className="flex flex-col gap-4 bg-zinc-900 p-8 rounded-lg"
            >
                <h1 className="text-2xl font-bold">Sign Up</h1>

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="p-2 rounded bg-black border border-gray-600"
                >
                    <option value="candidate">Candidate</option>
                    <option value="employer">Employer</option>
                </select>

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
                    {loading ? "Creating..." : "Create Account"}
                </button>

                {message && <p className="text-sm text-gray-400">{message}</p>}
            </form>
        </main>
    );
}