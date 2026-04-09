# AWS EC2 Monolith Quick Deploy (Fast + Minimal)

This deploys your current repo on one EC2 machine as a single-host setup:
- `identity-service` on `:3015`
- `api-gateway` on `:3000` (internal behind Nginx)
- `customer-portal` on `:3005` (public via Nginx on `:80`)
- `admin-dashboard` on `:3006` (optional direct port)

For minimum cost, use MongoDB Atlas free tier (M0) instead of running MongoDB on EC2.

## 1) Create EC2 (AWS Console)

- AMI: `Ubuntu 24.04 LTS`
- Instance type: `t3.small` (recommended minimum for stability)
- Storage: `20 GB gp3`
- Security Group inbound:
  - `22` from your IP only
  - `80` from `0.0.0.0/0`
  - `3006` from your IP only (optional, for admin dashboard)

## 2) SSH and install runtime

```bash
ssh -i <your-key>.pem ubuntu@<EC2_PUBLIC_IP>
sudo apt update && sudo apt -y upgrade
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs git nginx
sudo npm i -g pm2
node -v
npm -v
```

## 3) Get project code and install

```bash
cd /home/ubuntu
git clone <YOUR_REPO_URL> E-C
cd E-C
npm ci
npm run build --workspace=services/identity-service
npm run build --workspace=frontend/customer-portal
npm run build --workspace=frontend/admin-dashboard
npm run build --workspace=services/api-gateway
```

## 4) Configure PM2 env file

```bash
cp ecosystem.ec2.monolith.config.cjs ecosystem.config.cjs
nano ecosystem.config.cjs
```

Update these values:
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_PASSWORD`
- `CORS_ORIGIN`
- `NEXT_PUBLIC_API_BASE_URL`
- `IDENTITY_SERVICE_URL`
- Replace `REPLACE_WITH_EC2_PUBLIC_IP_OR_DOMAIN` with your EC2 IP or domain

## 5) Start services with PM2

```bash
cd /home/ubuntu/E-C
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 status
```

## 6) Nginx reverse proxy (public site on port 80)

Create config:

```bash
sudo tee /etc/nginx/sites-available/e-c >/dev/null <<'EOF'
server {
  listen 80 default_server;
  server_name _;

  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /health {
    proxy_pass http://127.0.0.1:3000/health;
  }

  location / {
    proxy_pass http://127.0.0.1:3005;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
EOF
```

Enable and reload:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/e-c /etc/nginx/sites-enabled/e-c
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 7) Verify

```bash
curl http://127.0.0.1:3000/health
curl http://127.0.0.1/health
pm2 logs --lines 100
```

Open:
- Customer site: `http://<EC2_PUBLIC_IP>`
- Admin: `http://<EC2_PUBLIC_IP>:3006` (if allowed in Security Group)

## 8) Lowest-resource mode (optional)

If RAM gets tight, disable admin dashboard:

```bash
pm2 stop admin-dashboard
pm2 save
```

## Common quick fixes

- `502 Bad Gateway`: app not running on expected port, check `pm2 logs`.
- `Missing required environment variable`: fix `ecosystem.config.cjs`, then:
  - `pm2 restart all --update-env`
- CORS/API errors in browser:
  - ensure `NEXT_PUBLIC_API_BASE_URL` and `CORS_ORIGIN` both point to your public URL.
