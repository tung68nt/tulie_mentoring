#!/bin/bash

# Script to setup 4GB Swap memory on the VPS
SWAP_FILE="/swapfile"
SWAP_SIZE="4G"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

if [ -f "$SWAP_FILE" ]; then
    echo "Swap file already exists at $SWAP_FILE. Skipping."
    exit 0
fi

echo "Creating ${SWAP_SIZE} swap file at ${SWAP_FILE}..."
fallocate -l $SWAP_SIZE $SWAP_FILE || dd if=/dev/zero of=$SWAP_FILE bs=1M count=4096

echo "Setting permissions..."
chmod 600 $SWAP_FILE

echo "Setting up swap space..."
mkswap $SWAP_FILE

echo "Enabling swap..."
swapon $SWAP_FILE

echo "Adding swap to /etc/fstab for persistence..."
echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab

echo "Current swap status:"
swapon --show
free -h

echo "Swap setup complete!"
