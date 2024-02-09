export const createElsFromTemplate = (html) => {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    return tpl.content.children;
};
