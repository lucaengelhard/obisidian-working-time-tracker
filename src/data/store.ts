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

export function writeStore(input: Store) {
  tempStoreString.string = JSON.stringify(input);
  return tempStoreString.string;
}

export function updateStore(store: Store, tasks: Tasks, projects: Projects) {
  writeStore({
    ...store,
    tasks: { ...store.tasks, ...tasks },
    projects: { ...store.projects, ...projects },
  });
}

export function getNewId(obj: Tasks | Projects): number {
  return Math.max(...Object.keys(obj).map((key) => parseInt(key))) + 1;
}
