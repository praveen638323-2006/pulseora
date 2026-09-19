package routes

import (
	"github.com/gin-gonic/gin"

	"polling-backend/handlers"
	"polling-backend/middleware"
)

func SetupRoutes(router *gin.Engine) {

	api := router.Group("/api")

	{
		// =========================
		// AUTHENTICATION
		// =========================

		api.POST("/auth/signup", handlers.Signup)
		api.POST("/auth/login", handlers.Login)

		// =========================
		// PUBLIC POLL ROUTES
		// =========================

		api.GET("/polls/live", handlers.GetLivePolls)

		api.GET("/polls/:id", handlers.GetPoll)

		// One user = one vote
		api.POST(
			"/polls/:id/vote",
			middleware.AuthMiddleware(),
			handlers.VotePoll,
		)

		// Realtime SSE
		api.GET(
			"/polls/:id/stream",
			handlers.StreamPoll,
		)

		// =========================
		// PROTECTED POLL ROUTES
		// =========================

		// Create Poll
		api.POST(
			"/polls",
			middleware.AuthMiddleware(),
			handlers.CreatePoll,
		)

		// My Polls
		api.GET(
			"/polls",
			middleware.AuthMiddleware(),
			handlers.GetMyPolls,
		)

		// Delete Poll
		api.DELETE(
			"/polls/:id",
			middleware.AuthMiddleware(),
			handlers.DeletePoll,
		)
	}
}
