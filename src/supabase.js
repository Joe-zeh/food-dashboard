import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ckpumicppiybbxdvmlwe.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrcHVtaWNwcGl5YmJ4ZHZtbHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDY5MDIsImV4cCI6MjA5NzEyMjkwMn0._9R4-E2Yf-odeMVBZekbWB16Vin85Zovg3bKsLw0SvA";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
