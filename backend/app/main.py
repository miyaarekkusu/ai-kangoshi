from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import store
from app.config import settings
from app.routers import consent, intake, interpret, media, review

app = FastAPI(title="NurseLink AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(consent.router)
app.include_router(intake.router)
app.include_router(review.router)
app.include_router(interpret.router)
app.include_router(media.router)


@app.on_event("startup")
def on_startup() -> None:
    store.seed()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
