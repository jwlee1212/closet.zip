import React from 'react';
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';
import { COLOR_HEX } from '@/data/mock';

type Props = {
  top?: string; // 색상 이름
  bottom?: string;
  shoes?: string;
  outer?: string;
  view?: '정면' | '측면' | '후면';
  height?: number;
};

const skin = '#E7E2DA';
const line = '#BDB6AA';

/** 추천 착장을 입힌 마네킹(아바타). 색상만 반영하는 MVP 버전 */
export function Mannequin({ top, bottom, shoes, outer, view = '정면', height = 300 }: Props) {
  const hex = (c?: string, fb = '#DDD') => (c ? COLOR_HEX[c] ?? fb : fb);
  const sx = view === '측면' ? 0.62 : 1;
  const back = view === '후면';
  return (
    <Svg width={(height * 140) / 300} height={height} viewBox="0 0 140 300">
      <Ellipse cx={70} cy={292} rx={34} ry={5} fill="#000" opacity={0.08} />
      <G transform={`translate(${70 - 70 * sx} 0) scale(${sx} 1)`}>
        {/* 머리·목 */}
        <Ellipse cx={70} cy={24} rx={16} ry={19} fill={skin} stroke={line} strokeWidth={1.5} />
        {back && <Path d="M55 18 Q70 2 85 18 L85 30 Q70 26 55 30 Z" fill="#CFC7BA" />}
        <Rect x={64} y={41} width={12} height={10} fill={skin} />
        {/* 팔 */}
        <Rect x={28} y={58} width={14} height={86} rx={7} fill={skin} stroke={line} strokeWidth={1.5} />
        <Rect x={98} y={58} width={14} height={86} rx={7} fill={skin} stroke={line} strokeWidth={1.5} />
        {/* 다리 */}
        <Rect x={50} y={150} width={18} height={124} rx={8} fill={skin} />
        <Rect x={72} y={150} width={18} height={124} rx={8} fill={skin} />
        {/* 하의 */}
        <Path d="M44 140 L96 140 L98 270 L74 270 L70 176 L66 270 L42 270 Z" fill={hex(bottom, '#CFCFCF')} stroke="rgba(0,0,0,0.18)" strokeWidth={1.5} />
        {/* 상의 */}
        <Path d="M46 50 L62 46 Q70 54 78 46 L94 50 L112 64 L106 96 L96 90 L96 150 L44 150 L44 90 L34 96 L28 64 Z" fill={hex(top, '#E9E9E9')} stroke="rgba(0,0,0,0.18)" strokeWidth={1.5} />
        {/* 아우터 */}
        {outer && (
          <>
            <Path d="M44 50 L60 45 L70 70 L80 45 L96 50 L114 66 L114 148 L100 148 L98 96 L98 172 L42 172 L42 96 L40 148 L26 148 L26 66 Z" fill={hex(outer)} stroke="rgba(0,0,0,0.22)" strokeWidth={1.5} opacity={0.97} />
            {!back && <Path d="M70 70 L70 172" stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} />}
          </>
        )}
        {/* 신발 */}
        <Rect x={44} y={268} width={28} height={12} rx={5} fill={hex(shoes, '#F2F2F2')} stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} />
        <Rect x={70} y={268} width={28} height={12} rx={5} fill={hex(shoes, '#F2F2F2')} stroke="rgba(0,0,0,0.25)" strokeWidth={1.5} />
      </G>
    </Svg>
  );
}
