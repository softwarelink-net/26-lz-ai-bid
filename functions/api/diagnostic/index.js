import {
  CORS_HEADERS,
  json,
  error,
  parseBody,
  requireAuth,
  queryAll,
  queryFirst,
  runSql,
  writeAudit,
} from '../_shared.js'

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env)
  if (auth.error) return auth.error

  const url = new URL(context.request.url)
  const id = url.searchParams.get('id')
  if (id) {
    const row = await queryFirst(
      context.env,
      `SELECT r.*, i.name AS institution_name, i.district, u.real_name AS reviewer_name
       FROM lz_ai_diagnostic_records r
       LEFT JOIN lz_ai_institutions i ON i.id = r.institution_id
       LEFT JOIN lz_ai_users u ON u.id = r.reviewer_id
       WHERE r.id = ?`,
      [id],
    )
    if (!row) return error('记录不存在', 404)
    await writeAudit(context.env, auth.user.id, 'VIEW_IMAGE', id, context.request)
    if (row.ai_rois_json && typeof row.ai_rois_json === 'string') {
      try {
        row.ai_rois = JSON.parse(row.ai_rois_json)
      } catch {
        row.ai_rois = []
      }
    }
    return json({ success: true, data: row })
  }

  let sql = `SELECT r.*, i.name AS institution_name, i.district
             FROM lz_ai_diagnostic_records r
             LEFT JOIN lz_ai_institutions i ON i.id = r.institution_id`
  const binds = []
  if (auth.user.role === 'ROLE_CLINICAL_DOCTOR') {
    sql += ' WHERE i.name LIKE ?'
    binds.push('%纳溪区人民医院%')
  }
  sql += ' ORDER BY r.created_at DESC'
  const rows = (await queryAll(context.env, sql, binds)) || []
  for (const row of rows) {
    try {
      row.ai_rois = row.ai_rois_json ? JSON.parse(row.ai_rois_json) : []
    } catch {
      row.ai_rois = []
    }
  }
  return json({ success: true, data: { records: rows } })
}

export async function onRequestPost(context) {
  const auth = await requireAuth(context.request, context.env, [
    'ROLE_SUPER_ADMIN',
    'ROLE_CDC_EXPERT',
    'ROLE_CLINICAL_DOCTOR',
  ])
  if (auth.error) return auth.error
  const body = await parseBody(context.request)
  const action = body?.action || 'review'

  if (action === 'infer') {
    const id = body.id
    const rec = await queryFirst(context.env, 'SELECT * FROM lz_ai_diagnostic_records WHERE id = ?', [id])
    if (!rec) return error('记录不存在', 404)
    const confidence = 0.72 + Math.random() * 0.22
    const finding =
      confidence > 0.85
        ? '右肺上叶斑片浸润伴空洞倾向，高度提示活动性肺结核'
        : '可见纤维条索，活动性待鉴别，建议薄层 CT'
    const rois = JSON.stringify([
      { x: 250, y: 170, w: 88, h: 70, label: '可疑病灶', type: 'infiltrate', confidence: +confidence.toFixed(2) },
    ])
    await runSql(
      context.env,
      `UPDATE lz_ai_diagnostic_records
       SET ai_status='COMPLETED', ai_confidence=?, ai_finding=?, ai_rois_json=?
       WHERE id=?`,
      [+confidence.toFixed(2), finding, rois, id],
    )
    await writeAudit(context.env, auth.user.id, 'TRIGGER_AI', id, context.request)
    return json({ success: true, data: { id, ai_confidence: +confidence.toFixed(2), ai_finding: finding } })
  }

  if (action === 'review') {
    const { id, review_status, review_comment } = body
    if (!id || !review_status) return error('缺少复核参数')
    await runSql(
      context.env,
      `UPDATE lz_ai_diagnostic_records
       SET review_status=?, review_comment=?, reviewer_id=?, reviewed_at=CURRENT_TIMESTAMP
       WHERE id=?`,
      [review_status, review_comment || '', auth.user.id, id],
    )
    await writeAudit(context.env, auth.user.id, 'EXPORT_REPORT', id, context.request)
    return json({ success: true })
  }

  if (action === 'sign') {
    const id = body.id
    const rec = await queryFirst(context.env, 'SELECT * FROM lz_ai_diagnostic_records WHERE id = ?', [id])
    if (!rec) return error('记录不存在', 404)
    const stamp = {
      signer_id: auth.user.id,
      signer: auth.user.real_name,
      role: auth.user.role,
      signed_at: new Date().toISOString(),
      digest: `SM3:${id}:${auth.user.id}:${Date.now()}`,
    }
    await writeAudit(context.env, auth.user.id, 'EXPORT_REPORT', `sign:${id}`, context.request)
    return json({ success: true, data: stamp })
  }

  return error('未知操作')
}
