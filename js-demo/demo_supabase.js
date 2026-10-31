/**
 * Supabase JavaScript Client Demo
 * 
 * This script demonstrates basic CRUD operations using the Supabase JavaScript client.
 * Before running, set up your .env file with SUPABASE_URL and SUPABASE_KEY.
 * 
 * Run: npm install && node demo_supabase.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERROR: Missing SUPABASE_URL or SUPABASE_KEY in .env file');
    console.error('Copy .env.example to .env and add your credentials');
    process.exit(1);
}

// Create client with anon key (safe for client-side)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function demoBasicOperations() {
    console.log('='.repeat(60));
    console.log('SUPABASE JAVASCRIPT CLIENT DEMO');
    console.log('='.repeat(60));

    // ========================================================================
    // 1. CHECK IF TABLE EXISTS, CREATE IF NOT
    // ========================================================================
    console.log('\n1. Checking if \'todos\' table exists...');
    
    try {
        // Check if table exists using RPC
        const { data: tableExists, error } = await supabase
            .rpc('table_exists', { table_name: 'todos' })
            .single();
        
        if (error || !tableExists) {
            console.log('   \'todos\' table does not exist. Creating it...');
            
            const { error: createError } = await supabase.rpc('create_todos_table');
            
            if (createError) {
                // Fallback: create table using SQL
                console.log('   Trying SQL approach...');
                const { error: sqlError } = await supabase
                    .rpc('execute_sql', {
                        sql: `
                            CREATE TABLE IF NOT EXISTS todos (
                                id BIGSERIAL PRIMARY KEY,
                                title TEXT NOT NULL,
                                description TEXT,
                                is_complete BOOLEAN DEFAULT FALSE,
                                created_at TIMESTAMPTZ DEFAULT NOW()
                            );
                        `
                    });
                
                if (sqlError) {
                    console.log('   ⚠ Could not create table automatically.');
                    console.log('   Please create the todos table manually in Supabase Dashboard:');
                    console.log('   - id BIGSERIAL PRIMARY KEY');
                    console.log('   - title TEXT NOT NULL');
                    console.log('   - description TEXT');
                    console.log('   - is_complete BOOLEAN DEFAULT FALSE');
                    console.log('   - created_at TIMESTAMPTZ DEFAULT NOW()');
                    return;
                }
            }
            console.log('   ✓ Created \'todos\' table');
        } else {
            console.log('   ✓ \'todos\' table exists');
        }
    } catch (error) {
        console.log('   ⚠ Could not check table: ', error.message);
    }

    // ========================================================================
    // 2. SETUP ROW LEVEL SECURITY (RLS)
    // ========================================================================
    console.log('\n2. Setting up Row Level Security (RLS)...');
    
    try {
        // Enable RLS
        const { error: rlsError } = await supabase.rpc('enable_rls', {
            table_name: 'todos'
        });
        
        if (rlsError) {
            console.log('   Note: RLS may already be enabled or requires manual setup');
        } else {
            console.log('   ✓ Enabled RLS on \'todos\' table');
        }
        
        // Create policies (these might need to be done manually in SQL editor)
        console.log('   Creating public access policies...');
        
        const policies = [
            {
                name: 'Enable read access for all users',
                sql: `
                    CREATE POLICY "Enable read access for all users"
                    ON todos FOR SELECT USING (true);
                `
            },
            {
                name: 'Enable insert for all users',
                sql: `
                    CREATE POLICY "Enable insert for all users"
                    ON todos FOR INSERT WITH CHECK (true);
                `
            },
            {
                name: 'Enable update for all users',
                sql: `
                    CREATE POLICY "Enable update for all users"
                    ON todos FOR UPDATE USING (true);
                `
            },
            {
                name: 'Enable delete for all users',
                sql: `
                    CREATE POLICY "Enable delete for all users"
                    ON todos FOR DELETE USING (true);
                `
            }
        ];
        
        for (const policy of policies) {
            try {
                await supabase.rpc('execute_sql', { sql: policy.sql });
                console.log(`   ✓ Created ${policy.name}`);
            } catch (error) {
                console.log(`   Note: ${policy.name} may already exist`);
            }
        }
    } catch (error) {
        console.log('   ⚠ RLS setup failed (may need manual setup in Supabase Dashboard):', error.message);
    }

    // ========================================================================
    // 3. CREATE: INSERT A NEW TODO
    // ========================================================================
    console.log('\n3. INSERT: Adding a new todo...');
    
    try {
        const todoData = {
            title: 'Learn Supabase',
            description: 'Get familiar with Supabase and PostgREST API',
            is_complete: false
        };
        
        const { data: newTodo, error } = await supabase
            .from('todos')
            .insert(todoData)
            .select()
            .single();
        
        if (error) {
            console.log('   ✗ Error inserting:', error.message);
            console.log('   Hint: Make sure your anon key has proper permissions');
        } else {
            console.log(`   ✓ Inserted todo with ID: ${newTodo.id}`);
            console.log(`      Title: ${newTodo.title}`);
        }
    } catch (error) {
        console.log('   ✗ Error:', error.message);
    }

    // ========================================================================
    // 4. READ: SELECT ALL TODOS
    // ========================================================================
    console.log('\n4. SELECT: Getting all todos...');
    
    try {
        const { data: todos, error } = await supabase
            .from('todos')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            console.log('   ✗ Error selecting:', error.message);
        } else {
            console.log(`   ✓ Found ${todos.length} todos:`);
            todos.forEach(todo => {
                const status = todo.is_complete ? '✓' : '○';
                console.log(`      ${status} ${todo.id}: ${todo.title}`);
            });
        }
    } catch (error) {
        console.log('   ✗ Error:', error.message);
    }

    // ========================================================================
    // 5. READ: SELECT WITH FILTERING
    // ========================================================================
    console.log('\n5. SELECT with filter: Getting incomplete todos...');
    
    try {
        const { data: incompleteTodos, error } = await supabase
            .from('todos')
            .select('*')
            .eq('is_complete', false);
        
        if (error) {
            console.log('   ✗ Error filtering:', error.message);
        } else {
            console.log(`   ✓ Found ${incompleteTodos.length} incomplete todos`);
            incompleteTodos.forEach(todo => {
                console.log(`      - ${todo.title}`);
            });
        }
    } catch (error) {
        console.log('   ✗ Error:', error.message);
    }

    // ========================================================================
    // 6. READ: COMPLEX FILTERING
    // ========================================================================
    console.log('\n6. SELECT with complex filter: Title contains "Learn" OR "Supabase"...');
    
    try {
        const { data: filteredTodos, error } = await supabase
            .from('todos')
            .select('*')
            .or('title.ilike.%Learn%,title.ilike.%Supabase%');
        
        if (error) {
            console.log('   ✗ Error:', error.message);
        } else {
            console.log(`   ✓ Found ${filteredTodos.length} matching todos`);
            filteredTodos.forEach(todo => {
                console.log(`      - ${todo.title}`);
            });
        }
    } catch (error) {
        console.log('   ✗ Error:', error.message);
    }

    // ========================================================================
    // 7. UPDATE: MARK A TODO AS COMPLETE
    // ========================================================================
    console.log('\n7. UPDATE: Marking first todo as complete...');
    
    try {
        // Get first todo
        const { data: firstTodo, error: fetchError } = await supabase
            .from('todos')
            .select('id')
            .order('id', { ascending: true })
            .limit(1)
            .single();
        
        if (fetchError) {
            console.log('   ✗ Error fetching todo:', fetchError.message);
        } else if (firstTodo) {
            const { error: updateError } = await supabase
                .from('todos')
                .update({ is_complete: true })
                .eq('id', firstTodo.id);
            
            if (updateError) {
                console.log('   ✗ Error updating:', updateError.message);
            } else {
                console.log(`   ✓ Updated todo ID ${firstTodo.id}`);
            }
        }
    } catch (error) {
        console.log('   ✗ Error:', error.message);
    }

    // ========================================================================
    // 8. SELECT: WITH COLUMN FILTERING
    // ========================================================================
    console.log('\n8. SELECT: Only id and title columns...');
    
    try {
        const { data: todos, error } = await supabase
            .from('todos')
            .select('id, title');
        
        if (error) {
            console.log('   ✗ Error:', error.message);
        } else {
            console.log(`   ✓ Found ${todos.length} todos`);
            todos.forEach(todo => {
                console.log(`      - ID: ${todo.id}, Title: ${todo.title}`);
            });
        }
    } catch (error) {
        console.log('   ✗ Error:', error.message);
    }

    // ========================================================================
    // 9. SELECT: ORDERING AND LIMITING
    // ========================================================================
    console.log('\n9. SELECT: Ordered by created_at DESC, limit 3...');
    
    try {
        const { data: todos, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);
        
        if (error) {
            console.log('   ✗ Error:', error.message);
        } else {
            console.log(`   ✓ Found ${todos.length} todos`);
            todos.forEach(todo => {
                console.log(`      - ${todo.title} (created: ${todo.created_at})`);
            });
        }
    } catch (error) {
        console.log('   ✗ Error:', error.message);
    }

    // ========================================================================
    // 10. DELETE: EXAMPLE (COMMENTED OUT FOR SAFETY)
    // ========================================================================
    console.log('\n10. DELETE: Example (commented out)...');
    console.log('   // To delete: await supabase.from(\'todos\').delete().eq(\'id\', todoId)');
    console.log('   ⚠ Uncomment the line above if you want to test deletion');

    // ========================================================================
    // 11. COUNT: Get total number of todos
    // ========================================================================
    console.log('\n11. COUNT: Getting total number of todos...');
    
    try {
        const { count, error } = await supabase
            .from('todos')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.log('   ✗ Error:', error.message);
        } else {
            console.log(`   ✓ Total todos: ${count}`);
        }
    } catch (error) {
        console.log('   ✗ Error:', error.message);
    }

    // ========================================================================
    // 12. REALTIME: Subscribe to changes (optional)
    // ========================================================================
    console.log('\n12. REALTIME: Subscribing to changes...');
    console.log('   Note: Real-time requires a separate channel setup');
    console.log('   See demo_postgrest.js for direct HTTP API examples');

    console.log('\n' + '='.repeat(60));
    console.log('DEMO COMPLETE!');
    console.log('='.repeat(60));
}

// Run the demo
demoBasicOperations().catch(console.error);
