# Cuestionario: Backend, Seguridad y Autenticación

Preguntas útiles para consolidar los conocimientos sobre autenticación, autorización y desarrollo backend. Usa tu proyecto como base para responder.

---

## Banco de Preguntas

### 1. ¿Qué es Express?
Express es un framework minimalista de Node.js para crear aplicaciones web y APIs REST. Permite definir rutas, middlewares y manejar peticiones HTTP.

**Investiga:** ¿Qué otras alternativas a Express existen en Node.js? ¿Cuáles son sus ventajas?

---

### 2. ¿Qué es un ORM (Object-Relational Mapping)?
Un ORM es una herramienta que simplifica la interacción con bases de datos. Permite usar objetos del código en lugar de escribir SQL directamente.

**Investiga:** ¿Cuál es la diferencia entre Prisma, Sequelize y TypeORM?

---

### 3. ¿Qué diferencia hay entre autenticación y autorización?

- **Autenticación:** Verificar la identidad (¿eres quien dices ser?)
- **Autorización:** Verificar permisos (¿qué puedes hacer?)

**Investiga:** Busca ejemplos de sistemas que usen autenticación pero no autorización. ¿Es seguro?

---

### 4. ¿Qué es una contraseña hasheada?
Una contraseña hasheada es el resultado de aplicar un algoritmo criptográfico que la convierte en una cadena irreversible. No se puede obtener la contraseña original del hash.

**Investiga:** ¿Cuáles son los algoritmos más seguros para hashear contraseñas actualmente?

---

### 5. ¿Qué es JWT (JSON Web Token)?
JWT es un estándar para crear tokens autenticados que contienen información sobre el usuario. El servidor lo genera en el login y el cliente lo envía en cada petición.

Estructura: `header.payload.signature`

**Investiga:** ¿Cuál es la diferencia entre JWT y sesiones tradicionales? ¿Cuándo conviene usar cada una?

---

### 6. ¿Qué es RBAC (Role-Based Access Control)?
RBAC es un sistema donde los permisos se asignan por roles. Todos los usuarios con el mismo rol tienen los mismos permisos.

**Investiga:** ¿Existen alternativas a RBAC? ¿Cuándo sería mejor usarlas?

---

### 7. ¿Cuál es la diferencia entre status code 401 y 403?
- **401 Unauthorized:** No autenticado (sin token válido)
- **403 Forbidden:** Autenticado pero sin permisos para esa acción

**Investiga:** ¿En qué otras situaciones se devuelve 401? ¿Y 403?

---

### 8. ¿Cuál es la diferencia entre status code 200 y 201?
- **200 OK:** Petición exitosa, se devuelven datos existentes
- **201 Created:** Petición exitosa, se creó un nuevo recurso

**Investiga:** ¿Cuál es el status code para una actualización exitosa? ¿Y para un error del cliente?

---

### 9. ¿Qué es un middleware?
Un middleware es una función que procesa la petición antes de llegar al controlador. Puede validar datos, verificar autenticación, manipular la petición, etc.

**Investiga:** ¿Cuál es el orden correcto para ejecutar middlewares? ¿Qué sucede si el orden es incorrecto?

---

### 10. ¿Cuáles son los pasos para procesar una petición protegida?
1. Cliente envía petición con token en header
2. Middleware verifica autenticación (token válido)
3. Middleware verifica autorización (rol permitido)
4. Controlador ejecuta la lógica
5. Respuesta al cliente

**Investiga:** ¿En qué paso se devuelve 401 y en cuál 403?

---

### 11. ¿Cómo se genera un token JWT?
Se usa una librería (como `jsonwebtoken`) que crea un token firmado con:
- Información del usuario (id, email, rol)
- Una clave secreta (JWT_SECRET)

**Investiga:** ¿Qué sucede si alguien obtiene tu JWT_SECRET? ¿Cómo se debería rotar?

---

### 12. ¿Cuál es el propósito de usar "salt" en el hasheo de contraseñas?
La sal es una cadena aleatoria que se combina con la contraseña antes de hashearla. Evita que dos usuarios con la misma contraseña tengan el mismo hash.

**Investiga:** ¿Qué son las rainbow tables y cómo el salt previene ataques con ellas?

---

### 13. ¿Cómo se verifica una contraseña durante el login?
Se usa una función de comparación que:
- Extrae la sal del hash almacenado
- La aplica a la contraseña ingresada
- Compara el resultado con el hash original

**Investiga:** ¿Por qué no se puede simplemente revertir el hash para obtener la contraseña?

---

### 14. ¿Por qué no se almacena la contraseña en texto plano?
Si la base de datos es comprometida, los atacantes tendrían acceso a todas las contraseñas. Con hasheo, solo tienen los hashes, que son irreversibles.

