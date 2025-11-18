import { DevupUI } from '@devup-ui/vite-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['apps/*/src/**'],
      exclude: ['**/*.stories.{ts,tsx}', '*.md', '*.mdx'],
      cleanOnRerun: true,
      reporter: ['text', 'json', 'html'],
      // thresholds: {
      //   100: true,
      // },
    },
    projects: [
      {
        test: {
          name: 'node',
          include: ['apps/*/src/**/__tests__/**/*.test.{ts,tsx}'],
          exclude: ['apps/*/src/**/__tests__/**/*.browser.test.{ts,tsx}'],
          globals: true,
          environment: 'node',
        },
      },
      {
        test: {
          name: 'happy-dom',
          include: ['apps/*/src/**/__tests__/**/*.browser.test.{ts,tsx}'],
          environment: 'happy-dom',
          globals: true,
          css: true,
          setupFiles: ['@testing-library/jest-dom/vitest'],
        },
        plugins: [
          DevupUI({
            debug: true,
            singleCss: true,
          }),
        ],
      },
    ],
    cache: false,
  },
})
