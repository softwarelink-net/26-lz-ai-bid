export interface Env {
  Allworld: D1Database
  JWT_SECRET?: string
  SITE_HOST?: string
  PROJECT_SLUG?: string
  REPO_NAME?: string
  DEPLOYMENT_HOST?: string
  HOST_DOMAIN?: string
  ROOT_DOMAIN?: string
  ASSETS?: Fetcher
  STORAGE?: R2Bucket
  SITES: R2Bucket
}
