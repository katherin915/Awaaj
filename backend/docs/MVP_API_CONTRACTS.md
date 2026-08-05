# MVP API Contracts

This document defines request, response, and error contracts for production MVP pages:
- Report Issue
- My Complaints
- Analytics
- Officer Dashboard

## Base
- Base URL: `/api`
- Content type: `application/json` except multipart upload routes
- Auth: `Authorization: Bearer <jwt>` for protected routes

---

## 1) Report Issue

### `POST /issues`
Create a new complaint.

Auth: Required

Request (`multipart/form-data`)
- `title` (string, optional when `file` exists)
- `description` (string, optional when `file` exists)
- `phone` (string, optional)
- `email` (string, required)
- `location` (string or object, optional)
- `notifyByEmail` ("true" | "false", optional)
- `file` (image, optional)

Success `201`
```json
{
  "message": "Issue submitted successfully",
  "issue": {
    "_id": "...",
    "title": "...",
    "description": "...",
    "category": "Roads & Infrastructure",
    "priority": "High",
    "priorityScore": 82,
    "status": "Pending",
    "createdAt": "2026-03-14T12:00:00.000Z"
  },
  "aiAnalysis": {
    "category": "Roads & Infrastructure",
    "categoryConfidence": 0.9,
    "priorityLevel": "High",
    "priorityScore": 82
  }
}
```

Error `400`
```json
{ "error": "Email is required" }
```

Error `401`
```json
{ "message": "No token provided" }
```

Error `500`
```json
{ "error": "Internal Server Error" }
```

---

## 2) Issue Listing (Server-side filtering/pagination)

### `GET /issues`
List issues with optional server-side filtering.

Auth: Not required

Query params
- `page` (number, default `1`)
- `limit` (number, default `10`, max `100`)
- `status` (string, optional, use `all` to disable)
- `category` (string, optional, use `all` to disable)
- `priority` (string, optional, use `all` to disable)
- `search` (string, optional)
- `sort` (`newest` | `oldest` | `priority`, default `newest`)

Success `200`
```json
{
  "data": [
    {
      "_id": "...",
      "title": "...",
      "description": "...",
      "status": "In Progress",
      "priority": "High",
      "category": "Water & Sanitation",
      "createdAt": "2026-03-14T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 3) My Complaints

### `GET /issues/mine`
List complaints of current authenticated user by token email.

Auth: Required

Query params
- `page` (number, default `1`)
- `limit` (number, default `10`, max `100`)
- `status` (string, optional, use `all` to disable)

Success `200`
```json
{
  "data": [
    {
      "_id": "...",
      "email": "user@example.com",
      "description": "...",
      "status": "Pending",
      "upvotes": 0,
      "createdAt": "2026-03-14T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

Error `401`
```json
{ "error": "User email is missing in token payload" }
```

---

## 4) Officer/Admin Status Update

### `PATCH /issues/:id/status`
Update complaint workflow status.

Auth: Required (`officer` or `admin`)

Request
```json
{
  "newStatus": "Resolved"
}
```

Success `200`
```json
{
  "message": "Status updated successfully."
}
```

Error `403`
```json
{ "message": "Officer access only" }
```

Error `404`
```json
{ "error": "Issue not found" }
```

---

## 5) Analytics Overview

### `GET /analytics/overview`
Admin analytics summary for dashboard and charts.

Auth: Required (`admin`)

Success `200`
```json
{
  "success": true,
  "data": {
    "totalIssues": 120,
    "byCategory": [
      { "_id": "Roads & Infrastructure", "count": 20, "avgConfidence": 0.91 }
    ],
    "byPriority": [
      { "_id": "High", "count": 30, "avgScore": 78.2 }
    ],
    "byStatus": [
      { "_id": "Pending", "count": 25 }
    ],
    "slaMetrics": {
      "onTime": 100,
      "overdue": 20
    },
    "priorityMetrics": {
      "_id": null,
      "avgScore": 61.7,
      "minScore": 20,
      "maxScore": 96
    },
    "highPriorityRecent": [
      {
        "_id": "...",
        "title": "...",
        "category": "Electricity & Power",
        "priority": "High",
        "priorityScore": 90,
        "createdAt": "2026-03-14T12:00:00.000Z"
      }
    ],
    "trends": [
      {
        "_id": { "date": "2026-03-14", "category": "Waste Management" },
        "count": 3
      }
    ]
  },
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

Error `403`
```json
{ "message": "Admin access only" }
```

---

## Status Enum (MVP)
- `Pending`
- `In Progress`
- `Resolved`
- `Closed`
- `On Hold`
- `Rejected`

## Priority Enum (MVP)
- `High`
- `Medium`
- `Low`

## Category Enum (MVP)
- `Roads & Infrastructure`
- `Water & Sanitation`
- `Electricity & Power`
- `Waste Management`
- `Public Amenities`
- `Environment`
- `Others`