**Investiga:** ¿Qué otros datos sensibles (además de contraseñas) deberían ser protegidos?

---

### 15. ¿Qué información debería contener un token JWT?
Información no sensible del usuario como: id, email, rol. NO debe contener: contraseña, tarjeta de crédito, datos personales sensibles.

**Investiga:** ¿Por qué no se debería incluir información sensible en el JWT?

---

### 16. ¿Dónde se almacena el JWT en el frontend?
Generalmente en `localStorage` o en cookies. Debe estar accesible en cada petición para incluirlo en el header.

**Investiga:** ¿Cuáles son los riesgos de localStorage vs cookies? ¿Cuál es más seguro?

---

### 17. ¿Cómo se extrae el token del header de la petición?
El cliente envía: `Authorization: Bearer <token>`
El servidor extrae: `token = header.slice(7)` (elimina "Bearer ")

**Investiga:** ¿Existen otros formatos de autorización además de Bearer?

---

### 18. ¿Qué sucede si un token JWT es modificado por el cliente?
La verificación falla porque la firma no coincide. El servidor detecta la manipulación y rechaza la petición con 401.

**Investiga:** ¿Puede un cliente cambiar solo el payload del JWT sin que se note?

---

### 19. ¿Cómo funciona la validación de datos en una petición?
Un middleware valida que los datos cumplan ciertas reglas (email válido, contraseña mínimo 8 caracteres, etc.). Si hay errores, devuelve 400 Bad Request.

**Investiga:** ¿Qué es la validación en cliente vs en servidor? ¿Cuál es más importante?

---

### 20. ¿Por qué es importante el orden de los middlewares en una ruta?
Cada middleware ejecuta en orden. Si pones validación después de autenticación, usuarios no autenticados no podrán ver errores de validación.

**Investiga:** ¿Cuál debería ser el orden ideal: validación, autenticación, autorización?

---

### 21. ¿Qué es una clase personalizada de error (como AppError)?
Una clase que extiende Error y permite crear errores consistentes con: mensaje descriptivo y status code HTTP apropiado.

**Investiga:** ¿Cómo se manejan los errores en Express? ¿Qué es un middleware de manejo de errores?

---

### 22. ¿Qué son las migrations en una base de datos?
Son cambios versionados de la estructura de la BD. Permiten: colaborar sin conflictos, revertir cambios, tener historial de evolución.

**Investiga:** ¿Qué sucede si dos desarrolladores crean migrations al mismo tiempo? ¿Cómo se resuelven los conflictos?

---

### 23. ¿Cómo se relacionan las entidades en una base de datos?
- **1:1** - Un registro solo se relaciona con uno del otro lado
- **1:N** - Un registro se relaciona con muchos del otro lado
- **N:N** - Muchos se relacionan con muchos

**Investiga:** ¿Cómo se implementan las relaciones N:N en las bases de datos?

---

### 24. ¿Por qué se usan variables de entorno?
Permiten: configuración diferente en desarrollo/producción, guardar datos sensibles (contraseñas, claves) sin exponerlos en el código.

**Investiga:** ¿Cuáles son los riesgos de exponer variables de entorno? ¿Cómo se debería manejar en un repositorio Git?

---

### 25. ¿Qué debería incluir un archivo .env?
Conexión a BD (URL con usuario/contraseña), claves secretas (JWT_SECRET, API keys), configuración sensible. NUNCA debe incluirse en Git.

**Investiga:** ¿Cómo se manejan variables de entorno en producción si no se pueden subir a Git?

---

### 26. ¿Qué sucede si un usuario con rol USER intenta hacer una acción de ADMIN?
El middleware de autorización verifica que su rol esté permitido. Como no está, devuelve 403 Forbidden.

**Investiga:** ¿Qué mecanismos se podrían implementar para prevenir intentos de acceso no autorizado?

---

### 27. ¿Cuándo se usa PATCH vs PUT?
- **PATCH:** Actualización parcial (solo campos enviados)
- **PUT:** Reemplazo completo (todos los campos)

**Investiga:** ¿Qué diferencias en la respuesta del servidor hay entre PATCH y PUT?

---

### 28. ¿Cuál es el flujo completo de una petición POST para crear un recurso?
1. Validación de datos (estructura, tipos, reglas de negocio)
2. Autenticación (¿tiene token válido?)
3. Autorización (¿su rol puede hacer esto?)
4. Ejecución (crear en BD)
5. Respuesta (201 Created)

**Investiga:** ¿En qué paso se debería validar duplicados? ¿Antes o después de autenticación?

---

### 29. ¿Cómo se podría mejorar la seguridad de un proyecto backend?
Algunas opciones: rate limiting (limitar intentos), CORS (qué dominios acceden), validación estricta, refresh tokens, HTTPS en producción, logging.

