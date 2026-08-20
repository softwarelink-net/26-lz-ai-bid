import { CORS_HEADERS, json, error, parseBody, requireAuth, queryAll, queryFirst, runSql, writeAudit } from '../_shared.js'

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet(context) {
  const auth = await requireAuth(context.request, context.env, ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'])
  if (auth.error) return auth.error
  const rows = (await queryAll(
    context.env,
    `SELECT t.*, i.name AS institution_name, i.district, u.real_name AS assignee_name
     FROM lz_ai_sla_tickets t
     LEFT JOIN lz_ai_institutions i ON i.id = t.institution_id
     LEFT JOIN lz_ai_users u ON u.id = t.assignee_id
     ORDER BY CASE t.severity WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, t.created_at DESC`,
  )) || []
  return json({ success: true, data: { tickets: rows, sla_hours: 4 } })
}

export async function onRequestPost(context) {
  const auth = await requireAuth(context.request, context.env, ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'])
  if (auth.error) return auth.error
  const body = await parseBody(context.request)
  const action = body?.action || 'update'

  if (action === 'create') {
    const id = `tkt_${Date.now()}`
    const ticketNo = `SLA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-3)}`
    const deadline = new Date(Date.now() + 4 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19)
    await runSql(
      context.env,
      `INSERT INTO lz_ai_sla_tickets (id, ticket_no, institution_id, severity, title, content, status, assignee_id, response_deadline)
       VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)`,
      [id, ticketNo, body.institution_id, body.severity || 'MEDIUM', body.title, body.content || '', body.assignee_id || null, deadline],
    )
    await writeAudit(context.env, auth.user.id, 'UPDATE_CONFIG', ticketNo, context.request)
    return json({ success: true, data: { id, ticket_no: ticketNo, response_deadline: deadline } })
  }

  const ticket = await queryFirst(context.env, 'SELECT * FROM lz_ai_sla_tickets WHERE id = ? OR ticket_no = ?', [
    body.id,
    body.id,
  ])
  if (!ticket) return error('工单不存在', 404)

  if (action === 'assign') {
    await runSql(
      context.env,
      `UPDATE lz_ai_sla_tickets SET assignee_id=?, status='IN_PROGRESS', responded_at=CURRENT_TIMESTAMP WHERE id=?`,
      [body.assignee_id || auth.user.id, ticket.id],
    )
  } else if (action === 'resolve') {
    await runSql(
      context.env,
      `UPDATE lz_ai_sla_tickets SET status='RESOLVED', resolved_at=CURRENT_TIMESTAMP WHERE id=?`,
      [ticket.id],
    )
  } else if (action === 'close') {
    await runSql(context.env, `UPDATE lz_ai_sla_tickets SET status='CLOSED' WHERE id=?`, [ticket.id])
  } else {
    return error('未知操作')
  }

  await writeAudit(context.env, auth.user.id, 'UPDATE_CONFIG', ticket.ticket_no, context.request)
  return json({ success: true })
}
