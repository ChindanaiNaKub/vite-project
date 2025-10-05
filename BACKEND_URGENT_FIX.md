# 🔴 CRITICAL: Backend Login is Broken!

## Current Status
**Even the login endpoint is returning 403 Forbidden!**

```bash
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@admin.com","password":"admin"}'
  
# Returns: HTTP 403 Forbidden (WRONG! Should be 200 OK)
```

## What This Means
Your Spring Boot backend's SecurityConfig is **blocking the authentication endpoint itself**. This means:
- ❌ Users cannot log in
- ❌ Cannot get JWT tokens
- ❌ Cannot create auctions or events
- ❌ Refresh token endpoint also blocked

## Frontend Status
✅ Frontend is now fixed (won't incorrectly logout on 403)  
❌ But backend needs immediate fixing

## What You Need to Do RIGHT NOW

### 1. Fix Your SecurityConfig

Your Spring Boot `SecurityConfig` must look like this:

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
                // ⚠️ CRITICAL: Auth endpoints MUST be permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                
                // Public GET endpoints
                .requestMatchers(HttpMethod.GET, "/events/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/auction-items/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/students/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/organizers/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/organizations/**").permitAll()
                
                // Admin-only endpoints for creating/updating
                .requestMatchers(HttpMethod.POST, "/events").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/events/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/events/**").hasRole("ADMIN")
                
                .requestMatchers(HttpMethod.POST, "/auction-items").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/auction-items/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/auction-items/**").hasRole("ADMIN")
                
                .requestMatchers(HttpMethod.POST, "/organizations").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/organizations/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/organizations/**").hasRole("ADMIN")
                
                // File upload
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
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("x-total-count", "Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 2. Fix Your JWT Authentication Filter

Your `JwtAuthenticationFilter` should skip `/api/v1/auth/**` endpoints:

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Skip JWT processing for auth endpoints
        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // ... rest of your JWT processing code ...
    }
}
```

### 3. Check Your AuthenticationController

Make sure your refresh endpoint doesn't require Authorization header:

```java
@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {
    
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
        @RequestBody AuthenticationRequest request
    ) {
        // Your login logic
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
        @RequestBody RegisterRequest request
    ) {
        // Your registration logic
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refresh(
        @RequestBody RefreshTokenRequest request  // Contains refresh_token
    ) {
        // ⚠️ Should NOT read Authorization header
        // Should only use refresh_token from request body
        String refreshToken = request.getRefreshToken();
        // ... validate and generate new tokens ...
    }
}
```

### 4. Verify Your JWT Token Contains Roles

In your JWT generation code:

```java
public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    
    // ⚠️ CRITICAL: Must include roles
    List<String> roles = user.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .collect(Collectors.toList());
    claims.put("roles", roles);  // Should be ["ROLE_ADMIN"] for admin users
    
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(user.getUsername())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
        .signWith(getSigningKey(), SignatureAlgorithm.HS256)
        .compact();
}
```

## Testing After Fix

### Step 1: Test Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@admin.com","password":"admin"}'
```

Expected: HTTP 200 with `{access_token: "...", refresh_token: "...", user: {...}}`

### Step 2: Decode Token
```bash
# Copy the access_token from step 1
# Paste it here: https://jwt.io
# Or decode in terminal:
echo "YOUR_TOKEN" | cut -d'.' -f2 | base64 -d | jq
```

Should contain:
```json
{
  "sub": "admin@admin.com",
  "roles": ["ROLE_ADMIN"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Step 3: Test Create Auction
```bash
TOKEN="YOUR_ACCESS_TOKEN_HERE"

curl -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test auction","type":"Electronics","successfulBid":100}'
```

Expected: HTTP 201 Created

### Step 4: Test in Frontend
1. Restart your Spring Boot backend
2. In browser, go to `http://localhost:5173`
3. Login with admin@admin.com / admin
4. Click "New Auction"
5. Fill form and submit
6. Should see success message and auction list

## Common Mistakes to Avoid

1. ❌ **DON'T** put specific auth paths before the wildcard:
   ```java
   .requestMatchers("/api/v1/auth/authenticate").permitAll()
   .requestMatchers("/api/v1/auth/**").permitAll()
   // ❌ This is redundant
   ```
   
2. ✅ **DO** use the wildcard:
   ```java
   .requestMatchers("/api/v1/auth/**").permitAll()
   // ✅ This covers all auth endpoints
   ```

3. ❌ **DON'T** use `hasRole("ROLE_ADMIN")` (with ROLE_ prefix in code):
   ```java
   .requestMatchers(HttpMethod.POST, "/events").hasRole("ROLE_ADMIN")  // ❌ Wrong
   ```
   
4. ✅ **DO** use `hasRole("ADMIN")` (without ROLE_ prefix):
   ```java
   .requestMatchers(HttpMethod.POST, "/events").hasRole("ADMIN")  // ✅ Correct
   ```
   Spring automatically adds the "ROLE_" prefix

5. ❌ **DON'T** require Authorization header for refresh endpoint
   
6. ✅ **DO** use refresh_token from request body only

## Files to Check

1. `SecurityConfig.java` - Main security configuration
2. `JwtAuthenticationFilter.java` - Should skip /api/v1/auth/**
3. `AuthenticationController.java` - Refresh endpoint implementation
4. `JwtService.java` - Token generation (must include roles)
5. `CorsConfig.java` or CORS in SecurityConfig

## Need Help?

If still not working after these fixes:
1. Share your SecurityConfig.java file
2. Share the output of test commands above
3. Check Spring Boot logs for errors
