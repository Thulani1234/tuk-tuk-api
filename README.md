
# Tuk-Tuk Tracking API

**Student ID: COBSCCOMP242P-028**
**Student Name: T.T.Liyanaarachchi**


Real-Time Three-Wheeler Tracking System for Sri Lanka Police.

## Tech Stack
- Node.js / ES6+
- Express.js
- Microsoft SQL Server
- JWT Authentication
- Swagger / OpenAPI 3.0

## Local Setup
```bash
cp .env.example .env
npm install
node scripts/seed.js
npm run dev
```

## Swagger Docs
https://tuk-tuk-api-production-46b5.up.railway.app
https://tuk-tuk-api-production-46b5.up.railway.app/api-docs


http://localhost:3000/api-docs (localhost)


## API Specification JSON File Created Direct JSON File Link:
http://localhost:3001/csv/tuktuk-api-specification.json

## Roles
| Role | Access |
|------|--------|
| hq_admin | Full access |
| provincial_admin | Vehicles + locations |
| station_user | Read only |
| device | POST pings only |