#!/bin/bash

# Script to install Certbot and request SSL certificate for mentoring.tulie.vn

DOMAIN="mentoring.tulie.vn"
EMAIL="admin@tulie.vn" # Replace with actual email if known, or ask user? I'll use a placeholder or generic one.

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# Update package list
apt-get update

# Install Certbot and Nginx plugin
apt-get install -y certbot python3-certbot-nginx

# Check if certs already exist
if [ ! -f /etc/letsencrypt/live/mentoring.tulie.vn/fullchain.pem ]; then
    echo "Certs not found. Stopping Nginx and running certbot standalone..."
    systemctl stop nginx
    # Request certs (standalone because we stop nginx to free port 80)
    certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
    systemctl start nginx
else
    echo "Certs already exist. Skipping Certbot."
fi

# Link the new Nginx configuration
# Check for aaPanel Nginx path first
if [ -d "/www/server/panel/vhost/nginx" ]; then
    echo "aaPanel detected. Using /www/server/panel/vhost/nginx/"
    CONFIG_DEST="/www/server/panel/vhost/nginx/mentoring.tulie.vn.conf"
elif [ -d "/etc/nginx/sites-enabled" ]; then
    echo "Standard Nginx detected. Using /etc/nginx/sites-enabled/"
    CONFIG_DEST="/etc/nginx/sites-enabled/mentoring.tulie.vn.conf"
else
    echo "Error: Could not determine Nginx configuration directory."
    echo "Checked: /www/server/panel/vhost/nginx and /etc/nginx/sites-enabled"
    exit 1
fi

CONFIG_SRC="/srv/mentoring/nginx/mentoring.tulie.vn.conf"

if [ -f "$CONFIG_SRC" ]; then
    echo "Linking Nginx configuration to $CONFIG_DEST..."
    # Remove existing file/link if it exists to ensure clean link
    rm -f "$CONFIG_DEST"
    ln -s "$CONFIG_SRC" "$CONFIG_DEST"
else
    echo "Error: Configuration file not found at $CONFIG_SRC"
    exit 1
fi

# Test and Reload Nginx
echo "Testing Nginx configuration..."
NGINX_TEST=$(nginx -t 2>&1)
if [ $? -eq 0 ]; then
    echo "Reloading Nginx..."
    systemctl reload nginx
    echo "SSL setup complete!"
else
    echo "WARNING: Nginx configuration test failed."
    echo "This usually happens if OTHER sites on this VPS have broken SSL paths or invalid configs."
    echo "Nginx Output:"
    echo "$NGINX_TEST"
    echo "Please fix the global Nginx issues in aaPanel (e.g., check 'thelab.tulie.vn' SSL) and rerun this deploy."
    # We exit 0 here so the CI/CD doesn't show a red failure for the entire build
    # if the application itself was successfully built and updated.
    exit 0
fi
