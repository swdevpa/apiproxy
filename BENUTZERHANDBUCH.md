# API Proxy Manager - Benutzerhandbuch (Deutsch)

## 🎯 Übersicht

Mit dem API Proxy Manager kannst du alle deine API-Schlüssel und Secrets zentral und sicher verwalten, ohne sie direkt in deinen Apps zu speichern. Das System funktioniert für Web-Apps, iOS-Apps, Android-Apps und Expo-Projekte.

## 📝 Dashboard verwenden

### 1. Anmeldung

1. Öffne deine Worker-URL: `https://dein-worker.dein-subdomain.workers.dev`
2. Gib deinen Admin-Token ein (den du beim Setup erstellt hast)
3. Das Dashboard öffnet sich mit der Projektübersicht

### 2. Neues Projekt erstellen

1. Klicke auf den Tab **"New Project"**
2. Fülle die Felder aus:
   - **Projektname**: z.B. "Meine iOS App"
   - **Beschreibung**: Optional, z.B. "Fitness-App für iOS"
   - **Projekttyp**: Wähle zwischen Web App, iOS App, Android App, Expo App
3. Klicke **"Create Project"**

### 3. API-Schlüssel und Secrets hinzufügen

**Wichtig:** Verwende diese Namenskonvention für automatische Header-Injection:

#### Für HTTP-Headers:
- **Name**: `header_x-api-key` → wird zu Header `X-API-Key`
- **Name**: `header_authorization` → wird zu Header `Authorization`
- **Name**: `header_content-type` → wird zu Header `Content-Type`

#### Beispiele:

**OpenAI API:**
```
Name: header_authorization
Wert: Bearer sk-proj-abcdef123456...
```

**Firebase API:**
```
Name: header_x-firebase-api-key  
Wert: AIzaSyC123456789...
```

**Custom API mit mehreren Keys:**
```
Name: header_x-api-key
Wert: your-main-api-key

Name: header_x-client-id
Wert: your-client-id
```

#### So fügst du Secrets hinzu:

1. Gehe zu deinem Projekt im Dashboard
2. Klicke auf **"Manage"** (Button wird später implementiert)
3. Füge neue Secrets hinzu:
   - **Secret Name**: `header_x-api-key`
   - **Secret Value**: Dein tatsächlicher API-Schlüssel
   - Klicke **"Save"**

## 🚀 Integration in deine Apps

### Proxy-URL Format:
```
https://dein-worker.workers.dev/proxy/{projekt-id}?target_url={ziel-api-url}
```

---

## 📱 iOS App (Swift)

```swift
import Foundation

class APIManager {
    private let proxyBaseURL = "https://dein-worker.workers.dev/proxy/meine-ios-app"
    
    func fetchUserData() async throws -> UserData {
        // Ziel-API URL
        let targetURL = "https://api.example.com/users/me"
        
        // Proxy-URL mit target_url Parameter
        let proxyURL = "\(proxyBaseURL)?target_url=\(targetURL.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
        
        guard let url = URL(string: proxyURL) else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Deine API-Schlüssel werden automatisch vom Proxy hinzugefügt!
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.requestFailed
        }
        
        return try JSONDecoder().decode(UserData.self, from: data)
    }
}

// POST Request Beispiel
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
    this.proxyBaseURL = 'https://dein-worker.workers.dev/proxy/meine-web-app';
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
        // API-Schlüssel werden automatisch hinzugefügt
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

// Verwendung
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
    this.proxyBaseURL = 'https://dein-worker.workers.dev/proxy/meine-expo-app';
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
        // API Keys werden automatisch vom Proxy hinzugefügt
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

// Verwendung in deinen Komponenten
const apiClient = new APIClient();

// In einem React Native Component
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
    private val proxyBaseURL = "https://dein-worker.workers.dev/proxy/meine-android-app"

    suspend fun fetchUserData(): UserData = withContext(Dispatchers.IO) {
        val targetURL = "https://api.example.com/users/me"
        val proxyURL = "$proxyBaseURL?target_url=${URLEncoder.encode(targetURL, "UTF-8")}"

        val request = Request.Builder()
            .url(proxyURL)
            .get()
            .addHeader("Content-Type", "application/json")
            // API-Schlüssel werden automatisch hinzugefügt
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

// Verwendung in deiner Activity/Fragment
class MainActivity : AppCompatActivity() {
    private val apiManager = APIManager()

    private fun loadUserData() {
        lifecycleScope.launch {
            try {
                val userData = apiManager.fetchUserData()
                // UI aktualisieren
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

## 🔧 Häufige API-Integrationen

### OpenAI API
```
Dashboard Secret:
Name: header_authorization
Wert: Bearer sk-proj-dein-api-key...

App Code:
targetURL = "https://api.openai.com/v1/chat/completions"
```

### Firebase REST API
```
Dashboard Secret:
Name: header_x-firebase-api-key
Wert: AIzaSyC...

App Code:
targetURL = "https://your-project.firebaseio.com/users.json"
```

### Custom REST API mit API Key
```
Dashboard Secret:
Name: header_x-api-key
Wert: your-secret-api-key

App Code:
targetURL = "https://your-api.com/v1/data"
```

## ⚡ Tipps & Best Practices

### ✅ **Machen:**
- Verwende `header_` Präfix für alle HTTP-Headers
- Teste deine Integration mit einem einfachen GET Request zuerst
- Nutze URL-Encoding für target_url Parameter
- Implementiere Error-Handling in deinen Apps

### ❌ **Nicht machen:**
- Niemals API-Schlüssel direkt in App-Code einbetten  
- Proxy-URL nicht ohne target_url Parameter verwenden
- Sensible Daten nicht in URL-Parametern übertragen

### 🔍 **Debugging:**
- Prüfe das Request-Log im Dashboard
- Verwende Browser Developer Tools für Web-Apps
- Teste API-Calls mit tools wie Postman zuerst

## 🆘 Häufige Probleme

**Problem:** "Unauthorized" Fehler
**Lösung:** Überprüfe ob der Admin-Token korrekt gesetzt ist

**Problem:** Headers werden nicht übertragen  
**Lösung:** Stelle sicher, dass Secret-Namen mit `header_` beginnen

**Problem:** CORS-Fehler bei Web-Apps
**Lösung:** Der Proxy löst CORS automatisch - prüfe die target_url

**Problem:** SSL/HTTPS Fehler
**Lösung:** Stelle sicher, dass target_url HTTPS verwendet

---

## 📞 Support

Bei Problemen:
1. Prüfe die Worker-Logs in der Cloudflare Console
2. Teste API-Calls direkt mit curl/Postman
3. Überprüfe Secret-Konfiguration im Dashboard