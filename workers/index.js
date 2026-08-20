/**
 * Cloudflare Worker — allworld
 * 多站点 R2 静态托管 + 26-lz-ai-bid (D1 / R2 26-lz-ai-bid-assets / ASSETS) 主机分流
 */
import { CORS_HEADERS, json } from '../functions/api/_shared.js'
import * as login from '../functions/api/auth/login.js'
import * as me from '../functions/api/auth/me.js'
import * as dashboard from '../functions/api/dashboard/index.js'
import * as diagnostic from '../functions/api/diagnostic/index.js'
import * as sla from '../functions/api/sla/index.js'
import * as gateway from '../functions/api/gateway/index.js'
import * as configs from '../functions/api/system/configs.js'
import * as audit from '../functions/api/audit/index.js'
import * as tender from '../functions/api/tender/index.js'

const PROJECT_SLUG = '26-lz-ai-bid'

function siteIdFromHost(hostname, rootDomain) {
  const host = hostname.toLowerCase()
  const root = rootDomain.toLowerCase()
  if (host === root) return '_root'
  if (host === `www.${root}`) return 'www'
  if (host.endsWith(`.${root}`)) return host.slice(0, -(root.length + 1))
  return host
}

function isProjectHost(hostname, env) {
  const host = hostname.toLowerCase()
  const root = (env.ROOT_DOMAIN || 'softwarelink.net').toLowerCase()
  const slug = (env.PROJECT_SLUG || PROJECT_SLUG).toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) return true
  if (host.endsWith('.workers.dev')) return true
  return host === `${slug}.${root}` || host.startsWith(`${slug}.`)
}

function contentTypeFor(path) {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const map = {
    html: 'text/html; charset=utf-8',
    js: 'application/javascript; charset=utf-8',
    css: 'text/css; charset=utf-8',
    json: 'application/json; charset=utf-8',
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    ico: 'image/x-icon',
    txt: 'text/plain; charset=utf-8',
    map: 'application/json',
    xml: 'application/xml; charset=utf-8',
    woff: 'font/woff',
    woff2: 'font/woff2',
  }
  return map[ext] || 'application/octet-stream'
}

