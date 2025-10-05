
# 🎯 Complete Guide: Fix Admin Authorization for Creating Auctions

## Current Status Summary

✅ **Authentication Works** - Login returns token with correct roles  
✅ **JWT Contains Roles** - Token has `["ROLE_USER", "ROLE_ADMIN"]`  
❌ **Authorization Fails** - Backend returns 403 when creating auctions  

## The Problem

Even though your JWT token contains `ROLE_ADMIN`, the backend is still returning 403 Forbidden. This means the JWT filter is **not extracting the roles from the token** and setting them as authorities in Spring Security's SecurityContext.

---

## 🔧 Solution: Fix Backend Authorization

### Step 1: Locate Your Backend Project

First, find where your Spring Boot backend code is located:

```bash
# Common locations:
~/Documents/CMU/ComponentBasedSoftware/backend
~/Documents/CMU/ComponentBasedSoftware/spring-boot-project
~/backend
```

Once found, navigate to it:
```bash
cd /path/to/your/backend/project
```

---

### Step 2: Fix JwtService.java

**Location**: `src/main/java/.../service/JwtService.java`

Add this method to extract roles from JWT token:

```java
public List<String> extractRoles(String token) {
    Claims claims = extractAllClaims(token);
    @SuppressWarnings("unchecked")
    List<String> roles = claims.get("roles", List.class);
    return roles != null ? roles : new ArrayList<>();
}
```

**Full method should look like:**

```java
import java.util.ArrayList;
import java.util.List;
import io.jsonwebtoken.Claims;

// ... other code ...

public List<String> extractRoles(String token) {
    Claims claims = extractAllClaims(token);
    @SuppressWarnings("unchecked")
    List<String> roles = claims.get("roles", List.class);
    return roles != null ? roles : new ArrayList<>();
}
```

---

### Step 3: Fix JwtAuthenticationFilter.java

**Location**: `src/main/java/.../security/JwtAuthenticationFilter.java`

Find the part where `UsernamePasswordAuthenticationToken` is created and replace it with this:

**FIND THIS CODE:**
```java
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    userDetails,
    null,
    userDetails.getAuthorities()  // ❌ OLD - gets from database
);
```

**REPLACE WITH:**
```java
// Extract roles from JWT and create authorities
List<String> roles = jwtService.extractRoles(jwt);
List<SimpleGrantedAuthority> authorities = roles.stream()
    .map(SimpleGrantedAuthority::new)
    .collect(Collectors.toList());

UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    userDetails,
    null,
    authorities  // ✅ NEW - uses roles from JWT token
);
```

**Make sure these imports are present:**
```java
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;
import java.util.stream.Collectors;
```

---

### Step 4: Verify SecurityConfig.java

**Location**: `src/main/java/.../config/SecurityConfig.java`

