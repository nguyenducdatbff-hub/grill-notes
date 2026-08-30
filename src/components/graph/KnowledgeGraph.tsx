"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force";
import { drag } from "d3-drag";
import { select } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import "d3-transition";
import { AlertTriangle, Loader2, Maximize2, Plus } from "lucide-react";
import { fitTransform, truncateLabel } from "@/lib/graph";

type GNode = SimulationNodeDatum & { id: string; title: string; links: number };
type GLink = { source: string; target: string };
type GLinkDatum = { source: GNode; target: GNode };
type LoadState = "loading" | "error" | "ready";

const MAX_LABEL = 30;
const LINK_OPACITY = 0.45;
const DIM_OPACITY = 0.12;

function radius(d: GNode) {
  return 6 + Math.min(12, d.links * 1.6);
}

export function KnowledgeGraph() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ReturnType<typeof zoom<SVGSVGElement, unknown>> | null>(null);
  const [size, setSize] = useState({ w: 800, h: 500 });
  const [data, setData] = useState<{ nodes: GNode[]; links: GLink[] } | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");
  const [loadKey, setLoadKey] = useState(0);

  function showTooltip(event: MouseEvent, d: GNode) {
    const t = tooltipRef.current;
    if (!t) return;
    t.style.display = "block";
    t.style.left = `${event.clientX + 12}px`;
    t.style.top = `${event.clientY + 12}px`;
    t.textContent = `${d.title} ﾂｷ ${d.links} ${d.links === 1 ? "link" : "links"}`;
  }

  function hideTooltip() {
    const t = tooltipRef.current;
    if (t) t.style.display = "none";
  }

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/graph", { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((g: { nodes: GNode[]; links: GLink[] }) => {
        setData(g);
        setStatus("ready");
      })
      .catch((e: unknown) => {
        if ((e as Error).name === "AbortError") return;
        setStatus("error");
      });
    return () => ctrl.abort();
  }, [loadKey]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w < 80) return;
      const h = Math.max(320, Math.min(560, Math.round(w * 0.62)));
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 8])
      .filter((event: Event) => {
        if (event.type === "dblclick") {
          const target = (event as MouseEvent).target as Element | null;
          if (target && target.closest("circle, text")) return false;
        }
        return true;
      })
      .on("zoom", (e) => {
        select(el).select<SVGGElement>("g").attr("transform", e.transform);
        const k = e.transform.k;
        select(el)
          .selectAll<SVGTextElement, GNode>("text")
          .attr("opacity", Math.min(1, Math.max(0, (k - 0.4) / 0.5)));
        hideTooltip();
      });
    zoomRef.current = z;
    select(el).call(z);
    return () => {
      select(el).on(".zoom", null);
      zoomRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el || !data || data.nodes.length === 0) return;
    const { nodes, links } = data;

    const sim: Simulation<GNode, GLink> = forceSimulation(nodes)
      .force("link", forceLink<GNode, GLink>(links).id((d) => d.id).distance(90))
      .force("charge", forceManyBody().strength(-240))
      .force("center", forceCenter(size.w / 2, size.h / 2))
      .force("collide", forceCollide<GNode>(22));
    if (nodes.some((n) => typeof n.x === "number")) sim.alpha(0.4).restart();

    const g = select(el).select<SVGGElement>("g");
    g.selectAll("*").remove();

    const lineSel = g
      .selectAll<SVGLineElement, GLinkDatum>("line")
      .data(links as unknown as GLinkDatum[])
      .join("line")
      .attr("stroke", "var(--muted)")
      .attr("stroke-opacity", LINK_OPACITY)
      .attr("stroke-width", 1);

    const circleSel = g
      .selectAll<SVGCircleElement, GNode>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", radius)
      .attr("fill", "var(--text)")
      .attr("stroke", "var(--surface)")
      .attr("stroke-width", 1.5)
      .attr("tabindex", 0)
      .attr("role", "link")
      .attr("aria-label", (d) => d.title)
      .style("cursor", "pointer")
      .style("outline", "none")
      .on("click", (event, d) => {
        if (event.ctrlKey || event.metaKey) {
          window.open(`/app/notes/${d.id}`, "_blank");
          return;
        }
        router.push(`/app/notes/${d.id}`);
      })
      .on("keydown", (event, d) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/app/notes/${d.id}`);
        }
      });

    const labelSel = g
      .selectAll<SVGTextElement, GNode>("text")
      .data(nodes)
      .join("text")
      .attr("dx", 14)
      .attr("dy", 4)
      .attr("fill", "var(--muted)")
      .attr("font-size", 11)
      .attr("aria-hidden", "true")
      .style("pointer-events", "none")
      .text((d) => truncateLabel(d.title, MAX_LABEL));

    const neighbors = new Map<string, Set<string>>();
    for (const l of links as unknown as GLinkDatum[]) {
      const a = l.source.id;
      const b = l.target.id;
      if (!neighbors.has(a)) neighbors.set(a, new Set([a]));
      if (!neighbors.has(b)) neighbors.set(b, new Set([b]));
      neighbors.get(a)!.add(b);
      neighbors.get(b)!.add(a);
    }

    const setFocus = (id: string | null) => {
      if (id === null) {
        circleSel.attr("opacity", 1).attr("r", radius);
        labelSel.attr("opacity", 1);
        lineSel.attr("stroke-opacity", LINK_OPACITY).attr("stroke-width", 1);
        return;
      }
      const nb = neighbors.get(id) ?? new Set([id]);
      nb.add(id);
      circleSel
        .attr("opacity", (d) => (nb.has(d.id) ? 1 : DIM_OPACITY))
        .attr("r", (d) => (d.id === id ? radius(d) * 1.35 : radius(d)));
      labelSel.attr("opacity", (d) => (nb.has(d.id) ? 1 : DIM_OPACITY));
      lineSel
        .attr("stroke-opacity", (l) => (nb.has(l.source.id) && nb.has(l.target.id) ? LINK_OPACITY : 0.06))
        .attr("stroke-width", (l) => (l.source.id === id || l.target.id === id ? 1.8 : 1));
    };

    circleSel
      .on("mouseenter", (event, d) => {
        setFocus(d.id);
        showTooltip(event, d);
      })
      .on("mouseleave", () => {
        setFocus(null);
        hideTooltip();
      })
      .on("focus", (_e, d) => setFocus(d.id))
      .on("blur", () => setFocus(null));

    const dragBehavior = drag<SVGCircleElement, GNode>()
      .clickDistance(5)
      .on("start", (event, d) => {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        hideTooltip();
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        setFocus(null);
      });
    circleSel.call(dragBehavior);

    sim.on("tick", () => {
      g.selectAll<SVGLineElement, GLinkDatum>("line")
        .attr("x1", (d) => d.source.x!)
        .attr("y1", (d) => d.source.y!)
        .attr("x2", (d) => d.target.x!)
        .attr("y2", (d) => d.target.y!);
      g.selectAll<SVGCircleElement, GNode>("circle").attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      g.selectAll<SVGTextElement, GNode>("text").attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    return () => {
      sim.stop();
      hideTooltip();
    };
  }, [data, size, router]);

  function fitView() {
    const el = svgRef.current;
    const z = zoomRef.current;
    if (!el || !z || !data || data.nodes.length === 0) return;
    const t = fitTransform(data.nodes, size.w, size.h);
    select(el).transition().duration(400).call(z.transform, zoomIdentity.translate(t.x, t.y).scale(t.k));
  }

  async function createNote() {
    const res = await fetch("/api/notes", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    if (!res.ok) return;
    const note = await res.json();
    router.push(`/app/notes/${note.id}`);
  }

  return (
    <div ref={cardRef} className="mx-auto w-full max-w-5xl overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <div ref={tooltipRef} className="pointer-events-none fixed z-50 hidden max-w-72 truncate rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text)] shadow-lg" />
      {status === "loading" && (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-[var(--muted)]">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading graph窶ｦ</span>
        </div>
      )}
      {status === "error" && (
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-[var(--muted)]">
          <AlertTriangle size={20} />
          <span className="text-sm">Could not load the graph.</span>
          <button
            onClick={() => {
              setStatus("loading");
              setLoadKey((k) => k + 1);
            }}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white dark:bg-neutral-100 dark:text-black"
          >
            Retry
          </button>
        </div>
      )}
      {status === "ready" && data && data.nodes.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2">
            <span className="text-xs text-[var(--muted)]">
              {data.nodes.length} {data.nodes.length === 1 ? "note" : "notes"} ﾂｷ {data.links.length}{" "}
              {data.links.length === 1 ? "link" : "links"} ﾂｷ {data.nodes.filter((n) => n.links === 0).length} isolated
            </span>
            <button
              onClick={fitView}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--text)]"
            >
              <Maximize2 size={12} /> Fit view
            </button>
          </div>
          <svg ref={svgRef} viewBox={`0 0 ${size.w} ${size.h}`} className="w-full" style={{ height: size.h }} role="img" aria-label="Knowledge graph of your notes">
            <g />
          </svg>
          <p className="border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--muted)]">
            Drag to move nodes ﾂｷ scroll or pinch to zoom ﾂｷ click a node to open it
          </p>
        </>
      )}
      {status === "ready" && data && data.nodes.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">No notes yet 窶・create notes with [[backlinks]] to grow your graph.</p>
          <button
            onClick={createNote}
            className="flex items-center gap-1 rounded-md bg-neutral-900 px-3 py-2 text-sm text-white dark:bg-neutral-100 dark:text-black"
          >
            <Plus size={16} /> New note
          </button>
        </div>
      )}
    </div>
  );
}
