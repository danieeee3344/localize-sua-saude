import type { Metadata } from 'next';
import AccessibilityBar from './components/AccessibilityBar';
import Header from './components/Header';
import Footer from './components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Localize Sua Saúde',
  description: 'Encontre hospitais, clínicas e laboratórios no Vale do Araguaia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AccessibilityBar />
        <div id="grad1">
          <Header />
          <div style={{ minHeight: 'calc(100vh - 120px)' }}>{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
