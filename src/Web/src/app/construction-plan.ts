export type ActivityStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Delayed';

export interface ConstructionActivity {
  id: string;
  phaseId: string;
  name: string;
  status: ActivityStatus;
  progress: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  assignedTo: string;
  estimatedCost: number;
  actualCost: number;
  notes: string;
  isOptional: boolean;
  isConditional: boolean;
  isEnabled: boolean;
  sequence: number;
  floorLevel?: string;
}

export interface ConstructionPhase {
  id: string;
  name: string;
  description: string;
  activities: ConstructionActivity[];
}

function activity(
  id: string,
  phaseId: string,
  name: string,
  sequence: number,
  flags?: { optional?: boolean; conditional?: boolean; enabled?: boolean },
): ConstructionActivity {
  return {
    id,
    phaseId,
    name,
    sequence,
    status: 'Not Started',
    progress: 0,
    plannedStartDate: '',
    plannedEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    assignedTo: '',
    estimatedCost: 0,
    actualCost: 0,
    notes: '',
    isOptional: flags?.optional ?? false,
    isConditional: flags?.conditional ?? false,
    isEnabled: flags?.enabled ?? true,
  };
}

export const createDefaultConstructionPhases = (): ConstructionPhase[] => [
  {
    id: 'A',
    name: 'Foundation / Substructure',
    description: 'Site preparation, substructure, and foundation works.',
    activities: [
      activity('A1', 'A', 'Site preparation', 1),
      activity('A2', 'A', 'Set out', 2),
      activity('A3', 'A', 'Excavation', 3),
      activity('A4', 'A', 'Foundation PCC', 4, { optional: true, conditional: true }),
      activity('A5', 'A', 'RR Foundation', 5, { optional: true, conditional: true }),
      activity('A6', 'A', 'Soiling', 6),
      activity('A7', 'A', 'RR Basement', 7),
      activity('A8', 'A', 'RCC Belt', 8),
      activity('A9', 'A', 'DPC', 9),
      activity('A10', 'A', 'Column footing', 10, { optional: true, conditional: true, enabled: false }),
      activity('A11', 'A', 'Footing reinforcement', 11, { optional: true, conditional: true, enabled: false }),
      activity('A12', 'A', 'Footing concreting', 12, { optional: true, conditional: true, enabled: false }),
      activity('A13', 'A', 'Piling', 13, { optional: true, conditional: true, enabled: false }),
      activity('A14', 'A', 'Pile cap', 14, { optional: true, conditional: true, enabled: false }),
      activity('A15', 'A', 'Retaining wall', 15, { optional: true, conditional: true, enabled: false }),
    ],
  },
  {
    id: 'B',
    name: 'Plinth',
    description: 'Plinth filling, compaction, and finishing prep works.',
    activities: [
      activity('B1', 'B', 'Backfilling', 1),
      activity('B2', 'B', 'Compaction', 2),
      activity('B3', 'B', 'Anti-termite treatment', 3),
      activity('B4', 'B', 'PCC floor/base', 4),
      activity('B5', 'B', 'Plinth beam', 5, { optional: true, conditional: true, enabled: false }),
    ],
  },
  {
    id: 'C',
    name: 'Superstructure',
    description: 'Structural framework and upper-floor concrete works.',
    activities: [
      activity('C1', 'C', 'Wall masonry', 1),
      activity('C2', 'C', 'Lintel / opening support', 2),
      activity('C3', 'C', 'Slab shuttering', 3),
      activity('C4', 'C', 'Slab reinforcement', 4),
      activity('C5', 'C', 'Electrical conduits', 5),
      activity('C6', 'C', 'Slab concreting', 6),
      activity('C7', 'C', 'Curing', 7),
      activity('C8', 'C', 'Columns', 8, { optional: true, conditional: true, enabled: false }),
      activity('C9', 'C', 'Beams', 9, { optional: true, conditional: true, enabled: false }),
      activity('C10', 'C', 'Slabs', 10, { optional: true, conditional: true, enabled: false }),
    ],
  },
  {
    id: 'D',
    name: 'MEP / Building Services',
    description: 'Rough-in and building service installation.',
    activities: [
      activity('D1', 'D', 'Plumbing rough-in', 1),
      activity('D2', 'D', 'Electrical rough-in', 2),
      activity('D3', 'D', 'Drainage', 3),
      activity('D4', 'D', 'HVAC / AC provisions', 4, { optional: true }),
    ],
  },
  {
    id: 'E',
    name: 'Wall / Surface Finishing',
    description: 'External and internal finishing preparation.',
    activities: [
      activity('E1', 'E', 'Plastering', 1),
      activity('E2', 'E', 'Waterproofing', 2),
      activity('E3', 'E', 'Screeding', 3),
    ],
  },
  {
    id: 'F',
    name: 'Finishing',
    description: 'Surface finishes, paint, and joinery package.',
    activities: [
      activity('F1', 'F', 'Flooring', 1),
      activity('F2', 'F', 'Wall tiles', 2),
      activity('F3', 'F', 'Granite / stone', 3, { optional: true }),
      activity('F4', 'F', 'False ceiling', 4, { optional: true }),
      activity('F5', 'F', 'Woodwork', 5, { optional: true }),
      activity('F6', 'F', 'Putty', 6),
      activity('F7', 'F', 'Primer', 7),
      activity('F8', 'F', 'Painting', 8),
    ],
  },
  {
    id: 'G',
    name: 'Final Fix / Fixtures',
    description: 'Fixture and final installation works.',
    activities: [
      activity('G1', 'G', 'Electrical fixtures', 1),
      activity('G2', 'G', 'Plumbing fixtures', 2),
      activity('G3', 'G', 'Sanitaryware', 3),
      activity('G4', 'G', 'Doors', 4),
      activity('G5', 'G', 'Windows', 5),
      activity('G6', 'G', 'Kitchen', 6, { optional: true }),
      activity('G7', 'G', 'Furniture', 7, { optional: true }),
      activity('G8', 'G', 'Other fixtures', 8, { optional: true }),
    ],
  },
  {
    id: 'H',
    name: 'External Works',
    description: 'Boundary, access, landscaping, and site development works.',
    activities: [
      activity('H1', 'H', 'Compound wall', 1),
      activity('H2', 'H', 'Gate', 2),
      activity('H3', 'H', 'Driveway', 3),
      activity('H4', 'H', 'Landscaping', 4, { optional: true }),
      activity('H5', 'H', 'External drainage', 5, { optional: true }),
      activity('H6', 'H', 'Septic / sewage', 6, { optional: true }),
      activity('H7', 'H', 'Rainwater harvesting', 7, { optional: true }),
      activity('H8', 'H', 'Other external works', 8, { optional: true }),
    ],
  },
  {
    id: 'I',
    name: 'Completion / Handover',
    description: 'Snagging, testing, and closure for handover.',
    activities: [
      activity('I1', 'I', 'Snagging', 1),
      activity('I2', 'I', 'Testing & commissioning', 2),
      activity('I3', 'I', 'Deep cleaning', 3),
      activity('I4', 'I', 'Final inspection', 4),
      activity('I5', 'I', 'Client handover', 5),
      activity('I6', 'I', 'Project closure', 6),
      activity('I7', 'I', 'Warranty / after-sales', 7, { optional: true }),
    ],
  },
];

