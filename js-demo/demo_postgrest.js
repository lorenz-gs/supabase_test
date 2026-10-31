/**
 * Direct PostgREST API Demo
 * 
 * This script demonstrates how to use PostgREST API directly via fetch.
 * PostgREST is the RESTful API layer that powers Supabase.
 * 
 * Run: npm install && node demo_postgrest.js
 */

require('dotenv').config();

// Get Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERROR: Missing SUPABASE_URL or SUPABASE_KEY in .env file');
    console.error('Copy .env.example to .env and add your credentials');
    process.exit(1);
}

// PostgREST endpoint is the Supabase URL + /rest/v1
const POSTGREST_URL = `${SUPABASE_URL}/rest/v1`;

// Headers for all requests
const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    // Prevents PostgREST from returning rows affected count
    'Prefer': 'return=representation'
};

/**
 * Make a request to PostgREST API
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {string} endpoint - API endpoint path
 * @param {Object} [data] - Request body for POST/PATCH
 * @returns {Promise<Object>} - Response object with status, json, text
 */
async function postgrestRequest(method, endpoint, data = null) {
    const url = `${POSTGREST_URL}${endpoint}`;
    
    const options = {
        method,
        headers
    };
    
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
        
        return {
            ok: response.ok,
            status: response.status,
            json: response.ok ? result : null,
            text: !response.ok ? result : null
        };
    } catch (error) {
        return {
            ok: false,
            status: null,
            json: null,
            text: error.message
        };
    }
}

