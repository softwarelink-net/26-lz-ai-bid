import type { AuthUser, DiagnosticRecord, Institution, Roi, SlaTicket, AuditLog } from '@/types'

const TOKEN_KEY = 'lz_ai_token'

export const DEMO_USERS: Array<AuthUser & { password: string }> = [
  {
    id: 'u_admin',
    username: 'admin',
    password: 'Admin@2026',
    real_name: '系统管理员',
    email: 'admin@lzcdc.cn',
    phone_masked: '187****6618',
    role: 'ROLE_SUPER_ADMIN',
    organization: '泸州市疾病预防控制中心',
  },
  {
    id: 'u_expert',
    username: 'expert',
    password: 'Expert@2026',
    real_name: '张主治（结核质控组）',
    email: 'expert@lzcdc.cn',
    phone_masked: '189****1122',
    role: 'ROLE_CDC_EXPERT',
    organization: '泸州市疾控中心结核病防制科',
  },
  {
    id: 'u_doctor',
    username: 'doctor',
    password: 'Doctor@2026',
    real_name: '李临床医师',
    email: 'doctor@lzcdc.cn',
    phone_masked: '138****3344',
    role: 'ROLE_CLINICAL_DOCTOR',
    organization: '纳溪区人民医院放射科',
  },
  {
    id: 'u_ops',
    username: 'ops',
    password: 'Ops@2026',
    real_name: '陈工（驻场支持）',
    email: 'ops@lzcdc.cn',
    phone_masked: '177****8899',
    role: 'ROLE_OPS_ENGINEER',
    organization: '运营服务技术支持中心',
  },
]

const rois001: Roi[] = [
  { x: 260, y: 180, w: 90, h: 75, label: '活动性病灶', type: 'infiltrate', confidence: 0.94 },
  { x: 288, y: 198, w: 28, h: 24, label: '微小空洞', type: 'cavity', confidence: 0.81 },
]
const rois003: Roi[] = [
  { x: 140, y: 150, w: 70, h: 55, label: '纤维条索', type: 'fibrosis', confidence: 0.88 },
  { x: 162, y: 168, w: 18, h: 16, label: '钙化', type: 'calcification', confidence: 0.76 },
]

export const MOCK_INSTITUTIONS: Institution[] = [
  { id: 'inst_01', code: 'LZ-CDC-001', name: '泸州市疾病预防控制中心门诊部', district: '纳溪区', tier_level: '疾控专科', pacs_endpoint: 'pacs.lzcdc.org.cn:104', sync_status: 'ONLINE', last_heartbeat_at: '2026-08-17 15:58:00' },
  { id: 'inst_02', code: 'NX-PH-002', name: '泸州市纳溪区人民医院', district: '纳溪区', tier_level: '二甲', pacs_endpoint: '10.51.22.10:4242', sync_status: 'ONLINE', last_heartbeat_at: '2026-08-17 15:59:12' },
  { id: 'inst_03', code: 'JY-TH-003', name: '泸州市江阳区中医医院', district: '江阳区', tier_level: '二甲', pacs_endpoint: '10.51.18.5:4242', sync_status: 'ONLINE', last_heartbeat_at: '2026-08-17 15:57:41' },
  { id: 'inst_04', code: 'SY-PH-004', name: '叙永县人民医院', district: '叙永县', tier_level: '二甲', pacs_endpoint: '10.51.99.12:4242', sync_status: 'ONLINE', last_heartbeat_at: '2026-08-17 15:56:08' },
  { id: 'inst_05', code: 'LM-PH-005', name: '泸州市龙马潭区人民医院', district: '龙马潭区', tier_level: '二甲', pacs_endpoint: '10.51.31.8:4242', sync_status: 'ONLINE', last_heartbeat_at: '2026-08-17 15:54:22' },
  { id: 'inst_06', code: 'HJ-PH-006', name: '合江县人民医院', district: '合江县', tier_level: '二甲', pacs_endpoint: '10.51.44.16:4242', sync_status: 'DEGRADED', last_heartbeat_at: '2026-08-17 15:12:03' },
  { id: 'inst_07', code: 'GL-PH-007', name: '古蔺县人民医院', district: '古蔺县', tier_level: '二甲', pacs_endpoint: '10.51.71.21:4242', sync_status: 'ONLINE', last_heartbeat_at: '2026-08-17 15:50:19' },
  { id: 'inst_08', code: 'LX-PH-008', name: '泸县人民医院', district: '泸县', tier_level: '二甲', pacs_endpoint: '10.51.62.9:4242', sync_status: 'OFFLINE', last_heartbeat_at: '2026-08-17 12:08:44' },
]

