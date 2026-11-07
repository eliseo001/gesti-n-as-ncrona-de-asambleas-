# 🏛️ ConsorcioSync — Sistema de Gestión Asíncrona de Asambleas y Toma de Decisiones en Consorcios

**Trabajo Final de Grado (TFG) — Ingeniería en Software (Universidad Siglo 21)**  
**Autor:** Eliseo Masuelli (Legajo: SOF01255)  
**Marco Normativo:** Código Civil y Comercial de la Nación Argentina (Ley N° 26.994 — Arts. 2056, 2057, 2059, 2060 y 2062) y Ley de Firma Digital N° 25.506.

---

## 📋 Descripción Arquitectónica

**ConsorcioSync** es una plataforma web *Full-Stack* diseñada para la gobernanza electrónica de consorcios de propiedad horizontal mediante deliberación y sufragio asíncrono ponderado.

* **Frontend (`./frontend`):** Aplicación reactiva desarrollada en **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4** y cliente **STOMP sobre WebSockets** (`@stomp/stompjs`) para monitoreo de quórum y escrutinio en tiempo real, con control de acceso basado en roles (**RBAC**) y motor de ponderación dinámica por superficie ($\text{m}^2 \rightarrow \%$).
* **Backend (`./backend`):** API RESTful y broker WebSocket construido sobre **Java 21** y **Spring Boot 3.5**, protegido con **Spring Security 6 (Stateless JWT — HMAC-SHA512)**, persistencia transaccional con **Spring Data JPA / Hibernate**, bloqueo pesimista (`PESSIMISTIC_WRITE`) y encadenamiento criptográfico inmutable de votos mediante **SHA-256 (*Hash Chaining*)**.
* **Base de Datos:** Motor relacional **PostgreSQL** con soporte para precisión decimal exacta (`NUMERIC(10,6)` / `BigDecimal`).

---

## 1. Prerrequisitos de Software

Antes de iniciar el despliegue local, verifique que el equipo cuente con las siguientes herramientas instaladas y expuestas en la variable de entorno `PATH` del sistema operativo:

| Herramienta | Versión Mínima Requerida | Comando de Verificación | Propósito |
| :--- | :--- | :--- | :--- |
| **Java Development Kit (JDK)** | **JDK 21 LTS** (obligatorio por `pom.xml`) | `java -version` | Compilación y ejecución del servidor Spring Boot y procesador de anotaciones Lombok. |
| **Apache Maven** | **v3.9.0+** | `mvn -version` | Gestión de dependencias y empaquetado del backend Java. |
| **Node.js & npm** | **Node.js v18.18+ / v20+ LTS** (npm v9+) | `node -v && npm -v` | Entorno de ejecución y gestor de paquetes para Next.js. |
| **PostgreSQL** | **v14.0+** (recomendado v15 / v16 / v17) | `psql --version` | Motor de base de datos relacional transaccional. |
| **Git** | **v2.30+** | `git --version` | Control de versiones y clonación del repositorio. |

---

## 2. Configuración de la Base de Datos (PostgreSQL)

El sistema requiere una base de datos vacía denominada **`consorcio_db`** corriendo sobre el puerto estándar `5432`.

### Paso 2.1: Crear la Base de Datos Vacía

Puede crearla mediante consola interactiva (`psql`) o a través de la interfaz gráfica **pgAdmin 4**:

```bash
# 1. Ingresar a la consola de PostgreSQL con el superusuario postgres
psql -U postgres -h localhost -p 5432
```

Ejecute la siguiente sentencia SQL dentro del prompt de PostgreSQL:

```sql
CREATE DATABASE consorcio_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;
```

Para salir de la consola `psql`, escriba `\q` y presione `Enter`.

> [!IMPORTANT]
> **Generación Automática del Esquema (Hibernate DDL-Auto):**  
> **No es necesario ni debe ejecutar scripts DDL manuales para crear tablas.** Al iniciar el Backend por primera vez, **Hibernate ORM** detectará la propiedad `spring.jpa.hibernate.ddl-auto: update` y generará automáticamente todas las tablas, secuencias, restricciones de integridad referencial (`FOREIGN KEY`), índices únicos y columnas de precisión decimal (`consorcios`, `usuarios`, `unidades_funcionales`, `asambleas`, `temas`, `votos`, `mensajes_foro`).

---

## 3. Variables de Entorno (Configuración Local)

