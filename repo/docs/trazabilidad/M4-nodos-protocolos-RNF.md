# M4 · Nodos de Despliegue → Protocolos → RNF → Componentes

| Nodo | Nombre | Protocolo | RNF Justifica | Componentes |
|------|--------|-----------|---------------|-------------|
| NOD-01 | Dispositivo Cliente | HTTPS 443 | RNF-009,010,014 | Navegador, App Responsiva HTML/CSS/JS |
| NOD-02 | Reverse Proxy (Nginx) | HTTPS→HTTP 3000 | RNF-003,008 | nginx.conf, SSL/TLS 1.3, Enrutamiento |
| NOD-03 | Servidor Aplicación | HTTP 3000, TCP 5432 | RNF-001,002,004,005,011 | API REST, Auth JWT+bcrypt, Motor Retroalim. |
| NOD-04 | Servidor BD (PostgreSQL) | TCP 5432 | RNF-012,015 | Esquema 3FN, Réplica, Backup diario |
| NOD-05 | Almacenamiento S3 | HTTPS S3 API | RNF-013 | Bucket multimedia, Bucket reportes |
| NOD-06 | Monitoreo (UptimeRobot) | HTTP Webhooks | RNF-003,005 | Monitor 24/7, Log seguridad, Alertas |
| NOD-07 | CI/CD (GitHub Actions) | SSH / GitHub API | RNF-011 | Código fuente, Pipeline, Docker, Deploy |
