"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type Simulation, type SimulationNodeDatum } from "d3-force";
import { select } from "d3-selection";
import { zoom } from "d3-zoom";

type GNode = SimulationNodeDatum & { id: string; title: string; links: number };
type GLink = { source: string; target: string };
type GLinkDatum = { source: GNode; target: GNode };

export function KnowledgeGraph() {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GNode[]>([]);
  const [links, setLinks] = useState<GLink[]>([]);
  const [size] = useState({ w: 800, h: 500 });

  useEffect(() => {
    fetch("/api/graph").then((r) => r.json()).then((g) => {
      setNodes(g.nodes);
      setLinks(g.links);
    });
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el || nodes.length === 0) return;
    const sim: Simulation<GNode, GLink> = forceSimulation(nodes)
      .force("link", forceLink<GNode, GLink>(links).id((d) => d.id).distance(90))
      .force("charge", forceManyBody().strength(-220))
      .force("center", forceCenter(size.w / 2, size.h / 2))
      .force("collide", forceCollide<GNode>(18));

    const lineSel = select(el).selectAll("line").data(links);
    lineSel.join("line").attr("stroke", "#a1a1aa");
    const circleSel = select(el).selectAll("circle").data(nodes);
    const circle = circleSel.join("circle")
      .attr("r", (d) => 6 + Math.min(14, d.links * 2))
      .attr("fill", "#171717")
      .style("cursor", "pointer")
      .on("click", (_e, d) => router.push(`/app/notes/${d.id}`));
    circle.append("title").text((d) => d.title);

    const labelSel = select(el).selectAll("text").data(nodes);
    labelSel.join("text")
      .attr("dx", 12).attr("dy", 4)
      .style("font-size", "11px")
      .style("pointer-events", "none")
      .text((d) => d.title);

    sim.on("tick", () => {
      select(el).selectAll<SVGLineElement, GLinkDatum>("line")
        .attr("x1", (d) => d.source.x!).attr("y1", (d) => d.source.y!)
        .attr("x2", (d) => d.target.x!).attr("y2", (d) => d.target.y!);
      select(el).selectAll<SVGCircleElement, GNode>("circle").attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      select(el).selectAll<SVGTextElement, GNode>("text").attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    select(el).call(zoom<SVGSVGElement, unknown>().on("zoom", (e) => {
      select(el).select("g").attr("transform", e.transform);
    }));

    return () => {
      sim.stop();
    };
  }, [nodes, links, size, router]);

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-900 dark:bg-neutral-900">
      <svg ref={svgRef} viewBox={`0 0 ${size.w} ${size.h}`} className="h-[500px] w-full">
        <g />
      </svg>
      {nodes.length === 0 && <p className="pb-8 text-center text-neutral-400">No notes yet — create notes with [[backlinks]] to grow your graph.</p>}
    </div>
  );
}