const state = {
  records: [
    { id: 'rec_001', institution_id: 'inst_02', institution_name: '泸州市纳溪区人民医院', district: '纳溪区', patient_hash_id: 'HASH_9B8F72A10D', gender: 'M', age_group: '50-55', modality: 'DR', body_part: 'CHEST', image_url: '/assets/demo/chest-dr-01.jpg', dicom_meta_json: '{"Manufacturer":"Mindray","KVP":"120"}', ai_status: 'COMPLETED', ai_confidence: 0.94, ai_finding: '右肺上叶见斑片状、纤维索条状高密度影，伴可疑微小空洞形成，高度提示活动性肺结核', ai_rois: rois001, review_status: 'CONFIRMED', reviewer_id: 'u_expert', reviewer_name: '张主治（结核质控组）', review_comment: '同意 AI 提示，建议痰涂片+GeneXpert 复核。', reviewed_at: '2026-08-16 11:20:00', created_at: '2026-08-16 09:18:00' },
    { id: 'rec_002', institution_id: 'inst_04', institution_name: '叙永县人民医院', district: '叙永县', patient_hash_id: 'HASH_3C1E55E88B', gender: 'F', age_group: '30-35', modality: 'CT', body_part: 'CHEST', image_url: '/assets/demo/chest-ct-02.jpg', dicom_meta_json: '{"Manufacturer":"UIH","SliceThickness":"1.25"}', ai_status: 'COMPLETED', ai_confidence: 0.12, ai_finding: '双肺纹理清晰，未见实质性浸润或结核空洞', ai_rois: [], review_status: 'UNREVIEWED', reviewer_id: null, reviewer_name: null, review_comment: null, reviewed_at: null, created_at: '2026-08-17 08:42:00' },
    { id: 'rec_003', institution_id: 'inst_03', institution_name: '泸州市江阳区中医医院', district: '江阳区', patient_hash_id: 'HASH_A71D04C992', gender: 'M', age_group: '60-65', modality: 'DR', body_part: 'CHEST', image_url: '/assets/demo/chest-dr-01.jpg', ai_status: 'COMPLETED', ai_confidence: 0.88, ai_finding: '左肺尖纤维条索伴钙化灶，倾向陈旧性肺结核，活动性待排', ai_rois: rois003, review_status: 'UNREVIEWED', reviewer_id: null, created_at: '2026-08-17 10:05:00' },
    { id: 'rec_004', institution_id: 'inst_05', institution_name: '泸州市龙马潭区人民医院', district: '龙马潭区', patient_hash_id: 'HASH_E20B77F441', gender: 'F', age_group: '45-50', modality: 'CT', body_part: 'CHEST', image_url: '/assets/demo/chest-ct-02.jpg', ai_status: 'PROCESSING', ai_confidence: null, ai_finding: null, ai_rois: [], review_status: 'UNREVIEWED', created_at: '2026-08-17 15:48:00' },
    { id: 'rec_005', institution_id: 'inst_06', institution_name: '合江县人民医院', district: '合江县', patient_hash_id: 'HASH_CC19A0B773', gender: 'M', age_group: '55-60', modality: 'DR', body_part: 'CHEST', image_url: '/assets/demo/chest-dr-01.jpg', ai_status: 'COMPLETED', ai_confidence: 0.71, ai_finding: '右中肺野斑片浸润，肺结核待鉴别，建议 CT 进一步评估', ai_rois: [{ x: 300, y: 230, w: 80, h: 64, label: '浸润', type: 'infiltrate', confidence: 0.71 }], review_status: 'REVISED', reviewer_id: 'u_doctor', reviewer_name: '李临床医师', review_comment: '基层初筛：不除外炎症，已申请薄层 CT。', reviewed_at: '2026-08-17 14:22:00', created_at: '2026-08-17 13:10:00' },
    { id: 'rec_006', institution_id: 'inst_07', institution_name: '古蔺县人民医院', district: '古蔺县', patient_hash_id: 'HASH_55DE8A12F0', gender: 'M', age_group: '40-45', modality: 'DR', body_part: 'CHEST', image_url: '/assets/demo/chest-dr-01.jpg', ai_status: 'FAILED', ai_confidence: null, ai_finding: '边缘推理超时，已自动重入队列', ai_rois: [], review_status: 'UNREVIEWED', created_at: '2026-08-17 15:33:00' },
    { id: 'rec_007', institution_id: 'inst_01', institution_name: '泸州市疾病预防控制中心门诊部', district: '纳溪区', patient_hash_id: 'HASH_91AA22B6CE', gender: 'F', age_group: '25-30', modality: 'DR', body_part: 'CHEST', image_url: '/assets/demo/chest-dr-01.jpg', ai_status: 'COMPLETED', ai_confidence: 0.08, ai_finding: '胸廓对称，肺野清晰，心膈正常', ai_rois: [], review_status: 'CONFIRMED', reviewer_id: 'u_expert', reviewer_name: '张主治（结核质控组）', review_comment: '阴性，归档。', reviewed_at: '2026-08-15 16:40:00', created_at: '2026-08-15 16:12:00' },
    { id: 'rec_008', institution_id: 'inst_08', institution_name: '泸县人民医院', district: '泸县', patient_hash_id: 'HASH_07F3C9D81A', gender: 'M', age_group: '70-75', modality: 'CT', body_part: 'CHEST', image_url: '/assets/demo/chest-ct-02.jpg', ai_status: 'PENDING', ai_confidence: null, ai_finding: null, ai_rois: [], review_status: 'UNREVIEWED', created_at: '2026-08-17 12:01:00' },
  ] as DiagnosticRecord[],
  tickets: [
    { id: 'tkt_001', ticket_no: 'SLA-20260817-001', institution_id: 'inst_08', institution_name: '泸县人民医院', district: '泸县', severity: 'CRITICAL', title: '泸县人民医院 PACS 心跳中断', content: 'DICOM C-ECHO 连续失败 12 次，疑专网链路或网关证书过期。合同 4 小时现场响应。', status: 'IN_PROGRESS', assignee_id: 'u_ops', assignee_name: '陈工（驻场支持）', response_deadline: '2026-08-17 16:08:44', responded_at: '2026-08-17 12:26:00', resolved_at: null, created_at: '2026-08-17 12:08:44' },
    { id: 'tkt_002', ticket_no: 'SLA-20260817-002', institution_id: 'inst_06', institution_name: '合江县人民医院', district: '合江县', severity: 'HIGH', title: '合江县人民医院推理延迟升高', content: 'P95 由 82ms 升至 410ms，边缘节点 CPU 88%。', status: 'OPEN', assignee_id: null, assignee_name: null, response_deadline: '2026-08-17 19:12:03', responded_at: null, resolved_at: null, created_at: '2026-08-17 15:12:03' },
    { id: 'tkt_003', ticket_no: 'SLA-20260816-018', institution_id: 'inst_04', institution_name: '叙永县人民医院', district: '叙永县', severity: 'MEDIUM', title: '叙永县 DR 设备元数据缺失', content: '部分 Study 缺少 KVP 标签，脱敏管道告警。', status: 'RESOLVED', assignee_id: 'u_ops', assignee_name: '陈工（驻场支持）', response_deadline: '2026-08-16 14:40:00', responded_at: '2026-08-16 11:05:00', resolved_at: '2026-08-16 13:18:00', created_at: '2026-08-16 10:40:00' },
    { id: 'tkt_004', ticket_no: 'SLA-20260815-009', institution_id: 'inst_02', institution_name: '泸州市纳溪区人民医院', district: '纳溪区', severity: 'LOW', title: '纳溪区人民医院模型版本确认', content: 'TB-Net v2.4.1 灰度发布完成后需现场确认。', status: 'CLOSED', assignee_id: 'u_ops', assignee_name: '陈工（驻场支持）', response_deadline: '2026-08-15 16:00:00', responded_at: '2026-08-15 12:20:00', resolved_at: '2026-08-15 15:10:00', created_at: '2026-08-15 12:00:00' },
  ] as SlaTicket[],
  audits: [
    { id: 'aud_001', operator_id: 'u_expert', operator_name: '张主治（结核质控组）', action_type: 'VIEW_IMAGE', target_resource: 'rec_001', client_ip: '10.51.1.18', signature_hash: 'SIG_7C91A0E4', created_at: '2026-08-16 11:18:22' },
    { id: 'aud_002', operator_id: 'u_expert', operator_name: '张主治（结核质控组）', action_type: 'EXPORT_REPORT', target_resource: 'rec_001', client_ip: '10.51.1.18', signature_hash: 'SIG_A12F88B1', created_at: '2026-08-16 11:21:04' },
    { id: 'aud_003', operator_id: 'u_doctor', operator_name: '李临床医师', action_type: 'TRIGGER_AI', target_resource: 'rec_005', client_ip: '10.51.22.44', signature_hash: 'SIG_33D0C91E', created_at: '2026-08-17 13:11:18' },
    { id: 'aud_004', operator_id: 'u_ops', operator_name: '陈工（驻场支持）', action_type: 'UPDATE_CONFIG', target_resource: 'FEATURE_AUTO_ALERT', client_ip: '10.51.8.2', signature_hash: 'SIG_90EE12AB', created_at: '2026-08-17 09:02:41' },
    { id: 'aud_005', operator_id: 'u_admin', operator_name: '系统管理员', action_type: 'VIEW_IMAGE', target_resource: 'lz_ai_audit_logs', client_ip: '10.51.1.2', signature_hash: 'SIG_BB17F003', created_at: '2026-08-17 08:12:09' },
  ] as AuditLog[],
  configs: [
    { key: 'FEATURE_AI_3D_CT', category: 'MODEL', value: 'true', description: '是否开启多层螺旋CT 3D结节与结核空洞渲染特征' },
    { key: 'FEATURE_AUTO_ALERT', category: 'ALARM', value: 'true', description: 'AI高置信度(>0.85)自动短信与疾控平台双向预警' },
    { key: 'FEATURE_AUTO_REPORT', category: 'WORKFLOW', value: 'false', description: '全自动报告下发（需专家终审开关）' },
    { key: 'SLA_MAX_RESPONSE_HOURS', category: 'SLA', value: '4', description: '合同约定重大事件现场响应最长时限（小时）' },
    { key: 'DICOM_GATEWAY_NODE', category: 'NETWORK', value: 'https://telemed.lzcdc.internal/gateway', description: '泸州远程医疗平台接入中继节点' },
  ],
  events: [
    { id: 'gw_001', protocol: 'DICOM', direction: 'IN', institution_id: 'inst_02', institution_name: '泸州市纳溪区人民医院', district: '纳溪区', payload_summary: 'C-STORE CR/DR CHEST · UID 伪化完成', phi_fields_masked: 4, bytes: 18432000, latency_ms: 86, status: 'OK', created_at: '2026-08-17 15:59:01' },
    { id: 'gw_002', protocol: 'HL7', direction: 'IN', institution_id: 'inst_03', institution_name: '泸州市江阳区中医医院', district: '江阳区', payload_summary: 'ORU^R01 影像报告回传 · PID 掩码', phi_fields_masked: 3, bytes: 4096, latency_ms: 22, status: 'OK', created_at: '2026-08-17 15:58:44' },
    { id: 'gw_003', protocol: 'FHIR', direction: 'OUT', institution_id: 'inst_01', institution_name: '泸州市疾病预防控制中心门诊部', district: '纳溪区', payload_summary: 'ImagingStudy 同步至市疾控平台', phi_fields_masked: 2, bytes: 12288, latency_ms: 41, status: 'OK', created_at: '2026-08-17 15:57:12' },
    { id: 'gw_004', protocol: 'DICOM', direction: 'IN', institution_id: 'inst_08', institution_name: '泸县人民医院', district: '泸县', payload_summary: 'C-ECHO 超时', phi_fields_masked: 0, bytes: 0, latency_ms: 4000, status: 'FAIL', created_at: '2026-08-17 12:08:40' },
  ],
}

