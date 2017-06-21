'use strict'

const chalk = require('chalk')
const log = console.log
const { say } = require('cfonts')
const { exec } = require('child_process')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackHotMiddleware = require('webpack-hot-middleware')
const rendererConfig = require('../webpack.dev.config')
const mainConfig = require('../webpack.base.config')
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

    //就到这里吧 热更新也做了 可惜就是不自动刷新浏览器
    //[WDS] App hot update... (执行到这里就不走了)
    //dev-server.js:45 [HMR] Checking for updates on the server... (就差这一句 不知道为啥)
    //这个写法真心没有命令行简单啊
    const server = new WebpackDevServer(
      compiler,
      {
        contentBase: path.join(__dirname, '../'),
        quiet: true,
        publicPath: '/dist/',
        hot: true,
        compress: true,
        historyApiFallback: true,
        setup(app, ctx) {
          app.use(hotMiddleware)
          ctx.middleware.waitUntilValid(() => {
            resolve()
          })
        }
      }
    )
    server.listen(8080)


    // 下面这段能捕捉到 文件更改并执行命令,可是没有electronProcess的刷新命令,而且删除好像也不好使
    // const compiler1 = webpack(rendererConfig)

    // compiler1.plugin('watch-run', (compilation, done) => {
    //   logStats('Main', chalk.white.bold('compiling...'))
    //   hotMiddleware.publish({ action: 'compiling' })
    //   done()
    // })

    // compiler1.watch({}, (err, stats) => {
    //   if (err) {
    //     console.log(err)
    //     return
    //   }
    //   aa++
    //   console.log(aa + 'startMain');
    //   logStats('Main', stats)
    //   log('3333333333333333333333333333333333333333')
    //   //没有这句不刷新了
    //   // if (electronProcess && electronProcess.kill) {
    //   //   log('3333333333333333333333333333333333333333')
    //   //   manualRestart = true
    //   //   process.kill(electronProcess.pid)
    //   //   electronProcess = null
    //   //   startElectron()

    //   //   setTimeout(() => {
    //   //     manualRestart = false
    //   //   }, 5000)
    //   // }
    //   resolve()
    // })


  })
}



function startMain() {
  return new Promise((resolve, reject) => {
    //mainConfig.entry.main = [path.join(__dirname, '../src/main/index.dev.js')].concat(mainConfig.entry.main)

    const compiler = webpack(rendererConfig)
    //const compiler = webpack(mainConfig)

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
      //没有这句不刷新了
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
  electronProcess = exec(`cross-env NODE_ENV=production1 electron .`)
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



function startExe() {
  return new Promise((resolve, reject) => {
    const child = exec('webpack-dev-server --inline --hot --colors --config webpack.dev.config.js --content-base ./')
    child.stdout.on('data', data => {
      logStats('startExe', data)
      //唉 又是这样 无论怎么延时 下面的命令都会提前执行
      setTimeout(() => {
        resolve()
      }, 5000)
    })

  })
}


function init() {
  greeting()
  // startMain()
  //startRenderer()
  
  //总是不完美啊 一个是无法自动刷新,一个是打开app界面太快
  //但真心懒得弄下去了,玩到这里就算了,因为就算开项目也会用模版建立项目吧,不会这么笨的还手动调
  Promise.all([startExe()])
    .then(() => {
      startElectron()
    })
    .catch(err => {
      console.error(err)
    })
}

init();