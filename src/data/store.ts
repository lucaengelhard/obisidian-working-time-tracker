import { calcDuration, ObjTimeToStr } from "@/lib/datetime";
import {
  MarkdownPostProcessorContext,
  Notice,
  App as obisidianApp,
} from "obsidian";

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

const monthMap = {
  1: "Januar",
  2: "Februar",
  3: "März",
  4: "April",
  5: "Mai",
  6: "Juni",
  7: "Juli",
  8: "August",
  9: "September",
  10: "Oktober",
  11: "November",
  12: "Dezember",
};

type monthNr = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export function readStore(input: string) {
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

  async createTimesheet(overwrite = false) {
    const hourFile = this.app.vault.getFileByPath(this.ctx.sourcePath);
    const hoursBasePath = hourFile?.parent?.path;

    if (!hourFile) throw "File no longer exists";
    if (hoursBasePath === undefined) throw "No Path found";

    // const files = [];

    await Promise.all(
      Object.keys(this.store.projects).map(async (key) => {
        const project = this.store.projects[parseInt(key)];

        const tasks = Object.values(this.store.tasks).filter(
          (task) => task.project === parseInt(key)
        );

        const years: { [index: number]: { [index: number]: Task[] } } = {};

        tasks.forEach((task) => {
          const day = task.date.getDate();
          let month = task.date.getMonth() + 1;
          let year = task.date.getFullYear();

          if (day >= 20) month++;
          if (month === 0) year--;
          if (month === 13) year++;

          if (years[year] === undefined) years[year] = {};
          if (years[year][month] === undefined) years[year][month] = [];

          years[year][month].push(task);
        });

        await Promise.all(
          Object.keys(years).map(async (yearStr) => {
            const year = parseInt(yearStr);
            const yearFolderPath = `${hoursBasePath}/hours/${project}/${year}`;

            let yearFolder = this.app.vault.getFolderByPath(yearFolderPath);

            if (yearFolder === null)
              yearFolder = await this.app.vault.createFolder(yearFolderPath);

            await Promise.all(
              Object.keys(years[year]).map(async (monthStr) => {
                const month = parseInt(monthStr) as monthNr;
                const monthFilePath = `${yearFolderPath}/${month}-${monthMap[month]}.md`;

                const file = this.app.vault.getFileByPath(monthFilePath);

                const fileContent = createTimesheetMD(
                  year,
                  month,
                  project,
                  years[year][month]
                );

                if (overwrite && file)
                  await this.app.vault.modify(file, fileContent);

                if (file === null)
                  await this.app.vault.create(monthFilePath, fileContent);

                // const finalfile = this.app.vault.getFileByPath(monthFilePath);

                // if (finalfile) files.push([project, year, finalfile]);
              })
            );
          })
        );
      })
    );

    // await this.app.vault.append(hourFile, "\ntest\n");

    new Notice("Timesheets successfully created!");
  }
}

function createTimesheetMD(
  year: number,
  month: monthNr,
  project: string,
  tasks: Task[]
) {
  // TODO: Settings (Name, ...)

  const heading = `# Ben Engelhard - ${monthMap[month]} ${year}`;
  const subheading = `## ${project}`;
  const tablehead = "| Datum | Start | Ende | Dauer |";
  const tablesep = "| ----- | ----- | ---- | ----- |";
  const tablecontent = tasks
    .map((task) =>
      task.endTime
        ? `| ${task.date.toLocaleDateString()} | ${ObjTimeToStr(
            task.startTime
          )} | ${ObjTimeToStr(task.endTime)} | ${calcDuration(
            task.startTime,
            task.endTime
          )} | \n`
        : ""
    )
    .join("");

  const total = `Insgesamt: ${tasks.reduce(
    (prev, curr) =>
      prev +
      (curr.endTime
        ? parseFloat(calcDuration(curr.startTime, curr.endTime))
        : 0),
    0
  )}`;

  return [heading, subheading, tablehead, tablesep, tablecontent, total].join(
    "\n"
  );
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
