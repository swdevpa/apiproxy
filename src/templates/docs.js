// Public documentation template
import { getSharedStyles } from './shared-styles.js';
import { getHeaderComponent, getHeaderScript } from './header-component.js';

export function getDocsHTML() {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Proxy Manager - Integration Guide</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    ${getSharedStyles()}
    <style>
      .docs-header {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
        color: var(--text-white);
        padding: var(--spacing-2xl) 0;
        text-align: center;
        margin-bottom: var(--spacing-xl);
      }
      
      .docs-header h1 {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-sm);
        font-weight: 700;
      }
      
      .docs-header p {
        font-size: 1.125rem;
        opacity: 0.9;
      }
      
      .code-block {
        background: var(--bg-dark);
        color: #d4d4d4;
        padding: var(--spacing-lg);
        border-radius: var(--radius-md);
        overflow-x: auto;
        font-family: var(--font-mono);
        font-size: 0.875rem;
        margin: var(--spacing-md) 0;
        border: 1px solid #374151;
      }
      
      .api-config {
        background: #f0f9ff;
        border: 2px solid var(--primary-color);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        margin: var(--spacing-md) 0;
      }
      
      .warning {
        background: #fffbeb;
        border: 2px solid var(--warning-color);
        border-radius: var(--radius-md);
        padding: var(--spacing-lg);
        margin: var(--spacing-md) 0;
      }
      
      .highlight {
        background: var(--primary-light);
        color: var(--primary-color);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.875rem;
        font-weight: 500;
      }
      
      .step {
        background: var(--bg-secondary);
        border-left: 4px solid var(--primary-color);
        padding: var(--spacing-lg);
        margin: var(--spacing-md) 0;
        border-radius: 0 var(--radius-md) var(--radius-md) 0;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin: var(--spacing-lg) 0;
        background: var(--bg-card);
        border-radius: var(--radius-md);
        overflow: hidden;
        box-shadow: var(--shadow-sm);
      }
      
      th, td {
        padding: var(--spacing-lg);
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
      }
      
      th {
        background: var(--bg-secondary);
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }
      
      td code {
        background: var(--bg-secondary);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 0.75rem;
      }
    </style>
  </head>
  <body>
    ${getHeaderComponent('docs', false)}
    
    <div class="docs-header">
      <div class="container">
        <h1>🔗 API Integration Guide</h1>
        <p>Secure API proxy integration for your applications</p>
      </div>
    </div>

    <div class="container">
      <div class="card">
        <h2>🚀 Quick Start</h2>
        <p>Integrate any API securely without exposing API keys in your client code.</p>
        
        <div class="step">
          <strong>How it works:</strong> Your App → Secure Proxy → Target API<br>
          API keys are added server-side automatically.
        </div>
      </div>

      <div class="card">
        <h2>⚙️ Configuration Guide</h2>
        
        <h3>Step 1: Project Setup</h3>
        <p>Create a new project in the dashboard and note your Project ID.</p>

        <h3>Step 2: Add API Secrets</h3>
        <div class="warning">
          <strong>⚠️ Important:</strong> Always use the <code>header_</code> prefix for automatic header injection!
        </div>

        <table>
          <thead>
            <tr>
              <th>API Service</th>
              <th>Secret Key</th>
              <th>Secret Value Format</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Google Gemini</strong></td>
              <td><code>header_x-goog-api-key</code></td>
              <td><code>YOUR_GEMINI_API_KEY</code></td>
            </tr>
            <tr>
              <td><strong>OpenAI</strong></td>
              <td><code>header_authorization</code></td>
              <td><code>Bearer sk-proj-your-key...</code></td>
            </tr>
            <tr>
              <td><strong>Custom API Key</strong></td>
              <td><code>header_x-api-key</code></td>
              <td><code>your-custom-key</code></td>
            </tr>
            <tr>
              <td><strong>Firebase</strong></td>
              <td><code>header_authorization</code></td>
              <td><code>Bearer your-id-token</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>🤖 Google Gemini Integration</h2>
        
        <div class="api-config">
          <strong>Dashboard Configuration:</strong><br>
          Secret Key: <code class="highlight">header_x-goog-api-key</code><br>
          Secret Value: <code class="highlight">YOUR_GEMINI_API_KEY</code>
        </div>

        <h3>📱 iOS (Swift)</h3>
        <div class="code-block">
class GeminiAPI {
    private let proxyURL = "https://your-worker.workers.dev/proxy/YOUR_PROJECT_ID"
    
