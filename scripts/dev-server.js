#!/usr/bin/env node

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const net = require('net')
const os = require('os')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Function to get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

// Function to check if port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true)
      })
      server.close()
    })
    
    server.on('error', () => {
      resolve(false)
    })
  })
}

// Function to find an available port starting from a given port
async function findAvailablePort(startPort = 3000) {
  let port = startPort
  
  while (port < startPort + 100) { // Check up to 100 ports
    if (await isPortAvailable(port)) {
      return port
    }
    port++
  }
  
  throw new Error(`No available port found between ${startPort} and ${startPort + 99}`)
}

async function startServer() {
  try {
    console.log('🚀 Starting development server...')
    
    // Find available port
    const port = await findAvailablePort(3000)
    
    if (port !== 3000) {
      console.log(`⚠️  Port 3000 is in use, using port ${port} instead`)
    }
    
    await app.prepare()
    
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })
    
    server.listen(port, '0.0.0.0', (err) => {
      if (err) throw err
      const localIP = getLocalIP()
      console.log(`✅ Ready on http://localhost:${port}`)
      console.log(`📱 Mobile/Network access: http://${localIP}:${port}`)
      console.log(`📝 Logs are being written to dev.log`)
    })
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down server...')
      server.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })
    
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...')
      server.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })
    
  } catch (error) {
    console.error('❌ Error starting server:', error)
    process.exit(1)
  }
}

startServer()