export const convertStringToUrl = (s) => {
  return s
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/g)
    .join("-");
};
