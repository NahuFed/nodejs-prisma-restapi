# Guía: Sistema de Autorización por Roles (RBAC)

## ¿Qué es RBAC?

**RBAC (Role-Based Access Control)** es un sistema de seguridad que determina qué acciones puede realizar cada usuario según su rol.

En lugar de darle permisos individuales a cada usuario, se asignan roles (ADMIN, USER, SUPERADMIN) y cada rol tiene permisos específicos.

---

## Roles en el Proyecto

```
enum Role {
  ADMIN        // Puede crear, actualizar y eliminar productos/categorías
  USER         // Solo puede ver productos
  SUPERADMIN   // Acceso total a todo (gestión de usuarios, todo lo demás)
}
```

### Permisos por Rol

| Acción | USER | ADMIN | SUPERADMIN |
|---|:---:|:---:|:---:|
| Ver productos | ✅ | ✅ | ✅ |
| Crear productos | ❌ | ✅ | ✅ |
| Actualizar productos | ❌ | ✅ | ✅ |
| Eliminar productos | ❌ | ✅ | ✅ |
| Ver usuarios | ❌ | ❌ | ✅ |
| Gestionar roles | ❌ | ❌ | ✅ |

---

## Implementación: Middleware `authorizeRoles`

### Ubicación

`src/middlewares/authorizeRoles.js`

### Código

```javascript
import AppError from "../utils/AppError.js";

export default function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        // 1. Verificar que el usuario esté autenticado
        if (!req.role) {
            return next(new AppError("No autenticado", 401));
        }

        // 2. Verificar que el rol del usuario esté en los roles permitidos
        if (!allowedRoles.includes(req.role)) {
            return next(new AppError("No autorizado", 403));
        }

        // 3. Si todo está OK, permitir acceso
        next();
    };
}
```

### ¿Cómo Funciona?

```javascript
authorizeRoles("ADMIN", "SUPERADMIN")
```

Devuelve un middleware que verifica:
1. **¿El usuario está autenticado?** (¿tiene `req.role`?)
2. **¿Su rol está permitido?** (¿está en `["ADMIN", "SUPERADMIN"]`?)
3. Si ambas son verdaderas → Continúa a la siguiente acción
4. Si alguna es falsa → Rechaza con error 401 o 403

---

## Flujo de Autenticación y Autorización

### Fase 1: Registro/Login

```
┌─────────────────────────────────────┐
│ Usuario envía email + contraseña    │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│ Servidor verifica credenciales      │
│ (bcrypt.compare)                    │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│ Servidor genera JWT con:            │
│ - user.id                           │
│ - user.email                        │
│ - user.role (ADMIN/USER/SUPERADMIN) │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│ Cliente recibe token JWT            │
│ Lo guarda en localStorage           │
└─────────────────────────────────────┘
```

### Fase 2: Petición a Ruta Protegida

```
┌─────────────────────────────────────┐
│ Cliente envía petición con token    │
│ Header: "Authorization: Bearer xyz" │
└─────────────────────────────────────┘
            ↓
     ┌──────────────┐
     │ verifyToken  │ (Middleware)
     │ middleware   │
     └──────────────┘
            ↓
     ¿Hay token?
    /          \
  SÍ            NO
  ↓             ↓
┌────────────────┐  ┌─────────────────────┐
│ Decodificar    │  │ Error 401:          │
│ JWT y extraer: │  │ "No hay token"      │
│ - req.id       │  └─────────────────────┘
│ - req.email    │
│ - req.role     │
└────────────────┘
            ↓
     ┌─────────────────────┐
     │ authorizeRoles      │ (Middleware)
     │ middleware          │
     └─────────────────────┘
            ↓
    ¿req.role existe?
    /         \
   SÍ         NO
   ↓          ↓
┌──────┐  ┌─────────────────────┐
│ Cont.│  │ Error 401:          │
└──────┘  │ "No autenticado"    │
    ↓     └─────────────────────┘
┌──────────────────────────────────┐
│ ¿req.role en allowedRoles?       │
│ (ej: ADMIN o SUPERADMIN)         │
└──────────────────────────────────┘
   /                         \
  SÍ                         NO
  ↓                          ↓
┌──────────────────┐  ┌──────────────────────┐
│ Ejecutar         │  │ Error 403:           │
│ controlador      │  │ "No autorizado"      │
│ (crear producto) │  │ (Rol insuficiente)   │
└──────────────────┘  └──────────────────────┘
```

---

## Ejemplo: Proteger Ruta de Crear Producto

En `src/routes/products.routes.js`:

```javascript
import { Router } from "express";
import verifyToken from "../auth/verifyToken.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { createProduct } from "../controllers/products.controllers.js";

const router = Router();

// Ruta: POST /products
// Middlewares en orden:
// 1. verifyToken - extrae el rol del JWT
// 2. authorizeRoles("ADMIN", "SUPERADMIN") - verifica que sea ADMIN o SUPERADMIN
// 3. createProduct - crea el producto
router.post(
    "/products",
    verifyToken,                           // ← Verificar token
    authorizeRoles("ADMIN", "SUPERADMIN"), // ← Verificar rol
    createProduct                          // ← Ejecutar acción
);

export default router;
```

