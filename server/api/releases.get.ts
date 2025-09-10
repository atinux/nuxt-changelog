import type { MDCRoot } from '@nuxtjs/mdc'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const REPOS = [
  'nuxt/nuxt',
  'nuxt/image',
  'nuxt/fonts',
  'nuxt/ui',
  'nuxt/content',
  'nuxt/devtools',
  'nuxt/test-utils',
  'nuxt/scripts',
  'nuxt/eslint',
  'nuxt/icon'
]

type Release = {
  url: string
  tag: string
  title: string
  date: string
  body: MDCRoot
}

export default defineEventHandler(async () => {
  const releases: Release[] = await Promise.all(
    REPOS.map(async (repo) => {
      const { releases } = await $fetch<{ releases: any[] }>(`https://ungh.cc/repos/${repo}/releases`)
      return Promise.all(
        releases
          .filter(r => r.draft === false)
          .map(async release => ({
            url: `https://github.com/${repo}/releases/tag/${release.tag}`,
            repo,
            tag: release.tag,
            title: release.name || release.tag,
            date: release.publishedAt,
            body: (await parseMarkdown(release.markdown)).body
          }))
      )
    })
  ).then(results => results.flat())

  return releases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20)
})
