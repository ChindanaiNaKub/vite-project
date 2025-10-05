# Prompt for Backend AI - Fix Authentication Issues

---

## 🔴 PROBLEM DESCRIPTION

My Spring Boot backend is causing authentication issues with my Vue.js frontend. When users try to create auction items or events, they get **403 Forbidden** errors and are logged out, even though they are logged in with valid JWT tokens as admin users.

## 🐛 SYMPTOMS

1. **User is logged in as admin** with valid access_token and refresh_token
2. **POST to `/auction-items`** returns **403 Forbidden**
3. **POST to `/api/v1/auth/refresh`** also returns **403 Forbidden**
4. This causes the user to be logged out with "session expired" message

## 📊 CURRENT BEHAVIOR

### Frontend Console Logs:
```
isLoggedIn: true
isAdmin: true
hasToken: true
hasRefreshToken: true
userName: "admin admin"

Attempting to save auction item: {description: "...", type: "...", successfulBid: 0}
POST http://localhost:8080/auction-items → 403 Forbidden

Axios interceptor caught error: {status: 403, url: "/auction-items", method: "post"}
Token check: {hasToken: true, status: 403}
Attempting to refresh token...
POST http://localhost:8080/api/v1/auth/refresh → 403 Forbidden
Token refresh failed
Logging out user...
```

## ✅ EXPECTED BEHAVIOR

1. Admin users should be able to POST to `/auction-items` with valid JWT token
2. POST to `/api/v1/auth/refresh` should accept `{refresh_token: "..."}` in body and return new tokens
3. Users should NOT be logged out when their tokens are still valid

## 🔍 WHAT TO CHECK AND FIX

### Issue 1: POST /auction-items Returns 403 Even with Valid Token

**Check**:
1. Is the `/auction-items` POST endpoint properly configured in SecurityConfig?
2. Does it require `ROLE_ADMIN` or specific permissions?
3. Is CORS properly configured for POST requests?
4. Is the JWT token being validated correctly?

**Fix Needed**:
```java
// SecurityConfig.java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            // Public endpoints
            .requestMatchers("/api/v1/auth/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/events").permitAll()
            .requestMatchers(HttpMethod.GET, "/events/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/auction-items").permitAll()
            .requestMatchers(HttpMethod.GET, "/auction-items/**").permitAll()
            
            // Admin-only endpoints
            .requestMatchers(HttpMethod.POST, "/events").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/auction-items").hasRole("ADMIN")  // ← CHECK THIS
            .requestMatchers(HttpMethod.PUT, "/events/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/auction-items/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/events/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/auction-items/**").hasRole("ADMIN")
            
            .anyRequest().authenticated()
        )
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authenticationProvider(authenticationProvider())
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    
    return http.build();
}
```

**Also check**: 
- Is the JWT filter being applied correctly?
- Is the token being extracted from the Authorization header?
- Are the roles being read correctly from the token?

### Issue 2: POST /api/v1/auth/refresh Returns 403

**Check**:
1. Is `/api/v1/auth/refresh` marked as `permitAll()`?
2. Is the refresh endpoint expecting the token in a specific format?
3. Is there any authentication filter interfering with the refresh endpoint?

**Fix Needed**:
```java
// SecurityConfig.java
.requestMatchers("/api/v1/auth/**").permitAll()  // ← This should include /refresh
```

**Also check the RefreshController/AuthController**:
```java
@PostMapping("/refresh")
public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
    try {
        String refreshToken = request.getRefresh_token();
        
        // Validate refresh token
        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Invalid refresh token");
        }
        
        // Generate new tokens
        String username = jwtService.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        
        String newAccessToken = jwtService.generateToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);
        
        return ResponseEntity.ok(new AuthResponse(newAccessToken, newRefreshToken, user));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body("Token refresh failed: " + e.getMessage());
    }
}
```

### Issue 3: CORS Configuration

**Check CORS for POST requests**:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setExposedHeaders(Arrays.asList("x-total-count", "X-Total-Count", "Authorization"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Issue 4: JWT Filter Not Applying Authorization Header

**Check JwtAuthenticationFilter**:
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Skip for auth endpoints
        if (request.getServletPath().contains("/api/v1/auth")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);
        
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

## 🧪 TEST THESE ENDPOINTS

### Test 1: Check if admin token is valid
```bash
# Get a fresh token by logging in
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@admin.com",
    "password": "admin"
  }'

# You should get back:
# {"access_token": "...", "refresh_token": "...", "user": {...}}
```

### Test 2: Test creating auction with token
```bash
# Use the access_token from above
TOKEN="your_access_token_here"

curl -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test auction item",
    "type": "Electronics",
    "successfulBid": 100
  }'

# Should return: 200/201 with the created auction item
# Currently returns: 403 Forbidden ❌
```

### Test 3: Test refresh token
```bash
REFRESH_TOKEN="your_refresh_token_here"

curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}"

# Should return: 200 with new access_token and refresh_token
# Currently returns: 403 Forbidden ❌
```

## 📋 CHECKLIST FOR BACKEND FIX

Please check and fix the following:

- [ ] SecurityConfig allows POST to `/auction-items` for `ROLE_ADMIN`
- [ ] SecurityConfig allows POST to `/events` for `ROLE_ADMIN`
- [ ] SecurityConfig marks `/api/v1/auth/**` as `permitAll()` (including /refresh)
- [ ] CORS configuration allows POST requests from `http://localhost:5173`
- [ ] CORS configuration includes `Authorization` header
- [ ] JWT filter correctly extracts and validates tokens
- [ ] JWT filter skips `/api/v1/auth/**` endpoints
- [ ] Refresh endpoint doesn't require Authorization header
- [ ] Refresh endpoint properly validates refresh_token from request body
- [ ] User roles include "ROLE_ADMIN" (not just "ADMIN")
- [ ] Token expiration times are reasonable (access: 15-30 min, refresh: days/weeks)

## 🎯 EXPECTED RESULT AFTER FIX

1. Admin user logs in → Gets access_token and refresh_token ✅
2. Admin POSTs to `/auction-items` with token → **201 Created** ✅
3. If token expires → Frontend calls `/refresh` → **200 OK with new tokens** ✅
4. User stays logged in and can continue working ✅

## 📝 ADDITIONAL INFO

### Frontend is sending:
- **Authorization header**: `Bearer <access_token>`
- **Request body**: `{description: "...", type: "...", successfulBid: 0}`
- **User has roles**: `["ROLE_USER", "ROLE_ADMIN"]`

### Backend should accept:
- POST requests with valid JWT token
- Admin role for creating resources
- Refresh requests without Authorization header (only refresh_token in body)

## 🚨 PRIORITY

**HIGH** - Users cannot create any content (events, auctions) and are constantly logged out. This breaks core functionality.

---

Please review and fix the backend security configuration, JWT filter, and authentication endpoints to allow admin users to create resources without getting 403 errors.
