# n8n-nodes-yandex-cloud-ml

An n8n community node to interact with Yandex Cloud Machine Learning services, specifically YandexGPT.

![YandexGPT Node](https://img.shields.io/badge/YandexGPT-Node-red)
![n8n](https://img.shields.io/badge/n8n-community-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Table of Contents

- [Installation](#installation)
- [Authentication](#authentication)
- [Operations](#operations)
- [Examples](#examples)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install a community node**
3. Enter `n8n-nodes-yandex-cloud-ml`
4. Click **Install**

### Manual Installation

1. Navigate to your n8n installation directory
2. Run: `npm install n8n-nodes-yandex-cloud-ml`
3. Restart n8n

### Docker

Add to your n8n Docker environment:

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_CUSTOM_EXTENSIONS="/data/custom" \
  -v n8n_data:/data \
  n8nio/n8n
```

Then install the package inside the container:
```bash
npm install n8n-nodes-yandex-cloud-ml
```

## Authentication

This node supports three authentication methods:

### 1. Service Account Key (Recommended)

1. Create a service account in Yandex Cloud Console
2. Assign the `ai.languageModels.user` role
3. Create and download a service account key (JSON)
4. In n8n credentials, paste the entire JSON content

**Example Service Account Key:**
```json
{
  "id": "aje6o61dvog2h6g9a33s",
  "service_account_id": "aje6o61dvog2h6g9a33s",
  "created_at": "2023-11-21T10:04:00Z",
  "key_algorithm": "RSA_2048",
  "public_key": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

### 2. OAuth Token

1. Get an OAuth token from Yandex OAuth
2. Enter the token in the credentials

### 3. IAM Token

1. Generate an IAM token (valid for 12 hours)
2. Enter the token directly

## Required Credentials

- **Folder ID**: Your Yandex Cloud folder ID where the model is available
- **API Endpoint**: Default is `https://llm.api.cloud.yandex.net`

## Operations

### Chat Completion

Generate conversational responses using YandexGPT.

**Parameters:**
- **Model**: Choose from available models
  - `yandexgpt-lite`: Faster, more economical
  - `yandexgpt`: Better quality, more capable
  - `yandexgpt/rc`: Latest with enhanced capabilities
- **Messages**: Array of conversation messages
- **Temperature**: Controls randomness (0.0 - 1.0)
- **Max Tokens**: Maximum response length

### Text Generation

Generate text completions from prompts.

**Parameters:**
- **Model**: Same model options as chat
- **Prompt**: Input text to complete
- **Temperature**: Controls randomness
- **Max Tokens**: Maximum response length

## Examples

### Basic Chat Completion

```json
{
  "resource": "chat",
  "operation": "complete",
  "model": "yandexgpt-lite",
  "messages": [
    {
      "role": "system",
      "text": "You are a helpful assistant."
    },
    {
      "role": "user", 
      "text": "What is the capital of Russia?"
    }
  ],
  "temperature": 0.6,
  "maxTokens": 2000
}
```

### Text Generation

```json
{
  "resource": "text",
  "operation": "generate", 
  "model": "yandexgpt",
  "prompt": "Write a short story about artificial intelligence:",
  "temperature": 0.8,
  "maxTokens": 1000
}
```

### Response Format

```json
{
  "message": {
    "role": "assistant",
    "text": "The capital of Russia is Moscow..."
  },
  "usage": {
    "inputTextTokens": 25,
    "completionTokens": 12,
    "totalTokens": 37
  },
  "modelVersion": "06.12.2023",
  "input": {
    "messages": [...],
    "model": "yandexgpt-lite",
    "temperature": 0.6,
    "maxTokens": 2000
  }
}
```

## Error Handling

The node includes comprehensive error handling:

- **Authentication Errors**: Invalid credentials or expired tokens
- **API Errors**: Rate limits, model unavailable, invalid requests
- **Network Errors**: Connection timeouts, DNS resolution failures

Enable "Continue on Fail" to handle errors gracefully in workflows.

## Rate Limits

YandexGPT API has rate limits:
- **Requests per minute**: Varies by model and account type
- **Tokens per minute**: Varies by model and account type

The node will automatically handle rate limit responses and retry when appropriate.

## Models

### Available Models

| Model | Description | Use Case |
|-------|-------------|----------|
| `yandexgpt-lite` | Fast, economical | Simple tasks, high volume |
| `yandexgpt` | Balanced quality/speed | General purpose |
| `yandexgpt/rc` | Latest, most capable | Complex tasks, best quality |

### Model Selection

Choose based on your needs:
- **Speed**: Use `yandexgpt-lite`
- **Quality**: Use `yandexgpt` or `yandexgpt/rc`
- **Cost**: Use `yandexgpt-lite`

## Advanced Configuration

### Custom API Endpoint

You can specify a custom API endpoint in credentials if needed:
```
https://your-custom-endpoint.yandex.net
```

### Temperature Settings

- **0.0**: Deterministic, consistent responses
- **0.3-0.7**: Balanced creativity and consistency
- **0.8-1.0**: High creativity, more random

### Token Management

- **Input tokens**: Count of tokens in your prompt/messages
- **Output tokens**: Count of tokens in the response
- **Total tokens**: Sum of input and output tokens

## Troubleshooting

### Common Issues

1. **"Invalid credentials"**
   - Check your service account key format
   - Ensure the service account has proper roles
   - Verify folder ID is correct

2. **"Model not found"**
   - Check if the model is available in your folder
   - Verify folder ID permissions
   - Try a different model

3. **"Rate limit exceeded"**
   - Wait before retrying
   - Consider using a different model
   - Check your account limits

4. **"Token limit exceeded"**
   - Reduce max tokens parameter
   - Shorten your input messages
   - Use a model with higher token limits

### Debug Mode

Enable debug mode by setting:
```bash
N8N_LOG_LEVEL=debug
```

This will show detailed request/response information.

## Development

### Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/n8n-nodes-yandex-cloud-ml.git
cd n8n-nodes-yandex-cloud-ml
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Link for local development:
```bash
npm link
```

### Testing

```bash
npm run test
npm run lint
```

### Building

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

## Security

- Never commit credentials to version control
- Use environment variables for sensitive data
- Regularly rotate service account keys
- Monitor API usage for unusual activity

## Changelog

### v1.0.0
- Initial release
- Support for YandexGPT chat and text completion
- Multiple authentication methods
- Comprehensive error handling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/your-username/n8n-nodes-yandex-cloud-ml/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/n8n-nodes-yandex-cloud-ml/discussions)
- **Documentation**: [Yandex Cloud Docs](https://yandex.cloud/en/docs/foundation-models/)

## Acknowledgments

- [n8n](https://n8n.io/) for the amazing workflow automation platform
- [Yandex Cloud](https://yandex.cloud/) for providing the YandexGPT API
- The n8n community for inspiration and support

---

**Note**: This is a community-maintained node and is not officially supported by n8n or Yandex Cloud.