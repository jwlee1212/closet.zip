// 프로토타입용 목업 데이터. 백엔드 연동 전까지 이 파일이 서버 응답을 대신한다.

export const STYLES = ['미니멀', '스트릿', '클래식', '러블리', '고프코어', '빈티지', '스포티', '모던 캐주얼'] as const;
export const CATEGORIES = ['아우터', '상의', '하의', '신발', '액세서리'] as const;
export const SEASONS = ['봄', '여름', '가을', '겨울', '사계절'] as const;

export type Style = (typeof STYLES)[number];
export type Category = (typeof CATEGORIES)[number];
export type ClosetType = '일반' | '인플루언서' | '브랜드' | '광고';
export type Visibility = '비공개' | '링크 공개' | '전체 공개';

export const COLOR_HEX: Record<string, string> = {
  네이비: '#2C3B57',
  화이트: '#F5F3EE',
  베이지: '#D8C6A6',
  블랙: '#242424',
  데님: '#5D7DA5',
  그레이: '#A0A0A0',
  차콜: '#45484E',
  카키: '#7A7650',
  브라운: '#7B5A40',
  아이보리: '#EFE8D8',
  크림: '#F1E4CB',
  버건디: '#6E2433',
  스카이블루: '#A6C8E8',
  핑크: '#EBC1C8',
  올리브: '#6B6B3A',
  오렌지: '#D9773A',
};
export const COLORS = Object.keys(COLOR_HEX);

export const KINDS: Record<Category, string[]> = {
  아우터: ['트렌치코트', '블레이저', '데님 재킷', '패딩', '가디건', '바람막이'],
  상의: ['맨투맨', '셔츠', '니트', '반팔 티셔츠', '후드티', '블라우스'],
  하의: ['와이드 슬랙스', '치노 팬츠', '데님 팬츠', '카고 팬츠', '롱스커트', '조거 팬츠'],
  신발: ['스니커즈', '로퍼', '부츠', '러닝화', '메리제인'],
  액세서리: ['토트백', '볼캡', '머플러', '크로스백'],
};
export const MATERIALS = ['코튼', '울', '린넨', '데님', '나일론', '레더', '폴리'];

export type ClothingItem = {
  id: string;
  closetId: string;
  category: Category;
  kind: string;
  color: string;
  material: string;
  season: string;
  fit?: string;
  brand?: string;
  photoUri?: string;
  coordiCount: number; // 이 옷이 들어간 코디 수
};

export type Closet = {
  id: string;
  name: string;
  owner: string; // 표시 이름
  handle: string;
  type: ClosetType;
  theme: Style;
  capacity: number;
  likes: number;
  followers: number;
  views: number;
  linkClicks: number;
  visibility: Visibility;
  summary: string;
  tags: string[];
  updatedRank: number; // 작을수록 최근
  items: ClothingItem[];
};

export const itemName = (i: Pick<ClothingItem, 'color' | 'kind'>) => (i.kind.startsWith(i.color) ? i.kind : `${i.color} ${i.kind}`);

type Spec = [Category, string, string, string?, string?, string?];

export const garmentPhotos: Record<string, string> = {
  '네이비 맨투맨': 'sweater', '화이트 셔츠': 'shirt', '베이지 치노 팬츠': 'chinos',
  '블랙 패딩': 'puffer', '화이트 스니커즈': 'sneakers', '데님 데님 재킷': 'jacket',
  '블랙 와이드 슬랙스': 'slacks', '데님 데님 팬츠': 'jeans',
};

function build(closetId: string, specs: Spec[], count: number, brand?: string): ClothingItem[] {
  const out: ClothingItem[] = [];
  for (let n = 0; n < count; n++) {
    const [category, kind, color, material, season, fit] = specs[n % specs.length];
    const round = Math.floor(n / specs.length);
    // 같은 스펙이 반복되면 색을 돌려서 옷장이 단조롭지 않게
    const c = round === 0 ? color : COLORS[(COLORS.indexOf(color) + round * 3) % COLORS.length];
    out.push({
      id: `${closetId}-${n + 1}`,
      closetId,
      category,
      kind,
      color: c,
      material: material ?? '코튼',
      season: season ?? '사계절',
      fit,
      brand,
      coordiCount: 3 + ((n * 7 + closetId.length) % 7),
    });
  }
  return out;
}

