import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      // Permite imagens vindas de qualquer host HTTPS externo
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;