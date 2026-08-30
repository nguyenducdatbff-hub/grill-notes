export type TaskRow = { id: string; title: string; done: boolean; position: number };

export function orderTasks(rows: TaskRow[]): TaskRow[] {
  return [...rows].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.position - b.position;
  });
}
