import path from "path";
import fs from "fs";
import { renderToString } from "react-dom/server";

import App from "../App";
import React from "react";
import { exec } from "child_process";
import { ServerStyleSheet } from "styled-components";

interface returnProps {
  file: string;
  index: number;
  comments: string[];
  functionName: string;
}

export const printComments = async (rootPath: string) => {
  const srcDirPath = path.join(process.cwd(), rootPath);
  let returnVal: returnProps[] = [];
  const exploreDirectory = async (dirPath: string) => {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (let entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await exploreDirectory(entryPath);
      } else {
        // Process file
        const data = await fs.promises.readFile(entryPath, "utf8");
        const functionNames = data.match(/(?<=\*\/\nconst ).*?(?=\s=\s\()/gs);
        const comments = data.match(/\/\*\*.*?\*\//gs);
        if (functionNames) {
          functionNames.forEach((functionName, index) => {
            returnVal.push({
              file: entry.name,
              index,
              comments: comments as string[],
              functionName,
            });
          });
        }
      }
    }
  };
  await exploreDirectory(srcDirPath);
  const filePath = path.join(__dirname, "index.html");

  const openCommand =
    process.platform === "win32"
      ? "start"
      : process.platform === "darwin"
      ? "open"
      : "xdg-open";

  const sheet = new ServerStyleSheet();

  let tag;

  try {
    const jsonToHTML = renderToString(
      sheet.collectStyles(<App json={returnVal} />)
    );
    const styleTags = sheet.getStyleTags();
    tag = styleTags;
  } catch (err) {
    console.log(err);
  } finally {
    sheet.seal();
  }
  const jsonToHTML = renderToString(<App json={returnVal} />);
  fs.writeFileSync(
    path.join(__dirname, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>JSDoc Visualizer</title>
  ${tag}
</head>
<body>
  <div id="root">${jsonToHTML}</div>
</body>
</html>`
  );
  exec(`${openCommand} ${filePath}`, (error) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
  });
};
