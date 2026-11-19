import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let client: SupabaseClient | null = null;

/** Server-side client with the service role key. Never ship this key to a browser. */
export function db(): SupabaseClient {
  if (!client) {
    client = createClient(env.supabaseUrl(), env.supabaseKey(), {
      auth: { persistSession: false },
    });
  }
  return client;
}

export type Rules = {
  goal: number;
  welcome: number;
  cooldownMinutes: number;
  storyPerWeek: number;
};

export type PassRow = {
  serial: string;
  tenant_id: string;
  customer_id: string;
  auth_token: string;
  stamps: number;
  reward_ready: boolean;
  last_stamp_at: string | null;
  updated_at: string;
};

export type PassView = PassRow & {
  first_name: string;
  /** The member's saved order, shown on the card and to the barista on every scan. */
  usual: string | null;
  tenant_name: string;
  rules: Rules;
};

export async function getPassView(serial: string): Promise<PassView | null> {
  const { data, error } = await db()
    .from("passes")
    .select("*, customers(first_name, usual), tenants(name, rules)")
    .eq("serial", serial)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as PassRow & {
    customers: { first_name: string; usual: string | null };
    tenants: { name: string; rules: Rules };
  };
  return {
    ...row,
    first_name: row.customers.first_name,
    usual: row.customers.usual ?? null,
    tenant_name: row.tenants.name,
    rules: row.tenants.rules,
  };
}
