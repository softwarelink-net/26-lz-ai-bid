-- 1. 用户与认证表
CREATE TABLE IF NOT EXISTS lz_ai_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    real_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_masked TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ROLE_SUPER_ADMIN', 'ROLE_CDC_EXPERT', 'ROLE_CLINICAL_DOCTOR', 'ROLE_OPS_ENGINEER')),
    organization TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 全局系统配置与 Feature Flags 表
CREATE TABLE IF NOT EXISTS lz_ai_system_configs (
    key TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    is_public INTEGER DEFAULT 0,
    updated_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 区域接入医疗机构表
CREATE TABLE IF NOT EXISTS lz_ai_institutions (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    tier_level TEXT NOT NULL,
    pacs_endpoint TEXT,
    sync_status TEXT DEFAULT 'ONLINE',
    last_heartbeat_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 影像与 AI 诊断任务主表 (PHI 已严格掩码脱敏)
CREATE TABLE IF NOT EXISTS lz_ai_diagnostic_records (
    id TEXT PRIMARY KEY,
    institution_id TEXT NOT NULL,
    patient_hash_id TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('M', 'F', 'O')),
    age_group TEXT,
    modality TEXT NOT NULL,
    body_part TEXT DEFAULT 'CHEST',
    image_url TEXT NOT NULL,
    dicom_meta_json TEXT,
    ai_status TEXT DEFAULT 'PENDING',
    ai_confidence REAL,
    ai_finding TEXT,
    ai_rois_json TEXT,
    review_status TEXT DEFAULT 'UNREVIEWED',
    reviewer_id TEXT,
    review_comment TEXT,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES lz_ai_institutions(id),
    FOREIGN KEY (reviewer_id) REFERENCES lz_ai_users(id)
);

-- 5. 运维监控与 4小时响应 SLA 工单表
CREATE TABLE IF NOT EXISTS lz_ai_sla_tickets (
    id TEXT PRIMARY KEY,
    ticket_no TEXT NOT NULL UNIQUE,
    institution_id TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN',
    assignee_id TEXT,
    response_deadline DATETIME NOT NULL,
    responded_at DATETIME,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institution_id) REFERENCES lz_ai_institutions(id),
    FOREIGN KEY (assignee_id) REFERENCES lz_ai_users(id)
);

-- 6. 数据安全与 PHI 访问审计日志表
CREATE TABLE IF NOT EXISTS lz_ai_audit_logs (
    id TEXT PRIMARY KEY,
    operator_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    target_resource TEXT NOT NULL,
    client_ip TEXT,
    user_agent TEXT,
    signature_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES lz_ai_users(id)
);

INSERT OR REPLACE INTO lz_ai_users (id, username, password_hash, real_name, email, phone_masked, role, organization) VALUES
('u_admin', 'admin', 'pbkdf2$hash_admin', '系统管理员', 'admin@lzcdc.cn', '187****6618', 'ROLE_SUPER_ADMIN', '泸州市疾病预防控制中心'),
('u_expert', 'expert', 'pbkdf2$hash_expert', '张主治（结核质控组）', 'expert@lzcdc.cn', '189****1122', 'ROLE_CDC_EXPERT', '泸州市疾控中心结核病防制科'),
('u_doctor', 'doctor', 'pbkdf2$hash_doctor', '李临床医师', 'doctor@lzcdc.cn', '138****3344', 'ROLE_CLINICAL_DOCTOR', '纳溪区人民医院放射科'),
('u_ops', 'ops', 'pbkdf2$hash_ops', '陈工（驻场支持）', 'ops@lzcdc.cn', '177****8899', 'ROLE_OPS_ENGINEER', '运营服务技术支持中心');

INSERT OR REPLACE INTO lz_ai_system_configs (key, category, value, description, is_public) VALUES
('FEATURE_AI_3D_CT', 'MODEL', 'true', '是否开启多层螺旋CT 3D结节与结核空洞渲染特征', 1),
('FEATURE_AUTO_ALERT', 'ALARM', 'true', 'AI高置信度(>0.85)自动短信与疾控平台双向预警', 1),
('SLA_MAX_RESPONSE_HOURS', 'SLA', '4', '合同约定重大事件现场响应最长时限（小时）', 1),
('DICOM_GATEWAY_NODE', 'NETWORK', 'https://telemed.lzcdc.internal/gateway', '泸州远程医疗平台接入中继节点', 0);

INSERT OR REPLACE INTO lz_ai_institutions (id, code, name, district, tier_level, pacs_endpoint, sync_status) VALUES
('inst_01', 'LZ-CDC-001', '泸州市疾病预防控制中心门诊部', '纳溪区', '疾控专科', 'pacs.lzcdc.org.cn:104', 'ONLINE'),
('inst_02', 'NX-PH-002', '泸州市纳溪区人民医院', '纳溪区', '二甲', '10.51.22.10:4242', 'ONLINE'),
('inst_03', 'JY-TH-003', '泸州市江阳区中医医院', '江阳区', '二甲', '10.51.18.5:4242', 'ONLINE'),
('inst_04', 'SY-PH-004', '叙永县人民医院', '叙永县', '二甲', '10.51.99.12:4242', 'ONLINE');

INSERT OR REPLACE INTO lz_ai_diagnostic_records (id, institution_id, patient_hash_id, gender, age_group, modality, body_part, image_url, ai_status, ai_confidence, ai_finding, ai_rois_json, review_status, reviewer_id) VALUES
('rec_001', 'inst_02', 'HASH_9B8F72A10D', 'M', '50-55', 'DR', 'CHEST', '/assets/demo/chest-dr-01.jpg', 'COMPLETED', 0.94, '右肺上叶见斑片状、纤维索条状高密度影，伴可疑微小空洞形成，高度提示活动性肺结核', '[{"x":260,"y":180,"w":90,"h":75,"label":"活动性病灶","confidence":0.94}]', 'CONFIRMED', 'u_expert'),
('rec_002', 'inst_04', 'HASH_3C1E55E88B', 'F', '30-35', 'CT', 'CHEST', '/assets/demo/chest-ct-02.jpg', 'COMPLETED', 0.12, '双肺纹理清晰，未见实质性浸润或结核空洞', '[]', 'UNREVIEWED', NULL);

INSERT OR REPLACE INTO lz_ai_sla_tickets (id, ticket_no, institution_id, severity, title, content, status, assignee_id, response_deadline) VALUES
('tkt_001', 'LZ-SLA-20260817-001', 'inst_04', 'CRITICAL', '叙永县节点推理超时持续 15 分钟', '边缘推理代理连续超时，需在 4 小时内完成现场或远程应急响应。', 'OPEN', 'u_ops', datetime('now', '+4 hours')),
('tkt_002', 'LZ-SLA-20260817-002', 'inst_02', 'HIGH', '纳溪区 DR 影像上传抖动', 'PACS C-STORE 通道出现间歇性失败，已派驻场工程师处理。', 'IN_PROGRESS', 'u_ops', datetime('now', '+3 hours')),
('tkt_003', 'LZ-SLA-20260817-003', 'inst_03', 'MEDIUM', '江阳区网关证书即将到期', '远程医疗网关 TLS 证书将于 7 日内到期，需完成轮换。', 'OPEN', 'u_ops', datetime('now', '+4 hours'));
