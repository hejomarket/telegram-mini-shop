type QueryResult<T> = Promise<{ data: T | null; error: unknown }>;
type InsertResult = Promise<{ error: unknown }>;
type SupabaseTable = {
  insert: (rows: unknown) => { select: (columns: string) => { single: () => QueryResult<{ id: string }> } } & InsertResult;
  delete: () => { eq: (column: string, value: string) => InsertResult };
};
type SupabaseLike = { from: (table: string) => SupabaseTable };
type SupabaseModule = { createClient: (url: string, key: string, options: { auth: { persistSession: boolean; autoRefreshToken: boolean } }) => SupabaseLike };

export async function getSupabaseAdmin(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!serviceKey)return null;
  const mod = await import(/* webpackIgnore: true */ '@supabase/supabase-js') as SupabaseModule;
  return mod.createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
}
