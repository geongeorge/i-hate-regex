FROM alpine:latest
EXPOSE 3600/tcp
RUN apk update && apk add yarn
COPY ./ ./i-hate-regex/
WORKDIR /i-hate-regex/
RUN chmod +x entrypoint.sh && mv entrypoint.sh / && sed -i 's/localhost/0.0.0.0/g' nuxt.config.js && yarn install && yarn build
ENTRYPOINT ["/entrypoint.sh"]