function authHeader() {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path: string, options: RequestInit = {}) {
  try {
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader(),
        ...(options.headers || {}),
      },
    })
    return await res.json()
  } catch {
    return null
  }
}

function nowStr() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

export async function login(username: string, password: string) {
  const remote = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  if (remote?.success) return remote
  const user = DEMO_USERS.find(
    (u) => (u.email === username || u.username === username) && u.password === password,
  )
  if (!user) return { success: false, error: '账号或密码错误' }
  const { password: _pw, ...safe } = user
  const token = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 8e6 }))
  return { success: true, token: `demo.${token}.sig`, user: safe }
}

export async function fetchDashboard() {
  const remote = await request('/api/dashboard')
  if (remote?.success) return remote.data
  const completed = state.records.filter((r) => r.ai_status === 'COMPLETED')
  const positive = completed.filter((r) => (r.ai_confidence || 0) >= 0.7)
  const districts = ['江阳区', '龙马潭区', '纳溪区', '合江县', '叙永县', '古蔺县', '泸县'].map((d) => {
    const nodes = MOCK_INSTITUTIONS.filter((i) => i.district === d)
    const recs = state.records.filter((r) => r.district === d)
    const status = nodes.some((n) => n.sync_status === 'OFFLINE')
      ? 'OFFLINE'
      : nodes.some((n) => n.sync_status === 'DEGRADED')
        ? 'DEGRADED'
        : 'ONLINE'
    return {
      district: d,
      nodes: nodes.length,
      online: nodes.filter((n) => n.sync_status === 'ONLINE').length,
      screening: recs.length + (d === '纳溪区' ? 420 : 180),
      positive: recs.filter((r) => (r.ai_confidence || 0) >= 0.7).length,
      status,
    }
  })
  return {
    kpis: {
      screening_total: 128438,
      p95_ms: 86,
      p99_ms: 142,
      avg_ms: 48,
      positive_rate: completed.length ? +((positive.length / completed.length) * 100).toFixed(2) : 2.18,
      online_nodes: MOCK_INSTITUTIONS.filter((i) => i.sync_status === 'ONLINE').length,
      total_nodes: MOCK_INSTITUTIONS.length,
      open_tickets: state.tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
    },
    districts,
    institutions: MOCK_INSTITUTIONS,
    queue: state.records.filter((r) => ['PENDING', 'PROCESSING', 'FAILED'].includes(r.ai_status)),
    tickets: state.tickets.slice(0, 6),
    audits: state.audits,
    series: {
      daily: [
        { d: '08-11', n: 1860, p: 38 },
        { d: '08-12', n: 1922, p: 41 },
        { d: '08-13', n: 1744, p: 33 },
        { d: '08-14', n: 2018, p: 47 },
        { d: '08-15', n: 1886, p: 39 },
        { d: '08-16', n: 2104, p: 52 },
        { d: '08-17', n: 1630, p: 29 },
      ],
      latency: [
        { t: '10:00', p95: 78, p99: 128 },
        { t: '11:00', p95: 82, p99: 136 },
        { t: '12:00', p95: 91, p99: 154 },
        { t: '13:00', p95: 84, p99: 140 },
        { t: '14:00', p95: 79, p99: 132 },
        { t: '15:00', p95: 86, p99: 142 },
      ],
    },
  }
}

