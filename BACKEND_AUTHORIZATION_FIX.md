# 🔴 Backend Still Blocking Admin Users - Authorization Issue

## Current Status

✅ **JWT Token Generation**: Working - Token contains `["ROLE_USER", "ROLE_ADMIN"]`  
✅ **Authentication**: Working - Login returns valid token  
❌ **Authorization**: NOT Working - Backend returns 403 even with ROLE_ADMIN

## Test Results

### Token Contains Correct Roles ✅
```json
{
  "roles": ["ROLE_USER", "ROLE_ADMIN"],
  "sub": "admin",
  "iat": 1759436629,
  "exp": 1759440229
}
```

### But Backend Still Returns 403 ❌
```bash
curl -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer <token_with_ROLE_ADMIN>" \
  -d '{"description":"Test","type":"Electronics","successfulBid":100}'

Response: 403 Forbidden
```

## Root Cause

The JWT token has the roles, but **the JwtAuthenticationFilter is not properly extracting them and setting them in Spring Security's SecurityContext**.

## The Fix Needed

Your `JwtAuthenticationFilter` needs to extract roles from the JWT and set them as authorities in Spring Security.

### Check Your JwtAuthenticationFilter

It should look like this:

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Skip auth endpoints
        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Get token from header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);
        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                // ⚠️ CRITICAL: Extract roles from JWT and create authorities
                List<String> roles = jwtService.extractRoles(jwt);  // You need to add this method!
                
                List<GrantedAuthority> authorities = roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    authorities  // ← Use authorities from JWT token, not from userDetails!
                );
                
                authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### Add Method to JwtService

You need to add this method to `JwtService.java`:

```java
public List<String> extractRoles(String token) {
    Claims claims = extractAllClaims(token);
    List<String> roles = claims.get("roles", List.class);
    return roles != null ? roles : new ArrayList<>();
}
```

## Why This is Needed

When Spring Security checks if a user has `ROLE_ADMIN`:
1. It looks at the `Authentication` object in `SecurityContextHolder`
2. It checks the `authorities` in that object
3. If the authorities don't include "ROLE_ADMIN", it returns 403

Your JWT has the roles, but **you're not putting them into the SecurityContext**, so Spring Security can't see them!

## Alternative: Simpler Fix

If you don't want to extract roles from JWT, you can rely on the database:

```java
// In JwtAuthenticationFilter, use userDetails authorities:
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    userDetails,
    null,
    userDetails.getAuthorities()  // ← This gets roles from database
);
```

But this requires ensuring:
1. `UserDetailsService.loadUserByUsername()` returns user with correct authorities
2. Your `User` entity properly implements `getAuthorities()`

## Testing After Fix

### 1. Restart Backend
```bash
# In your backend project directory
./mvnw spring-boot:run
# or
./gradlew bootRun
```

### 2. Get New Token
```bash
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' | jq -r '.access_token'
```

### 3. Test Create Auction
```bash
TOKEN="<paste_token_here>"

curl -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:8080/auction-items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Test auction","type":"Electronics","successfulBid":100}'
```

Expected: **HTTP_STATUS:201** ✅

### 4. Test in Frontend
1. Logout in browser
2. Clear localStorage
3. Login as admin / admin
4. Try to create auction
5. Should work! 🎉

## Quick Diagnosis Commands

### Check if User Has Authorities in Database
```bash
# If you have H2 console enabled, check:
SELECT * FROM users WHERE username = 'admin';
SELECT * FROM user_roles WHERE user_id = 1;
```

### Check SecurityConfig Allows ROLE_ADMIN
The SecurityConfig should have:
```java
.requestMatchers(HttpMethod.POST, "/auction-items").hasRole("ADMIN")
```

NOT:
```java
.requestMatchers(HttpMethod.POST, "/auction-items").hasRole("ROLE_ADMIN")  // ❌ Wrong!
```

Spring automatically adds the "ROLE_" prefix, so use `hasRole("ADMIN")` without the prefix.

## Summary

| Component | Status | Issue |
|-----------|--------|-------|
| JWT Generation | ✅ | Contains roles correctly |
| Authentication | ✅ | Login works |
| Token Validation | ✅ | Token is valid |
| Role Extraction | ❌ | Roles not put into SecurityContext |
| Authorization | ❌ | Returns 403 because no authorities found |

## Files to Check/Modify

1. **`JwtAuthenticationFilter.java`** - Add role extraction and use those authorities
2. **`JwtService.java`** - Add `extractRoles(String token)` method
3. **`User.java`** (entity) - Ensure `getAuthorities()` returns correct roles
4. **`UserDetailsService`** implementation - Ensure it loads user with roles

## Need Backend Code?

If you can share your backend project location or the following files, I can provide exact fixes:
- `JwtAuthenticationFilter.java`
- `JwtService.java`
- `User.java` (the entity)
- `UserDetailsService` implementation

The issue is 100% in the backend authorization logic, not the frontend! 🎯
