export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getDate();

  d.setMonth(d.getMonth() + months);

  // Fix: si le mois cible est plus court (ex: 31 -> 30/28)
  if (d.getDate() < day) {
    d.setDate(0); // dernier jour du mois précédent
  }
  return d;
}