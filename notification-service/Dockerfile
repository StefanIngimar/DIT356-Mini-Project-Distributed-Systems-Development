FROM rust:bookworm AS builder

RUN apt-get update && apt-get install -y cmake libsqlite3-dev pkg-config libssl-dev

WORKDIR /app

COPY . .

RUN cargo build --release


FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y libsqlite3-0 libssl3

COPY --from=builder /app/target/release/notification-service ./
COPY --from=builder /app/data/main.db ./data/main.db

EXPOSE 1883
EXPOSE 9001

CMD ["./notification-service"]