function emptySitePage(siteId) {
  if (siteId === '_root' || siteId === 'www') {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>allworld · softwarelink.net</title>
  <style>
    :root { --ink:#0f172a; --muted:#64748b; --bg:#f8fafc; }
    body { margin:0; font-family:"Segoe UI",system-ui,sans-serif; color:var(--ink);
      background: radial-gradient(1000px 500px at 0% 0%,#e0f2fe,transparent 55%),
                  radial-gradient(800px 400px at 100% 0%,#cffafe,transparent 50%), var(--bg);
      min-height:100vh; }
    main { max-width:42rem; margin:0 auto; padding:4rem 1.25rem; }
    h1 { font-size:clamp(2rem,5vw,3rem); letter-spacing:-0.04em; margin:0 0 .75rem; }
    p,li { color:var(--muted); line-height:1.7; }
    code { background:#e2e8f0; padding:.15em .4em; border-radius:4px; font-size:.92em; }
    a { color:#0891b2; }
  </style>
</head>
<body>
  <main>
    <h1>allworld</h1>
    <p>softwarelink.net 多站点边缘托管入口（Worker <code>allworld</code> + R2 <code>allworld-sites</code>）。</p>
    <ul>
      <li>子域站点：<code>{site}.softwarelink.net</code> → R2 前缀 <code>{site}/</code></li>
      <li>泸州疾控 AI 辅助诊断系统：<a href="https://26-lz-ai-bid.softwarelink.net/">26-lz-ai-bid.softwarelink.net</a></li>
    </ul>
  </main>
</body>
</html>`
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"/><title>${siteId}</title></head>
<body style="font-family:system-ui;padding:2rem"><h1>${siteId}</h1><p>R2 尚无静态文件。</p></body></html>`
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

async function serveR2Site(request, env) {
  const url = new URL(request.url)
  const siteId = siteIdFromHost(url.hostname, env.ROOT_DOMAIN || 'softwarelink.net')

  if (url.pathname.startsWith('/api/')) {
    return json({ success: false, error: 'Not Found' }, 404)
  }

  let pathname = decodeURIComponent(url.pathname)
  if (pathname.endsWith('/')) pathname += 'index.html'
  if (pathname === '') pathname = '/index.html'

  const candidates = [
    `${siteId}${pathname}`,
    `${siteId}${pathname}.html`,
    `${siteId}${pathname}/index.html`,
    `${siteId}/index.html`,
  ]

  for (const key of candidates) {
    const obj = await env.SITES.get(key)
    if (!obj) continue
    const headers = new Headers()
    headers.set('Content-Type', obj.httpMetadata?.contentType || contentTypeFor(key))
    if (obj.httpEtag) headers.set('ETag', obj.httpEtag)
    return new Response(obj.body, { headers })
  }

  if (!pathname.split('/').pop()?.includes('.')) {
    const indexObj = await env.SITES.get(`${siteId}/index.html`)
    if (indexObj) {
      return new Response(indexObj.body, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
  }

  return emptySitePage(siteId)
}

async function serveProjectStorage(request, env) {
  if (!env.STORAGE) return null
  const url = new URL(request.url)
  let pathname = decodeURIComponent(url.pathname)
  if (pathname.endsWith('/') || pathname === '') pathname = '/index.html'
  const key = pathname.replace(/^\//, '')
  const slug = env.PROJECT_SLUG || PROJECT_SLUG
  const keys = [key, `${slug}/${key}`]
  if (!key.includes('.')) keys.push('index.html', `${slug}/index.html`)

  for (const candidate of keys) {
    const obj = await env.STORAGE.get(candidate)
    if (!obj) continue
    const headers = new Headers()
    headers.set('Content-Type', obj.httpMetadata?.contentType || contentTypeFor(candidate))
    if (obj.httpEtag) headers.set('ETag', obj.httpEtag)
    return new Response(obj.body, { headers })
  }
  return null
}

function matchRoute(pathname) {
  const p = pathname.replace(/\/$/, '') || '/'
  if (p === '/api/auth/login') return login
  if (p === '/api/auth/me') return me
  if (p.startsWith('/api/dashboard')) return dashboard
  if (p.startsWith('/api/diagnostic')) return diagnostic
  if (p.startsWith('/api/sla')) return sla
  if (p.startsWith('/api/gateway')) return gateway
  if (p.startsWith('/api/system/configs') || p.startsWith('/api/system')) return configs
  if (p.startsWith('/api/audit')) return audit
  if (p.startsWith('/api/tender')) return tender
  return null
}

async function handleApi(request, env) {
  const url = new URL(request.url)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (url.pathname === '/api/health') {
    return json({
      success: true,
      data: {
        service: PROJECT_SLUG,
        worker: 'allworld',
        r2: '26-lz-ai-bid-assets',
        d1: 'Allworld',
        ts: new Date().toISOString(),
      },
    })
  }

  const mod = matchRoute(url.pathname)
  if (!mod) return json({ success: false, error: 'Not Found' }, 404)

  const ctx = { request, env }
  const method = request.method.toUpperCase()
  if (method === 'GET' && mod.onRequestGet) return mod.onRequestGet(ctx)
  if (method === 'POST' && mod.onRequestPost) return mod.onRequestPost(ctx)
  if (method === 'PUT' && mod.onRequestPut) return mod.onRequestPut(ctx)
  if (method === 'PATCH' && mod.onRequestPatch) return mod.onRequestPatch(ctx)
  if (method === 'DELETE' && mod.onRequestDelete) return mod.onRequestDelete(ctx)
  if (mod.onRequest) return mod.onRequest(ctx)
  return json({ success: false, error: 'Method Not Allowed' }, 405)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (isProjectHost(url.hostname, env)) {
      if (url.pathname.startsWith('/api/')) {
        try {
          return await handleApi(request, env)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Internal error'
          return json({ success: false, error: message }, 500)
        }
      }
      if (env.ASSETS) {
        return env.ASSETS.fetch(request)
      }
      const fromR2 = await serveProjectStorage(request, env)
      if (fromR2) return fromR2
      return new Response('ASSETS binding not configured', { status: 500 })
    }

    try {
      return await serveR2Site(request, env)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error'
      return json({ success: false, error: message }, 500)
    }
  },
}
