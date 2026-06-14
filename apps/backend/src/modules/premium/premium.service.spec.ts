import { describe, expect, it } from "vitest";
import { InMemoryPremiumStore } from "./adapters/in-memory-premium.store";
import { PremiumService } from "./premium.service";

function setup() {
  const store = new InMemoryPremiumStore();
  const service = new PremiumService(store);
  return { store, service };
}

describe("PremiumService", () => {
  it("reports free with no grant", async () => {
    const { service } = setup();
    const center = await service.getCenter("s1");
    expect(center.status).toBe("free");
    expect(center.expiresAt).toBeNull();
    expect(center.pendingRequest).toBe(false);
  });

  it("reports premium for an active grant with a future expiry", async () => {
    const { store, service } = setup();
    const expiresAt = new Date(Date.now() + 86_400_000);
    store.setGrant("s1", { status: "active", expiresAt });
    const center = await service.getCenter("s1");
    expect(center.status).toBe("premium");
    expect(center.expiresAt).toBe(expiresAt.toISOString());
  });

  it("reports premium for an active grant with no expiry", async () => {
    const { store, service } = setup();
    store.setGrant("s1", { status: "active", expiresAt: null });
    expect((await service.getCenter("s1")).status).toBe("premium");
  });

  it("reports grace for an active grant past its expiry", async () => {
    const { store, service } = setup();
    store.setGrant("s1", { status: "active", expiresAt: new Date(Date.now() - 1000) });
    expect((await service.getCenter("s1")).status).toBe("grace");
  });

  it("reports free for an expired or revoked grant", async () => {
    const { store, service } = setup();
    store.setGrant("s1", { status: "expired", expiresAt: new Date(Date.now() - 1000) });
    expect((await service.getCenter("s1")).status).toBe("free");
  });

  it("surfaces a pending request flag", async () => {
    const { store, service } = setup();
    store.setPending("s1");
    expect((await service.getCenter("s1")).pendingRequest).toBe(true);
  });

  it("creates a pending request once and is idempotent-ish on repeat", async () => {
    const { service } = setup();
    expect((await service.requestPremium("s1")).created).toBe(true);
    expect((await service.requestPremium("s1")).created).toBe(false);
  });
});
