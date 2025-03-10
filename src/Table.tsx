import { Edit, Plus, Trash2, X } from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { getNewId, SimpleTime, Task } from "./data/store";
import { calcDuration, ObjTimeToPrimHours, ObjTimeToStr } from "./lib/datetime";
import { Input } from "./components/ui/input";
import { DatePicker, TimePicker } from "./components/Datepicker";
import { useContext, useMemo, useRef, useState } from "react";
import { ObsStoreContext } from "./App";
import { Popover } from "./components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";

export default function TaskTable() {
  const ObsStore = useContext(ObsStoreContext);

  const [newDate, setNewDate] = useState<Date>();
  const [newStartTime, setNewStartTime] = useState<SimpleTime>();
  const [newEndTime, setNewEndTime] = useState<SimpleTime>();
  const [newTitle, setNewTitle] = useState<string>();
  const [possibleProjs, setPossibleProjs] = useState<Array<number>>();
  const [newProject, setNewProject] = useState<number>();
  const [newBanked, setNewBanked] = useState(false);

  const projRef = useRef<HTMLInputElement>(null);

  const store = useMemo(() => ObsStore?.store, [ObsStore?.store]);
  const sortedTasks = useMemo(() => {
    if (store) {
      return Object.values(store.tasks).sort((a, b) => {
        const datediff = a.date.getTime() - b.date.getTime();
        if (datediff !== 0) return datediff;

        return (
          ObjTimeToPrimHours(a.startTime) - ObjTimeToPrimHours(b.startTime)
        );
      });
    }
  }, [store]);

  if (!ObsStore) return <div>Problem with internals: ObsStore missing</div>;
  if (!store) return <div>Problem with internals: store missing</div>;

  function onProjUpdate(e: React.ChangeEvent<HTMLInputElement>) {
    if (!store) return;
    const query = e.target.value;

    if (query === "") {
      setPossibleProjs(undefined);
      setNewProject(undefined);
      return;
    }

    setPossibleProjs(
      Object.values(store.projects)
        .map((value, i) =>
          value.includes(query)
            ? parseInt(Object.keys(store.projects)[i])
            : null
        )
        .filter((v) => v !== null)
    );
  }

  async function onAdd() {
    if (!store || !ObsStore) return;

    if (
      newTitle === undefined ||
      newDate === undefined ||
      newStartTime === undefined
    )
      return;
    let proj = newProject;
    let projName = "";
    let newProjFlag = false;

    // TODO: BUGGY
    if (proj === undefined && projRef.current) {
      newProjFlag = true;
      projName = projRef.current.value;
      proj = getNewId(store.projects);
    }

    if (
      proj !== undefined &&
      projRef.current &&
      store.projects[proj] !== projRef.current.value
    ) {
      newProjFlag = true;
      projName = projRef.current.value;
      proj = getNewId(store.projects);
    }

    if (proj === undefined) return;

    const newTask: Task = {
      id: getNewId(store.tasks),
      title: newTitle,
      date: newDate,
      project: proj,
      startTime: newStartTime,
      endTime: newEndTime,
      banked: newBanked,
    };

    await ObsStore.save({
      ...store,
      tasks: { ...store.tasks, [newTask.id]: newTask },
      projects: !newProjFlag
        ? { ...store.projects }
        : { ...store.projects, [proj]: projName },
    });
  }

  async function deleteTask(id: number) {
    if (!store || !ObsStore) return;
    if (store.tasks[id] === undefined) return;

    delete store.tasks[id];

    ObsStore.save({ ...store, tasks: { ...store.tasks } });

    //TODO Clean Delete
  }

  function deleteProject(id: number) {
    if (!store || !ObsStore) return;
    if (store.projects[id] === undefined) return;
    if (
      Object.values(store.tasks).find((el) => el.project === id) !== undefined
    )
      return;

    delete store.projects[id];
    ObsStore.save({ ...store, projects: { ...store.projects } });
  }

  return (
    <Table>
      <TableCaption>Stundenzettel</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Banked</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <Input onChange={(e) => setNewTitle(e.target.value)} />
          </TableCell>
          <TableCell className="p-2 relative">
            <Popover
              open={possibleProjs && possibleProjs.length !== 0}
              modal={false}
            >
              <PopoverTrigger asChild>
                <div>
                  <Input ref={projRef} onChange={onProjUpdate} />
                </div>
              </PopoverTrigger>
              {possibleProjs && (
                <PopoverContent onOpenAutoFocus={(e) => e.preventDefault()}>
                  <div className="bg-white border max-w-full shadow rounded-md  flex gap-4 mt-2">
                    {possibleProjs.map((p, i) => {
                      return (
                        i <= 2 && (
                          <div className="hover:bg-gray-100  p-2 select-none cursor-pointer flex gap-2 items-center">
                            <span
                              onClick={() => {
                                setNewProject(p);
                                setPossibleProjs(undefined);

                                if (projRef.current) {
                                  projRef.current.value = store.projects[p];
                                }
                              }}
                            >
                              {store.projects[p]}
                            </span>
                            <X
                              className="hover:bg-red-400"
                              onClick={() => deleteProject(p)}
                              size={15}
                            />
                          </div>
                        )
                      );
                    })}
                  </div>
                </PopoverContent>
              )}
            </Popover>
          </TableCell>
          <TableCell>
            <DatePicker onDateChange={setNewDate} />
          </TableCell>
          <TableCell>
            <TimePicker onTimeChange={setNewStartTime} />
          </TableCell>
          <TableCell>
            <TimePicker onTimeChange={setNewEndTime} />
          </TableCell>
          <TableCell>
            {newStartTime !== undefined &&
              newEndTime !== undefined &&
              calcDuration(newStartTime, newEndTime)}
          </TableCell>
          <TableCell className="!text-center !align-middle">
            <input
              type="checkbox"
              defaultChecked={newBanked}
              onChange={(e) => setNewBanked(e.target.checked)}
            />
          </TableCell>
          <TableCell>
            <Button variant="outline" onClick={onAdd}>
              <Plus />
            </Button>
          </TableCell>
        </TableRow>
        {sortedTasks &&
          sortedTasks.map((task) => {
            const id = task.id;

            return (
              <TableRow key={id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{store.projects[task.project]}</TableCell>
                <TableCell>{task.date.toLocaleDateString()}</TableCell>
                <TableCell>{ObjTimeToStr(task.startTime)}</TableCell>
                <TableCell>
                  {task.endTime && ObjTimeToStr(task.endTime)}
                </TableCell>
                <TableCell>
                  {task.endTime && calcDuration(task.startTime, task.endTime)}
                </TableCell>
                <TableCell className="!text-center !align-middle">
                  <input type="checkbox" defaultChecked={task.banked} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-4">
                    <Button variant="outline">
                      <Edit />
                    </Button>
                    <Button variant="outline" onClick={() => deleteTask(id)}>
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