export async function fetchDiagnostics(id?: string) {
  if (id) {
    const remote = await request(`/api/diagnostic?id=${encodeURIComponent(id)}`)
    if (remote?.success) return remote.data
    return state.records.find((r) => r.id === id) || null
  }
  const remote = await request('/api/diagnostic')
  if (remote?.success) return remote.data
  return { records: state.records }
}

export async function reviewDiagnostic(payload: { id: string; review_status: string; review_comment?: string }) {
  const remote = await request('/api/diagnostic', {
    method: 'POST',
    body: JSON.stringify({ action: 'review', ...payload }),
  })
  if (remote?.success) return remote
  const rec = state.records.find((r) => r.id === payload.id)
  if (rec) {
    rec.review_status = payload.review_status
    rec.review_comment = payload.review_comment || ''
    rec.reviewed_at = nowStr()
  }
  return { success: true }
}

export async function inferDiagnostic(id: string) {
  const remote = await request('/api/diagnostic', {
    method: 'POST',
    body: JSON.stringify({ action: 'infer', id }),
  })
  if (remote?.success) return remote
  const rec = state.records.find((r) => r.id === id)
  if (rec) {
    rec.ai_status = 'COMPLETED'
    rec.ai_confidence = 0.86
    rec.ai_finding = '右肺上叶斑片浸润伴空洞倾向，高度提示活动性肺结核'
    rec.ai_rois = [{ x: 250, y: 170, w: 88, h: 70, label: '可疑病灶', type: 'infiltrate', confidence: 0.86 }]
  }
  return { success: true, data: rec }
}

