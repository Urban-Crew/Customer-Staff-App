import type { Service } from '@ub/shared-types';

const MOCK_SERVICES: Service[] = [
  { id: 'electrician', name: 'Electrician', icon: 'Zap' },
  { id: 'plumber', name: 'Plumber', icon: 'Wrench' },
  { id: 'ac-repair', name: 'AC Repair', icon: 'Wind' },
  { id: 'cleaning', name: 'Home Cleaning', icon: 'Sparkles' },
  { id: 'salon', name: 'Salon at Home', icon: 'Scissors' },
  { id: 'pest-control', name: 'Pest Control', icon: 'Bug' },
  { id: 'appliance-repair', name: 'Appliance Repair', icon: 'Hammer' },
  { id: 'painting', name: 'Painting', icon: 'PaintBucket' },
];

export async function getServices(): Promise<Service[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_SERVICES;
}
