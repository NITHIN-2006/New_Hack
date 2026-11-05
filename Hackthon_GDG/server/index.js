import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const { Pool } = pg;
const port = Number(process.env.PORT || 5000);
const jwtSecret = process.env.JWT_SECRET;
const databaseUrl = process.env.DATABASE_URL;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
}
if (!databaseUrl) {
  throw new Error('DATABASE_URL must point to the local AIDO PostgreSQL database.');
}

const pool = new Pool({ connectionString: databaseUrl });
const app = express();
const allowedOrigins = (process.env.WEB_ORIGINS || 'http://localhost:3000,http://localhost:9000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(express.json({ limit: '8mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
const imageAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      mobile VARCHAR(15) UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      account_type TEXT NOT NULL CHECK (account_type IN ('seeker', 'provider', 'admin')),
      is_active_aidmate BOOLEAN NOT NULL DEFAULT FALSE,
      skills JSONB NOT NULL DEFAULT '[]'::jsonb,
      certificates JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      job_id TEXT NOT NULL,
      target_key TEXT NOT NULL,
      target_mobile VARCHAR(15),
      target_name TEXT NOT NULL,
      target_role TEXT NOT NULL CHECK (target_role IN ('customer', 'aidmate')),
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (reviewer_id, job_id, target_role)
    );

    CREATE INDEX IF NOT EXISTS reviews_target_key_idx ON reviews(target_key);
  `);

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || adminPassword.length < 8) {
    throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters in server/.env.');
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, account_type)
     VALUES ('AIDO Administrator', $1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       account_type = 'admin'`,
    [adminEmail, passwordHash],
  );
}

function normalizeMobile(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    accountType: user.account_type,
  };
}

function createToken(user) {
  return jwt.sign(
    { sub: user.id, accountType: user.account_type },
    jwtSecret,
    { expiresIn: '12h', issuer: 'aido-api', audience: 'aido-app' },
  );
}

function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Authentication is required.' });
    return;
  }

  try {
    req.auth = jwt.verify(token, jwtSecret, {
      issuer: 'aido-api',
      audience: 'aido-app',
    });
    next();
  } catch {
    res.status(401).json({ error: 'Your session is invalid or expired. Please sign in again.' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.auth.accountType !== 'admin') {
      res.status(403).json({ error: 'Administrator access is required.' });
      return;
    }
    next();
  });
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/v1/auth/register', authLimiter, async (req, res, next) => {
  try {
    const name = String(req.body.name ?? '').trim();
    const mobile = normalizeMobile(req.body.mobile);
    const password = String(req.body.password ?? '');
    const accountType = req.body.accountType;
    const skills = Array.isArray(req.body.skills)
      ? req.body.skills.filter(skill => typeof skill === 'string').slice(0, 20)
      : [];

    if (name.length < 3 || name.length > 100) {
      res.status(400).json({ error: 'Name must be between 3 and 100 characters.' });
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      return;
    }
    if (!['seeker', 'provider'].includes(accountType)) {
      res.status(400).json({ error: 'Account type must be seeker or provider.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (name, mobile, password_hash, account_type, is_active_aidmate, skills)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, mobile, account_type`,
      [name, mobile, passwordHash, accountType, accountType === 'provider', JSON.stringify(skills)],
    );
    const user = rows[0];
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'An account already exists for this mobile number.' });
      return;
    }
    next(error);
  }
});

