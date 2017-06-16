'use strict'

const chalk = require('chalk')
const log = console.log
const { say } = require('cfonts')



/**
 *  问候语
 */
function greeting () {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 76) text = 'dev-app'
  else if (cols > 56) text = 'dev-|app'
  else text = false

  if (text) {
    say(text, {
      colors: ['yellow'],
      font: 'simple',
      space: false
    })
  } else log(chalk.yellow.bold('\n  dev-app'))
  log(chalk.blue('\n\n'+'  getting ready...') + '\n')
}

/**
 * 渲染函数
 */
// function startRenderer () {
//   return new Promise((resolve, reject) => {
//     rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer)

//     const compiler = webpack(rendererConfig)
//     hotMiddleware = webpackHotMiddleware(compiler, { 
//       log: false, 
//       heartbeat: 2500 
//     })

//     compiler.plugin('compilation', compilation => {
//       compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
//         hotMiddleware.publish({ action: 'reload' })
//         cb()
//       })
//     })

//     compiler.plugin('done', stats => {
//       logStats('Renderer', stats)
//     })

//     const server = new WebpackDevServer(
//       compiler,
//       {
//         contentBase: path.join(__dirname, '../'),
//         quiet: true,
//         setup (app, ctx) {
//           app.use(hotMiddleware)
//           ctx.middleware.waitUntilValid(() => {
//             resolve()
//           })
//         }
//       }
//     )

//     server.listen(9080)
//   })
// }

/**
 * 打印输出信息
 */
function logStats (proc, data) {
  let logContent = ''

  logContent += chalk.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`)
  logContent += '\n\n'

  if (typeof data === 'object') {
    data.toString({
      colors: true,
      chunks: false
    }).split(/\r?\n/).forEach(line => {
      logContent += '  ' + line + '\n'
    })
  } else {
    logContent += `  ${data}\n`
  }

  logContent += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'

  log(logContent)
}


function init () {
  greeting()

//   Promise.all([startRenderer(), startMain()])
//     .then(() => {
//       startElectron()
//     })
//     .catch(err => {
//       console.error(err)
//     })
}

init();