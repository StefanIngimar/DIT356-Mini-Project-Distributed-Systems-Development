package env

import (
	"os"
	"strconv"
)

func GetStringEnv(key string, defaultValue string) string {
	value, isPresent := os.LookupEnv(key)
	if !isPresent {
		return defaultValue
	}

	return value
}

func GetIntEnv(key string, defaultVal int64) int64 {
	value, isPresent := os.LookupEnv(key)
	if !isPresent {
		return defaultVal
	}

	intValue, error := strconv.ParseInt(value, 10, 64)
	if error != nil {
		return defaultVal
	}

	return intValue
}

func GetBoolEnv(key string, defaultValue bool) bool {
	value, isPresent := os.LookupEnv(key)
	if !isPresent {
		return defaultValue
	}

	boolValue, error := strconv.ParseBool(value)
	if error != nil {
		return defaultValue
	}

	return boolValue
}
