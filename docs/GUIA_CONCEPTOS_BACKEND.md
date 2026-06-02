# Guia de conceptos base: ORM, archivo .env y backend

Este documento complementa el tutorial principal y explica tres ideas fundamentales que aparecen en este proyecto.

---

## 1) Que es un ORM

ORM significa Object-Relational Mapping.

En palabras simples:
- Te permite trabajar con la base de datos usando objetos y codigo, en lugar de escribir SQL manual para todo.
- Hace un mapeo entre tablas/columnas y modelos/campos de tu aplicacion.

En este proyecto, el ORM es Prisma.

Ejemplo conceptual:
- Tabla SQL: Product
- Modelo Prisma: Product
- Consulta SQL manual: SELECT * FROM Product
- Consulta con ORM: prisma.product.findMany()

### Ventajas de usar ORM

- Productividad: escribes menos SQL repetitivo.
- Legibilidad: el codigo suele ser mas facil de mantener.
- Seguridad: reduce errores comunes de consultas armadas a mano.
- Evolucion del schema: con migraciones, los cambios quedan versionados.

### Limite importante

Un ORM no elimina SQL para siempre. En casos avanzados de rendimiento o consultas muy especificas, a veces conviene SQL directo.

---

## 2) Que es un archivo .env

Un archivo .env guarda variables de entorno: valores de configuracion que no quieres hardcodear en el codigo fuente.

En este proyecto, la variable mas importante es DATABASE_URL.
En Prisma 7, `DATABASE_URL` la lee el CLI desde `prisma.config.ts`.
Si usas adapter en runtime, tambien puedes tener variables separadas para host, usuario, password y nombre de la DB.

Ejemplos:

```env
DATABASE_URL="file:./dev.db"
```

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/mi_base"
```

```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=mi_base
```

### Para que sirve tecnicamente

- Separar codigo y configuracion.
- Cambiar entorno sin tocar archivos JS (local, test, produccion).
- Evitar subir secretos a repositorio (si .env esta en .gitignore).

### Buenas practicas

- No commitear credenciales reales.
- Tener un archivo de ejemplo como .env.example.
- Validar al inicio de la app que las variables necesarias existan.

---

## 3) Que es el backend en este caso

Backend es la parte del sistema que corre en el servidor y se encarga de:
- Recibir requests HTTP.
- Aplicar logica de negocio.
- Leer y escribir datos en base de datos.
- Devolver respuestas JSON al cliente (frontend, app movil, Postman, etc.).

En este proyecto, el backend esta formado por:
- Express para crear API REST.
- Prisma para acceder a la base de datos.
- Rutas para productos y categorias.

Flujo real simplificado:
1. El cliente llama a una ruta, por ejemplo GET /api/products.
2. Express resuelve la ruta correspondiente.
3. El handler usa Prisma para consultar la DB.
4. El servidor responde JSON con los datos.

### Diferencia rapida entre frontend y backend

- Frontend: interfaz que ve el usuario (botones, vistas, formularios).
- Backend: servicio que procesa peticiones, valida reglas y persiste datos.

---

## 4) Que es un Middleware

Un middleware es una funcion que se ejecuta entre la solicitud (request) del cliente y la respuesta (response) del servidor.

Conceptualmente, es como un "filtro" o "interceptor" en la cadena de peticiones.

### Estructura basica de un middleware

```js
// Middleware simple que registra cada request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next(); // Pasa al siguiente middleware/ruta
});
```

### Componentes clave

- `req`: objeto que contiene datos de la peticion (body, parametros, headers).
- `res`: objeto para enviar respuestas al cliente.
- `next`: funcion que llama al siguiente middleware en la cadena.

### Tipos de middlewares

- **Globales**: se ejecutan para TODAS las requests (ej: express.json()).
- **Locales**: se ejecutan solo para ciertas rutas.
- **De error**: tienen 4 parametros (err, req, res, next) y capturan excepciones.

### Ejemplo en este proyecto

```js
app.use(express.json()); // Middleware global que parsea JSON
app.use("/api", productRoutes); // Middleware que monta rutas
```

El flujo es: request → express.json() → rutas montadas → handler → response.

---

## 5) Que es Express

Express es un framework minimalista de Node.js para crear servidores web y APIs REST.

### Que hace Express

- Crea un servidor HTTP que escucha en un puerto.
- Define rutas y asocia handlers (funciones) a cada ruta.
- Parsea requests entrantes (JSON, query params, etc.).
- Envia respuestas estructuradas (JSON, HTML, archivos).
- Maneja middlewares en una cadena de ejecucion.

### Ejemplo basico

```js
const express = require('express');
const app = express();

