<div align="center"> <a href="https://github.com/anncwb/vue-vben-admin"> <img alt="VbenAdmin Logo" width="200" height="200" src="https://anncwb.github.io/anncwb/images/logo.png"> </a> <br> <br>

[![license](https://img.shields.io/github/license/anncwb/vue-vben-admin.svg)](LICENSE)

<h1>Vue vben admin</h1>
</div>

## 简介

Vue Vben Admin 是一个免费开源的中后台模版。使用了最新的`vue3`,`vite2`,`TypeScript`等主流技术开发，开箱即用的中后台前端解决方案，也可用于学习参考。

## 特性

- **最新技术栈**：使用 Vue3/vite2 等前端前沿技术开发
- **TypeScript**: 应用程序级 JavaScript 的语言
- **主题**：可配置的主题
- **国际化**：内置完善的国际化方案
- **Mock 数据** 内置 Mock 数据方案
- **权限** 内置完善的动态路由权限生成方案
- **组件** 二次封装了多个常用的组件，使用rolllup打包成组件
- **工具支持** 独立的build工具方便快速构建项目，cli工具可以快速新增项目模板

## 文档

[文档地址](https://vvbin.cn/doc-next/)

## 准备

- [node](http://nodejs.org/) 和 [git](https://git-scm.com/) -项目开发环境
- [Vite](https://vitejs.dev/) - 熟悉 vite 特性
- [pnpm](https://www.pnpm.cn/) - 构建工具
- [Vue3](https://v3.vuejs.org/) - 熟悉 Vue 基础语法
- [TypeScript](https://www.typescriptlang.org/) - 熟悉`TypeScript`基本语法
- [Es6+](http://es6.ruanyifeng.com/) - 熟悉 es6 基本语法
- [Vue-Router-Next](https://next.router.vuejs.org/) - 熟悉 vue-router 基本使用
- [Ant-Design-Vue](https://2x.antdv.com/docs/vue/introduce-cn/) - ui 基本使用
- [Mock.js](https://github.com/nuysoft/Mock) - mockjs 基本语法

## 安装使用

- 获取项目代码

```bash
git clone https://gitlab.com/acn_abg/fe-core.git
```

- 安装依赖

```bash
cd vue-vben-admin

pnpm install

```

- 运行

```bash
yarn dev
```

- 打包

[CHANGELOG](./PUBLISH.md)
```bash
yarn build
```

## 更新日志

[CHANGELOG](./CHANGELOG.zh_CN.md)

## 项目地址

- [fe-ent-core](https://gitlab.com/acn_abg/fe-core.git) - 完整版

## 浏览器支持

本地开发推荐使用`Chrome 80+` 浏览器

支持现代浏览器, 不支持 IE

## 目录介绍

如果这些插件对你有帮助，可以给一个 star 支持下

- **packages** - 核心组件库
- **docs** - 文档库
- **play** - 在线样例，方便调试
- **tools/build** - 构建工具，将vite需要配置做了封装，降低使用vite的学习成本
- **tools/cli** - 命令行工具，可以基于核心组件库，快速创建项目模板
- **tools/ent-theme-api** - 主题切换的API库，方便核心组件库引用
- **tools/vite-plugin-ent-theme** - vite插件，用于在线切换主题色等颜色相关配置

## 后台整合示例

- [lamp-cloud](https://github.com/zuihou/lamp-cloud) - 基于 SpringCloud Alibaba 的微服务中后台快速开发平台
- [matecloud](https://github.com/matevip/matecloud) - MateCloud 微服务脚手架，基于 Spring Cloud 2020.0.3、SpringBoot 2.5.3 的全开源平台

## 维护者
