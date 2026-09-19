package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"polling-backend/config"
	"polling-backend/models"
)

type CreatePollRequest struct {
	Question string   `json:"question"`
	Options  []string `json:"options"`
}

// =========================
// CREATE POLL
// =========================

func CreatePoll(c *gin.Context) {

	var request CreatePollRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	request.Question = strings.TrimSpace(request.Question)

	if request.Question == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Question is required",
		})
		return
	}

	if len(request.Options) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "At least 2 options are required",
		})
		return
	}

	if len(request.Options) > 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Maximum 6 options are allowed",
		})
		return
	}

	pollOptions := make([]models.PollOption, 0, len(request.Options))

	for _, option := range request.Options {

		option = strings.TrimSpace(option)

		if option == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Options cannot be empty",
			})
			return
		}

		pollOptions = append(
			pollOptions,
			models.PollOption{
				ID:    bson.NewObjectID().Hex(),
				Text:  option,
				Votes: 0,
			},
		)
	}

	// Get logged-in user
	userIDValue, exists := c.Get("userId")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Authentication required",
		})
		return
	}

	userID, ok := userIDValue.(string)

	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user information",
		})
		return
	}

	poll := models.Poll{
		ID:        bson.NewObjectID(),
		Question:  request.Question,
		Options:   pollOptions,
		CreatedBy: userID,
		VotedBy:   []string{},
		CreatedAt: time.Now(),
	}

	_, err := config.DB.Collection("polls").InsertOne(
		c.Request.Context(),
		poll,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create poll",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll created successfully",
		"poll":    poll,
	})
}

// =========================
// GET MY POLLS
// =========================

func GetMyPolls(c *gin.Context) {

	userIDValue, exists := c.Get("userId")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Authentication required",
		})
		return
	}

	userID, ok := userIDValue.(string)

	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user information",
		})
		return
	}

	cursor, err := config.DB.Collection("polls").Find(
		c.Request.Context(),
		bson.M{
			"createdBy": userID,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch polls",
		})
		return
	}

	defer cursor.Close(c.Request.Context())

	var polls []models.Poll

	if err := cursor.All(c.Request.Context(), &polls); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read polls",
		})
		return
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": polls,
	})
}

// =========================
// DELETE POLL
// =========================

func DeletePoll(c *gin.Context) {

	pollID := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(pollID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	userIDValue, exists := c.Get("userId")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Authentication required",
		})
		return
	}

	userID, ok := userIDValue.(string)

	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user information",
		})
		return
	}

	result, err := config.DB.Collection("polls").DeleteOne(
		c.Request.Context(),
		bson.M{
			"_id":       objectID,
			"createdBy": userID,
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete poll",
		})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll not found or you are not the owner",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Poll deleted successfully",
	})
}

// =========================
// GET SINGLE POLL
// =========================

func GetPoll(c *gin.Context) {

	id := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(id)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	var poll models.Poll

	err = config.DB.Collection("polls").
		FindOne(
			c.Request.Context(),
			bson.M{
				"_id": objectID,
			},
		).
		Decode(&poll)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"poll": poll,
	})
}

// =========================
// VOTE
// =========================

type VoteRequest struct {
	OptionID string `json:"optionId"`
}

func VotePoll(c *gin.Context) {

	pollID := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(pollID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	// Get logged-in user ID
	userIDValue, exists := c.Get("userId")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Authentication required",
		})
		return
	}

	userID, ok := userIDValue.(string)

	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid user information",
		})
		return
	}

	var request VoteRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	request.OptionID = strings.TrimSpace(request.OptionID)

	if request.OptionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Option ID is required",
		})
		return
	}

	// Atomically:
	// 1. Check user has not voted
	// 2. Increment selected option
	// 3. Add user ID to votedBy
	result, err := config.DB.Collection("polls").UpdateOne(
		c.Request.Context(),
		bson.M{
			"_id":        objectID,
			"options.id": request.OptionID,
			"votedBy": bson.M{
				"$ne": userID,
			},
		},
		bson.M{
			"$inc": bson.M{
				"options.$.votes": 1,
			},
			"$addToSet": bson.M{
				"votedBy": userID,
			},
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to record vote",
		})
		return
	}

	// If nothing changed, user already voted
	if result.ModifiedCount == 0 {

		// Check whether poll exists
		var poll models.Poll

		err := config.DB.Collection("polls").
			FindOne(
				c.Request.Context(),
				bson.M{
					"_id": objectID,
				},
			).
			Decode(&poll)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Poll not found",
			})
			return
		}

		// Check if user already voted
		for _, voterID := range poll.VotedBy {

			if voterID == userID {
				c.JSON(http.StatusConflict, gin.H{
					"error": "You have already voted in this poll",
				})
				return
			}
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid option",
		})
		return
	}

	// Get updated poll
	var updatedPoll models.Poll

	err = config.DB.Collection("polls").
		FindOne(
			c.Request.Context(),
			bson.M{
				"_id": objectID,
			},
		).
		Decode(&updatedPoll)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch updated poll",
		})
		return
	}

	// Publish updated poll through Redis
	message, err := json.Marshal(updatedPoll)

	if err == nil {

		err = config.RedisClient.
			Publish(
				c.Request.Context(),
				"poll:"+pollID,
				message,
			).
			Err()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Vote saved but realtime update failed",
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vote recorded successfully",
		"poll":    updatedPoll,
	})
}

// =========================
// REALTIME SSE STREAM
// =========================

func StreamPoll(c *gin.Context) {

	pollID := c.Param("id")

	objectID, err := bson.ObjectIDFromHex(pollID)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid poll ID",
		})
		return
	}

	var poll models.Poll

	err = config.DB.Collection("polls").
		FindOne(
			c.Request.Context(),
			bson.M{
				"_id": objectID,
			},
		).
		Decode(&poll)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Poll not found",
		})
		return
	}

	pubsub := config.RedisClient.Subscribe(
		c.Request.Context(),
		"poll:"+pollID,
	)

	defer pubsub.Close()

	_, err = pubsub.Receive(c.Request.Context())

	if err != nil {
		return
	}

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")

	// Send initial poll data
	initialData, err := json.Marshal(poll)

	if err == nil {

		fmt.Fprintf(
			c.Writer,
			"data: %s\n\n",
			initialData,
		)

		c.Writer.Flush()
	}

	ch := pubsub.Channel()

	for {

		select {

		case <-c.Request.Context().Done():
			return

		case <-ch:

			err := config.DB.Collection("polls").
				FindOne(
					c.Request.Context(),
					bson.M{
						"_id": objectID,
					},
				).
				Decode(&poll)

			if err != nil {
				continue
			}

			data, err := json.Marshal(poll)

			if err != nil {
				continue
			}

			fmt.Fprintf(
				c.Writer,
				"data: %s\n\n",
				data,
			)

			c.Writer.Flush()
		}
	}
}

// =========================
// GET LIVE POLLS
// =========================

func GetLivePolls(c *gin.Context) {

	cursor, err := config.DB.Collection("polls").Find(
		c.Request.Context(),
		bson.M{},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch live polls",
		})
		return
	}

	defer cursor.Close(c.Request.Context())

	var polls []models.Poll

	if err := cursor.All(c.Request.Context(), &polls); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read live polls",
		})
		return
	}

	if polls == nil {
		polls = []models.Poll{}
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": polls,
	})
}
