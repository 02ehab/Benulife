import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://scsbtrpauqffzhskcvtx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjc2J0cnBhdXFmZnpoc2tjdnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5OTYyOTIsImV4cCI6MjA3MDU3MjI5Mn0.QTR-oyBI6hILH5-Kt37qW8SM7CUgUfomWODHbCCgIT8';

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
