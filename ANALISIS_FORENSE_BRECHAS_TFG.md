# Informe de Auditoría Forense de Brechas (*Gap Analysis*) — TFG ConsorcioSync

**Título del TFG:** Aplicación web para la gestión asíncrona de asambleas y toma de decisiones en consorcios  
**Autor:** Eliseo Masuelli (Legajo: SOF01255) — Ingeniería en Software, Universidad Siglo 21  
**Rol del Informe:** Auditoría Forense de Brechas (*Gap Analysis*) entre el Código Fuente Real (Frontend Next.js + Backend Spring Boot) y el Documento Word (`-TFG ULTIMA VERSION -MASUELLI -ELISEO.docx`).

---

## 1. Diagnóstico de Brechas Críticas (Código vs. Documento Word)

Tras auditar exhaustivamente el repositorio frente al manuscrito del Trabajo Final de Grado, se concluye que **el software desarrollado posee una madurez arquitectónica, criptográfica y de dominio legal significativamente superior a lo que el documento escrito refleja actualmente.**

| # | Dimensión Auditada | Estado en el Código Fuente Real | Deficiencia / Omisión en el Documento Word |
| :--- | :--- | :--- | :--- |
| **1** | **Concurrencia en el Encadenamiento SHA-256 (*Race Condition* y *Chain Fork*)** | En `VotoRepository.java` y `VotoService.java` se implementa bloqueo pesimista a nivel de motor PostgreSQL (`@Lock(LockModeType.PESSIMISTIC_WRITE)` -> `SELECT ... FOR UPDATE`) para serializar la lectura del último eslabón por Tema, además de un **Hash Génesis Dinámico** (`generarHashGenesisDinamico`) que previene ataques de repetición (*Replay Attacks*). | El documento menciona SHA-256 de forma genérica, pero omite explicar qué ocurre si dos copropietarios sufragan en el mismo milisegundo (bifurcación de la cadena) y cómo se previenen ataques de trasplante de bloques entre temas. |
| **2** | **Modelo de Dominio de Propiedad Horizontal (DDD): Superficie ($\text{m}^2$), Multi-Unidad y `BigDecimal`** | En `VotoService.java` y `UnidadFuncionalRepository.java` un propietario puede poseer múltiples unidades (Depto + Cochera + Baulera) cuyos pesos se suman con aritmética exacta de punto fijo (`BigDecimal(10,6)`). Además, en `AuthContext.js`, `TabGestionAvanzada.jsx` y `TabUnidades.jsx` el Padrón Maestro almacena la **Superficie ($\text{m}^2$)** y un **Motor de Ponderación Automática** recalcula al vuelo el porcentaje exacto sobre el $100\%$ del edificio. | En la **HU-002** y en el **Diagrama de Clases (Ilustración 3)** se afirma que el administrador carga porcentajes estáticos manualmente y se declara el atributo `coeficienteCopropiedad` y `pesoCoeficiente` como `Float` (coma flotante binaria IEEE 754, inaceptable en software financiero/electoral por errores de redondeo). |
| **3** | **Onboarding Corporativo, Validación KYC y Padrón Maestro Catastral** | En `app/onboarding/page.js` y `TabValidacionKyc.jsx` existe un flujo completo de acreditación de identidad y dominio (*Know Your Customer*): las unidades físicas preexisten en estado `VACANTE` o `VINCULADA`, el propietario reclama una o varias unidades adjuntando DNI y Escritura, y el Administrador visa el legajo para habilitar el poder de voto (soportando tanto alta inicial como ampliación de cartera). | El documento carece por completo de historias de usuario, procesos o entidades referidas al reclamo dominial de unidades vacantes y auditoría KYC previa al sufragio. |
| **4** | **Ciclo de Vida de Cartas Poder (Mandatos), Estado Contable (Mora) y Recibo Criptográfico** | El sistema implementa: **a)** Delegación de voto por Carta Poder con bloqueo preventivo si no tiene KYC, visado administrativo en `TabCartasPoder.jsx` e impacto directo en `PanelSufragio.jsx` (bloqueo al poderdante y suma de coeficiente al apoderado); **b)** Suspensión de voto por mora contable preservando el derecho a voz en el foro (`TabUnidades.jsx`); **c)** Emisión de **Recibo Criptográfico de Voto (PDF/SHA-256)**; y **d)** Gestión de **Cuarto Intermedio** (`TabContingencias.jsx`) y **Notificación a Ausentes (Art. 2060 CCyCN)** (`app/asamblea/notificacion-ausentes/page.js`). | Ninguno de estos cuatro módulos críticos para la validez legal bajo el Código Civil y Comercial figura en el Product Backlog, en el DER ni en el análisis de riesgos. |
| **5** | **Arquitectura Frontend: Design System Propio, RBAC Reactivo y Concurrencia Debate/Voto** | El Frontend está construido sobre un **Design System atómico** (`src/components/ui/`: `Card`, `CardHeader`, `Button`, `Badge`, `Input`, `ProgressBar`, `Modal`) bajo principios SOLID y DRY, protegido por `RouteGuard.jsx` y con ejecución simultánea (no secuencial) entre `ForoDebate.jsx` y `PanelSufragio.jsx`. | La sección TIC del documento describe Next.js en 3 líneas genéricas, sin mencionar el patrón de Context API, los guardias de rutas RBAC ni la arquitectura de sistema de diseño reutilizable. |

