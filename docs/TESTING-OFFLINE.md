# Testing Offline Functionality - Quick Guide

## Overview
This guide helps you test the offline functionality of the OPT Plus Digital System.

## Prerequisites
- Laravel app running: `php artisan serve` or Herd
- Vite dev server running: `npm run dev` (or use production build)
- Modern browser (Chrome/Edge recommended for DevTools)

## Test Scenarios

### Scenario 1: Online to Offline Measurement Entry

**Goal**: Verify measurements can be saved offline and synced later

**Steps:**
1. **Setup**
   - Open browser to `http://localhost:8000`
   - Login as a BHW user
   - Open DevTools (F12)
   - Go to **Application** tab

2. **Verify Service Worker**
   - Click "Service Workers" in left sidebar
   - Should see service worker registered and activated
   - Status should be "activated and running"

3. **Verify IndexedDB**
   - Click "IndexedDB" in left sidebar
   - Expand `opt-plus-offline` database
   - Should see 3 object stores:
     - `measurements`
     - `children`
     - `sync-queue`

4. **Go Offline**
   - Check the "Offline" checkbox in Service Workers section
   - OR use Network tab → "Offline" throttling preset
   - Offline indicator should appear (orange/red badge)

5. **Add Measurement While Offline**
   - Navigate to any child profile
   - Click "Add Measurement"
   - **Expected**: Amber alert appears: "You are offline..."
   - Fill in the form:
     - Measurement Date: Today
     - Weight: 10.5 kg
     - Height: 75.0 cm
     - MUAC: 13.5 cm
     - Notes: "Test offline measurement"
   - **Expected**: Submit button says "Save Offline"
   - Click "Save Offline"
   - **Expected**: 
     - Green success alert appears
     - Message: "Saved offline successfully - will sync"
     - Button disabled and shows "Saved ✓"
     - Redirects to child profile after 2 seconds

6. **Verify Data Saved to IndexedDB**
   - Go back to DevTools → Application → IndexedDB
   - Expand `opt-plus-offline` → `measurements`
   - Right-click → "Clear"... wait, don't clear!
   - Click to view entries
   - **Expected**: Your measurement is stored with:
     - childId
     - measurementDate
     - weightKg: 10.5
     - heightLengthCm: 75
     - muacCm: 13.5
     - notes
     - syncStatus: "pending"
     - timestamp

7. **Check Offline Indicator**
   - Look at bottom-right corner
   - **Expected**: Badge shows "1 pending"
   - **Expected**: Color is blue/orange (sync pending)
   - **Expected**: "Manual Sync" button visible

8. **Go Back Online**
   - Uncheck "Offline" in DevTools
   - OR change Network throttling to "No throttling"
   - Wait 2-3 seconds
   - **Expected**: Offline indicator changes to "Syncing..."
   - **Expected**: Shows spinner animation
   - **Expected**: After ~2 seconds, indicator disappears (online)

9. **Verify Sync Happened**
   - Open Network tab in DevTools
   - Look for POST request to `/children/{id}/measurements`
   - **Expected**: Status 201 (Created) or 302 (Redirect)
   - Go to IndexedDB → measurements
   - **Expected**: syncStatus changed to "synced"
   - OR measurement removed from IndexedDB (depending on implementation)

10. **Verify on Server**
    - Go to child profile page
    - Refresh page
    - **Expected**: Your offline measurement appears in the list
    - **Expected**: WHO z-scores calculated
    - **Expected**: Growth chart updated

**✅ Pass Criteria:**
- ✅ Offline alert appears when offline
- ✅ Form saves to IndexedDB
- ✅ Success message shown
- ✅ Offline indicator shows pending count
- ✅ Auto-sync when back online
- ✅ Measurement appears on server
- ✅ No duplicate entries

---

### Scenario 2: Start Offline (Cold Start)

**Goal**: Verify app works when starting already offline

**Steps:**
1. **Prepare**
   - Close all browser tabs
   - Open DevTools first
   - Set Network to "Offline"
   - OR turn off Wi-Fi/disconnect ethernet

