"use client";

import { useEffect, useState } from "react";

type Job = {
    id: string;
    title: string;
    description: string;
    created_at: string;
    company_id?: string;
    posted_by: string;
};

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadJobs = async () => {
            const res = await fetch("/api/jobs", { cache: "no-store" });
            const data = await res.json();

            setJobs((data.jobs || []) as Job[]);
            setLoading(false);
        };

        loadJobs();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white">
                Loading jobs...
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white p-10">
            <h1 className="text-3xl font-bold mb-8">Job Board</h1>

            <div className="grid gap-6 max-w-3xl">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className="border border-gray-700 p-6 rounded-lg bg-zinc-900"
                    >
                        <h2 className="text-xl font-semibold">{job.title}</h2>

                        <p className="text-gray-400 mt-2">{job.description}</p>

                        <p className="text-sm text-gray-500 mt-4">
                            Posted by: {job.posted_by ?? "Unknown"}
                        </p>

                        <a
                            href={`/jobs/${job.id}/submit`}
                            className="inline-block mt-4 bg-white text-black px-3 py-2 rounded font-semibold"
                        >
                            Submit solution
                        </a>
                    </div>
                ))}
            </div>
        </main>
    );
}