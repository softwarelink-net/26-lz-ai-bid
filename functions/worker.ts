import type { Env } from './env'

export type { Env }

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  })

const hashIdentity = async (value: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest))
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
}

async function writeAudit(env: Env, operatorId: string, actionType: string, target: string, req: Request) {
  const signatureHash = await hashIdentity(`${operatorId}|${actionType}|${Date.now()}`)
  await env.Allworld.prepare(
    `INSERT INTO lz_ai_audit_logs (id, operator_id, action_type, target_resource, client_ip, user_agent, signature_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      `audit_${Date.now()}`,
      operatorId,
      actionType,
      target,
      req.headers.get('cf-connecting-ip') ?? '127.0.0.1',
      req.headers.get('user-agent') ?? 'unknown',
      signatureHash,
    )
    .run()
}

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const { pathname } = url

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (pathname === '/api/health') {
    return json({
      success: true,
      data: {
        service: env.PROJECT_SLUG || '26-lz-ai-bid',
        worker: 'allworld',
        r2: '26-lz-ai-bid-assets',
        d1: 'Allworld',
        ts: new Date().toISOString(),
      },
    })
  }

  if (pathname === '/api/auth/login' && request.method === 'POST') {
    const body = (await request.json()) as { email: string; password: string }
    const user = await env.Allworld.prepare(
      `SELECT id, real_name, email, role, organization FROM lz_ai_users WHERE email = ? AND is_active = 1 LIMIT 1`,
    )
      .bind(body.email)
      .first<{ id: string; real_name: string; email: string; role: string; organization: string }>()

    if (!user) return json({ success: false, error: '账号不存在或已停用' }, 401)

    await writeAudit(env, user.id, 'VIEW_IMAGE', '/api/auth/login', request)
    return json({
      success: true,
      token: `demo-${Date.now()}`,
      user,
    })
  }

  if (pathname === '/api/dashboard/overview') {
    const record = await env.Allworld.prepare(
      `SELECT COUNT(*) AS total, AVG(ai_confidence) AS avg_confidence FROM lz_ai_diagnostic_records`,
    ).first<{ total: number; avg_confidence: number }>()
    const institutions = await env.Allworld.prepare(
      `SELECT id, name, district, sync_status, last_heartbeat_at FROM lz_ai_institutions ORDER BY district`,
    ).all()
    return json({
      success: true,
      data: {
        screeningTotal: record?.total ?? 0,
        avgConfidence: Number(record?.avg_confidence ?? 0),
        p95: 182,
        p99: 347,
        institutions: institutions.results ?? [],
      },
    })
  }

  if (pathname === '/api/diagnostic/list') {
    const rows = await env.Allworld.prepare(
      `SELECT id, patient_hash_id, modality, ai_status, ai_confidence, ai_finding, review_status, created_at
       FROM lz_ai_diagnostic_records ORDER BY created_at DESC`,
    ).all()
    return json({ success: true, data: rows.results ?? [] })
  }

  if (pathname === '/api/diagnostic/ingest' && request.method === 'POST') {
    const body = (await request.json()) as {
      institutionId: string
      patientId: string
      imageUrl: string
      modality: 'DR' | 'CT'
    }
    const patientHash = await hashIdentity(body.patientId)
    await env.Allworld.prepare(
      `INSERT INTO lz_ai_diagnostic_records
        (id, institution_id, patient_hash_id, modality, image_url, ai_status)
        VALUES (?, ?, ?, ?, ?, 'PENDING')`,
    )
      .bind(`rec_${Date.now()}`, body.institutionId, patientHash.slice(0, 16).toUpperCase(), body.modality, body.imageUrl)
      .run()
    await writeAudit(env, 'u_ops', 'TRIGGER_AI', '/api/diagnostic/ingest', request)
    return json({ success: true, patientHash: patientHash.slice(0, 16).toUpperCase() }, 201)
  }

  if (pathname === '/api/sla/tickets') {
    const rows = await env.Allworld.prepare(`SELECT * FROM lz_ai_sla_tickets ORDER BY created_at DESC`).all()
    return json({ success: true, data: rows.results ?? [] })
  }

  if (pathname === '/api/system/configs') {
    const rows = await env.Allworld.prepare(`SELECT * FROM lz_ai_system_configs ORDER BY key`).all()
    return json({ success: true, data: rows.results ?? [] })
  }

  return json({ success: false, error: 'Not Found' }, 404)
}
