// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ffgjrubewtlbbhfodyqz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pydWJld3RsYmJoZm9keXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMDE5MjYsImV4cCI6MjA2NTg3NzkyNn0.T8H9b07kBTHTlUMVC8rBa7kcG_GvY6wSeBvm4KddXKc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);