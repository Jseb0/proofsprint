import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/*
GET /api/jobs
Debug version: proves whether profiles are being returned and why posted_by is Unknown
*/
export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch jobs (include company_id explicitly)
    const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id,title,description,created_at,company_id")
        .order("created_at", { ascending: false });

    if (jobsError) {
        return NextResponse.json({ error: jobsError.message }, { status: 400 });
    }

    if (!jobs || jobs.length === 0) {
        return NextResponse.json(
            {
                debug: {
                    jobsCount: 0,
                    companyIds: [],
                    profilesCount: 0,
                    profilesError: null,
                    supabaseUrl,
                },
                jobs: [],
            },
            { status: 200 }
        );
    }

    const companyIds = jobs.map((j) => j.company_id);

    // Fetch profiles for these company IDs
    const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id,email,role")
        .in("id", companyIds);

    // Build lookup map
    const emailMap: Record<string, string> = {};
    (profiles || []).forEach((p) => {
        emailMap[p.id] = p.email;
    });

    const jobsWithEmail = jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        created_at: job.created_at,
        company_id: job.company_id,
        posted_by: emailMap[job.company_id] || "Unknown",
    }));

    return NextResponse.json(
        {
            debug: {
                jobsCount: jobs.length,
                companyIds,
                profilesCount: profiles?.length ?? 0,
                profilesError: profilesError?.message ?? null,
                profiles: profiles ?? [],
                supabaseUrl,
            },
            jobs: jobsWithEmail,
        },
        { status: 200 }
    );
}

/*
POST /api/jobs
Creates a new job
*/
export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice("Bearer ".length).trim()
            : null;

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const body = await req.json();
        const title = typeof body?.title === "string" ? body.title.trim() : "";
        const description =
            typeof body?.description === "string" ? body.description.trim() : "";

        if (!title || !description) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json(
                { error: "Server misconfigured: missing Supabase env vars" },
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

        const userId = userData.user.id;

        const { data: job, error: insertError } = await supabase
            .from("jobs")
            .insert([
                {
                    company_id: userId,
                    title,
                    description,
                },
            ])
            .select()
            .single();

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Job created", job }, { status: 201 });
    } catch (error) {
        console.error("Job creation error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}