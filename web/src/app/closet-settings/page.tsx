'use client';
// 11 옷장 설정 — 이름 · 테마 1개 · 공개 범위 · 옷장 유형

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ChipRow, InfoBox, Input, Label, Page, PickerSheet, Row, TextAction } from '@/components/ui';
import { STYLES, Style, Visibility } from '@/data/mock';
import { useApp } from '@/state/AppState';

const VIS: Visibility[] = ['비공개', '링크 공개', '전체 공개'];

export default function ClosetSettings() {
  const app = useApp();
  const router = useRouter();
  const c = app.activeCloset;
  const [name, setName] = useState(c.name);
  const [theme, setTheme] = useState<Style>(c.theme);
  const [vis, setVis] = useState<Visibility>(c.visibility);
  const [picker, setPicker] = useState(false);

  const save = () => {
    app.updateCloset(c.id, (x) => ({ ...x, name: name.trim() || x.name, theme, visibility: vis }));
    app.toast('옷장 설정을 저장했어요');
    router.back();
  };

  return (
    <Page
      title="옷장 설정"
      right={<TextAction label="저장" onClick={save} />}
      footer={<Button label="저장하기" onClick={save} />}
      overlay={<PickerSheet open={picker} title="공개 범위" options={VIS} value={vis} onPick={(v) => setVis(v as Visibility)} onClose={() => setPicker(false)} />}
    >
      <Input label="옷장 이름" value={name} onChange={setName} placeholder="예: 미니멀 출근룩" />
      <Label>테마 (옷장당 1개)</Label>
      <ChipRow items={STYLES} value={theme} onChange={(v) => setTheme(v as Style)} wrap />
      <InfoBox>다른 테마로도 옷장을 운영하고 싶다면 옷장을 추가하세요.</InfoBox>
      <div>
        <Row label="공개 범위" value={vis} onClick={() => setPicker(true)} />
        <Row label="옷장 유형" value={c.type} onClick={() => app.toast('옷장 유형은 새 옷장을 만들 때 정할 수 있어요')} />
        <Row label="옷 용량" value={`${c.items.length} / ${c.capacity}벌`} href="/expand" />
      </div>
    </Page>
  );
}
