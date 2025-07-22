# API Proxy Manager - User Guide (English)

## 🎯 Overview

The API Proxy Manager allows you to centrally and securely manage all your API keys and secrets without storing them directly in your apps. The system works for web apps, iOS apps, Android apps, and Expo projects.

## 📝 Using the Dashboard

### 1. Login

1. Open your worker URL: `https://your-worker.your-subdomain.workers.dev`
2. Enter your admin token (created during setup)
3. The dashboard opens with your project overview

### 2. Creating a New Project

1. Click on the **"New Project"** tab
2. Fill out the fields:
   - **Project Name**: e.g., "My iOS App"
   - **Description**: Optional, e.g., "Fitness app for iOS"
   - **Project Type**: Choose between Web App, iOS App, Android App, Expo App
3. Click **"Create Project"**

### 3. Adding API Keys and Secrets

**Important:** Use this naming convention for automatic header injection:

#### For HTTP Headers:
- **Name**: `header_x-api-key` → becomes header `X-API-Key`
- **Name**: `header_authorization` → becomes header `Authorization`
- **Name**: `header_content-type` → becomes header `Content-Type`

#### Examples:

**OpenAI API:**
```
Name: header_authorization
Value: Bearer sk-proj-abcdef123456...
```

**Firebase API:**
```
Name: header_x-firebase-api-key  
Value: AIzaSyC123456789...
```

**Custom API with multiple keys:**
```
Name: header_x-api-key
Value: your-main-api-key

Name: header_x-client-id
Value: your-client-id
```

#### How to add secrets:

1. Go to your project in the dashboard
2. Click **"Manage"** (button will be implemented later)
3. Add new secrets:
   - **Secret Name**: `header_x-api-key`
   - **Secret Value**: Your actual API key
   - Click **"Save"**

## 🚀 Integration in Your Apps

### Proxy URL Format:
```
https://your-worker.workers.dev/proxy/{project-id}?target_url={target-api-url}
```

---

## 📱 iOS App (Swift)

```swift
import Foundation

class APIManager {
    private let proxyBaseURL = "https://your-worker.workers.dev/proxy/my-ios-app"
    
    func fetchUserData() async throws -> UserData {
        // Target API URL
        let targetURL = "https://api.example.com/users/me"
        
        // Proxy URL with target_url parameter
        let proxyURL = "\(proxyBaseURL)?target_url=\(targetURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
        
        guard let url = URL(string: proxyURL) else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Your API keys are automatically added by the proxy!
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.requestFailed
        }
        
        return try JSONDecoder().decode(UserData.self, from: data)
    }
}

// POST Request Example
func createUser(userData: UserData) async throws {
    let targetURL = "https://api.example.com/users"
    let proxyURL = "\(proxyBaseURL)?target_url=\(targetURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
    
    guard let url = URL(string: proxyURL) else { return }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(userData)
    
    let (_, _) = try await URLSession.shared.data(for: request)
}
```

---

## ⚛️ React/Web App (JavaScript)

