import { KnowledgeGraph } from "@/components/graph/KnowledgeGraph";

export default function GraphPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Knowledge graph</h1>
      <KnowledgeGraph />
    </div>
  );
}
