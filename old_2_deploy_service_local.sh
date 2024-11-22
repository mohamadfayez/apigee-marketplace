# Build app
npm run build

# Build and run docker image
docker build -t data-marketplace .
docker run -it -p 8080:3000 data-marketplace