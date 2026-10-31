/**
 * Side-by-Side Comparison: Supabase Client vs PostgREST API
 * 
 * This script demonstrates the same operations using both approaches.
 * 
 * Run: npm install && node demo_comparison.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERROR: Missing SUPABASE_URL or SUPABASE_KEY in .env file');
    process.exit(1);
}

// Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// PostgREST endpoint
const POSTGREST_URL = `${SUPABASE_URL}/rest/v1`;
const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

/**
 * Make a request to PostgREST API
 */
async function postgrestRequest(method, endpoint, data = null) {
    const url = `${POSTGREST_URL}${endpoint}`;
    const options = { method, headers };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        let result;
        try {
            result = await response.json();
        } catch (e) {
            result = await response.text();
        }
        return { ok: response.ok, status: response.status, json: response.ok ? result : null, text: !response.ok ? result : null };
    } catch (error) {
        return { ok: false, status: null, json: null, text: error.message };
    }
}

async function demoComparison() {
    console.log('='.repeat(70));
    console.log('SUPABASE CLIENT vs POSTGREST API - SIDE BY SIDE COMPARISON');
    console.log('='.repeat(70));

    // ========================================================================
    // OPERATION 1: SELECT ALL TODOS
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('OPERATION 1: Select all todos');
    console.log('='.repeat(70));

    // Supabase Client
    console.log('\n  SUPABASE CLIENT:');
    console.log('  Code: await supabase.from(\'todos\').select(\'*\').order(\'id\')');
    try {
        const { data: todos, error } = await supabase
            .from('todos')
            .select('*')
            .order('id');
        if (error) {
            console.log(`  ✗ Error: ${error.message}`);
        } else {
            console.log(`  ✓ Result: ${todos.length} todos`);
        }
    } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
    }

    // PostgREST
    console.log('\n  POSTGREST API:');
    console.log('  URL: GET /todos');
    const response = await postgrestRequest('GET', '/todos');
    if (response.ok) {
        const todos = response.json;
        console.log(`  ✓ Result: ${todos.length} todos`);
    } else {
        console.log(`  ✗ Error: ${response.status} - ${response.text}`);
    }

    // ========================================================================
    // OPERATION 2: SELECT WITH FILTER
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('OPERATION 2: Select todos where is_complete = false');
    console.log('='.repeat(70));

    // Supabase Client
    console.log('\n  SUPABASE CLIENT:');
    console.log('  Code: await supabase.from(\'todos\').select(\'*\').eq(\'is_complete\', false)');
    try {
        const { data: todos, error } = await supabase
            .from('todos')
            .select('*')
            .eq('is_complete', false);
        if (error) {
            console.log(`  ✗ Error: ${error.message}`);
        } else {
            console.log(`  ✓ Result: ${todos.length} incomplete todos`);
        }
    } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
    }

    // PostgREST
    console.log('\n  POSTGREST API:');
    console.log('  URL: GET /todos?is_complete=eq.false');
    const filterResponse = await postgrestRequest('GET', '/todos?is_complete=eq.false');
    if (filterResponse.ok) {
        const todos = filterResponse.json;
        console.log(`  ✓ Result: ${todos.length} incomplete todos`);
    } else {
        console.log(`  ✗ Error: ${filterResponse.status} - ${filterResponse.text}`);
    }

    // ========================================================================
    // OPERATION 3: INSERT
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('OPERATION 3: Insert a new todo');
    console.log('='.repeat(70));

    const newTodo = {
        title: 'Compare Approaches',
        description: 'See differences between Supabase client and PostgREST',
        is_complete: false
    };

    // Supabase Client
    console.log('\n  SUPABASE CLIENT:');
    console.log('  Code: await supabase.from(\'todos\').insert(newTodo).select().single()');
    try {
        const { data: inserted, error } = await supabase
            .from('todos')
            .insert(newTodo)
            .select()
            .single();
        if (error) {
            console.log(`  ✗ Error: ${error.message}`);
        } else {
            console.log(`  ✓ Result: Inserted todo with ID ${inserted.id}`);
            const supabaseId = inserted.id;
        }
    } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
    }

    // PostgREST
    console.log('\n  POSTGREST API:');
    console.log('  URL: POST /todos');
    console.log('  Body:', JSON.stringify(newTodo, null, 2));
    const insertResponse = await postgrestRequest('POST', '/todos', newTodo);
    if (insertResponse.ok) {
        const inserted = insertResponse.json[0];
        console.log(`  ✓ Result: Inserted todo with ID ${inserted.id}`);
    } else {
        console.log(`  ✗ Error: ${insertResponse.status} - ${insertResponse.text}`);
    }

    // ========================================================================
    // OPERATION 4: SELECT WITH ORDERING AND LIMIT
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('OPERATION 4: Select todos ordered by created_at DESC, limit 5');
    console.log('='.repeat(70));

    // Supabase Client
    console.log('\n  SUPABASE CLIENT:');
    console.log('  Code: await supabase.from(\'todos\').select(\'*\').order(\'created_at\', { ascending: false }).limit(5)');
    try {
        const { data: todos, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
        if (error) {
            console.log(`  ✗ Error: ${error.message}`);
        } else {
            console.log(`  ✓ Result: ${todos.length} todos`);
        }
    } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
    }

    // PostgREST
    console.log('\n  POSTGREST API:');
    console.log('  URL: GET /todos?order=created_at.desc&limit=5');
    const orderedResponse = await postgrestRequest('GET', '/todos?order=created_at.desc&limit=5');
    if (orderedResponse.ok) {
        const todos = orderedResponse.json;
        console.log(`  ✓ Result: ${todos.length} todos`);
    } else {
        console.log(`  ✗ Error: ${orderedResponse.status} - ${orderedResponse.text}`);
    }

    // ========================================================================
    // OPERATION 5: SELECT SPECIFIC COLUMNS
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('OPERATION 5: Select only id and title columns');
    console.log('='.repeat(70));

    // Supabase Client
    console.log('\n  SUPABASE CLIENT:');
    console.log('  Code: await supabase.from(\'todos\').select(\'id, title\')');
    try {
        const { data: todos, error } = await supabase
            .from('todos')
            .select('id, title');
        if (error) {
            console.log(`  ✗ Error: ${error.message}`);
        } else {
            console.log(`  ✓ Result: ${todos.length} todos`);
        }
    } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
    }

    // PostgREST
    console.log('\n  POSTGREST API:');
    console.log('  URL: GET /todos?select=id,title');
    const selectResponse = await postgrestRequest('GET', '/todos?select=id,title');
    if (selectResponse.ok) {
        const todos = selectResponse.json;
        console.log(`  ✓ Result: ${todos.length} todos`);
    } else {
        console.log(`  ✗ Error: ${selectResponse.status} - ${selectResponse.text}`);
    }

    // ========================================================================
    // OPERATION 6: COMPLEX FILTER (OR)
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('OPERATION 6: Select todos where title contains "Learn" OR "Compare"');
    console.log('='.repeat(70));

    // Supabase Client
    console.log('\n  SUPABASE CLIENT:');
    console.log('  Code: await supabase.from(\'todos\').select(\'*\').or(\'title.ilike.%Learn%,title.ilike.%Compare%\')');
    try {
        const { data: todos, error } = await supabase
            .from('todos')
            .select('*')
            .or('title.ilike.%Learn%,title.ilike.%Compare%');
        if (error) {
            console.log(`  ✗ Error: ${error.message}`);
        } else {
            console.log(`  ✓ Result: ${todos.length} todos`);
        }
    } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
    }

    // PostgREST
    console.log('\n  POSTGREST API:');
    console.log('  URL: GET /todos?or=(title.ilike.*Learn*,title.ilike.*Compare*)');
    const orResponse = await postgrestRequest('GET', '/todos?or=(title.ilike.*Learn*,title.ilike.*Compare*)');
    if (orResponse.ok) {
        const todos = orResponse.json;
        console.log(`  ✓ Result: ${todos.length} todos`);
    } else {
        console.log(`  ✗ Error: ${orResponse.status} - ${orResponse.text}`);
    }

    // ========================================================================
    // OPERATION 7: COUNT
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('OPERATION 7: Count all todos');
    console.log('='.repeat(70));

    // Supabase Client
    console.log('\n  SUPABASE CLIENT:');
    console.log('  Code: await supabase.from(\'todos\').select(\'*\', { count: \'exact\', head: true })');
    try {
        const { count, error } = await supabase
            .from('todos')
            .select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`  ✗ Error: ${error.message}`);
        } else {
            console.log(`  ✓ Result: Total ${count} todos`);
        }
    } catch (error) {
        console.log(`  ✗ Error: ${error.message}`);
    }

    // PostgREST
    console.log('\n  POSTGREST API:');
    console.log('  URL: GET /todos?select=id&order=id.asc&limit=0');
    console.log('  Note: Count is in Content-Range header');
    const countResponse = await postgrestRequest('GET', '/todos?select=id&order=id.asc&limit=0');
    if (countResponse.ok) {
        console.log(`  ✓ Result: Count available in headers`);
    } else {
        console.log(`  ✗ Error: ${countResponse.status} - ${countResponse.text}`);
    }

    // ========================================================================
    // OPERATION 8: DELETE (EXAMPLE ONLY)
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('OPERATION 8: Delete a todo (example, not executed)');
    console.log('='.repeat(70));

    console.log('\n  SUPABASE CLIENT:');
    console.log('  Code: await supabase.from(\'todos\').delete().eq(\'id\', todoId)');

    console.log('\n  POSTGREST API:');
    console.log('  URL: DELETE /todos?id=eq.{todoId}');

    console.log('\n  ⚠ Note: DELETE operations are not executed in this demo');

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`
Both approaches accomplish the same tasks, but with different trade-offs:

  SUPABASE JAVASCRIPT CLIENT:
    ✓ More readable and maintainable
    ✓ TypeScript support built-in
    ✓ Handles authentication seamlessly
    ✓ Real-time subscriptions built-in
    ✓ Easier to refactor
    ✓ Better error handling
    
  POSTGREST API:
    ✓ More control over raw HTTP requests
    ✓ Useful for debugging
    ✓ Works from any language with HTTP support
    ✓ Good for understanding the underlying API
    ✓ Lightweight (no client library needed)
    
  RECOMMENDATION:
    - Use the Supabase JavaScript client for production applications
    - Use direct PostgREST API for learning, debugging, or when you need
      more control
    - Both can be used together in the same application
`);

    console.log('='.repeat(70));
    console.log('DEMO COMPLETE!');
    console.log('='.repeat(70));
}

// Run the demo
demoComparison().catch(console.error);