export async function signDiagnostic(id: string) {
  const remote = await request('/api/diagnostic', {
    method: 'POST',
    body: JSON.stringify({ action: 'sign', id }),
  })
  if (remote?.success) return remote
  return {
    success: true,
    data: {
      signer: '演示签名',
      signed_at: new Date().toISOString(),
      digest: `SM3:${id}:${Date.now()}`,
    },
  }
}

export async function fetchSla() {
  const remote = await request('/api/sla')
  if (remote?.success) return remote.data
  return { tickets: state.tickets, sla_hours: 4 }
}

export async function mutateSla(payload: Record<string, unknown>) {
  const remote = await request('/api/sla', { method: 'POST', body: JSON.stringify(payload) })
  if (remote?.success) return remote
  const t = state.tickets.find((x) => x.id === payload.id || x.ticket_no === payload.id)
  if (t && payload.action === 'assign') {
    t.status = 'IN_PROGRESS'
    t.assignee_id = 'u_ops'
    t.assignee_name = '陈工（驻场支持）'
    t.responded_at = nowStr()
  }
  if (t && payload.action === 'resolve') {
    t.status = 'RESOLVED'
    t.resolved_at = nowStr()
  }
  if (t && payload.action === 'close') t.status = 'CLOSED'
  if (payload.action === 'create') {
    const row: SlaTicket = {
      id: `tkt_${Date.now()}`,
      ticket_no: `SLA-${Date.now()}`,
      institution_id: String(payload.institution_id || 'inst_02'),
      institution_name: MOCK_INSTITUTIONS.find((i) => i.id === payload.institution_id)?.name,
      severity: String(payload.severity || 'MEDIUM'),
      title: String(payload.title || '新工单'),
      content: String(payload.content || ''),
      status: 'OPEN',
      response_deadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString().replace('T', ' ').slice(0, 19),
      created_at: nowStr(),
    }
    state.tickets.unshift(row)
    return { success: true, data: row }
  }
  return { success: true }
}

