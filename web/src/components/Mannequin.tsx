import { BodySpec, COLOR_HEX } from '@/data/mock';

type Props = {
  top?: string; // 색상 이름
  bottom?: string;
  shoes?: string;
  outer?: string;
  view?: '정면' | '측면' | '후면';
  height?: number;
  /** 신체 정보 — 키는 세로 비율, 체형·마네킹 체형은 가로 비율에 반영 */
  body?: BodySpec;
};

const BUILD_W: Record<string, number> = { 슬림: 0.92, 보통: 1, 탄탄: 1.06, 넉넉: 1.14 };
const TYPE_W: Record<string, number> = { 여성형: 0.94, 남성형: 1.04 };

const ANGLES = { 정면: 'front', 측면: 'side', 후면: 'back' };

export function Mannequin({ top, bottom, shoes, outer, view = '정면', height = 300, body }: Props) {
  const angle = ANGLES[view];
  const widthScale = (BUILD_W[body?.build ?? ''] ?? 1) * (TYPE_W[body?.bodyType ?? ''] ?? 1);
  const heightScale = body?.height ? Math.max(0.82, Math.min(1, body.height / 185)) : 0.94;
  const colors = { top: outer ?? top, bottom, shoes };

  return (
    <div role="img" aria-label={`${view} 착장 미리보기`} style={{ width: height / 2, height }}>
      <div key={angle} className="avatar-turn h-full">
        <div className="relative isolate h-full origin-bottom bg-contain bg-center bg-no-repeat" style={{
          backgroundImage: `url(/looks/${angle}.webp)`,
          transform: `scale(${widthScale}, ${heightScale})`,
        }}>
          {Object.entries(colors).map(([part, color]) => color && (
            <span key={part} className="absolute inset-0 mix-blend-multiply" style={{
              backgroundColor: COLOR_HEX[color],
              mask: `url(/looks/${angle}-${part}.webp) center / contain no-repeat`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
