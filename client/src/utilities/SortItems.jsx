// Utility function to sort items by a specific property in descending order
export const sortByPropertyDesc = (items, property) => {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => (b[property] || 0) - (a[property] || 0));
};
