# 本项目来源
一直以来想提高小程序的开发效率, 偶然间翻到了 [godbasin](https://github.com/godbasin) 的 [wxapp-typescript-demo](https://github.com/godbasin/wxapp-typescript-demo/blob/master/gulpfile.js)

个人原因喜欢极简风格, 并未集成过多功能, 遂有了本项目

感谢 [godbasin](https://github.com/godbasin) 的开源

## 项目简介
* 使用 gulp 构建(支持 typescript 和 sass/scss)
* 使用 typescript 编译
* 使用 eslint + prettier 格式代码规范
* 使用小程序官方 [typing 库](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/wechat-miniprogram)
* 支持 typescript alias、sass/scss alias
* typescript 压缩 、 sass/scss 压缩

## 安装使用
```
# 安装依赖
pnpm install

# 启动项目
pnpm dev

# 导入项目
使用小程序开发工具导入生成的dist文件夹

# 需要在小程序开发工具里【工具】-【构建npm】

# 打包代码
pnpm build
```