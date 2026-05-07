# Planning request
GOAL_MAX_LENGTH = 5000
HOURS_AVAILABLE_PER_DAY_MIN = 0
HOURS_AVAILABLE_PER_DAY_MAX = 24

# Plan output
GOAL_SUMMARY_MAX_LENGTH = 300
PLAN_ITEM_TITLE_MAX_LENGTH = 200
PLAN_ITEM_NOTES_MAX_LENGTH = 2000

# Gemini
# GEMINI_MODEL_NAME = "not-a-real-model-name"  # Set to actual model name in production, e.g. "gemini-2.5-flash"
GEMINI_MODEL_NAME = "gemini-2.5-flash"
GEMINI_FALLBACK_MODEL_NAMES = [
	"gemini-2.5-flash-lite",
    "gemini-2.5-pro",
]
