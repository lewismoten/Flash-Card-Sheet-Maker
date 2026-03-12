export const isPlainObject = value =>
  value && typeof value === 'object' 
  && !Array.isArray(value);