# Kingdom & Furstentumer - Supabase Demo

A demo application for your **Supabase** database with `kingdom_lorenz_steffen` and `fuerstentuemer` tables.

This project helps you learn **Supabase** and **PostgREST API** with your actual schema.

---

## 🚀 Quick Start

### Option 1: Web Demo (Recommended)

The easiest way to get started is with the **HTML web demo**:

```bash
# Navigate to the js-demo directory
cd js-demo

# 1. Configure your Supabase credentials
# Edit index.html and replace:
#   const supabaseUrl = 'YOUR_SUPABASE_URL';
#   const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

# 2. Start a local server
python -m http.server 8000
# or: npx http-server

# 3. Open in browser: http://localhost:8000
```

**To host online:**
- Drag and drop `index.html` to [Netlify](https://netlify.com) or [Vercel](https://vercel.com)
- Or deploy to [Supabase Hosting](https://supabase.com/hosting)

### Option 2: Node.js Console Demos

If you prefer working in the terminal:

```bash
cd js-demo

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your SUPABASE_URL and SUPABASE_KEY

# Run demos
node demo_supabase.js      # Supabase JS Client
node demo_postgrest.js     # Direct PostgREST API
node demo_comparison.js    # Both approaches
```

---

## 📊 Your Schema

Your database has these tables:

### `kingdom_lorenz_steffen`
- `id` (integer, primary key)
- `created_at` (timestamp)
- `name` (text)
- `uuid` (uuid, generated)
- `adresse_schloss` (text)
- `plz_schloss` (integer)

### `fuerstentuemer`
- `id` (bigint, primary key)
- `created_at` (timestamp)
- `parent_id` (integer, foreign key → kingdom_lorenz_steffen.id)

---

## 🔗 API Endpoints

PostgREST automatically creates RESTful endpoints for your tables:

### Kingdom Endpoints
```
GET    /rest/v1/kingdom_lorenz_steffen           # Get all kingdoms
GET    /rest/v1/kingdom_lorenz_steffen?id=eq.1   # Get kingdom by ID
POST   /rest/v1/kingdom_lorenz_steffen           # Create kingdom
PATCH  /rest/v1/kingdom_lorenz_steffen?id=eq.1   # Update kingdom
DELETE /rest/v1/kingdom_lorenz_steffen?id=eq.1   # Delete kingdom
```

### Furstentum Endpoints
```
GET    /rest/v1/fuerstentuemer                   # Get all furstentumer
GET    /rest/v1/fuerstentuemer?parent_id=eq.1     # Get by kingdom ID
POST   /rest/v1/fuerstentuemer                   # Create furstentum
PATCH  /rest/v1/fuerstentuemer?id=eq.1           # Update furstentum
DELETE /rest/v1/fuerstentuemer?id=eq.1           # Delete furstentum
```

### Joins (Get furstentumer with their kingdom)
```
GET /rest/v1/fuerstentuemer?select=*,kingdom_lorenz_steffen(*)
```

---

## 🔐 Setup Required

### 1. Enable Row Level Security (RLS)

For the demo to work with public access, run these SQL commands in your Supabase Dashboard:

#### For `kingdom_lorenz_steffen`:
```sql
ALTER TABLE kingdom_lorenz_steffen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
ON kingdom_lorenz_steffen FOR SELECT USING (true);

CREATE POLICY "Public insert access"
ON kingdom_lorenz_steffen FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access"
ON kingdom_lorenz_steffen FOR UPDATE USING (true);

CREATE POLICY "Public delete access"
ON kingdom_lorenz_steffen FOR DELETE USING (true);
```

#### For `fuerstentuemer`:
```sql
ALTER TABLE fuerstentuemer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
ON fuerstentuemer FOR SELECT USING (true);

CREATE POLICY "Public insert access"
ON fuerstentuemer FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update access"
ON fuerstentuemer FOR UPDATE USING (true);

CREATE POLICY "Public delete access"
ON fuerstentuemer FOR DELETE USING (true);
```

**How to run:** Supabase Dashboard → SQL Editor → Run

### 2. Get Your API Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Project Settings → API**
4. Copy:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public** key

---

## 📁 Project Structure

```
supabase_test/
├── README.md                      # This file
├── js-demo/                       # JavaScript/Node.js demos
│   ├── index.html                 # 🎨 Web demo (RECOMMENDED)
│   ├── package.json
│   ├── .env.example
│   ├── config.example.js          # Config template
│   ├── README.md                  # Detailed docs for web demo
│   ├── demo_supabase.js           # Supabase JS Client
│   ├── demo_postgrest.js          # Direct PostgREST API
│   └── demo_comparison.js         # Side-by-side comparison
├── requirements.txt               # Python dependencies (alternative)
├── demo_supabase.py               # Python Supabase client
├── demo_postgrest.py              # Python PostgREST demo
└── demo_comparison.py             # Python comparison
```

---

## 🎯 What You'll Learn

### From the Web Demo (`index.html`):
- CRUD operations with your actual schema
- How the foreign key relationship works
- Visual representation of your data
- Direct PostgREST API testing

### From the Node.js Demos:
- Supabase JavaScript client usage
- Direct PostgREST HTTP requests
- Query building with filters, ordering, limiting
- Comparison of both approaches

---

## 🔍 Understanding PostgREST

PostgREST turns your PostgreSQL database into a RESTful API automatically.

### Query Parameters = SQL

| URL | SQL |
|-----|-----|
| `/todos?select=id,name` | `SELECT id, name FROM todos` |
| `/todos?parent_id=eq.1` | `SELECT * FROM todos WHERE parent_id = 1` |
| `/todos?order=created_at.desc` | `SELECT * FROM todos ORDER BY created_at DESC` |
| `/todos?limit=10` | `SELECT * FROM todos LIMIT 10` |

### Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `eq` | Equal | `?id=eq.1` |
| `neq` | Not equal | `?id=neq.1` |
| `gt` | Greater than | `?id=gt.5` |
| `gte` | ≥ | `?id=gte.5` |
| `lt` | Less than | `?id=lt.5` |
| `lte` | ≤ | `?id=lte.5` |
| `ilike` | Case-insensitive LIKE | `?name=ilike.*test*` |
| `in` | In list | `?id=in.(1,2,3)` |
| `is` | NULL check | `?name=is.null` |

### Combining Conditions

```
# AND: Both must be true
/rest/v1/kingdom_lorenz_steffen?and=(name.ilike.*test*,plz_schloss.gte.10000)

# OR: Either can be true
/rest/v1/kingdom_lorenz_steffen?or=(name.ilike.*test*,name.ilike.*demo*)
```

---

## 🛠️ Customization

### Add More Fields to the Web Demo

Edit `index.html` and:
1. Add input fields to the form
2. Include the fields in the insert/update statements
3. Display them in the card rendering

### Change Table Names

If you rename your tables, update:
```javascript
// In index.html
.from('kingdom_lorenz_steffen')
.from('fuerstentuemer')
```

---

## 🚨 Troubleshooting

### "403 Forbidden" or "Permission denied"
✅ **Fix:** Enable RLS and create policies (see above)

### "Table not found"
✅ **Fix:** Check table names are spelled correctly (case-sensitive)

### "Invalid API key"
✅ **Fix:** Use the **anon public** key, not the service role key

### "CORS error" when hosting
✅ **Fix:** Add your domain to Supabase CORS settings

### "Connection failed"
✅ **Fix:** Verify SUPABASE_URL starts with `https://`

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgREST Documentation](https://postgrest.org)
- [Supabase JS Client](https://supabase.com/docs/guides/getting-started/tutorials/with-javascript)

---

## 🎉 Next Steps

1. **Try the web demo** - It's the easiest way to see your data
2. **Run the Node.js demos** - To understand the code
3. **Modify the queries** - Try different filters and combinations
4. **Add more features** - Extend the demo with your own ideas

Enjoy learning Supabase and PostgREST! 🎯
