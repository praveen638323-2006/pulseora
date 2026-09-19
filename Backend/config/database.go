package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var DB *mongo.Database

func ConnectMongoDB() error {

	// Get MongoDB URI from .env
	uri := os.Getenv("MONGODB_URI")

	if uri == "" {
		return fmt.Errorf("MONGODB_URI is not set")
	}

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)

	clientOptions := options.Client().
		ApplyURI(uri).
		SetServerAPIOptions(serverAPI)

	ctx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	client, err := mongo.Connect(clientOptions)
	if err != nil {
		return err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return err
	}

	DB = client.Database("polllive")

	fmt.Println("MongoDB connected successfully!")

	return nil
}
