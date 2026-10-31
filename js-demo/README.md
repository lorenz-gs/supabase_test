# Kingdom & Furstentumer Demo

A web-based demo for your Supabase schema with `kingdom_lorenz_steffen` and `fuerstentuemer` tables.

## Quick Start

### 1. Host the HTML File

You can host the `index.html` file anywhere:

**Option A: Local Development**
```bash
# Using Python's built-in server
python -m http.server 8000
# Open http://localhost:8000 in your browser

# Or with Node.js (install http-server first)
npx http-server
```

**Option B: Deploy Online**

- **Netlify**: Drag and drop the `index.html` file to Netlify
- **Vercel**: Deploy as a static site
- **GitHub Pages**: Commit to a repo and enable GitHub Pages
- **Supabase Storage**: Upload to Supabase Storage and make public
- **Cloudflare Pages**: Connect your Git repo

### 2. Configure Supabase

Edit the `index.html` file and replace these values at the top of the `<script>` section:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

Get these from your Supabase Dashboard:
- Go to Project Settings > API
- Copy the **Project URL** (e.g., `https://your-project-ref.supabase.co`)
- Copy the **anon public** key

### 3. Enable Row Level Security (RLS)

For the demo to work with public access, you need to enable RLS and create policies:

#### For `kingdom_lorenz_steffen` table:

```sql
-- Enable RLS
ALTER TABLE kingdom_lorenz_steffen ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users"
ON kingdom_lorenz_steffen FOR SELECT
USING (true);

-- Allow public insert access
CREATE POLICY "Enable insert for all users"
ON kingdom_lorenz_steffen FOR INSERT
WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Enable update for all users"
ON kingdom_lorenz_steffen FOR UPDATE
USING (true);

-- Allow public delete access
CREATE POLICY "Enable delete for all users"
ON kingdom_lorenz_steffen FOR DELETE
USING (true);
```

#### For `fuerstentuemer` table:

```sql
-- Enable RLS
ALTER TABLE fuerstentuemer ENABLE ROW LEVEL SECURITY;

-- Allow public read access (including joins)
CREATE POLICY "Enable read access for all users"
ON fuerstentuemer FOR SELECT
USING (true);

-- Allow public insert access
CREATE POLICY "Enable insert for all users"
ON fuerstentuemer FOR INSERT
WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Enable update for all users"
ON fuerstentuemer FOR UPDATE
USING (true);

-- Allow public delete access
CREATE POLICY "Enable delete for all users"
ON fuerstentuemer FOR DELETE
USING (true);
```

**How to run SQL:**
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Paste and run the SQL commands above

## API Endpoints Reference

Your Supabase project automatically exposes RESTful endpoints via PostgREST:

### Kingdom Endpoints

| Method | Endpoint | Description | SQL Equivalent |
|--------|----------|-------------|----------------|
| GET | `/rest/v1/kingdom_lorenz_steffen` | Get all kingdoms | `SELECT * FROM kingdom_lorenz_steffen` |
| GET | `/rest/v1/kingdom_lorenz_steffen?id=eq.1` | Get kingdom by ID | `SELECT * FROM kingdom_lorenz_steffen WHERE id = 1` |
| GET | `/rest/v1/kingdom_lorenz_steffen?select=id,name` | Select specific columns | `SELECT id, name FROM kingdom_lorenz_steffen` |
| GET | `/rest/v1/kingdom_lorenz_steffen?name=eq.Test` | Filter by name | `SELECT * FROM ... WHERE name = 'Test'` |
| POST | `/rest/v1/kingdom_lorenz_steffen` | Create kingdom | `INSERT INTO kingdom_lorenz_steffen (...) VALUES (...)` |
| PATCH | `/rest/v1/kingdom_lorenz_steffen?id=eq.1` | Update kingdom | `UPDATE kingdom_lorenz_steffen SET ... WHERE id = 1` |
| DELETE | `/rest/v1/kingdom_lorenz_steffen?id=eq.1` | Delete kingdom | `DELETE FROM kingdom_lorenz_steffen WHERE id = 1` |

### Furstentum Endpoints