**Investiga:** ¿Cuál de estas mejoras sería más importante implementar primero? ¿Por qué?

---

### 30. ¿Cómo se implementaría paginación en una lista de recursos?
Agregar parámetros query: `?page=2&limit=20`
En BD: usar skip (offset) y take (limit)
Respuesta: incluir total, página actual, páginas totales

**Investiga:** ¿Por qué es importante implementar paginación en APIs? ¿Qué ocurre sin ella con mucho volumen de datos?

---

## Ejemplos de CRUD con Fetch API

Ejemplos simples de cómo hacer peticiones desde el frontend usando Fetch API. Solo lo esencial sin complejidades.

**Configuración base:**
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

---

### GET - Obtener todos los recursos

```javascript
async function getAll() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        console.log('Datos:', data);
        return data;

    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

---

### GET - Obtener un recurso por ID

```javascript
async function getOne(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

---

### POST - Crear un nuevo recurso

```javascript
async function create(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Uso:
// const newUser = { name: "Juan", email: "juan@example.com" };
// create(newUser);
```

---

### PATCH - Actualizar un recurso (actualización parcial)

```javascript
async function patch(id, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Uso:
// patch(1, { email: "newemail@example.com" });
```

---

### PUT - Reemplazar un recurso (actualización completa)

```javascript
async function put(id, completeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(completeData)
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Uso:
// put(1, { name: "Juan", email: "juan@example.com", age: 30 });
```

---

### DELETE - Eliminar un recurso

```javascript
async function deleteItem(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Uso:
// deleteItem(1);
```

---

## Respuestas Esperadas - Referencia Rápida

| # | Tema | Respuesta Corta |
|---|---|---|
| 1 | Express | Framework Node.js para APIs REST con rutas y middlewares |
| 2 | ORM | Herramienta que mapea tablas de BD a objetos del código |
| 3 | Autenticación vs Autorización | Autenticación verifica identidad; autorización verifica permisos |
| 4 | Hash de contraseña | Función criptográfica irreversible para seguridad |
| 5 | JWT | Token firmado que contiene info del usuario (id, email, rol) |
| 6 | RBAC | Permisos asignados por roles, no por usuario individual |
| 7 | 401 vs 403 | 401 = sin token; 403 = token válido pero permisos insuficientes |
| 8 | 200 vs 201 | 200 = exitoso; 201 = recurso creado |
| 9 | Middleware | Función que procesa la petición antes del controlador |
| 10 | Flujo de petición protegida | Validar → Autenticar → Autorizar → Ejecutar |
| 11 | Generación JWT | Librería `jsonwebtoken` firma con JWT_SECRET |
| 12 | Propósito del salt | Evita que contraseñas iguales generen hashes iguales |
| 13 | Verificar contraseña | Función `compare()` que compara hash almacenado con ingresado |
| 14 | Riesgo texto plano | Si BD se compromete, atacantes obtienen contraseñas directas |
| 15 | Info en JWT | Id, email, rol (NUNCA: contraseña, datos sensibles) |
| 16 | Almacenamiento JWT | localStorage en el navegador |
| 17 | Extracción de token | Header `Authorization: Bearer <token>` → slice(7) |
| 18 | Modificación JWT | Falla la verificación de firma, servidor rechaza con 401 |
| 19 | Validación de datos | Middleware que verifica reglas (email válido, longitud, etc.) |
| 20 | Importancia del orden middlewares | Orden de ejecución afecta flujo |
| 21 | Clase AppError | Errores personalizados con mensaje y status HTTP |
| 22 | Migrations BD | Cambios versionados, colaboración sin conflictos |
| 23 | Relaciones BD | 1:1, 1:N, N:N según conexión entre tablas |
| 24 | Variables de entorno | Config sensible sin exponerla en código |
| 25 | Archivo .env | DATABASE_URL y JWT_SECRET, nunca incluir en Git |
| 26 | Usuario USER intenta crear | Middleware authorizeRoles bloquea con 403 |
| 27 | PATCH vs PUT | PATCH = parcial; PUT = completo |
| 28 | Flujo completo POST | Validar → Autenticar → Autorizar → Crear → 201 |
| 29 | Mejorar seguridad | Rate limiting, CORS, validación, refresh tokens, logging |
| 30 | Paginación | Parámetros `page` y `limit` con skip/take |

---

## Recursos Adicionales

- [Express.js Documentation](https://expressjs.com/)
- [Prisma ORM Documentation](https://www.prisma.io/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [Bcrypt NPM Package](https://www.npmjs.com/package/bcrypt)
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [HTTP Status Codes](https://httpwg.org/specs/rfc9110.html#status.codes)
- [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
