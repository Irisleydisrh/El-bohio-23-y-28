# Load Tests

This directory contains load tests for the El Bohío backend.

## Opciones para ejecutar tests de carga

### Opción 1: Node.js Load Test (sin instalar nada extra)

```bash
cd backend
npm run load-test
```

Este test simple está incluido y no requiere k6. Simula 10 usuarios concurrentes por 1 minuto.

### Opción 2: k6 (recomendado para producción)

Si tienes k6 instalado:

```bash
# Instalar k6 (Windows)
winget install k6 --source winget

# O usar chocolatey
choco install k6

# Ejecutar tests
cd backend
npm run load-test:k6
```

## Tests incluidos

- `smoke.js` - Test de carga con k6 (requiere k6 instalado)
- `node-load-test.js` - Test de carga con Node.js (incluido)

## Variables de entorno

```bash
# Cambiar la URL base
export BASE_URL=http://localhost:3000
npm run load-test
```

## Recomendaciones

- El backend debe estar corriendo en el puerto 3000
- Asegúrate de tener la base de datos configurada
- Para tests de producción, usa k6 ya que ofrece mejor reporting y métricas