# Guía: Hasheo de Contraseñas con Bcrypt

## ¿Qué es Bcrypt?

**Bcrypt** es una librería que implementa el algoritmo de hashing **Blowfish** adaptado para contraseñas. Es una de las mejores prácticas en seguridad para almacenar contraseñas de forma segura en bases de datos.

### ¿Por qué no almacenar contraseñas en texto plano?

Almacenar contraseñas en texto plano es **extremadamente peligroso** porque:
- Si la base de datos es comprometida, los atacantes tienen acceso directo a todas las contraseñas.
- Los usuarios suelen reutilizar contraseñas en múltiples servicios.
- Viola estándares de seguridad y regulaciones como GDPR.

Con Bcrypt, incluso si la base de datos es comprometida, los atacantes solo obtienen el **hash** (una representación cifrada), no la contraseña original.

---

## Características Principales de Bcrypt

| Característica | Descripción |
|---|---|
| **Unidireccional** | No se puede revertir el hash para obtener la contraseña original |
| **Salting automático** | Añade "sal" (datos aleatorios) para proteger contra ataques de diccionario |
| **Adaptativo** | Es deliberadamente lento (consume más CPU), ralentizando ataques de fuerza bruta |
| **Determinista** | La misma contraseña + sal siempre produce el mismo hash |

---

## Implementación en el Proyecto

### 1. Instalación

```bash
npm install bcrypt
```

### 2. Importar Bcrypt

En `src/controllers/auth.controllers.js`:

```javascript
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
```

**¿Qué es SALT_ROUNDS?**
- Define cuántas veces se aplica el algoritmo (más vueltas = más seguro pero más lento)
- Con 10 vueltas, cada hash tarda ~100ms en procesarse (seguridad vs rendimiento)
- Recomendado: entre 10 y 12

### 3. Hasheo de Contraseña en el Registro

Cuando un usuario se registra, su contraseña debe ser hasheada antes de guardarla:

```javascript
export async function register(req, res, next) {
    try {
        const { email, password } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return next(new AppError("El correo electrónico ya está en uso", 400));
        }
        
        // ✅ HASHEAR LA CONTRASEÑA
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        // Crear usuario con contraseña hasheada
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,  // Se guarda el hash, no la contraseña
                role: "USER",
            }
        });
        
        const token = await signToken(newUser);
        res.status(201).json({ 
            message: "Registro exitoso", 
            user: { id: newUser.id, email: newUser.email, role: newUser.role }, 
            token 
        });
    } catch (error) {
        next(error);
    }
}
```

**¿Qué sucede en `bcrypt.hash()`?**
1. Genera una "sal" aleatoria
2. Combina la contraseña con la sal
3. Aplica el algoritmo Blowfish 10 veces
4. Devuelve un hash que incluye la sal y el número de rondas: `$2b$10$...`

### 4. Verificación de Contraseña en el Login

Cuando un usuario inicia sesión, comparamos la contraseña ingresada con el hash almacenado:

```javascript
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        
        // Buscar usuario por email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) 
            return next(new AppError("Credenciales inválidas", 401));
        
        // ✅ COMPARAR CONTRASEÑA CON HASH
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) 
            return next(new AppError("Credenciales inválidas", 401));
        
        // Generar token JWT
        const token = await signToken(user);
        res.status(200).json({ 
            message: "Login exitoso", 
            user: { id: user.id, email: user.email, role: user.role }, 
            token 
        });
    } catch (error) {
        next(error);
    }   
}
```

**¿Cómo funciona `bcrypt.compare()`?**
1. Toma la contraseña en texto plano ingresada por el usuario
2. Extrae la sal del hash almacenado
3. Aplica el mismo algoritmo con la sal extraída
4. Compara el resultado con el hash original
5. Si coinciden → autenticación correcta

---

