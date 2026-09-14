# API Contract: BPDP IAM Public Region Endpoints

**Backend Service**: `bpdp-iam-be`  
**Base URL**: `VITE_IAM_API_URL` (e.g. `https://sso-local.scitechnology.id/api/api/v1`)  
**Auth Requirement**: Public (No Bearer Token required)  
**Verified in Codebase**: `bpdp-iam-be/internal/region/handler.go`  

---

## 1. List All Provinces

### Request
- **Method**: `GET`
- **Path**: `/public/regions/provinces`
- **Headers**:
  - `Accept: application/json`

### Response (200 OK)
```json
{
  "data": [
    {
      "id": 11,
      "name": "ACEH"
    },
    {
      "id": 12,
      "name": "SUMATERA UTARA"
    },
    {
      "id": 13,
      "name": "SUMATERA BARAT"
    },
    {
      "id": 14,
      "name": "RIAU"
    },
    {
      "id": 73,
      "name": "SULAWESI SELATAN"
    }
  ],
  "message": "success"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Failed to retrieve provinces"
  }
}
```

---

## 2. List Regencies / Cities by Province

### Request
- **Method**: `GET`
- **Path**: `/public/regions/regencies`
- **Query Parameters**:
  - `province_id` (`integer`, optional): Filter regencies by province ID (e.g. `?province_id=73`)
- **Headers**:
  - `Accept: application/json`

### Response (200 OK)
```json
{
  "data": [
    {
      "id": 7301,
      "province_id": 73,
      "name": "KABUPATEN KEPULAUAN SELAYAR"
    },
    {
      "id": 7322,
      "province_id": 73,
      "name": "KABUPATEN LUWU UTARA"
    },
    {
      "id": 7325,
      "province_id": 73,
      "name": "KABUPATEN LUWU TIMUR"
    },
    {
      "id": 7371,
      "province_id": 73,
      "name": "KOTA MAKASSAR"
    }
  ],
  "message": "success"
}
```

### Error Response (400 Bad Request)
```json
{
  "error": {
    "code": "INVALID_QUERY_PARAM",
    "message": "Invalid province_id parameter"
  }
}
```

### Error Response (500 Internal Server Error)
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Failed to retrieve regencies"
  }
}
```
