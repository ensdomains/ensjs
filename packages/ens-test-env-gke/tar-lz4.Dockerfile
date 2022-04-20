FROM alpine:3.14
RUN apk add --no-cache tar
RUN apk add --no-cache lz4
RUN apk add --no-cache wget
ENTRYPOINT []