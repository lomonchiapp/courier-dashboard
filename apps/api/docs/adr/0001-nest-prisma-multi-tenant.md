# ADR 0001: NestJS + Prisma + multi-tenant por `tenantId`

## Estado

Aceptado (2025-03)

## Contexto

Se necesita una API mantenible, documentada (OpenAPI), con trazabilidad fuerte y capacidad de servir a **varios couriers** (instalaciones o tenants) sin bifurcar el código.

## Decisión

- **Framework**: NestJS para módulos, inyección de dependencias, guards y ecosistema Swagger.
- **Persistencia**: PostgreSQL con **Prisma** (migraciones y tipos generados).
- **Multi-tenant**: columna `tenant_id` en todas las tablas de negocio; resolución del tenant vía cabecera `X-Tenant-Id` acoplada a la API key o al JWT.
- **Tracking**: eventos **append-only** en `tracking_events` y fase actual en `shipments.current_phase` para lecturas rápidas.

## Consecuencias

- **Positivas**: un solo despliegue; aislamiento lógico por tenant; contrato OpenAPI alineado con el código.
- **Negativas**: escala “noisy neighbor” si un tenant satura recursos — mitigar con rate limiting y pools (fases posteriores).
- **Alternativas descartadas**: schema por tenant en PostgreSQL (más coste operativo); GraphQL (más curva de aprendizaje para partners courier).
