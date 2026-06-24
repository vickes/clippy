# Clippy LAN API Documentation

Clippy now includes a built-in HTTP API server that allows you to access the AI assistant from anywhere on your local network (LAN). This enables you to use Clippy from other devices, scripts, or applications.

## 🌐 Server Details

- **Default Port**: `11337`
- **Binding**: `0.0.0.0` (accessible from LAN)
- **Protocol**: HTTP
- **CORS**: Enabled for all origins

## 🚀 Getting Started

1. Start Clippy normally
2. The API server starts automatically on port `11337`
3. Access from any device on your LAN: `http://<clippy-host-ip>:11337`
4. Or locally: `http://localhost:11337`

## 📡 API Endpoints

### Health Check

Check if the API server is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok",
  "version": "0.4.3",
  "name": "Clippy LAN API",
  "timestamp": "2025-03-13T23:00:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:11337/health
```

---

### List Available Models

Get a list of all downloaded and available AI models.

**Endpoint**: `GET /models`

**Response**:
```json
{
  "models": [
    {
      "name": "Llama 3.2 3B",
      "alias": "llama-3.2-3b",
      "size": 2048,
      "downloaded": true
    }
  ],
  "count": 1
}
```

**Example**:
```bash
curl http://localhost:11337/models
```

---

### Chat with AI

Send a message to the AI and get a response.

**Endpoint**: `POST /chat`

**Request Body**:
```json
{
  "message": "Hello, Clippy!",
  "modelAlias": "llama-3.2-3b",
  "systemPrompt": "You are a helpful assistant.",
  "temperature": 0.7,
  "maxTokens": 2048
}
```

**Parameters**:
- `message` (required): The message to send to the AI
- `modelAlias` (optional): The model to use (defaults to first available model)
- `systemPrompt` (optional): Custom system prompt (defaults to Clippy's default)
- `temperature` (optional): Creativity level 0.0-1.0 (default: 0.7)
- `maxTokens` (optional): Maximum response length (default: 2048)

**Response**:
```json
{
  "response": "Hello! I'm Clippy, your local AI assistant. How can I help you today?",
  "model": "llama-3.2-3b",
  "timestamp": "2025-03-13T23:00:00.000Z"
}
```

**Example**:
```bash
curl -X POST http://localhost:11337/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the capital of Sweden?",
    "temperature": 0.5
  }'
```

---

## 🔧 Usage Examples

### Python

```python
import requests

# Health check
response = requests.get("http://localhost:11337/health")
print(response.json())

# List models
models = requests.get("http://localhost:11337/models")
print(models.json())

# Chat
chat_response = requests.post(
    "http://localhost:11337/chat",
    json={
        "message": "Tell me a joke about programming",
        "temperature": 0.8
    }
)
print(chat_response.json()["response"])
```

### JavaScript/Node.js

```javascript
// Health check
const health = await fetch("http://localhost:11337/health");
console.log(await health.json());

// Chat
const response = await fetch("http://localhost:11337/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "What is AI?",
    temperature: 0.7
  })
});
const data = await response.json();
console.log(data.response);
```

### cURL

```bash
# Health check
curl http://localhost:11337/health

# List models
curl http://localhost:11337/models

# Chat
curl -X POST http://localhost:11337/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

---

## 🏠 LAN Access

To access Clippy from other devices on your network:

1. Find your computer's local IP address:
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **macOS/Linux**: `ifconfig` or `ip addr` (look for inet)

2. Use that IP from other devices:
   ```
   http://192.168.1.100:11337/chat
   ```

3. Make sure your firewall allows connections on port 11337

---

## 🔒 Privacy & Security

- ✅ **100% Local**: All processing happens on your computer
- ✅ **No Cloud**: No data is sent to external servers
- ✅ **LAN Only**: Server binds to your local network
- ⚠️ **No Authentication**: Anyone on your LAN can access the API
- ⚠️ **HTTP Only**: Traffic is not encrypted (use VPN for remote access)

---

## ⚙️ Configuration

The API server is configured in `src/main/api-server.ts`:

- **Port**: Default `11337` (can be changed in code)
- **Host**: `0.0.0.0` (all network interfaces)
- **CORS**: Enabled for all origins

---

## 🐛 Troubleshooting

**Server won't start**:
- Check if port 11337 is already in use
- Check Electron logs for errors

**Can't access from LAN**:
- Verify firewall settings
- Ensure devices are on the same network
- Check IP address is correct

**Model not found**:
- Download a model first using the Clippy UI
- Check `/models` endpoint to see available models

---

## 📝 Notes

- The API server starts automatically when Clippy launches
- It stops when Clippy is closed
- All chat sessions are stateless (no conversation history)
- For conversation history, use the Clippy UI

---

Enjoy using Clippy as your local LAN AI assistant! 🎉📎

