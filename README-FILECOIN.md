# Integración de Filecoin y Sistema de Tokens

## 🌟 Descripción

Este backend integra almacenamiento descentralizado en Filecoin para reseñas anónimas y un sistema de tokens ficticios para crear un ranking de usuarios basado en su participación en eventos.

## 🎯 Características

### 1. Almacenamiento Anónimo en Filecoin
- Las reseñas de usuarios se almacenan de forma anónima en Filecoin
- Se genera un hash único para cada usuario que preserva su anonimato
- Los datos se pueden recuperar usando el PieceCID
- Almacenamiento permanente e inmutable

### 2. Sistema de Tokens Ficticios
Los usuarios ganan tokens por:
- **Asistencia a eventos**: 5 tokens
- **Envío de reseña**: 10 tokens
- **Reseña detallada** (3+ preguntas): +15 tokens bonus
- **Early Bird** (primeras 10 reseñas): +5 tokens bonus

### 3. Sistema de Rankings
Los usuarios son clasificados según sus tokens totales:

| Rango | Tokens Necesarios |
|-------|------------------|
| NOVICE | 0+ |
| CONTRIBUTOR | 50+ |
| ACTIVE | 150+ |
| EXPERT | 300+ |
| CHAMPION | 500+ |
| LEGEND | 1000+ |

## 📁 Estructura de Archivos

```
src/
  filecoin/
    filecoin-storage.service.ts  # Servicio de almacenamiento en Filecoin
    tokens.service.ts             # Sistema de tokens y rankings
    tokens.controller.ts          # API endpoints para tokens
    filecoin.module.ts            # Módulo de NestJS
  events/
    events.service.ts             # Actualizado con integración Filecoin
    events.module.ts              # Actualizado para importar FilecoinModule
```

## 🚀 Configuración

### 1. Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
FILECOIN_PRIVATE_KEY=tu_clave_privada
FILECOIN_RPC_URL=https://rpc.ankr.com/filecoin_testnet
```

### 2. Obtener Tokens de Prueba

Para usar Filecoin Calibration Network, necesitas tokens USDFC:
1. Visita: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc
2. Ingresa tu dirección de wallet
3. Solicita tokens de prueba

### 3. Instalar Dependencias

```bash
npm install
```

## 📡 API Endpoints

### Tokens y Rankings

#### Obtener tokens de un usuario
```http
GET /tokens/user/:address
Headers:
  x-api-key: satisproof-api-key-2025
```

Respuesta:
```json
{
  "userAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
  "totalTokens": 125,
  "reviewTokens": 100,
  "attendanceTokens": 25,
  "eventCount": 5,
  "reviewCount": 4,
  "lastActivity": "2025-11-23T10:30:00.000Z",
  "rank": "ACTIVE"
}
```

#### Obtener Leaderboard
```http
GET /tokens/leaderboard?limit=10
Headers:
  x-api-key: satisproof-api-key-2025
```

Respuesta:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userAddress": "0x...",
      "totalTokens": 500,
      "eventCount": 20,
      "reviewCount": 15
    }
  ]
}
```

#### Obtener Estadísticas del Sistema
```http
GET /tokens/stats
Headers:
  x-api-key: satisproof-api-key-2025
```

#### Obtener Información de Rangos
```http
GET /tokens/ranks
```

### Reseñas (Actualizado)

#### Enviar Reseña
```http
POST /reviews/submit
Headers:
  x-api-key: satisproof-api-key-2025
Content-Type: application/json

{
  "eventId": "1732358400000",
  "userAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "reviews": [
    {
      "question": "¿Cómo calificarías el evento?",
      "rating": 5
    },
    {
      "question": "¿Recomendarías este evento?",
      "rating": 4
    }
  ]
}
```

Respuesta:
```json
{
  "message": "Review submitted successfully",
  "review": {
    "eventId": "1732358400000",
    "timestamp": "2025-11-23T10:30:00.000Z",
    "reviewCount": 2
  },
  "tokensEarned": 10,
  "isEarlyBird": true,
  "userTokens": {
    "userAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "totalTokens": 15,
    "reviewTokens": 10,
    "attendanceTokens": 5,
    "eventCount": 1,
    "reviewCount": 1,
    "lastActivity": "2025-11-23T10:30:00.000Z",
    "rank": "NOVICE"
  },
  "filecoin": {
    "stored": true,
    "pieceCid": "bafk...",
    "reviewId": "review-1732358400000-abc123"
  }
}
```

## 🔒 Anonimato

Las reseñas almacenadas en Filecoin son completamente anónimas:

1. **Hash Único**: Se genera un hash del usuario que no puede ser revertido
2. **Datos Separados**: La dirección del usuario no se almacena en Filecoin
3. **Inmutabilidad**: Una vez almacenado, el dato no puede ser modificado
4. **Descentralización**: Los datos están distribuidos en la red Filecoin

Ejemplo de datos almacenados en Filecoin:
```json
{
  "type": "anonymous_review",
  "data": {
    "eventId": "1732358400000",
    "reviewId": "review-1732358400000-abc123",
    "reviews": [
      {
        "question": "¿Cómo calificarías el evento?",
        "rating": 5
      }
    ],
    "timestamp": "2025-11-23T10:30:00.000Z",
    "userHash": "0x1234abcd..."
  }
}
```

## 🏃 Ejecutar el Backend

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

## 📊 Monitoreo

El servicio de Filecoin se inicializa automáticamente al arrancar la aplicación. Si no se configuran las variables de entorno, el sistema seguirá funcionando pero sin almacenamiento en Filecoin.

Los logs mostrarán:
- ✅ Cuando Filecoin se inicializa correctamente
- ⚠️ Cuando Filecoin no está disponible (pero el sistema sigue funcionando)
- 📝 Cada vez que se almacena una reseña en Filecoin
- 🎁 Tokens otorgados a usuarios

## 🧪 Testing

Para probar la integración:

1. Registra asistencia a un evento → +5 tokens
2. Envía una reseña simple → +10 tokens
3. Envía una reseña detallada (3+ preguntas) → +25 tokens
4. Sé de los primeros 10 en revisar → +5 tokens extra
5. Consulta tu ranking y tokens
6. Verifica el leaderboard

## 🛠️ Troubleshooting

### Filecoin no se inicializa
- Verifica que `FILECOIN_PRIVATE_KEY` esté configurada
- Asegúrate de tener tokens USDFC en tu wallet
- Revisa la conectividad con la red Filecoin

### Los tokens no se otorgan
- Verifica que el `FilecoinModule` esté importado en `EventsModule`
- Revisa los logs del servidor

### Las reseñas no se almacenan en Filecoin
- El sistema seguirá funcionando localmente
- Verifica los logs para ver el error específico
- Asegúrate de tener balance suficiente en Filecoin

## 🤝 Contribuciones

Para agregar nuevas funcionalidades:

1. Nuevos tipos de tokens en `tokens.service.ts`
2. Nuevos tipos de almacenamiento en `filecoin-storage.service.ts`
3. Nuevos endpoints en `tokens.controller.ts`

## 📝 Notas

- El sistema de tokens es ficticio y solo para ranking
- Los tokens NO son criptomonedas reales
- El almacenamiento en Filecoin es opcional pero recomendado
- Los datos en Filecoin son permanentes e inmutables
