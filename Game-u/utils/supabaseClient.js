import { createClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Create a single supabase client for interacting with your database
// Replace these with your actual Supabase URL and anon key
const supabaseUrl = "https://tiqxbfcwlafbbvntfjki.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcXhiZmN3bGFmYmJ2bnRmamtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMjI3MTEsImV4cCI6MjA1NjY5ODcxMX0.Bzy-3cbKSIYT8ViRcLVFqPAH23Lb_2Fs9PhiKyl9j2o"

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export default supabase

