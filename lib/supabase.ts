import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* Supabase client (браузерт). Нэвтрэлтийн session нь localStorage-д хадгалагдана.
   Өгөгдлийг хүснэгт бүрийн RLS хамгаална — багш зөвхөн өөрийн мөрүүдийг харна. */

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY тохируулаагүй байна (.env.local).");
    client = createClient(url, key);
  }
  return client;
}
