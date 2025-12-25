// src/server.ts
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getSupabase } from "./supabase"; // <- extensionless import avoids editor warnings

// stderr only (stdout is reserved for MCP JSON-RPC)
const log = (...a: unknown[]) => console.error("[mcp-saas]", ...a);

const server = new McpServer({ name: "lovable-saas", version: "0.1.0" });
const supabase = getSupabase();

// Helper to return text content
const text = (d: unknown): { content: Array<{ type: "text"; text: string }> } => ({
  content: [{ type: "text", text: typeof d === "string" ? d : JSON.stringify(d, null, 2) }],
});

/**
 * SDK-compat tool registrar:
 * - If your SDK has `server.tool(...)`, use it.
 * - Else fall back to `server.registerTool(...)` with description+schema.
 */
type Handler = (args: any) => Promise<{ content: Array<{ type: "text"; text: string }> }>;
function addTool(
  name: string,
  description: string,
  schema: z.ZodTypeAny,
  handler: Handler
) {
  const anyServer: any = server as any;
  if (typeof anyServer.tool === "function") {
    return anyServer.tool(name, schema, handler);
  }
  if (typeof anyServer.registerTool === "function") {
    return anyServer.registerTool(
      name,
      { description, inputSchema: schema },
      handler
    );
  }
  throw new Error("Unsupported MCP SDK version: no tool/registerTool found");
}

/** Health */
addTool(
  "health",
  "Simple status ping",
  z.object({}),
  async () => text({ ok: true, time: new Date().toISOString() })
);

/** List users */
addTool(
  "list_users",
  "Return users (optionally filtered by name)",
  z.object({ search: z.string().optional(), limit: z.number().int().min(1).max(100).default(25) }),
  async ({ search, limit }) => {
    let q = supabase.from("users").select("id,name,email,job_role,team,group,start_date,created_at").limit(limit);
    if (search) q = q.ilike("name", `%${search}%`);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return text(data);
  }
);

/** List apps */
addTool(
  "list_apps",
  "Return apps (optionally by category)",
  z.object({ category: z.string().optional(), limit: z.number().int().min(1).max(100).default(25) }),
  async ({ category, limit }) => {
    let q = supabase.from("apps").select("id,name,category,vendor,tier,owner_team,sso_required,status").limit(limit);
    if (category) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return text(data);
  }
);

/** Assign user→app (upsert) */
addTool(
  "assign_user_to_app",
  "Creates or updates a user→app assignment",
  z.object({
    user_email: z.string().email(),
    app_name: z.string(),
    role_in_app: z.string().default("Member"),
    license_type: z.string().default("Seat"),
    access_level: z.string().default("Default"),
    status: z.enum(["active", "revoked"]).default("active")
  }),
  async ({ user_email, app_name, role_in_app, license_type, access_level, status }) => {
    const { data: user, error: ue } = await supabase.from("users").select("id").eq("email", user_email).single();
    if (ue || !user) throw new Error(`User not found: ${user_email}`);

    const { data: app, error: ae } = await supabase.from("apps").select("id").eq("name", app_name).single();
    if (ae || !app) throw new Error(`App not found: ${app_name}`);

    const { data, error } = await supabase
      .from("user_app_assignments")
      .upsert(
        { user_id: user.id, app_id: app.id, role_in_app, license_type, access_level, status },
        { onConflict: "user_id,app_id" }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return text(data);
  }
);

/** List a user's assignments (assignments_expanded view) */
addTool(
  "list_user_assignments",
  "Apps assigned to a user",
  z.object({ user_email: z.string().email() }),
  async ({ user_email }) => {
    const { data, error } = await supabase
      .from("assignments_expanded")
      .select("app_name,role_in_app,license_type,status,assigned_on,email,team,group")
      .eq("email", user_email)
      .order("assigned_on", { ascending: false });

    if (error) throw new Error(error.message);
    return text(data);
  }
);

console.error("[mcp-saas] registering create_user");
addTool(
  "create_user",
  "Create a new user in the 'users' table",
  z.object({
    name: z.string().min(1, "name is required"),
    email: z.string().email(),
    job_role: z.string().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
    group: z.string().optional(),
    team: z.string().optional()
  }),
  async ({ name, email, job_role, start_date, group, team }) => {
    const payload = {
      name,
      email: email.toLowerCase(),
      job_role: job_role ?? null,
      start_date: start_date ?? null,
      group: group ?? null,
      team: team ?? null
    };

    const { data, error } = await supabase
      .from("users")
      .insert(payload)
      .select()
      .single();

    if (error) {
      // Friendly duplicate-email message
      const msg = (error as any).message || "";
      if ((error as any).code === "23505" || /duplicate key|already exists/i.test(msg)) {
        throw new Error("A user with that email already exists.");
      }
      throw new Error(msg);
    }

    return text(data);
  }
);



const transport = new StdioServerTransport();
// Top-level await requires "module": "ES2022" in tsconfig and Node 20+
await server.connect(transport);
log("MCP server started (stdio).");