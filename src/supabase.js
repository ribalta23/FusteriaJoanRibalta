import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cpyjgfdehyczvwikzrit.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNweWpnZmRlaHljenZ3aWt6cml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTI2MTAsImV4cCI6MjA1NjY4ODYxMH0.zoxaPmX9Oysv_BjgIGpuLtDhDBtrlD2XBQPjlFVKG7s'
const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }