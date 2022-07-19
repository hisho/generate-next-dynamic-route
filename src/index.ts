import minimist from 'minimist'
import chokidar from 'chokidar'
import path from 'path'

type argvType = Readonly<{
  watch: string
}>

export const main = async (args: string[]) => {
  const argv = minimist<argvType>(args, {
    string: ['watch'],
    alias: { w: 'watch' },
  })
  console.log(argv)

  if (argv.watch !== undefined) {
    chokidar
      .watch(
        ['**/*.png', '**/*.jpg'].map((n) => path.join('src', n)),
        {
          ignoreInitial: true,
        }
      )
      .on('all', (eventName, path) => {
        console.log('Watching...', eventName, path)
      })
  } else {
    console.log('Building...')
  }
}
