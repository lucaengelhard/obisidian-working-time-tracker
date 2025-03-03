export type Chunk = {
  title: string;
  project: number;
  date: Date;
  startTime: number;
  endTime?: number;
  bank: boolean;
};

export type Projects = {
  [index: number]: string;
};

export type Store = { chunks: Array<Chunk>; projects: Projects };

export function readStore(input: string): Store {
  const parsed = JSON.parse(input) as Store;

  //TODO: typechecks

  let chunks = parsed.chunks;
  chunks = chunks.map((chunk) => {
    return {
      ...chunk,
      date: new Date(chunk.date),
    };
  });

  return { projects: parsed.projects, chunks };
}

export function writeStore(input: Store) {
  return JSON.stringify(input);
}

export function updateStore(input: Store) {
  console.log(writeStore(input));
}

export function reverseProjects(projects: Projects) {
  return Object.fromEntries(
    Object.entries(projects).map(([key, value]) => [value, key])
  );
}

const teststore: Store = {
  chunks: [
    {
      title: "test1",
      bank: false,
      project: 1,
      date: new Date("2025-02-03 10:00:00"),
      startTime: 10,
      endTime: 15,
    },
    {
      title: "test1",
      bank: false,
      project: 1,
      date: new Date("2025-02-03 10:00:00"),
      startTime: 10,
      endTime: 15.25,
    },
    {
      title: "test1",
      bank: false,
      project: 1,
      date: new Date("2025-02-03 10:00:00"),
      startTime: 10,
    },
  ],
  projects: { 1: "eea", 2: "test" },
};

export const store = readStore(writeStore(teststore));

export const reversedProjects = reverseProjects(store.projects);
