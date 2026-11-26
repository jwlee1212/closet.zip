import { TabBar } from './TabBar';

export default function TabsLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      {children}
      <TabBar />
    </>
  );
}