### Escenarios de Ejecución

**Escenario 1: Usuario ADMIN intenta crear producto**
```
Cliente envía petición POST /products con token ADMIN
    ↓
verifyToken: ✅ Token válido, req.role = "ADMIN"
    ↓
authorizeRoles: ✅ "ADMIN" está en ["ADMIN", "SUPERADMIN"]
    ↓
createProduct: ✅ Ejecuta la acción
    ↓
Respuesta: 201 Created (Producto creado)
```

**Escenario 2: Usuario USER intenta crear producto**
```
Cliente envía petición POST /products con token USER
    ↓
verifyToken: ✅ Token válido, req.role = "USER"
    ↓
authorizeRoles: ❌ "USER" NO está en ["ADMIN", "SUPERADMIN"]
    ↓
Respuesta: 403 Forbidden (No autorizado)
```

**Escenario 3: Sin token**
```
Cliente envía petición sin token
    ↓
verifyToken: ❌ No hay token
    ↓
Respuesta: 401 Unauthorized (No hay token)
```

---

## Diagrama de Flujo: Autorización de SUPERADMIN

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO INTENTA ACCEDER                      │
│                                                                 │
│  1. Usuario llena formulario en Frontend                        │
│     email: "admin@empresa.com"                                  │
│     password: "SuperSegura123"                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PETICIÓN: POST /auth/login                   │
│                                                                 │
│  Body: { email, password }                                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                    ╔═════════════════╗
                    ║ login()         ║
                    ║ controller      ║
                    ╚═════════════════╝
                            ↓
            ┌────────────────────────────────┐
            │ 1. Buscar usuario en BD        │
            │    por email                   │
            └────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │ 2. Verificar contraseña con bcrypt    │
        │    bcrypt.compare(password,           │
        │                   user.password_hash) │
        └───────────────────────────────────────┘
                            ↓
                   ¿Contraseña correcta?
                  /                     \
                SÍ                      NO
                ↓                       ↓
        ┌──────────────────┐  ┌──────────────────────┐
        │ 3. Generar JWT   │  │ Error 401            │
        │    con:          │  │ Credenciales         │
        │ - id: 1          │  │ inválidas            │
        │ - email: ...     │  └──────────────────────┘
        │ - role: SUPERADMIN
        │                  │
        │ JWT: eyJhbG...   │
        └──────────────────┘
                ↓
        ┌──────────────────┐
        │ 4. Enviar token  │
        │    al cliente    │
        │ {                │
        │   token: "..."   │
        │   role: "SUPERADMIN"
        │ }                │
        └──────────────────┘
                ↓
        ┌──────────────────────────────┐
        │ Cliente recibe token         │
        │ Lo guarda en localStorage    │
        │ localStorage.token = "..."   │
        └──────────────────────────────┘
```

---

## Diagrama: Flujo de Acceso a Rutas Protegidas

```
┌──────────────────────────────────────────────────────────────┐
│           USUARIO INTENTA ACCEDER A RUTA PROTEGIDA          │
│                                                              │
│  Frontend: fetch('/products', {                             │
│    headers: {                                               │
│      'Authorization': 'Bearer eyJhbG...'                     │
│    }                                                        │
│  })                                                         │
└──────────────────────────────────────────────────────────────┘
                            ↓
                ╔════════════════════╗
                ║  verifyToken()     ║
                ║  (middleware)      ║
                ╚════════════════════╝
                            ↓
        ┌──────────────────────────────┐
        │ 1. Extraer token del header  │
        │    Authorization: Bearer ... │
        └──────────────────────────────┘
                            ↓
        ┌──────────────────────────────┐
        │ 2. Decodificar JWT           │
        │    jwt.verify(token, secret) │
        └──────────────────────────────┘
                            ↓
        ┌──────────────────────────────┐
        │ 3. Si OK, extraer payload:   │
        │    req.id = payload.id       │
        │    req.email = payload.email │
        │    req.role = payload.role   │
        │    (SUPERADMIN)              │
        └──────────────────────────────┘
                            ↓
            ╔═════════════════════════════╗
            ║  authorizeRoles()           ║
            ║  (middleware)               ║
            ║  Ej: ADMIN, SUPERADMIN      ║
            ╚═════════════════════════════╝
                            ↓
        ┌──────────────────────────────┐
        │ 1. Verificar req.role existe │
        │    ¿req.role?                │
        └──────────────────────────────┘
                    /              \
                  SÍ                NO
                  ↓                 ↓
        ┌──────────────────┐  ┌──────────────┐
        │ Continúa         │  │ Error 401    │
        └──────────────────┘  │ No autenticado
                ↓             └──────────────┘
        ┌──────────────────────────────┐
        │ 2. Verificar si rol está     │
        │    en allowedRoles           │
        │    incluye SUPERADMIN?       │
        └──────────────────────────────┘
                    /              \
                  SÍ                NO
                  ↓                 ↓
        ┌──────────────────┐  ┌──────────────┐
        │ 3. next()        │  │ Error 403    │
        │ Continúa a       │  │ No autorizado │
        │ controlador      │  │ (permisos    │
        │                  │  │  insuficientes)
        └──────────────────┘  └──────────────┘
                ↓
        ╔═════════════════════════════╗
        ║  getProducts()              ║
        ║  o createProduct()          ║
        ║  (controlador)              ║
        ╚═════════════════════════════╝
                ↓
        ┌────────────────────────────────────┐
        │ Ejecutar lógica de negocio         │
        │ - Buscar en BD                     │
        │ - Procesar datos                   │
        │ - Guardar en BD                    │
        └────────────────────────────────────┘
                ↓
        ┌────────────────────────────────────┐
        │ Responder al cliente               │
        │ 200 OK o 201 Created con datos     │
        └────────────────────────────────────┘
