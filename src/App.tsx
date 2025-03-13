import { ObsidianStore } from "./data/store";

import { createContext } from "react";
import TaskTable from "./Table";
import Timesheet from "./Timesheet";

// eslint-disable-next-line react-refresh/only-export-components
export const ObsStoreContext = createContext<ObsidianStore | undefined>(
  undefined
);

function App({ store }: { store: ObsidianStore }) {
  return (
    <ObsStoreContext.Provider value={store}>
      <TaskTable />
      <Timesheet />
    </ObsStoreContext.Provider>
  );
}

export default App;
