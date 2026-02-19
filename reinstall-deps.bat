@echo off
REM Script para reinstalar dependências no Windows
REM Remove node_modules e package-lock.json antes de reinstalar

echo 🔄 Reinstalando dependências do iN!Time...
echo.

REM Cliente
echo 📦 1/5 - Cliente (React + Vite)
cd client
if exist node_modules (
  echo   🗑️  Removendo node_modules...
  rmdir /s /q node_modules
)
if exist package-lock.json (
  echo   🗑️  Removendo package-lock.json...
  del package-lock.json
)
echo   📥 Instalando dependências...
call npm install
echo   ✅ Cliente concluído!
echo.
cd ..

REM Server (Scripts)
echo 📦 2/5 - Server (Scripts administrativos)
cd server
if exist node_modules (
  echo   🗑️  Removendo node_modules...
  rmdir /s /q node_modules
)
if exist package-lock.json (
  echo   🗑️  Removendo package-lock.json...
  del package-lock.json
)
echo   📥 Instalando dependências...
call npm install
echo   ✅ Server concluído!
echo.
cd ..

REM Shared
echo 📦 3/5 - Shared (Bibliotecas compartilhadas)
cd server\shared
if exist node_modules (
  echo   🗑️  Removendo node_modules...
  rmdir /s /q node_modules
)
if exist package-lock.json (
  echo   🗑️  Removendo package-lock.json...
  del package-lock.json
)
echo   📥 Instalando dependências...
call npm install
echo   ✅ Shared concluído!
echo.
cd ..\..

REM API Gateway
echo 📦 4/5 - API Gateway
cd server\api-gateway
if exist node_modules (
  echo   🗑️  Removendo node_modules...
  rmdir /s /q node_modules
)
if exist package-lock.json (
  echo   🗑️  Removendo package-lock.json...
  del package-lock.json
)
echo   📥 Instalando dependências...
call npm install
echo   ✅ API Gateway concluído!
echo.
cd ..\..

REM Auth Service
echo 📦 5/5 - Auth Service
cd server\services\auth-service
if exist node_modules (
  echo   🗑️  Removendo node_modules...
  rmdir /s /q node_modules
)
if exist package-lock.json (
  echo   🗑️  Removendo package-lock.json...
  del package-lock.json
)
echo   📥 Instalando dependências...
call npm install
echo   ✅ Auth Service concluído!
echo.
cd ..\..\..

echo.
echo ✨ Todas as dependências foram reinstaladas com sucesso!
echo.
echo 🎉 Concluído!
pause