### 3.1. Configuración del Backend (`backend/src/main/resources/application.yml`)

Verifique o edite el archivo `backend/src/main/resources/application.yml` con las credenciales locales de su instancia de PostgreSQL y la clave criptográfica para la firma de tokens JWT:

```yaml
server:
  port: 8080

spring:
  application:
    name: consorcio-backend

  datasource:
    url: jdbc:postgresql://localhost:5432/consorcio_db
    username: postgres
    password: Eliseo # Reemplazar por la contraseña local de su usuario 'postgres'
    driver-class-name: org.postgresql.Driver

  jpa:
    defer-datasource-initialization: true
    hibernate:
      ddl-auto: update
    show-sql: true
    open-in-view: false
    properties:
      hibernate:
        format_sql: true

  sql:
    init:
      # Cambiar a 'always' únicamente en el primer arranque si desea inyectar data.sql automáticamente
      mode: never

jwt:
  # Clave HMAC-SHA512 de 512 bits codificada en Base64
  secret: ${JWT_SECRET:EBGuzLcgvsyQbXrgMv1g0AmlOdISloczzdrKngrEaMXyIiYGTzmINBUddTK6qh5nDEwQva9axZWEOatwKQQugQ==}
  # Tiempo de expiración del token JWT en milisegundos (86400000 ms = 24 horas)
  expiration-ms: 86400000
```

*(Alternativa equivalente si prefiere utilizar `application.properties`):*

```properties
server.port=8080
spring.application.name=consorcio-backend
spring.datasource.url=jdbc:postgresql://localhost:5432/consorcio_db
spring.datasource.username=postgres
spring.datasource.password=Eliseo
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.defer-datasource-initialization=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.format_sql=true
spring.sql.init.mode=never
jwt.secret=EBGuzLcgvsyQbXrgMv1g0AmlOdISloczzdrKngrEaMXyIiYGTzmINBUddTK6qh5nDEwQva9axZWEOatwKQQugQ==
jwt.expiration-ms=86400000
```

### 3.2. Configuración del Frontend (`frontend/.env.local`)

En la raíz del directorio `frontend/`, cree un archivo llamado `.env.local` con la siguiente plantilla:

```properties
# URL base de la API REST del Backend Spring Boot
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Endpoint de conexión para el broker WebSocket STOMP en tiempo real
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws-consorcio
```

---

## 4. Levantando el Backend (Spring Boot)

Abra una terminal, sitúese en la carpeta `backend/` y ejecute el ciclo de limpieza, compilación e inicio del servidor:

```bash
# 1. Navegar al directorio del servidor Java
cd backend

# 2. Limpiar artefactos previos, descargar dependencias Maven y compilar el proyecto (omitiendo tests si desea rapidez)
mvn clean install -DskipTests

# 3. Iniciar la aplicación Spring Boot
mvn spring-boot:run
```

* **Puerto de escucha:** El servidor quedará activo en **`http://localhost:8080`**.
* **Confirmación de arranque exitoso:** Verá en consola la traza `Tomcat started on port 8080 (http)` seguida de `Started ConsorcioApplication in X.XXX seconds`.

---

## 5. Levantando el Frontend (Next.js)

Abra una **segunda terminal** independiente, sitúese en el directorio `frontend/` e instale las dependencias de Node.js antes de levantar el servidor de desarrollo:

```bash
# 1. Navegar al directorio de la aplicación cliente Next.js
cd frontend

# 2. Instalar el árbol de dependencias desde package-lock.json
npm install

# 3. Iniciar el servidor de desarrollo de Next.js
npm run dev
```

* **URL de acceso en el navegador:** Abra **`http://localhost:3000`**.

---

## 6. Credenciales de Prueba (Datos Semilla / Seed Data)

El sistema cuenta con datos semilla precargados tanto para el entorno interactivo del Frontend (`AuthContext`) como para el script de inicialización de base de datos (`backend/src/main/resources/data.sql`).

En la pantalla de inicio de sesión (`http://localhost:3000`) dispone además de **botones de autocompletado en un clic** para evaluar inmediatamente cada rol sin necesidad de tipear:

