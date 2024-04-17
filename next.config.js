const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const runtimeCaching = require('./cache')
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV !== 'production',
  buildExcludes: [/chunks\/.*$/, /media\/.*$/],
  publicExcludes: ['!splashscreens/**/*', '!screenshots/**/*'],
  runtimeCaching,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
    largePageDataBytes: 200 * 1024, // 200kb
  },
  transpilePackages: ['react-tweet'],

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
  async rewrites() {
    return [
      { source: '/hubs', destination: '/' },
      { source: '/my-chats', destination: '/' },
      { source: '/hot-chats', destination: '/' },

      { source: '/ask', destination: '/featured/54469' },
      { source: '/discuss', destination: '/featured/54469' },
    ]
  },
  async redirects() {
    return [
      {
        source: '/report',
        destination: 'https://forms.gle/Gjh3ELaNHTBotiwN7',
        permanent: false,
      },
      {
        source: '/appeal',
        destination: 'https://forms.gle/nKjNwentimo2f6Yi6',
        permanent: false,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.subsocial.network',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'metadata.ens.domains',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = withPWA(withBundleAnalyzer(nextConfig))
