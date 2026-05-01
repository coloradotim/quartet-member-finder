import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("README and barbershop context", () => {
  it("orients contributors to product model, setup, and docs", () => {
    const readme = source("README.md");

    expect(readme).toContain("My Singer Profile");
    expect(readme).toContain("My Quartet Profile");
    expect(readme).toContain("Discovery requires sign-in");
    expect(readme).toContain("npm run lint");
    expect(readme).toContain("npm run typecheck");
    expect(readme).toContain("npm run test:run");
    expect(readme).toContain("npm run format:check");
    expect(readme).toContain("npm run build");
    expect(readme).toContain("docs/barbershop-context.md");
    expect(readme).toContain("docs/supabase-contract.md");
    expect(readme).toContain("docs/deployment.md");
  });

  it("keeps durable barbershop context linked from AGENTS", () => {
    const agents = source("AGENTS.md");
    const context = source("docs/barbershop-context.md");

    expect(agents).toContain("docs/barbershop-context.md");
    expect(context).toContain("chapters, rehearsals");
    expect(context).toContain("conventions, afterglows");
    expect(context).toContain("TTBB barbershop parts are Tenor");
    expect(context).toContain("Baritone, and Bass");
    expect(context).toContain("Lead is the melody");
    expect(context).toContain("preserves voicing context");
    expect(context).toContain("Discovery requires sign-in");
    expect(context).toContain("not a dating app");
    expect(context).toContain("reports are reviewed as able");
    expect(context).toContain("not in real time");
  });
});
