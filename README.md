# Oriana 15

Aplicación web creada para un cumpleaños de 15, pensada como una pequeña red social para que los invitados pudieran compartir y ver fotos del evento.

El proyecto fue desarrollado con **React** y **Supabase**, utilizando autenticación de usuarios, base de datos y almacenamiento de imágenes.

## Funcionalidades

- Registro e inicio de sesión de usuarios.
- Publicación y subida de fotos.
- Likes en las publicaciones.
- Comentarios.
- Visualización de publicaciones y contenido del evento.
- Diseño responsive, adaptado a celulares y computadoras.
- Persistencia de datos mediante Supabase.
- Almacenamiento de imágenes mediante Supabase Storage.

## Tecnologías utilizadas

- **React 19**
- **Vite**
- **JavaScript**
- **React Router**
- **Supabase**
  - Authentication
  - PostgreSQL Database
  - Storage
- **CSS / HTML**

## Configuración

Para ejecutar el proyecto localmente es necesario crear un proyecto en Supabase y configurar las variables de entorno.

### 1. Clonar el repositorio

```bash
git clone https://github.com/marjjin/oriana-15.git
cd oriana-15
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

Crear un proyecto en Supabase y completar el archivo `.env` con las credenciales correspondientes:

```env
VITE_SUPABASE_URL=TU_URL_DE_SUPABASE
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
VITE_LIVE_SCREEN_LIMIT=30
VITE_LIVE_SCREEN_SLIDE_MS=6000
```

El cliente de Supabase se encuentra en `src/lib/supabaseClient.js`.

### 4. Ejecutar el proyecto

```bash
npm run dev
```

La aplicación estará disponible en la dirección local indicada por Vite.

## Desarrollo

El frontend está construido con React y Vite. La navegación entre las distintas vistas se maneja mediante React Router, mientras que Supabase se utiliza para la autenticación, persistencia de datos y almacenamiento de imágenes.

## Estado del proyecto

El repositorio contiene el código fuente completo del proyecto. Para ejecutar todas las funcionalidades es necesario contar con una instancia de Supabase configurada, ya que la aplicación depende de sus servicios de autenticación, base de datos y Storage.

## Autor

Desarrollado como proyecto personal para un evento de cumpleaños de 15.

**Repositorio:** https://github.com/marjjin/oriana-15
