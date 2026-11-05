param (
    [string]$Server = "89.117.51.32",
    [string]$User = "root",
    [int]$Port = 22,
    [string]$RemotePath = "/var/www/mclabs",
    [string]$KeyPath = "",
    [switch]$SkipPush = $false
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n====> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host " [OK] $Message" -ForegroundColor Green
}

function Write-WarningMsg {
    param([string]$Message)
    Write-Host " [!] $Message" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host " [X] $Message" -ForegroundColor Red
}

Clear-Host
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "       eMCi labs - Deploy Automático      " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Servidor destino: $User@$($Server):$RemotePath`n"

# 1. Comprobar estado local de Git
Write-Step "Paso 1: Verificando cambios locales en Git..."
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-WarningMsg "Tienes cambios locales sin commitear:"
    git status -s
    $confirm = Read-Host "¿Deseas continuar sin subir estos cambios locales? (s/n)"
    if ($confirm -ne 's' -and $confirm -ne 'S') {
        Write-ErrorMsg "Despliegue cancelado. Realiza commit y vuelve a intentar."
        exit 1
    }
} else {
    Write-Success "Árbol local de trabajo limpio."
}

# 2. Subir cambios a GitHub si no se salta el push
if (-not $SkipPush) {
    Write-Step "Paso 2: Subiendo últimos cambios locales a GitHub (git push origin main)..."
    try {
        git push origin main
        Write-Success "Cambios sincronizados en GitHub."
    } catch {
        Write-WarningMsg "No se pudo realizar el push o ya estaba actualizado. Continuando..."
    }
} else {
    Write-WarningMsg "Paso 2 omitido (-SkipPush activado)."
}

# 3. Detectar clave SSH
Write-Step "Paso 3: Configurando conexión SSH..."
$sshArgs = @("-p", "$Port", "-o", "StrictHostKeyChecking=accept-new")

if ($KeyPath -ne "" -and (Test-Path $KeyPath)) {
    $sshArgs += @("-i", $KeyPath)
    Write-Host "Usando llave SSH especificada: $KeyPath"
} else {
    # Buscar llaves comunes en el directorio del usuario
    $homeSSH = Join-Path $HOME ".ssh"
    $candidateKeys = @(
        (Join-Path $homeSSH "id_ed25519"),
        (Join-Path $homeSSH "id_rsa_contabo"),
        (Join-Path $homeSSH "id_rsa"),
        (Join-Path $homeSSH "id_contabo")
    )
    foreach ($k in $candidateKeys) {
        if (Test-Path $k) {
            $sshArgs += @("-i", $k)
            Write-Host "Llave SSH detectada: $k"
            break
        }
    }
}

# 4. Ejecutar comandos remotos en el servidor
Write-Step "Paso 4: Actualizando servidor de producción ($Server)..."
$remoteCommand = "cd $RemotePath && git pull origin main && chown -R www-data:www-data $RemotePath && chmod -R 755 $RemotePath && systemctl reload nginx && echo 'DEPLOY_COMPLETE_OK'"

$sshTarget = "$User@$Server"
$allArgs = $sshArgs + @($sshTarget, $remoteCommand)

Write-Host "Ejecutando en servidor remoto: git pull origin main & recarga de nginx..."
& ssh $allArgs
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "El comando SSH falló (Código de salida: $LASTEXITCODE)."
    Write-WarningMsg "Si no tienes llave SSH agregada al servidor, pídele al administrador que agregue tu clave pública en /root/.ssh/authorized_keys."
    exit $LASTEXITCODE
}

# 5. Verificación de salud HTTP
Write-Step "Paso 5: Verificando estado del sitio web (https://emcilabs.com)..."
try {
    $response = Invoke-WebRequest -Uri "https://emcilabs.com" -Method Head -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "El sitio responde correctamente (HTTP 200 OK)."
    } else {
        Write-WarningMsg "El sitio respondió con código: $($response.StatusCode)"
    }
} catch {
    Write-WarningMsg "No se pudo verificar automáticamente por HTTP: $_"
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "   ¡Despliegue completado exitosamente!   " -ForegroundColor Green
Write-Host "   Sitio en vivo: https://emcilabs.com    " -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Green
