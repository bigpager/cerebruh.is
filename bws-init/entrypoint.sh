#!/bin/sh
set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

init_bitwarden() {
    log "Configuring Bitwarden CLI..."
    bws config server-api https://api.bitwarden.com || log "Warning: Could not set API server"
    bws config server-identity https://identity.bitwarden.com || log "Warning: Could not set identity server"
}

setup_secrets_dir() {
    log "Setting up secrets directory..."
    mkdir -p /secrets/env.d

    # If .env already exists, backup and start fresh
    if [ -f /secrets/.env ]; then
        mv /secrets/.env "/secrets/.env.$(date +%Y%m%d_%H%M%S).bak"
    fi

    touch /secrets/.env
}

fetch_secrets() {
    log "Fetching CBRUH_ secrets..."

    # Fetch all secrets in a single operation
    secrets_json=$(bws secret list --output json)
    if [ $? -ne 0 ]; then
        log "Error: Failed to fetch secrets list"
        return 1
    fi

    # Process all secrets in one jq operation
    echo "$secrets_json" | jq -r '.[] |
        select(.key | startswith("CBRUH_")) |
        .key + "=" + .value' > /secrets/.env
    if [ $? -ne 0 ]; then
        log "Error: Failed to process secrets"
        return 1
    fi

    # Count processed secrets
    secret_count=$(wc -l < /secrets/.env)
    log "Processed $secret_count secrets"

    if [ "$secret_count" -eq 0 ]; then
        log "Warning: No CBRUH_ secrets found"
        return 1
    fi

    return 0
}

set_default_secret() {
    log "Setting default CBRUH_WZUP..."
    echo "CBRUH_WZUP=error-in-development" >> /secrets/.env
}

finalize_secrets() {
    # Ensure readable permissions
    chmod 644 /secrets/.env

    # Verify file is not empty
    if [ ! -s /secrets/.env ]; then
        log "Error: Secrets file is empty"
        return 1
    fi

    # Show summary of secrets (keys only)
    log "Secrets loaded:"
    grep -o '^CBRUH_[^=]*' /secrets/.env | sed 's/^/  /'
}

main() {
    log "Starting bws-init..."

    init_bitwarden
    setup_secrets_dir

    if ! fetch_secrets; then
        set_default_secret
    fi

    finalize_secrets

    log "bws-init completed successfully!"
}

main "$@"