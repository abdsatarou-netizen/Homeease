/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // à restreindre au domaine de stockage réel en production
    ],
  },
};

module.exports = nextConfig;
