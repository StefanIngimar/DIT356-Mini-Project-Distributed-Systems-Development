package main

import (
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/config"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/db"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/env"
	"git.chalmers.se/courses/dit355/2024/student_teams/dit356_2024_02/dentist-service/internal/service"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	keepAlive := make(chan os.Signal, 1)
	signal.Notify(keepAlive, os.Interrupt, syscall.SIGTERM)

	currentEnv := env.GetStringEnv("ENV", "dev")
	var dbPath string
	switch strings.ToLower(currentEnv) {
	case "test":
		dbPath = "data/test.db"
	default:
		dbPath = "data/main.db"
	}

	sqlDb, err := db.Init(dbPath)
	if err != nil {
		log.Fatalf("Could not initialize the database for path '%s'. Error: %s", dbPath, err.Error())
	}
	defer func() {
		sqlDb.Close()
		if currentEnv == "test" {
			log.Printf("Removing test database '%s'", dbPath)
			os.Remove(dbPath)
		}
	}()

	appService := service.New(config.NewApp(sqlDb), config.NewMqtt())
	defer appService.DisconnectClient()

	appService.Run()

	<-keepAlive
}
