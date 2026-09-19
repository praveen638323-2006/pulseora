package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"polling-backend/config"
	"polling-backend/routes"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Production mode
	gin.SetMode(gin.ReleaseMode)

	// Connect MongoDB
	if err := config.ConnectMongoDB(); err != nil {
		log.Fatal("MongoDB connection failed:", err)
	}

	// Connect Redis
	if err := config.ConnectRedis(); err != nil {
		log.Fatal("Redis connection failed:", err)
	}

	router := gin.Default()

	// CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"https://pulseora-rho.vercel.app",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
		},
		AllowCredentials: true,
	}))

	// API routes
	routes.SetupRoutes(router)

	// Health check
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "PULSEORA Backend is running",
		})
	})

	// Port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("PULSEORA backend running on port:", port)

	if err := router.Run(":" + port); err != nil {
		log.Fatal("Server failed:", err)
	}
}