    func generateText(prompt: String) async throws -> String {
        let targetURL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        let fullURL = "\\(proxyURL)?target_url=\\(targetURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)"
        
        var request = URLRequest(url: URL(string: fullURL)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let requestBody = [
            "contents": [
                ["parts": [["text": prompt]]]
            ]
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        
        // Parse Gemini response
        if let candidates = json?["candidates"] as? [[String: Any]],
           let content = candidates.first?["content"] as? [String: Any],
           let parts = content["parts"] as? [[String: Any]],
           let text = parts.first?["text"] as? String {
            return text
        }
        
        throw APIError.invalidResponse
    }
}
        </div>

        <h3>🌐 JavaScript/React</h3>
        <div class="code-block">
class GeminiAPI {
  constructor(projectId) {
    this.proxyURL = \`https://your-worker.workers.dev/proxy/\${projectId}\`;
  }

  async generateText(prompt) {
    const targetURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    const response = await fetch(\`\${this.proxyURL}?target_url=\${encodeURIComponent(targetURL)}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(\`Gemini API error: \${response.status}\`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}

// Usage in React
const [result, setResult] = useState('');

const handleGenerate = async () => {
  const api = new GeminiAPI('YOUR_PROJECT_ID');
  try {
    const text = await api.generateText('Write a short story about AI');
    setResult(text);
  } catch (error) {
    console.error('Error:', error);
  }
};
        </div>

        <h3>🤖 Android (Kotlin)</h3>
        <div class="code-block">
class GeminiAPIClient {
    private val proxyURL = "https://your-worker.workers.dev/proxy/YOUR_PROJECT_ID"
    private val client = OkHttpClient()
    private val gson = Gson()

    suspend fun generateText(prompt: String): String = withContext(Dispatchers.IO) {
        val targetURL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        val fullURL = "$proxyURL?target_url=${URLEncoder.encode(targetURL, "UTF-8")}"
        
        val requestBody = mapOf(
            "contents" to listOf(
                mapOf("parts" to listOf(mapOf("text" to prompt)))
            )
        )
        
        val request = Request.Builder()
            .url(fullURL)
            .post(gson.toJson(requestBody).toRequestBody("application/json".toMediaType()))
            .build()
            
        val response = client.newCall(request).execute()
        val responseBody = response.body?.string() ?: throw Exception("Empty response")
        
        // Parse response
        val jsonResponse = JSONObject(responseBody)
        val candidates = jsonResponse.getJSONArray("candidates")
        val content = candidates.getJSONObject(0).getJSONObject("content")
        val parts = content.getJSONArray("parts")
        
        return@withContext parts.getJSONObject(0).getString("text")
    }
}
        </div>

        <h3>📱 React Native/Expo</h3>
        <div class="code-block">
import axios from 'axios';

export class GeminiService {
  constructor(projectId) {
    this.proxyURL = \`https://your-worker.workers.dev/proxy/\${projectId}\`;
  }

  async generateText(prompt) {
    const targetURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    try {
      const response = await axios.post(
        \`\${this.proxyURL}?target_url=\${encodeURIComponent(targetURL)}\`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (error.response) {
        throw new Error(\`Gemini API Error: \${error.response.status} - \${error.response.data}\`);
      }
      throw error;
    }
  }
}

// Usage in React Native component
const gemini = new GeminiService('YOUR_PROJECT_ID');

const handleAIGenerate = async () => {
  try {
    setLoading(true);
    const result = await gemini.generateText(inputText);
    setResponse(result);
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
        </div>
      </div>

      <div class="card">
        <h2>🔧 Common API Configurations</h2>

        <h3>🧠 OpenAI ChatGPT</h3>
        <div class="api-config">
          Secret Key: <code class="highlight">header_authorization</code><br>
          Secret Value: <code class="highlight">Bearer sk-proj-your-openai-key...</code>
        </div>

        <h3>🔥 Firebase REST API</h3>
        <div class="api-config">
          Secret Key: <code class="highlight">header_authorization</code><br>
          Secret Value: <code class="highlight">Bearer your-firebase-id-token</code>
        </div>

        <h3>🌐 Custom APIs</h3>
        <div class="api-config">
          Secret Key: <code class="highlight">header_x-api-key</code><br>
          Secret Value: <code class="highlight">your-custom-api-key</code>
        </div>

        <h3>📊 Multiple Headers</h3>
        <div class="api-config">
          For APIs requiring multiple authentication headers:<br>
          <code class="highlight">header_x-api-key</code> → <code>main-api-key</code><br>
          <code class="highlight">header_x-client-id</code> → <code>client-id</code><br>
          <code class="highlight">header_authorization</code> → <code>Bearer token</code>
        </div>
      </div>

      <div class="card">
        <h2>🔍 Troubleshooting</h2>

        <div class="warning">
          <strong>❌ "API Key Invalid" Errors:</strong><br>
          • Verify secret name starts with <code>header_</code><br>
          • Check API key is correct and active<br>
          • Ensure proper header format for the API
        </div>

        <div class="warning">
          <strong>❌ CORS Issues:</strong><br>
          • Use proxy URL, not direct API calls<br>
          • Ensure <code>target_url</code> is URL-encoded<br>
          • Proxy handles CORS automatically
        </div>

        <h3>Testing with cURL</h3>
        <div class="code-block">
curl -X POST "https://your-worker.workers.dev/proxy/YOUR_PROJECT_ID?target_url=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent" \\
  -H "Content-Type: application/json" \\
  -d '{"contents":[{"parts":[{"text":"Hello Gemini!"}]}]}'
        </div>
      </div>

      <div class="card">
        <h2>🎯 Summary</h2>
        <ol>
          <li><strong>Create Project:</strong> Get your unique project ID</li>
          <li><strong>Add Secrets:</strong> Use <code>header_</code> prefix for API keys</li>
          <li><strong>Implement:</strong> Use proxy URL in your app code</li>
          <li><strong>Monitor:</strong> Check logs and performance via dashboard</li>
        </ol>
        
        <div class="step">
          <strong>🔗 Proxy URL Format:</strong><br>
          <code>https://your-worker.workers.dev/proxy/PROJECT_ID?target_url=TARGET_API_URL</code>
        </div>
      </div>
    </div>

    <script>
      // Copy to clipboard functionality
      document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const code = btn.previousElementSibling.textContent;
          navigator.clipboard.writeText(code);
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy', 2000);
        });
      });
    </script>
    ${getHeaderScript()}
  </body>
  </html>`;
}