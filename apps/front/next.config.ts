import { DevupUI } from '@devup-ui/next-plugin'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['@devup-ui/reset-css'],
  },
}

export default DevupUI(nextConfig, {
  include: ['@devup-ui/reset-css'],
})
