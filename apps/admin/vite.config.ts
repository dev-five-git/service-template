import devupApi from '@devup-api/vite-plugin'
import { DevupUI } from '@devup-ui/vite-plugin'
import vinext from 'vinext'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    devupApi(),
    DevupUI({ include: ['@devup-ui/reset-css', '@devup-ui/components'] }),
    vinext({ nextConfig: { output: 'standalone' } }),
  ],
})
