import { promptList } from "./constants.js";
import {
  decodeHtmlEntities,
  createQuestionHtml,
  createReplyHtml,
  renderMathJax,
} from "./utils.js";
import { createTimer } from "./timer.js";
import { insertDB } from "./db.js";

document.addEventListener("DOMContentLoaded", function () {
  const TIMER = createTimer();
  const AUTOMATION = createAutomation();

  const messageContainer = document.getElementById("message-container");
  const timerDiv = document.getElementById("timer");

  messageContainer.scrollTop = messageContainer.scrollHeight;

  document.getElementById("btn-auto").addEventListener("click", (event) => {
    if (event.target.value == "Bắt đầu") {
      event.target.value = "Kết thúc";
      TIMER.startTimer(timerDiv);
      AUTOMATION.startLoop();
    } else {
      timerDiv.textContent = "00:00:00";
      event.target.value = "Bắt đầu";
      TIMER.stopTimer(timerDiv);
      AUTOMATION.stopLoop();
    }
  });

  function createAutomation() {
    let index = 0;
    let isRunning = false;
    let replyMessage = "";
    let contentRaw = "";
    let contentWords = "";
    let contentTranslated = "";

    async function sendPrompt(prompt) {
      try {
        const response = await fetch("/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: prompt }),
        });

        if (!response.ok) {
          console.error("Error:", error);
          messageContainer.insertAdjacentHTML(
            "beforeend",
            createReplyHtml("Có lỗi xảy ra khi gửi yêu cầu.")
          );
          return;
        }

        const data = await response.json();

        replyMessage = decodeHtmlEntities(
          data.htmlContent.match(/<code[^>]*>([\s\S]*?)<\/code>/g).slice(-1)
        ).replaceAll("\n", "<br>");

        messageContainer.insertAdjacentHTML(
          "beforeend",
          createReplyHtml(data.htmlContent)
        );
        renderMathJax();

        if (index === 0) {
          contentRaw = replyMessage;
        }

        if (index === 1) {
          contentWords = replyMessage;
        }

        if (index === 2) {
          contentTranslated = replyMessage;

          if (contentRaw && contentWords && contentTranslated) {
            await insertDB(contentRaw, contentWords, contentTranslated);
            console.log("Saved Data");
          }
          contentRaw = "";
          contentWords = "";
          contentTranslated = "";
        }
      } catch (error) {
        console.error("Error:", error);
        messageContainer.insertAdjacentHTML(
          "beforeend",
          createReplyHtml("Có lỗi xảy ra khi gửi yêu cầu.")
        );
        index = 0;
        replyMessage = "";
        contentRaw = "";
        contentWords = "";
        contentTranslated = "";
      } finally {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }

    async function parerInput() {
      const prompt = promptList[index]
        .join("\n")
        .replace("<replyMessage>", replyMessage);

      messageContainer.insertAdjacentHTML(
        "beforeend",
        createQuestionHtml(prompt)
      );

      await sendPrompt(prompt.replaceAll("<br>"));

      index++;

      if (index >= promptList.length) {
        index = 0;
        console.log("Đã gửi hết dữ liệu, quay lại từ đầu.");
      }
    }

    async function runLoop() {
      await parerInput();

      while (isRunning) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await parerInput();
      }
    }

    function startLoop() {
      if (isRunning) return;
      isRunning = true;
      runLoop();
    }

    function stopLoop() {
      if (!isRunning) return;
      isRunning = false;
      console.log("Đã dừng vòng lặp.");
    }

    return {
      startLoop,
      stopLoop,
    };
  }
});
