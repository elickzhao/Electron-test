'use strict'

const chalk = require('chalk')
const log = console.log
const { say } = require('cfonts')
const { exec } = require('child_process')
const webpack = require('webpack')
const rendererConfig = require('../webpack.prod.config.js')
const Multispinner = require('multispinner')
const path = require('path')


const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '


/**
 *  "build": "node .electron-vue/build.js && build",    
 *  "build:dir": "node .electron-vue/build.js && build --dir",  //这里的build是上面的那个命令  这个--dir不太理解
    "build:clean": "cross-env BUILD_TARGET=clean node .electron-vue/build.js",  //这个环境是在这里设定的
    "build:web": "cross-env BUILD_TARGET=web node .electron-vue/build.js",
 */
//这里是这么用的
if (process.env.BUILD_TARGET === 'clean') clean()
else if (process.env.BUILD_TARGET === 'web') web()
else if (process.env.BUILD_TARGET === 'app') app()
else build()


function app() {
  log(chalk.bgBlue.white(' OKAY '))
}


/**
 *  问候语
 */
function greeting() {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 76) text = 'build-app'
  else if (cols > 56) text = 'build-|app'
  else text = false

  if (text) {
    say(text, {
      colors: ['yellow'],
      font: 'simple',
      space: false
    })
  } else log(chalk.yellow.bold('\n  build-app'))
  log(chalk.blue('\n\n' + '  getting ready...') + '\n')
}


function build() {
  greeting();

  //这个还稍微有个小问题,就是 不能显示两个完成 只显示一个完成
  //第二个build不会显示完成 就算一个的时候也是不显示,而只是一个console.log
  const tasks = ['renderer','app']
  const m = new Multispinner(tasks, {
    preText: 'building',
    postText: 'process'
  })

  //let results = '' //这个会显示 object 并不会有什么输出

  m.on('success', () => {
    process.stdout.write('\x1B[2J\x1B[0f')
    //console.log(`\n\n ${results} `)
    console.log(` ${okayLog}take it away ${chalk.yellow('`web-builder`')}\n`)
    process.exit()
  })
  // .on('err', (e) => {
  //   console.log(`${e} spinner finished with an error`)
  // })

  web(rendererConfig).then(result => {
    //results += result + '\n\n'
    m.success('renderer')
  }).catch(err => {
    m.error('renderer') //这个这么写也可以,像上面success那么写也可以
    console.log(`\n  ${errorLog}failed to build renderer process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })

  app().then(() => {
    m.success('app')
    console.log(` ${okayLog}take it away ${chalk.yellow('`app-builder`')}\n`)
    process.exit()
  }).catch((err) => {
    m.error('app')
    console.log(`\n  ${errorLog}failed to build app process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })

}

function app() {
  return new Promise((resolve, reject) => {
    exec('electron-packager . HelloWorld windows --out ./OutApp --version 1.6.11 --overwrite --ignore=client/node_modules', (error, stdout, stderr) => {
      if (error) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })

  })
}


function web(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) reject(err.stack || err) //webpack错误
      else if (stats.hasErrors()) { //编译错误
        let err = ''
        //格式化处理错误信息
        stats.toString({
          chunks: false,
          colors: true
        }).split(/\r?\n/)
          .forEach(line => {
            err += `    ${line}\n`
          })
        //返回错误
        reject(err)
      } else {
        //返回成功信息
        resolve(stats.toJson({
          chunks: false,
          colors: true
        }))
      }
    })
  })
}