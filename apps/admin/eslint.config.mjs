import { FlatCompat } from '@eslint/eslintrc'
import { configs } from 'eslint-plugin-devup'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...configs.recommended,
]

export default eslintConfig
