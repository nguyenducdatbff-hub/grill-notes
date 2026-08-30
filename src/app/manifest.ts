import type { MetadataRoute } from "next";
import { buildManifest } from "@/lib/pwa";

export default function manifest(): MetadataRoute.Manifest {
  return buildManifest(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000") as MetadataRoute.Manifest;
}
