# Google OAuth Setup Guide

## ⚠️ If you're getting "Can't continue with google.com" error:

### **Step 1: Check Google Cloud Console Configuration**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **"APIs & Services" → "Credentials"**
4. Click on your OAuth 2.0 Client ID

### **Step 2: Configure Authorized JavaScript Origins**
**CRITICAL:** Add these exact URLs to "Authorized JavaScript origins":
   - `http://localhost:8080`
   - `http://127.0.0.1:8080`

### **Step 2.1: Configure Authorized Redirect URIs**
**IMPORTANT:** Also add these to "Authorized redirect URIs":
   - `http://localhost:8080/auth`
   - `http://127.0.0.1:8080/auth`

### **Step 3: Configure OAuth Consent Screen**
1. Go to **"APIs & Services" → "OAuth consent screen"**
2. Choose **"External"** user type (unless you have Google Workspace)
3. Fill in **required fields**:
   - App name: `CareerPathak`
   - User support email: Your email
   - Developer contact information: Your email
4. **Save and continue**
5. Add test users (your email) if in testing mode

### **Step 4: Verify API is Enabled**
1. Go to **"APIs & Services" → "Library"**
2. Search for **"Google Identity Services API"**
3. **Enable it** if not already enabled

## 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing project
3. Enable the Google+ API or Google Identity Services
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen if not done already
6. For Application type, choose "Web application"
7. Add authorized origins:
   - `http://localhost:8080` (for development)
   - Your production domain when deploying
8. Copy the Client ID

## 2. Environment Configuration

1. Open the `.env` file in your project root
2. Replace `your_google_client_id_here` with your actual Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
   ```

## 3. Testing the Authentication

1. Run the development server: `npm run dev`
2. Open http://localhost:8080
3. Click "Explore Careers" button
4. You'll be redirected to the authentication page
5. Click "Continue with Google" to test OAuth

## 4. How it Works

- **AuthContext**: Manages authentication state globally
- **GoogleSignIn**: Handles Google OAuth integration using Google Identity Services
- **ProtectedRoute**: Ensures only authenticated users can access certain pages
- **AuthPage**: Provides the sign-in interface
- **CareersPage**: Protected page that requires authentication

## 5. Features

- ✅ Google OAuth integration
- ✅ User session persistence (localStorage)
- ✅ Protected routes
- ✅ Clean sign-in/sign-out flow
- ✅ User profile display
- ✅ Responsive design using shadcn components

## 6. Next Steps

After authentication works, you can:
- Add more OAuth providers (GitHub, Facebook, etc.)
- Connect to a backend API for user data persistence
- Add user profile management
- Implement role-based access control
