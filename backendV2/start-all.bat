@echo off
echo ============================================
echo  LARASANA Microservices - Starting All
echo ============================================
echo.

start "Notification    :3007" cmd /k "npm run start:notification"
timeout /t 2 /nobreak > nul

start "Auth Service    :3001" cmd /k "npm run start:auth"
timeout /t 2 /nobreak > nul

start "Users Service   :3002" cmd /k "npm run start:users"
timeout /t 2 /nobreak > nul

start "Orders Service  :3003" cmd /k "npm run start:orders"
timeout /t 2 /nobreak > nul

start "Products Service:3004" cmd /k "npm run start:products"
timeout /t 2 /nobreak > nul

start "Payments Service:3005" cmd /k "npm run start:payments"
timeout /t 2 /nobreak > nul

start "Admin Service   :3006" cmd /k "npm run start:admin"
timeout /t 2 /nobreak > nul

start "Favorites       :3008" cmd /k "npm run start:favorites"
timeout /t 2 /nobreak > nul

start "Addresses       :3009" cmd /k "npm run start:addresses"
timeout /t 2 /nobreak > nul

start "Shipping        :3010" cmd /k "npm run start:shipping"
timeout /t 2 /nobreak > nul

timeout /t 3 /nobreak > nul
start "API Gateway     :3000" cmd /k "npm run start:gateway"

echo.
echo All 11 services starting!
echo Swagger: http://localhost:3000/api/docs
pause
