/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de base
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimisations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
  
  // Images
  images: {
    domains: [
      'images.pexels.com',
      'unavatar.io',
      'ui-avatars.com',
      'graph.instagram.com',
      'scontent.cdninstagram.com'
    ],
    formats: ['image/webp', 'image/avif'],
    unoptimized: false
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  
  // Redirections
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true
      },
      {
        source: '/login',
        destination: '/auth',
        permanent: true
      },
      {
        source: '/register',
        destination: '/auth?mode=signup',
        permanent: true
      }
    ];
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimisations pour la production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  // ESLint
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'contexts']
  },
  
  // TypeScript
  typescript: {
    ignoreBuildErrors: false
  },
  
  // Compression
  compress: true,
  
  // Trailing slash
  trailingSlash: false,
  
  // PoweredByHeader
  poweredByHeader: false,
  
  // Bundle analyzer (optionnel)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
      return config;
    },
  })
};

module.exports = nextConfig;