# Job Command Center

**Plataforma personal para organizar y gestionar la búsqueda de empleo, con apoyo de herramientas de IA.**

Job Command Center nace para centralizar el proceso de búsqueda: guardar oportunidades, hacer seguimiento de candidaturas, mantener el perfil profesional y preparar materiales para cada oferta desde un único espacio.

> **Estado del proyecto:** en desarrollo activo. La estructura y varias áreas funcionales están en construcción; las integraciones y algunos flujos de usuario todavía deben completarse y validarse.

## Objetivo

Reducir el caos de la búsqueda de empleo y convertirla en un proceso organizado, medible y fácil de revisar.

## Áreas del proyecto

- **Ofertas de empleo:** consulta y organización de oportunidades.
- **Seguimiento de candidaturas:** estados y evolución del proceso de selección.
- **Perfil profesional:** información del candidato y versiones de documentos.
- **CV y cartas de presentación:** estructura preparada para gestionar materiales adaptados a cada oportunidad.
- **Asistencia con IA:** base técnica para incorporar funciones de análisis y generación de contenido.
- **Integraciones:** espacio preparado para conectar fuentes externas y servicios de autenticación.

Estas áreas describen el alcance del proyecto; no todas las funciones están terminadas ni todas las integraciones están activas.

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| Next.js 15 | Aplicación web y rutas de servidor |
| React 19 | Interfaz de usuario |
| TypeScript | Tipado estático |
| Prisma | Acceso y modelado de datos |
| Auth.js / NextAuth | Autenticación |
| PostgreSQL / SQLite | La configuración de base de datos está pendiente de unificarse en el proyecto |
| Docker Compose | Servicios de desarrollo definidos en la configuración actual |
| AI SDK | Base para funciones asistidas por IA |

## Requisitos de desarrollo

- Node.js 20 o superior
- npm
- Git
- El motor de base de datos que quede definido en la configuración de Prisma

## Preparación del entorno

1. Clona el repositorio y entra en la carpeta del proyecto.
2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Revisa `.env.example` y prepara las variables de entorno necesarias para tu configuración.
4. Comprueba la configuración del proveedor de base de datos en `prisma/schema.prisma` y los servicios definidos en `docker-compose.yml`. Estos archivos deben usar una configuración coherente antes de inicializar la base de datos.
5. Genera el cliente de Prisma y sincroniza el esquema cuando la configuración esté alineada:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. Si quieres cargar los datos de demostración definidos en el proyecto:

   ```bash
   npx prisma db seed
   ```

7. Inicia el entorno de desarrollo:

   ```bash
   npm run dev
   ```

La dirección de acceso depende de la configuración de ejecución. No se incluye aquí una URL fija.

## Próximos hitos

- [ ] Unificar la configuración de base de datos y documentar el procedimiento definitivo.
- [ ] Completar los flujos principales de ofertas y candidaturas.
- [ ] Hacer operativas las acciones del tablero de seguimiento.
- [ ] Implementar y validar las integraciones externas.
- [ ] Reforzar la autenticación, autorización y validación de las rutas de API.
- [ ] Añadir pruebas automatizadas y documentar los resultados.

## Principios de desarrollo

- Priorizar flujos funcionales antes que añadir pantallas sin conectar.
- Mantener separadas las funciones implementadas, las pendientes y las integraciones no verificadas.
- Evitar exponer secretos o credenciales de demostración en entornos públicos.
- Documentar los cambios importantes para que el proyecto sea reproducible.

---

**Job Command Center** es un proyecto personal en evolución. El objetivo es construir una herramienta útil para la búsqueda de empleo, con una base técnica clara y mejoras incrementales.
