export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '';
  return 'Rp ' + Math.floor(value).toLocaleString('id-ID');
};
