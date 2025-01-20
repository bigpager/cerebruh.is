FROM rust:alpine as builder

# Install build dependencies
RUN apk add --no-cache git musl-dev openssl-dev pkgconfig

# Clone and build BWS
RUN git clone https://github.com/bitwarden/sdk.git /sdk
WORKDIR /sdk
RUN cargo build --release -p bws && \
    mv target/release/bws /usr/local/bin/ && \
    chmod +x /usr/local/bin/bws

FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache jq

# Create directory for secrets
RUN mkdir -p /secrets

# Copy the built BWS binary from builder
COPY --from=builder /usr/local/bin/bws /usr/local/bin/bws

# Copy entrypoint script
COPY bws-init/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]