const MINIMAL: Spec[] = [
  ['상의', '맨투맨', '네이비', '코튼', '가을', '오버핏'],
  ['상의', '셔츠', '화이트', '코튼', '사계절', '레귤러'],
  ['하의', '치노 팬츠', '베이지', '코튼', '사계절', '와이드'],
  ['아우터', '트렌치코트', '블랙', '폴리', '가을', '오버핏'],
  ['신발', '스니커즈', '화이트', '레더', '사계절'],
  ['아우터', '데님 재킷', '데님', '데님', '봄'],
  ['상의', '니트', '아이보리', '울', '겨울', '오버핏'],
  ['하의', '와이드 슬랙스', '차콜', '울', '사계절', '와이드'],
  ['신발', '로퍼', '블랙', '레더', '사계절'],
  ['액세서리', '토트백', '베이지', '레더', '사계절'],
  ['상의', '반팔 티셔츠', '그레이', '코튼', '여름'],
];

export const PUBLIC_CLOSETS: Closet[] = [
  {
    id: 'minji', name: '@minji의 옷장', owner: '@minji', handle: 'minji', type: '인플루언서', theme: '미니멀',
    capacity: 30, likes: 128, followers: 1200, views: 5100, linkClicks: 210, visibility: '전체 공개',
    summary: '뉴트럴 톤 상의와 와이드 하의를 기본으로, 오버핏 실루엣을 자주 써요. 출근·데일리 모두 무리 없는 구성이에요.',
    tags: ['뉴트럴 톤', '오버핏', '데일리'], updatedRank: 2,
    items: build('minji', MINIMAL, 24),
  },
  {
    id: 'seoyun', name: '한서윤 (모델) 옷장', owner: '한서윤', handle: 'seoyun.model', type: '브랜드', theme: '클래식',
    capacity: 30, likes: 2400, followers: 18000, views: 42000, linkClicks: 3100, visibility: '전체 공개',
    summary: '테일러드 블레이저와 슬랙스 중심의 클래식 셋업이 많아요. 블랙·네이비·크림 3색 안에서 조합해요.',
    tags: ['테일러드', '셋업', '모노톤'], updatedRank: 4,
    items: build('seoyun', [
      ['아우터', '블레이저', '네이비', '울', '가을'],
      ['상의', '셔츠', '크림', '코튼', '사계절'],
      ['하의', '와이드 슬랙스', '블랙', '울', '사계절', '와이드'],
      ['신발', '로퍼', '브라운', '레더', '사계절'],
      ['아우터', '트렌치코트', '베이지', '코튼', '봄'],
      ['상의', '니트', '버건디', '울', '겨울'],
      ['액세서리', '토트백', '블랙', '레더', '사계절'],
      ['하의', '롱스커트', '차콜', '울', '가을'],
    ], 30, '서윤 스튜디오'),
  },
  {
    id: 'hana', name: '@hana의 옷장', owner: '@hana', handle: 'hana', type: '일반', theme: '미니멀',
    capacity: 30, likes: 96, followers: 340, views: 1800, linkClicks: 12, visibility: '전체 공개',
    summary: '화이트·그레이 베이스에 데님으로 포인트를 줘요. 셔츠 레이어드가 많고 신발은 스니커즈 위주예요.',
    tags: ['화이트 베이스', '레이어드', '데님'], updatedRank: 1,
    items: build('hana', [
      ['상의', '셔츠', '스카이블루', '코튼', '봄', '레귤러'],
      ['하의', '데님 팬츠', '데님', '데님', '사계절', '스트레이트'],
      ['상의', '반팔 티셔츠', '화이트', '코튼', '여름'],
      ['신발', '스니커즈', '그레이', '나일론', '사계절'],
      ['아우터', '가디건', '그레이', '울', '가을'],
      ['하의', '와이드 슬랙스', '아이보리', '린넨', '여름', '와이드'],
    ], 19),
  },
  {
    id: 'moodlab', name: '무드랩 스튜디오', owner: '무드랩', handle: 'moodlab', type: '브랜드', theme: '스트릿',
    capacity: 30, likes: 1300, followers: 9400, views: 21000, linkClicks: 1900, visibility: '전체 공개',
    summary: '빅사이즈 후드와 카고 팬츠, 볼캡 조합이 대표 착장이에요. 블랙·카키·오렌지 포인트 컬러를 써요.',
    tags: ['빅사이즈', '카고', '포인트 컬러'], updatedRank: 3,
    items: build('moodlab', [
      ['상의', '후드티', '블랙', '코튼', '가을', '빅사이즈'],
      ['하의', '카고 팬츠', '카키', '나일론', '사계절', '와이드'],
      ['액세서리', '볼캡', '오렌지', '코튼', '사계절'],
      ['신발', '스니커즈', '블랙', '레더', '사계절'],
      ['아우터', '바람막이', '올리브', '나일론', '봄'],
      ['상의', '반팔 티셔츠', '오렌지', '코튼', '여름', '빅사이즈'],
    ], 28, '무드랩'),
  },
  {
    id: 'yujin', name: '@yujin의 옷장', owner: '@yujin', handle: 'yujin', type: '일반', theme: '빈티지',
    capacity: 30, likes: 210, followers: 520, views: 2600, linkClicks: 40, visibility: '전체 공개',
    summary: '브라운·버건디 계열 니트와 워싱 데님이 중심이에요. 레더 부츠로 마무리하는 착장이 많아요.',
    tags: ['어스 톤', '워싱 데님', '레더'], updatedRank: 5,
    items: build('yujin', [
      ['상의', '니트', '브라운', '울', '겨울'],
      ['하의', '데님 팬츠', '데님', '데님', '사계절'],
      ['신발', '부츠', '브라운', '레더', '겨울'],
      ['아우터', '데님 재킷', '데님', '데님', '봄'],
      ['상의', '셔츠', '버건디', '코튼', '가을'],
    ], 15),
  },
  {
    id: 'trail', name: '@trail_kim의 옷장', owner: '@trail_kim', handle: 'trail_kim', type: '인플루언서', theme: '고프코어',
    capacity: 30, likes: 640, followers: 4100, views: 9800, linkClicks: 380, visibility: '전체 공개',
    summary: '기능성 바람막이와 카고 팬츠, 러닝화가 기본이에요. 올리브·블랙 톤으로 아웃도어 무드를 내요.',
    tags: ['기능성', '아웃도어', '레이어드'], updatedRank: 6,
    items: build('trail', [
      ['아우터', '바람막이', '올리브', '나일론', '봄'],
      ['하의', '카고 팬츠', '블랙', '나일론', '사계절'],
      ['신발', '러닝화', '그레이', '나일론', '사계절'],
      ['상의', '반팔 티셔츠', '카키', '폴리', '여름'],
      ['아우터', '패딩', '블랙', '나일론', '겨울'],
    ], 21),
  },
  {
    id: 'soy', name: '@soy의 옷장', owner: '@soy', handle: 'soy', type: '일반', theme: '러블리',
    capacity: 30, likes: 180, followers: 410, views: 2100, linkClicks: 20, visibility: '전체 공개',
    summary: '핑크·크림 파스텔 톤 블라우스와 롱스커트가 많아요. 메리제인 슈즈로 포인트를 줘요.',
    tags: ['파스텔', '롱스커트', '블라우스'], updatedRank: 7,
    items: build('soy', [
      ['상의', '블라우스', '핑크', '폴리', '봄'],
      ['하의', '롱스커트', '크림', '폴리', '봄'],
      ['신발', '메리제인', '블랙', '레더', '사계절'],
      ['아우터', '가디건', '크림', '울', '가을'],
    ], 17),
  },
  {
    id: 'dowon', name: '@dowon의 옷장', owner: '@dowon', handle: 'dowon', type: '일반', theme: '모던 캐주얼',
    capacity: 30, likes: 150, followers: 290, views: 1500, linkClicks: 15, visibility: '전체 공개',
    summary: '셔츠·니트에 치노 팬츠를 매치하는 단정한 캐주얼이에요. 네이비와 베이지를 가장 많이 써요.',
    tags: ['단정함', '치노', '네이비'], updatedRank: 8,
    items: build('dowon', [
      ['상의', '셔츠', '네이비', '코튼', '사계절'],
      ['하의', '치노 팬츠', '베이지', '코튼', '사계절'],
      ['신발', '로퍼', '브라운', '레더', '사계절'],
      ['상의', '니트', '그레이', '울', '겨울'],
      ['아우터', '블레이저', '차콜', '울', '가을'],
    ], 22),
  },
];

