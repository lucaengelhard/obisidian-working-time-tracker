import { Plugin, TFile } from "obsidian";
import "./index.css";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import { ObsidianStore, readStore } from "./data/store";
import { DEFAULT_SETTINGS, Settings, WorkingTimeSettingTab } from "./settings";

export default class WorkingHoursPlugin extends Plugin {
  settings!: Settings;

  async onload() {
    await this.loadSettings();
    this.registerMarkdownCodeBlockProcessor(
      "workinghours",
      (source, block, ctx) => {
        const ObsStore = new ObsidianStore(
          this.app,
          ctx,
          block,
          readStore(source),
          this
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

    this.addSettingTab(new WorkingTimeSettingTab(this.app, this));

    this.registerEvent(
      this.app.vault.on("create", async (e) => {
        if (!(e instanceof TFile)) return;
        const contents = await this.app.vault.read(e);

        if (!contents.includes("```workinghours")) return;

        if (!e.parent) return;

        this.settings.tableRoots.set(
          e.parent?.path,
          e.parent?.children
            .filter(
              (child) => this.app.vault.getFolderByPath(child.path) !== null
            )
            .map((child) => child.name)
        );
      })
    );

    this.registerEvent(
      this.app.vault.on("modify", async (e) => {
        if (!(e instanceof TFile)) return;
        const contents = await this.app.vault.read(e);

        if (!contents.includes("```workinghours")) return;

        if (!e.parent) return;

        this.settings.tableRoots.set(
          e.parent?.path,
          e.parent?.children
            .filter(
              (child) => this.app.vault.getFolderByPath(child.path) !== null
            )
            .map((child) => child.name)
        );
      })
    );

    // this.registerEvent(this.app.vault.on("delete"))
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async onunload() {}
}
