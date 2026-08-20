import {
  CORS_HEADERS,
  json,
  error,
  parseBody,
  signJwt,
  DEMO_PASSWORDS,
  MOCK_USERS,
  queryFirst,
  writeAudit,
  clientIp,
  runSql,
} from '../_shared.js'

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestPost(context) {
  const { request, env } = context
  const body = await parseBody(request)
  const username = body?.username || body?.email
  if (!username || !body?.password) {
    return error('请提供账号与密码')
  }

  let user = await queryFirst(
    env,
    'SELECT id, username, real_name, email, phone_masked, role, organization FROM lz_ai_users WHERE email = ? OR username = ?',
    [username, username],
  )

  if (!user) {
    user = MOCK_USERS.find((u) => u.email === username || u.username === username)
  }

  const expected = DEMO_PASSWORDS[username] || DEMO_PASSWORDS[user?.email] || DEMO_PASSWORDS[user?.username]
  if (!user || expected !== body.password) {
    return error('账号或密码错误', 401)
  }

  const secret = env.JWT_SECRET || 'lz-ai-bid-demo-jwt-secret-2026'
  const token = await signJwt(
    {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      email: user.email,
      phone_masked: user.phone_masked,
      role: user.role,
      organization: user.organization,
    },
    secret,
  )

  await runSql(env, 'UPDATE lz_ai_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id])
  await writeAudit(env, user.id, 'LOGIN', 'auth', request)

  return json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      email: user.email,
      phone_masked: user.phone_masked,
      role: user.role,
      organization: user.organization,
    },
  })
}
