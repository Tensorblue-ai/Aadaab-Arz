import { DatabaseSync } from 'node:sqlite';
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI || !process.argv[2]) {
  throw new Error('Set MONGODB_URI and pass the existing content.sqlite path');
}
const source = new DatabaseSync(process.argv[2], { readOnly: true });
const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
try {
  const rows = source.prepare('SELECT * FROM events ORDER BY id').all();
  if (rows.some((row) => !row.slug)) throw new Error('Every source event must have a slug');
  await client.connect();
  const events = client.db('aadaab_arz').collection('events');
  await events.createIndex({ slug: 1 }, { unique: true });
  await events.createIndex({ id: 1 }, { unique: true });
  let inserted = 0;
  for (const row of rows) {
    const result = await events.updateOne(
      { slug: row.slug },
      { $setOnInsert: { ...row, id: String(row.id) } },
      { upsert: true },
    );
    inserted += result.upsertedCount;
  }
  console.log(`Imported ${inserted} events into aadaab_arz; existing events left unchanged.`);
} finally {
  source.close();
  await client.close();
}
