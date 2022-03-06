
FROM golang:latest as builder
WORKDIR /usr/temp
ADD /wait-ip/wait-ip.go /usr/temp
RUN go build wait-ip.go  

FROM node:16

WORKDIR /usr/src
COPY --from=builder /usr/temp/wait-ip wait-ip

# COPY *.js .
# COPY *.json .
# COPY node_modules /usr/src/app/node_modules
EXPOSE 3000
# RUN chmod 777 wait-ip

# ENTRYPOINT node index.js
# ENTRYPOINT ./wait-ip db:3306 10 && node index.js
# ENTRYPOINT ./wait-ip db:3306 10
# CMD ["wait-ip", "challenge2-network:3306"]
# CMD ["node", "index.js"]