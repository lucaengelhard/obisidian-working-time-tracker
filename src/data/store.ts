import { MarkdownPostProcessorContext, App as obisidianApp } from "obsidian";
import { tempStoreString } from "./storestring";

export type Projects = { [index: number]: string };

export type SimpleTime = { hours: number; minutes: number };

export type Task = {
  id: number;
  title: string;
  project: number;
  date: Date;
  startTime: SimpleTime;
  endTime?: SimpleTime;
  banked?: boolean;
};

export type Tasks = { [index: number]: Task };

export type Store = {
  projects: Projects;
  tasks: Tasks;
};

export function readStore(input?: string) {
  if (input === undefined) input = tempStoreString.string;

  return JSON.parse(input, (key, value) => {
    if (key === "date") {
      return new Date(value);
    }

    return value;
  }) as Store;
}

export async function writeObsidianStore(
  input: Store,
  app: obisidianApp,
  ctx: MarkdownPostProcessorContext,
  block: HTMLElement
) {
  const sectionInfo = ctx.getSectionInfo(block);

  if (sectionInfo === null) throw new Error("Section to write did not exist");

  const file = app.vault.getFileByPath(ctx.sourcePath);

  if (file === null) throw new Error("File no longer exists");

  const linestart = sectionInfo.lineStart;
  const lineend = sectionInfo.lineEnd;

  await app.vault.process(file, (data) =>
    replaceTimekeepCodeblock(input, data, linestart, lineend)
  );
}

export class ObsidianStore {
  app: obisidianApp;
  ctx: MarkdownPostProcessorContext;
  block: HTMLElement;
  store: Store;
  constructor(
    app: obisidianApp,
    ctx: MarkdownPostProcessorContext,
    block: HTMLElement,
    store: Store
  ) {
    this.app = app;
    this.ctx = ctx;
    this.block = block;
    this.store = store;
  }

  async save(input: Store) {
    await writeObsidianStore(input, this.app, this.ctx, this.block);
  }

  async update(store: Store, tasks: Tasks, projects: Projects) {
    await writeObsidianStore(
      {
        ...store,
        tasks: { ...store.tasks, ...tasks },
        projects: { ...store.projects, ...projects },
      },
      this.app,
      this.ctx,
      this.block
    );
  }
}

export function replaceTimekeepCodeblock(
  input: Store,
  content: string,
  lineStart: number,
  lineEnd: number
) {
  const inputStr = JSON.stringify(input);

  // The actual JSON is the line after the code block start
  const contentStart = lineStart + 1;
  const contentLength = lineEnd - contentStart;

  // Split the content into lines
  const lines = content.split("\n");

  // Sanity checks to prevent overriding content
  if (!lines[lineStart].startsWith("```")) {
    throw new Error(
      "Content workinghours out of sync, line number for codeblock start doesn't match: " +
        content[lineStart]
    );
  }

  if (!lines[lineEnd].startsWith("```")) {
    throw new Error(
      "Content workinghours out of sync, line number for codeblock end doesn't match" +
        content[lineEnd]
    );
  }

  // Splice the new JSON content in between the codeblock, removing the old codeblock lines
  lines.splice(contentStart, contentLength, inputStr);

  return lines.join("\n");
}

export function getNewId(obj: Tasks | Projects): number {
  if (Object.keys(obj).length === 0) return 0;
  return Math.max(...Object.keys(obj).map((key) => parseInt(key))) + 1;
}
