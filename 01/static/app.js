document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('prompt-form');
    const promptField = document.getElementById('prompt');
    // const resultDiv = document.getElementById('response-result');
    const markdownBody = document.getElementById('math-container');
    const loaderDiv = document.getElementById('loader-container');

    promptField.value = '7.9 or 7.11 which number is bigger?';

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!promptField.value) {
            alert("Vui lòng nhâp prompt!");
            return;
        }

        const prompt = promptField.value;

        loaderDiv.style.display = 'block';

        // Gửi dữ liệu tới server
        fetch('/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }),
        })
        .then(response => response.json())
        .then(data => {
            markdownBody.innerHTML = data.htmlContent;
            renderMathJax();
        })
        .catch(error => {
            console.error('Error:', error);
            markdownBody.innerHTML = 'Có lỗi xảy ra khi gửi yêu cầu.';
        })
        .finally(() => {
            loaderDiv.style.display = 'none';
        })
    });
});

function renderMathJax() {
    MathJax.typeset();
}