# YandexGPT Node Examples

This file contains practical examples of using the YandexGPT node in n8n workflows.

## Table of Contents

- [Basic Chat Completion](#basic-chat-completion)
- [Text Generation](#text-generation)
- [Multi-turn Conversation](#multi-turn-conversation)
- [Content Summarization](#content-summarization)
- [Language Translation](#language-translation)
- [Code Generation](#code-generation)
- [Email Response Generation](#email-response-generation)
- [Product Description Generation](#product-description-generation)
- [Data Analysis and Insights](#data-analysis-and-insights)
- [Error Handling Workflows](#error-handling-workflows)

## Basic Chat Completion

### Simple Q&A

```json
{
  "nodes": [
    {
      "parameters": {
        "resource": "chat",
        "operation": "complete",
        "model": "yandexgpt-lite",
        "messages": {
          "messageValues": [
            {
              "role": "user",
              "text": "What is machine learning?"
            }
          ]
        },
        "temperature": 0.3,
        "maxTokens": 500
      },
      "type": "n8n-nodes-yandexgpt.yandexGPT",
      "typeVersion": 1,
      "position": [860, 240],
      "id": "basic-chat",
      "name": "YandexGPT Basic Chat"
    }
  ]
}
```

### With System Message

```json
{
  "parameters": {
    "resource": "chat",
    "operation": "complete",
    "model": "yandexgpt",
    "messages": {
      "messageValues": [
        {
          "role": "system",
          "text": "You are a helpful programming assistant specialized in Python."
        },
        {
          "role": "user",
          "text": "How do I create a list comprehension in Python?"
        }
      ]
    },
    "temperature": 0.2,
    "maxTokens": 1000
  }
}
```

## Text Generation

### Creative Writing

```json
{
  "parameters": {
    "resource": "text",
    "operation": "generate",
    "model": "yandexgpt",
    "prompt": "Write a short story about a robot who discovers emotions:",
    "temperature": 0.8,
    "maxTokens": 1500
  }
}
```

### Technical Documentation

```json
{
  "parameters": {
    "resource": "text",
    "operation": "generate",
    "model": "yandexgpt-lite",
    "prompt": "Create API documentation for a REST endpoint that creates user accounts. Include parameters, response format, and error codes:",
    "temperature": 0.1,
    "maxTokens": 800
  }
}
```

## Multi-turn Conversation

### Building Conversation Context

```json
{
  "nodes": [
    {
      "parameters": {
        "resource": "chat",
        "operation": "complete",
        "model": "yandexgpt",
        "messages": {
          "messageValues": [
            {
              "role": "system",
              "text": "You are a customer support agent for a tech company."
            },
            {
              "role": "user",
              "text": "I'm having trouble with my account login"
            },
            {
              "role": "assistant",
              "text": "I'd be happy to help you with your login issue. Can you tell me what specific problem you're experiencing? Are you getting an error message?"
            },
            {
              "role": "user",
              "text": "Yes, it says 'Invalid credentials' but I'm sure my password is correct"
            }
          ]
        },
        "temperature": 0.4,
        "maxTokens": 600
      },
      "type": "n8n-nodes-yandexgpt.yandexGPT",
      "name": "Customer Support Chat"
    }
  ]
}
```

## Content Summarization

### Article Summarization Workflow

```json
{
  "nodes": [
    {
      "parameters": {
        "url": "https://example.com/long-article"
      },
      "type": "n8n-nodes-base.httpRequest",
      "name": "Fetch Article"
    },
    {
      "parameters": {
        "resource": "text",
        "operation": "generate",
        "model": "yandexgpt",
        "prompt": "=Summarize the following article in 3-5 key points:\n\n{{ $json.body }}",
        "temperature": 0.3,
        "maxTokens": 400
      },
      "type": "n8n-nodes-yandexgpt.yandexGPT",
      "name": "Summarize Article"
    }
  ]
}
```

### Meeting Notes Summary

```json
{
  "parameters": {
    "resource": "chat",
    "operation": "complete",
    "model": "yandexgpt",
    "messages": {
      "messageValues": [
        {
          "role": "system",
          "text": "You are an expert at summarizing meeting transcripts. Create clear, actionable summaries with key decisions and next steps."
        },
        {
          "role": "user",
          "text": "=Please summarize this meeting transcript:\n\n{{ $json.transcript }}"
        }
      ]
    },
    "temperature": 0.2,
    "maxTokens": 800
  }
}
```

## Language Translation

### Multi-language Support

```json
{
  "parameters": {
    "resource": "chat",
    "operation": "complete",
    "model": "yandexgpt-lite",
    "messages": {
      "messageValues": [
        {
          "role": "system",
          "text": "You are a professional translator. Translate the given text accurately while maintaining the original tone and context."
        },
        {
          "role": "user",
          "text": "=Translate the following text from {{ $json.source_language }} to {{ $json.target_language }}:\n\n{{ $json.text }}"
        }
      ]
    },
    "temperature": 0.1,
    "maxTokens": 1000
  }
}
```

## Code Generation

### Function Generation

```json
{
  "parameters": {
    "resource": "chat",
    "operation": "complete",
    "model": "yandexgpt",
    "messages": {
      "messageValues": [
        {
          "role": "system",
          "text": "You are an expert programmer. Write clean, well-documented code with proper error handling."
        },
        {
          "role": "user",
          "text": "Create a Python function that validates email addresses using regex. Include docstring and error handling."
        }
      ]
    },
    "temperature": 0.2,
    "maxTokens": 1200
  }
}
```

### Code Review and Suggestions

```json
{
  "parameters": {
    "resource": "text",
    "operation": "generate",
    "model": "yandexgpt",
    "prompt": "=Review the following code and provide suggestions for improvement:\n\n```python\n{{ $json.code }}\n```\n\nPlease focus on:\n1. Code quality and best practices\n2. Performance optimizations\n3. Security considerations\n4. Readability improvements",
    "temperature": 0.3,
    "maxTokens": 1000
  }
}
```

## Email Response Generation

### Customer Service Email

```json
{
  "nodes": [
    {
      "parameters": {
        "pollTimes": {
          "item": [
            {
              "mode": "everyMinute"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.emailReadImap",
      "name": "Read Customer Emails"
    },
    {
      "parameters": {
        "resource": "chat",
        "operation": "complete",
        "model": "yandexgpt",
        "messages": {
          "messageValues": [
            {
              "role": "system",
              "text": "You are a professional customer service representative. Write helpful, empathetic, and solution-oriented email responses. Always maintain a friendly but professional tone."
            },
            {
              "role": "user",
              "text": "=Please draft a response to this customer email:\n\nSubject: {{ $json.subject }}\nFrom: {{ $json.from }}\nMessage: {{ $json.text }}\n\nProvide a helpful and professional response."
            }
          ]
        },
        "temperature": 0.4,
        "maxTokens": 800
      },
      "type": "n8n-nodes-yandexgpt.yandexGPT",
      "name": "Generate Email Response"
    }
  ]
}
```

## Product Description Generation

### E-commerce Product Descriptions

```json
{
  "nodes": [
    {
      "parameters": {
        "resource": "text",
        "operation": "generate",
        "model": "yandexgpt",
        "prompt": "=Create an engaging product description for:\n\nProduct Name: {{ $json.product_name }}\nCategory: {{ $json.category }}\nKey Features: {{ $json.features }}\nTarget Audience: {{ $json.target_audience }}\n\nWrite a compelling description that highlights benefits, includes relevant keywords, and encourages purchase. Keep it under 200 words.",
        "temperature": 0.6,
        "maxTokens": 400
      },
      "type": "n8n-nodes-yandexgpt.yandexGPT",
      "name": "Generate Product Description"
    }
  ]
}
```

### SEO-Optimized Content

```json
{
  "parameters": {
    "resource": "chat",
    "operation": "complete",
    "model": "yandexgpt",
    "messages": {
      "messageValues": [
        {
          "role": "system",
          "text": "You are an SEO content specialist. Create product descriptions that are both engaging for customers and optimized for search engines."
        },
        {
          "role": "user",
          "text": "=Create an SEO-optimized product description for:\n\nProduct: {{ $json.product }}\nKeywords to include: {{ $json.keywords }}\nBrand: {{ $json.brand }}\nPrice Range: {{ $json.price_range }}\n\nMake it compelling and include the keywords naturally."
        }
      ]
    },
    "temperature": 0.5,
    "maxTokens": 500
  }
}
```

## Data Analysis and Insights

### Sales Data Analysis

```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT * FROM sales_data WHERE date >= DATE('now', '-30 days')"
      },
      "type": "n8n-nodes-base.sqlite",
      "name": "Get Sales Data"
    },
    {
      "parameters": {
        "resource": "text",
        "operation": "generate",
        "model": "yandexgpt",
        "prompt": "=Analyze the following sales data and provide insights:\n\n{{ JSON.stringify($json, null, 2) }}\n\nPlease provide:\n1. Key trends and patterns\n2. Notable performance indicators\n3. Recommendations for improvement\n4. Areas of concern or opportunity",
        "temperature": 0.3,
        "maxTokens": 1000
      },
      "type": "n8n-nodes-yandexgpt.yandexGPT",
      "name": "Analyze Sales Data"
    }
  ]
}
```

### Survey Response Analysis

```json
{
  "parameters": {
    "resource": "chat",
    "operation": "complete",
    "model": "yandexgpt",
    "messages": {
      "messageValues": [
        {
          "role": "system",
          "text": "You are a data analyst specializing in customer feedback analysis. Provide objective, actionable insights from survey data."
        },
        {
          "role": "user",
          "text": "=Analyze these customer survey responses and identify common themes, satisfaction scores, and improvement areas:\n\n{{ $json.survey_responses }}"
        }
      ]
    },
    "temperature": 0.2,
    "maxTokens": 800
  }
}
```

## Error Handling Workflows

### Graceful Error Handling

```json
{
  "nodes": [
    {
      "parameters": {
        "resource": "chat",
        "operation": "complete",
        "model": "yandexgpt-lite",
        "messages": {
          "messageValues": [
            {
              "role": "user",
              "text": "{{ $json.user_input }}"
            }
          ]
        },
        "temperature": 0.5,
        "maxTokens": 1000,
        "continueOnFail": true
      },
      "type": "n8n-nodes-yandexgpt.yandexGPT",
      "name": "YandexGPT with Error Handling"
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.error }}",
              "operation": "isNotEmpty"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.if",
      "name": "Check for Errors"
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "fallback_response",
              "value": "I apologize, but I'm currently unable to process your request. Please try again later or contact support."
            },
            {
              "name": "error_logged",
              "value": true
            }
          ]
        }
      },
      "type": "n8n-nodes-base.set",
      "name": "Fallback Response"
    }
  ]
}
```

### Retry Logic with Exponential Backoff

```json
{
  "nodes": [
    {
      "parameters": {
        "resource": "chat",
        "operation": "complete",
        "model": "yandexgpt",
        "messages": {
          "messageValues": [
            {
              "role": "user",
              "text": "{{ $json.prompt }}"
            }
          ]
        },
        "temperature": 0.5,
        "maxTokens": 1000,
        "continueOnFail": true
      },
      "type": "n8n-nodes-yandexgpt.yandexGPT",
      "name": "YandexGPT Request"
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.error }}",
              "operation": "contains",
              "value2": "rate limit"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.if",
      "name": "Check Rate Limit"
    },
    {
      "parameters": {
        "amount": 5,
        "unit": "seconds"
      },
      "type": "n8n-nodes-base.wait",
      "name": "Wait Before Retry"
    }
  ]
}
```

## Best Practices

### 1. Temperature Settings

- **Creative tasks**: 0.7-0.9
- **Factual responses**: 0.1-0.3
- **Balanced responses**: 0.4-0.6

### 2. Token Management

- Monitor token usage in responses
- Set appropriate maxTokens limits
- Consider cost implications

### 3. Model Selection

- Use `yandexgpt-lite` for simple tasks
- Use `yandexgpt` for complex reasoning
- Use `yandexgpt/rc` for latest capabilities

### 4. Error Handling

- Always enable "Continue on Fail" for production workflows
- Implement fallback responses
- Log errors for debugging

### 5. Security

- Never include sensitive data in prompts
- Use proper credential management
- Monitor API usage for anomalies

## Integration Examples

### With Slack

```json
{
  "nodes": [
    {
      "parameters": {
        "channel": "#general",
        "select": "channel",
        "channelId": "C1234567890"
      },
      "type": "n8n-nodes-base.slackTrigger",
      "name": "Slack Message Trigger"
    },
    {
      "parameters": {
        "resource": "chat",
        "operation": "complete",
        "model": "yandexgpt-lite",
        "messages": {
          "messageValues": [
            {
              "role": "system",
              "text": "You are a helpful Slack bot. Provide concise, helpful responses to team questions."
            },
            {
              "role": "user",
              "text": "{{ $json.text }}"
            }
          ]
        },
        "temperature": 0.4,
        "maxTokens": 500
      },
      "type": "n8n-nodes-yandexgpt.yandexGPT",
      "name": "Generate Response"
    },
    {
      "parameters": {
        "channel": "={{ $node['Slack Message Trigger'].json.channel }}",
        "text": "={{ $json.message.text }}",
        "otherOptions": {}
      },
      "type": "n8n-nodes-base.slack",
      "name": "Send Response to Slack"
    }
  ]
}
```

### With Google Sheets

```json
{
  "nodes": [
    {
      "parameters": {
        "operation": "appendOrUpdate",
        "documentId": "your-sheet-id",
        "sheetName": "Content",
        "columnToMatchOn": "A",
        "valueToMatchOn": "={{ $json.id }}",
        "valuesToSend": {
          "Product": "={{ $json.product_name }}",
          "Description": "={{ $json.description }}",
          "Generated_Content": "={{ $node['YandexGPT'].json.message.text }}"
        }
      },
      "type": "n8n-nodes-base.googleSheets",
      "name": "Update Sheet"
    }
  ]
}
```

These examples demonstrate the versatility and power of the YandexGPT node in various n8n workflows. Adapt them to your specific use cases and requirements.
