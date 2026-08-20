/** Shared helpers for Cloudflare Workers API handlers — 26-lz-ai-bid */

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  })
}

export function error(message, status = 400) {
  return json({ success: false, error: message }, status)
}

export async function parseBody(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function bytesToBase64Url(bytes) {
  let bin = ''
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
  return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function utf8ToBase64Url(str) {
  return bytesToBase64Url(new TextEncoder().encode(str))
}

function base64UrlToBytes(s) {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/')
  const padded = pad + '='.repeat((4 - (pad.length % 4)) % 4)
  const bin = atob(padded)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function base64UrlToUtf8(s) {
  return new TextDecoder().decode(base64UrlToBytes(s))
}

export function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return hex(buf)
}

export async function hashUid(raw) {
  const h = await sha256Hex(`LZCDC|${raw}`)
  return `HASH_${h.slice(0, 10).toUpperCase()}`
}

export function maskName(name) {
  if (!name) return '**'
  const chars = [...String(name)]
  if (chars.length === 1) return `${chars[0]}*`
  return `${chars[0]}${'*'.repeat(chars.length - 1)}`
}

export function maskIdCard(id) {
  const s = String(id || '')
  if (s.length < 8) return '**************'
  return `${s.slice(0, 4)}**********${s.slice(-4)}`
}

export function maskPhone(phone) {
  const s = String(phone || '').replace(/\D/g, '')
  if (s.length < 7) return '*******'
  return `${s.slice(0, 3)}****${s.slice(-4)}`
}

export async function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const enc = new TextEncoder()
  const h = utf8ToBase64Url(JSON.stringify(header))
  const p = utf8ToBase64Url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 8 * 3600 * 1000 }))
  const data = `${h}.${p}`
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return `${data}.${bytesToBase64Url(new Uint8Array(sig))}`
}

export async function verifyJwt(token, secret) {
  if (!token) return null
  const parts = token.replace(/^Bearer\s+/i, '').split('.')
  if (parts.length !== 3) return null
  const [, p, s] = parts
  const enc = new TextEncoder()
  const data = `${parts[0]}.${p}`
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const ok = await crypto.subtle.verify('HMAC', key, base64UrlToBytes(s), enc.encode(data))
  if (!ok) return null
  try {
    const payload = JSON.parse(base64UrlToUtf8(p))
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export async function requireAuth(request, env, roles = []) {
  const auth = request.headers.get('Authorization') || ''
  const secret = env.JWT_SECRET || 'lz-ai-bid-demo-jwt-secret-2026'
  const payload = await verifyJwt(auth, secret)
  if (!payload) return { error: error('未授权，请先登录', 401) }
  if (roles.length && !roles.includes(payload.role) && payload.role !== 'ROLE_SUPER_ADMIN') {
    return { error: error('权限不足', 403) }
  }
  return { user: payload }
}

export const DEMO_PASSWORDS = {
  'admin@lzcdc.cn': 'Admin@2026',
  admin: 'Admin@2026',
  'expert@lzcdc.cn': 'Expert@2026',
  expert: 'Expert@2026',
  'doctor@lzcdc.cn': 'Doctor@2026',
  doctor: 'Doctor@2026',
  'ops@lzcdc.cn': 'Ops@2026',
  ops: 'Ops@2026',
}

export const MOCK_USERS = [
  {
    id: 'u_admin',
    username: 'admin',
    real_name: '系统管理员',
    email: 'admin@lzcdc.cn',
    phone_masked: '187****6618',
    role: 'ROLE_SUPER_ADMIN',
    organization: '泸州市疾病预防控制中心',
  },
  {
    id: 'u_expert',
    username: 'expert',
    real_name: '张主治（结核质控组）',
    email: 'expert@lzcdc.cn',
    phone_masked: '189****1122',
    role: 'ROLE_CDC_EXPERT',
    organization: '泸州市疾控中心结核病防制科',
  },
  {
    id: 'u_doctor',
    username: 'doctor',
    real_name: '李临床医师',
    email: 'doctor@lzcdc.cn',
    phone_masked: '138****3344',
    role: 'ROLE_CLINICAL_DOCTOR',
    organization: '纳溪区人民医院放射科',
  },
  {
    id: 'u_ops',
    username: 'ops',
    real_name: '陈工（驻场支持）',
    email: 'ops@lzcdc.cn',
    phone_masked: '177****8899',
    role: 'ROLE_OPS_ENGINEER',
    organization: '运营服务技术支持中心',
  },
]

function db(env) {
  return env?.DB || env?.Allworld || null
}

export async function queryAll(env, sql, binds = []) {
  const d = db(env)
  if (!d) return null
  try {
    const stmt = d.prepare(sql)
    const res = binds.length ? await stmt.bind(...binds).all() : await stmt.all()
    return res.results || []
  } catch {
    return null
  }
}

export async function queryFirst(env, sql, binds = []) {
  const d = db(env)
  if (!d) return null
  try {
    const stmt = d.prepare(sql)
    return binds.length ? await stmt.bind(...binds).first() : await stmt.first()
  } catch {
    return null
  }
}

export async function runSql(env, sql, binds = []) {
  const d = db(env)
  if (!d) return false
  try {
    const stmt = d.prepare(sql)
    if (binds.length) await stmt.bind(...binds).run()
    else await stmt.run()
    return true
  } catch {
    return false
  }
}

export async function writeAudit(env, operatorId, actionType, targetResource, request) {
  const id = `aud_${Date.now()}`
  const ip = clientIp(request)
  const ua = request?.headers?.get?.('User-Agent') || 'unknown'
  const signature = await sha256Hex(`${operatorId}|${actionType}|${targetResource}|${Date.now()}`)
  await runSql(
    env,
    'INSERT INTO lz_ai_audit_logs (id, operator_id, action_type, target_resource, client_ip, user_agent, signature_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, operatorId || 'anonymous', actionType, targetResource, ip, ua.slice(0, 180), `SIG_${signature.slice(0, 8).toUpperCase()}`],
  )
}

export function clientIp(request) {
  if (!request?.headers) return '127.0.0.1'
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '127.0.0.1'
}

export const TENDER = {
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
  bid_deadline: '2026-09-04 09:30:00',
}

export function countdownOf(deadline) {
  const end = new Date(String(deadline).replace(' ', 'T') + '+08:00').getTime()
  const diff = Math.max(0, end - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: diff <= 0,
  }
}