Make sure it has these configurations:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(authorize -> authorize
                // Auth endpoints - MUST be first and permitAll
                .requestMatchers("/api/v1/auth/**").permitAll()
                
                // Public GET endpoints
                .requestMatchers(HttpMethod.GET, "/events/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/auction-items/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/students/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/organizers/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/organizations/**").permitAll()
                
                // Admin-only POST/PUT/DELETE - IMPORTANT: Use "ADMIN" without "ROLE_" prefix
                .requestMatchers(HttpMethod.POST, "/auction-items").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/auction-items/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/auction-items/**").hasRole("ADMIN")
                
                .requestMatchers(HttpMethod.POST, "/events").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/events/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/events/**").hasRole("ADMIN")
                
                // File uploads
                .requestMatchers("/uploadImage", "/uploadFile").permitAll()
                
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}
```

**Important Notes:**
- ⚠️ Use `.hasRole("ADMIN")` **NOT** `.hasRole("ROLE_ADMIN")`
- ⚠️ Spring automatically adds the "ROLE_" prefix
- ⚠️ Auth endpoints (`/api/v1/auth/**`) must be `permitAll()` and come FIRST

---

### Step 5: Build and Restart Backend

**Option A: Using Maven**
```bash
cd /path/to/backend/project

# Clean and build
./mvnw clean package -DskipTests

# Run
./mvnw spring-boot:run
```

**Option B: Using Gradle**
```bash
cd /path/to/backend/project

# Clean and build
./gradlew clean build -x test

# Run
./gradlew bootRun
```

**Option C: Using IDE**
1. Open backend project in IntelliJ IDEA or Eclipse
2. Right-click on main Application class
3. Select "Run" or "Debug"

---

## 🧪 Testing the Fix

### Test 1: Verify Token Has Roles

```bash
# Get admin token
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq '.'
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "name": "admin admin",
    "roles": ["ROLE_USER", "ROLE_ADMIN"]  ✅
  },
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG..."
}
```

### Test 2: Decode Token to Verify Roles

```bash
# Copy the access_token from above and decode it
echo "YOUR_ACCESS_TOKEN" | cut -d'.' -f2 | base64 -d | jq '.'
```

**Expected Output:**
```json
{
  "roles": ["ROLE_USER", "ROLE_ADMIN"],  ✅
  "sub": "admin",
  "iat": 1759439172,
  "exp": 1759442772
}
```

### Test 3: Test Auction Creation

```bash
# Replace YOUR_TOKEN with the access_token from Test 1
curl -w "\nHTTP_STATUS:%{http_code}\n" \
  -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test auction","type":"Electronics","successfulBid":100}'
```

**Expected Output:**
```
{"id":1,"description":"Test auction","type":"Electronics","successfulBid":100}
HTTP_STATUS:201  ✅
```

**If you get:**
- ❌ `HTTP_STATUS:403` - Backend still not extracting roles correctly
- ❌ `HTTP_STATUS:401` - Token is invalid or not being read
- ❌ `HTTP_STATUS:500` - Server error (check backend logs)

---

## 🌐 Testing in Frontend

### Step 1: Clear Old Token

Open browser console (F12) and run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 2: Login Fresh

1. Go to http://localhost:5173
2. Click "Login"
3. Enter credentials:
   - Username: `admin`
   - Password: `admin`
4. Click "Sign in"

### Step 3: Verify Token in Browser

Open browser console (F12) and run:
```javascript
const token = localStorage.getItem('access_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Your roles:', payload.roles);
} else {
  console.log('No token found - please login');
}
```

**Expected Output:**
```
Your roles: ["ROLE_USER", "ROLE_ADMIN"]  ✅
```

### Step 4: Create Auction

1. Navigate to "New Auction" in navbar
2. Fill in the form:
   - Description: "Test auction"
   - Type: "Electronics"
   - Starting Bid: 100
3. Click "Create Auction Item"

**Expected Result:**
- ✅ Success message appears
- ✅ Redirected to auction list
- ✅ New auction appears in list

**If you see:**
- ❌ "Permission denied" - Backend fix not applied correctly
- ❌ Redirect to login - Old token in browser (clear localStorage)
- ❌ Network error - Backend not running or CORS issue

---

## 🐛 Troubleshooting

### Issue 1: Still Getting 403 After Fix

**Check 1: Is backend running the updated code?**
```bash
# Find backend process
ps aux | grep java | grep -v grep

# Kill old process
pkill -f "spring-boot" 
# or
pkill -9 -f java

# Start fresh
cd /path/to/backend
./mvnw spring-boot:run
```

**Check 2: Are the changes compiled?**
```bash
# Rebuild
./mvnw clean package -DskipTests
```

**Check 3: Check backend logs**
```bash
# Look for errors in backend startup logs
# Common issues:
# - Compilation errors
# - Missing imports
# - Bean creation failures
```

### Issue 2: Token Doesn't Have Roles

**Fix:** The JWT generation is not including roles. Check `JwtService.generateToken()`:

```java
private Map<String, Object> generateExtraClaims(UserDetails userDetails) {
    Map<String, Object> extraClaims = new HashMap<>();
    List<String> roles = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());
    extraClaims.put("roles", roles);  // ✅ This line is critical!
    return extraClaims;
}
```

### Issue 3: Frontend Still Shows Old Error

**Fix:** Clear browser completely:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then reload page
location.reload();
```

---

## 📋 Quick Checklist

Before testing, ensure:

- [ ] `JwtService.java` has `extractRoles()` method
- [ ] `JwtAuthenticationFilter.java` uses `jwtService.extractRoles(jwt)`
- [ ] `SecurityConfig.java` uses `.hasRole("ADMIN")` (without ROLE_ prefix)
- [ ] Backend is restarted after changes
- [ ] Frontend localStorage is cleared
- [ ] Fresh login with admin/admin credentials

---

## 🎓 Understanding the Fix

**Why was it failing?**
1. JWT token contains roles: `["ROLE_USER", "ROLE_ADMIN"]`
2. But JwtAuthenticationFilter was using `userDetails.getAuthorities()`
3. This gets authorities from database, not from JWT
4. If database authorities don't match JWT, authorization fails

**How does the fix work?**
1. Extract roles directly from JWT token claims
2. Convert roles to `SimpleGrantedAuthority` objects
3. Set these as authorities in `UsernamePasswordAuthenticationToken`
4. Spring Security uses these authorities for authorization
5. When checking `.hasRole("ADMIN")`, Spring looks for "ROLE_ADMIN" in authorities
6. Since we extracted it from JWT, authorization succeeds!

---

## 📞 Need More Help?

If still not working, please provide:

1. **Backend logs** when starting the application
2. **Output of Test 1, 2, and 3** from the testing section
3. **Browser console output** after logging in
4. **Screenshot** of the error message

This will help diagnose the exact issue! 🔍

---

## ✅ Success Indicators

You've fixed it when:
1. ✅ Test 3 (curl command) returns `HTTP_STATUS:201`
2. ✅ Browser console shows roles: `["ROLE_USER", "ROLE_ADMIN"]`
3. ✅ Creating auction in frontend shows success message
4. ✅ New auction appears in auction list
5. ✅ No more "Permission denied" errors

🎉 **Good luck! You're almost there!**
