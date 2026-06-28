# Start Postgres 
docker compose --profile postgres up -d
docker compose --profile postgres --profile postgres down

# Start Redis
docker compose --profile redis up -d
docker compose --profile redis --profile redis down

# Start Backend API
docker compose --profile backend up -d
docker compose --profile backend down
