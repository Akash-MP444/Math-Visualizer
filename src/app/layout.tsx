import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Equation Universe',
  description: 'Visualize any mathematical equation in 2D, 3D, fractal space, or as a vector field.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
