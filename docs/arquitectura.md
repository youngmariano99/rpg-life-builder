# Life RPG Planner - Arquitectura del Sistema y Guía de Aprendizaje

Este documento no solo describe la arquitectura técnica del sistema, sino que también sirve como guía didáctica para entender las decisiones de diseño y la evolución del proyecto desde un prototipo simulado hasta una aplicación full-stack real.

## 1. Visión General: De Prototipo a Realidad

El proyecto comenzó como un prototipo Frontend (React) que usaba datos falsos (**Mocks**) para simular un backend. El objetivo final es un sistema distribuido robusto con persistencia de datos real.

### ¿Qué hemos logrado?
Hemos migrado exitosamente el "núcleo" del RPG (Roles, Misiones, Habilidades, Objetivos) de una simulación en memoria a una base de datos PostgreSQL gestionada por una API .NET 9.

---

## 2. Diferencias Clave: Mock vs. API Real

Para entender lo que se hizo, comparemos los dos enfoques:

### A. Enfoque Anterior (Mocking)
En este enfoque, el frontend "fingía" hablar con un servidor.

*   **Datos**: Arrays estáticos en memoria (`mockData.ts`). Si refrescabas la página, los cambios se perdían o se reseteaban.
*   **Latencia**: Usábamos `simulateDelay(300)` para imitar artificialmente el tiempo que tarda un servidor en responder.
*   **Lógica**: Toda la lógica (ej: "si completo misión, subo XP") vivía en el **Frontend**. Esto es inseguro para un juego real, ya que el usuario podría modificar el código JS para darse nivel 1000.

**Ejemplo de código Mock (Antes):**
```typescript
// frontend/src/services/api/questService.ts (Antiguo)
export async function completeQuest(id) {
    await simulateDelay(); // Espera falsa
    const quest = mockQuests.find(q => q.id === id); // Buscar en array en memoria
    quest.is_completed = true; // Modificar memoria local
    return quest;
}
```

### B. Enfoque Actual (Full Stack .NET)
Ahora el frontend es un cliente "tonto" que solo muestra lo que el backend le dice.

*   **Datos**: Persistentes en PostgreSQL. Si reinicias la PC, tus datos siguen ahí.
*   **Comunicación**: HTTP real usando `fetch`.
*   **Lógica**: La lógica crítica (XP, niveles, validaciones) vive en el **Backend (.NET)**. El frontend solo dice "El usuario intentó completar la misión X", y el backend decide si es válido y calcula las consecuencias.

**Ejemplo de código Real (Nuevo):**
```typescript
// frontend/src/services/api/questService.ts (Nuevo)
export async function completeQuest(id) {
    // Llamada HTTP real al servidor
    return api.post(`/api/quests/${id}/complete`, {});
}
```

---

## 3. Arquitectura del Backend (.NET 9)

Hemos construido una **API RESTful**. Imagina el backend como un camarero en un restaurante:
1.  **El Menú (Endpoints)**: Define qué puedes pedir (`GET /quests`, `POST /roles`, `PUT /skills`).
2.  **La Cocina (Services/Controllers)**: Donde se prepara lo que pediste.
3.  **La Despensa (Database)**: Donde se guardan los ingredientes (datos).

### Componentes Clave

1.  **Models (`/Models`)**: Son los planos de nuestros datos. Definen cómo es un `User`, una `Quest` o una `Skill`.
    *   *Nota*: Usamos `[Column("name")]` para traducir los nombres de C# (`PascalCase`) a PostgreSQL (`snake_case`).

2.  **DbContext (`ApplicationDbContext`)**: Es el puente entre el código C# y la base de datos SQL. Hereda de Entity Framework Core.

3.  **Controllers (`/Controllers`)**: Son los encargados de recibir las peticiones del frontend.
    *   `RolesController`
    *   `QuestsController`
    *   `SkillsController`
    *   `ObjectivesController`
    *   `TimeBlocksController`

4.  **Services (`/Services`)**: Lógica de negocio pura.
    *   `XpService`: Contiene la matemática para calcular niveles. Si mañana cambiamos la fórmula de nivel, solo tocamos este archivo, no los controladores ni la BD.

### Flujo de una Petición (Ejemplo: Completar Misión)

