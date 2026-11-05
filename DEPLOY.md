# 🚀 Guía de Despliegue - eMCi labs

Este documento explica cómo subir y actualizar el sitio web en el servidor de producción (`https://emcilabs.com`).

---

## ⚡ Despliegue Rápido (1 solo paso)

### En Windows:
Haz doble clic en:
```text
deploy.bat
```
O desde la terminal (PowerShell):
```powershell
.\deploy.ps1
```

### En Mac / Linux / Git Bash:
Ejecuta en tu terminal:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔍 ¿Qué hace el script de despliegue?
1. **Comprueba tu Git local:** Te avisa si tienes archivos pendientes por commitear.
2. **Sube a GitHub:** Ejecuta `git push origin main` para que el repositorio remoto quede actualizado.
3. **Conecta al servidor por SSH:** Ingresa a `root@89.117.51.32`.
4. **Actualiza los archivos:** Entra a `/var/www/mclabs` y descarga los cambios con `git pull origin main`.
5. **Ajusta permisos:** Asigna los permisos correctos a `www-data:www-data` (Nginx).
6. **Recarga Nginx:** Aplica los cambios de inmediato sin desconectar a los usuarios.
7. **Verifica el sitio:** Hace una petición HTTP a `https://emcilabs.com` confirmando `200 OK`.

---

## 🔑 Requisito para tu compañero: Acceso SSH al Servidor

Para que tu compañero pueda ejecutar el script, su computador necesita tener permiso para conectarse al servidor (`89.117.51.32`).

### Paso 1: Generar su llave SSH (si no la tiene)
En su computadora (PowerShell o Terminal), debe ejecutar:
```bash
ssh-keygen -t ed25519 -C "su-email@emcilabs.com"
```
*(Presionar Enter a todo para usar la ruta por defecto `~/.ssh/id_ed25519`)*.

### Paso 2: Copiar su clave pública
Que abra su archivo público:
- En Windows: `notepad $HOME\.ssh\id_ed25519.pub`
- En Mac/Linux: `cat ~/.ssh/id_ed25519.pub`

### Paso 3: Agregarla al servidor
Copiar esa línea y agregarla dentro del archivo `/root/.ssh/authorized_keys` en el servidor:
```bash
ssh root@89.117.51.32 "echo 'PEGAR_AQUI_LA_CLAVE_PUBLICA' >> /root/.ssh/authorized_keys"
```
¡Y listo! Ya podrá ejecutar `deploy.bat` o `deploy.sh` directamente.

---

## 🛠️ Despliegue Manual (Fallback)

Si prefieren hacer el despliegue manualmente sin scripts:

1. Sube tus cambios a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push origin main
   ```

2. Conéctate al servidor y actualiza:
   ```bash
   ssh root@89.117.51.32 "cd /var/www/mclabs && git pull origin main && chown -R www-data:www-data /var/www/mclabs && systemctl reload nginx"
   ```
