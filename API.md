# EMS API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Authentication

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "admin@ems.com",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbG...",
    "user": { "_id": "...", "name": "Alex Morgan", "role": "Super Admin", ... }
  }
}
```

### POST /auth/logout

Logout (requires auth).

**Response (200):**
```json
{ "success": true, "message": "Logged out successfully" }
```

### GET /auth/me

Get current authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": { "_id": "...", "name": "...", "email": "...", "role": "...", ... }
}
```

---

## Employees

### GET /employees

List employees with search, filter, sort, and pagination.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| search | string | Search by name, email, or employee ID |
| department | string | Filter by department |
| role | string | Filter by role |
| status | string | Filter by status (Active/Inactive) |
| sortBy | string | `name`, `joiningDate`, `employeeId`, `department` |
| sortOrder | string | `asc` or `desc` |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 100) |

**Response (200):**
```json
{
  "success": true,
  "data": [ { ...employee } ],
  "pagination": { "page": 1, "limit": 10, "total": 7, "totalPages": 1 }
}
```

### GET /employees/:id

Get a single employee by ID.

### POST /employees

Create a new employee. **Roles:** Super Admin, HR Manager

**Request:** `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| employeeId | string | Yes |
| name | string | Yes |
| email | string | Yes |
| phone | string | Yes |
| password | string | Yes |
| department | string | Yes |
| designation | string | Yes |
| salary | number | Yes |
| joiningDate | date | Yes |
| status | string | No (default: Active) |
| role | string | No (default: Employee) |
| reportingManager | ObjectId | No |
| profileImage | file | No |

### PUT /employees/:id

Update an employee. Employees can only update their own profile (name, phone, profileImage).

**Request:** `multipart/form-data` (same fields as create, all optional)

### DELETE /employees/:id

Soft-delete an employee. **Roles:** Super Admin only

### GET /employees/:id/reportees

Get direct reports for an employee.

**Response (200):**
```json
{
  "success": true,
  "data": [ { ...employee } ]
}
```

### PATCH /employees/:id/manager

Assign or change reporting manager. **Roles:** Super Admin, HR Manager

**Request Body:**
```json
{
  "managerId": "507f1f77bcf86cd799439011"
}
```

Set `managerId` to `null` to remove manager.

### GET /employees/dashboard/stats

Dashboard statistics. **Roles:** Super Admin, HR Manager

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEmployees": 7,
    "activeEmployees": 6,
    "inactiveEmployees": 1,
    "departmentCount": 4,
    "byDepartment": [ { "_id": "Engineering", "count": 3 } ],
    "byRole": [ { "_id": "Employee", "count": 5 } ]
  }
}
```

### POST /employees/import/csv

Bulk import employees from CSV. **Roles:** Super Admin, HR Manager

**Request:** `multipart/form-data` with `file` field (CSV)

**Response (200):**
```json
{
  "success": true,
  "message": "CSV import completed",
  "data": { "created": 2, "failed": 0, "errors": [] }
}
```

---

## Organization

### GET /organization/tree

Get the full organizational hierarchy tree.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Alex Morgan",
      "designation": "CEO",
      "department": "Human Resources",
      "children": [
        {
          "_id": "...",
          "name": "Sarah Chen",
          "children": [ ... ]
        }
      ]
    }
  ]
}
```

---

## Health Check

### GET /health

```json
{ "success": true, "message": "EMS API is running" }
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ { "field": "email", "message": "Valid email is required" } ]
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error / bad request |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role permissions) |
| 404 | Resource not found |
| 500 | Internal server error |