---

## 2. Propuestas de Enriquecimiento por Sección (Textos Listos para Copiar y Pegar)

### A. Sección: Marco Teórico Referencial

#### 1. Agregar en *Dominio del Problema* (a continuación de "Coeficiente de copropiedad"):

> **Motor de Ponderación Dinámica por Superficie ($\text{m}^2$) y Consolidación Multi-Unidad (Domain-Driven Design):**  
> Bajo los principios del Diseño Guiado por el Dominio (*Domain-Driven Design* - DDD), el coeficiente de copropiedad (Art. 2056 del CCyCN) no se modela como un valor porcentual estático propenso a inconsistencias humanas de carga, sino como una propiedad derivada matemáticamente a partir de la superficie física expresada en metros cuadrados ($\text{m}^2$) de cada unidad funcional o complementaria. Sea $S_i$ la superficie de la unidad $i$ y $N$ el total de unidades que integran el Padrón Maestro Catastral del edificio, el motor de ponderación calcula en tiempo de ejecución el coeficiente porcentual exacto mediante la expresión:
>
> $$\text{Coeficiente}_i (\%) = \left( \frac{S_i}{\sum_{k=1}^{N} S_k} \right) \times 100$$
>
> Asimismo, dado que en la realidad inmobiliaria un mismo titular registral puede poseer múltiples unidades independientes (por ejemplo, un departamento, una cochera y una baulera) o actuar en representación de terceros mediante **Cartas Poder** visadas por la administración (Art. 2060 y 2062 del CCyCN), el sistema consolida dinámicamente el poder de sufragio sumando los coeficientes individuales de todas las unidades vinculadas y delegadas bajo aritmética decimal de punto fijo (`BigDecimal`), garantizando que el universo electoral sume de forma invariante el $100.00\%$ del consorcio.

#### 2. Agregar en *TIC (Tecnologías de la Información y la Comunicación)*:

