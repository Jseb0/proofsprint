import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice("Bearer ".length).trim()
            : null;

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json(
                { error: "Server misconfigured" },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await req.json();
        const jobId = typeof body?.job_id === "string" ? body.job_id.trim() : "";
        const repoUrl = typeof body?.repo_url === "string" ? body.repo_url.trim() : "";
        const notes = typeof body?.notes === "string" ? body.notes.trim() : null;

        if (!jobId || !repoUrl) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const { data: submission, error: insertError } = await supabase
            .from("submissions")
            .insert([
                {
                    job_id: jobId,
                    candidate_id: userData.user.id,
                    repo_url: repoUrl,
                    notes,
                },
            ])
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 400 });
        }

        return NextResponse.json(
            { message: "Submission created", submission },
            { status: 201 }
        );
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}