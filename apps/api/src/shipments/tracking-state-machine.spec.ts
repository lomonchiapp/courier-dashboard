import { TrackingEventType, TrackingPhase } from "@prisma/client";
import { resolvePhaseAfterEvent } from "./tracking-state-machine";

describe("resolvePhaseAfterEvent", () => {
  it("moves CREATED to RECEIVED with RECEIVED event", () => {
    expect(resolvePhaseAfterEvent(TrackingPhase.CREATED, TrackingEventType.RECEIVED)).toBe(
      TrackingPhase.RECEIVED
    );
  });

  it("NOTE does not change phase", () => {
    expect(resolvePhaseAfterEvent(TrackingPhase.IN_TRANSIT, TrackingEventType.NOTE)).toBeNull();
  });
});