export function createMyFirstCloset(): Closet {
  return {
    id: 'my-1', name: '미니멀 옷장', owner: '이재우', handle: 'jaewoo', type: '일반', theme: '미니멀',
    capacity: 30, likes: 0, followers: 0, views: 0, linkClicks: 0, visibility: '비공개',
    summary: '', tags: [], updatedRank: 0,
    items: build('my-1', MINIMAL, 22),
  };
}

// 와이어프레임에는 [가격]으로 비어 있다. 팀 확정 전 임시값.
export const PRICES = {
  subscription: 4900,
  closetPlusOne: 1900,
  capacityPlus30: 2900,
  businessPackage: 19900,
};
export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export const compact = (n: number) =>
  n >= 10000 ? `${(n / 10000).toFixed(1).replace(/\.0$/, '')}만` : n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${n}`;

/** 추구미·관심 카테고리와 옷장의 일치도(%). 실제 서비스에서는 AI 추천 엔진이 계산한다. */
export function matchScore(closet: Closet, styles: Style[], cats: Category[]): number {
  let score = 55;
  if (styles.includes(closet.theme)) score += 30;
  else if (styles.some((s) => (s === '미니멀' && closet.theme === '모던 캐주얼') || (s === '모던 캐주얼' && closet.theme === '미니멀') || (s === '클래식' && closet.theme === '미니멀'))) score += 15;
  const catHits = closet.items.filter((i) => cats.includes(i.category)).length;
  score += Math.min(10, Math.round((catHits / Math.max(1, closet.items.length)) * 14));
  score += (closet.handle.length % 5) - 2;
  return Math.max(40, Math.min(98, score));
}

/** 공개 옷장 집계로 만든 '이번 주 AI 요약' 문구 */
export function weeklySummary(style: Style, cat: Category | '전체') {
  const lines: Record<string, string> = {
    미니멀: '뉴트럴 톤 아우터와 와이드 슬랙스가 가장 많이 올라왔어요. 오버핏 니트 저장 수가 늘고 있어요.',
    스트릿: '빅사이즈 후드와 카고 팬츠 조합이 가장 많아요. 볼캡·오렌지 포인트 컬러 저장이 늘고 있어요.',
    클래식: '네이비 블레이저와 블랙 슬랙스 셋업이 가장 많아요. 크림 셔츠 이너 조합이 인기예요.',
    러블리: '파스텔 블라우스와 롱스커트 조합이 꾸준해요. 메리제인 슈즈 저장이 늘고 있어요.',
    고프코어: '올리브 바람막이와 블랙 카고 팬츠가 가장 많아요. 러닝화 레이어드가 늘고 있어요.',
    빈티지: '브라운 니트와 워싱 데님 조합이 많아요. 레더 부츠 저장이 늘고 있어요.',
    스포티: '트랙 재킷과 조거 팬츠 조합이 많아요. 화이트 러닝화 저장이 늘고 있어요.',
    '모던 캐주얼': '네이비 셔츠와 베이지 치노 조합이 가장 많아요. 로퍼 매치가 늘고 있어요.',
  };
  const tags: Record<string, string[]> = {
    미니멀: ['#뉴트럴톤', '#오버핏', '#와이드'], 스트릿: ['#빅사이즈', '#카고', '#볼캡'],
    클래식: ['#셋업', '#테일러드', '#모노톤'], 러블리: ['#파스텔', '#롱스커트', '#메리제인'],
    고프코어: ['#기능성', '#레이어드', '#러닝화'], 빈티지: ['#어스톤', '#워싱', '#레더'],
    스포티: ['#트랙', '#조거', '#러닝화'], '모던 캐주얼': ['#단정함', '#치노', '#로퍼'],
  };
  const count = PUBLIC_CLOSETS.filter((c) => c.theme === style).length * 61 + 6;
  const catLine = cat === '전체' ? '' : ` ${cat} 중에서는 ${KINDS[cat][0]}가 가장 많이 저장됐어요.`;
  return { title: `${style} 옷장 ${count}개 요약`, body: lines[style] + catLine, tags: tags[style] };
}

/* ───────── 신체 정보 (온보딩 · 마이페이지에서 입력, 나에게만 보임) ───────── */

export const BODY_TYPES = ['여성형', '남성형', '선택 안 함'] as const;
export const BUILDS = ['슬림', '보통', '탄탄', '넉넉'] as const;
export const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export const BOTTOM_SIZES = ['24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '36'] as const;
export const FITS = ['슬림핏', '레귤러핏', '오버핏'] as const;

export type BodySpec = {
  bodyType?: (typeof BODY_TYPES)[number]; // 마네킹 체형
  height?: number; // cm
  weight?: number; // kg
  build?: (typeof BUILDS)[number];
  topSize?: (typeof TOP_SIZES)[number];
  bottomSize?: (typeof BOTTOM_SIZES)[number]; // 허리 인치
  shoeSize?: number; // mm
  fit?: (typeof FITS)[number];
};

/** 마이페이지 등에 보여줄 한 줄 요약 */
export function bodySummary(b?: BodySpec) {
  if (!b) return '';
  return [
    b.height && `${b.height}cm`,
    b.build,
    b.topSize && `상의 ${b.topSize}`,
    b.bottomSize && `하의 ${b.bottomSize}`,
    b.shoeSize && `${b.shoeSize}mm`,
  ].filter(Boolean).join(' · ');
}

/** 옷 카테고리별 추천 사이즈. 오버핏 선호면 상의·아우터를 한 치수 크게 */
export function recommendSize(category: Category, b?: BodySpec): string | undefined {
  if (!b) return undefined;
  if (category === '상의' || category === '아우터') {
    if (!b.topSize) return undefined;
    const i = TOP_SIZES.indexOf(b.topSize);
    const up = b.fit === '오버핏' && i < TOP_SIZES.length - 1;
    return up ? `${TOP_SIZES[i + 1]} (오버핏 기준 한 치수 업)` : b.topSize;
  }
  if (category === '하의') return b.bottomSize ? `${b.bottomSize}인치` : undefined;
  if (category === '신발') return b.shoeSize ? `${b.shoeSize}mm` : undefined;
  return undefined;
}
