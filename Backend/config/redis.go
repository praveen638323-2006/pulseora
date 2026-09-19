package config

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func ConnectRedis() error {

	addr := os.Getenv("REDIS_ADDR")
	password := os.Getenv("REDIS_PASSWORD")
	dbString := os.Getenv("REDIS_DB")

	if addr == "" {
		return fmt.Errorf("REDIS_ADDR is not set")
	}

	db := 0

	if dbString != "" {
		parsedDB, err := strconv.Atoi(dbString)
		if err != nil {
			return fmt.Errorf("invalid REDIS_DB: %w", err)
		}
		db = parsedDB
	}

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	ctx := context.Background()

	if err := RedisClient.Ping(ctx).Err(); err != nil {
		return err
	}

	fmt.Println("Redis connected successfully!")

	return nil
}