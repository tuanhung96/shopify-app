export const convertHtmlToText = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText;
};
