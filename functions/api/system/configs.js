import { CORS_HEADERS, json, error, parseBody, requireAuth, queryAll, runSql, writeAudit, MOCK_USERS } from '../_shared.js'

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env)
  if (auth.error) return auth.error
  const configs = (await queryAll(context.env, 'SELECT * FROM lz_ai_system_configs ORDER BY category, key')) || []
  const users = (await queryAll(
    context.env,
    'SELECT id, username, real_name, email, phone_masked, role, organization, is_active, last_login_at FROM lz_ai_users',
  )) || MOCK_USERS
  const institutions = (await queryAll(context.env, 'SELECT * FROM lz_ai_institutions')) || []
  return json({
    success: true,
    data: {
      configs,
      feature_flags: Object.fromEntries(configs.map((c) => [c.key, c.value === 'true' || c.value])),
      users,
      institutions,
      host: 'https://26-lz-ai-bid.softwarelink.net',
      repo: 'https://github.com/softwarelink-net/26-lz-ai-bid',
      r2: '26-lz-ai-bid-assets',
      d1: 'Allworld',
      worker: 'allworld',
    },
  })
}

export async function onRequestPut(context) {
  const auth = await requireAuth(context.request, context.env, ['ROLE_SUPER_ADMIN'])
  if (auth.error) return auth.error
  const body = await parseBody(context.request)
  if (!body?.key) return error('缺少配置键')
  await runSql(
    context.env,
    `UPDATE lz_ai_system_configs SET value=?, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE key=?`,
    [String(body.value), auth.user.id, body.key],
  )
  await writeAudit(context.env, auth.user.id, 'UPDATE_CONFIG', body.key, context.request)
  return json({ success: true })
}
