export const generateSlug = (title: string) => {
  return title
    .split(' ')
    .map((item) => item.toLocaleLowerCase())
    .join('-');
};
