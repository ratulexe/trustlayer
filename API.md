# API Reference & Endpoints (API.md)

> Base URL: `http://localhost:3000` (Local) / `https://trustlayer-api.web.app` (Production)  
> All endpoints consume and produce `application/json`.

---

## 1. Overview of Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/check` | Analyze suspicious message or UPI ID for scams |
| `POST` | `/api/pay` | Generate verified UPI deep link and log pay intent |
| `POST` | `/api/qr/parse` | Decode raw UPI QR string & evaluate pre-flight risk |
| `GET` | `/api/payments` | Audit recent verified payment intents |
| `GET` | `/api/history` | Retrieve user's previous checks (paginated) |
| `GET` | `/api/stats` | Global threat statistics and trending scam patterns |

---

## 2. Detailed Endpoint Documentation

### 2.1. `POST /api/check`
Analyzes input text or UPI handle through the Dual-Engine Threat Shield.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "rawInput": "Dear user, electricity will be cut off tonight at 9.30 PM. Pay ₹450 immediately to discom.officer@paytm to avoid fine.",
  "language": "hi", // "en" | "hi" | "bn"
  "deviceId": "anon_dev_93fa88"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "checkId": "chk_89f72b14",
  "score": 92,
  "verdict": "SCAM", // "SAFE" | "CAUTION" | "SCAM"
  "reasons": [
    "Threat of immediate utility power disconnection",
    "Pressure tactic (tonight 9:30 PM deadline)",
    "Payment requested to an unverified private VPA instead of official board"
  ],
  "vernacularExplanation": "यह बिजली बिल का फर्जी संदेश है। सरकारी बिजली विभाग कभी भी व्यक्तिगत UPI पते पर पैसे नहीं मांगते।",
  "extractedUpi": "discom.officer@paytm",
  "latencyMs": 42,
  "timestamp": "2026-11-14T08:42:00.000Z"
}
```

---

### 2.2. `POST /api/pay`
Validates the payee, verifies safety status, and constructs a secure `upi://pay` deep link.

#### Request Body
```json
{
  "checkId": "chk_10c84e92",
  "upiId": "ramu.tea@upi",
  "payeeName": "Ramu Tea Stall",
  "amount": 350.00,
  "note": "TrustLayer Verified Payment"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "paymentId": "pay_5a129d81",
  "status": "INITIATED",
  "upiDeepLink": "upi://pay?pa=ramu.tea@upi&pn=Ramu%20Tea%20Stall&am=350.00&cu=INR&tn=TrustLayer%20Verified%20Payment",
  "securitySeal": {
    "isVerified": true,
    "warningNotice": null
  },
  "timestamp": "2026-11-14T08:42:15.000Z"
}
```

#### Error Response (`403 Forbidden` if payee was flagged as a scam)
```json
{
  "success": false,
  "error": "PAYMENT_BLOCKED",
  "message": "This payment recipient was flagged as high-risk fraud (Score: 92). Outflow blocked for consumer protection."
}
```

---

### 2.3. `GET /api/history`
Retrieves the user's past scans.

#### Query Parameters
- `deviceId` (string, required): Anonymous device fingerprint.
- `limit` (integer, optional, default: 10): Number of records.

#### Response (`200 OK`)
```json
{
  "success": true,
  "total": 3,
  "history": [
    {
      "checkId": "chk_89f72b14",
      "snippet": "Dear user, electricity will be cut off tonight...",
      "verdict": "SCAM",
      "score": 92,
      "date": "2026-11-14T08:30:00.000Z"
    },
    {
      "checkId": "chk_10c84e92",
      "snippet": "ramu.tea@upi",
      "verdict": "SAFE",
      "score": 8,
      "date": "2026-11-14T08:15:00.000Z"
    }
  ]
}
```

---

### 2.4. `GET /api/stats`
Retrieves aggregated community metrics and trending threat feeds.

#### Response (`200 OK`)
```json
{
  "success": true,
  "metrics": {
    "scamsBlocked": 1420,
    "amountProtectedInr": 4820000,
    "totalChecks": 18950,
    "activeScamPatterns": 42
  },
  "trendingScams": [
    {
      "category": "UTILITY_DISCONNECTION",
      "title": "Electricity Disconnection Phishing",
      "affectedRegions": ["Delhi NCR", "West Bengal", "Maharashtra"],
      "severity": "CRITICAL"
    },
    {
      "category": "LOTTERY_KYC",
      "title": "Fake Bank KYC Update & Account Freeze Scam",
      "affectedRegions": ["All India"],
      "severity": "HIGH"
    }
  ]
}
```