| Method | Endpoint | Description | SQL Equivalent |
|--------|----------|-------------|----------------|
| GET | `/rest/v1/fuerstentuemer` | Get all furstentumer | `SELECT * FROM fuerstentuemer` |
| GET | `/rest/v1/fuerstentuemer?parent_id=eq.1` | Get furstentumer by kingdom | `SELECT * FROM fuerstentuemer WHERE parent_id = 1` |
| GET | `/rest/v1/fuerstentuemer?select=*,kingdom_lorenz_steffen(*)` | Join with kingdom | `SELECT *, kingdom.* FROM fuerstentuemer` |
| POST | `/rest/v1/fuerstentuemer` | Create furstentum | `INSERT INTO fuerstentuemer (...) VALUES (...)` |
| PATCH | `/rest/v1/fuerstentuemer?id=eq.1` | Update furstentum | `UPDATE fuerstentuemer SET ... WHERE id = 1` |
| DELETE | `/rest/v1/fuerstentuemer?id=eq.1` | Delete furstentum | `DELETE FROM fuerstentuemer WHERE id = 1` |

### Filter Operators

You can use these operators in your queries:

| Operator | Example | Description |
|----------|---------|-------------|
| `eq` | `?id=eq.1` | Equal to |
| `neq` | `?id=neq.1` | Not equal to |
| `gt` | `?id=gt.5` | Greater than |
| `gte` | `?id=gte.5` | Greater than or equal |
| `lt` | `?id=lt.5` | Less than |
| `lte` | `?id=lte.5` | Less than or equal |
| `like` | `?name=like.*test*` | Case-sensitive contains |
| `ilike` | `?name=ilike.*test*` | Case-insensitive contains |
| `in` | `?id=in.(1,2,3)` | In list |
| `is` | `?name=is.null` | NULL check |

### Combining Filters

Use `and` and `or` to combine conditions:

```
# AND: Both conditions must be true
/rest/v1/kingdom_lorenz_steffen?and=(name.ilike.*test*,plz_schloss.gte.10000)

# OR: Either condition can be true
/rest/v1/kingdom_lorenz_steffen?or=(name.ilike.*test*,name.ilike.*demo*)
```

### Ordering and Limiting

```
# Order by created_at descending
/rest/v1/kingdom_lorenz_steffen?order=created_at.desc

# Limit to 10 results
/rest/v1/kingdom_lorenz_steffen?limit=10

# Skip first 5, limit to 10 (pagination)
/rest/v1/kingdom_lorenz_steffen?offset=5&limit=10
```

## Features of the Demo

1. **Interactive UI**: Create, read, update, and delete kingdoms and furstentumer
2. **Tree View**: See furstentumer organized by their parent kingdom
3. **Statistics**: See counts of kingdoms and furstentumer
4. **Direct API Testing**: Use the built-in API tester to try PostgREST endpoints
5. **Responsive Design**: Works on mobile and desktop

## Customizing

### Change the Schema

If you want to modify the schema, update the table names in the JavaScript code:

```javascript
// Change these to match your schema
.from('kingdom_lorenz_steffen')
.from('fuerstentuemer')
```

### Add More Fields

The demo currently uses:
- Kingdom: `name`, `adresse_schloss`, `plz_schloss`
- Furstentum: `parent_id` (foreign key)

To add more fields, update the form inputs and the insert/update statements.

## Troubleshooting

### "403 Forbidden" Errors

This means RLS is blocking your request. Make sure:
1. RLS is enabled on both tables
2. You have created policies for public access
3. You're using the correct API key

### "Table not found" Errors

Make sure the table names match exactly (case-sensitive). Your schema uses:
- `kingdom_lorenz_steffen` (lowercase with underscores)
- `fuerstentuemer` (lowercase)

### CORS Errors

If hosting on a different domain, make sure your Supabase project has CORS configured:
1. Go to Supabase Dashboard > Project Settings > CORS
2. Add your domain to the allowed origins

### Connection Errors

Double-check:
1. Your SUPABASE_URL is correct (e.g., `https://xyz.supabase.co`)
2. Your SUPABASE_KEY is the anon key, not the service role key
3. The keys are properly set in the HTML file

## Deploying to Supabase Hosting

If you want to deploy this to Supabase:

1. Create a new folder with `index.html`
2. Push to GitHub
3. In Supabase Dashboard, go to Hosting
4. Connect your GitHub repository
5. Deploy!

## Technologies Used

- **Supabase**: Backend database and authentication
- **PostgREST**: RESTful API layer for PostgreSQL
- **Vanilla JavaScript**: No frameworks, just pure JS
- **Supabase JavaScript Client**: Official client library

## License

MIT - Feel free to use and modify this demo!
