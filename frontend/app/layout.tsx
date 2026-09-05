import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HomeEase — Trouvez. Comparez. Réservez.',
  description:
    "HomeEase est la plateforme qui simplifie la recherche, la location et la découverte de biens au Bénin, puis en Afrique.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-surface text-ink font-sans">
        <div className="mx-auto max-w-md min-h-screen bg-surface pb-24 relative">{children}</div>
      </body>
    </html>
  );
}
