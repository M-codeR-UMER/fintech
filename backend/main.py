import os
import sqlite3
import threading
import uuid
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Literal
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

import jwt
from fastapi import FastAPI, HTTPException, Query, Header, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
API_TOKEN = os.getenv("API_TOKEN", "").strip()
DB_PATH = Path(os.getenv("DB_PATH", Path(__file__).with_name("finpay.db")))

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "finpay_super_secret_key_123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@asynccontextmanager
async def lifespan(_: FastAPI):
    print(f"🚀 FinPay Central Command: Initializing node in {APP_ENV} mode...")
    init_db()
    print("✅ System Synchronization: Database and security protocols active.")
    yield

app = FastAPI(title="FinPay Backend API", lifespan=lifespan)

# Health Check for Render
@app.get("/")
@app.head("/")
def health_check():
    return {"status": "ok", "message": "FinPay API is running securely."}

# Global Exception Handler to expose real errors to the frontend
@app.exception_handler(Exception)
def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )

# Configure CORS
origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class Transaction(BaseModel):
    id: str
    type: Literal["send", "receive"]
    counterpartyName: str
    date: str
    time: str
    amount: float

class TransferRequest(BaseModel):
    recipientName: str = Field(min_length=2, max_length=80)
    amount: float = Field(gt=0)

class TopUpRequest(BaseModel):
    source: str
    accountNumber: str
    amount: float = Field(gt=0)

# Specialized Auth Models
class AdminLoginRequest(BaseModel):
    email: str
    password: str

class UserLoginRequest(BaseModel):
    phoneNumber: str
    password: str
    role: str

class UserRegisterRequest(BaseModel):
    firstName: str
    phoneNumber: str
    password: str
    role: str = "user"

class StatusToggleRequest(BaseModel):
    userId: str
    status: Literal["active", "frozen"]

# --- Database Schema & Logic ---

TIER_LIMITS = {
    "L1": 50000.0,
    "L2": 500000.0
}

