import { CORS_HEADERS, json, TENDER, countdownOf } from '../_shared.js'

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export async function onRequestGet() {
  return json({
    success: true,
    data: {
      ...TENDER,
      countdown: countdownOf(TENDER.bid_deadline),
    },
  })
}
