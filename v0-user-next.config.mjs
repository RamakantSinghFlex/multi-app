/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'milestone-learning.vercel.app', 'placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
}

export default nextConfig

