import { CORS_HEADERS, json, requireAuth, queryAll } from '../_shared.js'

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env, ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'])
  if (auth.error) return auth.error
  const logs = (await queryAll(
    context.env,
    `SELECT a.*, u.real_name AS operator_name, u.role AS operator_role
     FROM lz_ai_audit_logs a
     LEFT JOIN lz_ai_users u ON u.id = a.operator_id
     ORDER BY a.created_at DESC LIMIT 80`,
  )) || []
  return json({ success: true, data: { logs } })
}
