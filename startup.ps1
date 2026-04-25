# Final Banking System Startup Script
# This will open 8 separate PowerShell windows so you can monitor all services.

Write-Host "Starting Banking System..." -ForegroundColor Cyan

# 1. API Gateway (Port 8080)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api-gateway; node server.js"
Write-Host "Launched API Gateway..."

# 2. Auth Service (Port 5002)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd auth-service; node server.js"
Write-Host "Launched Auth Service..."

# 3. User Service (Port 5003)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd user-service; node server.js"
Write-Host "Launched User Service..."

# 4. Transaction Service (Port 5001)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd transaction-service; node server.js"
Write-Host "Launched Transaction Service..."

# 5. Notification Service (Port 5004)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd notification-service; node server.js"
Write-Host "Launched Notification Service..."

# 6. Fraud Service (Port 5005)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd fraud-service; node server.js"
Write-Host "Launched Fraud Service..."

# 7. Audit Service (Port 5006)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd audit-service; node server.js"
Write-Host "Launched Audit Service..."

# 8. Frontend (Vite)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Write-Host "Launched Frontend..."

Write-Host "All services have been launched! Please wait for them to initialize." -ForegroundColor Green
