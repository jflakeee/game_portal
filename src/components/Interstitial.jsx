// 정책 게이트를 통과한 break-point에서만 표시되는 플레이스홀더 인터스티셜.
// 강제 영상/자동재생 없음 — 사용자가 "계속하기"로 즉시 닫을 수 있는 예측 가능한 광고 면.
export default function Interstitial({ onContinue }) {
  return (
    <div className="interstitial" role="dialog" aria-label="광고" aria-modal="true">
      <div className="interstitial__box">
        <span className="interstitial__label">광고</span>
        <p className="interstitial__note">게임 사이에 표시되는 광고입니다.</p>
        <button className="btn btn--primary" onClick={onContinue}>계속하기</button>
      </div>
    </div>
  )
}
