// 디자인 토큰. Figma v2 와이어프레임(390×844, 뉴트럴 톤)을 기준으로 정리했다.
export const colors = {
  bg: '#FFFFFF',
  surface: '#F6F5F2',
  surfaceStrong: '#EDEBE6',
  border: '#E6E3DD',
  text: '#171717',
  sub: '#5F5F5F',
  muted: '#9C9A95',
  primary: '#171717',
  onPrimary: '#FFFFFF',
  accent: '#5B57E8', // PRO · AI
  accentSoft: '#EEEDFD',
  kakao: '#FEE500',
  danger: '#D93F3F',
  dim: 'rgba(0,0,0,0.45)',
};

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const type = {
  hero: { fontSize: 28, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.6 },
  title: { fontSize: 22, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.4 },
  h2: { fontSize: 18, fontWeight: '700' as const, color: colors.text, letterSpacing: -0.3 },
  h3: { fontSize: 15, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  sub: { fontSize: 13, color: colors.sub, lineHeight: 18 },
  caption: { fontSize: 12, color: colors.muted },
};
