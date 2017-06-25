const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        main: './src/main',
        vendors: './src/vendors',
    },
    output: {
        path: path.join(__dirname, './dist')
    },
    module: {
        rules: [{
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                loaders: {
                    css: ExtractTextPlugin.extract({
                        //use: ['css-loader', 'autoprefixer-loader'], //加这个 autoprefixer-loader 就报错  有个输出 以后再考虑吧 反正现在可以用了 就是不是最完美样子
                        use: ['css-loader'],
                        fallback: 'vue-style-loader'
                    })
                }
            }
        },
        {
            test: /iview\/.*?js$/,
            loader: 'babel-loader'
        },
        {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        },
        {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({    //这里去除这个插件就会找不到带版本号的插件了
                //use: ['css-loader?minimize', 'autoprefixer-loader'],  // 这个也是 这个autoprefixer-loader 好像是版本选择
                use: ['css-loader?minimize'],  
                fallback: 'style-loader'
            })
        },
        {
            test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
            loader: 'url-loader?limit=1024'
        },
        {
            test: /\.(html|tpl)$/,
            loader: 'html-loader'
        }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue': 'vue/dist/vue.esm.js'
        }
    }
};