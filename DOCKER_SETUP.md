# Run the project with Docker Compose (development)

## What this starts

- MySQL 8.0 on host port 3307 (container port 3306)
- Express API on http://localhost:5000
- React/Vite frontend on http://localhost:5173

The frontend and backend source folders are bind-mounted into their containers, so edits in the repository are reflected during development. MySQL data is stored in the existing Docker volume `music_mood_mysql_data`.

## First-time setup on Windows PowerShell

1. Make sure Docker Desktop is running.
2. Copy the root environment template:
   ```powershell
   Copy-Item .env.docker.example .env
   ```
3. Edit the root `.env` and set `MYSQL_ROOT_PASSWORD` to the password used when the existing `music-mood-mysql` container was first created. Do not commit this file.
4. Create the backend environment file if it does not already exist:
   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```
5. Edit `backend/.env` and set `JWT_SECRET` to a random secret of at least 32 bytes. For example:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Keep the secret private. The Compose configuration overrides the backend DB host, port, and password so the API connects to the Compose MySQL service.
6. The original standalone MySQL container uses the same container name as the Compose service. Remove only that container (the named data volume is retained):
   ```powershell
   docker rm -f music-mood-mysql
   ```
7. Start the full stack from the repository root:
   ```powershell
   docker compose up --build
   ```

## Useful commands

- Stop the stack: `docker compose down`
- Stop the stack and keep database data: `docker compose down` (the named volume is not removed)
- View service status: `docker compose ps`
- Follow logs: `docker compose logs -f`
- Rebuild after dependency or Dockerfile changes: `docker compose up --build`

Do not run `docker compose down -v` unless you intentionally want to delete the database and dependency volumes.

## MySQL Workbench

Create a connection with:

- Hostname: `127.0.0.1`
- Port: `3307`
- Username: `root`
- Password: the same `MYSQL_ROOT_PASSWORD` from the root `.env`

The database name is `music_mood_db`. The Docker setup preserves the existing named volume. SQL scripts remain in the repository and can be opened and executed from MySQL Workbench as usual.

## SQL initialization

The Compose file creates the database if it is a fresh volume, but it does not automatically execute the project's numbered SQL scripts. Run the scripts from the `database/` folder in their documented order using MySQL Workbench. Do not run the development-only reset script unless you intend to erase the database.
