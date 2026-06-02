# JWT (JSON Web Token) - Guía rápida

## ✅ ¿Qué es JWT?
JWT es un estándar para crear tokens que permiten autenticar usuarios de forma segura.

👉 Es como una credencial digital que el servidor entrega al hacer login.

---

## ⚙️ Instalación

```bash
npm install jsonwebtoken
```

---

## 🧠 ¿Para qué usamos JWT en este proyecto?

- Evitar enviar usuario y contraseña en cada request
- Identificar al usuario autenticado
- Proteger rutas del backend

Flujo:

```text
Login → generar token → cliente lo guarda → lo envía en cada request → backend lo valida
```

---

## 🔑 Métodos principales

### 1. Generar token

```js
const jwt = require('jsonwebtoken')

const token = jwt.sign(
  { userId: user.id, role: user.role },
  "SECRET_KEY",
  { expiresIn: "1h" }
)
```

👉 Se usa al hacer login

---

### 2. Verificar token

```js
const decoded = jwt.verify(token, "SECRET_KEY")
```

👉 Se usa en middleware para proteger rutas

---

## 🔐 Middleware de autenticación

```js
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) return res.status(401).json({ message: "No autorizado" })

  try {
    const decoded = jwt.verify(token, "SECRET_KEY")
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: "Token inválido" })
  }
}
```

---

## 🛑 Códigos importantes

- 401 → No autenticado (no hay token o es inválido)
- 403 → No autorizado (no tiene permisos)

---

## 🎯 En resumen

JWT permite:

- Mantener sesiones sin usar base de datos
- Proteger rutas del backend
- Identificar quién hace la request

👉 Es clave para aplicaciones modernas (React, APIs REST)
