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
            console.log(`File: ${entry.name}`);
            console.log(`Comment ${index + 1}:`, comments![index]);
            console.log(`Function Name ${index + 1}:`, functionName);
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
    // fs.writeFile(
    //   path.join(__dirname, "result.json"),
    //   JSON.stringify(returnVal, null, 2),
    //   (err) => {
    //     if (err) {
    //       console.error("Error writing to file:", err);
    //     } else {
    //       console.log("Successfully wrote to result.json");
    //     }
    //   }
    // );
    // console.log(2222222222222222222);
    // const data = fs.readFileSync(path.join(__dirname, "result.json"), "utf-8");
    // console.log("------------------", data);
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
    console.log("The index.html has been opened in your default browser.");
  });
  // fs.readdir(srcDirPath, (err, files) => {
  //   if (err) {
  //     console.error("Error reading directory:", err);
  //     return;
  //   }
  //   for (const [index, file] of files.entries()) {
  //     const filePath = path.join(srcDirPath, file);
  //     const data = fs.readFileSync(filePath, "utf8");
  //     if (err) {
  //       console.error("Error reading file:", err);
  //       return;
  //     }
  //     const functionNames = data.match(/(?<=\*\/\nconst ).*?(?=\s=\s\()/gs);
  //     const comments = data.match(/\/\*\*.*?\*\//gs);
  //     if (functionNames) {
  //       functionNames.forEach((functionName, index) => {
  //         console.log(`File: ${file}`);
  //         console.log(`Comment ${index + 1}:`, comments![index]);
  //         console.log(`Function Name ${index + 1}:`, functionName);
  //         returnVal.push({
  //           file,
  //           index,
  //           comments: comments as string[],
  //           functionName,
  //         });
  //       });
  //     }
  //     // fs.readFile(filePath, "utf8", (err, data) => {});
  //   }

  // });
};