@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=10.0)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db() -> None:
    print(f"📂 DB_PATH is set to: {DB_PATH.absolute()}")
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db_connection() as conn:
        print("🛠️ Creating tables if not exist...")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                first_name TEXT NOT NULL,
                phone_number TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                tier TEXT DEFAULT 'L1',
                status TEXT DEFAULT 'active',
                balance REAL DEFAULT 0.0,
                avatar_url TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('send', 'receive')),
                counterparty_name TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                amount REAL NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
            """
        )
        
        # Ensure 'user_id' column exists in 'transactions' table (DB Migration Fix)
        cursor = conn.execute("PRAGMA table_info(transactions)")
        columns = [row[1] for row in cursor.fetchall()]
        if "user_id" not in columns:
            try:
                conn.execute("ALTER TABLE transactions ADD COLUMN user_id TEXT")
            except sqlite3.OperationalError:
                pass # Already handled or table empty
        
        # DB Migration: Ensure all users have a tier
        conn.execute("UPDATE users SET tier = 'L1' WHERE tier IS NULL")
        
        # DB Migration: Ensure all users have a status
        cursor = conn.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        if "status" not in columns:
            try:
                conn.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'")
            except sqlite3.OperationalError:
                pass
        conn.execute("UPDATE users SET status = 'active' WHERE status IS NULL")
        
        # Admin Seed
        admin = conn.execute("SELECT * FROM users WHERE email = 'admin@finpay.com'").fetchone()
        if not admin:
            conn.execute(
                "INSERT INTO users (id, email, password, first_name, phone_number, role, tier, status, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (str(uuid.uuid4()), "admin@finpay.com", "admin123", "Super", "Admin", "admin", "L2", "active", 125430.50)
            )
        else:
            conn.execute("UPDATE users SET password = 'admin123', role = 'admin', tier = 'L2', status = 'active' WHERE email = 'admin@finpay.com'")
            
        conn.commit()

def _get_user(conn: sqlite3.Connection, user_id: str):
    return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

def _update_balance(conn: sqlite3.Connection, user_id: str, new_balance: float):
    conn.execute("UPDATE users SET balance = ? WHERE id = ?", (new_balance, user_id))

def _get_monthly_spent(conn: sqlite3.Connection, user_id: str) -> float:
    current_month = datetime.now().strftime("%Y-%m")
    row = conn.execute(
        "SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'send' AND date LIKE ?",
        (user_id, f"{current_month}%")
    ).fetchone()
    return float(row[0] or 0)

# --- JWT Helpers ---

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        
        # Rigorous check: Verify if the node is restricted in the database
        with get_db_connection() as conn:
            user = conn.execute("SELECT status FROM users WHERE id = ?", (user_id,)).fetchone()
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            if dict(user).get("status") == "frozen":
                raise HTTPException(status_code=403, detail="Your account is restricted by admin.")
                
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# --- Auth Endpoints ---

@app.post("/api/admin/login")
def admin_login(request: AdminLoginRequest):
    print(f"🔐 Admin login attempt: {request.email}")
    with get_db_connection() as conn:
        email = request.email.strip()
        pwd = request.password.strip()
        user = conn.execute(
            "SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ? AND role = 'admin'",
            (email, pwd)
        ).fetchone()
        if not user:
            print(f"❌ Admin login failed: Invalid credentials for {email}")
            raise HTTPException(status_code=401, detail="Admin credentials not found")
        
        user_dict = dict(user)
        if user_dict.get("status") == "frozen":
            print(f"🚫 Admin login blocked: Account frozen for {email}")
            raise HTTPException(status_code=403, detail="Your account is restricted by admin.")
            
        print(f"✅ Admin login successful: {email}")
        token = create_access_token(data={"sub": user_dict["id"], "role": user_dict["role"]})
        return {**user_dict, "token": token}

@app.post("/api/user/login")
def user_login(request: UserLoginRequest):
    print(f"🔐 User login attempt: {request.phoneNumber} as {request.role}")
    with get_db_connection() as conn:
        phone = request.phoneNumber.strip()
        pwd = request.password.strip()
        user_exists = conn.execute(
            "SELECT * FROM users WHERE phone_number = ? AND role = ?", 
            (phone, request.role)
        ).fetchone()
        if not user_exists:
            print(f"❓ User login failed: Account not found for {phone}")
            raise HTTPException(status_code=404, detail="Account not found. Please register first.")
        user = conn.execute(
            "SELECT * FROM users WHERE phone_number = ? AND password = ? AND role = ?", 
            (phone, pwd, request.role)
        ).fetchone()
        if not user:
            print(f"❌ User login failed: Invalid PIN for {phone}")
            raise HTTPException(status_code=401, detail="Invalid Security PIN. Please try again.")
        
        user_dict = dict(user)
        if user_dict.get("status") == "frozen":
            print(f"🚫 User login blocked: Account frozen for {phone}")
            raise HTTPException(status_code=403, detail="Your account is restricted by admin.")

        print(f"✅ User login successful: {phone}")
        token = create_access_token(data={"sub": user_dict["id"], "role": user_dict["role"]})
        return {**user_dict, "token": token}

@app.post("/api/user/register")
def user_register(request: UserRegisterRequest):
    print(f"📝 User registration attempt: {request.phoneNumber}")
    with get_db_connection() as conn:
        try:
            user_id = str(uuid.uuid4())
            placeholder_email = f"{user_id}@finpay.local"
            conn.execute(
                "INSERT INTO users (id, email, password, first_name, phone_number, role, balance) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, placeholder_email, request.password.strip(), request.firstName.strip(), request.phoneNumber.strip(), request.role, 0.0)
            )
            conn.commit()
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            user_dict = dict(user)
            print(f"✅ User registration successful: {request.phoneNumber}")
            token = create_access_token(data={"sub": user_dict["id"], "role": user_dict["role"]})
            return {**user_dict, "token": token}
        except sqlite3.IntegrityError:
            print(f"❌ User registration failed: Number {request.phoneNumber} already exists")
            raise HTTPException(status_code=400, detail="Mobile number already registered")

# --- Data Endpoints ---

@app.get("/api/balance")
def get_balance(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    with get_db_connection() as conn:
        user = _get_user(conn, user_id)
        if not user: raise HTTPException(status_code=404, detail="User not found")
        spent = _get_monthly_spent(conn, user_id)
        tier = user["tier"] or "L1"
        limit = TIER_LIMITS.get(tier, 50000.0)
    return {
        "balance": round(user["balance"], 2),
        "tier": tier,
        "monthly_limit": limit,
        "monthly_spent": round(spent, 2),
        "remaining_limit": round(limit - spent, 2)
    }

@app.get("/api/transactions")
def get_transactions(current_user: dict = Depends(get_current_user), limit: int = 100):
    user_id = current_user["sub"]
    with get_db_connection() as conn:
        user = _get_user(conn, user_id)
        if not user: raise HTTPException(status_code=404, detail="User not found")
        rows = conn.execute(
            "SELECT id, type, counterparty_name as counterpartyName, date, time, amount FROM transactions WHERE user_id = ? ORDER BY rowid DESC LIMIT ?",
            (user_id, limit)
        ).fetchall()
        return [dict(row) for row in rows]

@app.get("/api/transactions/statement")
def get_statement(current_user: dict = Depends(get_current_user)):
    from fpdf import FPDF
    from fpdf.enums import XPos, YPos
    import io

    user_id = current_user["sub"]
    with get_db_connection() as conn:
        user = _get_user(conn, user_id)
        if not user: raise HTTPException(status_code=404, detail="User not found")
        rows = conn.execute(
            "SELECT type, counterparty_name, date, time, amount FROM transactions WHERE user_id = ? ORDER BY date DESC, time DESC",
            (user_id,)
        ).fetchall()

    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(15, 122, 110) # Brand Color #0f7a6e
    pdf.cell(0, 20, "FinPay - Account Statement", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    # User Info
    pdf.set_font("helvetica", "", 12)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 10, f"Customer Name: {user['first_name']}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 10, f"Phone Number: {user['phone_number']}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 10, f"Statement Date: {datetime.now().strftime('%B %d, %Y')}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(10)

    # Table Header
    pdf.set_fill_color(240, 240, 240)
    pdf.set_font("helvetica", "B", 10)
    pdf.cell(30, 10, "Date", 1, 0, "C", True)
    pdf.cell(25, 10, "Time", 1, 0, "C", True)
    pdf.cell(25, 10, "Type", 1, 0, "C", True)
    pdf.cell(70, 10, "Counterparty", 1, 0, "C", True)
    pdf.cell(40, 10, "Amount (Rs.)", 1, 1, "C", True)

    # Table Rows
    pdf.set_font("helvetica", "", 10)
    for row in rows:
        amount_color = (15, 122, 110) if row["type"] == "receive" else (220, 38, 38)
        pdf.cell(30, 10, row["date"], 1)
        pdf.cell(25, 10, row["time"], 1)
        pdf.cell(25, 10, row["type"].capitalize(), 1)
        pdf.cell(70, 10, row["counterparty_name"], 1)
        pdf.set_text_color(*amount_color)
        prefix = "+" if row["type"] == "receive" else "-"
        pdf.cell(40, 10, f"{prefix}{row['amount']:,.2f}", 1, 1, "R")
        pdf.set_text_color(0, 0, 0)

    # Footer
    pdf.ln(20)
    pdf.set_font("helvetica", "I", 8)
    pdf.cell(0, 10, "This is a computer-generated document and does not require a signature.", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf_bytes = pdf.output()
    pdf_output = io.BytesIO(pdf_bytes)
    return StreamingResponse(
        pdf_output, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=FinPay_Statement_{user_id[:8]}.pdf"}
    )

@app.post("/api/transfer")
def process_transfer(request: TransferRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    with get_db_connection() as conn:
        user = _get_user(conn, user_id)
        if not user: raise HTTPException(status_code=404, detail="User not found")
        
        spent = _get_monthly_spent(conn, user_id)
        tier = user["tier"] or "L1"
        limit = TIER_LIMITS.get(tier, 50000.0)
        
        if (spent + request.amount) > limit:
            raise HTTPException(status_code=400, detail=f"Monthly limit exceeded (Rs. {limit:,.0f})")
        
        if request.amount > user["balance"]:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        
        now = datetime.now()
        conn.execute(
            "INSERT INTO transactions (id, user_id, type, counterparty_name, date, time, amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), user_id, "send", request.recipientName, now.strftime("%Y-%m-%d"), now.strftime("%H:%M"), request.amount)
        )
        conn.execute("UPDATE users SET balance = balance - ? WHERE id = ?", (request.amount, user_id))
        conn.commit()
        
        updated_user = _get_user(conn, user_id)
        return {"status": "success", "new_balance": round(updated_user["balance"], 2)}

@app.post("/api/topup")
def process_topup(request: TopUpRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    with get_db_connection() as conn:
        user = _get_user(conn, user_id)
        if not user: raise HTTPException(status_code=404, detail="User not found")
        now = datetime.now()
        conn.execute(
            "INSERT INTO transactions (id, user_id, type, counterparty_name, date, time, amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), user_id, "receive", f"Top Up ({request.source})", now.strftime("%Y-%m-%d"), now.strftime("%H:%M"), request.amount)
        )
        conn.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (request.amount, user_id))
        conn.commit()
        
        updated_user = _get_user(conn, user_id)
        return {"status": "success", "new_balance": round(updated_user["balance"], 2)}

# --- Admin Endpoints ---

@app.get("/api/admin/users")
def admin_get_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin": raise HTTPException(status_code=403, detail="Admin only")
    with get_db_connection() as conn:
        rows = conn.execute("SELECT id, email, first_name, phone_number, role, tier, status, balance FROM users").fetchall()
        return [dict(row) for row in rows]

@app.post("/api/admin/users/toggle-status")
def admin_toggle_status(request: StatusToggleRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin": raise HTTPException(status_code=403, detail="Admin only")
    if request.userId == current_user["sub"]:
        raise HTTPException(status_code=400, detail="Administrative Protocol: Cannot self-restrict primary admin node.")
        
    with get_db_connection() as conn:
        conn.execute("UPDATE users SET status = ? WHERE id = ?", (request.status, request.userId))
        conn.commit()
        return {"status": "success", "new_status": request.status}

@app.get("/api/admin/stats")
def admin_get_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin": raise HTTPException(status_code=403, detail="Admin only")
    with get_db_connection() as conn:
        total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        total_tx = conn.execute("SELECT COUNT(*) FROM transactions").fetchone()[0]
        total_volume = conn.execute("SELECT SUM(amount) FROM transactions").fetchone()[0] or 0
        return {
            "total_users": total_users,
            "total_transactions": total_tx,
            "total_volume": round(total_volume, 2)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