async function login(req, res, next, accountType) {
  try {
    const mobile = normalizeMobile(req.body.mobile);
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');
    const identifier = accountType === 'admin' ? email : mobile;
    if (!identifier || password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Enter your account and password.' });
      return;
    }

    const column = accountType === 'admin' ? 'email' : 'mobile';
    const { rows } = await pool.query(
      `SELECT id, name, mobile, email, password_hash, account_type
       FROM users WHERE ${column} = $1 AND account_type = $2`,
      [identifier, accountType],
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: 'Invalid account or password.' });
      return;
    }
    res.json({
      token: createToken(user),
      user: accountType === 'admin'
        ? { id: user.id, email: user.email }
        : publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

app.post('/api/v1/auth/login', authLimiter, (req, res, next) => {
  const accountType = req.body.accountType;
  if (!['seeker', 'provider'].includes(accountType)) {
    res.status(400).json({ error: 'Account type must be seeker or provider.' });
    return;
  }
  void login(req, res, next, accountType);
});

app.post('/api/v1/auth/admin/login', authLimiter, (req, res, next) => {
  void login(req, res, next, 'admin');
});

app.get('/api/v1/auth/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, mobile, email, account_type FROM users WHERE id = $1',
      [req.auth.sub],
    );
    const user = rows[0];
    if (!user) {
      res.status(401).json({ error: 'Account no longer exists.' });
      return;
    }
    res.json({
      user: user.account_type === 'admin'
        ? { id: user.id, email: user.email }
        : publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/v1/ai/analyze-image', requireAuth, imageAnalysisLimiter, async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: 'Image analysis is not configured. Set GEMINI_API_KEY in server/.env.' });
      return;
    }

    const imageDataUrl = String(req.body.imageDataUrl ?? '');
    const service = String(req.body.service ?? '').trim().slice(0, 200);
    const imageMatch = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(imageDataUrl);
    if (!imageMatch || Buffer.byteLength(imageMatch[2], 'base64') > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Upload a JPEG, PNG, or WebP image smaller than 5 MB.' });
      return;
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Describe the visible household repair or service problem for an AidMate who may take this job. ${service ? `The customer's selected service is: ${service}.` : ''} Write 2-4 short, plain-language sentences describing only what is visible, useful work context, and any uncertainty. Do not diagnose hidden causes, invent details, or include personal information.`,
              },
              {
                inline_data: {
                  mime_type: imageMatch[1],
                  data: imageMatch[2],
                },
              },
            ],
          }],
          generationConfig: {
            maxOutputTokens: 250,
            temperature: 0.2,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );
    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.error('Gemini image analysis failed:', geminiResponse.status, data.error?.message || 'Unknown provider error');
      res.status(geminiResponse.status === 429 ? 429 : 502).json({
        error: geminiResponse.status === 429
          ? 'Image analysis is temporarily rate-limited. Please try again later.'
          : 'Image analysis failed. Check the Gemini API key and try again.',
      });
      return;
    }

    const description = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('\n')
      .trim();
    if (!description) {
      res.status(502).json({ error: 'The image could not be described. Try another photo.' });
      return;
    }
    res.json({ description });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      res.status(504).json({ error: 'Image analysis timed out. Please try again.' });
      return;
    }
    next(error);
  }
});

app.post('/api/v1/reviews', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    if (!['seeker', 'provider'].includes(req.auth.accountType)) {
      res.status(403).json({ error: 'Only user and AidMate accounts can submit reviews.' });
      return;
    }

    const jobId = String(req.body.jobId ?? '').trim();
    const targetName = String(req.body.targetName ?? '').trim();
    const targetMobile = req.body.targetMobile ? normalizeMobile(req.body.targetMobile) : null;
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment ?? '').trim();
    const targetRole = req.auth.accountType === 'seeker' ? 'aidmate' : 'customer';

    if (!jobId || jobId.length > 200 || !targetName || targetName.length > 100) {
      res.status(400).json({ error: 'A valid job and review target are required.' });
      return;
    }
    if (targetMobile && !/^\d{10}$/.test(targetMobile)) {
      res.status(400).json({ error: 'Review target mobile number is invalid.' });
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length > 2000) {
      res.status(400).json({ error: 'Rating must be 1–5 and feedback must be 2000 characters or fewer.' });
      return;
    }

    const targetKey = targetMobile
      ? `mobile:${targetMobile}`
      : `name:${targetName.toLocaleLowerCase()}`;

    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO reviews
         (reviewer_id, job_id, target_key, target_mobile, target_name, target_role, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, rating, comment, created_at`,
      [req.auth.sub, jobId, targetKey, targetMobile, targetName, targetRole, rating, comment],
    );
    await client.query('COMMIT');
    res.status(201).json({ review: rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      res.status(409).json({ error: 'A review has already been submitted for this job.' });
      return;
    }
    next(error);
  } finally {
    client.release();
  }
});

app.get('/api/v1/users', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      WITH targets AS (
        SELECT
          'mobile:' || mobile AS target_key, id::text AS id, name, mobile,
          email, is_active_aidmate, skills, certificates, is_verified, verified_at
        FROM users
        WHERE account_type <> 'admin' AND mobile IS NOT NULL
        UNION ALL
        SELECT
          latest.target_key, 'review-' || md5(latest.target_key), latest.target_name,
          latest.target_mobile, NULL, latest.target_role = 'aidmate',
          '[]'::jsonb, '[]'::jsonb, FALSE, NULL
        FROM (
          SELECT DISTINCT ON (target_key)
            target_key, target_name, target_mobile, target_role
          FROM reviews
          ORDER BY target_key, created_at DESC
        ) latest
        WHERE NOT EXISTS (
          SELECT 1 FROM users u
          WHERE u.account_type <> 'admin'
            AND u.mobile IS NOT NULL
            AND 'mobile:' || u.mobile = latest.target_key
        )
      ),
      customer_rollup AS (
        SELECT r.target_key, ROUND(AVG(r.rating)::numeric, 1) AS average_rating,
          COUNT(*)::int AS total_count,
          json_agg(json_build_object(
            'id', r.id::text, 'reviewerName', COALESCE(reviewer.name, 'AIDO user'),
            'rating', r.rating, 'comment', r.comment,
            'createdAt', r.created_at
          ) ORDER BY r.created_at DESC) AS items
        FROM reviews r LEFT JOIN users reviewer ON reviewer.id = r.reviewer_id
        WHERE r.target_role = 'customer' GROUP BY r.target_key
      ),
      aidmate_rollup AS (
        SELECT r.target_key, ROUND(AVG(r.rating)::numeric, 1) AS average_rating,
          COUNT(*)::int AS total_count,
          json_agg(json_build_object(
            'id', r.id::text, 'reviewerName', COALESCE(reviewer.name, 'AIDO user'),
            'rating', r.rating, 'comment', r.comment,
            'createdAt', r.created_at
          ) ORDER BY r.created_at DESC) AS items
        FROM reviews r LEFT JOIN users reviewer ON reviewer.id = r.reviewer_id
        WHERE r.target_role = 'aidmate' GROUP BY r.target_key
      )
      SELECT t.id, t.name, COALESCE(t.mobile, '') AS mobile, t.email,
        t.is_active_aidmate AS "isActiveAidmate",
        t.skills, t.certificates,
        json_build_object(
          'averageRating', COALESCE(cr.average_rating, 0),
          'totalCount', COALESCE(cr.total_count, 0),
          'items', COALESCE(cr.items, '[]'::json)
        ) AS "customerReviews",
        json_build_object(
          'averageRating', COALESCE(ar.average_rating, 0),
          'totalCount', COALESCE(ar.total_count, 0),
          'items', COALESCE(ar.items, '[]'::json)
        ) AS "aidmateReviews",
        '[]'::json AS "customerComplaints",
        '[]'::json AS "aidmateComplaints",
        t.is_verified AS "isVerified",
        t.verified_at AS "verifiedAt"
      FROM targets t
      LEFT JOIN customer_rollup cr ON cr.target_key = t.target_key
      LEFT JOIN aidmate_rollup ar ON ar.target_key = t.target_key
      ORDER BY t.name
    `);
    res.json({ users: rows });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/v1/users/:userId/toggle-aidmate', requireAdmin, async (req, res, next) => {
  try {
    if (typeof req.body.isActiveAidmate !== 'boolean') {
      res.status(400).json({ error: 'isActiveAidmate must be a boolean.' });
      return;
    }
    const { rowCount } = await pool.query(
      `UPDATE users SET is_active_aidmate = $1
       WHERE id = $2 AND account_type <> 'admin'`,
      [req.body.isActiveAidmate, req.params.userId],
    );
    if (!rowCount) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/v1/users/:userId/verify-badge', requireAdmin, async (req, res, next) => {
  try {
    if (typeof req.body.isVerified !== 'boolean') {
      res.status(400).json({ error: 'isVerified must be a boolean.' });
      return;
    }
    const { rowCount } = await pool.query(
      `UPDATE users SET is_verified = $1, verified_at = $2
       WHERE id = $3 AND account_type <> 'admin'`,
      [req.body.isVerified, req.body.isVerified ? new Date() : null, req.params.userId],
    );
    if (!rowCount) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.message === 'Origin is not allowed by CORS.') {
    res.status(403).json({ error: error.message });
    return;
  }
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

async function start() {
  await initializeDatabase();
  await pool.query('SELECT 1');
  app.listen(port, '0.0.0.0', () => {
    console.log(`AIDO API listening on http://localhost:${port}`);
  });
}

start().catch(error => {
  console.error('AIDO API failed to start:', error);
  process.exitCode = 1;
});
