import { BadRequestException } from "@nestjs/common";
import { TrackingEventType, TrackingPhase } from "@prisma/client";

/**
 * Determina la fase resultante tras un evento (null = sin cambio de fase, p.ej. NOTE).
 */
export function resolvePhaseAfterEvent(
  current: TrackingPhase,
  eventType: TrackingEventType
): TrackingPhase | null {
  if (eventType === TrackingEventType.NOTE) return null;

  const target = EVENT_TO_PHASE[eventType];
  if (!target) {
    throw new BadRequestException(`Event type ${eventType} is not mapped to a phase`);
  }

  if (!isTransitionAllowed(current, target, eventType)) {
    throw new BadRequestException(
      `Transition not allowed from ${current} with event ${eventType}`
    );
  }

  return target;
}

const EVENT_TO_PHASE: Partial<Record<TrackingEventType, TrackingPhase>> = {
  [TrackingEventType.CREATED]: TrackingPhase.CREATED,
  [TrackingEventType.RECEIVED]: TrackingPhase.RECEIVED,
  [TrackingEventType.DEPARTED]: TrackingPhase.IN_TRANSIT,
  [TrackingEventType.ARRIVED]: TrackingPhase.IN_TRANSIT,
  [TrackingEventType.IN_TRANSIT]: TrackingPhase.IN_TRANSIT,
  [TrackingEventType.CUSTOMS_IN]: TrackingPhase.IN_CUSTOMS,
  [TrackingEventType.CUSTOMS_CLEARED]: TrackingPhase.CLEARED,
  [TrackingEventType.OUT_FOR_DELIVERY]: TrackingPhase.OUT_FOR_DELIVERY,
  [TrackingEventType.DELIVERED]: TrackingPhase.DELIVERED,
  [TrackingEventType.EXCEPTION]: TrackingPhase.EXCEPTION,
};

/** Reglas mínimas de progresión; EXCEPTION puede ocurrir desde casi cualquier fase operativa. */
function isTransitionAllowed(
  current: TrackingPhase,
  target: TrackingPhase,
  eventType: TrackingEventType
): boolean {
  if (eventType === TrackingEventType.EXCEPTION) {
    return current !== TrackingPhase.DELIVERED && current !== TrackingPhase.RETURNED;
  }

  if (current === TrackingPhase.EXCEPTION || current === TrackingPhase.RETURNED) {
    return false;
  }

  const allowed: TrackingPhase[] = ALLOWED_NEXT[current] ?? [];
  return allowed.includes(target);
}

const ALLOWED_NEXT: Record<TrackingPhase, TrackingPhase[]> = {
  [TrackingPhase.CREATED]: [
    TrackingPhase.CREATED,
    TrackingPhase.RECEIVED,
    TrackingPhase.IN_TRANSIT,
    TrackingPhase.IN_CUSTOMS,
  ],
  [TrackingPhase.RECEIVED]: [
    TrackingPhase.RECEIVED,
    TrackingPhase.IN_TRANSIT,
    TrackingPhase.IN_CUSTOMS,
    TrackingPhase.OUT_FOR_DELIVERY,
  ],
  [TrackingPhase.IN_TRANSIT]: [
    TrackingPhase.IN_TRANSIT,
    TrackingPhase.IN_CUSTOMS,
    TrackingPhase.CLEARED,
    TrackingPhase.OUT_FOR_DELIVERY,
    TrackingPhase.DELIVERED,
  ],
  [TrackingPhase.IN_CUSTOMS]: [
    TrackingPhase.IN_CUSTOMS,
    TrackingPhase.CLEARED,
    TrackingPhase.IN_TRANSIT,
  ],
  [TrackingPhase.CLEARED]: [
    TrackingPhase.CLEARED,
    TrackingPhase.IN_TRANSIT,
    TrackingPhase.OUT_FOR_DELIVERY,
    TrackingPhase.DELIVERED,
  ],
  [TrackingPhase.OUT_FOR_DELIVERY]: [
    TrackingPhase.OUT_FOR_DELIVERY,
    TrackingPhase.DELIVERED,
    TrackingPhase.EXCEPTION,
  ],
  [TrackingPhase.DELIVERED]: [],
  [TrackingPhase.EXCEPTION]: [TrackingPhase.RETURNED, TrackingPhase.IN_TRANSIT, TrackingPhase.IN_CUSTOMS],
  [TrackingPhase.RETURNED]: [],
};
