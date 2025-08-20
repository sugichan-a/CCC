// テキストをサニタイズしてXSS攻撃を防ぐ

export const sanitizeText = (text) => {
  if (typeof text !== "string") {
    return "";
  }

  const escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (match) => escapeMap[match]);
};
