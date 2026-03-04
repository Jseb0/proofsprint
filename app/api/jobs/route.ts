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

        // IMPORTANT:
        // Attach the user's JWT to the Supabase client so RLS/auth.uid() works on inserts.
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });

        // Validate token and get user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const userId = userData.user.id;

        // Insert + return created row (helpful for frontend)
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
            // Common: RLS policy mismatch, missing employer role checks, etc.
            return NextResponse.json({ error: insertError.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Job created", job }, { status: 201 });
    } catch  {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}