# Coordinates App – Full-Stack Assignment

The application stores GPS coordinates in a PostgreSQL database, serves them through a REST API, and visualizes them on an interactive map using React and Leaflet.

---

## Features

### Backend (ASP.NET Core Web API)
- REST API for managing GPS coordinates
- PostgreSQL database with Entity Framework Core
- CRUD operations:
    - Get all coordinates (ordered)
    - Get coordinate by ID
    - Create new coordinate
    - Update existing coordinate
    - Delete coordinate
- Swagger UI for API testing

### Frontend (React)
- Interactive map using **React-Leaflet**
- Markers displayed for all coordinates
- Polyline connecting points based on their order
- Side panel with:
    - List of points
    - Detail view
    - Edit mode
    - Create new point
    - Delete point
- Automatic map centering when a point is selected

---

## Tech Stack

**Backend**
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- Npgsql
- Swagger / OpenAPI

**Frontend**
- React (Vite)
- React Hooks (`useState`, `useEffect`, `useMemo`)
- React-Leaflet
- Leaflet
- Fetch API

---

## Project Structure

```
coordinates-app/
├─ backend/
│  └─ CoordinatesApp/
│     ├─ Controllers/
│     ├─ Data/
│     ├─ Models/
│     └─ Program.cs
│
├─ frontend/
│  └─ src/
│     ├─ api/
│     │  └─ coordinatesApi.js
│     ├─ components/
│     │  ├─ MapView.jsx
│     │  ├─ MapCanvas.jsx
│     │  └─ SidePanel.jsx
│     └─ App.jsx
│
└─ README.md
```

---

## Backend Setup

### Prerequisites
- .NET 8 SDK
- PostgreSQL

### Database
Create a PostgreSQL database and a `coordinates` table. Example structure:

```sql
CREATE TABLE coordinates (
  id SERIAL PRIMARY KEY,
  name TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  "order" INTEGER NOT NULL
);
```

Seed the table with a few sample coordinates.

### Configuration
Update the connection string in `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=coordinatesdb;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

### Run Backend

```bash
dotnet run
```

Swagger UI will be available at:

```
https://localhost:7059/swagger
```

---

## Frontend Setup

### Prerequisites
- Node.js (>=18)

### Install Dependencies

```bash
cd frontend
npm install
```

### Run Frontend

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|------|---------|-------------|
| GET | `/api/coordinates` | Get all coordinates (ordered) |
| GET | `/api/coordinates/{id}` | Get coordinate by ID |
| POST | `/api/coordinates` | Create new coordinate |
| PUT | `/api/coordinates/{id}` | Update coordinate |
| DELETE | `/api/coordinates/{id}` | Delete coordinate |

---

## Author

**Péter Polyák**
