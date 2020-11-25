const merge = require('deepmerge');
const path = require('path');

const resolve = function (dir) {
    return path.join(__dirname, dir);
};

module.exports = {
    publicPath: '/',

    // tweak internal webpack configuration.
    chainWebpack: (config) => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .tap(options => merge(options, {
                loaders: {
                    i18n: '@kazupon/vue-i18n-loader',
                },
            }));

        config.resolve.alias
            .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
            .set('_c', resolve('src/components'));
    },

    css: {
        // 配置高于chainWebpack中关于css loader的配置
        loaderOptions: {
            // css预设器配置项
            less: {
                javascriptEnabled: true,
            },
        },
    },

    transpileDependencies: [/\biview\/src\/locale\/lang\b/],

    devServer: {
        open: true,
        compress: true,
        // 解决 Webpack "Invalid Host Header"
        disableHostCheck: true,
        proxy: {
            '/api': {
                target: 'http://dev.com',
                ws: true,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/api',
                },
            },
        },
    },
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                appId: 'com.example.app',
                productName: '云教助手(教师端)', // 项目名，也是生成的安装文件名，即aDemo.exe
                copyright: 'Copyright © 2019', // 版权信息
                directories: {
                    output: './dist', // 输出文件路径
                },
                win: {
                    // win相关配置
                    icon: './app.png', // 图标，当前图标在根目录下，注意这里有两个坑
                    target: [
                        {
                            target: 'nsis', // 利用nsis制作安装程序
                            arch: [
                                'x64', // 64位
                            ],
                        },
                    ],
                    requestedExecutionLevel: 'asInvoker',
                },
                nsis: {
                    oneClick: false, // 是否一键安装
                    allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
                    allowToChangeInstallationDirectory: true, // 允许修改安装目录
                    installerIcon: './app.ico', // 安装图标
                    uninstallerIcon: './app.ico', // 卸载图标
                    installerHeaderIcon: './app.ico', // 安装时头部图标
                    createDesktopShortcut: true, // 创建桌面图标
                    createStartMenuShortcut: true, // 创建开始菜单图标
                    shortcutName: '云教助手', // 图标名称
                },
                extraResources: [
                    {
                        from: 'icons/',
                        to: 'icons/',
                    },
                ],
            },
        },
    },
};
