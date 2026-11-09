// Crée une session de paiement Stripe pour un cours payant
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { course_id, return_url } = await req.json();
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization")! } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Non connecté");
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: c } = await admin.from("courses").select("id,title,price,currency").eq("id", course_id).single();
    if (!c || !(c.price > 0)) throw new Error("Cours introuvable ou gratuit");
    const body = new URLSearchParams({
      mode: "payment", success_url: return_url + "?paid=1", cancel_url: return_url,
      client_reference_id: user.id + ":" + c.id, customer_email: user.email!,
      "line_items[0][quantity]": "1", "line_items[0][price_data][currency]": c.currency,
      "line_items[0][price_data][unit_amount]": String(Math.round(c.price * 100)),
      "line_items[0][price_data][product_data][name]": c.title,
    });
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: "Bearer " + Deno.env.get("STRIPE_SECRET_KEY"), "Content-Type": "application/x-www-form-urlencoded" }, body });
    const s = await r.json();
    if (!r.ok) throw new Error(s.error?.message || "Stripe");
    return json({ url: s.url });
  } catch (e) { return json({ error: String((e as Error).message || e) }, 400); }
});
