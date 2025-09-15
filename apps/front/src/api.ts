import createClient from 'openapi-fetch'

import type { paths } from '../schema'

const client = createClient<paths>({ baseUrl: 'https://myapi.dev/v1/' })
client.GET('/users/users', {
  params: {
    query: {
      qId: 'test',
    },
  },
})
