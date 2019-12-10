#!/usr/bin/env node
// 使用Node开发命令行工具所执行的JavaScript脚本必须在顶部加入 #/usr/bin/env node 声明
const program = require("commander");
const download = require("download-git-repo");
const handlebars = require("handlebars");
const inquirer = require('inquirer');
const fs = require("fs");
const ora = require("ora");
const chalk = require("chalk");
const logSymbols = require("log-symbols");

// 1. 获取用户输入命令
// 原生获取命令行参数的方式，比较麻烦 console.log(process.argv)
// commander

const templates = {
  a: {
    url: 'https://github.com/MyNameIsPG/layoutit.git',
    downloadUrl: 'https://github.com:MyNameIsPG/layoutit#master',
    description: 'a模板'
  },
  b: {
    url: 'https://github.com/MyNameIsPG/layoutit.git',
    downloadUrl: 'https://github.com:MyNameIsPG/bbbb#master',
    description: 'b模板'
  },
  c: {
    url: 'https://github.com/MyNameIsPG/layoutit.git',
    downloadUrl: 'https://github.com:MyNameIsPG/layoutit#master',
    description: 'c模板'
  }
}

program
  .version('0.1.0')

program
  .command('init <template> <project>')
  .description('初始化项目模板')
  .action((templateName, projectName) => {
    const spinner = ora(chalk.green("正在下载模板...")).start();
    const { downloadUrl } = templates[templateName];
    download(downloadUrl, projectName, { clone: true }, (err) => {
      if (err) {
        spinner.fail();
        console.log(logSymbols.error, chalk.red(err));
        return
      }
      spinner.succeed();

      // 把项目下的 package.json 文件读取出来
      // 使用向导的方式采集用户输入的值
      // 使用模板引擎把用户输入的数据解析到 package.json 文件中
      // 解析完毕，把解析之后的文件重新写入 package.json 文件中
      inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "请输入项目名称"
        },
        {
          type: "input",
          name: "description",
          message: "请输入项目简介"
        },
        {
          type: "input",
          name: "author",
          message: "请输入作者名称"
        }
      ])
        .then(answers => {
          const packagePath = `${projectName}/package.json`;
          const packageContent = fs.readFileSync(packagePath, 'utf8');
          const packageResult = handlebars.compile(packageContent)(answers);
          fs.writeFileSync(packagePath, packageResult);
          console.log(logSymbols.success, chalk.green("初始化模板成功"));
        });
    })
  });

program
  .command('list')
  .description('查看所有可用的模板')
  .action(() => {
    for (key in templates) {
      console.log(`
        ${key}、${templates[key].description}
      `);
    }
  });

program.parse(process.argv);

// 2. 根据不同的命令执行不同的功能操作