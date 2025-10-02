# 🚨 Backend 500 Error - Image Upload Troubleshooting

## Current Issue
You're getting a **500 Internal Server Error** when uploading images. This means:
- ✅ Frontend is working correctly (not sending auth header)
- ✅ Request reaches backend (no connection error)
- ❌ Backend crashes when processing the upload

---

## Step 1: Check Backend Console/Logs

**MOST IMPORTANT:** Look at your backend console output. It should show a detailed error stack trace.

Common errors you might see:

### Error 1: NullPointerException or FileNotFoundException
```
java.lang.NullPointerException
  at com.firebase.storage...
```
**Cause:** Firebase credentials not configured
**Solution:** See Step 2 below

### Error 2: AccessDeniedException
```
java.io.FileNotFoundException: /path/to/images (Permission denied)
```
**Cause:** No write permission to upload directory
**Solution:** See Step 3 below

### Error 3: MaxUploadSizeExceededException
```
org.apache.tomcat.util.http.fileupload.FileUploadBase$FileSizeLimitExceededException
```
**Cause:** File too large
**Solution:** See Step 4 below

### Error 4: ClassNotFoundException
```
java.lang.ClassNotFoundException: com.google.cloud.storage...
```
**Cause:** Missing Firebase dependency
**Solution:** See Step 5 below

---

## Step 2: Fix Firebase Configuration

### Check if you have Firebase setup

**Location:** `src/main/resources/firebase-adminsdk.json` in your backend

If this file doesn't exist or is empty:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as `firebase-adminsdk.json` in `src/main/resources/`

### Check your application.properties

Make sure these are set:
```properties
# Firebase
firebase.database-url=https://your-project.firebaseio.com
firebase.storage-bucket=your-project.appspot.com

# Or if using local storage:
app.upload.path=/tmp/uploads
# Make sure this directory exists!
```

---

## Step 3: Fix File Permissions

### If using local file storage:

```bash
# In your backend project directory
mkdir -p /tmp/uploads
chmod 777 /tmp/uploads

# Or create in project directory:
mkdir -p uploads
chmod 777 uploads
```

### Update application.properties:
```properties
app.upload.path=/tmp/uploads
# Or relative path:
app.upload.path=./uploads
```

---

## Step 4: Check Upload Size Limits

### In application.properties, add:

```properties
# Max file size
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Enable multipart uploads
spring.servlet.multipart.enabled=true
```

---

## Step 5: Verify Dependencies

### In your backend pom.xml, ensure you have:

```xml
<!-- Firebase Admin SDK (if using Firebase) -->
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.1.1</version>
</dependency>

<!-- Apache Commons FileUpload (if using local storage) -->
<dependency>
    <groupId>commons-fileupload</groupId>
    <artifactId>commons-fileupload</artifactId>
    <version>1.5</version>
</dependency>

<!-- Apache Commons IO -->
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.11.0</version>
</dependency>
```

After adding dependencies:
```bash
mvn clean install
```

---

## Step 6: Check Upload Controller Code

Your `uploadImage` endpoint should look like this:

```java
@RestController
public class ImageUploadController {
    
    @PostMapping("/uploadImage")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("image") MultipartFile file) {
        
        try {
            // Log for debugging
            System.out.println("Received file: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            
            // Your upload logic here...
            String imageUrl = uploadService.uploadImage(file);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // IMPORTANT: Log the full error
            e.printStackTrace();
            System.err.println("Upload error: " + e.getMessage());
            
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
```

---

## Step 7: Verify Security Configuration

Make sure BOTH files are configured:

### JwtAuthenticationFilter.java
```java
// Allow upload endpoints without requiring JWT auth
if (path.equals("/uploadImage") || path.equals("/uploadFile")) {
  // Set anonymous authentication
  AnonymousAuthenticationToken anonymousAuth = 
      new AnonymousAuthenticationToken(
          "anonymous", "anonymous", 
          Collections.singletonList(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))
      );
  SecurityContextHolder.getContext().setAuthentication(anonymousAuth);
  filterChain.doFilter(request, response);
  return;
}
```

### SecurityConfiguration.java
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
  http
    .csrf(csrf -> csrf.disable())
    .authorizeHttpRequests(auth -> auth
      .requestMatchers(HttpMethod.POST, "/uploadImage", "/uploadFile").permitAll()
      // ... other matchers ...
    );
}
```

---

## Step 8: Quick Test WITHOUT Frontend

Test your backend directly:

```bash
# Create a test image
curl -X POST http://localhost:8080/uploadImage \
  -F "image=@/path/to/any/image.jpg" \
  -v
```

If this works, the problem was auth-related.
If this fails with 500, the problem is in your upload logic.

---

## Step 9: Enable Debug Logging

Add to `application.properties`:

```properties
# Enable debug logging
logging.level.root=INFO
logging.level.se331.lab=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.security=DEBUG

# Log request details
spring.mvc.log-request-details=true
```

---

## Quick Diagnosis Checklist

Run through this checklist:

- [ ] Backend is running (check terminal)
- [ ] Check backend console for error stack trace
- [ ] Firebase credentials file exists (if using Firebase)
- [ ] Upload directory exists and has write permissions
- [ ] Dependencies are in pom.xml
- [ ] Security configuration allows /uploadImage
- [ ] Controller method has proper exception handling
- [ ] Try uploading with curl command directly

---

## Most Common Cause

**90% of the time**, the 500 error is due to one of these:

1. ❌ **Missing Firebase credentials** - File not found or not configured
2. ❌ **Upload directory doesn't exist** - Create `/tmp/uploads` or `./uploads`
3. ❌ **Missing dependency** - Add Firebase or Commons FileUpload to pom.xml
4. ❌ **No error handling** - Controller throws exception without catching it

---

## What To Do RIGHT NOW

1. **Look at your backend console** - what's the error?
2. **Share the error message** - paste the stack trace
3. **Check if Firebase file exists** - `ls src/main/resources/firebase-adminsdk.json`
4. **Try curl test** - test backend directly without frontend

Once you tell me what error you see in the backend console, I can give you the exact fix! 🎯
