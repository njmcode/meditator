export const createElsFromTemplate = (html: string): HTMLCollection => {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  return tpl.content.children;
};
