/**
 * Configuration for the Kingdom & Furstentumer Demo
 * 
 * IMPORTANT: This file shows how to configure the demo.
 * You have two options:
 * 
 * Option 1: Edit index.html directly (simpler)
 *   - Open index.html
 *   - Find these lines near the top of the <script> section:
 *     const supabaseUrl = 'YOUR_SUPABASE_URL';
 *     const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
 *   - Replace with your actual values
 * 
 * Option 2: Use this external config (more maintainable)
 *   - Rename this file to config.js
 *   - Edit the values below
 *   - Add <script src="config.js"></script> before the main script in index.html
 * 
 * Get your credentials from: https://app.supabase.com/project/[your-project]/settings/api
 */

// Your Supabase Project URL
// Looks like: https://your-project-ref.supabase.co
const supabaseUrl = 'YOUR_SUPABASE_URL_HERE';

// Your Supabase Anon Key
// Use the "anon public" key, NOT the service role key
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Export for use in other modules (if using ES6 modules)
// export { supabaseUrl, supabaseKey };
