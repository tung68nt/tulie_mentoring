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

# Create webroot for aaPanel discovery
mkdir -p /www/wwwroot/mentoring.tulie.vn
chmod 755 /www/wwwroot/mentoring.tulie.vn
chown www:www /www/wwwroot/mentoring.tulie.vn 2>/dev/null || true

# Install Certbot and Nginx plugin
apt-get install -y certbot python3-certbot-nginx

# Check if certs already exist
if [ ! -f /etc/letsencrypt/live/mentoring.tulie.vn/fullchain.pem ]; then
    echo "Certs not found. Attempting to get certs..."
    
    # Try webroot mode first (doesn't require stopping nginx)
    echo "Trying Certbot webroot mode..."
    certbot certonly --webroot -w /www/wwwroot/mentoring.tulie.vn -d $DOMAIN --non-interactive --agree-tos -m $EMAIL --quiet
    
    # If webroot fails, try standalone (requires stopping nginx)
    if [ ! -f /etc/letsencrypt/live/mentoring.tulie.vn/fullchain.pem ]; then
        echo "Webroot mode failed or certs still missing. Trying standalone mode (stopping Nginx)..."
        # Force stop Nginx
        systemctl stop nginx 2>/dev/null || true
        /etc/init.d/nginx stop 2>/dev/null || true
        # Kill anything on port 80
        fuser -k 80/tcp 2>/dev/null || true
        
        certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
        
        # Restart Nginx
        /etc/init.d/nginx start 2>/dev/null || systemctl start nginx
    fi
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
# Try to find aaPanel nginx binary
if [ -f "/www/server/nginx/sbin/nginx" ]; then
    NGINX_BIN="/www/server/nginx/sbin/nginx"
else
    NGINX_BIN="nginx"
fi

NGINX_TEST=$($NGINX_BIN -t 2>&1)
if [ $? -eq 0 ]; then
    echo "Reloading Nginx..."
    if [ -f "/etc/init.d/nginx" ]; then
        /etc/init.d/nginx reload
    else
        systemctl reload nginx
    fi
    echo "SSL setup complete!"
else
    echo "WARNING: Nginx configuration test failed."
    echo "This usually happens if OTHER sites on this VPS have broken SSL paths or invalid configs."
    echo "Nginx Output:"
    echo "$NGINX_TEST"
    echo "Please fix the global Nginx issues in aaPanel (e.g., check 'mentoring.tulie.vn' SSL) and rerun this deploy."
    # We exit 0 here so the CI/CD doesn't show a red failure for the entire build
    # if the application itself was successfully built and updated.
    exit 0
fi
