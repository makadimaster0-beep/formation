// Reçoit la confirmation de paiement Stripe et débloque automatiquement l'élève
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
const enc = new TextEncoder();
async function verify(body: string, sig: string, secret: string) {
  const p = Object.fromEntries(sig.split(",").map((x) => x.split("=") as [string, string]));
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(p.t + "." + body));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("") === p.v1;
}
Deno.serve(async (req) => {
  const body = await req.text();
  if (!(await verify(body, req.headers.get("stripe-signature") || "", Deno.env.get("STRIPE_WEBHOOK_SECRET")!))) return new Response("bad signature", { status: 400 });
  const ev = JSON.parse(body);
  if (ev.type === "checkout.session.completed" && ev.data.object.payment_status === "paid") {
    const s = ev.data.object;
    const [uid, cid] = (s.client_reference_id || "").split(":");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await admin.from("payments").upsert({ user_id: uid, course_id: cid, amount: s.amount_total / 100, currency: s.currency, status: "paid", stripe_session: s.id }, { onConflict: "stripe_session" });
    await admin.from("enrollments").upsert({ user_id: uid, course_id: cid, paid: true });
    const { data: c } = await admin.from("courses").select("title").eq("id", cid).single();
    await admin.from("notifications").insert({ user_id: uid, course_id: cid, msg: "PAID|" + (c?.title || "") });
  }
  return new Response("ok");
});
