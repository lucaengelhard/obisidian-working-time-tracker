import { Plugin } from "obsidian";
import "./index.css";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import { ObsidianStore, readStore } from "./data/store";

export default class WorkingHoursPlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor(
      "workinghours",
      (source, block, ctx) => {
        const ObsStore = new ObsidianStore(
          this.app,
          ctx,
          block,
          readStore(source)
        );

        createRoot(block).render(
          <StrictMode>
            <App store={ObsStore} />
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

  async onunload() {}
}
