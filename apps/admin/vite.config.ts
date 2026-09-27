import devupApi from '@devup-api/vite-plugin'
import { DevupUI } from '@devup-ui/vite-plugin'
import vinext from 'vinext'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    devupApi(),
    DevupUI(),
    vinext({
      nextConfig: { output: 'standalone' },
      react: { compiler: true },
    }),
  ],
  // devup-ui rewrites df/devup-ui/*.css on every dev transform. The CSS is
  // served from memory, so the writes only make vinext reload the page in a
  // loop. Only df/devup-ui is ignored: df/ also holds devup-api output.
  server: { watch: { ignored: ['**/df/devup-ui/**'] } },
})
