// 접속 기록에서 제외 대상 방문 지우기 (src/services/analytics.js 의 isExcluded 와 같은 기준)
//   중국·홍콩·마카오·싱가포르 시간대, 중국어 브라우저, 예전 .php 주소로 시작한 세션
//   node purge-excluded-visits.mjs [--dry-run]
import { db, DRY_RUN } from './admin.mjs'

const TZ = /^Asia\/(Shanghai|Chongqing|Chungking|Harbin|Urumqi|Kashgar|Hong_Kong|Macau|Macao|Singapore)$|^(PRC|Hongkong|Singapore)$/
const snap = await db.collection('visits').get()
const visits = snap.docs.map((d) => ({ ...d.data(), _doc: d.ref }))
// .php 로 시작한 세션은 그 세션 전체를 지웁니다.
const phpSessions = new Set(visits.filter((v) => v.entry && /\.php$/i.test(v.path)).map((v) => v.sid))
const targets = visits.filter((v) => TZ.test(v.tz || '') || /^zh\b/i.test(v.lang || '') || /\.php$/i.test(v.path || '') || phpSessions.has(v.sid))
const by = (k) => Object.entries(targets.reduce((m, v) => ((m[v[k] || '-'] = (m[v[k] || '-'] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 8)
console.log(`전체 ${visits.length}건 중 지울 대상 ${targets.length}건`)
console.log('국가:', by('country'), '\n언어:', by('lang'))
if (!DRY_RUN) {
  for (let i = 0; i < targets.length; i += 400) {
    const batch = db.batch()
    targets.slice(i, i + 400).forEach((v) => batch.delete(v._doc))
    await batch.commit()
  }
  console.log('삭제 완료')
}
