# Production Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Environment Variables
- [ ] All `.env` files created from `.env.example`
- [ ] `NEXTAUTH_SECRET` is strong and unique (32+ characters)
- [ ] `NEXTAUTH_URL` points to production domain
- [ ] `DATABASE_URL` points to production database
- [ ] `OPENAI_API_KEY` is valid and has credits
- [ ] `AI_BACKEND_TOKEN` is strong and matches between services
- [ ] OAuth credentials are for production (not localhost)
- [ ] No sensitive data committed to Git

### Database
- [ ] Production database created (PostgreSQL 15+)
- [ ] Database backups configured
- [ ] Connection pooling enabled
- [ ] SSL/TLS enabled for database connections
- [ ] Run: `npx prisma migrate deploy`
- [ ] Verify all tables created
- [ ] Create initial admin user if needed

### Security
- [ ] HTTPS/SSL certificate installed
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] API authentication working
- [ ] Session security configured
- [ ] Environment variables not exposed to client
- [ ] Security headers configured
- [ ] SQL injection protection verified (Prisma handles this)

### Code Quality
- [ ] Run: `npm run lint` (no errors)
- [ ] Run: `npm run build` (successful)
- [ ] TypeScript errors resolved
- [ ] Remove console.logs from production code
- [ ] Error handling implemented
- [ ] Loading states for async operations

### Performance
- [ ] Images optimized
- [ ] Bundle size checked
- [ ] Database queries optimized
- [ ] Indexes added to frequently queried fields
- [ ] Caching strategy implemented
- [ ] CDN configured (if applicable)

## Deployment Steps

### Option 1: Docker Deployment

#### Build Images
- [ ] Build Next.js: `docker build -t entropy-nextjs .`
- [ ] Build AI Agent: `cd spark-ai-agent && docker build -t entropy-spark-ai .`
- [ ] Test images locally

#### Deploy with Docker Compose
- [ ] Update `docker-compose.yml` with production values
- [ ] Set environment variables in `.env`
- [ ] Run: `docker-compose up -d`
- [ ] Verify all containers running: `docker-compose ps`
- [ ] Check logs: `docker-compose logs -f`

### Option 2: Vercel + Railway

#### Deploy Next.js to Vercel
- [ ] Connect GitHub repository to Vercel
- [ ] Add all environment variables in Vercel dashboard
- [ ] Set `NEXTAUTH_URL` to Vercel domain
- [ ] Deploy and verify build succeeds
- [ ] Test production URL

#### Deploy AI Agent to Railway
- [ ] Create new Railway project
- [ ] Connect GitHub repository
- [ ] Set root directory to `spark-ai-agent`
- [ ] Add all environment variables
- [ ] Deploy and get Railway URL
- [ ] Update `NEXT_PUBLIC_SPARK_API_URL` in Vercel

#### Setup Database
- [ ] Create Supabase project
- [ ] Get connection string
- [ ] Update `DATABASE_URL` in Vercel
- [ ] Run migrations: `npx prisma migrate deploy`

### Option 3: VPS Deployment

#### Server Setup
- [ ] Server provisioned (Ubuntu 22.04 recommended)
- [ ] SSH access configured
- [ ] Firewall configured (ports 80, 443, 22)
- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] PostgreSQL installed and configured
- [ ] Nginx installed
- [ ] PM2 installed globally

#### Application Deployment
- [ ] Clone repository to server
- [ ] Install dependencies: `npm install`
- [ ] Install Python deps: `cd spark-ai-agent && pip install -r requirements.txt`
- [ ] Configure environment variables
- [ ] Build Next.js: `npm run build`
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Start with PM2: `pm2 start npm --name entropy -- start`
- [ ] Start AI Agent: `pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name spark-ai`
- [ ] Configure PM2 startup: `pm2 startup && pm2 save`

#### Nginx Configuration
- [ ] Create Nginx config file
- [ ] Configure reverse proxy for Next.js (port 5000)
- [ ] Configure reverse proxy for AI Agent (port 8000)
- [ ] Test config: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`

#### SSL Certificate
- [ ] Install Certbot
- [ ] Run: `sudo certbot --nginx -d yourdomain.com`
- [ ] Verify auto-renewal: `sudo certbot renew --dry-run`

## Post-Deployment

### Verification
- [ ] Homepage loads correctly
- [ ] Authentication works (Google/GitHub)
- [ ] Users can sign up and log in
- [ ] Database operations work
- [ ] AI Agent responds to requests
- [ ] Document upload works
- [ ] Chat functionality works
- [ ] Flashcard generation works
- [ ] Quiz generation works
- [ ] Mind map generation works
- [ ] Credits system working
- [ ] All pages load without errors

### Health Checks
- [ ] Frontend health: `curl https://yourdomain.com/api/health`
- [ ] AI Agent health: `curl https://yourdomain.com/api/ai/health`
- [ ] Database connection verified
- [ ] All services responding

### Monitoring Setup
- [ ] Error tracking configured (Sentry recommended)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation configured
- [ ] Performance monitoring enabled
- [ ] Database monitoring enabled
- [ ] Disk space alerts configured
- [ ] Memory usage alerts configured

