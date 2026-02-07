@echo off
echo ========================================
echo Installation du serveur MCP de documentation
echo ========================================
echo.

REM Vérifier que Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé
    echo Téléchargez-le depuis https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js détecté
node --version
echo.

REM Vérifier que npm est installé
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] npm n'est pas installé
    pause
    exit /b 1
)

echo [OK] npm détecté
npm --version
echo.

echo ========================================
echo Installation des dépendances...
echo ========================================
echo.

REM Installer les dépendances une par une
echo [1/4] Installation de @modelcontextprotocol/sdk...
call npm install @modelcontextprotocol/sdk
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de l'installation du SDK MCP
    pause
    exit /b 1
)

echo [2/4] Installation de zod...
call npm install zod
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de l'installation de zod
    pause
    exit /b 1
)

echo [3/4] Installation de typescript...
call npm install --save-dev typescript
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de l'installation de TypeScript
    pause
    exit /b 1
)

echo [4/4] Installation de @types/node...
call npm install --save-dev @types/node
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de l'installation des types Node.js
    pause
    exit /b 1
)

echo.
echo ========================================
echo Compilation du projet TypeScript...
echo ========================================
echo.

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Échec de la compilation
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation terminée avec succès !
echo ========================================
echo.
echo Le serveur MCP est prêt à être utilisé.
echo.
echo Prochaines étapes :
echo 1. Configurez Claude Desktop (voir QUICKSTART.md)
echo 2. Redémarrez Claude Desktop
echo 3. Testez avec : "Quelles catégories de documentation sont disponibles ?"
echo.
pause