export async function fetchGateway() {
  const remote = await request('/api/gateway')
  if (remote?.success) return remote.data
  const ok = state.events.filter((e) => e.status === 'OK').length
  return {
    node: 'https://telemed.lzcdc.internal/gateway',
    tls: 'TLS 1.3 / mTLS 专网',
    compliance: ['数据安全法', '个人信息保护法', '医疗纠纷预防和处理条例', 'WS 365 卫生信息数据交换'],
    events: state.events,
    stats: {
      throughput_eps: 42,
      masked_fields_today: state.events.reduce((s, e) => s + e.phi_fields_masked, 0),
      success_rate: +((ok / state.events.length) * 100).toFixed(1),
    },
  }
}

export async function maskPhi(payload: { name?: string; id_card?: string; phone?: string }) {
  const remote = await request('/api/gateway', { method: 'POST', body: JSON.stringify(payload) })
  if (remote?.success) return remote.data
  const name = payload.name || '王建国'
  return {
    name: `${name[0]}${'*'.repeat(Math.max(name.length - 1, 1))}`,
    id_card: '5105**********0017',
    phone: '138****8000',
    uid: 'HASH_9B8F72A10D',
    study_uid: `1.2.840.PSEUDO.${Date.now()}`,
  }
}

export async function fetchConfigs() {
  const remote = await request('/api/system/configs')
  if (remote?.success) return remote.data
  return {
    configs: state.configs,
    feature_flags: Object.fromEntries(state.configs.map((c) => [c.key, c.value === 'true' || c.value])),
    users: DEMO_USERS.map(({ password: _p, ...u }) => u),
    institutions: MOCK_INSTITUTIONS,
    host: 'https://26-lz-ai-bid.softwarelink.net',
    repo: 'https://github.com/softwarelink-net/26-lz-ai-bid',
    r2: '26-lz-ai-bid-assets',
    d1: 'Allworld',
    worker: 'allworld',
  }
}

