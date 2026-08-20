export type Role =
  | 'ROLE_SUPER_ADMIN'
  | 'ROLE_CDC_EXPERT'
  | 'ROLE_CLINICAL_DOCTOR'
  | 'ROLE_OPS_ENGINEER'

export interface AuthUser {
  id: string
  username: string
  real_name: string
  email: string
  phone_masked?: string
  role: Role
  organization: string
}

export interface Roi {
  x: number
  y: number
  w: number
  h: number
  label?: string
  type?: 'infiltrate' | 'cavity' | 'fibrosis' | 'calcification' | string
  confidence?: number
}

export interface Institution {
  id: string
  code: string
  name: string
  district: string
  tier_level: string
  pacs_endpoint?: string
  sync_status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | string
  last_heartbeat_at?: string
}

export interface DiagnosticRecord {
  id: string
  institution_id: string
  institution_name?: string
  district?: string
  patient_hash_id: string
  gender: 'M' | 'F' | 'O' | string
  age_group: string
  modality: 'DR' | 'CT' | string
  body_part: string
  image_url: string
  dicom_meta_json?: string
  ai_status: string
  ai_confidence: number | null
  ai_finding: string | null
  ai_rois_json?: string
  ai_rois?: Roi[]
  review_status: string
  reviewer_id?: string | null
  reviewer_name?: string | null
  review_comment?: string | null
  reviewed_at?: string | null
  created_at: string
}

export interface SlaTicket {
  id: string
  ticket_no: string
  institution_id: string
  institution_name?: string
  district?: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string
  title: string
  content: string
  status: string
  assignee_id?: string | null
  assignee_name?: string | null
  response_deadline: string
  responded_at?: string | null
  resolved_at?: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  operator_id: string
  operator_name?: string
  action_type: string
  target_resource: string
  client_ip?: string
  user_agent?: string
  signature_hash: string
  created_at: string
}

export const ROLE_LABELS: Record<Role, string> = {
  ROLE_SUPER_ADMIN: '超级管理员',
  ROLE_CDC_EXPERT: '疾控中心专家',
  ROLE_CLINICAL_DOCTOR: '基层临床医生',
  ROLE_OPS_ENGINEER: '运维与安全工程师',
}

export const ALL_ROLES: Role[] = [
  'ROLE_SUPER_ADMIN',
  'ROLE_CDC_EXPERT',
  'ROLE_CLINICAL_DOCTOR',
  'ROLE_OPS_ENGINEER',
]
