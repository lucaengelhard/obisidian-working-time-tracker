// import { useState } from "react";
// import TaskTable from "./Table";
import { MarkdownPostProcessorContext, App as obsidianApp } from "obsidian";
import { ObsidianStore, Store } from "./data/store";

import { createContext } from "react";
import TaskTable from "./Table";
import Timesheet from "./Timesheet";

// eslint-disable-next-line react-refresh/only-export-components
export const ObsStoreContext = createContext<ObsidianStore | undefined>(
  undefined
);

function App({
  store,
  app,
  block,
  ctx,
}: {
  store: Store;
  app: obsidianApp;
  ctx: MarkdownPostProcessorContext;
  block: HTMLElement;
}) {
  const ObsStore = new ObsidianStore(app, ctx, block, store);

  return (
    <ObsStoreContext.Provider value={ObsStore}>
      <TaskTable />
      <Timesheet />
    </ObsStoreContext.Provider>
  );
}

export default App;