async function demoPostgrestApi() {
    console.log('='.repeat(60));
    console.log('POSTGREST DIRECT API DEMO');
    console.log('='.repeat(60));

    // ========================================================================
    // 1. GET: SELECT ALL TODOS
    // ========================================================================
    console.log('\n1. GET: Selecting all todos...');
    console.log('   URL: GET /todos');
    
    const response = await postgrestRequest('GET', '/todos');
    if (response.ok) {
        const todos = response.json;
        console.log(`   ✓ Found ${todos.length} todos`);
        todos.forEach(todo => {
            const status = todo.is_complete ? '✓' : '○';
            console.log(`      ${status} ${todo.id}: ${todo.title}`);
        });
    } else {
        console.log(`   ✗ Error: ${response.status} - ${response.text}`);
    }

    // ========================================================================
    // 2. POST: INSERT A NEW TODO
    // ========================================================================
    console.log('\n2. POST: Inserting a new todo...');
    console.log('   URL: POST /todos');
    
    const newTodo = {
        title: 'Learn PostgREST',
        description: 'Direct API access to PostgreSQL',
        is_complete: false
    };
    console.log('   Body:', JSON.stringify(newTodo, null, 2));
    
    const insertResponse = await postgrestRequest('POST', '/todos', newTodo);
    if (insertResponse.ok) {
        const createdTodo = insertResponse.json[0];
        console.log(`   ✓ Created todo with ID: ${createdTodo.id}`);
        const todoId = createdTodo.id;

        // ========================================================================
        // 3. GET: SELECT WITH FILTERING
        // ========================================================================
        console.log('\n3. GET: Filtering incomplete todos...');
        console.log('   URL: GET /todos?is_complete=eq.false');
        
        const filterResponse = await postgrestRequest('GET', '/todos?is_complete=eq.false');
        if (filterResponse.ok) {
            const incompleteTodos = filterResponse.json;
            console.log(`   ✓ Found ${incompleteTodos.length} incomplete todos`);
            incompleteTodos.forEach(todo => {
                console.log(`      - ${todo.title}`);
            });
        } else {
            console.log(`   ✗ Error: ${filterResponse.status} - ${filterResponse.text}`);
        }

        // ========================================================================
        // 4. GET: SELECT WITH ORDERING AND LIMITING
        // ========================================================================
        console.log('\n4. GET: Ordered todos (limit 3)...');
        console.log('   URL: GET /todos?order=created_at.desc&limit=3');
        
        const orderedResponse = await postgrestRequest('GET', '/todos?order=created_at.desc&limit=3');
        if (orderedResponse.ok) {
            const todos = orderedResponse.json;
            console.log(`   ✓ Found ${todos.length} todos`);
            todos.forEach(todo => {
                console.log(`      - ${todo.title} (created: ${todo.created_at})`);
            });
        } else {
            console.log(`   ✗ Error: ${orderedResponse.status} - ${orderedResponse.text}`);
        }

        // ========================================================================
        // 5. GET: SELECT SPECIFIC COLUMNS
        // ========================================================================
        console.log('\n5. GET: Selecting only id and title columns...');
        console.log('   URL: GET /todos?select=id,title');
        
        const selectResponse = await postgrestRequest('GET', '/todos?select=id,title');
        if (selectResponse.ok) {
            const todos = selectResponse.json;
            console.log(`   ✓ Found ${todos.length} todos`);
            todos.forEach(todo => {
                console.log(`      - ID: ${todo.id}, Title: ${todo.title}`);
            });
        } else {
            console.log(`   ✗ Error: ${selectResponse.status} - ${selectResponse.text}`);
        }

        // ========================================================================
        // 6. PATCH: UPDATE A TODO
        // ========================================================================
        console.log(`\n6. PATCH: Updating todo ID ${todoId}...`);
        console.log(`   URL: PATCH /todos?id=eq.${todoId}`);
        
        const updateData = {
            is_complete: true,
            title: 'Learned PostgREST!'
        };
        console.log('   Body:', JSON.stringify(updateData, null, 2));
        
        const updateResponse = await postgrestRequest('PATCH', `/todos?id=eq.${todoId}`, updateData);
        if (updateResponse.ok) {
            const updatedTodo = updateResponse.json[0];
            console.log(`   ✓ Updated todo: ${updatedTodo.title}`);
        } else {
            console.log(`   ✗ Error: ${updateResponse.status} - ${updateResponse.text}`);
        }

        // ========================================================================
        // 7. GET: USING NOT FILTER
        // ========================================================================
        console.log('\n7. GET: Using NOT filter (not is_complete)...');
        console.log('   URL: GET /todos?is_complete=neq.true');
        
        const notResponse = await postgrestRequest('GET', '/todos?is_complete=neq.true');
        if (notResponse.ok) {
            const todos = notResponse.json;
            console.log(`   ✓ Found ${todos.length} todos that are not complete`);
        } else {
            console.log(`   ✗ Error: ${notResponse.status} - ${notResponse.text}`);
        }

        // ========================================================================
        // 8. GET: USING OR FILTER
        // ========================================================================
        console.log('\n8. GET: Using OR filter (title contains "Learn" OR "PostgREST")...');
        console.log('   URL: GET /todos?or=(title.ilike.*Learn*,title.ilike.*PostgREST*)');
        
        const orResponse = await postgrestRequest('GET', '/todos?or=(title.ilike.*Learn*,title.ilike.*PostgREST*)');
        if (orResponse.ok) {
            const todos = orResponse.json;
            console.log(`   ✓ Found ${todos.length} matching todos`);
            todos.forEach(todo => {
                console.log(`      - ${todo.title}`);
            });
        } else {
            console.log(`   ✗ Error: ${orResponse.status} - ${orResponse.text}`);
        }

        // ========================================================================
        // 9. GET: USING IN FILTER
        // ========================================================================
        console.log('\n9. GET: Using IN filter for specific IDs...');
        
        // Get first 3 IDs
        const idsResponse = await postgrestRequest('GET', '/todos?select=id&order=id.asc&limit=3');
        if (idsResponse.ok) {
            const ids = idsResponse.json.map(t => t.id).join(',');
            console.log(`   URL: GET /todos?id=in.(${ids})`);
            
            const inResponse = await postgrestRequest('GET', `/todos?id=in.(${ids})`);
            if (inResponse.ok) {
                const todos = inResponse.json;
                console.log(`   ✓ Found ${todos.length} todos with IDs in list`);
            } else {
                console.log(`   ✗ Error: ${inResponse.status} - ${inResponse.text}`);
            }
        }

        // ========================================================================
        // 10. GET: USING AND FILTER
        // ========================================================================
        console.log('\n10. GET: Using AND filter (is_complete=false AND description not null)...');
        console.log('   URL: GET /todos?and=(is_complete.eq.false,description.is.not.null)');
        
        const andResponse = await postgrestRequest('GET', '/todos?and=(is_complete.eq.false,description.is.not.null)');
        if (andResponse.ok) {
            const todos = andResponse.json;
            console.log(`   ✓ Found ${todos.length} todos matching both conditions`);
        } else {
            console.log(`   ✗ Error: ${andResponse.status} - ${andResponse.text}`);
        }

        // ========================================================================
        // 11. GET: USING TEXT SEARCH (LIKE/ILIKE)
        // ========================================================================
        console.log('\n11. GET: Using text search (title contains "learn" case-insensitive)...');
        console.log('   URL: GET /todos?title=ilike.*learn*');
        
        const searchResponse = await postgrestRequest('GET', '/todos?title=ilike.*learn*');
        if (searchResponse.ok) {
            const todos = searchResponse.json;
            console.log(`   ✓ Found ${todos.length} todos matching search`);
        } else {
            console.log(`   ✗ Error: ${searchResponse.status} - ${searchResponse.text}`);
        }

        // ========================================================================
        // 12. COUNT: Get total count
        // ========================================================================
        console.log('\n12. GET: Counting todos...');
        console.log('   URL: GET /todos?select=id&order=id.asc&limit=0');
        console.log('   Note: PostgREST returns Content-Range header with count');
        
        const countResponse = await postgrestRequest('GET', '/todos?select=id&order=id.asc&limit=0');
        if (countResponse.ok) {
            // The count is in the Content-Range header
            console.log(`   ✓ Got count from Content-Range header`);
        } else {
            console.log(`   ✗ Error: ${countResponse.status} - ${countResponse.text}`);
        }

        // ========================================================================
        // 13. DELETE: EXAMPLE (COMMENTED OUT FOR SAFETY)
        // ========================================================================
        console.log('\n13. DELETE: Example (commented out)...');
        console.log(`   // To delete: await postgrestRequest('DELETE', '/todos?id=eq.${todoId}')`);
        console.log('   ⚠ Uncomment to test deletion');

    } else {
        console.log(`   ✗ Error inserting: ${insertResponse.status} - ${insertResponse.text}`);
    }

    // ========================================================================
    // BONUS: POSTGREST URL TO SQL MAPPING
    // ========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('BONUS: PostgREST URL to SQL Mapping');
    console.log('='.repeat(60));
    console.log(`
  GET  /todos                        => SELECT * FROM todos
  GET  /todos?select=id,title        => SELECT id, title FROM todos
  GET  /todos?is_complete=eq.false   => SELECT * FROM todos WHERE is_complete = false
  GET  /todos?order=created_at.desc  => SELECT * FROM todos ORDER BY created_at DESC
  GET  /todos?limit=5               => SELECT * FROM todos LIMIT 5
  GET  /todos?title=ilike.*learn*   => SELECT * FROM todos WHERE title ILIKE '%learn%'
  GET  /todos?and=(a,b)             => SELECT * FROM todos WHERE a AND b
  GET  /todos?or=(a,b)              => SELECT * FROM todos WHERE a OR b
  POST /todos                       => INSERT INTO todos (...)
  PATCH /todos?id=eq.1             => UPDATE todos SET ... WHERE id = 1
  DELETE /todos?id=eq.1            => DELETE FROM todos WHERE id = 1
`);

    console.log('='.repeat(60));
    console.log('POSTGREST DEMO COMPLETE!');
    console.log('='.repeat(60));
}

// Run the demo
demoPostgrestApi().catch(console.error);