## Flujo Completo de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│ REGISTRO                                                    │
├─────────────────────────────────────────────────────────────┤
│ Usuario ingresa: email="user@example.com" password="Abc123" │
│           ↓                                                  │
│  bcrypt.hash("Abc123", 10)                                  │
│           ↓                                                  │
│  Se almacena en BD: "$2b$10$...xyz..." (hash + sal)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LOGIN                                                       │
├─────────────────────────────────────────────────────────────┤
│ Usuario ingresa: email="user@example.com" password="Abc123" │
│           ↓                                                  │
│  Buscar usuario en BD → obtener hash "$2b$10$...xyz..."    │
│           ↓                                                  │
│  bcrypt.compare("Abc123", "$2b$10$...xyz...")              │
│           ↓                                                  │
│  ¿Coincide? SÍ → Generar JWT y responder token ✅           │
│           NO → Responder "Credenciales inválidas" ❌         │
└─────────────────────────────────────────────────────────────┘
```

---

## Ejemplo Práctico Paso a Paso

### Registro

```javascript
// Cliente envía:
{
  "email": "juan@example.com",
  "password": "MiContraseña123"
}

// Servidor ejecuta:
const hashedPassword = await bcrypt.hash("MiContraseña123", 10);
// Resultado: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm"

// Se guarda en la BD:
// id: 1, email: "juan@example.com", password: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm"
```

### Login

```javascript
// Cliente envía:
{
  "email": "juan@example.com",
  "password": "MiContraseña123"
}

// Servidor ejecuta:
const user = await prisma.user.findUnique({ where: { email: "juan@example.com" } });
// user.password = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm"

const passwordMatches = await bcrypt.compare("MiContraseña123", user.password);
// true ✅ → Se genera token JWT

// Si prueba con contraseña incorrecta:
const passwordMatches = await bcrypt.compare("ContraseñaEquivocada", user.password);
// false ❌ → Se rechaza el login
```

---

## Consideraciones de Seguridad

### ✅ Buenas Prácticas

1. **Nunca almacenes contraseñas en texto plano**
   ```javascript
   // ❌ MAL
   data: { password: password }
   
   // ✅ BIEN
   data: { password: await bcrypt.hash(password, 10) }
   ```

2. **Usa SALT_ROUNDS apropiados**
   ```javascript
   // 10-12 es estándar para aplicaciones web
   const SALT_ROUNDS = 10;  // ✅ BIEN
   const SALT_ROUNDS = 4;   // ❌ Muy débil (muy rápido)
   const SALT_ROUNDS = 15;  // ⚠️ Muy lento (~1000ms)
   ```

3. **Limpia errores de autenticación**
   ```javascript
   // ❌ MAL - Revela información
   return next(new AppError("El email juan@example.com no existe", 401));
   
   // ✅ BIEN - Genérico
   return next(new AppError("Credenciales inválidas", 401));
   ```

4. **Valida entrada antes de hashear**
   ```javascript
   // La contraseña debe cumplir requisitos mínimos
   if (password.length < 8) {
       return next(new AppError("La contraseña debe tener mínimo 8 caracteres", 400));
   }
   ```

### ⚠️ Ataques Comunes

| Ataque | Descripción | Protección |
|---|---|---|
| **Fuerza Bruta** | Probar muchas contraseñas | Bcrypt es lento (deliberado) |
| **Rainbow Tables** | Precomputar hashes | Bcrypt genera sal única por contraseña |
| **Diccionario** | Probar palabras comunes | Bcrypt + SALT_ROUNDS |
| **Timing Attack** | Medir tiempo de respuesta | Usar `bcrypt.compare()` siempre |

---

## Resumen

| Concepto | Explicación |
|---|---|
| **bcrypt.hash()** | Hashea una contraseña, produce output irreversible |
| **bcrypt.compare()** | Compara contraseña en texto plano con hash |
| **SALT_ROUNDS** | Número de iteraciones del algoritmo (seguridad vs velocidad) |
| **Hash + Sal** | Se almacenan juntos en BD (ej: `$2b$10$...`) |
| **Unidireccional** | No se puede obtener la contraseña original del hash |

---

## Referencias

- [Documentación oficial de Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [How Bcrypt Works](https://auth0.com/blog/hashing-passwords-one-way-road-to-security/)
