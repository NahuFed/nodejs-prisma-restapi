# 📦 Trabajo Práctico Integrador

## Diseño de Modelo de Datos con Prisma y MySQL

### 📌 Contexto

Se provee un proyecto base que incluye las entidades **Product** y **Category**, relacionadas entre sí.  
A partir de este repositorio inicial, se deberá **extender el modelo de datos**, agregando nuevas entidades y relaciones, utilizando **Prisma ORM** y una base de datos **MySQL**.

El objetivo del trabajo es aplicar conceptos de **modelado**, **relaciones entre entidades**, **migraciones** y **acceso a datos**, simulando un escenario real de aplicación.

***

## 🎯 Objetivo del Trabajo

Diseñar e implementar un modelo de datos relacional completo y coherente, incorporando nuevas entidades relacionadas, y validar su funcionamiento mediante migraciones y consultas utilizando Prisma.

***

## 🧱 Entidades existentes (base del TP)

El proyecto inicial cuenta con las siguientes entidades:

*   **Category**
*   **Product**

Relación existente:

*   Una categoría puede tener muchos productos.
*   Un producto pertenece a una categoría.

***

## 🆕 Entidades a agregar

Se deberán agregar **tres (3) nuevas entidades**, que deberán estar **relacionadas entre sí y con las entidades existentes**.

Las entidades a incorporar son:

### 1️⃣ User

Representa a un usuario del sistema.

Relaciones:

*   Un usuario puede tener una o varias órdenes.

***

### 2️⃣ Order

Representa una orden o compra realizada por un usuario.

Relaciones:

*   Una orden pertenece a un usuario.
*   Una orden puede contener varios productos (a través de una entidad intermedia).

***

### 3️⃣ OrderItem (o OrderDetail)

Representa el detalle de una orden.

Relaciones:

*   Un `OrderItem` pertenece a una orden.
*   Un `OrderItem` referencia a un producto.
*   Un producto puede aparecer en muchos `OrderItem`.

***

## 🔗 Relaciones esperadas (modelo lógico)

El modelo final deberá representar correctamente las siguientes relaciones:

*   Category **1 → N** Product
*   User **1 → N** Order
*   Order **1 → N** OrderItem
*   Product **1 → N** OrderItem

Esto implica la implementación de una **relación muchos a muchos** entre `Order` y `Product`, resuelta mediante la entidad `OrderItem`.

***

## 🛠️ Requisitos técnicos

El trabajo deberá cumplir con los siguientes puntos:

1.  Definir correctamente todas las entidades en `schema.prisma`.
2.  Establecer las relaciones usando claves foráneas.
3.  Utilizar **Prisma Migrate** para generar las migraciones.
4.  Conectar el proyecto a una base de datos MySQL.
5.  Generar el cliente de Prisma correctamente.
6.  Realizar al menos una prueba de acceso a datos desde código (ejemplo: crear y consultar registros).

***

## ✅ Actividades obligatorias

Se deberá demostrar, como mínimo:

*   La creación de:
    *   Al menos **un usuario**
    *   Al menos **una orden asociada a ese usuario**
    *   Al menos **dos productos asociados a una orden**
*   Una consulta que obtenga:
    *   Una orden
    *   El usuario que la realizó
    *   Los productos incluidos en la orden
    *   La categoría de cada producto

***

## 📂 Entregables

El grupo deberá entregar:

1.  Repositorio Git con:
    *   Código fuente
    *   Archivo `schema.prisma`
    *   Migraciones generadas
2.  Base de datos creada mediante migraciones (no manualmente).
3.  Un archivo README que explique:
    *   El modelo de datos
    *   Las relaciones entre entidades
    *   Pasos para ejecutar el proyecto

***

## 📝 Criterios de evaluación

| Criterio                         | Ponderación |
| -------------------------------- | ----------- |
| Correcta definición de entidades | ✅           |
| Relaciones bien modeladas        | ✅           |
| Uso adecuado de Prisma           | ✅           |
| Migraciones funcionales          | ✅           |
| Coherencia del modelo            | ✅           |
| Claridad del README              | ✅           |

***

## 🚫 Consideraciones

*   No se evaluará la interfaz gráfica.
*   No es obligatorio implementar autenticación.
*   El foco del trabajo está en **el modelo de datos y su funcionamiento**.

***
