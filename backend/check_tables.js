require('dotenv').config();
const https = require('https');

const supabaseUrl = process.env.SUPABASE_URL || '';
const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || '';
const token = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_API_KEY || '';

if (!projectRef || !token) {
    console.error('❌ ERROR: Missing SUPABASE_URL or SUPABASE_API_KEY in .env file.');
    process.exit(1);
}

// This query lists all tables in the public schema
const sql = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
const data = JSON.stringify({ query: sql });

const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${projectRef}/query`,
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🧐 Checking existing tables in your Supabase project...');

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => { body += d; });
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Tables Found:', body);
        const tables = JSON.parse(body);
        if (Array.isArray(tables) && tables.some(t => t.table_name === 'support_messages')) {
            console.log('✅ CONFIRMED: support_messages EXISTS in your database.');
        } else {
            console.log('❌ MISSING: support_messages was not found.');
        }
    });
});

req.on('error', (err) => console.error('Error:', err.message));
req.write(data);
req.end();
