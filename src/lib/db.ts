import { Pool } from 'pg';
import { Signature } from '../app/types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connection event handlers
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT NOW()');
      console.log('Database connection test successful:', result.rows[0]);
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Database connection test failed:', err);
    return false;
  }
}

// Retry wrapper for database queries
async function queryWithRetry(
  query: string, 
  params: any[] = [], 
  maxRetries = 3
) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(query, params);
        return result;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error(`Database query attempt ${i + 1} failed:`, err);
      lastError = err;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

export async function createSignature(data: Omit<Signature, 'id' | 'created_at' | 'verified_at'>): Promise<Signature> {
  const { name, email, job_title, affiliation, honors, is_notable, verification_token, status } = data;
  
  try {
    const result = await queryWithRetry(
      `INSERT INTO signatures 
       (name, email, job_title, affiliation, honors, is_notable, verification_token, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [name, email, job_title, affiliation, honors, is_notable, verification_token, status]
    );
    
    return result.rows[0];
  } catch (err) {
    console.error('Error creating signature:', err);
    throw err;
  }
}

export async function getSignatureByEmail(email: string): Promise<Signature | null> {
  try {
    const result = await queryWithRetry(
      'SELECT * FROM signatures WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error getting signature by email:', err);
    throw err;
  }
}

export async function getSignatures(search?: string): Promise<Signature[]> {
  try {
    let query = 'SELECT * FROM signatures WHERE status = $1';
    const params: any[] = ['verified'];

    if (search) {
      // Sanitize search input
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&');
      query += ` AND (
        name ILIKE $2 OR 
        COALESCE(job_title, '') ILIKE $2 OR 
        COALESCE(affiliation, '') ILIKE $2 OR
        COALESCE(honors, '') ILIKE $2
      )`;
      params.push(`%${sanitizedSearch}%`);
    }

    query += ` ORDER BY created_at DESC`;
    
    const result = await queryWithRetry(query, params);
    return result.rows;
  } catch (err) {
    console.error('Error getting signatures:', err);
    throw err;
  }
}

export async function verifySignature(token: string): Promise<Signature | null> {
  try {
    const result = await queryWithRetry(
      `UPDATE signatures 
       SET status = 'verified', 
           verified_at = CURRENT_TIMESTAMP 
       WHERE verification_token = $1 
       AND status = 'pending' 
       RETURNING *`,
      [token]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error verifying signature:', err);
    throw err;
  }
}

// Cleanup function for graceful shutdown
let isClosing = false;

export async function cleanup(): Promise<void> {
  if (isClosing) return; // Prevent multiple cleanup attempts
  
  isClosing = true;
  try {
    await pool.end();
    console.log('Database pool closed successfully');
  } catch (err) {
    console.error('Error closing database pool:', err);
    // Don't throw error here, just log it
  }
}

// Handle cleanup on process termination
process.once('SIGTERM', cleanup);
process.once('SIGINT', cleanup);

// Test connection on startup
testConnection().catch(console.error);

export { pool };