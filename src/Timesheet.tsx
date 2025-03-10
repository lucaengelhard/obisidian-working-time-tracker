import { useContext, useMemo, useState } from "react";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import { ObsStoreContext } from "./App";

export default function Timesheet() {
  const [overwrite, setOverwrite] = useState(false);
  const ObsStore = useContext(ObsStoreContext);
  const store = useMemo(() => ObsStore?.store, [ObsStore?.store]);

  if (!ObsStore) return <div>Problem with internals: ObsStore missing</div>;
  if (!store) return <div>Problem with internals: store missing</div>;

  return (
    <div className="p-2 flex gap-4">
      <Button
        onClick={() => setOverwrite(!overwrite)}
        className={cn(overwrite ? "!bg-green-500 !text-white" : "")}
      >
        Overwrite existing
      </Button>
      <Button
        onClick={() => ObsStore.createTimesheet(overwrite)}
        className="cursor-pointer"
      >
        Create Timesheets
      </Button>
    </div>
  );
}
