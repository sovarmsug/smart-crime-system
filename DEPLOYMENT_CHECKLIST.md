# Smart Crime System - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Backend Preparation
- [ ] Update package.json with build script
- [ ] Create render.yaml configuration
- [ ] Update CORS configuration for production
- [ ] Test all API endpoints locally
- [ ] Generate strong JWT secret
- [ ] Prepare environment variables

### ✅ Frontend Preparation  
- [ ] Create vercel.json configuration
- [ ] Update API URL for production
- [ ] Test build locally (`npm run build`)
- [ ] Check all navigation links work
- [ ] Test responsive design

### ✅ Database Setup
- [ ] Create Supabase account
- [ ] Create new project
- [ ] Run supabase-setup.sql script
- [ ] Get database connection string
- [ ] Test database connection

## Deployment Steps

### 1. Database (Supabase)
- [ ] Sign up at supabase.com
- [ ] Create new project
- [ ] Run SQL script in Supabase editor
- [ ] Note connection details

### 2. Backend (Render.com)
- [ ] Sign up at render.com
- [ ] Connect GitHub repository
- [ ] Create new Web Service
- [ ] Configure build and start commands
- [ ] Add all environment variables
- [ ] Deploy and test

### 3. Frontend (Vercel.com)
- [ ] Sign up at vercel.com
- [ ] Connect GitHub repository
- [ ] Import frontend project
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Deploy and test

## Post-Deployment Testing

### ✅ Functionality Tests
- [ ] User registration works
- [ ] User login works
- [ ] Crime reporting works
- [ ] Dashboard loads correctly
- [ ] Maps display properly
- [ ] Mobile responsive works
- [ ] Real-time updates work

### ✅ Integration Tests
- [ ] Frontend connects to backend
- [ ] Database operations work
- [ ] Authentication works end-to-end
- [ ] File uploads work
- [ ] Email/SMS notifications work

## Environment Variables

### Backend (Render.com)
```
NODE_ENV=production
PORT=10000
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
JWT_SECRET=your-strong-jwt-secret-here
FRONTEND_URL=https://your-app.vercel.app
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (Vercel.com)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

## URLs After Deployment

- **Frontend**: https://your-app-name.vercel.app
- **Backend API**: https://your-backend.onrender.com
- **API Health Check**: https://your-backend.onrender.com/api/health
- **Database**: https://app.supabase.com/project/your-project

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Database Connection Failed
- Check Supabase connection string
- Verify database is active
- Check network connectivity

#### 2. CORS Errors
- Verify FRONTEND_URL environment variable
- Check CORS configuration in backend
- Ensure frontend URL is whitelisted

#### 3. Build Failures
- Check package.json scripts
- Verify all dependencies are installed
- Check for syntax errors

#### 4. Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration
- Verify user roles in database

#### 5. Real-time Features Not Working
- Check Socket.io configuration
- Verify WebSocket connections
- Check firewall settings

## Performance Monitoring

### Free Tier Limits to Monitor
- **Render**: 750 hours/month, auto-sleep after 15min
- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB storage, 2GB bandwidth/month

### Monitoring Checklist
- [ ] Check Render logs regularly
- [ ] Monitor Vercel analytics
- [ ] Watch Supabase usage dashboard
- [ ] Set up alerts for usage limits

## Security Checklist

### ✅ Basic Security
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS (automatic on both platforms)
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting

### ⚠️ Security Considerations
- Monitor for suspicious activity
- Regularly update dependencies
- Use strong passwords
- Implement proper error handling
- Consider adding 2FA for admin accounts

## Success Criteria

Your deployment is successful when:
- [ ] All users can register and login
- [ ] Crime reports can be submitted
- [ ] Dashboard displays correctly
- [ ] Maps and charts load properly
- [ ] Mobile users can access all features
- [ ] Real-time updates work
- [ ] No CORS or authentication errors

## Next Steps After Deployment

1. **Share with others**: Send your Vercel URL to friends/family
2. **Test on mobile**: Access from phones/tablets
3. **Monitor usage**: Check platform dashboards
4. **Gather feedback**: Collect user experience reports
5. **Plan upgrades**: Consider paid plans if needed

## Emergency Contacts

If you encounter critical issues:
- Render Support: support@render.com
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com