export async function updateConfig(key: string, value: string) {
  const remote = await request('/api/system/configs', {
    method: 'PUT',
    body: JSON.stringify({ key, value }),
  })
  if (remote?.success) return remote
  const row = state.configs.find((c) => c.key === key)
  if (row) row.value = String(value)
  return { success: true }
}

export async function fetchTender() {
  const remote = await request('/api/tender')
  if (remote?.success) return remote.data
  return mockTender()
}

export function mockTender() {
  const deadline = '2026-09-04 09:30:00'
  const end = new Date(deadline.replace(' ', 'T') + '+08:00').getTime()
  const diff = Math.max(0, end - Date.now())
  return {
    title: '泸州市疾病预防控制中心2026年人工智能辅助诊断信息系统运营服务项目(二次)招标公告',
    issuer: '泸州市疾病预防控制中心（代理机构：四川建桥项目管理有限公司）',
    project_no: 'N5105012026000255',
    publish_time: '2026年08月14日',
    keywords: '泸州市疾控中心、人工智能辅助诊断、医疗AI运营服务、肺结核AI诊断、四川政府采购、医疗信息化',
    summary:
      '泸州市疾病预防控制中心对2026年人工智能辅助诊断信息系统运营服务项目(二次)进行公开招标，采购预算为人民币350,000.00元，合同履行期限为自合同签订之日起30日内完成系统上线交付，并包含项目验收合格后第一年的全生命周期运营与运维服务。投标截止时间为2026年09月04日09时30分。',
    tech_points: [
      '与泸州市远程医疗平台深度对接，安全调阅并解析 DR、CT 等医学影像与诊断数据；',
      '深度应用肺结核等重大疾病人工智能辅助筛查算法，提供毫秒级病灶区域检测（ROI）与置信度热力图提示；',
      '遵循《中华人民共和国数据安全法》与《医疗纠纷预防和处理条例》，构建端到端 PHI 脱敏和专网级安全隔离机制；',
      '提供具备 4 小时内本地/远程快速响应能力的 7×24 小时运维体系及灾备保障。',
    ],
    innovation: [
      '构建基于 Cloudflare 全球边缘计算的极简高可用医疗 AI 运营架构，消除传统机房单点故障瓶颈；',
      '结合 WebAssembly 前端轻量化 DICOM 渲染与边缘流式推理代理，降低基层医院硬件负载；',
      '创新双重交叉验证质控流（AI 预筛 + 基层初筛 + 市疾控中心专家终审复核），提高区域重大传染病早筛早治闭环效率。',
    ],
    budget: 350000,
    bid_deadline: deadline,
    countdown: {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: diff <= 0,
    },
  }
}
