'use strict'

const chalk = require('chalk')
const log = console.log
const { say } = require('cfonts')
const { exec } = require('child_process')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackHotMiddleware = require('webpack-hot-middleware')
const rendererConfig = require('../webpack.dev.config')
const path = require('path')

let hotMiddleware
let electronProcess = null
let manualRestart = false
let aa = 0
let bb = 0

/**
 *  问候语
 */
function greeting() {
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
  log(chalk.blue('\n\n' + '  getting ready...') + '\n')
}

/**
 * 渲染函数
 */
function startRenderer() {
  return new Promise((resolve, reject) => {
    //rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer)

    const compiler = webpack(rendererConfig)

    hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 2500
    })
    compiler.plugin('compilation', compilation => {
      compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
        hotMiddleware.publish({ action: 'reload' })
        cb()
      })
    })

    compiler.plugin('done', stats => {
      bb++
      logStats('Renderer' + bb, stats)
    })

    const server = new WebpackDevServer(
      compiler,
      {
        contentBase: path.join(__dirname, '../'),
        quiet: true,
        setup(app, ctx) {
          app.use(hotMiddleware)
          ctx.middleware.waitUntilValid(() => {
            resolve()
          })
        }
      }
    )
    server.listen(8080)
  })
}



function startMain() {
  return new Promise((resolve, reject) => {
    //mainConfig.entry.main = [path.join(__dirname, '../src/main/index.dev.js')].concat(mainConfig.entry.main)

    const compiler = webpack(rendererConfig)

    compiler.plugin('watch-run', (compilation, done) => {
      logStats('Main', chalk.white.bold('compiling...'))
      hotMiddleware.publish({ action: 'compiling' })
      done()
    })

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err)
        return
      }
      aa++
      console.log(aa + 'startMain');
      logStats('Main', stats)
      if (electronProcess && electronProcess.kill) {
        log('3333333333333333333333333333333333333333')
        manualRestart = true
        process.kill(electronProcess.pid)
        electronProcess = null
        startElectron()

        setTimeout(() => {
          manualRestart = false
        }, 5000)
      }
      resolve()
    })
  })
}

function startElectron() {
  //electronProcess = spawn(electron, ['--inspect=5858', path.join(__dirname, '../dist/electron/main.js')])
  electronProcess = exec(`electron .`)
  electronProcess.stdout.on('data', data => {
    electronLog(data, 'blue')
  })
  electronProcess.stderr.on('data', data => {
    electronLog(data, 'red')
  })

  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}


function electronLog(data, color) {
  let log = ''
  data = data.toString().split(/\r?\n/)
  data.forEach(line => {
    log += `  ${line}\n`
  })
  if (/[0-9A-z]+/.test(log)) {
    console.log(
      chalk[color].bold('┏ Electron -------------------') +
      '\n\n' +
      log +
      chalk[color].bold('┗ ----------------------------') +
      '\n'
    )
  }
}

/**
 * 打印输出信息
 */
function logStats(proc, data) {
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
    logContent += chalk.yellow.bold(`  ${data}\n`)
  }

  logContent += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'

  log(logContent)
}





function init() {
  greeting()
 // startMain()
  //startRenderer()
  // 修改了 index.html 已经可以使用了. 以前的问题主要是不能自动插入生成的静态文件
  // 还有就是当更新的时候 又会打开新electron
  Promise.all([startRenderer(),startMain()])
    .then(() => {
      startElectron()
    })
    .catch(err => {
      console.error(err)
    })
}

init();