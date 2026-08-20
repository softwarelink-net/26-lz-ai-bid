-- 泸州市疾病预防控制中心 2026 年人工智能辅助诊断信息系统 · Cloudflare D1 Schema
-- Project: 26-lz-ai-bid / N5105012026000255
-- Binding database_name: Allworld / tables prefixed lz_ai_*

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

-- 7. 网关传输与脱敏流水（演示）
CREATE TABLE IF NOT EXISTS lz_ai_gateway_events (
    id TEXT PRIMARY KEY,
    protocol TEXT NOT NULL,
    direction TEXT NOT NULL,
    institution_id TEXT,
    payload_summary TEXT,
    phi_fields_masked INTEGER DEFAULT 0,
    bytes INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    status TEXT DEFAULT 'OK',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 预置种子数据 (Seed Data)
INSERT OR REPLACE INTO lz_ai_users (id, username, password_hash, real_name, email, phone_masked, role, organization) VALUES
('u_admin', 'admin', 'pbkdf2$hash_admin', '系统管理员', 'admin@lzcdc.cn', '187****6618', 'ROLE_SUPER_ADMIN', '泸州市疾病预防控制中心'),
('u_expert', 'expert', 'pbkdf2$hash_expert', '张主治（结核质控组）', 'expert@lzcdc.cn', '189****1122', 'ROLE_CDC_EXPERT', '泸州市疾控中心结核病防制科'),
('u_doctor', 'doctor', 'pbkdf2$hash_doctor', '李临床医师', 'doctor@lzcdc.cn', '138****3344', 'ROLE_CLINICAL_DOCTOR', '纳溪区人民医院放射科'),
('u_ops', 'ops', 'pbkdf2$hash_ops', '陈工（驻场支持）', 'ops@lzcdc.cn', '177****8899', 'ROLE_OPS_ENGINEER', '运营服务技术支持中心');

INSERT OR REPLACE INTO lz_ai_system_configs (key, category, value, description, is_public) VALUES
('FEATURE_AI_3D_CT', 'MODEL', 'true', '是否开启多层螺旋CT 3D结节与结核空洞渲染特征', 1),
('FEATURE_AUTO_ALERT', 'ALARM', 'true', 'AI高置信度(>0.85)自动短信与疾控平台双向预警', 1),
('FEATURE_AUTO_REPORT', 'WORKFLOW', 'false', '全自动报告下发（需专家终审开关）', 1),
('SLA_MAX_RESPONSE_HOURS', 'SLA', '4', '合同约定重大事件现场响应最长时限（小时）', 1),
('DICOM_GATEWAY_NODE', 'NETWORK', 'https://telemed.lzcdc.internal/gateway', '泸州远程医疗平台接入中继节点', 0);

INSERT OR REPLACE INTO lz_ai_institutions (id, code, name, district, tier_level, pacs_endpoint, sync_status, last_heartbeat_at) VALUES
('inst_01', 'LZ-CDC-001', '泸州市疾病预防控制中心门诊部', '纳溪区', '疾控专科', 'pacs.lzcdc.org.cn:104', 'ONLINE', '2026-08-17 15:58:00'),
('inst_02', 'NX-PH-002', '泸州市纳溪区人民医院', '纳溪区', '二甲', '10.51.22.10:4242', 'ONLINE', '2026-08-17 15:59:12'),
('inst_03', 'JY-TH-003', '泸州市江阳区中医医院', '江阳区', '二甲', '10.51.18.5:4242', 'ONLINE', '2026-08-17 15:57:41'),
('inst_04', 'SY-PH-004', '叙永县人民医院', '叙永县', '二甲', '10.51.99.12:4242', 'ONLINE', '2026-08-17 15:56:08'),
('inst_05', 'LM-PH-005', '泸州市龙马潭区人民医院', '龙马潭区', '二甲', '10.51.31.8:4242', 'ONLINE', '2026-08-17 15:54:22'),
('inst_06', 'HJ-PH-006', '合江县人民医院', '合江县', '二甲', '10.51.44.16:4242', 'DEGRADED', '2026-08-17 15:12:03'),
('inst_07', 'GL-PH-007', '古蔺县人民医院', '古蔺县', '二甲', '10.51.71.21:4242', 'ONLINE', '2026-08-17 15:50:19'),
('inst_08', 'LX-PH-008', '泸县人民医院', '泸县', '二甲', '10.51.62.9:4242', 'OFFLINE', '2026-08-17 12:08:44');

INSERT OR REPLACE INTO lz_ai_diagnostic_records (id, institution_id, patient_hash_id, gender, age_group, modality, body_part, image_url, dicom_meta_json, ai_status, ai_confidence, ai_finding, ai_rois_json, review_status, reviewer_id, review_comment, reviewed_at, created_at) VALUES
('rec_001', 'inst_02', 'HASH_9B8F72A10D', 'M', '50-55', 'DR', 'CHEST', '/assets/demo/chest-dr-01.jpg', '{"Manufacturer":"Mindray","KVP":"120","StudyUID":"1.2.840.DEMO.001","PatientID":"HASH_9B8F72A10D"}', 'COMPLETED', 0.94, '右肺上叶见斑片状、纤维索条状高密度影，伴可疑微小空洞形成，高度提示活动性肺结核', '[{"x":260,"y":180,"w":90,"h":75,"label":"活动性病灶","type":"infiltrate","confidence":0.94},{"x":288,"y":198,"w":28,"h":24,"label":"微小空洞","type":"cavity","confidence":0.81}]', 'CONFIRMED', 'u_expert', '同意 AI 提示，建议痰涂片+GeneXpert 复核。', '2026-08-16 11:20:00', '2026-08-16 09:18:00'),
('rec_002', 'inst_04', 'HASH_3C1E55E88B', 'F', '30-35', 'CT', 'CHEST', '/assets/demo/chest-ct-02.jpg', '{"Manufacturer":"UIH","KVP":"120","SliceThickness":"1.25","StudyUID":"1.2.840.DEMO.002"}', 'COMPLETED', 0.12, '双肺纹理清晰，未见实质性浸润或结核空洞', '[]', 'UNREVIEWED', NULL, NULL, NULL, '2026-08-17 08:42:00'),
('rec_003', 'inst_03', 'HASH_A71D04C992', 'M', '60-65', 'DR', 'CHEST', '/assets/demo/chest-dr-01.jpg', '{"Manufacturer":"Siemens","KVP":"125","StudyUID":"1.2.840.DEMO.003"}', 'COMPLETED', 0.88, '左肺尖纤维条索伴钙化灶，倾向陈旧性肺结核，活动性待排', '[{"x":140,"y":150,"w":70,"h":55,"label":"纤维条索","type":"fibrosis","confidence":0.88},{"x":162,"y":168,"w":18,"h":16,"label":"钙化","type":"calcification","confidence":0.76}]', 'UNREVIEWED', NULL, NULL, NULL, '2026-08-17 10:05:00'),
('rec_004', 'inst_05', 'HASH_E20B77F441', 'F', '45-50', 'CT', 'CHEST', '/assets/demo/chest-ct-02.jpg', '{"Manufacturer":"GE","KVP":"120","StudyUID":"1.2.840.DEMO.004"}', 'PROCESSING', NULL, NULL, '[]', 'UNREVIEWED', NULL, NULL, NULL, '2026-08-17 15:48:00'),
('rec_005', 'inst_06', 'HASH_CC19A0B773', 'M', '55-60', 'DR', 'CHEST', '/assets/demo/chest-dr-01.jpg', '{"Manufacturer":"Philips","KVP":"110","StudyUID":"1.2.840.DEMO.005"}', 'COMPLETED', 0.71, '右中肺野斑片浸润，肺结核待鉴别，建议 CT 进一步评估', '[{"x":300,"y":230,"w":80,"h":64,"label":"浸润","type":"infiltrate","confidence":0.71}]', 'REVISED', 'u_doctor', '基层初筛：不除外炎症，已申请薄层 CT。', '2026-08-17 14:22:00', '2026-08-17 13:10:00'),
('rec_006', 'inst_07', 'HASH_55DE8A12F0', 'M', '40-45', 'DR', 'CHEST', '/assets/demo/chest-dr-01.jpg', '{"Manufacturer":"Mindray","KVP":"120","StudyUID":"1.2.840.DEMO.006"}', 'FAILED', NULL, '边缘推理超时，已自动重入队列', '[]', 'UNREVIEWED', NULL, NULL, NULL, '2026-08-17 15:33:00'),
('rec_007', 'inst_01', 'HASH_91AA22B6CE', 'F', '25-30', 'DR', 'CHEST', '/assets/demo/chest-dr-01.jpg', '{"Manufacturer":"Wandong","KVP":"102","StudyUID":"1.2.840.DEMO.007"}', 'COMPLETED', 0.08, '胸廓对称，肺野清晰，心膈正常', '[]', 'CONFIRMED', 'u_expert', '阴性，归档。', '2026-08-15 16:40:00', '2026-08-15 16:12:00'),
('rec_008', 'inst_08', 'HASH_07F3C9D81A', 'M', '70-75', 'CT', 'CHEST', '/assets/demo/chest-ct-02.jpg', '{"Manufacturer":"UIH","KVP":"120","StudyUID":"1.2.840.DEMO.008"}', 'PENDING', NULL, NULL, '[]', 'UNREVIEWED', NULL, NULL, NULL, '2026-08-17 12:01:00');

INSERT OR REPLACE INTO lz_ai_sla_tickets (id, ticket_no, institution_id, severity, title, content, status, assignee_id, response_deadline, responded_at, resolved_at, created_at) VALUES
('tkt_001', 'SLA-20260817-001', 'inst_08', 'CRITICAL', '泸县人民医院 PACS 心跳中断', 'DICOM C-ECHO 连续失败 12 次，疑专网链路或网关证书过期。合同 4 小时现场响应。', 'IN_PROGRESS', 'u_ops', '2026-08-17 16:08:44', '2026-08-17 12:26:00', NULL, '2026-08-17 12:08:44'),
('tkt_002', 'SLA-20260817-002', 'inst_06', 'HIGH', '合江县人民医院推理延迟升高', 'P95 由 82ms 升至 410ms，边缘节点 CPU 88%。', 'OPEN', NULL, '2026-08-17 19:12:03', NULL, NULL, '2026-08-17 15:12:03'),
('tkt_003', 'SLA-20260816-018', 'inst_04', 'MEDIUM', '叙永县 DR 设备元数据缺失', '部分 Study 缺少 KVP 标签，脱敏管道告警。', 'RESOLVED', 'u_ops', '2026-08-16 14:40:00', '2026-08-16 11:05:00', '2026-08-16 13:18:00', '2026-08-16 10:40:00'),
('tkt_004', 'SLA-20260815-009', 'inst_02', 'LOW', '纳溪区人民医院模型版本确认', 'TB-Net v2.4.1 灰度发布完成后需现场确认。', 'CLOSED', 'u_ops', '2026-08-15 16:00:00', '2026-08-15 12:20:00', '2026-08-15 15:10:00', '2026-08-15 12:00:00');

INSERT OR REPLACE INTO lz_ai_audit_logs (id, operator_id, action_type, target_resource, client_ip, user_agent, signature_hash, created_at) VALUES
('aud_001', 'u_expert', 'VIEW_IMAGE', 'rec_001', '10.51.1.18', 'Mozilla/5.0 CDC-Workstation', 'SIG_7C91A0E4', '2026-08-16 11:18:22'),
('aud_002', 'u_expert', 'EXPORT_REPORT', 'rec_001', '10.51.1.18', 'Mozilla/5.0 CDC-Workstation', 'SIG_A12F88B1', '2026-08-16 11:21:04'),
('aud_003', 'u_doctor', 'TRIGGER_AI', 'rec_005', '10.51.22.44', 'Chrome/126 Luzhou-HIS', 'SIG_33D0C91E', '2026-08-17 13:11:18'),
('aud_004', 'u_ops', 'UPDATE_CONFIG', 'FEATURE_AUTO_ALERT', '10.51.8.2', 'Wrangler-Console', 'SIG_90EE12AB', '2026-08-17 09:02:41'),
('aud_005', 'u_admin', 'VIEW_IMAGE', 'lz_ai_audit_logs', '10.51.1.2', 'Mozilla/5.0 Admin', 'SIG_BB17F003', '2026-08-17 08:12:09');

INSERT OR REPLACE INTO lz_ai_gateway_events (id, protocol, direction, institution_id, payload_summary, phi_fields_masked, bytes, latency_ms, status, created_at) VALUES
('gw_001', 'DICOM', 'IN', 'inst_02', 'C-STORE CR/DR CHEST · UID 伪化完成', 4, 18432000, 86, 'OK', '2026-08-17 15:59:01'),
('gw_002', 'HL7', 'IN', 'inst_03', 'ORU^R01 影像报告回传 · PID 掩码', 3, 4096, 22, 'OK', '2026-08-17 15:58:44'),
('gw_003', 'FHIR', 'OUT', 'inst_01', 'ImagingStudy 同步至市疾控平台', 2, 12288, 41, 'OK', '2026-08-17 15:57:12'),
('gw_004', 'DICOM', 'IN', 'inst_08', 'C-ECHO 超时', 0, 0, 4000, 'FAIL', '2026-08-17 12:08:40');