> **Control de Concurrencia Pesimista (`PESSIMISTIC_WRITE`) y Bloque Génesis Dinámico en Cadenas SHA-256:**  
> En un sistema de sufragio electrónico basado en encadenamiento criptográfico (*Hash Chaining*), cada nuevo voto $V_n$ incorpora en su huella SHA-256 el resumen criptográfico del voto inmediatamente anterior ($H_{n-1}$). En escenarios de alta concurrencia transaccional (como los minutos previos al cierre de la ventana temporal de la asamblea), si dos copropietarios emiten su sufragio en el mismo milisegundo bajo un nivel de aislamiento estándar *Read Committed*, ambos hilos de ejecución leerían el mismo $H_{n-1}$ antes de confirmarse la primera transacción, provocando una condición de carrera (*Race Condition*) y una bifurcación (*Fork*) de la cadena criptográfica. Para erradicar matemáticamente este vector de corrupción, el núcleo transaccional implementa un **Bloqueo Pesimista de Escritura (`LockModeType.PESSIMISTIC_WRITE`)** a través de JPA/Hibernate, el cual instruye al motor PostgreSQL a ejecutar una cláusula `SELECT ... FOR UPDATE` sobre el último eslabón del tema en votación. Esto serializa las inserciones concurrentes por punto del orden del día sin penalizar el rendimiento de otros temas. Adicionalmente, el primer eslabón de cada moción se enlaza a un **Hash Génesis Dinámico** derivado criptográficamente de los identificadores de la asamblea y del tema, neutralizando ataques de repetición (*Replay Attacks*) entre distintas convocatorias.
>
> **Arquitectura Reactiva Basada en Componentes (Design System) y Seguridad de Interfaces (RBAC):**  
> En la capa de presentación construida con Next.js (App Router) y React, se implementó una arquitectura modular sustentada en los principios SOLID y DRY (*Don't Repeat Yourself*) mediante un **Sistema de Diseño (*Design System*)** propio de componentes atómicos reutilizables (`Card`, `Button`, `Badge`, `ProgressBar`, `Modal`). El control de sesión y autorización en el cliente se articula mediante un proveedor de estado global (`AuthContext`) acoplado a un guardia de navegación (`RouteGuard`) que aplica **Control de Acceso Basado en Roles (RBAC)** estricto, aislando las vistas operativas del Propietario de los paneles de fiscalización y auditoría del Administrador Matriculado.

---

### B. Sección: Product Backlog e Historias de Usuario

#### 1. Filas adicionales para insertar en la Tabla 3 (Product Backlog):

| ID | Historia de usuario | Prioridad | Puntos de historia | Dependencia |
| :--- | :--- | :--- | :--- | :--- |
| **HU-002** | *(Actualizada)* Padrón Maestro Catastral por superficie ($\text{m}^2$) y Motor de Ponderación Automática Multi-Unidad. | Alta | 13 | HU-001 |
| **HU-015** | Reclamo de unidades vacantes y validación documental de identidad y dominio (Onboarding / KYC). | Alta | 13 | HU-001, HU-002 |
| **HU-016** | Delegación de voto mediante Cartas Poder digitales y visado administrativo. | Alta | 13 | HU-015 |
| **HU-017** | Control de estado contable (Switch de Morosidad) con preservación del derecho a voz. | Media | 8 | HU-002, HU-007 |
| **HU-018** | Emisión de Comprobante Criptográfico de Sufragio (Recibo SHA-256). | Media | 5 | HU-008, HU-009 |
| **HU-019** | Gestión de Cuarto Intermedio y régimen legal de notificación a ausentes (Art. 2060 CCyCN). | Media | 8 | HU-003, HU-012 |

#### 2. Fichas Detalladas de Historias de Usuario (Formato Universidad Siglo 21):

##### HU-002 (Reemplazo sugerido para Tabla 5)

| ID | HU-002 | Nombre | Padrón Maestro Catastral por superficie ($\text{m}^2$) y Motor de Ponderación Automática Multi-Unidad. |
| :--- | :--- | :--- | :--- |
| **Descripción** | Como administrador quiero registrar las unidades funcionales y complementarias indicando únicamente su superficie en metros cuadrados ($\text{m}^2$) para que el Motor de Ponderación calcule y recalcule automáticamente el coeficiente porcentual de todo el edificio sobre una base exacta del $100\%$. | | |
| **Criterio de aceptación** | 1. Cuando el administrador incorpora o actualiza la superficie ($\text{m}^2$) de una unidad (Departamento, Cochera o Baulera), el sistema recalcula dinámicamente el `coeficientePorcentual` de todas las unidades registradas según la proporción $(S_i / S_{\text{total}}) \times 100$.<br>2. Si un propietario posee múltiples unidades vinculadas, el sistema consolida automáticamente la sumatoria de sus coeficientes empleando aritmética exacta (`BigDecimal`) sin pérdida de decimales por redondeo prematuro. | | |
| **Prioridad** | Alta | **Puntos de historia estimados** | 13 |

##### HU-015 (Nueva)

| ID | HU-015 | Nombre | Reclamo de unidades vacantes y validación documental de identidad y dominio (Onboarding / KYC). |
| :--- | :--- | :--- | :--- |
| **Descripción** | Como propietario quiero reclamar una o varias unidades funcionales vacantes del Padrón Maestro adjuntando mi DNI y Escritura traslativa de dominio para que la Administración audite mi titularidad y active mi poder de voto. | | |
| **Criterio de aceptación** | 1. Si el usuario ingresa por primera vez, completa sus credenciales y selecciona sus unidades vacantes; si ya posee una sesión activa, el sistema adapta el flujo a *"Vincular Nueva Unidad a su Cartera"* pre-completando sus datos personales en modo lectura.<br>2. Mientras el legajo permanece en estado `PENDIENTE_AUDITORIA`, el sufragio sobre las unidades reclamadas se mantiene preventivamente bloqueado.<br>3. Cuando el Administrador aprueba el expediente en el panel KYC, las unidades pasan a estado `VINCULADA` y su coeficiente se suma automáticamente a la cartera del titular. | | |
| **Prioridad** | Alta | **Puntos de historia estimados** | 13 |

##### HU-016 (Nueva)

| ID | HU-016 | Nombre | Delegación de voto mediante Cartas Poder digitales y visado administrativo. |
| :--- | :--- | :--- | :--- |
| **Descripción** | Como propietario con identidad verificada (KYC aprobado), quiero emitir una Carta Poder digital a favor de otro vecino o apoderado para delegar mi representación y coeficiente en la asamblea. | | |
| **Criterio de aceptación** | 1. Si el propietario aún no cuenta con KYC verificado, el sistema bloquea preventivamente el formulario de delegación.<br>2. Al enviar la Carta Poder con el correo del apoderado y documento firmado, queda en estado `PENDIENTE` hasta que el Administrador la audite y apruebe.<br>3. Una vez en estado `APROBADO`, la Urna Criptográfica bloquea el voto directo del poderdante y suma dinámicamente su coeficiente al peso electoral de los botones de votación del apoderado. | | |
| **Prioridad** | Alta | **Puntos de historia estimados** | 13 |

##### HU-017 (Nueva)

| ID | HU-017 | Nombre | Control de estado contable (Switch de Morosidad) con preservación del derecho a voz. |
| :--- | :--- | :--- | :--- |
| **Descripción** | Como administrador quiero alternar el estado contable de cada unidad funcional entre `AL DÍA` y `MOROSO` para suspender preventivamente el derecho a voto de unidades en mora sin vulnerar su derecho a participar en el debate. | | |
| **Criterio de aceptación** | 1. Cuando el administrador marca una unidad como `MOROSO` en el Padrón Maestro, el sistema bloquea los controles de emisión de sufragio del titular en la Urna Criptográfica mostrando la fundamentación reglamentaria.<br>2. El propietario en mora conserva habilitado el envío de comentarios y mociones en el Foro de Debate Asíncrono (derecho a voz). | | |
| **Prioridad** | Media | **Puntos de historia estimados** | 8 |

##### HU-018 (Nueva)

| ID | HU-018 | Nombre | Emisión de Comprobante Criptográfico de Sufragio (Recibo SHA-256). |
| :--- | :--- | :--- | :--- |
| **Descripción** | Como propietario que ha emitido su voto, quiero visualizar y descargar un comprobante formal con el sello de tiempo UTC y el hash SHA-256 generado para contar con una prueba criptográfica inmutable de mi decisión. | | |
| **Criterio de aceptación** | 1. Tras sufragar en un punto del orden del día, se habilita la acción *"Descargar Comprobante de Voto"*.<br>2. El modal de recibo exhibe Nombre del Titular, Unidades y Superficie ($\text{m}^2$), Coeficiente Ponderado, Sentido del Voto, Fecha/Hora exacta en UTC, el Hash SHA-256 de 64 caracteres hexadecimales y la leyenda legal de inmutabilidad. | | |
| **Prioridad** | Media | **Puntos de historia estimados** | 5 |

##### HU-019 (Nueva)

| ID | HU-019 | Nombre | Gestión de Cuarto Intermedio y régimen legal de notificación a ausentes (Art. 2060 CCyCN). |
| :--- | :--- | :--- | :--- |
| **Descripción** | Como administrador quiero poder pausar temporalmente la asamblea en Cuarto Intermedio ante contingencias y gestionar el plazo legal de 15 días de notificación a los propietarios ausentes sobre las decisiones adoptadas. | | |
| **Criterio de aceptación** | 1. Al activar el estado `CUARTO_INTERMEDIO`, tanto el Foro de Debate como la Urna Criptográfica congelan nuevas entradas en tiempo real.<br>2. Para los propietarios ausentes, el sistema habilita el módulo de Resoluciones notificadas por 15 días corridos (Art. 2060 CCyCN), computando el silencio como adhesión tácita o permitiendo registrar oposición fundada. | | |
| **Prioridad** | Media | **Puntos de historia estimados** | 8 |

---

### C. Sección: Estructura de Datos (Ajustes Exactos en Diagrama de Clases y DER)

Para que la **Ilustración 3 (Diagrama de Clases)** y la **Ilustración 4 (DER)** coincidan 100% con las entidades reales de JPA/Hibernate (`Voto.java`, `UnidadFuncional.java`, `Usuario.java`) y el modelo de dominio, realiza las siguientes correcciones:

1. **Corrección Crítica de Tipos de Datos (De `Float` a `BigDecimal` / `DECIMAL(10,6)`)**:
   * En la clase **`UnidadFuncional`**:
     * Reemplazar `coeficienteCopropiedad: Float` por:
       * `superficieM2: BigDecimal` (`DECIMAL(10,2)` en DER)
       * `coeficienteCopropiedad: BigDecimal` (`DECIMAL(10,6)` en DER, calculado por el Motor de Ponderación)
       * `tipoUnidad: String` (`VARCHAR`: `'DEPARTAMENTO'`, `'COCHERA'`, `'BAULERA'`)
       * `estadoRegistral: String` (`VARCHAR`: `'VACANTE'`, `'VINCULADA'`)
       * `estadoContable: String` (`VARCHAR`: `'AL_DIA'`, `'MOROSO'`)
   * En la clase **`Voto`**:
     * Reemplazar `pesoCoeficiente: Float` por `pesoCoeficiente: BigDecimal` (`DECIMAL(10,6)` en DER, tal como está declarado en `Voto.java`: `@Column(name = "peso_coeficiente", nullable = false, precision = 10, scale = 6)`).
     * Asegurar la restricción `UNIQUE` sobre `hash_actual` (`VARCHAR(64) UNIQUE NOT NULL`) y una restricción de unicidad compuesta `UNIQUE(id_tema, id_usuario)` que respalda el método `existsByTema_IdTemaAndUsuario_IdUsuario`.
2. **Corrección de Cardinalidad en `UNIDAD_FUNCIONAL` <-> `USUARIO`**:
   * En `UNIDAD_FUNCIONAL`, la clave foránea `id_usuario` debe ser **`NULLABLE` ($0..1$)**, dado que las unidades físicas existen en el Padrón Maestro desde la constitución del consorcio en estado `VACANTE` (`id_usuario = NULL`) antes de que un propietario complete su Onboarding KYC.
   * La relación es **`Usuario (0..1) <---> (0..*) UnidadFuncional`**: un propietario puede ser titular de múltiples unidades funcionales y complementarias simultáneamente (Multi-Unidad).
3. **Incorporación de las Entidades de Gobernanza Legal (`CARTA_PODER` y `SOLICITUD_KYC`)**:
   * Agregar la entidad **`CARTA_PODER`** (Mandato de Representación):
     * `id_poder: INTEGER PK`
     * `id_usuario_poderdante: INTEGER FK (USUARIO)`
     * `email_apoderado: VARCHAR`
     * `id_asamblea: INTEGER FK (ASAMBLEA)`
     * `vigencia: VARCHAR`
     * `documento_adjunto: VARCHAR`
     * `estado: VARCHAR` (`'PENDIENTE'`, `'APROBADO'`, `'RECHAZADO'`)
   * Agregar en **`USUARIO`** los atributos de estado de acreditación dominial:
     * `nombre_completo: VARCHAR`
     * `estado_kyc: VARCHAR` (`'PENDIENTE_AUDITORIA'`, `'APROBADO'`, `'RECHAZADO'`)

---

### D. Sección: Análisis de Riesgos y Plan de Contingencia

Agrega los siguientes **4 riesgos de alta especificidad técnica y jurídica** (que el código actual ya mitiga exitosamente) en la **Tabla 21 (Análisis de riesgos)** y en la **Tabla 24 (Plan de contingencia)**:

| Tipo | Riesgo Identificado | Causa Raíz | Plan de Contingencia / Mitigación Implementada en ConsorcioSync |
| :--- | :--- | :--- | :--- |
| **Técnico / Criptográfico** | **Bifurcación (*Chain Fork*) de la cadena de hashes SHA-256 por sufragios simultáneos (*Race Condition*).** | Dos o más copropietarios emiten su voto en el mismo milisegundo sobre el mismo tema; ambos hilos leen idéntico `hash_anterior` antes del `COMMIT`. | Se implementó bloqueo pesimista a nivel de base de datos (`@Lock(LockModeType.PESSIMISTIC_WRITE)` -> `SELECT ... FOR UPDATE`) en `VotoRepository`, serializando las transacciones por Tema y garantizando una topología lineal estricta. |
| **Técnico / Seguridad** | **Ataque de repetición (*Replay Attack*) mediante trasplante de cadenas de votos entre distintos temas o asambleas.** | Uso de una semilla o hash génesis estático (ej. cadena de ceros) común a todas las votaciones en la base de datos. | Se implementó la generación determinista de un **Hash Génesis Dinámico** (`generarHashGenesisDinamico` en `VotoService`) que sella en el bloque 0 el ID de la Asamblea y el ID del Tema (`GENESIS_BLOCK\|ASAMBLEA:X\|TEMA:Y`). |
| **Legal / Dominio** | **Impugnación de asamblea por discrepancias de redondeo decimal en la sumatoria de coeficientes o sufragio de cuentas sin título dominial validado.** | Uso de aritmética de punto flotante binario (`float`/`double`), carga manual de porcentajes que no suman $100\%$ o sufragio de usuarios no auditados. | Se reemplazó el porcentaje estático por un **Motor de Ponderación por Superficie ($\text{m}^2$)** con aritmética exacta `BigDecimal(10,6)`, sumado a un bloqueo preventivo de urna y de Cartas Poder hasta la aprobación del legajo documental **KYC (DNI + Escritura)**. |
| **Legal / Operativo** | **Duplicidad de sufragios entre titular poderdante y representante apoderado, o interrupción imprevista del acto asambleario.** | Falta de sincronización entre el registro de Cartas Poder y la Urna Criptográfica, o incidentes técnicos durante la ventana de deliberación. | Al aprobarse una Carta Poder en `TabCartasPoder`, el sistema bloquea automáticamente los controles de voto del poderdante y transfiere dinámicamente su coeficiente al apoderado. Ante incidentes operativos, el Administrador dispone del módulo de **Cuarto Intermedio** para pausar y reanudar la ventana temporal con trazabilidad completa. |

