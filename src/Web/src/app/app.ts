import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Project, ProjectsService } from './projects.service';

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

const createDefaultConstructionPhases = (): ConstructionPhase[] => [
  {
    id: 'A',
    name: 'Foundation / Substructure',
    description: 'Site preparation, substructure, and foundation works.',
    activities: [
      { id: 'A1', phaseId: 'A', name: 'Site preparation', status: 'Completed', progress: 100, plannedStartDate: '2026-09-01', plannedEndDate: '2026-09-03', actualStartDate: '2026-09-01', actualEndDate: '2026-09-03', assignedTo: 'Site Engineer', estimatedCost: 85000, actualCost: 82000, notes: 'Survey and access setup complete.', isOptional: false, isConditional: false, isEnabled: true, sequence: 1 },
      { id: 'A2', phaseId: 'A', name: 'Set out', status: 'Completed', progress: 100, plannedStartDate: '2026-09-03', plannedEndDate: '2026-09-04', actualStartDate: '2026-09-03', actualEndDate: '2026-09-04', assignedTo: 'Survey Team', estimatedCost: 35000, actualCost: 33200, notes: 'Grid and setback marking confirmed.', isOptional: false, isConditional: false, isEnabled: true, sequence: 2 },
      { id: 'A3', phaseId: 'A', name: 'Excavation', status: 'Completed', progress: 100, plannedStartDate: '2026-09-04', plannedEndDate: '2026-09-07', actualStartDate: '2026-09-04', actualEndDate: '2026-09-07', assignedTo: 'Earthworks Crew', estimatedCost: 145000, actualCost: 138000, notes: 'Excavation completed to required depth.', isOptional: false, isConditional: false, isEnabled: true, sequence: 3 },
      { id: 'A4', phaseId: 'A', name: 'Foundation PCC', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-07', plannedEndDate: '2026-09-08', actualStartDate: '', actualEndDate: '', assignedTo: 'Concrete Team', estimatedCost: 42000, actualCost: 0, notes: 'Conditional activity for standard footing approach.', isOptional: true, isConditional: true, isEnabled: true, sequence: 4 },
      { id: 'A5', phaseId: 'A', name: 'RR Foundation', status: 'In Progress', progress: 65, plannedStartDate: '2026-09-08', plannedEndDate: '2026-09-12', actualStartDate: '2026-09-08', actualEndDate: '', assignedTo: 'Reinforcement Crew', estimatedCost: 210000, actualCost: 128000, notes: 'Rebar placement and tie-up in progress.', isOptional: true, isConditional: true, isEnabled: true, sequence: 5 },
      { id: 'A6', phaseId: 'A', name: 'Soiling', status: 'Completed', progress: 100, plannedStartDate: '2026-09-12', plannedEndDate: '2026-09-13', actualStartDate: '2026-09-12', actualEndDate: '2026-09-13', assignedTo: 'Civil Team', estimatedCost: 28000, actualCost: 26500, notes: 'Soil filling and leveling complete.', isOptional: false, isConditional: false, isEnabled: true, sequence: 6 },
      { id: 'A7', phaseId: 'A', name: 'RR Basement', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-13', plannedEndDate: '2026-09-18', actualStartDate: '', actualEndDate: '', assignedTo: 'Basement Crew', estimatedCost: 120000, actualCost: 0, notes: 'Standard substructure activity.', isOptional: false, isConditional: false, isEnabled: true, sequence: 7 },
      { id: 'A8', phaseId: 'A', name: 'RCC Belt', status: 'Delayed', progress: 35, plannedStartDate: '2026-09-18', plannedEndDate: '2026-09-20', actualStartDate: '2026-09-18', actualEndDate: '', assignedTo: 'Concrete Team', estimatedCost: 94000, actualCost: 42000, notes: 'Material delivery delays affecting schedule.', isOptional: false, isConditional: false, isEnabled: true, sequence: 8 },
      { id: 'A9', phaseId: 'A', name: 'DPC', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-20', plannedEndDate: '2026-09-21', actualStartDate: '', actualEndDate: '', assignedTo: 'Waterproofing Team', estimatedCost: 30000, actualCost: 0, notes: 'Damp-proof course to be applied after belt concrete.', isOptional: false, isConditional: false, isEnabled: true, sequence: 9 },
      { id: 'A10', phaseId: 'A', name: 'Column footing', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-07', plannedEndDate: '2026-09-09', actualStartDate: '', actualEndDate: '', assignedTo: 'Foundation Crew', estimatedCost: 96000, actualCost: 0, notes: 'Alternative structural solution for poor soil conditions.', isOptional: true, isConditional: true, isEnabled: false, sequence: 10 },
      { id: 'A11', phaseId: 'A', name: 'Footing reinforcement', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-09', plannedEndDate: '2026-09-10', actualStartDate: '', actualEndDate: '', assignedTo: 'Steel Fixers', estimatedCost: 42000, actualCost: 0, notes: 'Conditional for column footing structure.', isOptional: true, isConditional: true, isEnabled: false, sequence: 11 },
      { id: 'A12', phaseId: 'A', name: 'Footing concreting', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-10', plannedEndDate: '2026-09-11', actualStartDate: '', actualEndDate: '', assignedTo: 'Concrete Team', estimatedCost: 68000, actualCost: 0, notes: 'Alternative foundation workflow.', isOptional: true, isConditional: true, isEnabled: false, sequence: 12 },
      { id: 'A13', phaseId: 'A', name: 'Piling', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-05', plannedEndDate: '2026-09-08', actualStartDate: '', actualEndDate: '', assignedTo: 'Pile Contractor', estimatedCost: 250000, actualCost: 0, notes: 'Pile foundation variant for extreme soil conditions.', isOptional: true, isConditional: true, isEnabled: false, sequence: 13 },
      { id: 'A14', phaseId: 'A', name: 'Pile cap', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-08', plannedEndDate: '2026-09-10', actualStartDate: '', actualEndDate: '', assignedTo: 'Pile Cap Team', estimatedCost: 110000, actualCost: 0, notes: 'Pile-based foundation package.', isOptional: true, isConditional: true, isEnabled: false, sequence: 14 },
      { id: 'A15', phaseId: 'A', name: 'Retaining wall', status: 'On Hold', progress: 22, plannedStartDate: '2026-09-08', plannedEndDate: '2026-09-14', actualStartDate: '2026-09-08', actualEndDate: '', assignedTo: 'Earth Retention Crew', estimatedCost: 95000, actualCost: 21000, notes: 'Optional project activity based on site level conditions.', isOptional: true, isConditional: true, isEnabled: false, sequence: 15 }
    ]
  },
  {
    id: 'B',
    name: 'Plinth',
    description: 'Plinth filling, compaction, and finishing prep works.',
    activities: [
      { id: 'B1', phaseId: 'B', name: 'Backfilling', status: 'Completed', progress: 100, plannedStartDate: '2026-09-14', plannedEndDate: '2026-09-15', actualStartDate: '2026-09-14', actualEndDate: '2026-09-15', assignedTo: 'Earthworks Crew', estimatedCost: 35000, actualCost: 33000, notes: 'Backfill completed to design level.', isOptional: false, isConditional: false, isEnabled: true, sequence: 1 },
      { id: 'B2', phaseId: 'B', name: 'Compaction', status: 'Completed', progress: 100, plannedStartDate: '2026-09-15', plannedEndDate: '2026-09-16', actualStartDate: '2026-09-15', actualEndDate: '2026-09-16', assignedTo: 'Soil Compaction Team', estimatedCost: 28000, actualCost: 26000, notes: 'Layer-by-layer compaction complete.', isOptional: false, isConditional: false, isEnabled: true, sequence: 2 },
      { id: 'B3', phaseId: 'B', name: 'Anti-termite treatment', status: 'Completed', progress: 100, plannedStartDate: '2026-09-16', plannedEndDate: '2026-09-17', actualStartDate: '2026-09-16', actualEndDate: '2026-09-17', assignedTo: 'Pest Control Team', estimatedCost: 22000, actualCost: 21000, notes: 'Treatment and soil spray complete.', isOptional: false, isConditional: false, isEnabled: true, sequence: 3 },
      { id: 'B4', phaseId: 'B', name: 'PCC floor/base', status: 'In Progress', progress: 60, plannedStartDate: '2026-09-17', plannedEndDate: '2026-09-19', actualStartDate: '2026-09-17', actualEndDate: '', assignedTo: 'Concrete Team', estimatedCost: 78000, actualCost: 42000, notes: 'Floor base under progress.', isOptional: false, isConditional: false, isEnabled: true, sequence: 4 },
      { id: 'B5', phaseId: 'B', name: 'Plinth beam', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-19', plannedEndDate: '2026-09-20', actualStartDate: '', actualEndDate: '', assignedTo: 'Structural Team', estimatedCost: 64000, actualCost: 0, notes: 'Conditional for column-structure projects.', isOptional: true, isConditional: true, isEnabled: false, sequence: 5 }
    ]
  },
  {
    id: 'C',
    name: 'Superstructure',
    description: 'Structural framework and upper-floor concrete works.',
    activities: [
      { id: 'C1', phaseId: 'C', name: 'Wall masonry', status: 'In Progress', progress: 32, plannedStartDate: '2026-09-20', plannedEndDate: '2026-09-30', actualStartDate: '2026-09-20', actualEndDate: '', assignedTo: 'Masonry Crew', estimatedCost: 280000, actualCost: 89000, notes: 'Ground floor masonry progressing as scheduled.', isOptional: false, isConditional: false, isEnabled: true, sequence: 1 },
      { id: 'C2', phaseId: 'C', name: 'Lintel / opening support', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-25', plannedEndDate: '2026-09-27', actualStartDate: '', actualEndDate: '', assignedTo: 'Structural Team', estimatedCost: 56000, actualCost: 0, notes: 'Openings to be supported before upper slab work.', isOptional: false, isConditional: false, isEnabled: true, sequence: 2 },
      { id: 'C3', phaseId: 'C', name: 'Slab shuttering', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-27', plannedEndDate: '2026-09-29', actualStartDate: '', actualEndDate: '', assignedTo: 'Formwork Team', estimatedCost: 76000, actualCost: 0, notes: 'Ground floor slab shuttering pending.', isOptional: false, isConditional: false, isEnabled: true, sequence: 3 },
      { id: 'C4', phaseId: 'C', name: 'Slab reinforcement', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-29', plannedEndDate: '2026-10-01', actualStartDate: '', actualEndDate: '', assignedTo: 'Steel Fixers', estimatedCost: 89000, actualCost: 0, notes: 'Rebar work for slab panel to follow.', isOptional: false, isConditional: false, isEnabled: true, sequence: 4 },
      { id: 'C5', phaseId: 'C', name: 'Electrical conduits', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-29', plannedEndDate: '2026-10-01', actualStartDate: '', actualEndDate: '', assignedTo: 'Electrical Team', estimatedCost: 47000, actualCost: 0, notes: 'Conduits to be fixed before slab pouring.', isOptional: false, isConditional: false, isEnabled: true, sequence: 5 },
      { id: 'C6', phaseId: 'C', name: 'Slab concreting', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-01', plannedEndDate: '2026-10-02', actualStartDate: '', actualEndDate: '', assignedTo: 'Concrete Team', estimatedCost: 138000, actualCost: 0, notes: 'Ready for pour once formwork is approved.', isOptional: false, isConditional: false, isEnabled: true, sequence: 6 },
      { id: 'C7', phaseId: 'C', name: 'Curing', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-02', plannedEndDate: '2026-10-05', actualStartDate: '', actualEndDate: '', assignedTo: 'Site Labour', estimatedCost: 24000, actualCost: 0, notes: 'Curing to run after slab concrete.', isOptional: false, isConditional: false, isEnabled: true, sequence: 7 },
      { id: 'C8', phaseId: 'C', name: 'Columns', status: 'Not Started', progress: 0, plannedStartDate: '2026-09-22', plannedEndDate: '2026-09-30', actualStartDate: '', actualEndDate: '', assignedTo: 'Structural Team', estimatedCost: 160000, actualCost: 0, notes: 'Structural system variant for column footing projects.', isOptional: true, isConditional: true, isEnabled: false, sequence: 8 },
      { id: 'C9', phaseId: 'C', name: 'Beams', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-01', plannedEndDate: '2026-10-07', actualStartDate: '', actualEndDate: '', assignedTo: 'Reinforcement Crew', estimatedCost: 145000, actualCost: 0, notes: 'Alternative structural progression by floor level.', isOptional: true, isConditional: true, isEnabled: false, sequence: 9 },
      { id: 'C10', phaseId: 'C', name: 'Slabs', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-05', plannedEndDate: '2026-10-12', actualStartDate: '', actualEndDate: '', assignedTo: 'Concrete Team', estimatedCost: 170000, actualCost: 0, notes: 'Repeatable floor-by-floor activity for upper stories.', isOptional: true, isConditional: true, isEnabled: false, sequence: 10 }
    ]
  },
  {
    id: 'D',
    name: 'MEP / Building Services',
    description: 'Rough-in and building service installation.',
    activities: [
      { id: 'D1', phaseId: 'D', name: 'Plumbing rough-in', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-08', plannedEndDate: '2026-10-12', actualStartDate: '', actualEndDate: '', assignedTo: 'Plumbing Team', estimatedCost: 66000, actualCost: 0, notes: 'Sanitary and water piping works in progress plan.', isOptional: false, isConditional: false, isEnabled: true, sequence: 1 },
      { id: 'D2', phaseId: 'D', name: 'Electrical rough-in', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-10', plannedEndDate: '2026-10-15', actualStartDate: '', actualEndDate: '', assignedTo: 'Electrical Team', estimatedCost: 87000, actualCost: 0, notes: 'Cable routing and conduit installation.', isOptional: false, isConditional: false, isEnabled: true, sequence: 2 },
      { id: 'D3', phaseId: 'D', name: 'Drainage', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-12', plannedEndDate: '2026-10-16', actualStartDate: '', actualEndDate: '', assignedTo: 'Drainage Crew', estimatedCost: 54000, actualCost: 0, notes: 'Internal and external drainage checks.', isOptional: false, isConditional: false, isEnabled: true, sequence: 3 },
      { id: 'D4', phaseId: 'D', name: 'HVAC / AC provisions', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-14', plannedEndDate: '2026-10-20', actualStartDate: '', actualEndDate: '', assignedTo: 'HVAC Contractor', estimatedCost: 120000, actualCost: 0, notes: 'Provisions for ducting and unit support.', isOptional: true, isConditional: false, isEnabled: true, sequence: 4 }
    ]
  },
  {
    id: 'E',
    name: 'Wall / Surface Finishing',
    description: 'External and internal finishing preparation.',
    activities: [
      { id: 'E1', phaseId: 'E', name: 'Plastering', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-20', plannedEndDate: '2026-10-28', actualStartDate: '', actualEndDate: '', assignedTo: 'Plaster Team', estimatedCost: 140000, actualCost: 0, notes: 'Internal and external plastering package.', isOptional: false, isConditional: false, isEnabled: true, sequence: 1 },
      { id: 'E2', phaseId: 'E', name: 'Waterproofing', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-24', plannedEndDate: '2026-10-30', actualStartDate: '', actualEndDate: '', assignedTo: 'Waterproofing Team', estimatedCost: 79000, actualCost: 0, notes: 'Roof and wet area treatment.', isOptional: false, isConditional: false, isEnabled: true, sequence: 2 },
      { id: 'E3', phaseId: 'E', name: 'Screeding', status: 'Not Started', progress: 0, plannedStartDate: '2026-10-28', plannedEndDate: '2026-11-02', actualStartDate: '', actualEndDate: '', assignedTo: 'Finishing Crew', estimatedCost: 65000, actualCost: 0, notes: 'Leveling for final floor finish.', isOptional: false, isConditional: false, isEnabled: true, sequence: 3 }
    ]
  },
  {
    id: 'F',
    name: 'Finishing',
    description: 'Surface finishes, paint, and joinery package.',
    activities: [
      { id: 'F1', phaseId: 'F', name: 'Flooring', status: 'Not Started', progress: 0, plannedStartDate: '2026-11-02', plannedEndDate: '2026-11-08', actualStartDate: '', actualEndDate: '', assignedTo: 'Flooring Contractor', estimatedCost: 175000, actualCost: 0, notes: 'Tile and stone finish works.', isOptional: false, isConditional: false, isEnabled: true, sequence: 1 },
      { id: 'F2', phaseId: 'F', name: 'Wall tiles', status: 'Not Started', progress: 0, plannedStartDate: '2026-11-05', plannedEndDate: '2026-11-12', actualStartDate: '', actualEndDate: '', assignedTo: 'Tile Team', estimatedCost: 82000, actualCost: 0, notes: 'Bathroom and kitchen tile work.', isOptional: false, isConditional: false, isEnabled: true, sequence: 2 },
      { id: 'F3', phaseId: 'F', name: 'Granite / stone', status: 'Not Started', progress: 0, plannedStartDate: '2026-11-08', plannedEndDate: '2026-11-15', actualStartDate: '', actualEndDate: '', assignedTo: 'Stone Specialist', estimatedCost: 93000, actualCost: 0, notes: 'Kitchen and foyer cladding package.', isOptional: true, isConditional: false, isEnabled: true, sequence: 3 },
      { id: 'F4', phaseId: 'F', name: 'False ceiling', status: 'Not Started', progress: 0, plannedStartDate: '2026-11-10', plannedEndDate: '2026-11-18', actualStartDate: '', actualEndDate: '', assignedTo: 'Interior Contractor', estimatedCost: 98000, actualCost: 0, notes: 'Ceiling grid and finishing package.', isOptional: true, isConditional: false, isEnabled: true, sequence: 4 },
      { id: 'F5', phaseId: 'F', name: 'Woodwork', status: 'Not Started', progress: 0, plannedStartDate: '2026-11-15', plannedEndDate: '2026-11-22', actualStartDate: '', actualEndDate: '', assignedTo: 'Joinery Team', estimatedCost: 105000, actualCost: 0, notes: 'Doors, wardrobes, and paneling package.', isOptional: true, isConditional: false, isEnabled: true, sequence: 5 },
      { id: 'F6', phaseId: 'F', name: 'Putty', status: 'Not Started', progress: 0, plannedStartDate: '2026-11-18', plannedEndDate: '2026-11-24', actualStartDate: '', actualEndDate: '', assignedTo: 'Finishing Crew', estimatedCost: 52000, actualCost: 0, notes: 'Surface prep before primer and paint.', isOptional: false, isConditional: false, isEnabled: true, sequence: 6 },
      { id: 'F7', phaseId: 'F', name: 'Primer', status: 'Not Started', progress: 0, plannedStartDate: '2026-11-24', plannedEndDate: '2026-11-28', actualStartDate: '', actualEndDate: '', assignedTo: 'Painting Team', estimatedCost: 38000, actualCost: 0, notes: 'Primer coat on internal surfaces.', isOptional: false, isConditional: false, isEnabled: true, sequence: 7 },
      { id: 'F8', phaseId: 'F', name: 'Painting', status: 'Not Started', progress: 0, plannedStartDate: '2026-11-28', plannedEndDate: '2026-12-05', actualStartDate: '', actualEndDate: '', assignedTo: 'Painting Team', estimatedCost: 150000, actualCost: 0, notes: 'Internal and external final painting.', isOptional: false, isConditional: false, isEnabled: true, sequence: 8 }
    ]
  },
  {
    id: 'G',
    name: 'Final Fix / Fixtures',
    description: 'Fixture and final installation works.',
    activities: [
      { id: 'G1', phaseId: 'G', name: 'Electrical fixtures', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-05', plannedEndDate: '2026-12-10', actualStartDate: '', actualEndDate: '', assignedTo: 'Electrical Team', estimatedCost: 60000, actualCost: 0, notes: 'Lighting, switches, and fittings.', isOptional: false, isConditional: false, isEnabled: true, sequence: 1 },
      { id: 'G2', phaseId: 'G', name: 'Plumbing fixtures', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-06', plannedEndDate: '2026-12-12', actualStartDate: '', actualEndDate: '', assignedTo: 'Plumbing Team', estimatedCost: 70000, actualCost: 0, notes: 'Fixtures, taps, and accessories.', isOptional: false, isConditional: false, isEnabled: true, sequence: 2 },
      { id: 'G3', phaseId: 'G', name: 'Sanitaryware', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-08', plannedEndDate: '2026-12-14', actualStartDate: '', actualEndDate: '', assignedTo: 'Sanitary Contractor', estimatedCost: 78000, actualCost: 0, notes: 'WC, wash basins, shower items.', isOptional: false, isConditional: false, isEnabled: true, sequence: 3 },
      { id: 'G4', phaseId: 'G', name: 'Doors', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-10', plannedEndDate: '2026-12-17', actualStartDate: '', actualEndDate: '', assignedTo: 'Joinery Team', estimatedCost: 93000, actualCost: 0, notes: 'Internal and external doors package.', isOptional: false, isConditional: false, isEnabled: true, sequence: 4 },
      { id: 'G5', phaseId: 'G', name: 'Windows', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-12', plannedEndDate: '2026-12-19', actualStartDate: '', actualEndDate: '', assignedTo: 'Fenestration Contractor', estimatedCost: 88000, actualCost: 0, notes: 'Frame and glazing installation.', isOptional: false, isConditional: false, isEnabled: true, sequence: 5 },
      { id: 'G6', phaseId: 'G', name: 'Kitchen', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-14', plannedEndDate: '2026-12-20', actualStartDate: '', actualEndDate: '', assignedTo: 'Kitchen Specialist', estimatedCost: 105000, actualCost: 0, notes: 'Cabinetry and fittings package.', isOptional: true, isConditional: false, isEnabled: true, sequence: 6 },
      { id: 'G7', phaseId: 'G', name: 'Furniture', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-16', plannedEndDate: '2026-12-20', actualStartDate: '', actualEndDate: '', assignedTo: 'Interior Consultant', estimatedCost: 85000, actualCost: 0, notes: 'Optional furniture package.', isOptional: true, isConditional: false, isEnabled: true, sequence: 7 },
      { id: 'G8', phaseId: 'G', name: 'Other fixtures', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-18', plannedEndDate: '2026-12-22', actualStartDate: '', actualEndDate: '', assignedTo: 'Site Team', estimatedCost: 42000, actualCost: 0, notes: 'Additional owner-supplied items.', isOptional: true, isConditional: false, isEnabled: true, sequence: 8 }
    ]
  },
  {
    id: 'H',
    name: 'External Works',
    description: 'Boundary, access, landscaping, and site development works.',
    activities: [
      { id: 'H1', phaseId: 'H', name: 'Compound wall', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-20', plannedEndDate: '2026-12-27', actualStartDate: '', actualEndDate: '', assignedTo: 'Boundary Crew', estimatedCost: 135000, actualCost: 0, notes: 'Boundary wall and gate works.', isOptional: false, isConditional: false, isEnabled: true, sequence: 1 },
      { id: 'H2', phaseId: 'H', name: 'Gate', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-22', plannedEndDate: '2026-12-28', actualStartDate: '', actualEndDate: '', assignedTo: 'Fabrication Team', estimatedCost: 42000, actualCost: 0, notes: 'Entrance gate and ironwork.', isOptional: false, isConditional: false, isEnabled: true, sequence: 2 },
      { id: 'H3', phaseId: 'H', name: 'Driveway', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-23', plannedEndDate: '2026-12-30', actualStartDate: '', actualEndDate: '', assignedTo: 'Paving Team', estimatedCost: 58000, actualCost: 0, notes: 'Access road and pavement finish.', isOptional: false, isConditional: false, isEnabled: true, sequence: 3 },
      { id: 'H4', phaseId: 'H', name: 'Landscaping', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-26', plannedEndDate: '2027-01-03', actualStartDate: '', actualEndDate: '', assignedTo: 'Landscaping Team', estimatedCost: 76000, actualCost: 0, notes: 'Garden and softscape installations.', isOptional: true, isConditional: false, isEnabled: true, sequence: 4 },
      { id: 'H5', phaseId: 'H', name: 'External drainage', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-24', plannedEndDate: '2026-12-31', actualStartDate: '', actualEndDate: '', assignedTo: 'Drainage Team', estimatedCost: 48000, actualCost: 0, notes: 'Stormwater and surface drainage.', isOptional: true, isConditional: false, isEnabled: true, sequence: 5 },
      { id: 'H6', phaseId: 'H', name: 'Septic / sewage', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-28', plannedEndDate: '2027-01-05', actualStartDate: '', actualEndDate: '', assignedTo: 'Civil Site Team', estimatedCost: 94000, actualCost: 0, notes: 'Site-specific sanitary systems.', isOptional: true, isConditional: false, isEnabled: true, sequence: 6 },
      { id: 'H7', phaseId: 'H', name: 'Rainwater harvesting', status: 'Not Started', progress: 0, plannedStartDate: '2026-12-30', plannedEndDate: '2027-01-06', actualStartDate: '', actualEndDate: '', assignedTo: 'Sustainability Team', estimatedCost: 52000, actualCost: 0, notes: 'Optional environmental package.', isOptional: true, isConditional: false, isEnabled: true, sequence: 7 },
      { id: 'H8', phaseId: 'H', name: 'Other external works', status: 'Not Started', progress: 0, plannedStartDate: '2027-01-02', plannedEndDate: '2027-01-09', actualStartDate: '', actualEndDate: '', assignedTo: 'Site Team', estimatedCost: 35000, actualCost: 0, notes: 'Allow future external scope additions.', isOptional: true, isConditional: false, isEnabled: true, sequence: 8 }
    ]
  },
  {
    id: 'I',
    name: 'Completion / Handover',
    description: 'Snagging, testing, and closure for handover.',
    activities: [
      { id: 'I1', phaseId: 'I', name: 'Snagging', status: 'Not Started', progress: 0, plannedStartDate: '2027-01-10', plannedEndDate: '2027-01-15', actualStartDate: '', actualEndDate: '', assignedTo: 'Project Manager', estimatedCost: 25000, actualCost: 0, notes: 'Punch list and defect closure.', isOptional: false, isConditional: false, isEnabled: true, sequence: 1 },
      { id: 'I2', phaseId: 'I', name: 'Testing & commissioning', status: 'Not Started', progress: 0, plannedStartDate: '2027-01-15', plannedEndDate: '2027-01-18', actualStartDate: '', actualEndDate: '', assignedTo: 'MEP Contractor', estimatedCost: 52000, actualCost: 0, notes: 'System verification and startup.', isOptional: false, isConditional: false, isEnabled: true, sequence: 2 },
      { id: 'I3', phaseId: 'I', name: 'Deep cleaning', status: 'Not Started', progress: 0, plannedStartDate: '2027-01-18', plannedEndDate: '2027-01-20', actualStartDate: '', actualEndDate: '', assignedTo: 'Cleaning Team', estimatedCost: 18000, actualCost: 0, notes: 'Final cleaning before handover.', isOptional: false, isConditional: false, isEnabled: true, sequence: 3 },
      { id: 'I4', phaseId: 'I', name: 'Final inspection', status: 'Not Started', progress: 0, plannedStartDate: '2027-01-20', plannedEndDate: '2027-01-22', actualStartDate: '', actualEndDate: '', assignedTo: 'Client and Consultant', estimatedCost: 15000, actualCost: 0, notes: 'Formal sign-off and inspection approvals.', isOptional: false, isConditional: false, isEnabled: true, sequence: 4 },
      { id: 'I5', phaseId: 'I', name: 'Client handover', status: 'Not Started', progress: 0, plannedStartDate: '2027-01-22', plannedEndDate: '2027-01-23', actualStartDate: '', actualEndDate: '', assignedTo: 'Project Director', estimatedCost: 12000, actualCost: 0, notes: 'Documentation and key handover.', isOptional: false, isConditional: false, isEnabled: true, sequence: 5 },
      { id: 'I6', phaseId: 'I', name: 'Project closure', status: 'Not Started', progress: 0, plannedStartDate: '2027-01-23', plannedEndDate: '2027-01-24', actualStartDate: '', actualEndDate: '', assignedTo: 'Accounts Team', estimatedCost: 8000, actualCost: 0, notes: 'Billing, final settlement, and archive.', isOptional: false, isConditional: false, isEnabled: true, sequence: 6 },
      { id: 'I7', phaseId: 'I', name: 'Warranty / after-sales', status: 'Not Started', progress: 0, plannedStartDate: '2027-01-24', plannedEndDate: '2027-02-24', actualStartDate: '', actualEndDate: '', assignedTo: 'Service Team', estimatedCost: 30000, actualCost: 0, notes: 'Post-handover support and defect review period.', isOptional: true, isConditional: false, isEnabled: true, sequence: 7 }
    ]
  }
];

const foundationOptions = ['Standard/RR foundation', 'Column footing structure', 'Pile foundation'];

declare module './projects.service' {
  interface Project {
    constructionPhases?: ConstructionPhase[];
    foundationSystem?: string;
  }
}

@Component({
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly projectsService = inject(ProjectsService);
  private readonly projectStorageKey = 'slate.projects';
  protected readonly projects = signal<Project[]>([]);
  protected readonly activeSection = signal('Dashboard');
  protected readonly dashboardPeriod = signal('This week');
  protected readonly selectedProjectFilter = signal('All projects');
  protected readonly showProjectForm = signal(false);
  protected readonly formError = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly moduleNotice = signal('');
  protected readonly showBoqForm = signal(false);
  protected readonly boqFormError = signal('');
  protected readonly showExpenseForm = signal(false);
  protected readonly expenseFormError = signal('');
  protected readonly receiptPreview = signal('');
  protected readonly receiptFileName = signal('');
  protected readonly isReadingReceipt = signal(false);
  protected readonly showPaymentForm = signal(false);
  protected readonly paymentFormError = signal('');
  protected readonly showMaterialForm = signal(false);
  protected readonly materialFormError = signal('');
  protected readonly darkMode = signal(false);
  protected readonly showEmployeeHistory = signal(false);
  protected readonly selectedProject = signal<Project | null>(null);
  protected readonly selectedPhaseId = signal('A');
  protected readonly selectedFoundationSystem = signal('Standard/RR foundation');
  protected readonly constructionPhases = signal<ConstructionPhase[]>(createDefaultConstructionPhases());
  protected readonly selectedEmployee = signal<{
    name: string;
    role: string;
    project: string;
    attendance: string;
    wage: number;
  } | null>(null);
  protected readonly showReportPreview = signal(false);
  protected readonly reportTitle = signal('');
  protected readonly reportContent = signal('');
  protected readonly materials = [
    {
      name: 'Portland cement',
      project: 'Riverside Medical Pavilion',
      category: 'Concrete',
      unit: 'bags',
      stock: 480,
      minimum: 120,
      price: 11.5,
      supplier: 'Cascade Building Supply',
    },
    {
      name: 'Rebar steel 12mm',
      project: 'Riverside Medical Pavilion',
      category: 'Reinforcement',
      unit: 'lengths',
      stock: 860,
      minimum: 200,
      price: 8.75,
      supplier: 'Northwest Steel',
    },
    {
      name: 'Washed construction sand',
      project: 'Northline Apartments',
      category: 'Aggregates',
      unit: 'tons',
      stock: 18,
      minimum: 8,
      price: 64,
      supplier: 'Columbia Aggregates',
    },
    {
      name: 'Concrete block 8in',
      project: 'Northline Apartments',
      category: 'Masonry',
      unit: 'pieces',
      stock: 3200,
      minimum: 900,
      price: 2.85,
      supplier: 'Cedar Masonry',
    },
    {
      name: 'Framing lumber 2x4',
      project: 'Cedar Street Retail',
      category: 'Timber',
      unit: 'pieces',
      stock: 740,
      minimum: 250,
      price: 6.4,
      supplier: 'Westline Timber',
    },
    {
      name: 'PVC pipe 4in',
      project: 'Cedar Street Retail',
      category: 'Plumbing',
      unit: 'lengths',
      stock: 34,
      minimum: 40,
      price: 18.2,
      supplier: 'FlowPro Plumbing',
    },
    {
      name: 'Electrical cable 2.5mm',
      project: 'Riverside Medical Pavilion',
      category: 'Electrical',
      unit: 'rolls',
      stock: 26,
      minimum: 10,
      price: 92,
      supplier: 'BrightWire Electrical',
    },
    {
      name: 'Interior wall paint',
      project: 'Cedar Street Retail',
      category: 'Finishes',
      unit: 'gallons',
      stock: 68,
      minimum: 20,
      price: 38,
      supplier: 'ColorCraft',
    },
  ];
  protected readonly boqItems = signal([
    {
      project: 'Riverside Medical Pavilion',
      category: 'Concrete',
      description: 'Foundation concrete C30',
      unit: 'm³',
      quantity: 120,
      rate: 145,
      amount: 17400,
    },
    {
      project: 'Riverside Medical Pavilion',
      category: 'Reinforcement',
      description: 'Rebar supply and placement',
      unit: 'ton',
      quantity: 18,
      rate: 980,
      amount: 17640,
    },
    {
      project: 'Northline Apartments',
      category: 'Masonry',
      description: 'External blockwork',
      unit: 'm²',
      quantity: 860,
      rate: 42,
      amount: 36120,
    },
    {
      project: 'Cedar Street Retail',
      category: 'Electrical',
      description: 'First fix electrical installation',
      unit: 'lot',
      quantity: 1,
      rate: 18500,
      amount: 18500,
    },
  ]);
  protected readonly labour = [
    {
      name: 'Maya Singh',
      role: 'Site engineer',
      project: 'Riverside Medical Pavilion',
      attendance: 'Present',
      wage: 285,
    },
    {
      name: 'Luis Ortega',
      role: 'Concrete foreman',
      project: 'Riverside Medical Pavilion',
      attendance: 'Present',
      wage: 240,
    },
    {
      name: 'Alex Kim',
      role: 'Procurement lead',
      project: 'Cedar Street Retail',
      attendance: 'Present',
      wage: 220,
    },
    {
      name: 'Northline Civil',
      role: 'Masonry contractor',
      project: 'Northline Apartments',
      attendance: 'Pending',
      wage: 1250,
    },
  ];
  protected readonly expenses = signal([
    {
      category: 'Materials',
      description: 'Cement and rebar delivery',
      project: 'Riverside Medical Pavilion',
      vendor: 'Cascade Building Supply',
      amount: 8420,
      date: 'Sep 11, 2026',
      receiptName: '',
      phaseId: 'A',
    },
    {
      category: 'Equipment',
      description: 'Excavator rental',
      project: 'Northline Apartments',
      vendor: 'Horizon Equipment',
      amount: 3200,
      date: 'Sep 10, 2026',
      receiptName: '',
      phaseId: 'A',
    },
    {
      category: 'Fuel',
      description: 'Site vehicles and generator',
      project: 'Cedar Street Retail',
      vendor: 'Pacific Fuel Co.',
      amount: 680,
      date: 'Sep 09, 2026',
      receiptName: '',
      phaseId: '',
    },
  ]);
  protected readonly payments = signal([
    {
      project: 'Riverside Medical Pavilion',
      type: 'Customer payment',
      party: 'Riverside Health',
      invoice: 'INV-1024',
      amount: 125000,
      status: 'Received',
      due: 'Sep 08, 2026',
      phaseId: 'A',
    },
    {
      project: 'Riverside Medical Pavilion',
      type: 'Supplier payment',
      party: 'Northwest Steel',
      invoice: 'SUP-4481',
      amount: 18400,
      status: 'Pending',
      due: 'Sep 15, 2026',
      phaseId: 'A',
    },
    {
      project: 'Northline Apartments',
      type: 'Contractor payment',
      party: 'Northline Civil',
      invoice: 'CON-2077',
      amount: 32200,
      status: 'Pending',
      due: 'Sep 18, 2026',
      phaseId: '',
    },
  ]);
  protected readonly projectForm = {
    projectCode: '',
    name: '',
    clientName: '',
    clientContact: '',
    siteAddress: '',
    startDate: '',
    expectedCompletionDate: '',
    foundationSystem: 'Standard/RR foundation',
    estimatedBudget: 0,
    projectManager: '',
    description: '',
  };
  protected readonly boqForm = {
    project: '',
    category: 'Concrete',
    description: '',
    unit: 'm³',
    quantity: 1,
    rate: 0,
  };
  protected readonly expenseForm = {
    project: '',
    phaseId: '',
    category: 'Materials',
    description: '',
    vendor: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Bank transfer',
    notes: '',
  };
  protected readonly paymentForm = {
    project: '',
    phaseId: '',
    type: 'Supplier payment',
    party: '',
    invoice: '',
    amount: 0,
    status: 'Pending',
    due: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Bank transfer',
    notes: '',
  };
  protected readonly materialForm = {
    name: '',
    project: '',
    category: 'Concrete',
    unit: 'bags',
    quantity: 0,
    minimum: 0,
    price: 0,
    supplier: '',
  };
  protected readonly totalBudget = (total: number, project: { estimatedBudget: number }) =>
    total + project.estimatedBudget;
  protected readonly totalActual = (total: number, project: { actualCost: number }) =>
    total + project.actualCost;

  private createDemoProject(): Project {
    const phases = createDefaultConstructionPhases();
    const progressPercent = this.calculateProjectProgress(phases);
    const estimatedBudget = phases
      .flatMap((phase) => phase.activities)
      .reduce((sum, activity) => sum + activity.estimatedCost, 0);
    const actualCost = phases
      .flatMap((phase) => phase.activities)
      .reduce((sum, activity) => sum + activity.actualCost, 0);

    return {
      id: 'demo-riverside',
      projectCode: 'PRJ-0001',
      name: 'Riverside Medical Pavilion',
      clientName: 'Riverside Health',
      siteAddress: 'Bengaluru, Karnataka',
      estimatedBudget,
      actualCost,
      progressPercent,
      status: 'In Progress',
      foundationSystem: 'Standard/RR foundation',
      constructionPhases: phases,
    };
  }

  ngOnInit(): void {
    this.darkMode.set(localStorage.getItem('slate.theme') === 'dark');
    const savedProjects = this.readSavedProjects();
    const seededProjects = savedProjects.length ? savedProjects : [this.createDemoProject()];
    this.projects.set(seededProjects);
    this.selectedProject.set(seededProjects[0] ?? null);
    this.constructionPhases.set(seededProjects[0]?.constructionPhases ?? createDefaultConstructionPhases());
    this.selectedFoundationSystem.set(seededProjects[0]?.foundationSystem ?? 'Standard/RR foundation');
    this.selectedProjectFilter.set(seededProjects[0]?.name ?? 'All projects');
    this.saveProjects(seededProjects);

    this.projectsService.getProjects().subscribe((apiProjects) => {
      if (apiProjects.length > 0) {
        const existing = new Map(
          this.projects().map((project) => [project.id || project.projectCode, project]),
        );
        for (const project of apiProjects) existing.set(project.id || project.projectCode, project);
        const mergedProjects = [...existing.values()];
        this.projects.set(mergedProjects);
        this.saveProjects(mergedProjects);
      }
    });
  }

  protected openSection(section: string): void {
    this.activeSection.set(section);
    this.moduleNotice.set('');
    if (section === 'Projects' && this.projects().length > 0 && !this.selectedProject()) {
      this.selectProject(this.projects()[0].name);
    }
  }

  protected selectProject(projectName: string): void {
    const project = this.projects().find((item) => item.name === projectName) ?? null;
    this.selectedProject.set(project);
    const storedPhases = this.constructionPhases();
    const projectPhases = project?.constructionPhases ?? storedPhases;
    this.constructionPhases.set(projectPhases);
    this.applyFoundationSystem(project?.foundationSystem ?? 'Standard/RR foundation');
    this.selectedPhaseId.set('A');
  }

  protected applyFoundationSystem(system: string): void {
    this.selectedFoundationSystem.set(system);
    const phases = this.constructionPhases();
    const nextPhases: ConstructionPhase[] = phases.map((phase) => ({
      ...phase,
      activities: phase.activities.map((activity): ConstructionActivity => {
        const isStandardWorkflow = system === 'Standard/RR foundation';
        const isColumnWorkflow = system === 'Column footing structure';
        const isPileWorkflow = system === 'Pile foundation';
        const isColumnRelated = ['Column footing', 'Footing reinforcement', 'Footing concreting', 'Columns', 'Beams', 'Slabs'].includes(activity.name);
        const isPileRelated = ['Piling', 'Pile cap', 'Columns', 'Beams', 'Slabs'].includes(activity.name);
        const keepStandard = activity.name !== 'Column footing' && activity.name !== 'Footing reinforcement' && activity.name !== 'Footing concreting' && activity.name !== 'Piling' && activity.name !== 'Pile cap' && activity.name !== 'Retaining wall' && activity.name !== 'Plinth beam';

        if (activity.name === 'Foundation PCC' && !isStandardWorkflow) {
          return { ...activity, isEnabled: false, isOptional: true, status: 'Not Started' };
        }
        if (activity.name === 'RR Foundation' && !isStandardWorkflow) {
          return { ...activity, isEnabled: false, isOptional: true, status: 'Not Started' };
        }
        if (activity.name === 'RR Basement' && !isStandardWorkflow) {
          return { ...activity, isEnabled: false, isOptional: true, status: 'Not Started' };
        }
        if (activity.name === 'RCC Belt' && !isStandardWorkflow) {
          return { ...activity, isEnabled: false, isOptional: true, status: 'Not Started' };
        }
        if (activity.name === 'DPC' && !isStandardWorkflow) {
          return { ...activity, isEnabled: false, isOptional: true, status: 'Not Started' };
        }
        if (activity.name === 'Retaining wall') {
          return { ...activity, isEnabled: false, isOptional: true, status: 'On Hold' };
        }
        if (activity.name === 'Plinth beam') {
          return { ...activity, isEnabled: isColumnWorkflow, isOptional: true, status: isColumnWorkflow ? 'Not Started' : 'Not Started' };
        }
        if (isColumnRelated && isColumnWorkflow) {
          return { ...activity, isEnabled: true, isOptional: true, status: activity.status === 'Not Started' ? 'Not Started' : activity.status };
        }
        if (isPileRelated && isPileWorkflow) {
          return { ...activity, isEnabled: true, isOptional: true, status: activity.status === 'Not Started' ? 'Not Started' : activity.status };
        }
        if (!keepStandard && !isColumnWorkflow && !isPileWorkflow) {
          return { ...activity, isEnabled: false, isOptional: true, status: 'Not Started' };
        }

        return { ...activity, isEnabled: activity.isEnabled || isStandardWorkflow || activity.name === 'Site preparation' || activity.name === 'Set out' || activity.name === 'Excavation' || activity.name === 'Soiling' };
      }),
    }));
    this.constructionPhases.set(nextPhases);
  }

  protected setSelectedPhase(phaseId: string): void {
    this.selectedPhaseId.set(phaseId);
  }

  protected updateActivityStatus(activityId: string, value: string): void {
    const status = value as ActivityStatus;
    const phases = this.constructionPhases();
    const nextPhases: ConstructionPhase[] = phases.map((phase) => ({
      ...phase,
      activities: phase.activities.map((activity): ConstructionActivity =>
        activity.id === activityId ? { ...activity, status, progress: this.activityProgressFromStatus(status) } : activity,
      ),
    }));
    this.constructionPhases.set(nextPhases);
    const selectedProject = this.selectedProject();
    if (selectedProject) {
      this.selectedProject.set({ ...selectedProject, progressPercent: this.calculateProjectProgress(nextPhases) });
    }
    this.projects.update((projects) =>
      projects.map((project) =>
        project.name === (this.selectedProject()?.name ?? project.name)
          ? { ...project, progressPercent: this.calculateProjectProgress(nextPhases), constructionPhases: nextPhases, foundationSystem: this.selectedFoundationSystem() }
          : project,
      ),
    );
  }

  protected progressTrackStyle(value: number): string {
    return `linear-gradient(to right, var(--green) ${value}%, #e5ede6 ${value}%)`;
  }

  protected updateActivityProgress(activityId: string, value: number): void {
    const phases = this.constructionPhases();
    const nextPhases = phases.map((phase) => ({
      ...phase,
      activities: phase.activities.map((activity) =>
        activity.id === activityId ? { ...activity, progress: value, status: this.statusFromProgress(value) } : activity,
      ),
    }));
    this.constructionPhases.set(nextPhases);
    const activeProject = this.selectedProject();
    if (activeProject) {
      this.selectedProject.set({ ...activeProject, progressPercent: this.calculateProjectProgress(nextPhases) });
    }
    this.projects.update((projects) =>
      projects.map((project) =>
        project.name === (this.selectedProject()?.name ?? project.name)
          ? { ...project, progressPercent: this.calculateProjectProgress(nextPhases), constructionPhases: nextPhases, foundationSystem: this.selectedFoundationSystem() }
          : project,
      ),
    );
  }

  protected updateActivityDetails(
    activityId: string,
    changes: Partial<Pick<ConstructionActivity, 'plannedStartDate' | 'plannedEndDate' | 'actualStartDate' | 'actualEndDate' | 'assignedTo' | 'estimatedCost' | 'actualCost' | 'notes'>>,
  ): void {
    const nextPhases: ConstructionPhase[] = this.constructionPhases().map((phase) => ({
      ...phase,
      activities: phase.activities.map((activity) =>
        activity.id === activityId ? { ...activity, ...changes } : activity,
      ),
    }));
    this.constructionPhases.set(nextPhases);
    const progressPercent = this.calculateProjectProgress(nextPhases);
    const activeProject = this.selectedProject();
    if (!activeProject) return;
    const updatedProject = {
      ...activeProject,
      progressPercent,
      actualCost: nextPhases.flatMap((phase) => phase.activities).reduce((total, activity) => total + activity.actualCost, 0),
      constructionPhases: nextPhases,
      foundationSystem: this.selectedFoundationSystem(),
    };
    this.selectedProject.set(updatedProject);
    this.projects.update((projects) => {
      const updatedProjects = projects.map((project) => project.id === activeProject.id ? updatedProject : project);
      this.saveProjects(updatedProjects);
      return updatedProjects;
    });
  }

  protected activityProgressFromStatus(status: ActivityStatus): number {
    switch (status) {
      case 'Completed': return 100;
      case 'In Progress': return 65;
      case 'On Hold': return 40;
      case 'Delayed': return 45;
      default: return 0;
    }
  }

  protected statusFromProgress(progress: number): ActivityStatus {
    if (progress >= 100) return 'Completed';
    if (progress > 0) return 'In Progress';
    return 'Not Started';
  }

  protected calculateProjectProgress(phases: ConstructionPhase[] = this.constructionPhases()): number {
    const enabledActivities = phases.flatMap((phase) => phase.activities.filter((activity) => activity.isEnabled));
    if (!enabledActivities.length) return 0;
    const totalProgress = enabledActivities.reduce((sum, activity) => sum + activity.progress, 0);
    return Math.round(totalProgress / enabledActivities.length);
  }

  protected activePhase(): ConstructionPhase | undefined {
    return this.constructionPhases().find((phase) => phase.id === this.selectedPhaseId());
  }

  protected phaseTotals(): { phase: ConstructionPhase; enabledCount: number; completedCount: number; totalValue: number }[] {
    return this.constructionPhases().map((phase) => {
      const enabledActivities = phase.activities.filter((activity) => activity.isEnabled);
      const completedCount = enabledActivities.filter((activity) => activity.status === 'Completed').length;
      const totalValue = enabledActivities.reduce((sum, activity) => sum + activity.estimatedCost, 0);
      return { phase, enabledCount: enabledActivities.length, completedCount, totalValue };
    });
  }

  protected selectedPhaseActivities(): ConstructionActivity[] {
    return this.activePhase()?.activities.filter((activity) => activity.isEnabled || activity.isOptional) ?? [];
  }

  protected activePhaseSummary(): { enabledCount: number; completedCount: number; estimatedCost: number; actualCost: number } {
    const phase = this.activePhase();
    const enabledActivities = phase?.activities.filter((activity) => activity.isEnabled) ?? [];
    return {
      enabledCount: enabledActivities.length,
      completedCount: enabledActivities.filter((activity) => activity.status === 'Completed').length,
      estimatedCost: enabledActivities.reduce((sum, activity) => sum + activity.estimatedCost, 0),
      actualCost: enabledActivities.reduce((sum, activity) => sum + activity.actualCost, 0),
    };
  }

  protected phaseExpenses(phaseId: string) {
    const projectName = this.selectedProject()?.name;
    return this.expenses().filter(
      (expense) => expense.phaseId === phaseId && (!projectName || expense.project === projectName),
    );
  }

  protected phasePayments(phaseId: string) {
    const projectName = this.selectedProject()?.name;
    return this.payments().filter(
      (payment) => payment.phaseId === phaseId && (!projectName || payment.project === projectName),
    );
  }

  protected paymentIsCashIn(payment: { type: string }): boolean {
    return payment.type === 'Customer payment';
  }

  protected phaseCashIn(phaseId: string): number {
    return this.phasePayments(phaseId)
      .filter((payment) => this.paymentIsCashIn(payment))
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  protected phaseCashOut(phaseId: string): number {
    const expenseTotal = this.phaseExpenses(phaseId).reduce((sum, expense) => sum + expense.amount, 0);
    const outgoingPayments = this.phasePayments(phaseId)
      .filter((payment) => !this.paymentIsCashIn(payment))
      .reduce((sum, payment) => sum + payment.amount, 0);
    return expenseTotal + outgoingPayments;
  }

  protected phaseNetCash(phaseId: string): number {
    return this.phaseCashIn(phaseId) - this.phaseCashOut(phaseId);
  }

  protected phaseShortLabel(phaseId: string): string {
    if (!phaseId) return 'Unassigned';
    return `Phase ${phaseId}`;
  }

  protected openExpenseForPhase(phaseId: string): void {
    this.expenseForm.project = this.selectedProject()?.name ?? this.expenseForm.project;
    this.expenseForm.phaseId = phaseId;
    this.openExpenseForm();
  }

  protected openPaymentForPhase(phaseId: string): void {
    this.paymentForm.project = this.selectedProject()?.name ?? this.paymentForm.project;
    this.paymentForm.phaseId = phaseId;
    this.openPaymentForm();
  }

  protected visibleConstructionPhases(): ConstructionPhase[] {
    return this.constructionPhases();
  }

  protected totalEstimatedCost(): number {
    return this.constructionPhases().reduce(
      (total, phase) =>
        total + phase.activities.filter((activity) => activity.isEnabled).reduce((phaseTotal, activity) => phaseTotal + activity.estimatedCost, 0),
      0,
    );
  }

  protected totalActualCost(): number {
    return this.constructionPhases().reduce(
      (total, phase) =>
        total + phase.activities.filter((activity) => activity.isEnabled).reduce((phaseTotal, activity) => phaseTotal + activity.actualCost, 0),
      0,
    );
  }

  protected remainingEstimatedCost(): number {
    return this.totalEstimatedCost() - this.totalActualCost();
  }

  protected foundationOptionsList(): string[] {
    return foundationOptions;
  }

  protected action(module: string): void {
    this.moduleNotice.set(
      `${module} is ready. This workspace is prepared for live records and API synchronization.`,
    );
  }

  protected toggleTheme(): void {
    const enabled = !this.darkMode();
    this.darkMode.set(enabled);
    localStorage.setItem('slate.theme', enabled ? 'dark' : 'light');
  }

  protected changeDashboardPeriod(): void {
    const periods = ['This week', 'This month', 'This quarter'];
    const nextPeriod = periods[(periods.indexOf(this.dashboardPeriod()) + 1) % periods.length];
    this.dashboardPeriod.set(nextPeriod);
    this.moduleNotice.set(`Dashboard period changed to ${nextPeriod}.`);
  }

  private projectBudget(project: Project): number {
    return Number(project.estimatedBudget ?? 0);
  }

  private projectActualCost(project: Project): number {
    return Number(project.actualCost ?? 0);
  }

  protected generateReport(report: string): void {
    const currency = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    });
    let rows: string[][];
    switch (report) {
      case 'Project summary':
        rows = [
          ['Project', 'Client', 'Status', 'Budget (INR)', 'Actual cost (INR)', 'Progress'],
        ].concat(
          this.visibleProjects().map((project) => [
            project.name,
            project.clientName,
            project.status,
            currency.format(this.projectBudget(project)),
            currency.format(this.projectActualCost(project)),
            `${project.progressPercent}%`,
          ]),
        );
        break;
      case 'Budget vs actual':
        rows = [['Project', 'Budget (INR)', 'Actual cost (INR)', 'Variance (INR)']].concat(
          this.visibleProjects().map((project) => [
            project.name,
            currency.format(this.projectBudget(project)),
            currency.format(this.projectActualCost(project)),
            currency.format(this.projectBudget(project) - this.projectActualCost(project)),
          ]),
        );
        rows.push([
          'TOTAL',
          currency.format(
            this.visibleProjects().reduce(
              (total, project) => total + this.projectBudget(project),
              0,
            ),
          ),
          currency.format(
            this.visibleProjects().reduce(
              (total, project) => total + this.projectActualCost(project),
              0,
            ),
          ),
          currency.format(
            this.visibleProjects().reduce(
              (total, project) =>
                total + this.projectBudget(project) - this.projectActualCost(project),
              0,
            ),
          ),
        ]);
        break;
      case 'Material usage':
        rows = [
          ['Material', 'Category', 'Stock', 'Unit', 'Unit price (INR)', 'Stock value (INR)'],
        ].concat(
          this.visibleMaterials().map((material) => [
            material.name,
            material.category,
            String(material.stock),
            material.unit,
            currency.format(material.price),
            currency.format(material.stock * material.price),
          ]),
        );
        break;
      case 'Labour attendance':
        rows = [['Worker', 'Role', 'Project', 'Attendance', 'Daily wage (INR)']].concat(
          this.visibleLabour().map((worker) => [
            worker.name,
            worker.role,
            worker.project,
            worker.attendance,
            currency.format(worker.wage),
          ]),
        );
        break;
      case 'Payment report':
        rows = [
          ['Project', 'Party', 'Type', 'Reference', 'Status', 'Due date', 'Amount (INR)'],
        ].concat(
          this.visiblePayments().map((payment) => [
            payment.project,
            payment.party,
            payment.type,
            payment.invoice,
            payment.status,
            payment.due,
            currency.format(payment.amount),
          ]),
        );
        break;
      case 'Profit and loss':
        rows = [
          ['Project', 'Contract/budget (INR)', 'Actual cost (INR)', 'Estimated margin (INR)'],
        ].concat(
          this.visibleProjects().map((project) => [
            project.name,
            currency.format(this.projectBudget(project)),
            currency.format(this.projectActualCost(project)),
            currency.format(this.projectBudget(project) - this.projectActualCost(project)),
          ]),
        );
        rows.push([
          'TOTAL',
          currency.format(
            this.visibleProjects().reduce(
              (total, project) => total + this.projectBudget(project),
              0,
            ),
          ),
          currency.format(
            this.visibleProjects().reduce(
              (total, project) => total + this.projectActualCost(project),
              0,
            ),
          ),
          currency.format(
            this.visibleProjects().reduce(
              (total, project) =>
                total + this.projectBudget(project) - this.projectActualCost(project),
              0,
            ),
          ),
        ]);
        break;
      default:
        rows = [
          ['Report', 'Status'],
          [report, 'No data available'],
        ];
    }
    this.reportTitle.set(report);
    this.reportContent.set(
      rows
        .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','))
        .join('\n'),
    );
    this.showReportPreview.set(true);
  }

  protected closeReportPreview(): void {
    this.showReportPreview.set(false);
  }

  protected downloadReport(): void {
    const blob = new Blob([this.reportContent()], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.reportTitle()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '-')}-inr.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.moduleNotice.set(`${this.reportTitle()} downloaded as CSV.`);
  }

  protected projectOptions(): string[] {
    return [
      ...new Set([
        ...this.projects().map((project) => project.name),
        ...this.boqItems().map((item) => item.project),
        ...this.expenses().map((expense) => expense.project),
        ...this.payments().map((payment) => payment.project),
        ...this.labour.map((worker) => worker.project),
        ...this.materials.map((material) => material.project),
      ]),
    ].sort();
  }

  protected nextProjectCode(): string {
    const highestCode = this.projects().reduce((highest, project) => {
      const match = project.projectCode?.match(/PRJ-(\d+)/i);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return `PRJ-${String(highestCode + 1).padStart(4, '0')}`;
  }

  protected boqProjectOptions(): string[] {
    return [
      ...new Set([...this.projectOptions(), ...this.boqItems().map((item) => item.project)]),
    ].sort();
  }

  protected visibleBoqItems() {
    return this.selectedProjectFilter() === 'All projects'
      ? this.boqItems()
      : this.boqItems().filter((item) => item.project === this.selectedProjectFilter());
  }

  protected visibleProjects(): Project[] {
    return this.selectedProjectFilter() === 'All projects'
      ? this.projects()
      : this.projects().filter((project) => project.name === this.selectedProjectFilter());
  }

  protected visibleMaterials() {
    return this.selectedProjectFilter() === 'All projects'
      ? this.materials
      : this.materials.filter((material) => material.project === this.selectedProjectFilter());
  }

  protected visibleLabour() {
    return this.selectedProjectFilter() === 'All projects'
      ? this.labour
      : this.labour.filter((worker) => worker.project === this.selectedProjectFilter());
  }

  protected visibleExpenses() {
    return this.selectedProjectFilter() === 'All projects'
      ? this.expenses()
      : this.expenses().filter((expense) => expense.project === this.selectedProjectFilter());
  }

  protected visiblePayments() {
    return this.selectedProjectFilter() === 'All projects'
      ? this.payments()
      : this.payments().filter((payment) => payment.project === this.selectedProjectFilter());
  }

  protected openExpenseForm(): void {
    this.expenseFormError.set('');
    if (!this.expenseForm.project) this.expenseForm.project = this.projectOptions()[0] ?? '';
    this.showExpenseForm.set(true);
  }

  protected closeExpenseForm(): void {
    this.showExpenseForm.set(false);
  }

  protected async readReceipt(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.expenseFormError.set('Please select a receipt image file.');
      return;
    }
    this.receiptFileName.set(file.name);
    this.receiptPreview.set(URL.createObjectURL(file));
    this.isReadingReceipt.set(true);
    this.moduleNotice.set('Reading receipt image. Review the suggested fields before saving.');
    try {
      const { recognize } = await import('tesseract.js');
      const result = await recognize(file, 'eng');
      const text = result.data.text;
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const amountMatches =
        text.match(/(?:₹|INR|Rs\.?)[\s:]*([\d,]+(?:\.\d{1,2})?)/gi) ??
        text.match(/\b\d[\d,]*(?:\.\d{1,2})?\b/g) ??
        [];
      const amountText = amountMatches.at(-1)?.replace(/[^\d.]/g, '') ?? '';
      if (amountText) this.expenseForm.amount = Number(amountText.replace(/,/g, ''));
      if (!this.expenseForm.vendor && lines[0]) this.expenseForm.vendor = lines[0].slice(0, 80);
      if (!this.expenseForm.description && lines[1])
        this.expenseForm.description = lines[1].slice(0, 120);
      this.moduleNotice.set(
        amountText
          ? 'Receipt read. Amount and vendor suggestions were added; please review them.'
          : 'Receipt read. Please review the suggested fields before saving.',
      );
    } catch {
      this.expenseFormError.set(
        'The receipt could not be read. You can still enter the expense manually.',
      );
    } finally {
      this.isReadingReceipt.set(false);
    }
  }

  protected async generateExpenseBill(expense: {
    category: string;
    description: string;
    project: string;
    vendor: string;
    amount: number;
    date: string;
    receiptName: string;
  }): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();
    const currency = (amount: number) =>
      `INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const tax = expense.amount * 0.18;
    pdf.setFontSize(18);
    pdf.setTextColor(45, 118, 91);
    pdf.text('FIELDLINE CONSTRUCTION SERVICES', 20, 22);
    pdf.setFontSize(9);
    pdf.setTextColor(60, 60, 60);
    pdf.text('GSTIN: 27ABCDE1234F1Z5 | 123 Build Street, Mumbai, Maharashtra 400001', 20, 30);
    pdf.text('Email: accounts@fieldline.example | Phone: +91 98765 43210', 20, 36);
    pdf.setDrawColor(210, 220, 212);
    pdf.line(20, 42, 190, 42);
    pdf.setFontSize(14);
    pdf.setTextColor(28, 41, 39);
    pdf.text('EXPENSE BILL', 20, 55);
    pdf.setFontSize(10);
    pdf.text(`Bill no: EXP-${Date.now().toString().slice(-8)}`, 130, 55);
    pdf.text(`Date: ${expense.date}`, 130, 62);
    pdf.text(`Project: ${expense.project}`, 20, 70);
    pdf.text(`Vendor / payee: ${expense.vendor}`, 20, 77);
    pdf.text(`Category: ${expense.category}`, 20, 84);
    pdf.line(20, 92, 190, 92);
    pdf.text('Description', 20, 102);
    pdf.text('Amount', 155, 102);
    pdf.text(expense.description.slice(0, 80), 20, 112);
    pdf.text(currency(expense.amount), 155, 112);
    pdf.line(20, 120, 190, 120);
    pdf.text('Subtotal', 125, 132);
    pdf.text(currency(expense.amount), 155, 132);
    pdf.text('GST (18%)', 125, 140);
    pdf.text(currency(tax), 155, 140);
    pdf.setFontSize(12);
    pdf.text('Total', 125, 151);
    pdf.text(currency(expense.amount + tax), 155, 151);
    pdf.setFontSize(9);
    pdf.text(
      'Computer-generated expense bill. Header and tax details are currently demo values.',
      20,
      180,
    );
    pdf.save(`expense-bill-${expense.project.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.pdf`);
  }

  protected createExpense(): void {
    const form = this.expenseForm;
    if (
      !form.project ||
      !form.description.trim() ||
      !form.vendor.trim() ||
      form.amount <= 0 ||
      !form.date
    ) {
      this.expenseFormError.set(
        'Project, description, vendor, date, and an amount greater than zero are required.',
      );
      return;
    }

    const expense = {
      category: form.category,
      description: form.description.trim(),
      project: form.project,
      phaseId: form.phaseId,
      vendor: form.vendor.trim(),
      amount: Number(form.amount),
      date: new Date(`${form.date}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      receiptName: this.receiptFileName(),
    };
    this.expenses.update((expenses) => [expense, ...expenses]);
    this.projects.update((projects) => {
      const updatedProjects = projects.map((project) =>
        project.name === expense.project
          ? { ...project, actualCost: project.actualCost + expense.amount }
          : project,
      );
      this.saveProjects(updatedProjects);
      return updatedProjects;
    });
    this.moduleNotice.set(`Expense added to ${expense.project}.`);
    Object.assign(form, {
      project: '',
      phaseId: '',
      category: 'Materials',
      description: '',
      vendor: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Bank transfer',
      notes: '',
    });
    this.receiptPreview.set('');
    this.receiptFileName.set('');
    this.showExpenseForm.set(false);
  }

  protected openPaymentForm(): void {
    this.paymentFormError.set('');
    if (!this.paymentForm.project) this.paymentForm.project = this.projectOptions()[0] ?? '';
    this.showPaymentForm.set(true);
  }

  protected openMaterialForm(): void {
    this.materialFormError.set('');
    if (!this.materialForm.project) this.materialForm.project = this.projectOptions()[0] ?? '';
    this.showMaterialForm.set(true);
  }

  protected closeMaterialForm(): void {
    this.showMaterialForm.set(false);
  }

  protected receiveMaterial(): void {
    const form = this.materialForm;
    if (
      !form.name.trim() ||
      !form.project ||
      !form.supplier.trim() ||
      form.quantity <= 0 ||
      form.minimum < 0 ||
      form.price < 0
    ) {
      this.materialFormError.set(
        'Material name, project, supplier, quantity, reorder level, and unit price are required.',
      );
      return;
    }

    const received = {
      name: form.name.trim(),
      project: form.project,
      category: form.category,
      unit: form.unit,
      stock: Number(form.quantity),
      minimum: Number(form.minimum),
      price: Number(form.price),
      supplier: form.supplier.trim(),
    };
    const existing = this.materials.find(
      (material) =>
        material.name.toLowerCase() === received.name.toLowerCase() &&
        material.project === received.project,
    );
    if (existing) {
      existing.stock += received.stock;
      existing.minimum = received.minimum;
      existing.price = received.price;
      existing.supplier = received.supplier;
    } else {
      this.materials.unshift(received);
    }
    this.moduleNotice.set(`${received.stock} ${received.unit} of ${received.name} received into inventory.`);
    Object.assign(form, {
      name: '',
      project: '',
      category: 'Concrete',
      unit: 'bags',
      quantity: 0,
      minimum: 0,
      price: 0,
      supplier: '',
    });
    this.showMaterialForm.set(false);
  }

  protected closePaymentForm(): void {
    this.showPaymentForm.set(false);
  }

  protected openEmployeeHistory(employee: {
    name: string;
    role: string;
    project: string;
    attendance: string;
    wage: number;
  }): void {
    this.selectedEmployee.set(employee);
    this.showEmployeeHistory.set(true);
  }

  protected closeEmployeeHistory(): void {
    this.showEmployeeHistory.set(false);
    this.selectedEmployee.set(null);
  }

  protected employeeHistory(employee: {
    name: string;
    role: string;
    project: string;
    attendance: string;
  }): { period: string; project: string; work: string; status: string }[] {
    const workByRole: Record<string, string> = {
      'Site engineer': 'Site supervision, measurements, and daily progress review',
      'Concrete foreman': 'Foundation concrete, reinforcement, and curing coordination',
      'Procurement lead': 'Material ordering, delivery checks, and supplier coordination',
      'Masonry contractor': 'External blockwork, wall alignment, and finishing preparation',
    };
    return [
      {
        period: 'Current assignment',
        project: employee.project,
        work: workByRole[employee.role] ?? 'Construction site operations',
        status: employee.attendance,
      },
      {
        period: 'Previous assignment',
        project: employee.project,
        work: 'Completed assigned construction activities and submitted site records',
        status: 'Completed',
      },
    ];
  }

  protected employeeAttendanceHistory(employee: {
    attendance: string;
  }): { date: string; status: string; hours: string; project: string }[] {
    return [
      {
        date: '13 Sep 2026',
        status: employee.attendance,
        hours: employee.attendance === 'Present' ? '8 hours' : 'Awaiting entry',
        project: 'Current assignment',
      },
      { date: '12 Sep 2026', status: 'Present', hours: '8 hours', project: 'Current assignment' },
      { date: '11 Sep 2026', status: 'Present', hours: '8 hours', project: 'Current assignment' },
      { date: '10 Sep 2026', status: 'Half day', hours: '4 hours', project: 'Current assignment' },
    ];
  }

  protected createPayment(): void {
    const form = this.paymentForm;
    if (
      !form.project ||
      !form.party.trim() ||
      !form.invoice.trim() ||
      form.amount <= 0 ||
      !form.due
    ) {
      this.paymentFormError.set(
        'Project, party, invoice number, due date, and an amount greater than zero are required.',
      );
      return;
    }
    if (
      this.payments().some(
        (payment) => payment.invoice.toLowerCase() === form.invoice.trim().toLowerCase(),
      )
    ) {
      this.paymentFormError.set('An invoice or reference with this number already exists.');
      return;
    }

    const payment = {
      project: form.project,
      phaseId: form.phaseId,
      type: form.type,
      party: form.party.trim(),
      invoice: form.invoice.trim(),
      amount: Number(form.amount),
      status: form.status,
      due: new Date(`${form.due}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
    const projectName = form.project;
    this.payments.update((payments) => [payment, ...payments]);
    this.moduleNotice.set(`Payment ${payment.invoice} added to ${projectName}.`);
    Object.assign(form, {
      project: '',
      phaseId: '',
      type: 'Supplier payment',
      party: '',
      invoice: '',
      amount: 0,
      status: 'Pending',
      due: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Bank transfer',
      notes: '',
    });
    this.showPaymentForm.set(false);
  }

  protected openBoqForm(): void {
    this.boqFormError.set('');
    if (!this.boqForm.project) this.boqForm.project = this.projectOptions()[0] ?? '';
    this.showBoqForm.set(true);
  }

  protected closeBoqForm(): void {
    this.showBoqForm.set(false);
  }

  protected createBoqItem(): void {
    if (
      !this.boqForm.project ||
      !this.boqForm.description.trim() ||
      this.boqForm.quantity <= 0 ||
      this.boqForm.rate < 0
    ) {
      this.boqFormError.set('Project, description, quantity, and a valid rate are required.');
      return;
    }

    this.boqItems.update((items) => [
      ...items,
      {
        project: this.boqForm.project,
        category: this.boqForm.category,
        description: this.boqForm.description.trim(),
        unit: this.boqForm.unit,
        quantity: this.boqForm.quantity,
        rate: this.boqForm.rate,
        amount: this.boqForm.quantity * this.boqForm.rate,
      },
    ]);
    this.moduleNotice.set(`BOQ item '${this.boqForm.description.trim()}' added successfully.`);
    Object.assign(this.boqForm, {
      project: '',
      category: 'Concrete',
      description: '',
      unit: 'm³',
      quantity: 1,
      rate: 0,
    });
    this.showBoqForm.set(false);
  }

  protected lowStockCount(): number {
    return this.visibleMaterials().filter((material) => material.stock < material.minimum).length;
  }

  protected readonly stockValue = (total: number, material: { stock: number; price: number }) =>
    total + material.stock * material.price;
  protected readonly boqTotal = (total: number, item: { amount: number }) => total + item.amount;
  protected readonly expenseTotal = (total: number, expense: { amount: number }) =>
    total + expense.amount;
  protected readonly paymentTotal = (total: number, payment: { amount: number }) =>
    total + payment.amount;

  protected openProjectForm(): void {
    this.formError.set('');
    this.projectForm.projectCode = this.nextProjectCode();
    this.showProjectForm.set(true);
  }

  protected closeProjectForm(): void {
    this.showProjectForm.set(false);
  }

  protected createProject(): void {
    if (this.isSubmitting()) return;
    if (
      !this.projectForm.name.trim() ||
      !this.projectForm.clientName.trim() ||
      this.projectForm.estimatedBudget < 0
    ) {
      this.formError.set('Project name, client name, and a valid budget are required.');
      return;
    }

    const duplicate = this.projects().some(
      (project) =>
        (this.projectForm.projectCode.trim() &&
          project.projectCode === this.projectForm.projectCode.trim()) ||
        project.name.trim().toLowerCase() === this.projectForm.name.trim().toLowerCase(),
    );
    if (duplicate) {
      this.formError.set('A project with this code or name already exists.');
      return;
    }

    this.isSubmitting.set(true);
    const request = { ...this.projectForm };
    this.projectsService.createProject(request).subscribe({
      next: (project) => this.addProject(project),
      error: () =>
        this.addProject({
          id: crypto.randomUUID(),
          projectCode: request.projectCode || `PRJ-${this.projects().length + 1}`.padStart(7, '0'),
          name: request.name,
          clientName: request.clientName,
          siteAddress: request.siteAddress,
          estimatedBudget: request.estimatedBudget,
          actualCost: 0,
          progressPercent: 0,
          status: 'Planning',
          foundationSystem: request.foundationSystem,
          constructionPhases: createDefaultConstructionPhases(),
        }),
    });
  }

  private addProject(project: Project): void {
    const projectWithConstructionPlan: Project = {
      ...project,
      foundationSystem: project.foundationSystem ?? this.projectForm.foundationSystem,
      constructionPhases: project.constructionPhases ?? createDefaultConstructionPhases(),
    };
    this.projects.update((projects) => {
      const updatedProjects = [...projects, projectWithConstructionPlan];
      this.saveProjects(updatedProjects);
      return updatedProjects;
    });
    this.isSubmitting.set(false);
    this.showProjectForm.set(false);
    Object.assign(this.projectForm, {
      projectCode: '',
      name: '',
      clientName: '',
      clientContact: '',
      siteAddress: '',
      startDate: '',
      expectedCompletionDate: '',
      foundationSystem: 'Standard/RR foundation',
      estimatedBudget: 0,
      projectManager: '',
      description: '',
    });
  }

  private readSavedProjects(): Project[] {
    try {
      const saved = localStorage.getItem(this.projectStorageKey);
      if (saved) return JSON.parse(saved) as Project[];

      const legacySaved = localStorage.getItem('fieldline.projects');
      if (!legacySaved) return [];

      const projects = JSON.parse(legacySaved) as Project[];
      localStorage.setItem(this.projectStorageKey, JSON.stringify(projects));
      return projects;
    } catch {
      return [];
    }
  }

  private saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(this.projectStorageKey, JSON.stringify(projects));
    } catch {
      // Storage may be unavailable in private browsing or restricted environments.
    }
  }

  protected averageProgress(projects: { progressPercent: number }[]): number {
    return projects.length === 0
      ? 0
      : Math.round(
          projects.reduce((total, project) => total + project.progressPercent, 0) / projects.length,
        );
  }
  protected chartProjects(): Project[] {
    return this.visibleProjects()
      .slice()
      .sort((left, right) => this.projectBudget(right) - this.projectBudget(left))
      .slice(0, 6);
  }
  protected chartBudgetWidth(project: Project): number {
    const maximum = Math.max(...this.chartProjects().map((item) => this.projectBudget(item)), 1);
    return Math.round((this.projectBudget(project) / maximum) * 100);
  }
  protected chartActualWidth(project: Project): number {
    const maximum = Math.max(...this.chartProjects().map((item) => this.projectBudget(item)), 1);
    return Math.min(100, Math.round((this.projectActualCost(project) / maximum) * 100));
  }
  protected expenseCategoryTotals(): { category: string; amount: number; width: number }[] {
    const totals = new Map<string, number>();
    for (const expense of this.visibleExpenses())
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    const values = [...totals.entries()].sort((left, right) => right[1] - left[1]);
    const maximum = Math.max(values[0]?.[1] ?? 0, 1);
    return values.map(([category, amount]) => ({
      category,
      amount,
      width: Math.round((amount / maximum) * 100),
    }));
  }
  protected paymentStatusTotals(): { status: string; count: number; width: number }[] {
    const totals = new Map<string, number>();
    for (const payment of this.visiblePayments())
      totals.set(payment.status, (totals.get(payment.status) ?? 0) + 1);
    const values = [...totals.entries()];
    const maximum = Math.max(...values.map(([, count]) => count), 1);
    return values.map(([status, count]) => ({
      status,
      count,
      width: Math.round((count / maximum) * 100),
    }));
  }
  protected totalStockValue(): number {
    return this.visibleMaterials().reduce(this.stockValue, 0);
  }

  protected budgetExceeded(project: Project): boolean {
    return this.projectActualCost(project) > this.projectBudget(project);
  }

  protected scheduleAtRisk(project: Project): boolean {
    if (project.status === 'Delayed') return true;
    if (
      !project.expectedCompletionDate ||
      project.status === 'Completed' ||
      project.status === 'Cancelled'
    )
      return false;
    return new Date(project.expectedCompletionDate).getTime() < Date.now();
  }

  protected projectRiskLabel(project: Project): string {
    if (this.budgetExceeded(project) && this.scheduleAtRisk(project))
      return 'Budget and schedule risk';
    if (this.budgetExceeded(project)) return 'Budget exceeded';
    if (this.scheduleAtRisk(project)) return 'Schedule risk';
    return '';
  }

  protected riskProjects(): Project[] {
    return this.visibleProjects().filter(
      (project) => this.budgetExceeded(project) || this.scheduleAtRisk(project),
    );
  }
}
