# Credits & Subscription Service Design

> **Status**: 🔮 **Future Implementation** - Complete Design Specification

> ⚠️ **Not Yet Implemented** - This is a complete design document for the future credits microservice.

Microservice design for managing credits and subscriptions using Go (Golang) and Python FastAPI.

---

## Table of Contents
1. [Overview](#overview)
2. [Service Architecture](#service-architecture)
3. [Go Service Implementation](#go-service-implementation)
4. [Python FastAPI Alternative](#python-fastapi-alternative)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [Integration](#integration)
8. [Deployment](#deployment)

---

## Overview

### Purpose
Manage user credits and subscription tiers independently from the main Next.js application.

### Features
- **Credit Management**: Add, deduct, transfer credits
- **Subscription Management**: Upgrade, downgrade, cancel
- **Usage Tracking**: Monitor credit usage per feature
- **Quota Enforcement**: Limit features based on tier
- **Billing Integration**: Sync with Stripe webhooks

### Why Separate Service?
- **Scalability**: Handle high-volume transactions
- **Performance**: Go's concurrency for credit operations
- **Reliability**: Dedicated service for critical operations
- **Flexibility**: Easy to swap billing providers

---

## Service Architecture

\`\`\`
┌─────────────────────────────────────────────┐
│         Next.js Main App                    │
│    (User requests features)                 │
└───────────────┬─────────────────────────────┘
                │ HTTP REST
                ▼
┌─────────────────────────────────────────────┐
│   Credits & Subscription Service            │
│   (Go or Python FastAPI)                    │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │Credit Engine │      │ Subscription    │ │
│  │              │      │ Manager         │ │
│  └──────────────┘      └─────────────────┘ │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │Usage Tracker │      │ Quota Enforcer  │ │
│  └──────────────┘      └─────────────────┘ │
└───────────────┬─────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │  PostgreSQL   │
        │  (Database)   │
        └───────────────┘
\`\`\`

---

## Go Service Implementation

### Project Structure

\`\`\`
credits-service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── api/
│   │   ├── handlers.go
│   │   ├── middleware.go
│   │   └── routes.go
│   ├── models/
│   │   ├── credit.go
│   │   ├── subscription.go
│   │   └── transaction.go
│   ├── repository/
│   │   ├── credit_repo.go
│   │   └── subscription_repo.go
│   └── service/
│       ├── credit_service.go
│       └── subscription_service.go
├── pkg/
│   ├── database/
│   │   └── postgres.go
│   └── auth/
│       └── jwt.go
├── go.mod
├── go.sum
└── Dockerfile
\`\`\`

### Core Implementation

#### 1. **main.go**

\`\`\`go
package main

import (
    "log"
    "net/http"
    "os"

    "github.com/gorilla/mux"
    "credits-service/internal/api"
    "credits-service/pkg/database"
)

func main() {
    // Initialize database
    db, err := database.NewPostgresDB(os.Getenv("DATABASE_URL"))
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    defer db.Close()

    // Setup router
    router := mux.NewRouter()
    
    // Initialize API
    api.SetupRoutes(router, db)

    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Server starting on port %s", port)
    log.Fatal(http.ListenAndServe(":"+port, router))
}
\`\`\`

#### 2. **models/credit.go**

\`\`\`go
package models

import "time"

type Credit struct {
    ID        string    `json:"id" db:"id"`
    UserID    string    `json:"user_id" db:"user_id"`
    Amount    int       `json:"amount" db:"amount"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type Transaction struct {
    ID          string    `json:"id" db:"id"`
    UserID      string    `json:"user_id" db:"user_id"`
    Type        string    `json:"type" db:"type"` // EARN, SPEND, REFUND
    Amount      int       `json:"amount" db:"amount"`
    Balance     int       `json:"balance" db:"balance"`
    Description string    `json:"description" db:"description"`
    Metadata    string    `json:"metadata" db:"metadata"` // JSON
    CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type Subscription struct {
    ID               string    `json:"id" db:"id"`
    UserID           string    `json:"user_id" db:"user_id"`
    Tier             string    `json:"tier" db:"tier"` // FREE, PRO, PREMIUM
    Status           string    `json:"status" db:"status"` // ACTIVE, CANCELED, PAST_DUE
    CurrentPeriodEnd time.Time `json:"current_period_end" db:"current_period_end"`
    StripeSubID      string    `json:"stripe_subscription_id" db:"stripe_subscription_id"`
    CreatedAt        time.Time `json:"created_at" db:"created_at"`
    UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}
\`\`\`

#### 3. **service/credit_service.go**

\`\`\`go
package service

import (
    "context"
    "database/sql"
    "errors"
    "time"

    "credits-service/internal/models"
)

type CreditService struct {
    db *sql.DB
}

func NewCreditService(db *sql.DB) *CreditService {
    return &CreditService{db: db}
}

func (s *CreditService) GetBalance(ctx context.Context, userID string) (int, error) {
    var balance int
    err := s.db.QueryRowContext(ctx,
        "SELECT COALESCE(SUM(amount), 0) FROM credit_transactions WHERE user_id = $1",
        userID,
    ).Scan(&balance)
    
    return balance, err
}

func (s *CreditService) AddCredits(ctx context.Context, userID string, amount int, description string) error {
    tx, err := s.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Get current balance
    var balance int
    err = tx.QueryRowContext(ctx,
        "SELECT COALESCE(SUM(amount), 0) FROM credit_transactions WHERE user_id = $1",
        userID,
    ).Scan(&balance)
    if err != nil {
        return err
    }

    // Add transaction
    _, err = tx.ExecContext(ctx,
        `INSERT INTO credit_transactions (user_id, type, amount, balance, description, created_at)
         VALUES ($1, 'EARN', $2, $3, $4, $5)`,
        userID, amount, balance+amount, description, time.Now(),
    )
    if err != nil {
        return err
    }

    return tx.Commit()
}

func (s *CreditService) DeductCredits(ctx context.Context, userID string, amount int, description string) error {
    tx, err := s.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Check balance
    var balance int
    err = tx.QueryRowContext(ctx,
        "SELECT COALESCE(SUM(amount), 0) FROM credit_transactions WHERE user_id = $1",
        userID,
    ).Scan(&balance)
    if err != nil {
        return err
    }

    if balance < amount {
        return errors.New("insufficient credits")
    }

    // Deduct
    _, err = tx.ExecContext(ctx,
        `INSERT INTO credit_transactions (user_id, type, amount, balance, description, created_at)
         VALUES ($1, 'SPEND', $2, $3, $4, $5)`,
        userID, -amount, balance-amount, description, time.Now(),
    )
    if err != nil {
        return err
    }

    return tx.Commit()
}

func (s *CreditService) GetTransactionHistory(ctx context.Context, userID string, limit int) ([]models.Transaction, error) {
    rows, err := s.db.QueryContext(ctx,
        `SELECT id, user_id, type, amount, balance, description, created_at
         FROM credit_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        userID, limit,
    )
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var transactions []models.Transaction
    for rows.Next() {
        var t models.Transaction
        err := rows.Scan(&t.ID, &t.UserID, &t.Type, &t.Amount, &t.Balance, &t.Description, &t.CreatedAt)
        if err != nil {
            return nil, err
        }
        transactions = append(transactions, t)
    }

    return transactions, nil
}
\`\`\`

#### 4. **api/handlers.go**

\`\`\`go
package api

import (
    "encoding/json"
    "net/http"

    "github.com/gorilla/mux"
    "credits-service/internal/service"
)

type Handler struct {
    creditService *service.CreditService
    subService    *service.SubscriptionService
}

func (h *Handler) GetBalance(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    userID := vars["userId"]

    balance, err := h.creditService.GetBalance(r.Context(), userID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(map[string]interface{}{
        "user_id": userID,
        "balance": balance,
    })
}

func (h *Handler) AddCredits(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    userID := vars["userId"]

    var req struct {
        Amount      int    `json:"amount"`
        Description string `json:"description"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    if req.Amount <= 0 {
        http.Error(w, "Amount must be positive", http.StatusBadRequest)
        return
    }

    err := h.creditService.AddCredits(r.Context(), userID, req.Amount, req.Description)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    balance, _ := h.creditService.GetBalance(r.Context(), userID)

    json.NewEncoder(w).Encode(map[string]interface{}{
        "success": true,
        "balance": balance,
    })
}

func (h *Handler) DeductCredits(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    userID := vars["userId"]

    var req struct {
        Amount      int    `json:"amount"`
        Description string `json:"description"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    err := h.creditService.DeductCredits(r.Context(), userID, req.Amount, req.Description)
    if err != nil {
        if err.Error() == "insufficient credits" {
            http.Error(w, err.Error(), http.StatusPaymentRequired)
            return
        }
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    balance, _ := h.creditService.GetBalance(r.Context(), userID)

    json.NewEncoder(w).Encode(map[string]interface{}{
        "success": true,
        "balance": balance,
    })
}
\`\`\`

#### 5. **api/routes.go**

\`\`\`go
package api

import (
    "database/sql"
    "net/http"

    "github.com/gorilla/mux"
    "credits-service/internal/service"
)

func SetupRoutes(router *mux.Router, db *sql.DB) {
    handler := &Handler{
        creditService: service.NewCreditService(db),
        subService:    service.NewSubscriptionService(db),
    }

    // Apply auth middleware
    router.Use(AuthMiddleware)

    // Credits endpoints
    router.HandleFunc("/api/credits/{userId}/balance", handler.GetBalance).Methods("GET")
    router.HandleFunc("/api/credits/{userId}/add", handler.AddCredits).Methods("POST")
    router.HandleFunc("/api/credits/{userId}/deduct", handler.DeductCredits).Methods("POST")
    router.HandleFunc("/api/credits/{userId}/history", handler.GetHistory).Methods("GET")

    // Subscription endpoints
    router.HandleFunc("/api/subscriptions/{userId}", handler.GetSubscription).Methods("GET")
    router.HandleFunc("/api/subscriptions/{userId}/upgrade", handler.UpgradeSubscription).Methods("POST")
    router.HandleFunc("/api/subscriptions/{userId}/cancel", handler.CancelSubscription).Methods("POST")

    // Health check
    router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("OK"))
    }).Methods("GET")
}
\`\`\`

---

## Python FastAPI Alternative

### Project Structure

\`\`\`
credits-service/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── schemas.py
│   └── routers/
│       ├── credits.py
│       └── subscriptions.py
├── requirements.txt
└── Dockerfile
\`\`\`

### Implementation

#### **app/main.py**

\`\`\`python
from fastapi import FastAPI
from app.routers import credits, subscriptions
from app.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Credits & Subscription Service")

app.include_router(credits.router, prefix="/api/credits", tags=["credits"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["subscriptions"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
\`\`\`

#### **app/models.py**

\`\`\`python
from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    type = Column(String)  # EARN, SPEND, REFUND
    amount = Column(Integer)
    balance = Column(Integer)
    description = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True)
    user_id = Column(String, unique=True, nullable=False)
    tier = Column(String, default="FREE")
    status = Column(String, default="ACTIVE")
    current_period_end = Column(DateTime)
    stripe_subscription_id = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
\`\`\`

#### **app/routers/credits.py**

\`\`\`python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import CreditTransaction
from pydantic import BaseModel
import uuid

router = APIRouter()

class CreditRequest(BaseModel):
    amount: int
    description: str

@router.get("/{user_id}/balance")
def get_balance(user_id: str, db: Session = Depends(get_db)):
    balance = db.query(func.coalesce(func.sum(CreditTransaction.amount), 0)).filter(
        CreditTransaction.user_id == user_id
    ).scalar()
    
    return {"user_id": user_id, "balance": balance}

@router.post("/{user_id}/add")
def add_credits(user_id: str, request: CreditRequest, db: Session = Depends(get_db)):
    # Get current balance
    balance = db.query(func.coalesce(func.sum(CreditTransaction.amount), 0)).filter(
        CreditTransaction.user_id == user_id
    ).scalar()
    
    # Add transaction
    transaction = CreditTransaction(
        id=str(uuid.uuid4()),
        user_id=user_id,
        type="EARN",
        amount=request.amount,
        balance=balance + request.amount,
        description=request.description
    )
    
    db.add(transaction)
    db.commit()
    
    return {"success": True, "balance": balance + request.amount}

@router.post("/{user_id}/deduct")
def deduct_credits(user_id: str, request: CreditRequest, db: Session = Depends(get_db)):
    # Check balance
    balance = db.query(func.coalesce(func.sum(CreditTransaction.amount), 0)).filter(
        CreditTransaction.user_id == user_id
    ).scalar()
    
    if balance < request.amount:
        raise HTTPException(status_code=402, detail="Insufficient credits")
    
    # Deduct
    transaction = CreditTransaction(
        id=str(uuid.uuid4()),
        user_id=user_id,
        type="SPEND",
        amount=-request.amount,
        balance=balance - request.amount,
        description=request.description
    )
    
    db.add(transaction)
    db.commit()
    
    return {"success": True, "balance": balance - request.amount}

@router.get("/{user_id}/history")
def get_history(user_id: str, limit: int = 50, db: Session = Depends(get_db)):
    transactions = db.query(CreditTransaction).filter(
        CreditTransaction.user_id == user_id
    ).order_by(CreditTransaction.created_at.desc()).limit(limit).all()
    
    return transactions
\`\`\`

---

## API Endpoints

### Credits API

\`\`\`
GET    /api/credits/{userId}/balance      - Get credit balance
POST   /api/credits/{userId}/add          - Add credits
POST   /api/credits/{userId}/deduct       - Deduct credits
GET    /api/credits/{userId}/history      - Get transaction history
POST   /api/credits/{userId}/transfer     - Transfer credits
\`\`\`

### Subscriptions API

\`\`\`
GET    /api/subscriptions/{userId}        - Get subscription
POST   /api/subscriptions/{userId}/upgrade   - Upgrade plan
POST   /api/subscriptions/{userId}/cancel    - Cancel subscription
GET    /api/subscriptions/{userId}/quotas    - Get usage quotas
\`\`\`

---

## Database Schema

\`\`\`sql
CREATE TABLE credit_transactions (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    type VARCHAR NOT NULL,  -- EARN, SPEND, REFUND
    amount INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_user_id ON credit_transactions(user_id);

CREATE TABLE subscriptions (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR UNIQUE NOT NULL,
    tier VARCHAR DEFAULT 'FREE',
    status VARCHAR DEFAULT 'ACTIVE',
    current_period_end TIMESTAMP,
    stripe_subscription_id VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

---

## Integration with Main App

**Next.js API Route** (`app/api/credits/deduct/route.ts`):

\`\`\`typescript
export async function POST(req: Request) {
    const { userId, amount, description } = await req.json()
    
    const response = await fetch(`${process.env.CREDITS_SERVICE_URL}/api/credits/${userId}/deduct`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CREDITS_SERVICE_TOKEN}`
        },
        body: JSON.stringify({ amount, description })
    })
    
    if (!response.ok) {
        return Response.json({ error: 'Insufficient credits' }, { status: 402 })
    }
    
    return Response.json(await response.json())
}
\`\`\`

---

## Deployment

### Docker

\`\`\`dockerfile
# Go
FROM golang:1.21-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main ./cmd/server
EXPOSE 8080
CMD ["./main"]

# Python
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY ./app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
\`\`\`

### Environment Variables

\`\`\`env
DATABASE_URL=postgresql://...
PORT=8080
AUTH_SECRET=your-secret
STRIPE_WEBHOOK_SECRET=whsec_...
\`\`\`

---

## Performance Considerations

1. **Connection Pooling**: Use pgx in Go or SQLAlchemy pooling
2. **Caching**: Redis for balance caching
3. **Transactions**: Ensure ACID for credit operations
4. **Rate Limiting**: Prevent abuse
5. **Monitoring**: Track transaction volume

This service provides robust, scalable credit and subscription management!