2. **Open App**
   - Navigate to `http://localhost:8000`
   - **Expected**: Cached version loads
   - **Expected**: Offline indicator visible immediately
   - **Expected**: UI is fully functional

3. **Browse App**
   - Navigate to different pages
   - **Expected**: All static content loads from cache
   - **Expected**: Some pages may show offline fallback
   - Try: Dashboard, Children list, Reports

4. **Try to Add Measurement**
   - Go to a child profile (if cached)
   - Click "Add Measurement"
   - **Expected**: Amber offline alert
   - Fill and submit form
   - **Expected**: Saves to IndexedDB

5. **Reconnect**
   - Turn Wi-Fi back on
   - Wait for auto-sync
   - **Expected**: All pending measurements sync

**✅ Pass Criteria:**
- ✅ App loads from cache when offline
- ✅ Static pages accessible
- ✅ Forms work offline
- ✅ Auto-sync on reconnection

---

### Scenario 3: Multiple Offline Measurements

**Goal**: Verify multiple measurements queue correctly

**Steps:**
1. Go offline (DevTools → Offline)
2. Add 3 measurements for different children
3. Verify all 3 appear in IndexedDB
4. Offline indicator shows "3 pending"
5. Go back online
6. Verify all 3 sync successfully
7. No duplicates on server

**✅ Pass Criteria:**
- ✅ All measurements queued
- ✅ Count accurate
- ✅ All sync in order
- ✅ No duplicates

---

### Scenario 4: Manual Sync

**Goal**: Test manual sync button

**Steps:**
1. Go offline
2. Add a measurement
3. Stay offline
4. Click "Manual Sync" button on offline indicator
5. **Expected**: Shows "Offline - Cannot sync"
6. Go online
7. Click "Manual Sync" button
8. **Expected**: Triggers immediate sync
9. Verify measurement on server

**✅ Pass Criteria:**
- ✅ Button disabled when offline
- ✅ Button works when online
- ✅ Sync happens immediately

---

### Scenario 5: Rapid Online/Offline Switching

**Goal**: Test robustness under unstable connection

**Steps:**
1. Start online
2. Go offline → add measurement → go online → repeat 5 times
3. Verify all measurements eventually sync
4. Check for duplicates
5. Check for data loss

**✅ Pass Criteria:**
- ✅ All measurements saved
- ✅ All eventually sync
- ✅ No duplicates
- ✅ No crashes or errors

---

## Chrome DevTools Shortcuts

### Service Worker Tab
- **Location**: DevTools → Application → Service Workers
- **Offline Checkbox**: Simulates offline mode
- **Update on reload**: Forces SW update
- **Unregister**: Removes SW (for testing clean install)

### IndexedDB Tab
- **Location**: DevTools → Application → IndexedDB
- **View entries**: Click on object store name
- **Clear store**: Right-click → Clear
- **Refresh**: Click refresh icon to see updates

### Network Tab
- **Location**: DevTools → Network
- **Throttling**: Dropdown to simulate different connection speeds
  - Online (default)
  - Slow 3G
  - Fast 3G
  - Offline
- **Filter**: Filter by type (XHR, JS, CSS, etc.)

### Console Tab
- **View SW logs**: Look for `[Service Worker]` prefix
- **View IndexedDB logs**: Look for `[OfflineDB]` prefix
- **Errors**: Any red errors should be investigated

---

## Common Issues & Solutions

### Issue: Service Worker Not Registering

**Symptoms:**
- No SW in Application tab
- Console error: "Service worker registration failed"

**Solutions:**
1. Check if running on HTTPS or localhost
2. Verify `public/sw.js` exists
3. Check for typos in SW path
4. Clear browser cache and reload
5. Try different browser

**Debug:**
```javascript
// Run in console
navigator.serviceWorker.getRegistration()
  .then(reg => console.log(reg))
  .catch(err => console.error(err));
```

---

### Issue: IndexedDB Not Saving

**Symptoms:**
- No entries in IndexedDB
- Console error: "Failed to save offline"

**Solutions:**
1. Check browser storage quota
2. Verify IndexedDB not disabled
3. Check for private/incognito mode
4. Clear IndexedDB and retry

