const { Client } = require('pg');

const connectionString = 'postgresql://postgres:YdReFp968YAmGN1z@db.spnwupodvhkqpyjubouc.supabase.co:5432/postgres?connect_timeout=60';

async function check() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to Supabase.');

        const res = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'Portfolio', 'TodoItem')
      ORDER BY table_name, ordinal_position;
    `);

        const tables = {};
        res.rows.forEach(row => {
            if (!tables[row.table_name]) tables[row.table_name] = [];
            tables[row.table_name].push(row.column_name);
        });

        console.log('\n--- DATABASE STRUCTURE CHECK ---');

        // Check User
        console.log('\n[User Table]');
        const userCols = tables['User'] || [];
        console.log('Columns found:', userCols.length);
        if (userCols.includes('phone')) console.log('✅ Found: phone'); else console.log('❌ Missing: phone');
        if (userCols.includes('avatar')) console.log('✅ Found: avatar'); else console.log('❌ Missing: avatar');

        // Check Portfolio
        console.log('\n[Portfolio Table]');
        const portCols = tables['Portfolio'] || [];
        if (portCols.includes('initialStrengths')) console.log('✅ Found: initialStrengths'); else console.log('❌ Missing: initialStrengths');
        if (portCols.includes('finalStrengths')) console.log('✅ Found: finalStrengths'); else console.log('❌ Missing: finalStrengths');

        // Check TodoItem
        console.log('\n[TodoItem Table]');
        const todoCols = tables['TodoItem'] || [];
        if (todoCols.includes('description')) console.log('✅ Found: description'); else console.log('❌ Missing: description');
        if (todoCols.includes('attachments')) console.log('✅ Found: attachments'); else console.log('❌ Missing: attachments');
        if (todoCols.includes('comments')) console.log('✅ Found: comments'); else console.log('❌ Missing: comments');

    } catch (err) {
        console.error('Error connecting or querying:', err);
    } finally {
        await client.end();
    }
}

check();
