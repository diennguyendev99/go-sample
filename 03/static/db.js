export async function insertDB(contentRaw, contentWords, contentTranslated) {
  const contentRawFormat = contentRaw.trim().replaceAll("<br>", "");
  const contentWordsFormat = contentWords.trim().replaceAll("<br>", "");
  const contentTranslatedFormat = contentTranslated
    .trim()
    .replaceAll("<br>", "");

  const response = await fetch("/dialog-word", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      dialog: { lang: "vi", content: contentRawFormat },
      word: {
        lang: "vi",
        content: contentWordsFormat,
        translate: contentTranslatedFormat,
      },
    }),
  });
}
