const voiceOptions = [
  "en-US-AndrewMultilingualNeural",
  "en-US-ChristopherNeural",
  "en-US-EricNeural",
  "vi-VN-HoaiMyNeural",
  "vi-VN-NamMinhNeura",
];

document.addEventListener("DOMContentLoaded", function () {
  const exportContainer = document.getElementById("export-container");
  const voiceA = document.getElementById("voice-a");
  const voiceB = document.getElementById("voice-b");
  const textareaSource = document.getElementById("textarea-source");
  const highlightedSSML = document.getElementById("highlighted-ssml");

  /* ==================== Initialization ======================== */
  (function () {
    voiceOptions.map((voice) => {
      voiceA.append(createVoiceOption("Voice A", voice));
      voiceB.append(createVoiceOption("Voice B", voice));
    });

    function createVoiceOption(voiceType, voice) {
      const voiceOption = document.createElement("option");
      voiceOption.value = voice;
      voiceOption.textContent = `${voiceType}: ${voice}`;

      return voiceOption;
    }

    voiceA.value = voiceOptions[0];
    voiceB.value = voiceOptions[1];

    textareaSource.addEventListener("keydown", handleKeydown);
    voiceA.addEventListener("change", handleKeydown);
    voiceB.addEventListener("change", handleKeydown);

    textareaSource.value = "A: ";
  })();

  /* ==================== Events ======================== */
  function handleKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      let currentText = textareaSource.value.trim();
      const lines = textareaSource.value.split("\n");
      const lineLast = lines.slice(-1)[0];
      const voiceID = lineLast.trimStart().trim().slice(0, 2).toUpperCase();
      const currentSpeaker = voiceID === "A:" ? "B:" : "A:";

      if (
        (voiceID === "A:" || voiceID === "B:") &&
        lineLast.trim().length > 2
      ) {
        currentText += `\n${currentSpeaker} `;
        textareaSource.value = currentText;
      }

      return;
    }

    setTimeout(() => {
      parseSSML(textareaSource);
    }, 0);
  }

  function handlerVoiceChoose() {
    if (textareaSource.value.length > 3) {
      parseSSML(textareaSource);
    }
  }

  function handlerCopyToClipboard(ssml) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ssml).catch((err) => {
        console.error("Clipboard API failed:", err);
      });
    } else {
      console.log("Clipboard API not available, using fallback");
    }
  }

  function handlerExportSSML(ssml) {
    try {
      const blob = new Blob([ssml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "speech.ssml";

      const filename = `${Date.now()}.ssml`;
      if (filename) {
        a.download =
          filename.endsWith(".ssml") || filename.endsWith(".xml")
            ? filename
            : filename + ".ssml";
      }

      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Export error:", err);
    }
  }

  /* ====================== Listener ============================*/
  function addEventListenerCopyBtn(highlightedSSML, ssml) {
    const uniqueId = randomUniqueId();

    const copyBtnClassname = `btn-${uniqueId}-copy`;

    const copyBtnHTML = `<button id="${copyBtnClassname}" class="btn-copy">
      <img src="./copy_icon.svg" style="width: 24px;" />
    </button>`;

    highlightedSSML.insertAdjacentHTML("beforeend", copyBtnHTML);

    document
      .getElementById(copyBtnClassname)
      .addEventListener("click", function () {
        handlerCopyToClipboard(ssml);
      });
  }

  function addEventListenerExportBtn(exportContainer, ssml) {
    const uniqueId = randomUniqueId();

    const copyExportClassname = `btn-${uniqueId}-export`;

    const exportBtnHTML = `<button id="${copyExportClassname}" class="btn-export">Xuất SSML</button>`;

    exportContainer.innerHTML = exportBtnHTML;

    document
      .getElementById(copyExportClassname)
      .addEventListener("click", function () {
        handlerExportSSML(ssml);
      });
  }

  /* ===================== Utils =============================*/
  function parseSSML(textareaSource) {
    let ssml = `<speak xml:lang="vi-VN">`;
    const lines = textareaSource.value.split("\n");
    lines.forEach((line) => {
      const matchA = line.trimStart().match(/^A:(.*)/);
      const matchB = line.trimStart().match(/^B:(.*)/);

      if (matchA && matchA[1].trim()) {
        ssml += `<voice name="${voiceA.value}">${matchA[1].trim()}</voice>\n`;
      } else if (matchB && matchB[1].trim()) {
        ssml += `<voice name="${voiceB.value}">${matchB[1].trim()}</voice>\n`;
      }
    });
    ssml += "</speak>";

    if (ssml.indexOf("</voice>") === -1) {
      highlightedSSML.innerHTML = "";
      exportContainer.innerHTML = "";
      return;
    }

    highlightedSSML.innerHTML = highlightSyntax(ssml);

    addEventListenerCopyBtn(highlightedSSML, ssml);
    addEventListenerExportBtn(exportContainer, ssml);
  }

  function highlightSyntax(ssml) {
    if (!ssml) return "";

    // Escape HTML entities to prevent XSS
    const escapeHTML = (text) => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    // Escaped SSML text for safe processing
    const escapedSSML = escapeHTML(ssml);

    let highlighted = escapedSSML
      // Highlight SSML tags
      .replace(
        /&lt;(\/?[a-zA-Z][a-zA-Z0-9:-]*)(\s|&gt;)/g,
        '&lt;<span class="tag">$1</span>$2'
      )

      // Highlight attributes
      .replace(
        /(\s)([a-zA-Z][a-zA-Z0-9:-]*)=(&quot;|&#039;)/g,
        '$1<span style="color: #7d8ca0;">$2</span>=$3'
      )

      // Highlight attribute values
      .replace(
        /=(&quot;|&#039;)(.*?)(\1)/g,
        '=<span class="value">$1$2$3</span>'
      )

      // Highlight the closing angle bracket of tags
      .replace(/(\s?)&gt;/g, '$1<span class="tag">&gt;</span>');

    return `<pre>${highlighted}</pre>`;
  }

  function randomUniqueId() {
    const uniqueId = Math.random().toString(36).substring(2, 9);
    return uniqueId;
  }
});
