function decodeHtmlEntities(str) {
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent;
}

function createQuestionHtml(html) {
  return `
          <div class="message-question-container container">
              <div class="message-question">
                  ${html}
              </div>
          </div>
      `;
}

function createReplyHtml(html) {
  return `
          <div class="message-reply-container container">
              <div class="message-reply">
                  <div id="math-container">
                      ${html}
                  </div>
              </div>
          </div>
      `;
}

function renderMathJax() {
  MathJax.typeset();
}

export {
  decodeHtmlEntities,
  createQuestionHtml,
  createReplyHtml,
  renderMathJax,
};
