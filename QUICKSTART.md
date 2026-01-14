# Quick Start Guide - Google Drive Integration

## Prerequisites

- Python 3.8+
- Backboard API key
- Google Cloud account

## 5-Minute Setup

### 1. Install Dependencies

```bash
cd src/backend
pip install -r requirements_bot.txt
pip install -r requirements_drive.txt
```

### 2. Configure Environment

Create `.env` file in project root:

```bash
# Backboard API
BACKBOARD_API_KEY=your_backboard_key_here

# Telegram Bot (if using)
BOT_TOKEN=your_telegram_bot_token

# Encryption (generate with: python src/backend/get_key.py)
ENCRYPTION_KEY=your_encryption_key_here
```

### 3. Get Google Drive Credentials

1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable "Google Drive API"
4. Create OAuth 2.0 credentials (Desktop app)
5. Download as `credentials.json`  put in `src/backend/`

### 4. Start Server

```bash
# From project root
uvicorn src.backend.server:app --reload
```

Server runs at: http://localhost:8000

### 5. Run Setup Script

```bash
# In another terminal
python src/backend/drive_setup_example.py
```

Follow the prompts to:

- Authenticate with Google
- Register documents
- Start polling

## Quick Test

### Using curl:

```bash
# 1. Create client
curl -X POST "http://localhost:8000/client?client_id=test&api_key=YOUR_KEY"

# 2. Authenticate Drive
curl -X POST "http://localhost:8000/drive/authenticate"

# 3. Register document
curl -X POST "http://localhost:8000/drive/register?client_id=test&drive_url=YOUR_DRIVE_URL"

# 4. Start polling (every 5 minutes)
curl -X POST "http://localhost:8000/drive/start-polling?client_id=test&interval=300"

# 5. Check documents
curl "http://localhost:8000/drive/documents?client_id=test"
```

## File Locations

**Put these files in `src/backend/`:**

- `credentials.json` - Google OAuth credentials
- `token.json` - Auto-generated after first auth
- `.env` - Environment variables

**These are auto-generated:**

- `demo.db` - SQLite database

## Troubleshooting

### "Credentials file not found"

 Download from Google Cloud Console

### "Client does not exist"

 Create client first: `POST /client`

### "No documents registered"

 Register docs: `POST /drive/register`

### Authentication keeps failing

 Delete `token.json` and re-authenticate

## Next Steps

1. **Test the integration**: Make changes to a Drive doc and wait for polling interval
2. **Check Backboard**: Verify content appears in memory
3. **Query the assistant**: Ask about meeting notes to test recall

## Architecture Diagram

```

  Google Drive   
   (Meetings)    

         
          (OAuth2)

  drive_service    Polls every N seconds
      .py        

         
          Compute hash (change detection)
         
          Store in database
         
          Send to Backboard API
              
              
         
           Backboard 
            Memory   
         
```

## Features

 Automatic change detection  
 Multiple document support  
 Configurable polling  
 Manual processing  
 Content caching  
 OAuth token persistence

## Limits & Considerations

- **Polling interval**: Default 300s (5 min) - don't go below 60s
- **API quotas**: Google Drive has rate limits
- **File types**: Currently supports Google Docs only
- **Content size**: No limit, but large docs may be slow

## Development

### Run tests:

```bash
pytest tests/test_drive_service.py -v
```

### Check coverage:

```bash
pytest --cov=src/backend tests/
```

### Format code:

```bash
black src/backend/drive_service.py
```

## Support

-  Full docs: `DRIVE_INTEGRATION.md`
-  Project summary: `PROJECT_SUMMARY.md`
-  Issues: Check server logs
-  Questions: See existing code comments

---

**You're all set!** 

The Drive integration is now monitoring your documents and feeding context to your onboarding assistant.