| Rol en el Sistema | Correo Electrónico (`email`) | Contraseña (`password`) | Unidades / Alcance de Permisos |
| :--- | :--- | :--- | :--- |
| **🔑 Administrador Matriculado** | `admin@consorcio.com` | `password123` | **Administración Central (Mat. RPA #8492):** Auditoría KYC, visado de Cartas Poder, switch de morosidad, Padrón Maestro ($\text{m}^2$), apertura/cuarto intermedio/cierre de asamblea, monitor de urna sin derecho a voto y protocolización de actas. |
| **🏠 Propietario Multi-Unidad (Verificado)** | `propietario4b@consorcio.com` | `password123` | **Ana Martínez (`UF 5A + UF C04` — $145\text{ m}^2$ / $21.71\%$):** Derecho pleno a voz y voto ponderado, emisión de sufragio con recibo SHA-256, rectificación de voto, firma digital del Acta N° 014 e impugnación legal (Art. 2060 CCyCN). |
| **🏠 Propietario Presidente Electo** | `juan@unidad1a.com` *(o `juan@margaritas.com` en BD)* | `password123` | **Juan Pérez (`UF 1A + UF C01` — $135\text{ m}^2$ / $20.21\%$):** Propietario verificado al día y autoridad presidente de la Asamblea. |
| **⏳ Propietario con KYC Pendiente** | `martin@unidad4b.com` | `password123` | **Martín Echeverría (`UF 4B + UF C12`):** Permite verificar el bloqueo preventivo de la urna criptográfica hasta que el Administrador vise su escritura en la Pestaña 1 del Panel de Control. |

> [!TIP]
> **Contraseña para Rectificación de Voto en Urna:**  
> Cuando un Propietario ya emitió su sufragio y presiona **"🔄 Rectificar Voto"**, el modal de seguridad solicitará revalidar su identidad. Utilice **`password123`** o **`tesis2026`**.

---

## 7. Solución de Problemas Frecuentes (Troubleshooting)

### Problema 1: El puerto `8080` (Backend) o `3000` (Frontend) ya está en uso (`Address already in use`)

**Causa:** Existe una instancia previa de Java o Node.js ejecutándose en segundo plano que retiene el socket TCP.

**Solución en Windows (PowerShell / CMD):**
```powershell
# Identificar el PID del proceso que ocupa el puerto 8080 (o 3000)
netstat -ano | findstr :8080

# Terminar el proceso forzadamente reemplazando <PID> por el número obtenido en la última columna
taskkill /PID <PID> /F
```

**Solución en Linux / macOS:**
```bash
# Matar el proceso activo en el puerto 8080 o 3000
npx kill-port 8080 3000
```

---

### Problema 2: Error de conexión a PostgreSQL (`Connection to localhost:5432 refused` o `FATAL: password authentication failed`)

**Causa 1 — Servicio detenido:** El demonio de PostgreSQL no se encuentra iniciado.
* **Windows:** Presione `Win + R`, escriba `services.msc`, busque el servicio **`postgresql-x64-16`** (o su versión instalada) y haga clic en **Iniciar**.
* **Linux:** Ejecute `sudo systemctl start postgresql`.

**Causa 2 — Credenciales o Base de Datos inexistente:**
* Verifique que la contraseña configurada en `backend/src/main/resources/application.yml` (`spring.datasource.password`) coincida exactamente con la contraseña que asignó al usuario `postgres` durante la instalación del motor.
* Verifique haber ejecutado `CREATE DATABASE consorcio_db;` (Sección 2).

---

### Problema 3: Error de Política CORS (`Access to fetch at 'http://localhost:8080/...' from origin 'http://localhost:3001' has been blocked by CORS policy`)

**Causa:** Si el puerto `3000` estaba ocupado al ejecutar `npm run dev`, Next.js levantará automáticamente en el puerto `3001` (o superior). Por seguridad, la clase [`SecurityConfig.java`](backend/src/main/java/com/consorcio/security/SecurityConfig.java) del Backend autoriza exclusivamente los orígenes `http://localhost:3000` y `http://127.0.0.1:3000`.

**Solución A (Recomendada):** Libere el puerto `3000` y reinicie el frontend con `npm run dev -- -p 3000`.

**Solución B (Agregar el nuevo puerto en el Backend):**  
Edite el método `corsConfigurationSource()` en `backend/src/main/java/com/consorcio/security/SecurityConfig.java` (línea 81) agregando el puerto adicional o un comodín local:

```java
configuration.setAllowedOriginPatterns(List.of(
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000"
));
```
Luego reinicie el servidor Spring Boot con `mvn spring-boot:run`.

