# Requests para Thunder Client

Base URL:

```text
http://localhost:3000
```

## 1) Obtener categorias

```http
GET /api/categories
```

URL completa:

```text
http://localhost:3000/api/categories
```

Headers:

```http
Content-Type: application/json
```

## 2) Obtener productos

```http
GET /api/products
```

URL completa:

```text
http://localhost:3000/api/products
```

Headers:

```http
Content-Type: application/json
```

## 3) Crear producto

```http
POST /api/products
```

URL completa:

```text
http://localhost:3000/api/products
```

Headers:

```http
Content-Type: application/json
```

Body JSON:

```json
{
  "name": "Mouse gamer",
  "quantity": 10,
  "price": 25,
  "categoryId": 1
}
```

## 4) Obtener producto por ID

```http
GET /api/products/:id
```

URL completa de ejemplo:

```text
http://localhost:3000/api/products/1
```

Headers:

```http
Content-Type: application/json
```

## 5) Actualizar producto por ID

```http
PATCH /api/products/:id
```

URL completa de ejemplo:

```text
http://localhost:3000/api/products/1
```

Headers:

```http
Content-Type: application/json
```

Body JSON de ejemplo:

```json
{
  "quantity": 8,
  "price": 30
}
```

## 6) Eliminar producto por ID

```http
DELETE /api/products/:id
```

URL completa de ejemplo:

```text
http://localhost:3000/api/products/1
```

Headers:

```http
Content-Type: application/json
```

## Orden recomendado para probar

1. Crear al menos una categoria en la base de datos.
2. Crear un producto con `categoryId` valido.
3. Obtener la lista de productos.
4. Probar GET, PATCH y DELETE por ID.

## Notas

- Si `categoryId` no existe, Prisma devolvera error de relacion.
- Para que `GET /api/products` muestre la categoria, debe existir la relacion en la base de datos.
- Si quieres, puedes copiar estos bloques directamente a Thunder Client como requests separadas.