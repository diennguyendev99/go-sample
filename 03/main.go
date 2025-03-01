package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	"github.com/kataras/iris/v12"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
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

// Request structs
type DialogRequest struct {
	Lang    string  `json:"lang"`
	Content string  `json:"content"`
	WordIDs []int64 `json:"word_ids,omitempty"`
}

type WordRequest struct {
	Lang      string  `json:"lang"`
	Content   string  `json:"content"`
	Translate string  `json:"translate"`
	DialogIDs []int64 `json:"dialog_ids,omitempty"`
}

type WordDialogRequest struct {
	DialogID int64 `json:"dialog_id"`
	WordID   int64 `json:"word_id"`
}

type FullRequest struct {
	Dialog DialogRequest
	Word   WordRequest
}

func main() {
	dsn := "host=postgres user=postgres password=P@ssw0rd dbname=postgres port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	// Khởi tạo Iris app
	app := iris.New()

	dbURL := "postgres://postgres:P@ssw0rd@postgres:5432/postgres?sslmode=disable"

	go migrateDatabase(dbURL)

	app.HandleDir("/static", "./static")

	// Routes
	app.Get("/", func(ctx iris.Context) {
		ctx.ServeFile("public/index.html")
	})

	dialogWordController := &DialogWordController{DB: db}
	app.Post("/dialog-word", dialogWordController.Create)

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

	app.Listen(":8082")
}

func migrateDatabase(dbURL string) {
	migrationsPath := "file://migrations"

	m, err := migrate.New(migrationsPath, dbURL)
	if err != nil {
		log.Fatal("Error creating migration instance: ", err)
	}

	err = m.Up()
	if err != nil && err.Error() != "no change" {
		log.Fatal("Error migrating database: ", err)
	}

	log.Println("Database migration complete")
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

type DialogWordController struct {
	DB *gorm.DB
}

func (c *DialogWordController) Create(ctx iris.Context) {
	var req FullRequest
	if err := ctx.ReadJSON(&req); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(iris.Map{"error": "Invalid request format: " + err.Error()})
		return
	}

	err := c.DB.Transaction(func(tx *gorm.DB) error {
		sql := `
			WITH inserted_dialog AS (
				INSERT INTO dialog (lang, content) 
				VALUES ($1, $2) 
				RETURNING id
			),
			inserted_word AS (
				INSERT INTO word (lang, content, translate) 
				VALUES ($3, $4, $5) 
				RETURNING id
			)
			INSERT INTO word_dialog (dialog_id, word_id) 
			SELECT dialog.id, word.id
			FROM inserted_dialog dialog, inserted_word word;
		`

		if err := tx.Exec(sql, req.Dialog.Lang, req.Dialog.Content, req.Word.Lang, req.Word.Content, req.Word.Translate).Error; err != nil {
			return err // Nếu có lỗi thì rollback toàn bộ transaction
		}

		return nil
	})

	if err != nil {
		ctx.StatusCode(iris.StatusInternalServerError)
		ctx.JSON(iris.Map{"error": "Failed to create association: " + err.Error()})
		return
	}

	ctx.JSON(iris.Map{
		"message": "Association created successfully",
		"data":    "Ok",
	})
}
