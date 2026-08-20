import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export const SEO_CONFIG = {
  title: '2026泸州疾控AI辅助诊断系统运营服务招标公告',
  keywords:
    '泸州市疾控中心, 人工智能辅助诊断, 医疗AI运营服务, 肺结核AI诊断, N5105012026000255, 四川政府采购, 医疗信息化',
  description:
    '泸州市疾病预防控制中心公开招标2026年人工智能辅助诊断信息系统运营服务项目(二次)，预算35万元，含肺结核AI影像辅助诊断及首年运维，投标截止2026年9月4日。',
  jsonl: JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: '2026泸州疾控AI辅助诊断系统运营服务招标公告',
        description:
          '泸州市疾病预防控制中心公开招标2026年人工智能辅助诊断信息系统运营服务项目(二次)，预算35万元，含肺结核AI影像辅助诊断及首年运维，投标截止2026年9月4日。',
      },
    ],
  }),
}

function upsertMeta(attr: string, key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertJsonLd(jsonStr: string) {
  let el = document.getElementById('seo-jsonld') as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = 'seo-jsonld'
    document.head.appendChild(el)
  }
  el.textContent = jsonStr
}

export function applySeo(config = SEO_CONFIG, pageTitle?: string) {
  const cfg = config || SEO_CONFIG
  const title = pageTitle ? `${pageTitle} · ${cfg.title}` : cfg.title
  document.title = title
  upsertMeta('name', 'keywords', cfg.keywords)
  upsertMeta('name', 'description', cfg.description)
  upsertMeta('property', 'og:type', 'article')
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', cfg.description)
  upsertJsonLd(cfg.jsonl)
}

export function useSeo(pageTitle?: string) {
  const route = useRoute()
  onMounted(() => applySeo(SEO_CONFIG, pageTitle || (route.meta?.title as string)))
  watch(
    () => route.meta?.title,
    (t) => applySeo(SEO_CONFIG, pageTitle || (t as string)),
  )
  return { SEO_CONFIG, applySeo }
}
