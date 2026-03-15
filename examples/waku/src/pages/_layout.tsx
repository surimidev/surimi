import type { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div id="app">
      <meta name="description" content="Surimi + Waku" />
      <title>Surimi + Waku</title>
      {children}
    </div>
  );
}
