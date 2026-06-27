# Start Postgres and Redis separately
docker compose --profile postgres up -d
docker compose --profile redis up -d

# Stop Postgres and Redis
docker compose --profile postgres --profile postgres down
docker compose --profile redis --profile redis down

# Start Backend API
docker compose --profile backend up -d
docker compose --profile backend down
