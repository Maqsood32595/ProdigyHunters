import pkg from 'pg';
const { Pool } = pkg;

class PostgresLogger {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async connect(connectionString) {
    if (!connectionString) {
      console.log('⚠️ [PG Logger] No DATABASE_URL provided. Skipping PostgreSQL connection.');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false // Required for many managed databases like Render
        }
      });

      // Test connection
      await this.pool.query('SELECT 1');
      this.isConnected = true;
      console.log('✅ [PG Logger] Successfully connected to PostgreSQL Database.');

      // Ensure table exists
      await this.initTable();
    } catch (err) {
      console.error('❌ [PG Logger] Failed to connect to PostgreSQL:', err.message);
      this.isConnected = false;
    }
  }

  async initTable() {
    if (!this.isConnected) return;
    const query = `
      CREATE TABLE IF NOT EXISTS interested_candidates (
        id SERIAL PRIMARY KEY,
        timestamp VARCHAR(255),
        name VARCHAR(255),
        phone VARCHAR(255),
        status VARCHAR(50),
        response TEXT
      );
    `;
    try {
      await this.pool.query(query);
      console.log('✅ [PG Logger] "interested_candidates" table is ready.');
    } catch (err) {
      console.error('❌ [PG Logger] Failed to create table:', err.message);
    }
  }

  async saveCandidate(name, phone, responseText) {
    if (!this.isConnected) {
      console.warn('⚠️ [PG Logger] Not connected to DB. Cannot save candidate.');
      return;
    }

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const query = `
      INSERT INTO interested_candidates (timestamp, name, phone, status, response)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [timestamp, name, phone, 'Interested', responseText];

    try {
      await this.pool.query(query, values);
      console.log(`✅ [PG Logger] Saved Interested Candidate: ${name} (${phone}) to PostgreSQL`);
    } catch (err) {
      console.error('❌ [PG Logger] Error saving candidate to DB:', err.message);
    }
  }

  async getAllInterestedCandidates() {
    if (!this.isConnected) return [];

    try {
      const result = await this.pool.query('SELECT * FROM interested_candidates ORDER BY id DESC');
      return result.rows;
    } catch (err) {
      console.error('❌ [PG Logger] Error fetching candidates from DB:', err.message);
      return [];
    }
  }
}

export const pgLogger = new PostgresLogger();
