@echo off
set "MONGODB_URI=mongodb://localhost:27017/banking-system"
set "JWT_SECRET=ApexGlobalB@nk2024_SecureSecret"
set "PORT_AUTH=5002"
set "PORT_USER=5003"
set "PORT_TRANS=5001"
set "PORT_GATEWAY=3000"

echo 🏦 Starting Apex Global Bank Microservices...
echo 🔑 Shared Secret: %JWT_SECRET%

:: Clear ports first
echo 🧹 Clearing existing ports...
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force" 2>nul
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess -Force" 2>nul
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5002).OwningProcess -Force" 2>nul
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5003).OwningProcess -Force" 2>nul

:: Start the services
start "API GATEWAY" cmd /k "set JWT_SECRET=%JWT_SECRET% && cd api-gateway && node server.js"
start "AUTH SERVICE" cmd /k "set JWT_SECRET=%JWT_SECRET% && cd auth-service && node server.js"
start "USER SERVICE" cmd /k "set JWT_SECRET=%JWT_SECRET% && cd user-service && node server.js"
start "TRANSACTION SERVICE" cmd /k "set JWT_SECRET=%JWT_SECRET% && cd transaction-service && node server.js"
start "NOTIFICATION SERVICE" cmd /k "cd notification-service && node server.js"

echo ✅ All services launched!
echo 🚀 Please refresh your browser or RE-LOGIN.
