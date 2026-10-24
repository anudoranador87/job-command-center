# 🎯 Job Command Center

Centro de mando personal para optimizar, adaptar y gestionar la búsqueda de empleo con Inteligencia Artificial.

## 🚀 Inicio Rápido Local

### 1. Requisitos previos
- Node.js >= 20
- Docker y Docker Compose

### 2. Levantar la base de datos (PostgreSQL 16)
```bash
docker compose up -d
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Inicializar Prisma (Base de datos y cliente)
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```

La aplicación estará accesible en: [http://localhost:3000](http://localhost:3000)

**Usuario demo preconfigurado:**
- **Email:** `demo@jobcommand.local`
- **Contraseña:** `demo1234`
