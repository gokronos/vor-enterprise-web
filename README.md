# VOR Enterprise Web

Proyecto Next.js para sitio corporativo VOR Enterprise.

## KYC con XAMPP/MySQL

La ruta [http://localhost:3000/kyc](http://localhost:3000/kyc) ya está conectada a MySQL para registrar solicitudes KYC.

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear `.env.local` a partir de `.env.example`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=vor_enterprise
```

### 3. Crear base de datos y tabla

En phpMyAdmin o MySQL CLI, ejecutar:

`database/kyc_mysql.sql`

### 4. Ejecutar proyecto

```bash
npm run dev
```

## Estructura KYC implementada

- `app/kyc/page.tsx`: formulario KYC (UI cliente).
- `app/api/kyc/register/route.ts`: endpoint de registro KYC.
- `lib/mysql.ts`: conexión pool MySQL + creación automática de esquema.

## Notas importantes de carga de archivos

- Los soportes del formulario KYC aceptan solo archivos PDF (`.pdf`).
- El PDF de cédula es obligatorio.
- El PDF de RUT es opcional.
- Los archivos se guardan en `public/uploads/kyc` y la ruta queda almacenada en MySQL.

## Registro e inicio de sesión KYC

- En registro de Persona Natural se solicita contraseña (mínimo 8 caracteres).
- El usuario de inicio de sesión es el número de documento.
- La contraseña se almacena hasheada en la columna `password_hash`.
- Endpoint login: `POST /api/kyc/login`.

## Gestión del registro después de iniciar sesión

- El usuario puede actualizar sus datos principales (nombre, ciudad, dirección, correo, teléfono y origen de fondos).
- El usuario puede actualizar su RUT en PDF (opcional).
- El usuario puede eliminar completamente su registro y sus archivos cargados.
- Endpoints de perfil: `PUT /api/kyc/profile` y `DELETE /api/kyc/profile`.
