"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();

    const [email, setEmail] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [jobMessage, setJobMessage] = useState("");

    const [loadingUser, setLoadingUser] = useState(true);
    const [postingJob, setPostingJob] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            setLoadingUser(true);

            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error || !user) {
                router.push("/login");
                return;
            }

            setEmail(user.email ?? null);
            setLoadingUser(false);
        };

        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const createJob = async () => {
        setJobMessage("");

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle || !trimmedDescription) {
            setJobMessage("Please fill in both title and description.");
            return;
        }

        setPostingJob(true);

        // Get session token from Supabase in the browser
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            setPostingJob(false);
            setJobMessage("Not authenticated. Please log in again.");
            router.push("/login");
            return;
        }

        const res = await fetch("/api/jobs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                title: trimmedTitle,
                description: trimmedDescription,
            }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            setJobMessage(data?.error || "Failed to create job.");
        } else {
            setJobMessage("Job created successfully");
            setTitle("");
            setDescription("");
        }

        setPostingJob(false);
    };

    if (loadingUser) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white">
                <p className="text-gray-400">Loading...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="bg-zinc-900 p-8 rounded-lg text-center w-[400px]">
                <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

                {email && <p className="mb-4 text-gray-400">Logged in as: {email}</p>}

                <button
                    onClick={handleLogout}
                    className="bg-white text-black px-4 py-2 rounded font-semibold"
                >
                    Logout
                </button>

                <div className="mt-6 flex flex-col gap-3">
                    <h2 className="text-lg font-semibold">Create Job</h2>

                    <input
                        placeholder="Job Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="p-2 rounded bg-black border border-gray-600"
                        disabled={postingJob}
                    />

                    <textarea
                        placeholder="Job Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="p-2 rounded bg-black border border-gray-600"
                        disabled={postingJob}
                    />

                    <button
                        onClick={createJob}
                        className="bg-white text-black p-2 rounded font-semibold disabled:opacity-60"
                        disabled={postingJob}
                    >
                        {postingJob ? "Posting..." : "Post Job"}
                    </button>

                    {jobMessage && <p className="text-sm text-gray-400">{jobMessage}</p>}
                </div>
            </div>
        </main>
    );
}