1.  **Frontend**: Envía `POST /api/quests/123/complete`.
2.  **Controller (`QuestsController`)**: Recibe la petición.
    *   Verifica: "¿Esta misión existe?", "¿Ya está completada?".
3.  **Lógica**:
    *   Marca la misión como completada.
    *   Llama a `XpService` para sumar XP al Rol asociado.
    *   Verifica si el Rol subió de nivel.
4.  **Base de Datos**: Guarda todos los cambios en una transacción (Misión actualizada + Rol actualizado + Logs).
5.  **Respuesta**: Devuelve al frontend: `{ success: true, newXp: 500, leveledUp: false }`.

---

## 4. Integración Técnica

### Proxy Inverso (Vite)
Para facilitar el desarrollo, configuramos un **Proxy** en `vite.config.ts`.
*   El frontend corre en `localhost:8080`.
*   El backend corre en `localhost:5184`.
*   Cuando el frontend pide `/api/roles`, Vite intercepta esa llamada y la redirige "silenciosamente" a `localhost:5184/api/roles`.
*   **Beneficio**: Evitamos problemas de seguridad del navegador (CORS) durante el desarrollo y simplificamos las URLs.

### Cliente API Centralizado
Creamos `frontend/src/lib/api-client.ts`. Es una herramienta propia que envuelve `fetch` estándar.
*   Añade automáticamente la URL base.
*   Añade headers `Content-Type: application/json`.
*    (Futuro) Añadirá automáticamente el Token de seguridad JWT.

---

## 5. Próximos Pasos de Aprendizaje

Ahora que tienes una arquitectura base sólida, los siguientes desafíos técnicos para aprender serían:

1.  **Autenticación JWT**: Ahora mismo "fingimos" ser el primer usuario de la base de datos. El siguiente paso es implementar Login real para que el backend sepa *quién* está haciendo la petición.
2.  **Validaciones Avanzadas**: Usar `FluentValidation` en el backend para asegurar que los datos enviados sean correctos antes de procesarlos.
3.  **WebSockets (SignalR)**: Para notificaciones en tiempo real (ej: "¡Subiste de nivel!" sin recargar la página).

---


## 6. Actualización: Sistema de Autenticación y Seguridad (01/01/2026)

Hoy hemos transformado el aplicativo de "Monousuario Inseguro" a un sistema **Multiusuario Seguro** utilizando estándares modernos de la industria.

### A. ¿En qué consiste el sistema de Login? (JWT)

Hemos implementado **JSON Web Tokens (JWT)**. Piensa en el JWT como una pulsera de hotel "All-Inclusive".
1.  **Check-in (Login)**: Vas a recepción (Endpoint `/api/auth/login`) con tu DNI (Usuario/Contraseña).
2.  **La Pulsera (Token)**: Si tus datos son correctos, el recepcionista te da una pulsera firmada y sellada (el Token JWT).
3.  **Acceso (Authorization)**: Para entrar a la piscina o comer (Endpoint `/api/roles`), solo muestras la pulsera. No tienes que volver a dar tu DNI cada vez.

Técnicamente:
*   El Token es una cadena larga cifrada `eyJh...`.
*   Contiene **Claims** (Datos): ID del usuario, Email, Expiración.
*   El Backend lo firma con una **Secret Key** que solo él conoce. Si alguien intenta falsificar la pulsera, el Backend sabrá que la firma no coincide.

### B. Componentes Backend (.NET)

1.  **`AuthService`**:
    *   **Registro**: Recibe la contraseña en texto plano, pero **NUNCA** la guarda así. Usa `BCrypt` para convertirla en un hash irreversible (`$2a$11$...`). Si hackean la base de datos, no sabrán tu contraseña real.
    *   **Login**: Compara la contraseña que escribes con el hash guardado. Si coinciden, genera el JWT.

2.  **`[Authorize]`**: Es un "guardia de seguridad" que pusimos delante de los controladores (ej: `UsersController`). Si intentas entrar sin Token (o con uno falso), el guardia te detiene y devuelve error `401 Unauthorized`.

3.  **DbInitializer (Auto-Seeder)**:
    *   Para facilitar las pruebas, creamos un script automático que se ejecuta al iniciar el backend. Si la base de datos está vacía, crea automáticamente el usuario `heroe@liferpg.com`.

