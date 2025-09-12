# 👤 User Profile Management System

## 🎯 Overview

A comprehensive user profile management system with offline capabilities, built for CareerPathak. This system allows students to create, edit, and manage their profiles with full offline support and background synchronization.

## ✨ Features

### Core Features
- **Complete Profile Management**: Create, edit, view, and delete user profiles
- **Offline-First Architecture**: Full functionality even without internet connection
- **Background Synchronization**: Automatic sync when connection is restored
- **Multi-language Support**: Interface available in 5 languages (EN, HI, UR, KS, DG)
- **Real-time Status Indicators**: Visual feedback for online/offline and sync status

### Profile Data Captured
- **Personal Information**: Name, email, phone, date of birth, address
- **Academic Background**: Current class, school, board, subjects, performance
- **Career Aspirations**: Interested fields and career goals
- **Preferences**: Language, theme, notification settings

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand with persistence
- **Offline Storage**: IndexedDB via idb library
- **UI Components**: shadcn/ui
- **Background Sync**: Service Worker API

### Data Flow
```
User Input → React Hook Form → Zustand Store → IndexedDB → Service Worker → Backend API
```

## 📁 File Structure

```
src/
├── stores/
│   └── profileStore.ts          # Zustand store for profile management
├── services/
│   ├── profileDatabase.ts       # IndexedDB operations
│   └── syncService.ts           # Background sync logic
├── components/
│   └── profile/
│       ├── ProfileForm.tsx      # Form component with validation
│       └── ProfileView.tsx      # Profile display component
├── pages/
│   ├── ProfilePage.tsx          # Main profile page
│   ├── CreateProfilePage.tsx    # Profile creation page
│   └── EditProfilePage.tsx      # Profile editing page
└── public/
    └── sw.js                    # Service Worker for background sync
```

## 🚀 Usage

### 1. Create Profile
```tsx
import { CreateProfilePage } from '@/pages/CreateProfilePage';

// Navigate to /profile/create
// Fill out the comprehensive form
// Profile saved locally and synced when online
```

### 2. View Profile
```tsx
import { ProfilePage } from '@/pages/ProfilePage';

// Navigate to /profile
// View complete profile with sync status
// Access edit options
```

### 3. Edit Profile
```tsx
import { EditProfilePage } from '@/pages/EditProfilePage';

// Navigate to /profile/edit
// Modify profile data with form validation
// Changes saved with versioning and sync queue
```

### 4. Using the Store
```tsx
import { useProfileStore } from '@/stores/profileStore';

const MyComponent = () => {
  const { 
    currentProfile, 
    createProfile, 
    updateProfile, 
    isLoading, 
    isOnline 
  } = useProfileStore();

  // Create new profile
  const handleCreate = async (data) => {
    await createProfile(data);
  };

  // Update existing profile
  const handleUpdate = async (updates) => {
    await updateProfile(updates);
  };

  return (
    <div>
      {isOnline ? 'Online' : 'Offline'}
      {currentProfile && <ProfileView profile={currentProfile} />}
    </div>
  );
};
```

## 🔄 Offline Functionality

### Automatic Offline Detection
- Network status monitoring
- Visual indicators for connection state
- Graceful degradation of features

### Local Storage
- **IndexedDB**: Primary storage for profiles
- **Zustand Persist**: Store sync state
- **Sync Queue**: Track pending changes

### Background Sync
```javascript
// Service Worker automatically syncs when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'profile-sync') {
    event.waitUntil(syncProfileData());
  }
});
```

## 📊 Database Schema

### Profile Structure
```typescript
interface UserProfile {
  id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  academicBackground: {
    currentClass: string;
    school: string;
    board: string;
    subjects: string[];
    percentage: number;
    aspirations: string[];
    interestedFields: string[];
  };
  preferences: {
    language: 'en' | 'hi' | 'ur' | 'ks' | 'dg';
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    syncStatus: 'synced' | 'pending' | 'conflict' | 'offline';
    version: number;
  };
}
```

