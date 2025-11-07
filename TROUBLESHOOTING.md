# Troubleshooting Guide

## AI Agent Import Warnings

### Issue: "cannot import name 'router' from 'app.api.routes'"

**Root Cause:**
The warning appeared because `main.py` was trying to import from the old `app/api/routes.py` file which doesn't export individual routers anymore.

**Solution:**
- Individual route modules are now in `app/api/routes/` directory
- Each route module (chat.py, quiz.py, etc.) exports its own `router`
- `main.py` imports directly from these individual modules
- The old `app/api/routes.py` is now deprecated

**File Structure:**