```

---

## Flujo Frontend: Cómo Accede SUPERADMIN a Páginas Especiales

```
┌─────────────────────────────────────────────────────────────┐
│                      PÁGINA: Users                          │
│         (Solo visible para SUPERADMIN)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Frontend App                                               │
│                                                             │
│  1. Usuario SUPERADMIN hace login                           │
│     ↓                                                       │
│  2. Backend devuelve token con role: "SUPERADMIN"           │
│     ↓                                                       │
│  3. Frontend guarda token en localStorage                   │
│     localStorage.setItem('token', token)                    │
│     ↓                                                       │
│  4. Frontend valida rol:                                    │
│     - Extrae token                                          │
│     - Decodifica (sin JWT library, es base64)               │
│     - Obtiene role                                          │
│     ↓                                                       │
│  5. Mostrar navbar con opción "Users"                       │
│     Si role === 'SUPERADMIN':                               │
│       → Mostrar link a /users ✅                            │
│     Si role === 'ADMIN' o 'USER':                           │
│       → Ocultar link ❌                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SUPERADMIN hace click en "Users" y accede a /users         │
│  ↓                                                          │
│  Frontend envía: GET /users con token en header             │
│  ↓                                                          │
│  Backend recibe petición:                                   │
│  - Middleware verifyToken: ✅ Token OK, role = SUPERADMIN   │
│  - Middleware authorizeRoles: ✅ SUPERADMIN permitido       │
│  - Controlador: Obtiene lista de usuarios                   │
│  ↓                                                          │
│  Frontend recibe respuesta: { users: [...] }               │
│  ↓                                                          │
│  Frontend renderiza tabla de usuarios ✅                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  USER intenta acceder manualmente a /users                  │
│  ↓                                                          │
│  Frontend valida en código:                                 │
│  if (role !== 'SUPERADMIN') {                               │
│    redirect to /403 o /products                             │
│  }                                                          │
│  ↓ (si de todas formas llega al backend)                    │
│  Backend recibe petición GET /users con token USER          │
│  - verifyToken: ✅ Token OK, role = USER                    │
│  - authorizeRoles('SUPERADMIN'): ❌ USER NO permitido       │
│  - Respuesta: 403 Forbidden ❌                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Rutas Protegidas en el Proyecto

### GET /products - Ver productos (Todos)
```javascript
router.get("/products", verifyToken, getProducts);
// Permitido: ADMIN, USER, SUPERADMIN
```

### POST /products - Crear producto (Solo ADMIN/SUPERADMIN)
```javascript
router.post(
    "/products",
    verifyToken,
    authorizeRoles("ADMIN", "SUPERADMIN"),
    createProduct
);
```

### PATCH /products/:id - Actualizar producto (Solo ADMIN/SUPERADMIN)
```javascript
router.patch(
    "/products/:id",
    validateFields,
    verifyToken,
    authorizeRoles("ADMIN", "SUPERADMIN"),
    updateProduct
);
```

### DELETE /products/:id - Eliminar producto (Solo ADMIN/SUPERADMIN)
```javascript
router.delete(
    "/products/:id",
    validateFields,
    verifyToken,
    authorizeRoles("ADMIN", "SUPERADMIN"),
    deleteProduct
);
```

### GET /auth/me - Ver datos del usuario (Autenticado)
```javascript
router.get("/auth/me", verifyToken, me);
// Permitido: Cualquier usuario autenticado
```

---

## Códigos de Error

| Código | Situación | Solución |
|---|---|---|
| **401** | No autenticado (falta token) | Hacer login |
| **401** | Token inválido o expirado | Hacer login nuevamente |
| **403** | Rol insuficiente | Usar cuenta con rol apropiado |

---

## Resumen

| Concepto | Descripción |
|---|---|
| **verifyToken** | Extrae y valida JWT, coloca rol en `req.role` |
| **authorizeRoles** | Verifica que rol esté en lista de permitidos |
| **401** | No autenticado (sin token válido) |
| **403** | Autenticado pero sin permisos (rol insuficiente) |
| **RBAC** | Control de acceso basado en roles |

---

## Referencias

- [OWASP: Role Based Access Control](https://owasp.org/www-community/Role_Based_Access_Control)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [JWT (JSON Web Token)](https://jwt.io/)
