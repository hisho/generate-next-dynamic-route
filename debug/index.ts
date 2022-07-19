import { exec } from 'child_process'

exec(`cd debug/next &&  node ./../../bin/index.js`, (_, stdout, stderr) =>
  console.log(stdout, stderr)
)
