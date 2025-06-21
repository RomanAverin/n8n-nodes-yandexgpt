# Quick Start Guide

Get up and running with the YandexGPT n8n node in 5 minutes.

## Prerequisites

- n8n instance (self-hosted or cloud)
- Yandex Cloud account with billing enabled
- Node.js 18+ (for development only)

## Installation

### Option 1: Via n8n Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter: `n8n-nodes-yandex-cloud-ml`
5. Click **Install**
6. Restart n8n if required

### Option 2: Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-yandex-cloud-ml

# Restart n8n
n8n start
```

### Option 3: Docker

```dockerfile
# Add to your Dockerfile
RUN npm install n8n-nodes-yandex-cloud-ml
```

Or mount as volume:
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

## Setup Yandex Cloud

### 1. Create Service Account

```bash
# Using Yandex CLI
yc iam service-account create --name yandexgpt-service-account

# Get service account ID
yc iam service-account get yandexgpt-service-account
```

### 2. Assign Roles

```bash
# Assign required role
yc resource-manager folder add-access-binding <FOLDER_ID> \
  --role ai.languageModels.user \
  --service-account-name yandexgpt-service-account
```

### 3. Create Service Account Key

```bash
# Create and download key
yc iam key create \
  --service-account-name yandexgpt-service-account \
  --output key.json
```

### 4. Get Folder ID

```bash
# Get your folder ID
yc config list
```

## Configuration

### 1. Create Credentials

1. In n8n, go to **Credentials**
2. Click **Add Credential**
3. Search for **YandexGPT API**
4. Fill in the details:

#### Service Account Key Method (Recommended)
- **Authentication Method**: Service Account Key
- **Service Account Key**: Paste the entire content of `key.json`
- **Folder ID**: Your Yandex Cloud folder ID
- **API Endpoint**: `https://llm.api.cloud.yandex.net` (default)

#### OAuth Token Method
- **Authentication Method**: OAuth Token
- **OAuth Token**: Your Yandex OAuth token
- **Folder ID**: Your folder ID

#### IAM Token Method (For Testing)
- **Authentication Method**: IAM Token
- **IAM Token**: Your IAM token (valid for 12 hours)
- **Folder ID**: Your folder ID

### 2. Test Credentials

Click **Test** to verify your credentials work correctly.

## First Workflow

### Simple Chat Example

1. Create a new workflow
2. Add **Manual Trigger** node
3. Add **YandexGPT** node
4. Configure YandexGPT:
   - **Credentials**: Select your YandexGPT credentials
   - **Resource**: Chat
   - **Operation**: Complete
   - **Model**: yandexgpt-lite
   - **Messages**: Add a user message
5. Connect the nodes
6. Execute the workflow

### Sample Configuration

```json
{
  "resource": "chat",
  "operation": "complete",
  "model": "yandexgpt-lite",
  "messages": {
    "messageValues": [
      {
        "role": "user",
        "text": "Hello! Tell me about artificial intelligence."
      }
    ]
  },
  "temperature": 0.6,
  "maxTokens": 1000
}
```

## Example Workflows

### 1. Content Generation

```
Manual Trigger → Set Data → YandexGPT → HTTP Request
```

Generate product descriptions from product data.

### 2. Email Assistant

```
Email Trigger → YandexGPT → Send Email
```

Auto-respond to customer emails with AI-generated responses.

### 3. Slack Bot

```
Slack Trigger → YandexGPT → Slack
```

Create an AI assistant for your Slack workspace.

### 4. Data Analysis

```
Database → Code → YandexGPT → Google Sheets
```

Analyze data and generate insights with AI.

## Model Selection

| Model | Speed | Quality | Cost | Use Case |
|-------|--------|---------|------|----------|
| `yandexgpt-lite` | Fast | Good | Low | Simple tasks, high volume |
| `yandexgpt` | Medium | Better | Medium | General purpose |
| `yandexgpt/rc` | Slower | Best | High | Complex tasks, best quality |

## Best Practices

### Temperature Settings
- **0.0-0.3**: Factual, consistent responses
- **0.4-0.7**: Balanced creativity and accuracy
- **0.8-1.0**: Creative, varied responses

### Token Management
- Monitor usage in workflow responses
- Set appropriate `maxTokens` limits
- Consider costs for high-volume workflows

### Error Handling
- Enable "Continue on Fail" in production
- Add error handling nodes
- Implement retry logic for rate limits

## Common Use Cases

### Content Creation
```json
{
  "resource": "text",
  "operation": "generate",
  "model": "yandexgpt",
  "prompt": "Write a blog post about {{ $json.topic }}",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

### Customer Support
```json
{
  "resource": "chat",
  "operation": "complete",
  "model": "yandexgpt-lite",
  "messages": {
    "messageValues": [
      {
        "role": "system",
        "text": "You are a helpful customer support agent."
      },
      {
        "role": "user",
        "text": "{{ $json.customer_message }}"
      }
    ]
  }
}
```

### Translation
```json
{
  "resource": "chat",
  "operation": "complete",
  "model": "yandexgpt",
  "messages": {
    "messageValues": [
      {
        "role": "system",
        "text": "Translate the following text to English:"
      },
      {
        "role": "user",
        "text": "{{ $json.text_to_translate }}"
      }
    ]
  }
}
```

## Troubleshooting

### Common Issues

**"Credentials not working"**
- Verify service account has correct roles
- Check folder ID is correct
- Ensure service account key format is valid

**"Model not found"**
- Verify model name spelling
- Check if model is available in your region
- Try a different model

**"Rate limit exceeded"**
- Add delays between requests
- Implement exponential backoff
- Consider using yandexgpt-lite for higher limits

**"Token limit exceeded"**
- Reduce maxTokens parameter
- Split long inputs into smaller parts
- Use more efficient prompts

### Debug Mode

Enable debug logging:
```bash
export N8N_LOG_LEVEL=debug
n8n start
```

### Getting Help

- Check the [full documentation](README.md)
- Review [examples](EXAMPLES.md)
- Create an issue on [GitHub](https://github.com/your-username/n8n-nodes-yandex-cloud-ml/issues)

## Next Steps

1. Explore advanced features in [EXAMPLES.md](EXAMPLES.md)
2. Check out the [development guide](DEVELOPMENT.md)
3. Join the n8n community for support
4. Consider contributing improvements

## Costs

YandexGPT pricing is based on:
- Number of tokens processed
- Model used (lite models are cheaper)
- Request frequency

Monitor your usage in Yandex Cloud Console to track costs.

## Security Notes

- Never hardcode credentials in workflows
- Use environment variables for sensitive data
- Regularly rotate service account keys
- Monitor API usage for unusual activity
- Don't include sensitive information in prompts

---

You're now ready to use YandexGPT in your n8n workflows! 🚀