### Backup Strategy
- [ ] Database backup automated (daily minimum)
- [ ] Backup restoration tested
- [ ] File uploads backed up (if applicable)
- [ ] Environment variables backed up securely
- [ ] Disaster recovery plan documented

### Performance Testing
- [ ] Load testing performed
- [ ] Response times acceptable (<2s for pages)
- [ ] API endpoints responsive (<500ms)
- [ ] Database queries optimized
- [ ] No memory leaks detected
- [ ] Concurrent user handling tested

## OAuth Configuration

### Google OAuth (Production)
- [ ] Go to Google Cloud Console
- [ ] Update authorized redirect URIs:
  - Add: `https://yourdomain.com/api/auth/callback/google`
  - Remove localhost URLs
- [ ] Update authorized JavaScript origins
- [ ] Verify credentials in production `.env`

### GitHub OAuth (Production)
- [ ] Go to GitHub OAuth Apps settings
- [ ] Update Homepage URL to production domain
- [ ] Update Authorization callback URL:
  - Set: `https://yourdomain.com/api/auth/callback/github`
- [ ] Verify credentials in production `.env`

## Security Hardening

### Server Security (VPS)
- [ ] SSH key-only authentication
- [ ] Disable root login
- [ ] Configure fail2ban
- [ ] Enable automatic security updates
- [ ] Configure firewall (ufw)
- [ ] Regular security audits scheduled

### Application Security
- [ ] Rate limiting enabled on API routes
- [ ] CORS properly configured
- [ ] Content Security Policy headers
- [ ] XSS protection enabled
- [ ] CSRF protection enabled (NextAuth handles this)
- [ ] Secure cookies configured
- [ ] API keys rotated regularly

### Database Security
- [ ] Database user has minimal required permissions
- [ ] Database not publicly accessible
- [ ] Connection uses SSL/TLS
- [ ] Regular security patches applied
- [ ] Audit logging enabled

## Compliance & Legal

- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Cookie consent (if in EU)
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy defined
- [ ] User data export functionality
- [ ] User data deletion functionality

## Documentation

- [ ] Production deployment documented
- [ ] Runbook created for common issues
- [ ] Rollback procedure documented
- [ ] Contact information for emergencies
- [ ] Architecture diagram updated
- [ ] API documentation accessible
- [ ] User guide created

## Team Preparation

- [ ] Team trained on deployment process
- [ ] Access credentials distributed securely
- [ ] On-call rotation established
- [ ] Incident response plan created
- [ ] Communication channels set up
- [ ] Escalation procedures defined

## Cost Management

- [ ] Hosting costs estimated
- [ ] OpenAI API usage limits set
- [ ] Database storage limits configured
- [ ] Bandwidth monitoring enabled
- [ ] Cost alerts configured
- [ ] Budget approved

## Launch

### Soft Launch
- [ ] Deploy to production
- [ ] Test with small user group
- [ ] Monitor for issues
- [ ] Gather feedback
- [ ] Fix critical bugs

### Public Launch
- [ ] Announce launch
- [ ] Monitor traffic spike
- [ ] Scale resources if needed
- [ ] Respond to user feedback
- [ ] Address issues quickly

## Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error rates
- [ ] Check server resources (CPU, memory, disk)
- [ ] Verify database performance
- [ ] Monitor API response times
- [ ] Check for security issues
- [ ] Review user feedback
- [ ] Address critical bugs immediately

## Post-Launch Monitoring (First Week)

- [ ] Daily health checks
- [ ] Review analytics
- [ ] Monitor user growth
- [ ] Check OpenAI API usage
- [ ] Database performance review
- [ ] Security audit
- [ ] User feedback analysis

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review user reports

### Weekly
- [ ] Review performance metrics
- [ ] Check backup integrity
- [ ] Security scan
- [ ] Dependency updates check

### Monthly
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Database maintenance
- [ ] Cost analysis
- [ ] User feedback review

## Emergency Contacts

```
Production Issues:
- DevOps Lead: [contact]
- Backend Lead: [contact]
- Frontend Lead: [contact]

Infrastructure:
- Hosting Provider: [contact]
- Database Provider: [contact]

Third-party Services:
- OpenAI Support: https://help.openai.com
- Vercel Support: [if using]
- Railway Support: [if using]
```

## Rollback Plan

If critical issues occur:

1. **Immediate Actions**
   - [ ] Assess severity
   - [ ] Notify team
   - [ ] Document issue

2. **Rollback Steps**
   - [ ] Stop current deployment
   - [ ] Restore previous version
   - [ ] Verify rollback successful
   - [ ] Restore database if needed
   - [ ] Test critical functionality

3. **Post-Rollback**
   - [ ] Analyze root cause
   - [ ] Fix issue in development
   - [ ] Test thoroughly
   - [ ] Plan re-deployment

---

## Sign-Off

Before going live, ensure all critical items are checked:

**Deployment Lead**: _________________ Date: _______

**Security Review**: _________________ Date: _______

**Technical Review**: _________________ Date: _______

**Final Approval**: _________________ Date: _______

---

**Status**: Ready for production when all items are checked ✅
