export const getSupportImagePath = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img.trim() || null;
  return img.path || null;
};
