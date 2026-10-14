# LRG Frontend — React + Vite

Frontend React para el backend Laravel LRG Módulo 1. Consume la API REST vía cookies de sesión Sanctum.

## Stack

- **React 19** + **Vite 8**
- **React Router v7** — enrutamiento SPA
- **Zustand** — estado global (auth)
- **Axios** — cliente HTTP con CSRF automático
- **react-hot-toast** — notificaciones
- **lucide-react** — iconos

## Puesta en marcha

```sh
# 1. Asegúrate de que el backend Laravel esté corriendo en :8000
# 2. Copia el entorno
cp .env.example .env        # o edita VITE_API_URL

# 3. Instala dependencias
npm install

# 4. Inicia el servidor de desarrollo
npm run dev                  # http://localhost:5173
```

> **En Windows con Laragon**, usa:
> ```powershell
> $env:PATH = "C:\laragon\bin\nodejs\node-v22;" + $env:PATH
> npm.cmd run dev
> ```

## Variables de entorno

| Variable       | Descripción                  | Default                 |
|----------------|------------------------------|-------------------------|
| `VITE_API_URL` | URL base del backend Laravel | `http://localhost:8000` |

## Configuración del backend (Laravel)

Agrega en `.env` de Laravel:

```env
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DRIVER=database
```

## Páginas implementadas

| Ruta                | Componente            | Descripción                         |
|---------------------|-----------------------|-------------------------------------|
| `/login`            | `LoginPage`           | Inicio de sesión                    |
| `/register`         | `RegisterPage`        | Registro de cuenta                  |
| `/forgot-password`  | `ForgotPasswordPage`  | Solicitud de enlace de reset        |
| `/reset-password`   | `ResetPasswordPage`   | Formulario de nueva contraseña      |
| `/dashboard`        | `DashboardPage`       | Vista general + proyectos recientes |
| `/projects`         | `ProjectsPage`        | Lista de proyectos con búsqueda     |
| `/projects/new`     | `NewProjectPage`      | Formulario de creación              |
| `/projects/:id`     | `ProjectDetailPage`   | Detalle, importaciones y artefactos |

## Estructura

```
src/
├── lib/api.js              # Cliente Axios + todos los endpoints
├── store/authStore.js      # Estado de autenticación (Zustand)
├── components/
│   ├── Layout.jsx          # Sidebar + contenido principal
│   └── RouteGuards.jsx     # ProtectedRoute / GuestRoute
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── ResetPasswordPage.jsx
│   ├── DashboardPage.jsx
│   ├── ProjectsPage.jsx
│   ├── NewProjectPage.jsx
│   └── ProjectDetailPage.jsx
├── App.jsx                 # Router principal
├── main.jsx
└── index.css               # Design system completo (dark mode)
```
