"""
Core FastAPI application for the backend service.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.db import Base, engine, get_db
from backend.models import Item as ItemModel
from sqlalchemy.orm import Session


app = FastAPI(
    title="Python API Application",
    description="A modern REST API built with FastAPI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float
    created_at: Optional[datetime] = None


class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float


# Create tables (in a real project you would use migrations instead)
Base.metadata.create_all(bind=engine)


@app.get("/api")
async def root():
    return {
        "message": "Welcome to Python API Application",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/api/items", response_model=List[Item])
def get_items(db: Session = Depends(get_db)):
    items = db.query(ItemModel).order_by(ItemModel.id).all()
    return items


@app.get("/api/items/{item_id}", response_model=Item)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID {item_id} not found",
        )
    return item


@app.post("/api/items", response_model=Item, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    db_item = ItemModel(
        name=item.name,
        description=item.description,
        price=item.price,
        created_at=datetime.utcnow(),
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.put("/api/items/{item_id}", response_model=Item)
def update_item(item_id: int, item: ItemCreate, db: Session = Depends(get_db)):
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID {item_id} not found",
        )

    db_item.name = item.name
    db_item.description = item.description
    db_item.price = item.price
    db.commit()
    db.refresh(db_item)
    return db_item


@app.delete("/api/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID {item_id} not found",
        )
    db.delete(db_item)
    db.commit()
    return None


# Serve the UI (static files) from the `ui` directory at the project root.
# When you open http://localhost:8000/ you will see the HTML UI, and it will
# call the API under /api/*
app.mount(
    "/",
    StaticFiles(directory="ui", html=True),
    name="ui",
)

