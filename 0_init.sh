# This script copies the environment variables file to a local version, and generates a random storage name
cp 2_env.sh 2_env.$1.sh
RANDOM_SUFFIX=$(head /dev/urandom | tr -dc a-z0-9 | head -c5)
sed -i "/export BUCKET_NAME=marketplace-/c\export BUCKET_NAME=marketplace-$RANDOM_SUFFIX" 2_env.$1.sh
sed -i "/export PROJECT_ID=/c\export PROJECT_ID=$1" 2_env.$1.sh