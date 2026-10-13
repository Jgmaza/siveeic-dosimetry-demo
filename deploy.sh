#!/bin/sh

# Verificar argumentos
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <path-to-docker-compose.yml> <server-address>"
  exit 1
fi

DOCKER_COMPOSE_FILE=$1
SERVER=$2

# Asegurando que el archivo docker compose existe
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
  echo "Error: No se encuentra el archivo $DOCKER_COMPOSE_FILE"
  exit 1
fi

# Verificando si se define la IP del servidor de destino
if [ -z "$SERVER" ]; then
  echo "Error: La variable Server no esta definida. Ingrese la direccion IP."
  exit 1
fi

IMAGE_NAME=$(grep -oP 'image:\s*\K.*' "$DOCKER_COMPOSE_FILE" | head -n 1)

if [ -z "$IMAGE_NAME" ]; then
  echo "Error: No se ha definido un nombre de imagen en el archivo docker compose."
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d%H%M%S)

# Extraer el nombre de la imagen definida en el archivo docker compose
BASE_IMAGE_NAME=$(grep -oP 'image:\s*\K.*' "$DOCKER_COMPOSE_FILE" | head -n 1 | cut -d':' -f1)

if [ -z "$BASE_IMAGE_NAME" ]; then
  echo "Error: No se ha definido un nombre de imagen en el archivo docker compose."
  exit 1
fi

IMAGE_NAME="${BASE_IMAGE_NAME}:${TIMESTAMP}"

echo "Construyendo imagen: $IMAGE_NAME"
docker compose -f "$DOCKER_COMPOSE_FILE" build

if [ $? -ne 0 ]; then
  echo "Error: Construyendo la imagen Docker."
  exit 1
fi

docker tag "$BASE_IMAGE_NAME" "$IMAGE_NAME"

echo "Guardando la imagen $IMAGE_NAME como .tar..."
docker save "$BASE_IMAGE_NAME" -o /tmp/"$TIMESTAMP".tar

if [ $? -ne 0 ]; then
  echo "Error: No fue posible guardar la imagen en .tar."
  exit 1
fi

echo "Copiando la imagen Docker en el servidor.."
scp /tmp/"$TIMESTAMP".tar "$SERVER":srv/siveeic_frontend_dev/

if [ $? -ne 0 ]; then
  echo "Error: Fallo la copia de la imagen al servidor."
  exit 1
fi

cp $DOCKER_COMPOSE_FILE /tmp/

sed -i 's|image: $BASE_IMAGE_NAME|image: $IMAGE_NAME|g' /tmp/$DOCKER_COMPOSE_FILE

echo "Copiando archivo docker compose al servidor..."
scp /tmp/"$DOCKER_COMPOSE_FILE" "$SERVER":srv/siveeic_frontend_dev/

if [ $? -ne 0 ]; then
  echo "Error: Fallo la copia del archivo docker-compose al servidor."
  exit 1
fi

# Limpiando archivos temporales
# rm /tmp/$TIMESTAMP.tar
# rm /tmp/$DOCKER_COMPOSE_FILE

echo "Despliegue terminado con exito."
