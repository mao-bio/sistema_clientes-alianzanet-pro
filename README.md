# 🛰️ ALIANZANET PRO - Sistema de Gestión ISP

![ALIANZANET Logo](/public/logo.png)

**Alianzanet Pro** es una plataforma avanzada de gestión para proveedores de servicios de Internet (ISP), diseñada para centralizar la administración de clientes, el control de morosidad y la automatización de notificaciones en un entorno moderno, rápido y seguro.

---

## ✨ Características Principales

### 📊 Dashboard Inteligente
*   **Métricas en Tiempo Real:** Visualización instantánea de ingresos, clientes activos, suspendidos y morosos.
*   **Gráficos Dinámicos:** Análisis de crecimiento y distribución de clientes por nodos y planes.

### 👥 Gestión de Clientes (CRUD)
*   **Control Total:** Creación, edición y visualización detallada de fichas técnicas de clientes.
*   **Automatización de Fechas:** Cálculo automático de fechas de instalación y próximos vencimientos de pago.
*   **Campos Personalizados:** Soporte para ID de usuario, Nodos, Planes, TV Box y múltiples contactos.

### 💰 Control de Morosidad y Cobros
*   **Detección Automática:** Identificación de clientes con pagos pendientes basado en el mes actual.
*   **Gestión de Pagos:** Registro de mensualidades con generación automática de recibos profesionales.
*   **Calculadora Financiera:** Análisis preventivo de utilidad bruta (Ingresos vs Gastos).

### 📧 Automatización de Notificaciones
*   **Email Branding:** Envío de recibos, recordatorios y alertas de estado con diseño corporativo premium.
*   **Envíos del Día 01:** Automatización completa para el envío de recordatorios mensuales.
*   **Integración Telegram:** Reportes diarios y alertas de morosidad directas a tu chat.

### 📱 Experiencia Multiplataforma
*   **Diseño Responsivo:** Optimizado 100% para celulares, tablets y computadoras.
*   **Navegación Móvil:** Barra inferior intuitiva para una gestión rápida desde el campo.

---

## 🛠️ Stack Tecnológico

*   **Frontend:** [Next.js 14](https://nextjs.org/) + [React](https://reactjs.org/)
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Automatización:** [Google Apps Script](https://developers.google.com/apps-script)
*   **Notificaciones:** MailApp API & Telegram Bot API
*   **Animaciones:** [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Instalación y Despliegue

### Requisitos Previos
*   Node.js 18+ instalado.
*   Cuenta en Supabase.
*   Proyecto de Google Apps Script configurado.

### Configuración Local
1.  Clona el repositorio.
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env.local` con tus credenciales:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_llave_anon
    ```
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

### Despliegue en Vercel
1.  Sube tu proyecto a GitHub.
2.  Conéctalo en **Vercel**.
3.  Configura las **Environment Variables** con los datos de tu `.env.local`.
4.  ¡Listo! Tu sistema estará en línea.

---

## 🔒 Seguridad y Privacidad
Este sistema utiliza un Token de Seguridad (`MI_TOKEN_SEGURO`) para la comunicación entre el Frontend y el servidor de correos (GAS), garantizando que solo la aplicación autorizada pueda emitir notificaciones.

---

## 👨‍💻 Autor
Desarrollado para **Alianzanet** - *Calidad y Conectividad*.