### C. Componentes Frontend (React)

1.  **`authService.ts`**:
    *   Se encarga de hablar con el backend para login/registro.
    *   Guarda el Token recibido en el `localStorage` del navegador (como guardar la pulsera en tu bolsillo).

2.  **`api-client.ts` (Interceptor Inteligente)**:
    *   Antes de enviar *cualquier* petición al servidor, revisa si tienes el Token en el bolsillo.
    *   Si lo tienes, lo pega automáticamente en la cabecera del mensaje (`Authorization: Bearer <token>`).
    *   Si el servidor responde "401 (Tu pulsera caducó)", este componente te redirige automáticamente a la página de Login.

3.  **`ProtectedRoute` (Componente Envoltorio)**:
    *   Envuelve a las rutas privadas (Dashboard).
    *   Si intentas ir directo a `/` sin haber iniciado sesión, te "rebota" a `/login`.

### D. Flujo Completo Implementado

1.  Usuario entra a la web -> `ProtectedRoute` detecta que no hay usuario -> Redirige a Login.
2.  Usuario llena formulario -> Frontend llama a Backend (`/login`).
3.  Backend valida Hash -> Genera Token -> Devuelve Token.
4.  Frontend guarda Token -> Redirige a Dashboard.
5.  Dashboard pide datos (`/api/users/me`) -> `api-client` adjunta Token.
6.  Backend valida Token -> Extrae ID de usuario -> Devuelve datos reales del usuario.

---
*Documento actualizado: 01/01/2026*

## 7. Actualización: Dashboard en Tiempo Real y Lógica de Negocio (05/01/2026)

Hoy hemos dado un paso crucial: **La pantalla principal (Dashboard) ya no miente**. Hemos reemplazado los datos estáticos de "Racha", "XP" y "Horas Enfocadas" por cálculos reales basados en el historial del usuario.

### A. Lógica de Negocio en Backend (Estado Derivado)
Una decisión de arquitectura importante que tomamos hoy fue sobre el **Estado Derivado**.

* **Problema:** ¿Deberíamos guardar un campo `CurrentStreak` (Racha actual) en la tabla de usuarios y sumarle +1 cada día?
* **Solución (.NET):** No. Decidimos **calcularlo al vuelo**.
    * La "Racha" no es un dato estático; es una *consecuencia* de tu historial.
    * En el endpoint `GET /api/users/me/stats`, usamos **LINQ** para consultar la tabla `XpLogs`.
    * Buscamos días consecutivos de actividad hacia atrás. Si hoy no has hecho nada, verificamos ayer. Si ayer hiciste algo, la racha sigue viva (pero en peligro).
    * **Ventaja:** Si un usuario borra un log o hay un error, la racha se recalcula sola correctamente. No hay "desincronización" de datos.

### B. Optimización del Frontend (React Query)
Para consumir estos datos, introdujimos una librería estándar de la industria: **TanStack Query (React Query)** via `useQuery`.

**¿Por qué no usar `useEffect` y `fetch` simple?**
1.  **Cache Automático:** Si cambias de pestaña y vuelves, React Query no necesita recargar los datos si son recientes.
2.  **Revalidación en Foco:** Configuramos `refetchOnWindowFocus: true`. Esto significa que si el usuario completa una tarea en su celular, y luego mira la pantalla de la PC, el Dashboard se actualiza solo mágicamente sin que tenga que pulsar F5.
3.  **Gestión de Estados:** Nos da variables como `isLoading` y `isError` gratis, simplificando el código de `Index.tsx`.

### C. Resumen del Flujo de Datos Actual
1.  **Frontend (`Index.tsx`)**: Carga y pide estadísticas con `useQuery`.
2.  **Backend (`UsersController`)**:
    * Calcula XP para siguiente nivel ($100 \times Nivel \times 1.5$).
    * Suma la duración de los `TimeBlocks` de tipo "focus" agendados para hoy.
    * Calcula la racha basándose en fechas únicas de `XpLogs`.
3.  **Resultado**: El usuario ve su progreso real e instantáneo.

---
*Documento actualizado: 05/01/2026*
