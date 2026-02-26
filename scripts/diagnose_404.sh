#!/bin/bash

# Diagnostic script for mentoring.tulie.vn 404 error

echo "Checking Docker containers..."
docker ps | grep mentoring

echo -e "\nChecking container logs (last 50 lines)..."
docker logs --tail 50 mentoring_app

echo -e "\nChecking port 3002 on host..."
netstat -tulpn | grep 3002 || ss -tulpn | grep 3002

echo -e "\nTesting local response from app via curl..."
curl -I http://127.0.0.1:3002

echo -e "\nChecking Nginx status..."
systemctl status nginx || /etc/init.d/nginx status

echo -e "\nChecking Nginx config file existence..."
ls -l /www/server/panel/vhost/nginx/mentoring.tulie.vn.conf 2>/dev/null || ls -l /etc/nginx/sites-enabled/mentoring.tulie.vn.conf 2>/dev/null
