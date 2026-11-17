# Deploying to a Raspberry Pi

Production stack: nginx serves the built SPA and proxies `/api` to the backend.
Only nginx publishes a port; MySQL, Redis and the app containers stay on the
internal Docker network.

```
                    Internet / LAN
                          │
                          ▼
              ┌───────────────────────┐
              │  nginx            :80 │  ← the only published port
              │    /      → frontend  │
              │    /api/* → backend   │
              └───────────┬───────────┘
                          │ compose network (not reachable from outside)
        ┌─────────────┬───┴────────┬──────────────┐
     frontend      backend       mysql         redis
     (static)     (:5000)       (:3306)       (:6379)
```

Because the SPA and the API share one origin, the browser never makes a
cross-origin request — **CORS is not involved in production at all**.

---

## Requirements

**Use 64-bit Raspberry Pi OS.** The `mysql:8.0` image has no 32-bit build, so
`docker compose up` fails on 32-bit Raspbian with "no matching manifest". Check
with:

```bash
uname -m      # must be aarch64, not armv7l
```

If it says `armv7l`, reflash with the 64-bit image — there is no workaround
short of swapping MySQL for MariaDB.

Everything else is multi-arch (`node:20-alpine`, `nginx:1.27-alpine`,
`redis:7-alpine`, `mysql:8.0`), so no emulation is needed.

Install Docker:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER    # log out and back in for this to apply
```

---

## First deploy

**1. Get the code onto the Pi**

```bash
git clone <your-repo-url> quizweb
cd quizweb
```

**2. Create the production env file**

```bash
cp .env.prod.example .env.prod
```

Fill in real values. Generate strong secrets rather than inventing them:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

At minimum, set:

| Variable | Notes |
|---|---|
| `MYSQL_ROOT_PASSWORD` | Admin password for MySQL |
| `MYSQL_PASSWORD` | Password for the app's `quizuser` |
| `JWT_ACCESS_SECRET` | Random 32-byte hex |
| `JWT_REFRESH_SECRET` | Random 32-byte hex, **different** from the access one |
| `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` | Admin login, created on first boot |
| `OPENROUTER_API_KEY` | For AI quiz generation |

`.env.prod` is gitignored. Never commit it.

**3. Build and start**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

The first build takes a while on a Pi — expect 10–20 minutes, most of it
compiling native modules (`bcrypt`, `mysql2`) for ARM.

**4. Watch it come up**

```bash
docker compose -f docker-compose.prod.yml ps
```

Wait for all five services to report `healthy`. `mysql` is the slow one — it
initialises the data directory on first boot.

**5. Open it**

```
http://<pi-ip>/
```

Log in with the `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` you set.

---

## Day-to-day

```bash
# Logs (follow)
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend

# Restart
docker compose -f docker-compose.prod.yml restart backend

# Stop (keeps data)
docker compose -f docker-compose.prod.yml down

# Stop and DELETE ALL DATA (mysql + redis volumes)
docker compose -f docker-compose.prod.yml down -v
```

### Updating after a code change

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Only changed images rebuild. If you changed backend code, remember the schema:
`sequelize.sync({ alter: false })` runs at boot and **does not** migrate existing
tables. Adding a column to a model means `ALTER TABLE` by hand on the Pi, or
`down -v` and re-seeding (which wipes data).

---

## Port 80 already taken?

**Check first — this is the most common first-deploy failure:**

```bash
sudo ss -tlnp | grep ':80 '
```

If something is already listening, the `nginx` container cannot bind the port
and **exits immediately**. It will be missing from `docker ps` (use `ps -a` to
see the corpse), and whatever was already on port 80 keeps answering — which
looks confusingly like your deploy "worked" but shows the wrong page.

Two different culprits, two different fixes:

**1. nginx installed via apt** (shows as `Server: nginx` in a `curl -sI`)

Raspberry Pi OS does not ship nginx by default, but it is easy to have
installed it earlier and forgotten. It runs as a systemd service:

```bash
systemctl status nginx --no-pager | head -5
sudo systemctl stop nginx
sudo systemctl disable nginx
```

**2. Pi-hole**

Pi-hole is a **DNS** server and normally only uses port 53, so it usually is
*not* the cause. Its web admin (lighttpd) may hold port 80 if you enabled it —
note that would show `Server: lighttpd`, not `nginx`.

Do **not** uninstall Pi-hole to free port 80; that breaks DNS for your whole
network without fixing anything. Instead, move this stack to another port:

```bash
# .env.prod
HTTP_PORT=8080
```

Then reach the app on `http://<pi-ip>:8080/`. Nothing else needs changing —
nginx is the only service that publishes a port.

---

## Troubleshooting

**The nginx container is missing from `docker ps`**

Use `ps -a` to see exited containers, then read the reason:

```bash
docker compose -f docker-compose.prod.yml ps -a
docker compose -f docker-compose.prod.yml logs nginx --tail=30
```

`bind: address already in use` means port 80 is taken — see the section above.
No log output at all usually means `depends_on` is still waiting: nginx is not
created until both `backend` and `frontend` report healthy, which takes about
90 seconds on a Pi's first boot.

**MySQL crash-loops immediately**

Read the log — it names the cause:

```bash
docker compose -f docker-compose.prod.yml logs mysql --tail=30
```

The most common one is `MYSQL_USER="root"`, which the entrypoint rejects
outright. The compose file pins `MYSQL_USER: quizuser` for this reason.

**API calls return 502 from nginx**

The backend is not healthy yet, or it crashed. Check:

```bash
docker compose -f docker-compose.prod.yml logs backend --tail=50
curl http://localhost/api/health
```

`/api/health` reports each dependency separately:

```json
{"status":"ok","checks":{"database":{"ok":true},"cache":{"ok":false}}}
```

A failing `cache` (Redis) does **not** make the endpoint return 503 — Redis is
only a permission cache and the app falls back to the database.

**Refreshing a page gives 404**

The SPA fallback in the frontend image should handle this. If it does not, the
frontend container is serving with a broken config:

```bash
docker compose -f docker-compose.prod.yml exec frontend cat /etc/nginx/conf.d/default.conf
```

**File uploads over ~5MB are rejected**

Uploads are capped at 6MB in `deploy/nginx.conf` (to sit just above the
backend's own 5MB multer limit). If you raise one, raise the other.

**AI generation times out**

`deploy/nginx.conf` allows 120s for `/api/`, because a reasoning model can spend
20s+ before answering. If timeouts persist, switch `OPENROUTER_MODEL` to a
non-reasoning model such as `deepseek/deepseek-chat`.

---

## Files involved

| File | Role |
|---|---|
| `docker-compose.prod.yml` | The production stack |
| `deploy/nginx.conf` | Reverse proxy: static SPA + `/api` |
| `backend/Dockerfile.prod` | Backend image (non-root, production deps only) |
| `frontend/Dockerfile.prod` | Multi-stage: Vite build → nginx serve |
| `.env.prod.example` | Template for the gitignored `.env.prod` |
