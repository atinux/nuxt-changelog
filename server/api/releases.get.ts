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
  'nuxt/icon',
  'nuxt/hints',
  'nuxt/a11y'
]

export default defineCachedEventHandler(async () => {
  console.log('fetching releases')
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
}, {
  maxAge: 60
})
