/**
 * HostelFix Hostel & Gender Configuration (Client)
 * 
 * Boys Hostels:
 * - Sarabhai Hostel
 * - Bose Hostel
 * - Aryabhata Hostel
 * 
 * Girls Hostels:
 * - Bose Hostel
 * - Gargi Hostel
 * - Kalpana Hostel
 * - Teresa Hostel
 */

export const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
];

export const BOYS_HOSTELS = [
  'Sarabhai Hostel',
  'Bose Hostel',
  'Aryabhata Hostel',
];

export const GIRLS_HOSTELS = [
  'Bose Hostel',
  'Gargi Hostel',
  'Kalpana Hostel',
  'Teresa Hostel',
];

export const ALL_HOSTELS = [
  'Sarabhai Hostel',
  'Bose Hostel',
  'Aryabhata Hostel',
  'Gargi Hostel',
  'Kalpana Hostel',
  'Teresa Hostel',
];

export function getHostelsByGender(gender) {
  if (!gender) return ALL_HOSTELS;
  const upper = gender.toUpperCase();
  if (upper === 'FEMALE') return GIRLS_HOSTELS;
  if (upper === 'MALE') return BOYS_HOSTELS;
  return ALL_HOSTELS;
}

export function isValidHostelForGender(hostelName, gender) {
  if (!hostelName) return true;
  if (!gender) return ALL_HOSTELS.includes(hostelName);
  const allowed = getHostelsByGender(gender);
  return allowed.includes(hostelName);
}
