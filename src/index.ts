import minimist from 'minimist'
import chokidar from 'chokidar'
import path from 'path'
import glob from 'glob'
import { config } from './config'
import fs from 'fs'

type argvType = Readonly<{
  watch: string
}>

/**
 * next.config.js の設定を取得する
 */
const getNextConfig = async () => {
  try {
    const config: { pageExtensions?: string[] } = await import(
      path.join(process.cwd(), './next.config.js')
    )
    return config.pageExtensions
  } catch {
    return undefined
  }
}

/**
 * ページをすべて取得する
 * @example
 * [
 *   'article/[...article_id]/index.page.tsx',
 *   'categories/[[...categories_id]]/index.page.tsx',
 *   'index.page.tsx',
 *   'post/[post_id]/[comment_id]/index.page.tsx',
 *   'post/[post_id]/index.page.tsx',
 *   'post/index.page.tsx'
 * ]
 */
const getPagePaths = ({
  src,
  pageExtensions,
}: {
  src: string
  pageExtensions: string[]
}) => {
  return (
    glob.sync(`**/!(_)*.+(${pageExtensions.join('|')})`, {
      cwd: path.resolve(process.cwd(), src),
    }) ?? []
  )
}

/**
 * dirnameからpathを配列で割り出す関数
 * '/page/path/to/your/dir' -> ['page','path','to','to','your','dir']
 * @returns {string[]}
 */
const getSlugFromPath = (p: string) => path.dirname(p).split('/')

/**
 * pagesのdirnameからpathを割り出し2重配列をフラットにし重複を削除した配列
 * @type {string[]}
 * @example
 * [
 *   'article',
 *   '[...article_id]',
 *   'categories',
 *   '[[...categories_id]]',
 *   '.',
 *   'post',
 *   '[post_id]',
 *   '[comment_id]'
 * ]
 */
const getSlugsFromPagePaths = (pagesPath: string[]) =>
  [...new Set(pagesPath.map(getSlugFromPath).flat(Infinity))] as string[]

/**
 * slugsからdynamic routeを割り出して返す関数
 * [uid] -> string
 * [...uids] -> string[]
 * [[...uids]] -> string[]
 */
const extractDynamicRoutes = (slugs: string[]): string[] => {
  return slugs
    .map((slug) => {
      if (slug.startsWith('[') && slug.endsWith(']')) {
        return slug
      }
      return undefined
    })
    .filter((n): n is string => Boolean(n))
}

type objectFromDynamicRoutes = { slug: string; type: 'array' | 'string' }[]

/**
 * pagePathNamesからdynamic routeを割り出してオブジェクトにして返す関数
 * dynamic routeが配列の場合typeをarrayにそうでない場合はstringにする関数
 * TODO 名前が思いつかない
 */
const objectFromDynamicRoutes = (slugs: string[]): objectFromDynamicRoutes => {
  return slugs.map((slug) => {
    const _slug = slug.replace(/[.[\]]/g, '')
    if (/\[\./.test(slug)) {
      return { slug: _slug, type: 'array' }
    } else {
      return { slug: _slug, type: 'string' }
    }
  })
}

const writeDynamicPaths = (
  dynamicRouteObject: objectFromDynamicRoutes,
  { dest }: { dest: string }
) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  fs.writeFile(
    `${dest}$dynamicPaths.ts`,
    `/* eslint-disable */
// prettier-ignore
export const dynamicPaths: {
${dynamicRouteObject
  .map(
    ({ slug, type }) => `${slug}: ${type === 'string' ? 'string' : 'string[]'}`
  )
  .join(',\n')}
} = ${JSON.stringify(
      Object.fromEntries(
        dynamicRouteObject.map(({ slug, type }) => [
          slug,
          type === 'string' ? '' : [],
        ])
      ),
      null,
      '\t'
    )}
// prettier-ignore
export type DynamicPaths = typeof dynamicPaths`,
    () => {}
  )
}

const write = (pageExtensions: string[]) => {
  const pagePaths = getPagePaths({ src: config.src, pageExtensions })
  const slugs = getSlugsFromPagePaths(pagePaths)
  const dynamicRoutes = extractDynamicRoutes(slugs)
  const dynamicRouteObject = objectFromDynamicRoutes(dynamicRoutes)
  writeDynamicPaths(dynamicRouteObject, { dest: config.dest })
}

export const main = async (args: string[]) => {
  const argv = minimist<argvType>(args, {
    string: ['watch'],
    alias: { w: 'watch' },
  })

  const pageExtensions = (await getNextConfig()) ?? ['tsx', 'ts']

  if (argv.watch !== undefined) {
    chokidar
      .watch(
        pageExtensions.map((n) => path.join(config.src, `**/!(_)*.${n}`)),
        {
          ignoreInitial: true,
        }
      )
      .on('all', (eventName, path) => {
        console.log('Watching...', eventName, path)
        write(pageExtensions)
      })
  } else {
    console.log('Building...')
    write(pageExtensions)
  }
}
