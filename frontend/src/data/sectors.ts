import { Sector } from '../types';

export const SECTORS: Sector[] = [
  {
    id: 'vision',
    label: 'VISION',
    sub: ['8 Questions', 'Shared by All'],
    startAngle: -90,
    endAngle: -30,
    centerAngle: -60,
    description:
      'Establish clear company direction -- core values, 10-year target, 3-year picture, and 1-year plan. Ensures everyone is aligned on where the business is headed.',
    color: { base: '#e8560a', hover: '#f26a1a' },
  },
  {
    id: 'data',
    label: 'DATA',
    sub: ['Scorecard', 'Measurables'],
    startAngle: -30,
    endAngle: 30,
    centerAngle: 0,
    description:
      'Remove subjectivity with a data-driven culture. Weekly KPI scorecards, activity and revenue measurables, and clear numbers every person owns.',
    color: { base: '#d94e08', hover: '#eb5f10' },
  },
  {
    id: 'process',
    label: 'PROCESS',
    sub: ['Documented', 'Followed by All'],
    startAngle: 30,
    endAngle: 90,
    centerAngle: 60,
    description:
      'Document and systematize the core ways your business runs -- so every team member follows the same proven processes, every time.',
    color: { base: '#c24608', hover: '#d35510' },
  },
  {
    id: 'traction',
    label: 'TRACTION',
    sub: ['Rocks', 'Meeting Pulse'],
    startAngle: 90,
    endAngle: 150,
    centerAngle: 120,
    description:
      'Execute the vision through quarterly Rocks, Level 10 meetings, and a weekly cadence that drives accountability across every seat.',
    color: { base: '#b83f08', hover: '#ca4e10' },
  },
  {
    id: 'issues',
    label: 'ISSUES',
    sub: ['Issues List', 'IDS'],
    startAngle: 150,
    endAngle: 210,
    centerAngle: 180,
    description:
      'Tackle problems at the root. IDS (Identify, Discuss, Solve) eliminates recurring issues and keeps your business moving forward permanently.',
    color: { base: '#c24608', hover: '#d35510' },
  },
  {
    id: 'people',
    label: 'PEOPLE',
    sub: ['Right People', 'Right Seats'],
    startAngle: 210,
    endAngle: 270,
    centerAngle: 240,
    description:
      'Build a team who share your core values AND have the right skills for their roles. The foundation everything else is built upon.',
    color: { base: '#d94e08', hover: '#eb5f10' },
  },
];

export const VALID_SECTOR_IDS = SECTORS.map((s) => s.id);
