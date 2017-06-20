/**
 * Credits to https://github.com/bradstewart/electron-boilerplate-vue/blob/master/build/dev-runner.js
 */
'use strict'

/**
 * 简易版本的electron测试启动
 * 
 */

//const config = require('../config')
const exec = require('child_process').exec  //这个估计是node自带的了
const treeKill = require('tree-kill')

const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const END = '\x1b[0m'

let isElectronOpen = false

function format(command, data, color) {
  return `${color + command + END}
    ${  // Two space offset
    data.toString().trim().replace(/\n/g, `\n${repeat(' ', command.length + 2)}`)
    }\n`
}

function repeat(str, times) {
  return (new Array(times + 1)).join(str)
}

const children = []

function run (command, color, name) {
  const child = exec(command)

  child.stdout.on('data', data => {
    console.log(format(name, data, color))

    /**
     * Start electron after VALID build
     * (prevents electron from opening a blank window that requires refreshing)
     *
     * NOTE: needs more testing for stability
     */
    /* if (/VALID/g.test(data.toString().trim().replace(/\n/g, '\n' + repeat(' ', command.length + 2))) && !isElectronOpen) {
      console.log(`${BLUE}Starting electron...\n${END}`)
      run('cross-env NODE_ENV=development electron app/electron.js', BLUE, 'electron')
      isElectronOpen = true
    } */
    if (/Compiled/g.test(data.toString().trim().replace(/\n/g, `\n${repeat(' ', command.length + 2)}`)) && !isElectronOpen) {
      console.log(`${BLUE}Starting electron...\n${END}`)
      run('cross-env NODE_ENV=development electron .', BLUE, 'electron')
      isElectronOpen = true
    }
  })

  child.stderr.on('data', data => console.error(format(name, data, color)))
  child.on('exit', code => exit(code))

  children.push(child)
}

// function run(command, color) {
//   var child = exec(command)

//   child.stdout.on('data', function (data) {
//     console.log(format(command.split(' ')[2], data, color))
//   })

//   child.stderr.on('data', function (data) {
//     console.error(format(command.split(' ')[2], data, color))
//   })

//   child.on('exit', function (code) {
//     exit(code)
//   })

//   children.push(child)
// }

// function exit(code) {
//   children.forEach(child => {
//     treeKill(child.pid)
//   })
// }

console.log(`${YELLOW}Starting webpack-dev-server...\n${END}`)
run(`webpack-dev-server --inline --hot --colors --config webpack.dev.config.js --content-base ./`, YELLOW, 'webpack-server-info:')
//webpack-dev-server --content-base ./ --open  --hot --compress --history-api-fallback --config webpack.dev.config.js

//这么写不行可能因为是启动浏览器的关系
//run('npm run dev',YELLOW)
//而且必须这么写
//这两个run几乎是同时的,是不会等第一个完全执行完毕
//所以app界面需要等一会才会显示
//虽然这个比较简介不过呢感觉还是用原来那个版本显示更清楚些,但就是有点不好看 
//run(`webpack-dev-server --inline --hot --colors --config webpack.dev.config.js --content-base ./`, YELLOW)
//console.log(children.length)
//run('cross-env NODE_ENV=development electron .', BLUE)
//console.log(children.length)