**Debug:**
```javascript
// Run in console
import { offlineDB } from '@/lib/offline-db';
offlineDB.addMeasurement({
    childId: 'test',
    childName: 'Test Child',
    measurementDate: '2025-01-01',
    weightKg: 10,
    heightLengthCm: 75,
    syncStatus: 'pending',
    timestamp: Date.now()
}).then(() => console.log('Saved!'))
  .catch(err => console.error(err));
```

---

### Issue: Measurements Not Syncing

**Symptoms:**
- Pending count never decreases
- No POST requests in Network tab
- Measurements stay "pending" in IndexedDB

**Solutions:**
1. Verify online status (check `navigator.onLine`)
2. Check Network tab for failed requests
3. Verify API endpoint accessible
4. Check CSRF token validity
5. Try manual sync button

**Debug:**
```javascript
// Check online status
console.log('Online:', navigator.onLine);

// Trigger manual sync
navigator.serviceWorker.ready
  .then(reg => reg.sync.register('sync-measurements'))
  .then(() => console.log('Sync registered'))
  .catch(err => console.error(err));
```

---

### Issue: Duplicate Measurements

**Symptoms:**
- Same measurement appears multiple times
- Sync count doesn't match DB count

**Solutions:**
1. Check server-side duplicate detection
2. Verify syncStatus updates correctly
3. Clear IndexedDB and start fresh
4. Check for race conditions in sync code

**Debug:**
```javascript
// Check pending measurements
offlineDB.getPendingMeasurements()
  .then(measurements => console.log('Pending:', measurements))
  .catch(err => console.error(err));
```

---

## Performance Testing

### Metrics to Monitor

1. **Service Worker Registration Time**
   - Should be < 200ms
   - Check: DevTools → Performance

2. **IndexedDB Write Time**
   - Should be < 50ms per measurement
   - Check: Console logs with timestamps

3. **Sync Time**
   - Should be < 1s per measurement
   - Check: Network tab timing

4. **Cache Hit Rate**
   - Should be > 90% for static assets
   - Check: Network tab (grey = from cache)

5. **Storage Usage**
   - Check: DevTools → Application → Storage
   - Should be < 10MB for typical usage

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 15+ (limited support)
- ✅ Opera 76+

### Feature Support
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Workers | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Background Sync | ✅ | ❌ | ❌ | ✅ |
| Push Notifications | ✅ | ✅ | ⚠️ | ✅ |
| Cache API | ✅ | ✅ | ✅ | ✅ |

**Note**: Background Sync not available in Firefox/Safari, but app will still queue and sync on next page load.

---

## Production Testing

### Pre-Deployment Checklist
- [ ] Test on production build (`npm run build`)
- [ ] Test with real domain (HTTPS required)
- [ ] Test on mobile devices
- [ ] Test different network conditions
- [ ] Test storage limits
- [ ] Test cache invalidation
- [ ] Test service worker updates
- [ ] Verify analytics tracking

### Load Testing
```bash
# Test with multiple concurrent offline users
# Use tools like:
- Apache JMeter
- Lighthouse CI
- WebPageTest
```

---

## Reporting Bugs

When reporting offline functionality bugs, include:

1. **Browser & Version**
   - Chrome 120.0.6099.130

2. **Test Scenario**
   - Scenario 1: Online to Offline

3. **Expected Behavior**
   - Measurement should save to IndexedDB

4. **Actual Behavior**
   - Error: "Failed to save offline"

5. **Console Logs**
   ```
   [OfflineDB] Opening database...
   Error: Version change transaction error
   ```

6. **Network Tab Screenshot**
7. **IndexedDB State Screenshot**
8. **Service Worker State**

---

## Next Steps After Testing

Once all scenarios pass:
1. ✅ Update Sprint 6 progress to 70%
2. 📝 Document any issues found
3. 🔧 Fix critical bugs
4. 🎨 Generate PWA icons
5. 📊 Add child data caching
6. ⚡ Performance optimization
7. 🧪 Write automated tests

---

**Last Updated**: Current Session  
**Tested By**: [Your Name]  
**Status**: Ready for Testing ✅
