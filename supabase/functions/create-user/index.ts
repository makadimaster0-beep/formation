// Création d'un compte professeur : réservée à l'administrateur
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (o: unknown) => new Response(JSON.stringify(o), { headers: { ...cors, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { name, email, password } = await req.json();
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization")! } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Non connecté");
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (me?.role !== "admin") throw new Error("Réservé à l’administrateur");
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
    if (error) throw error;
    await admin.from("profiles").update({ role: "prof", name, level: "C1" }).eq("id", data.user.id);
    return json({ ok: true });
  } catch (e) { return json({ error: String((e as Error).message || e) }); }
});
