from fastapi import FastAPI

app = FastAPI(
    title="AI Learning Tutor",
    version="1.0.0"
)


@app.get("/health")
def health():
    return {
        "success": True,
        "message": "AI Service is running"
    }