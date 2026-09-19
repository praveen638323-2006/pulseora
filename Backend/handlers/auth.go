package handlers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
	"golang.org/x/crypto/bcrypt"

	"polling-backend/config"
	"polling-backend/models"
)

func getJWTSecret() []byte {
	return []byte(os.Getenv("JWT_SECRET"))
}

type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Signup(c *gin.Context) {
	var request SignupRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	request.Name = strings.TrimSpace(request.Name)
	request.Email = strings.ToLower(strings.TrimSpace(request.Email))

	if request.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Name is required",
		})
		return
	}

	if request.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email is required",
		})
		return
	}

	if request.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password is required",
		})
		return
	}

	if len(request.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password must be at least 6 characters",
		})
		return
	}

	// Check whether email already exists
	var existingUser models.User

	err := config.DB.Collection("users").
		FindOne(
			c.Request.Context(),
			map[string]interface{}{
				"email": request.Email,
			},
		).
		Decode(&existingUser)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Email already registered",
		})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(request.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to secure password",
		})
		return
	}

	user := models.User{
		ID:        bson.NewObjectID(),
		Name:      request.Name,
		Email:     request.Email,
		Password:  string(hashedPassword),
		CreatedAt: time.Now(),
	}

	_, err = config.DB.Collection("users").
		InsertOne(
			c.Request.Context(),
			user,
		)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create account",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created successfully",
	})
}

func Login(c *gin.Context) {
	var request LoginRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	request.Email = strings.ToLower(strings.TrimSpace(request.Email))

	if request.Email == "" || request.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email and password are required",
		})
		return
	}

	var user models.User

	err := config.DB.Collection("users").
		FindOne(
			c.Request.Context(),
			map[string]interface{}{
				"email": request.Email,
			},
		).
		Decode(&user)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	// Compare password with hashed password
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(request.Password),
	)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid email or password",
		})
		return
	}

	// Check JWT secret
	jwtSecret := getJWTSecret()

	if len(jwtSecret) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "JWT secret is not configured",
		})
		return
	}

	// Create JWT token
	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"userId": user.ID.Hex(),
			"email":  user.Email,
			"exp":    time.Now().Add(24 * time.Hour).Unix(),
		},
	)

	tokenString, err := token.SignedString(jwtSecret)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create login token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   tokenString,
		"user": gin.H{
			"id":    user.ID.Hex(),
			"name":  user.Name,
			"email": user.Email,
		},
	})
}
