// 레슨 공유 버튼: 휴대폰 브라우저에서는 기기 공유 창(카카오톡·문자 등), 그 밖에서는 링크 복사.
// 공유된 링크에는 utm_source=share 를 붙여 관리자 페이지 '유입'에서 공유로 들어온 방문을 볼 수 있게 합니다.
import { useState } from 'react'

const ORIGIN = 'https://crosslesson.com'

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 클립보드 API를 못 쓰는 웹뷰 등
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { /* 무시 */ }
    ta.remove()
    return ok
  }
}

export default function ShareButton({ path, title, text }) {
  const [msg, setMsg] = useState('')
  const url = `${ORIGIN}${path}?utm_source=share&utm_medium=lesson`

  async function onClick() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch (e) {
        if (e?.name === 'AbortError') return // 사용자가 공유 창을 닫음
      }
    }
    const ok = await copyText(url)
    setMsg(ok ? '링크를 복사했어요' : '복사하지 못했어요')
    setTimeout(() => setMsg(''), 2000)
  }

  return (
    <span className="share">
      <button type="button" className="share-button" onClick={onClick} aria-label="이 레슨 공유하기">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        공유
      </button>
      {msg && <span className="share-msg" role="status">{msg}</span>}
    </span>
  )
}