app.get('/saludo', (req, res) => {
  res.json({ mensaje: 'Hola' });
});

app.listen(3000);
```

Cuando el cliente accede a GET /saludo, Express resuelve esa ruta y ejecuta la funcion handler.

### Por que Express

- Facil de aprender y flexible.
- La base para casi cualquier backend Node.js.
- Amplio ecosistema de middleware y extensiones.
- Ideal para APIs REST y aplicaciones web.

### En este proyecto

Express maneja:
- Las rutas GET, POST, PATCH, DELETE de productos y categorias.
- El parseado de JSON en req.body.
- La propagacion de errores entre middlewares.

---

## 6) Que es Prisma

Prisma es un ORM (Object-Relational Mapping) moderno para Node.js y TypeScript.

### Que hace Prisma

- Define modelos de datos en un archivo schema.prisma.
- Genera automaticamente cliente tipado (PrismaClient) que accede a la DB.
- Maneja migraciones: versionado de cambios en la estructura de DB.
- Soporta multiples motores: SQLite, MySQL, PostgreSQL, etc.
- En Prisma 7, tambien existe la Config API con `prisma.config.ts`.

### Flujo de uso

1. Escribes el schema en prisma/schema.prisma.
2. Ejecutas `npx prisma migrate dev --name nombre` para crear migraciones.
3. Importas PrismaClient en tu codigo.
4. Usas metodos tipados: prisma.product.findMany(), create(), update(), etc.

### Ventajas sobre SQL manual

- Tipo safety: el IDE sabe que campos existen en cada modelo.
- Menos propenso a errores SQL.
- Cambios de DB se documentan con migraciones.
- Cambiar de SQLite a MySQL es solo cambiar el provider en schema.

### En este proyecto

Prisma gestiona:
- Modelos Product y Category.
- Relacion entre ambos (Product pertenece a Category).
- Operaciones CRUD desde las rutas.
- Base de datos MySQL.
- El CLI usa `DATABASE_URL` y el cliente runtime puede usar un adapter.

---

## 7) Que es Nodemon

Nodemon es una herramienta que reinicia automaticamente tu servidor Node.js cuando detecta cambios en archivos.

### Como funciona

- Observa archivos del proyecto (por defecto *.js, *.json).
- Cuando un archivo cambia, detiene el proceso anterior y lo reinicia.
- Evita que tengas que parar y arrancar manualmente el servidor.

### Uso

```json
{
  "scripts": {
    "dev": "nodemon src/index.js"
  }
}
```

Ejecutas `npm run dev` y Nodemon se queda escuchando cambios.

### Ventajas

- Mejora la experiencia de desarrollo.
- Ahorra tiempo: no esperas a reiniciar manualmente.
- Util para testing rapido de cambios.

### En este proyecto

En package.json tienes:
```json
"scripts": {
  "dev": "nodemon src/index.js"
}
```

Cuando editas archivos en src/, Nodemon los detecta y reinicia el servidor automticamente.

---

## 8) Como se conectan los conceptos

- **Express** crea el servidor y define rutas.
- **Middlewares** son funciones que Express ejecuta en cadena antes de los handlers.
- **Prisma** es el ORM que los handlers usan para acceder a datos.
- **.env** proporciona DATABASE_URL para que Prisma conecte a la DB.
- **Nodemon** reinicia el servidor automaticamente cuando cambias codigo.

Flujo completo:
1. Levanta servidor con `npm run dev` (Nodemon lo monitora).
2. Cliente envía GET /api/products.
3. Express ejecuta middleware express.json() (parsea si necesario).
4. Express resuelve la ruta en productRoutes.
5. Handler usa Prisma para consultar DB.
6. Prisma lee DATABASE_URL de .env y conecta.
7. Respuesta JSON se envia al cliente.
8. Si editas un archivo, Nodemon reinicia automticamente el servidor.

---

## 9) Resumen corto

- **Middleware**: funcion que se ejecuta entre request y response, puede hacer procesamiento o pasar al siguiente.
- **Express**: framework para crear servidores HTTP y APIs REST.
- **Prisma**: ORM que mapea modelos a tablas y genera cliente tipado para queries.
- **Nodemon**: herramienta que reinicia el servidor cuando detecta cambios.
- **ORM**: capa que traduce objetos/codigo a operaciones de base de datos.
- **.env**: archivo de configuracion por entorno (incluye secretos/URLs).
- **Backend**: servidor que implementa logica, acceso a datos y API.
