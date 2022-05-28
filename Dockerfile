FROM node:17-alpine

ENV WORKDIR=/code
WORKDIR ${WORKDIR}

RUN npm i -g pnpm && \
  apk add --no-cache curl && \
  curl -fsSL -o /usr/local/bin/dbmate https://github.com/amacneil/dbmate/releases/download/v1.15.0/dbmate-linux-amd64 && \
  chmod +x /usr/local/bin/dbmate

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm i

ADD . .

RUN pnpm run build

CMD ["pnpm", "run", "start"]