```javascript
class APIService {
  constructor() {
    this.proxyBaseURL = 'https://your-worker.workers.dev/proxy/my-web-app';
  }

  async fetchData(endpoint) {
    const targetURL = `https://api.example.com${endpoint}`;
    const proxyURL = `${this.proxyBaseURL}?target_url=${encodeURIComponent(targetURL)}`;

    try {
      const response = await fetch(proxyURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // API keys are automatically added
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  async postData(endpoint, data) {
    const targetURL = `https://api.example.com${endpoint}`;
    const proxyURL = `${this.proxyBaseURL}?target_url=${encodeURIComponent(targetURL)}`;

    const response = await fetch(proxyURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  }
}

// Usage
const api = new APIService();

// GET Request
const users = await api.fetchData('/users');

// POST Request  
const newUser = await api.postData('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
```

---

## 📱 Expo/React Native

```javascript
import axios from 'axios';

class APIClient {
  constructor() {
    this.proxyBaseURL = 'https://your-worker.workers.dev/proxy/my-expo-app';
  }

  async makeRequest(method, endpoint, data = null) {
    const targetURL = `https://api.example.com${endpoint}`;
    const proxyURL = `${this.proxyBaseURL}?target_url=${encodeURIComponent(targetURL)}`;

    try {
      const config = {
        method,
        url: proxyURL,
        headers: {
          'Content-Type': 'application/json',
        },
        // API Keys are automatically added by the proxy
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Convenience Methods
  async get(endpoint) {
    return this.makeRequest('GET', endpoint);
  }

  async post(endpoint, data) {
    return this.makeRequest('POST', endpoint, data);
  }

  async put(endpoint, data) {
    return this.makeRequest('PUT', endpoint, data);
  }

  async delete(endpoint) {
    return this.makeRequest('DELETE', endpoint);
  }
}

// Usage in your components
const apiClient = new APIClient();

// In a React Native Component
const UserProfile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await apiClient.get('/users/me');
        setUserData(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data');
      }
    };

    loadUserData();
  }, []);

  // ... Component JSX
};
```

---

## 🤖 Android (Kotlin)

```kotlin
import okhttp3.*
import kotlinx.coroutines.*
import com.google.gson.Gson

class APIManager {
    private val client = OkHttpClient()
    private val gson = Gson()
    private val proxyBaseURL = "https://your-worker.workers.dev/proxy/my-android-app"

    suspend fun fetchUserData(): UserData = withContext(Dispatchers.IO) {
        val targetURL = "https://api.example.com/users/me"
        val proxyURL = "$proxyBaseURL?target_url=${URLEncoder.encode(targetURL, "UTF-8")}"

        val request = Request.Builder()
            .url(proxyURL)
            .get()
            .addHeader("Content-Type", "application/json")
            // API keys are automatically added
            .build()

        val response = client.newCall(request).execute()
        
        if (!response.isSuccessful) {
            throw Exception("API call failed: ${response.code}")
        }

        val responseBody = response.body?.string() ?: throw Exception("Empty response")
        gson.fromJson(responseBody, UserData::class.java)
    }

    suspend fun createUser(userData: UserData): Boolean = withContext(Dispatchers.IO) {
        val targetURL = "https://api.example.com/users"
        val proxyURL = "$proxyBaseURL?target_url=${URLEncoder.encode(targetURL, "UTF-8")}"
        
        val json = gson.toJson(userData)
        val requestBody = json.toRequestBody("application/json".toMediaTypeOrNull())

        val request = Request.Builder()
            .url(proxyURL)
            .post(requestBody)
            .addHeader("Content-Type", "application/json")
            .build()

        val response = client.newCall(request).execute()
        response.isSuccessful
    }
}

// Usage in your Activity/Fragment
class MainActivity : AppCompatActivity() {
    private val apiManager = APIManager()

    private fun loadUserData() {
        lifecycleScope.launch {
            try {
                val userData = apiManager.fetchUserData()
                // Update UI
                runOnUiThread {
                    updateUI(userData)
                }
            } catch (e: Exception) {
                Log.e("API", "Failed to load user data", e)
            }
        }
    }
}
```

---

## 🔧 Common API Integrations

### OpenAI API
```
Dashboard Secret:
Name: header_authorization
Value: Bearer sk-proj-your-api-key...

App Code:
targetURL = "https://api.openai.com/v1/chat/completions"
```

### Firebase REST API
```
Dashboard Secret:
Name: header_x-firebase-api-key
Value: AIzaSyC...

App Code:
targetURL = "https://your-project.firebaseio.com/users.json"
```

### Custom REST API with API Key
```
Dashboard Secret:
Name: header_x-api-key
Value: your-secret-api-key

App Code:
targetURL = "https://your-api.com/v1/data"
```

## ⚡ Tips & Best Practices

### ✅ **Do:**
- Use `header_` prefix for all HTTP headers
- Test your integration with a simple GET request first
- Use URL encoding for target_url parameter
- Implement error handling in your apps

### ❌ **Don't:**
- Never embed API keys directly in app code  
- Don't use proxy URL without target_url parameter
- Don't pass sensitive data in URL parameters

### 🔍 **Debugging:**
- Check the request log in the dashboard
- Use browser developer tools for web apps
- Test API calls with tools like Postman first

## 🆘 Common Issues

**Issue:** "Unauthorized" error
**Solution:** Check if admin token is set correctly

**Issue:** Headers not being transferred  
**Solution:** Ensure secret names start with `header_`

**Issue:** CORS errors with web apps
**Solution:** The proxy solves CORS automatically - check the target_url

**Issue:** SSL/HTTPS errors
**Solution:** Ensure target_url uses HTTPS

---

## 📞 Support

If you encounter issues:
1. Check the Worker logs in Cloudflare Console
2. Test API calls directly with curl/Postman
3. Verify secret configuration in dashboard