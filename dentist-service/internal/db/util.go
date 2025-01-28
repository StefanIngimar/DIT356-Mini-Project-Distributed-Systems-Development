package db

func IsValidString(str *string) bool {
	return str != nil && *str != ""
}

func GetStringIfValid(str *string) string {
	if IsValidString(str) {
		return *str
	}
	return ""
}

func GetIntIfValid(int *int64) int64 {
	if int != nil {
		return *int
	}
	return 0
}

func GetFloatIfValid(float *float64) float64 {
	if float != nil {
		return *float
	}
	return 0.0
}
