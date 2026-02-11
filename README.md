# Weather App - Retro-Futuristic Terminal Design

Una aplicación distintiva del clima en React con una estética terminal retro-futurista que incluye:
- **Interfaz de terminal de computadora estilo ciencia ficción de los 80s** con tipografía monoespacio y neón
- **5 temas de color personalizables** (Verde neón, Cyan, Rosa, Ámbar, Naranja)
- **Efectos de scanline y ruido** para un auténtico aspecto de terminal CRT
- **Datos meteorológicos en tiempo real** de OpenWeatherMap API
- **Animaciones suaves** y elementos interactivos
- **Diseño responsive** que funciona en todos los dispositivos
- **API Key segura** usando Vercel Serverless Functions

## ✨ Nuevas Características

### 🎨 Selector de Color
Ubicado en la esquina superior derecha del header, permite cambiar dinámicamente entre 5 temas de color:
- **GRN** - Verde Neón (`#00ff41`)
- **CYN** - Azul Cyan (`#00d9ff`)
- **PNK** - Rosa Intenso (`#ff006e`)
- **AMB** - Ámbar (`#ffbe0b`)
- **ORG** - Naranja (`#fb5607`)

Todos los elementos de la UI se actualizan automáticamente: bordes, textos, efectos de glow, y scanlines.

## 📋 Setup Instructions

### 1. Crear el Proyecto React

```bash
npx create-react-app weather-app
cd weather-app
```

### 2. Agregar el Componente

Reemplaza el contenido de `src/App.js` con el código de `weather-app.jsx`.

### 3. Configurar Vercel Serverless Function

#### Estructura de Carpetas
```
weather-app/
├── src/
│   └── App.js          # Código del componente React
├── api/
│   └── weather.js      # Serverless function
├── public/
├── package.json
└── .env.local          # Variables de entorno (NO subir a Git)
```

#### Crear la API Function
1. Crea una carpeta `api/` en la raíz del proyecto
2. Copia el archivo `weather.js` dentro de `api/`

### 4. Obtener API Key de OpenWeatherMap

1. Regístrate gratis en [OpenWeatherMap](https://openweathermap.org/api)
2. Ve a la sección de API Keys
3. Genera una nueva API key (plan gratis: 1000 llamadas/día)

### 5. Configurar Variables de Entorno

#### 🔐 Importante: Cómo Funcionan las Variables de Entorno

**Tu API key NUNCA está expuesta al frontend**. Funciona así:

```
Frontend (navegador) 
    ↓ fetch('/api/weather')
Serverless Function (servidor) ← Lee process.env.OPENWEATHER_API_KEY
    ↓
OpenWeatherMap API
```

El archivo `.env.local` es leído **SOLO por Vercel CLI** para simular las serverless functions localmente. React **NO** tiene acceso a estas variables.

#### Para Desarrollo Local
Crea un archivo `.env.local` en la raíz del proyecto:

```env
OPENWEATHER_API_KEY=tu_api_key_aqui
```

⚠️ **IMPORTANTE**: 
- Este archivo es solo para `vercel dev` (NO para `npm start`)
- Agrega `.env.local` a tu `.gitignore` para no exponerlo
- La API key es accesible SOLO por las funciones en `/api`, NO por React

```gitignore
# .gitignore
.env.local
.env*.local
```

#### Para Producción en Vercel
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a **Settings** → **Environment Variables**
3. Agrega la variable:
   - **Name**: `OPENWEATHER_API_KEY`
   - **Value**: Tu API key de OpenWeatherMap
   - **Environment**: Production, Preview, Development (selecciona todos)
4. Click en **Save**

### 6. Deploy en Vercel

#### Opción 1: Deploy desde GitHub (Recomendado)
```bash
# Inicializa Git y sube a GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin tu-repo-url
git push -u origin main

# Conecta el repo en Vercel Dashboard
# Vercel detectará automáticamente la configuración
```

#### Opción 2: Deploy con Vercel CLI
```bash
# Instala Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

Vercel detectará automáticamente:
- ✅ El proyecto React en la raíz
- ✅ Las serverless functions en `/api`
- ✅ Las variables de entorno configuradas

### 7. Ejecutar Localmente

⚠️ **MUY IMPORTANTE**: Debes usar `vercel dev`, NO `npm start`

```bash
# Instala Vercel CLI si no lo tienes
npm i -g vercel

# Ejecuta en modo desarrollo (simula serverless functions)
vercel dev
```

**¿Por qué `vercel dev` y no `npm start`?**
- ✅ `vercel dev`: Ejecuta las serverless functions en `/api` y lee `.env.local`
- ❌ `npm start`: Solo ejecuta React, las serverless functions NO funcionarán

La app estará disponible en `http://localhost:3000` y las API functions en `http://localhost:3000/api/weather`.

Si usas `npm start`, verás la interfaz pero la búsqueda del clima NO funcionará porque las serverless functions no estarán corriendo.

## 🔒 Seguridad

### ¿Por qué usar Serverless Functions?

❌ **NUNCA hagas esto** (expone tu API key):
```javascript
const API_KEY = 'mi_api_key_secreta'; // ¡Visible en el frontend!
fetch(`https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}`);
```

