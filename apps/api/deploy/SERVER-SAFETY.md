# Trabajar en el VPS sin afectar Redroid

El stack existente vive en **`/opt/redroid/`**. Blumbox API debe vivir **en otra ruta**, p. ej. **`/opt/blumbox/`**.

## Reglas

1. **No** ejecutes `docker compose` ni `docker` apuntando a proyectos dentro de `/opt/redroid/` mientras trabajas en Blumbox.
2. **Siempre** usa rutas explícitas al compose de Blumbox:

   ```bash
   cd /opt/blumbox   # o donde clonaste el monorepo
   docker compose -f apps/api/deploy/docker-compose.yml --env-file apps/api/deploy/.env.release up -d --build
   ```

3. El proyecto Compose se llama **`blumbox-api`** y la red Docker es **`blumbox_api_isolated`**. No comparte red con `redroid_*` salvo que alguien la una manualmente (no hacerlo).
4. **Volúmenes**: Postgres de Blumbox usa `blumbox_api_pgdata`. No borres volúmenes sin ver el nombre (`docker volume ls`).
5. **Puertos**: la API escucha en **`127.0.0.1:3001`** en el host. No reutilices el mismo binding que otros servicios.

## Comprobaciones rápidas

```bash
docker compose -f /opt/blumbox/apps/api/deploy/docker-compose.yml ps
docker network ls | grep -E 'blumbox|redroid'
```

## Si usas el panel Hostinger

Crea un **proyecto Docker nuevo** para Blumbox y apunta solo a `/opt/blumbox/.../deploy`, no al directorio de Redroid.
