#!/usr/bin/env node
import { Command } from "commander";
import { printComments } from "./core/printComment";

const program = new Command();

const actionFunc = async (dir: string) => {
  await printComments(dir);
};

program
  .version("1.0.0")
  .description("this is a simple JSON key value discriminator.")
  .option("-d , --dir <type>", "directory folder name (required)")
  .action((options) => {
    actionFunc(options.dir);
  });

// 해당되는 command가 없을 경우 실행되는 command
program.command("*", { noHelp: true }).action(() => {
  console.log("cannot find commander.");
  program.help();
});

program.parse(process.argv);
