'use client';
// 08 옷 올리기

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Images, Lightbulb, Sparkles } from 'lucide-react';
import { Button, ButtonPair, InfoBox, Page, ProgressBar } from '@/components/ui';
import { ClothThumb } from '@/components/ClothArt';
import { useApp } from '@/state/AppState';

import { resizeUpload } from '@/lib/resizeUpload';

export default function Upload() {
  const app = useApp();
  const router = useRouter();
  const closet = app.activeCloset;
  const pending = app.pending;
  const left = closet.capacity - closet.items.length;
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      app.setPending({ photoUri: await resizeUpload(f) });
    } catch {
      app.toast('이미지를 읽지 못했어요. 다른 사진으로 시도해 주세요');
    }
  };

  return (
    <Page title="옷 올리기" footer={<Button label="AI로 분석하기" icon={Sparkles} disabled={!pending} onClick={() => router.push('/analysis')} />}>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      <input ref={albumRef} type="file" accept="image/*" hidden onChange={onFile} />

      <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-surface">
        {pending?.photoUri ? (
          // eslint-disable-next-line @next/next/no-img-element -- 업로드 미리보기(data URL)
          <img src={pending.photoUri} alt="올릴 옷 사진" className="absolute inset-0 h-full w-full object-cover" />
        ) : pending?.sample ? (
          <ClothThumb item={{category: "상의", kind: "맨투맨", color: "네이비"}} height={240} className="w-full" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <Camera size={36} className="text-muted" />
            <p className="text-[13px] text-sub">사진 미리보기<br />옷 전체가 보이게 촬영해 주세요</p>
          </div>
        )}
      </div>

      <ButtonPair>
        <Button label="카메라 촬영" icon={Camera} variant="outline" onClick={() => cameraRef.current?.click()} />
        <Button label="앨범에서 선택" icon={Images} variant="outline" onClick={() => albumRef.current?.click()} />
      </ButtonPair>
      {!pending && (
        <button onClick={() => app.setPending({ sample: true, photoUri: "/looks/sweater.webp" })} className="self-center text-[13px] text-sub underline">
          사진 없이 샘플로 체험하기
        </button>
      )}

      <div className="flex flex-col gap-2.5 rounded-xl bg-surface p-3.5">
        <div className="flex justify-between">
          <span className="text-[15px] font-semibold">{closet.name} · 남은 칸 {left}벌</span>
          <span className="text-[13px] text-sub">{closet.items.length} / {closet.capacity}</span>
        </div>
        <ProgressBar value={closet.items.length} max={closet.capacity} />
      </div>
      <InfoBox icon={Lightbulb}>배경이 단순할수록 AI 분석이 정확해져요. 옷을 바닥에 펼치거나 옷걸이에 걸어 찍어 주세요.</InfoBox>
    </Page>
  );
}
