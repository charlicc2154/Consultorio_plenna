# Consultorio API

Backend API-first en Laravel para gestionar clinicas, usuarios administradores, pacientes, citas medicas e historias clinicas.

## Stack

- Laravel
- MySQL
- Docker Compose
- Laravel Boost y Laravel MCP para apoyo de desarrollo

## Levantar el proyecto

```bash
docker compose up -d
docker compose exec app composer install
docker compose exec app php artisan migrate
```

La API queda disponible en:

```text
http://localhost:8001
```

## Rutas principales

```text
GET|POST        /api/patients
GET|PATCH|PUT   /api/patients/{patient}
DELETE          /api/patients/{patient}

GET|POST        /api/appointments
GET|PATCH|PUT   /api/appointments/{appointment}
DELETE          /api/appointments/{appointment}

GET|POST        /api/clinical-histories
GET|PATCH|PUT   /api/clinical-histories/{clinical_history}
DELETE          /api/clinical-histories/{clinical_history}
```

## Nota

Este proyecto no incluye frontend todavia. El frontend se implementara despues, probablemente con TypeScript.
