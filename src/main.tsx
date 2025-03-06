import { Plugin } from "obsidian";
import "./index.css";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import { readStore } from "./data/store";

export default class WorkingHoursPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor(
      "workinghours",
      (source, block, ctx) => {
        createRoot(block).render(
          <StrictMode>
            <App
              store={readStore(source)}
              app={this.app}
              block={block}
              ctx={ctx}
            />
          </StrictMode>
        );
      }
    );

    // Add Insertion Command
    this.addCommand({
      id: "insert",
      name: "Insert Working Hours Tracker",
      editorCallback: (e) => {
        e.replaceSelection(
          '\n```workinghours\n{"tasks":{}, "projects": {}}\n```\n'
        );
      },
    });
  }

  //TODO: Export PDF (Command / Button?)
  //TODO: EDIT functions
  //TODO: Table sizing fixes

  async onunload() {}
}
