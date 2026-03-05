"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SubmitSolutionPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const jobId = params.id;

    const [repoUrl, setRepoUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [message, setMessage] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        const check = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) router.push("/login");
        };
        check();
    }, [router]);

    const submit = async () => {
        setMessage("");

        const trimmedRepo = repoUrl.trim();
        if (!trimmedRepo) {
            setMessage("Please paste a GitHub repo URL.");
            return;
        }

        setPosting(true);

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
            setPosting(false);
            setMessage("Not authenticated. Please log in again.");
            router.push("/login");
            return;
        }

        const res = await fetch("/api/submissions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                job_id: jobId,
                repo_url: trimmedRepo,
                notes: notes.trim() || null,
            }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            setMessage(data?.error || "Failed to submit.");
        } else {
            setMessage("Submitted successfully!");
            setRepoUrl("");
            setNotes("");
        }

        setPosting(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="bg-zinc-900 p-8 rounded-lg w-[420px]">
                <h1 className="text-2xl font-bold mb-4">Submit Solution</h1>

                <p className="text-sm text-gray-400 mb-4">
                    Job ID: {jobId}
                </p>

                <input
                    placeholder="GitHub repo URL"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full p-2 rounded bg-black border border-gray-600 mb-3"
                    disabled={posting}
                />

                <textarea
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 rounded bg-black border border-gray-600 mb-3"
                    disabled={posting}
                />

                <button
                    onClick={submit}
                    className="w-full bg-white text-black p-2 rounded font-semibold disabled:opacity-60"
                    disabled={posting}
                >
                    {posting ? "Submitting..." : "Submit"}
                </button>

                {message && <p className="text-sm text-gray-400 mt-3">{message}</p>}
            </div>
        </main>
    );
}