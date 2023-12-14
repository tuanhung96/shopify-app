export const sortPages = (pages, sortBy) => {
  switch (sortBy) {
    case "TITLE_ASC":
      pages.sort((a, b) => a.title.localeCompare(b.title));
      break;

    case "TITLE_DESC":
      pages.sort((a, b) => b.title.localeCompare(a.title));
      break;

    case "DATE_UPDATED_ASC":
      pages.sort(
        (a, b) =>
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      );
      break;

    case "DATE_UPDATED_DESC":
      pages.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      break;
    default:
  }
  return pages;
};
