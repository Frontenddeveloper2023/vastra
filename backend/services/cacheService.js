import Redis from 'ioredis'

let redisClient = null
const memoryStore = new Map()

// Check if a Redis server is configured and available
const redisHost = process.env.REDIS_HOST
const redisPort = Number(process.env.REDIS_PORT) || 6379

if (redisHost && redisHost !== '127.0.0.1' && redisHost !== 'localhost') {
  try {
    redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Do not spam reconnects if offline
    })

    redisClient.on('error', () => {
      // Quietly suppress uncaught connection spam
    })

    redisClient.connect().then(() => {
      console.log('[Redis Connected] High-speed cache active on ' + redisHost)
    }).catch(() => {
      console.log('[Redis Notice] Remote Redis offline. Using in-memory store.')
      redisClient = null
    })
  } catch (e) {
    redisClient = null
  }
} else {
  console.log('[Cache Notice] Using high-speed in-memory store for cache and OTP management.')
}

const cacheService = {
  // Set key with TTL in seconds
  set: async (key, value, ttlSeconds = 300) => {
    try {
      const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value)
      if (redisClient && redisClient.status === 'ready') {
        if (ttlSeconds) {
          await redisClient.set(key, valStr, 'EX', ttlSeconds)
        } else {
          await redisClient.set(key, valStr)
        }
        return true
      }
    } catch (err) {
      // fallback
    }
    // Memory store fallback
    memoryStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    })
    return true
  },

  // Get key
  get: async (key) => {
    try {
      if (redisClient && redisClient.status === 'ready') {
        const val = await redisClient.get(key)
        if (!val) return null
        try {
          return JSON.parse(val)
        } catch {
          return val
        }
      }
    } catch (err) {
      // fallback
    }
    // Memory store check
    const record = memoryStore.get(key)
    if (!record) return null
    if (record.expiresAt && Date.now() > record.expiresAt) {
      memoryStore.delete(key)
      return null
    }
    return record.value
  },

  // Delete key (instant invalidation)
  del: async (key) => {
    try {
      if (redisClient && redisClient.status === 'ready') {
        await redisClient.del(key)
      }
    } catch (err) {
      // fallback
    }
    memoryStore.delete(key)
    return true
  },

  // Delete by pattern (e.g., 'products:*')
  delPattern: async (pattern) => {
    try {
      if (redisClient && redisClient.status === 'ready') {
        const keys = await redisClient.keys(pattern)
        if (keys.length > 0) {
          await redisClient.del(keys)
        }
      }
    } catch (err) {
      // fallback
    }
    for (const k of memoryStore.keys()) {
      if (k.startsWith(pattern.replace('*', ''))) {
        memoryStore.delete(k)
      }
    }
    return true
  },
}

export default cacheService
