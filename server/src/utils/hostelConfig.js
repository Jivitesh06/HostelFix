/**
 * HostelFix Hostel & Gender Configuration
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

const GENDERS = ['MALE', 'FEMALE'];

const BOYS_HOSTELS = [
  'Sarabhai Hostel',
  'Bose Hostel',
  'Aryabhata Hostel',
];

const GIRLS_HOSTELS = [
  'Bose Hostel',
  'Gargi Hostel',
  'Kalpana Hostel',
  'Teresa Hostel',
];

const ALL_HOSTELS = [
  'Sarabhai Hostel',
  'Bose Hostel',
  'Aryabhata Hostel',
  'Gargi Hostel',
  'Kalpana Hostel',
  'Teresa Hostel',
];

function getHostelsByGender(gender) {
  if (!gender) return ALL_HOSTELS;
  const upper = gender.toUpperCase();
  if (upper === 'FEMALE') return GIRLS_HOSTELS;
  if (upper === 'MALE') return BOYS_HOSTELS;
  return ALL_HOSTELS;
}

function isValidHostelForGender(hostelName, gender) {
  if (!hostelName) return true;
  if (!gender) return ALL_HOSTELS.includes(hostelName);
  const allowed = getHostelsByGender(gender);
  return allowed.includes(hostelName);
}

module.exports = {
  GENDERS,
  BOYS_HOSTELS,
  GIRLS_HOSTELS,
  ALL_HOSTELS,
  getHostelsByGender,
  isValidHostelForGender,
};