export function looksLikeDemoPlan(phases: ConstructionPhase[] | undefined): boolean {
  if (!phases?.length) return true;
  const site = phases.flatMap((phase) => phase.activities).find((item) => item.name === 'Site preparation');
  return site?.notes === 'Survey and access setup complete.' || site?.estimatedCost === 85000;
}

export function resolveConstructionPlan(json: string | null | undefined): ConstructionPhase[] {
  if (!json) return createDefaultConstructionPhases();
  try {
    const parsed = JSON.parse(json) as ConstructionPhase[];
    if (!Array.isArray(parsed) || !parsed.length || looksLikeDemoPlan(parsed)) {
      return createDefaultConstructionPhases();
    }
    return parsed;
  } catch {
    return createDefaultConstructionPhases();
  }
}

export function statusFromProgress(progress: number, delayed = false): ActivityStatus {
  if (delayed) return 'Delayed';
  if (progress >= 100) return 'Completed';
  if (progress > 0) return 'In Progress';
  return 'Not Started';
}

export function projectWorkStatus(phases: ConstructionPhase[] | undefined, fallback = ''): string {
  const activities = (phases ?? []).flatMap((phase) => phase.activities).filter((activity) => activity.isEnabled);
  if (!activities.length) return fallback || 'Not Started';
  if (activities.some((activity) => activity.status === 'Delayed')) return 'Delayed';
  const progress = Math.round(activities.reduce((total, activity) => total + activity.progress, 0) / activities.length);
  if (progress >= 100) return 'Completed';
  if (progress > 0 || activities.some((activity) => activity.status === 'In Progress')) return 'In Progress';
  if (activities.some((activity) => activity.status === 'On Hold')) return 'On Hold';
  return fallback && fallback !== 'Active' ? fallback : 'Not Started';
}
