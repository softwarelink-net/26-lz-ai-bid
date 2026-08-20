import {
  CORS_HEADERS,
  json,
  error,
  parseBody,
  requireAuth,
  queryAll,
  writeAudit,
  maskName,
  maskIdCard,
  maskPhone,
  hashUid,
} from '../_shared.js'

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env, ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'])
  if (auth.error) return auth.error
  const events = (await queryAll(
    context.env,
    `SELECT e.*, i.name AS institution_name, i.district
     FROM lz_ai_gateway_events e
     LEFT JOIN lz_ai_institutions i ON i.id = e.institution_id
     ORDER BY e.created_at DESC LIMIT 40`,
  )) || []
  const ok = events.filter((e) => e.status === 'OK').length
  return json({
    success: true,
    data: {
      node: 'https://telemed.lzcdc.internal/gateway',
      tls: 'TLS 1.3 / mTLS 专网',
      compliance: ['数据安全法', '个人信息保护法', '医疗纠纷预防和处理条例', 'WS 365 卫生信息数据交换'],
      events,
      stats: {
        throughput_eps: 42,
        masked_fields_today: events.reduce((s, e) => s + (e.phi_fields_masked || 0), 0),
        success_rate: events.length ? +((ok / events.length) * 100).toFixed(1) : 100,
      },
    },
  })
}

export async function onRequestPost(context) {
  const auth = await requireAuth(context.request, context.env, ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'])
  if (auth.error) return auth.error
  const body = await parseBody(context.request)
  if (!body) return error('无效载荷')
  const masked = {
    name: maskName(body.name || '王建国'),
    id_card: maskIdCard(body.id_card || '510502197803120017'),
    phone: maskPhone(body.phone || '13800138000'),
    uid: await hashUid(`${body.name || '王建国'}|${body.id_card || '510502197803120017'}`),
    study_uid: `1.2.840.PSEUDO.${Date.now()}`,
  }
  await writeAudit(context.env, auth.user.id, 'UPDATE_CONFIG', 'PHI_MASK', context.request)
  return json({ success: true, data: masked })
}
