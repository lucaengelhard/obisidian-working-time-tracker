import { Edit, PlusCircle, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Chunk, reversedProjects, store, updateStore } from "./data/store";
import { ObjTimeToPrimHours, primHoursToStrhours } from "./lib/datetime";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { useEffect, useRef, useState } from "react";

import { DateTimePicker, TimePicker } from "./components/datetime";

function App() {
  return (
    <Table>
      <TableCaption>Stundentracking</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Projekt</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Backlog</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {store.chunks.map((chunk) => (
          <TableRow key={chunk.title + chunk.startTime}>
            <TableCell>{chunk.title}</TableCell>
            <TableCell>{store.projects[chunk.project]}</TableCell>
            <TableCell>{chunk.date.toLocaleDateString()}</TableCell>
            <TableCell>{`${primHoursToStrhours(chunk.startTime)} - ${
              chunk.endTime ? primHoursToStrhours(chunk.endTime) : ""
            }`}</TableCell>
            <TableCell>
              {chunk.endTime ? chunk.endTime - chunk.startTime : null}
            </TableCell>
            <TableCell>
              <input type="checkbox" defaultChecked={chunk.bank} />
            </TableCell>
            <TableCell className="flex gap-4">
              <Button variant="outline" size="icon" className="cursor-pointer">
                <Edit />
              </Button>
              <Button variant="outline" size="icon" className="cursor-pointer">
                <Trash2 />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        <NewItem />
      </TableBody>
    </Table>
  );
}

function NewItem() {
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState<{ h: number; m: number }>();
  const [endTime, setEndTime] = useState<{ h: number; m: number }>();
  const [task, setTask] = useState<string>();
  const [projectOps, setProjectOps] = useState<Array<number>>();
  const [project, setProject] = useState<number>();
  const [bank, setBank] = useState(false);

  const projRef = useRef<HTMLInputElement>(null);

  function createNewChunk() {
    if (
      project === undefined ||
      task === undefined ||
      date === undefined ||
      startTime === undefined
    )
      return;

    const newChunk: Chunk = {
      title: task,
      date,
      startTime: ObjTimeToPrimHours(startTime),
      endTime: endTime && ObjTimeToPrimHours(endTime),
      project,
      bank,
    };

    updateStore({ ...store, chunks: [...store.chunks, newChunk] });
  }

  function onProjectInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === "") {
      setProjectOps(undefined);
      return;
    }
    const options = Object.values(store.projects).filter((proj) =>
      proj.includes(e.target.value)
    );

    setProjectOps(options.map((op) => parseInt(reversedProjects[op])));
  }

  useEffect(() => {
    if (!projRef.current) return;
    if (project === undefined) return;
    projRef.current.value = store.projects[project];
  }, [project]);

  return (
    <TableRow>
      <TableCell>
        <Input onChange={(e) => setTask(e.target.value)} placeholder="Task" />
      </TableCell>
      <TableCell>
        <Input onChange={onProjectInput} ref={projRef} placeholder="Project" />
        {projectOps && (
          <div className="fixed shadow p-2">
            {projectOps.length != 0 && (
              <div className="flex gap-4">
                {projectOps.map((op) => (
                  <div
                    onClick={() => {
                      setProject(op);
                      setProjectOps(undefined);
                    }}
                    className="cursor-pointer p-2 rounded-lg text-center hover:bg-gray-200"
                  >
                    {store.projects[op]}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </TableCell>
      <TableCell>
        <DateTimePicker onDateChange={setDate} />
      </TableCell>
      <TableCell>
        <TimePicker onTimeChange={setStartTime} />
      </TableCell>
      <TableCell>
        <TimePicker onTimeChange={setEndTime} />
      </TableCell>
      <TableCell>
        <input onChange={(e) => setBank(e.target.checked)} type="checkbox" />
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="icon"
          onClick={createNewChunk}
          className="cursor-pointer"
        >
          <PlusCircle />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default App;
