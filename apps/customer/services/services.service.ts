import type { Service } from '@ub/shared-types';

const PLACEHOLDER_IMAGE =
  'https://res.cloudinary.com/duhuphymw/image/upload/v1787826299/air_conditioner_PNG73_aoyqas.png';

const MOCK_SERVICES: Service[] = [
  { id: 'electrician', name: 'Electrician', imageUrl: PLACEHOLDER_IMAGE },
  { id: 'plumber', name: 'Plumber', imageUrl: PLACEHOLDER_IMAGE },
  { id: 'ac-repair', name: 'AC Repair', imageUrl: PLACEHOLDER_IMAGE },
  { id: 'cleaning', name: 'Home Cleaning', imageUrl: PLACEHOLDER_IMAGE },
  { id: 'salon', name: 'Salon at Home', imageUrl: PLACEHOLDER_IMAGE },
  { id: 'pest-control', name: 'Pest Control', imageUrl: PLACEHOLDER_IMAGE },
  { id: 'appliance-repair', name: 'Appliance Repair', imageUrl: PLACEHOLDER_IMAGE },
  { id: 'painting', name: 'Painting', imageUrl: PLACEHOLDER_IMAGE },
];

export async function getServices(): Promise<Service[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_SERVICES;
}