### IndexedDB Stores
1. **profiles**: Main profile data with indexes
2. **syncQueue**: Pending sync operations

## 🔧 Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:3001/api
```

### Sync Settings
```typescript
// Configurable in syncService.ts
const SYNC_RETRY_LIMIT = 3;
const SYNC_RETRY_DELAY = 30000; // 30 seconds
```

## 🧪 Testing Offline Mode

### Manual Testing
1. **Create Profile Offline**:
   - Disconnect internet
   - Navigate to `/profile/create`
   - Fill and submit form
   - Check localStorage for data

2. **Sync When Online**:
   - Reconnect internet
   - Check browser DevTools > Application > IndexedDB
   - Verify sync queue processing

3. **Edit Profile Offline**:
   - Go offline mid-edit
   - Save changes
   - Verify offline indicator appears

### Browser DevTools
- **Application Tab > IndexedDB**: View stored profiles
- **Network Tab**: Monitor sync requests
- **Console**: Check sync logs

## 🔐 Security Considerations

### Data Protection
- Client-side validation with Zod schemas
- Sanitized form inputs
- No sensitive data in localStorage keys

### Sync Security
- Authentication tokens for API calls
- Conflict resolution for concurrent edits
- Version control for data integrity

## 🎨 UI/UX Features

### Visual Indicators
- **Online/Offline Status**: Green/Yellow indicators
- **Sync Status**: Icons showing sync state
- **Loading States**: Proper loading feedback
- **Form Validation**: Real-time error messages

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly form controls

## 🚀 Performance Optimizations

### Lazy Loading
- Route-based code splitting
- Component lazy loading
- Image optimization

### Caching Strategy
- ServiceWorker caching for static assets
- IndexedDB for dynamic data
- Efficient query indexes

### Bundle Optimization
- Tree shaking for unused code
- Minification in production
- Gzip compression

## 📱 Mobile Compatibility

### PWA Features
- Service Worker registration
- Offline functionality
- Background sync
- Push notifications (future)

### Mobile-Specific
- Touch-friendly forms
- Responsive breakpoints
- Native app feel

## 🔮 Future Enhancements

### Advanced Features
- [ ] Profile photo upload with offline caching
- [ ] Advanced conflict resolution UI
- [ ] Bulk profile operations
- [ ] Profile sharing functionality
- [ ] Analytics and insights

### Technical Improvements
- [ ] Real-time collaboration
- [ ] WebRTC for peer-to-peer sync
- [ ] Advanced compression for large profiles
- [ ] Encrypted local storage

## 🐛 Troubleshooting

### Common Issues

**Profile not saving offline:**
```typescript
// Check IndexedDB initialization
await ProfileDB.init();
```

**Sync not working:**
```typescript
// Verify service worker registration
navigator.serviceWorker.getRegistration().then(console.log);
```

**Form validation errors:**
```typescript
// Check Zod schema compatibility
const result = profileSchema.safeParse(formData);
if (!result.success) {
  console.log(result.error.issues);
}
```

### Debug Commands
```javascript
// Check sync queue
ProfileDB.getSyncQueue().then(console.log);

// Check profile count
ProfileDB.getAllProfiles().then(profiles => console.log(profiles.length));

// Force sync
useProfileStore.getState().syncPendingChanges();
```

## 📚 API Reference

### Store Methods
- `createProfile(data)`: Create new profile
- `updateProfile(updates)`: Update existing profile
- `deleteProfile()`: Delete current profile
- `loadProfile(userId)`: Load profile by ID
- `syncPendingChanges()`: Manual sync trigger

### Database Methods
- `ProfileDB.saveProfile(profile)`: Save to IndexedDB
- `ProfileDB.getProfile(id)`: Retrieve profile
- `ProfileDB.addToSyncQueue(action, data)`: Queue sync operation

---

**Built with ❤️ for the students of Jammu & Kashmir**
