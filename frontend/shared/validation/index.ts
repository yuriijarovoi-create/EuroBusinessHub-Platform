export function isValidModuleId(id: string): boolean {
  const valid = [
    'dashboard', 'marketplace', 'transport', 'logistik', 'unternehmen', 'jobs',
    'lager', 'partner', 'digitale-produkte', 'akademie', 'ki', 'services',
    'analytics', 'payments', 'admin',
  ];
  return valid.includes(id);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
