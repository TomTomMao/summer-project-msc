# Dockerfile
# from: https://blog.devops.dev/using-next-js-13-app-directory-with-hot-reload-enabled-in-docker-simple-guide-60de42840d7e
# **********
# base stage
# **********
FROM node:20.9.0-alpine AS base

WORKDIR /app

# **********
# deps stage
# **********
FROM base AS deps

# Copy package.json to /app
COPY package.json ./

# Copy available lock file
COPY serverConfig.json package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Instal dependencies according to the lockfile
RUN if [ -f "pnpm-lock.yaml" ]; then \
        npm install -g pnpm && \
        pnpm install; \
    elif [ -f "yarn.lock" ]; then \
        npm install -g yarn && \
        yarn install; \
    elif [ -f "package-lock.json" ]; then \
        npm install; \
    else \
        npm install; \
        # If you want to throw error on lockfile not being available, 
        # uncomment the following lines
        # echo "No Lockfile!"; \
        # exit 1; \
    fi

# Disable the telementary
ENV NEXT_TELEMETRY_DISABLED 1

# ***********
# inter stage
# ***********
FROM deps AS inter

# Copy all other files excluding the ones in .dockerignore
COPY . .

# exposing the port
EXPOSE 3000

# **********
# prod stage
# **********
FROM inter AS prod

RUN npm run build

CMD ["npm", "start"]

# **********
# dev stage
# **********
FROM inter AS dev

CMD ["npm", "run", "dev"]