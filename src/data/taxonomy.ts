export const TOPICS = {
  'quantum-algorithms': 'Quantum algorithms',
  'error-mitigation': 'Error mitigation',
  'quantum-information': 'Quantum information',
  qml: 'Quantum machine learning',
  optimisation: 'Optimisation',
  'ml-chemistry': 'Machine learning for chemistry',
  materials: 'Materials and DFT',
  education: 'Education',
} as const;

export const PUB_TYPES = {
  journal: 'Journal',
  preprint: 'Preprint',
  conference: 'Conference',
  thesis: 'Thesis',
} as const;

export type Topic = keyof typeof TOPICS;
export type PubType = keyof typeof PUB_TYPES;
