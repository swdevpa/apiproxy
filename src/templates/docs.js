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
        <div class="api-config">
          <strong>🎯 Smart API Detection:</strong> The system automatically detects popular APIs and configures authentication. No <code>header_</code> prefix needed for supported APIs!
        </div>

        <table>
          <thead>
            <tr>
              <th>API Service</th>
              <th>Secret Key</th>
              <th>Auth Method</th>
              <th>Domain</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>USDA FoodData</strong></td>
              <td><code>usda_api_key</code></td>
              <td>Query param <code>api_key</code></td>
              <td><code>api.nal.usda.gov</code></td>
            </tr>
            <tr>
              <td><strong>OpenWeather</strong></td>
              <td><code>openweather_api_key</code></td>
              <td>Query param <code>appid</code></td>
              <td><code>api.openweathermap.org</code></td>
            </tr>
            <tr>
              <td><strong>Stripe</strong></td>
              <td><code>stripe_api_key</code></td>
              <td>Header <code>Authorization: Bearer</code></td>
              <td><code>api.stripe.com</code></td>
            </tr>
            <tr>
              <td><strong>GitHub</strong></td>
              <td><code>github_api_key</code></td>
              <td>Header <code>Authorization: token</code></td>
              <td><code>api.github.com</code></td>
            </tr>
            <tr>
              <td><strong>Google Maps</strong></td>
              <td><code>google_maps_api_key</code></td>
              <td>Query param <code>key</code></td>
              <td><code>maps.googleapis.com</code></td>
            </tr>
            <tr>
              <td><strong>Custom APIs</strong></td>
              <td><code>header_*</code></td>
              <td>Custom headers</td>
              <td>Legacy support</td>
            </tr>
          </tbody>
        </table>

        <div class="warning">
          <strong>💡 Multiple APIs per Project:</strong> Add multiple secret keys to use different APIs from the same proxy endpoint!
        </div>
      </div>

      <div class="card">
        <h2>🥗 Multi-API Integration Examples</h2>
        
        <div class="api-config">
          <strong>🎯 One Project, Multiple APIs:</strong><br>
          Project: <code class="highlight">my-food-app</code><br>
          Secrets: <code class="highlight">usda_api_key, openweather_api_key, stripe_api_key</code>
        </div>

        <h3>🍎 USDA Food API Example</h3>
        <div class="api-config">
          <strong>Dashboard Configuration:</strong><br>
          Secret Key: <code class="highlight">usda_api_key</code><br>
          Secret Value: <code class="highlight">YOUR_USDA_API_KEY</code><br>
          <em>Automatically adds ?api_key=YOUR_USDA_API_KEY</em>
        </div>

        <h3>📱 iOS (Swift)</h3>
        <div class="code-block">
class FoodAPIManager {
    private let proxyURL = "https://your-worker.workers.dev/proxy/my-food-app"
    
    // USDA Food API - automatic ?api_key injection
    func searchFood(query: String) async throws -> [FoodItem] {
        let targetURL = "https://api.nal.usda.gov/fdc/v1/foods/search"
        let fullURL = "\\(proxyURL)?target_url=\\(targetURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)"
        
        var request = URLRequest(url: URL(string: fullURL)!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let requestBody = [
            "query": query,
            "dataType": ["Survey (FNDDS)", "SR Legacy", "Branded"],
            "pageSize": 20
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(USDAResponse.self, from: data).foods
    }
    
    // OpenWeather API - automatic ?appid injection
    func getWeather(for city: String) async throws -> WeatherData {
        let targetURL = "https://api.openweathermap.org/data/2.5/weather?q=\\(city)"
        let fullURL = "\\(proxyURL)?target_url=\\(targetURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)"
        
        let request = URLRequest(url: URL(string: fullURL)!)
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(WeatherData.self, from: data)
    }
    
    // Stripe API - automatic Authorization: Bearer injection
    func createCustomer(email: String) async throws -> StripeCustomer {
        let targetURL = "https://api.stripe.com/v1/customers"
        let fullURL = "\\(proxyURL)?target_url=\\(targetURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)!)"
        
        var request = URLRequest(url: URL(string: fullURL)!)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")
        request.httpBody = "email=\\(email)".data(using: .utf8)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(StripeCustomer.self, from: data)
    }
}
        </div>

        <h3>🌐 JavaScript/React</h3>
        <div class="code-block">
class MultiAPIService {
  constructor(projectId) {
    this.proxyURL = \`https://your-worker.workers.dev/proxy/\${projectId}\`;
  }

  // USDA Food API
  async searchFood(query) {
    const targetURL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
    
    const response = await fetch(\`\${this.proxyURL}?target_url=\${encodeURIComponent(targetURL)}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
        dataType: ['Survey (FNDDS)', 'SR Legacy', 'Branded'],
        pageSize: 20
      })
    });

    if (!response.ok) {
      throw new Error(\`USDA API error: \${response.status}\`);
    }

    const data = await response.json();
    return data.foods;
  }

  // OpenWeather API
  async getWeather(city) {
    const targetURL = \`https://api.openweathermap.org/data/2.5/weather?q=\${city}\`;
    
    const response = await fetch(\`\${this.proxyURL}?target_url=\${encodeURIComponent(targetURL)}\`);
    
    if (!response.ok) {
      throw new Error(\`Weather API error: \${response.status}\`);
    }
    
    return response.json();
  }

  // Stripe API
  async createCustomer(email) {
    const targetURL = 'https://api.stripe.com/v1/customers';
    
    const response = await fetch(\`\${this.proxyURL}?target_url=\${encodeURIComponent(targetURL)}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: \`email=\${encodeURIComponent(email)}\`
    });
    
    return response.json();
  }
}

// Usage in React
const [foods, setFoods] = useState([]);
const [weather, setWeather] = useState(null);

const api = new MultiAPIService('my-food-app');

const searchFoods = async (query) => {
  try {
    const results = await api.searchFood(query);
    setFoods(results);
  } catch (error) {
    console.error('Food search error:', error);
  }
};

const fetchWeather = async (city) => {
  try {
    const data = await api.getWeather(city);
    setWeather(data);
  } catch (error) {
    console.error('Weather error:', error);
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
        val fullURL = "\\$proxyURL?target_url=" + java.net.URLEncoder.encode(targetURL, "UTF-8")
        
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
    ${getHeaderScript(false)}
  </body>
  </html>`;
}