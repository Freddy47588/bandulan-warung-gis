import { LAYER_CATALOG } from "./layers";
import type { BandulanDatasets, LayerId } from "../types/geo";

export async function loadBandulanDatasets(): Promise<BandulanDatasets> {
  const entries = await Promise.all(
    LAYER_CATALOG.map(async (meta) => {
      const response = await fetch(`/data/${meta.file}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${meta.file}: HTTP ${response.status}`);
      }
      const data = await response.json();
      return [meta.id, data] as [LayerId, unknown];
    }),
  );

  return Object.fromEntries(entries) as unknown as BandulanDatasets;
}
