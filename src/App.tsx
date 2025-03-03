import { useState } from "react";
import TaskTable from "./Table";
import { readStore } from "./data/store";
import { tempStoreString } from "./data/storestring";

function App() {
  const [store, setStore] = useState(readStore(tempStoreString.string));

  function onStoreUpdate() {
    setStore(readStore());
  }

  return <TaskTable store={store} onStoreUpdate={onStoreUpdate} />;
}

export default App;
