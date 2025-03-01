package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	"github.com/kataras/iris/v12"
)

type MessageReq struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type RequestBody struct {
	Model    string       `json:"model"`
	Messages []MessageReq `json:"messages"`
}

type MessageResp struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Choice struct {
	Index        int         `json:"index"`
	Message      MessageResp `json:"message"`
	Logprobs     interface{} `json:"logprobs"`
	FinishReason string      `json:"finish_reason"`
}

type Usage struct {
	QueueTime        float64 `json:"queue_time"`
	PromptTokens     int     `json:"prompt_tokens"`
	PromptTime       float64 `json:"prompt_time"`
	CompletionTokens int     `json:"completion_tokens"`
	CompletionTime   float64 `json:"completion_time"`
	TotalTokens      int     `json:"total_tokens"`
	TotalTime        float64 `json:"total_time"`
}

type XGroq struct {
	ID string `json:"id"`
}

type Response struct {
	ID                string   `json:"id"`
	Object            string   `json:"object"`
	Created           int      `json:"created"`
	Model             string   `json:"model"`
	Choices           []Choice `json:"choices"`
	Usage             Usage    `json:"usage"`
	SystemFingerprint string   `json:"system_fingerprint"`
	XGroq             XGroq    `json:"x_groq"`
}

type Result struct {
	ID          string `json:"id"`
	Model       string `json:"model"`
	HtmlContent string `json:"htmlContent"`
}

func main() {
	app := iris.New()

	// Setup static file
	app.HandleDir("/static", "./static")

	// Routes
	app.Get("/", func(ctx iris.Context) {
		ctx.ServeFile("public/index.html")
	})

	// Handler Post Request
	app.Post("/send", func(ctx iris.Context) {
		var requestBody struct {
			Prompt string `json:"prompt"`
		}

		if err := ctx.ReadJSON(&requestBody); err != nil {
			ctx.StatusCode(http.StatusBadRequest)
			return
		}

		if requestBody.Prompt == "" {
			ctx.WriteString("Vui lòng nhập prompt.")
			return
		}

		// Tạo request body theo cấu trúc mới
		requestData := RequestBody{
			Model: "deepseek-r1-distill-llama-70b",
			Messages: []MessageReq{
				{
					Role:    "user",
					Content: requestBody.Prompt,
				},
			},
		}

		body, err := json.Marshal(requestData)
		if err != nil {
			log.Fatal(err)
		}

		// Body
		apiUrl := "https://api.groq.com/openai/v1/chat/completions"
		apiKey := "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"

		req, err := http.NewRequest("POST", apiUrl, bytes.NewBuffer(body))
		if err != nil {
			log.Fatal(err)
		}

		req.Header.Set("Authorization", "Bearer "+apiKey)
		req.Header.Set("Content-Type", "application/json")

		// Send Request
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Fatal(err)
		}
		defer resp.Body.Close()

		// Hadnle Response
		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}

		// Parser Response
		var result Response
		err = json.Unmarshal(respBody, &result)
		if err != nil {
			log.Fatal(err)
		}

		markdownContent := result.Choices[0].Message.Content

		htmlContent := markdownToHTML(markdownContent)

		resultJson := Result{
			HtmlContent: htmlContent,
		}

		// Return Json
		ctx.JSON(resultJson)
	})

	app.Run(iris.Addr(":8080"))
}

func markdownToHTML(md string) string {
	extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
	p := parser.NewWithExtensions(extensions)

	doc := p.Parse([]byte(md))

	htmlFlags := html.CommonFlags | html.HrefTargetBlank
	opts := html.RendererOptions{
		Flags:          htmlFlags,
		RenderNodeHook: nil,
	}
	renderer := html.NewRenderer(opts)

	htmlBytes := markdown.Render(doc, renderer)
	htmlContent := string(htmlBytes)

	return htmlContent
}
