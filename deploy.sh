#!/usr/bin/env bash
set -e

SERVER="89.117.51.32"
USER="root"
PORT="22"
REMOTE_PATH="/var/www/mclabs"
SITE_URL="https://emcilabs.com"

echo "=========================================="
echo "       eMCi labs - Deploy Automático      "
echo "=========================================="
echo "Servidor: ${USER}@${SERVER}:${REMOTE_PATH}"
echo ""

# 1. Verificar cambios locales
echo "===> Paso 1: Verificando cambios locales en Git..."
if [ -n "$(git status --porcelain)" ]; then
    echo "[!] Tienes cambios locales pendientes sin commit:"
    git status -s
    read -p "¿Deseas continuar de todas formas? (s/n): " confirm
    if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
        echo "[X] Despliegue cancelado."
        exit 1
    fi
else
    echo "[OK] Árbol local de trabajo limpio."
fi

# 2. Subir a GitHub
echo "===> Paso 2: Subiendo cambios locales a GitHub (git push origin main)..."
git push origin main || echo "[!] Advertencia: No se pudo hacer push o ya estaba al día."

# 3. Detectar llave SSH
SSH_KEY_FLAG=""
if [ -f "$HOME/.ssh/id_ed25519" ]; then
    SSH_KEY_FLAG="-i $HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/id_rsa_contabo" ]; then
    SSH_KEY_FLAG="-i $HOME/.ssh/id_rsa_contabo"
elif [ -f "$HOME/.ssh/id_rsa" ]; then
    SSH_KEY_FLAG="-i $HOME/.ssh/id_rsa"
fi

# 4. Ejecutar comandos remotos
echo "===> Paso 3: Actualizando servidor de producción (${SERVER})..."
REMOTE_CMD="cd ${REMOTE_PATH} && git pull origin main && chown -R www-data:www-data ${REMOTE_PATH} && chmod -R 755 ${REMOTE_PATH} && systemctl reload nginx && echo 'DEPLOY_COMPLETE_OK'"

ssh -p ${PORT} -o StrictHostKeyChecking=accept-new ${SSH_KEY_FLAG} "${USER}@${SERVER}" "${REMOTE_CMD}"

# 5. Verificación HTTP
echo "===> Paso 4: Verificando respuesta HTTP de ${SITE_URL}..."
if curl -sI "${SITE_URL}" | grep -q "200 OK"; then
    echo "[OK] El sitio responde correctamente (HTTP 200 OK)."
else
    echo "[!] Advertencia: No se recibió HTTP 200 directo (revisar manualmente)."
fi

echo ""
echo "=========================================="
echo "   ¡Despliegue completado exitosamente!   "
echo "   Sitio en vivo: ${SITE_URL}             "
echo "=========================================="