✅ **Método seguro** con Vercel:
```javascript
// Frontend - No expone el API key
fetch(`/api/weather?city=${city}`);

// Backend (serverless) - API key en variables de entorno
const API_KEY = process.env.OPENWEATHER_API_KEY;
```

### Ventajas de este Enfoque
1. **API Key oculto**: Nunca se expone en el código frontend
2. **Sin backend completo**: No necesitas configurar un servidor Node.js
3. **Escalable**: Vercel maneja el escalado automáticamente
4. **CORS manejado**: La función serverless incluye headers CORS
5. **Gratis**: Plan gratuito de Vercel es más que suficiente

### 🤔 Preguntas Frecuentes sobre Seguridad

**P: ¿El frontend puede ver la API key en `.env.local`?**  
R: NO. El archivo `.env.local` es leído SOLO por Vercel CLI para las serverless functions. React no tiene acceso a él.

**P: ¿Puedo usar `npm start` en desarrollo?**  
R: Técnicamente sí, pero las serverless functions no funcionarán. Debes usar `vercel dev` para que todo funcione.

**P: ¿Alguien puede ver mi API key inspeccionando el código en el navegador?**  
R: NO. La API key nunca llega al navegador. Solo existe en el servidor (Vercel).

**P: ¿Qué pasa si alguien hace muchas peticiones a mi endpoint `/api/weather`?**  
R: Vercel tiene rate limiting incorporado. Además, OpenWeatherMap también limita las llamadas por API key.

## 🎨 Características del Diseño

### Selector de Temas Dinámico
El selector de color en el header permite cambiar instantáneamente:
- Color principal del texto
- Bordes y contornos
- Efectos de glow y sombras
- Scanlines
- Estado hover de botones
- Colores de placeholder

### Elementos Visuales
- Tipografía monoespacio (Courier New) para autenticidad terminal
- Efectos de scanline que se adaptan al color del tema
- Textura de ruido para efecto de pantalla CRT
- Acentos de esquina inspirados en interfaces sci-fi
- Animaciones suaves para interacciones modernas

## 🛠 Personalización Adicional

### Cambiar a Fahrenheit
En `api/weather.js` línea 38, cambia `units=metric` a `units=imperial`:
```javascript
const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=imperial`;
```

Y en el componente React, actualiza las etiquetas de `°C` a `°F`.

### Agregar Más Temas de Color
En `weather-app.jsx`, agrega más objetos al array `colorThemes`:
```javascript
const colorThemes = [
  // ... temas existentes
  { name: 'PURPLE', color: '#9d4edd', label: 'PRP' },
  { name: 'LIME', color: '#ccff00', label: 'LME' },
];
```

### Modificar Animaciones
Edita las keyframes CSS al final del componente para personalizar las animaciones.

## 📊 Límites de API (Plan Gratuito)

OpenWeatherMap Free Tier:
- ✅ 1,000 llamadas por día
- ✅ 60 llamadas por minuto
- ✅ Datos meteorológicos actuales
- ✅ No requiere tarjeta de crédito

Vercel Free Tier:
- ✅ 100 GB de bandwidth
- ✅ 100 GB de Serverless Function execution
- ✅ Ilimitadas deployments

## 🌐 Compatibilidad de Navegadores

Funciona en todos los navegadores modernos:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## 📱 Responsive Design

La aplicación es completamente responsive:
- **Desktop**: Layout completo con selector de colores en header
- **Tablet**: Grid adaptativo para tarjetas de información
- **Mobile**: Selector de colores se ajusta con flexbox

## 🐛 Troubleshooting

### Error: "Server configuration error"
- ✅ Verifica que la variable de entorno `OPENWEATHER_API_KEY` esté configurada en Vercel
- ✅ Asegúrate de que el nombre sea exactamente `OPENWEATHER_API_KEY`

### Error: "Location not found"
- ✅ Verifica la ortografía del nombre de la ciudad
- ✅ Intenta con el nombre de la ciudad en inglés
- ✅ Para ciudades con acentos, intenta sin acentos

### La API no funciona localmente
- ✅ Ejecuta con `vercel dev` en lugar de `npm start`
- ✅ Verifica que `.env.local` existe y contiene la API key
- ✅ Reinicia el servidor después de agregar la variable de entorno

### Los colores no cambian
- ✅ Verifica que el componente tenga el estado `themeColor`
- ✅ Asegúrate de usar la función `hexToRgba` para transparencias
- ✅ Revisa la consola del navegador por errores

## 📄 Licencia

Libre para usar y modificar en proyectos personales y comerciales.

## 🙏 Créditos

- Datos meteorológicos: [OpenWeatherMap](https://openweathermap.org/)
- Hosting: [Vercel](https://vercel.com/)
- Diseño: Estética terminal retro-futurista inspirada en interfaces sci-fi de los 80s