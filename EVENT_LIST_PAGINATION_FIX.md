# Event List and Pagination Bug Fixes

## Issues Fixed

### 1. New Event Not Showing After Creation
**Problem**: After creating a new event, it wouldn't appear in the event list when returning to the events page.

**Root Cause**: The event detail page redirect didn't trigger a refresh of the event list data.

**Solution**: 
- Changed redirect destination from event detail page to event list page
- This ensures the event list is reloaded with fresh data from the server
- Modified in `src/views/event/EventFormView.vue`

### 2. Pagination Bug - Incorrect Page Size
**Problem**: Pagination would sometimes show 1 item, sometimes 2 items, even when default was set to 2.

**Root Causes**:
1. In `EventListView.vue` line 56: `EventService.getEvents(1, page.value)` was hardcoding the page size to `1` instead of using `pageSize.value`
2. The code was fetching events twice - once with wrong parameters and once with `updateKeyword`

**Solution**:
- Fixed the `watchEffect` to use correct parameters: `EventService.getEvents(pageSize.value, page.value)`
- Removed duplicate data fetching by checking if keyword is empty first
- Now properly uses the pageSize prop throughout the component

## Changes Made

### File: `src/views/EventListView.vue`

#### Before:
```typescript
onMounted(() => {
  watchEffect(() => {
    EventService.getEvents(1, page.value)  // ❌ Wrong: hardcoded 1
      .then((response) => {
        events.value = response.data
        totalEvents.value = Number(response.headers['x-total-count'])
      })
    updateKeyword(keyword.value)  // ❌ Duplicate fetch
  })  
})
```

#### After:
```typescript
onMounted(() => {
  watchEffect(() => {
    if (keyword.value === '') {
      EventService.getEvents(pageSize.value, page.value)  // ✅ Correct params
        .then((response) => {
          events.value = response.data
          totalEvents.value = Number(response.headers['x-total-count'])
        })
    } else {
      updateKeyword(keyword.value)  // ✅ Only when searching
    }
  })  
})
```

### File: `src/views/event/EventFormView.vue`

#### Before:
```typescript
router.push({ name: 'event-detail-view', params: { id: response.data.id } })
```

#### After:
```typescript
router.push({ name: 'event-list-view', query: { page: 1, pageSize: 2 } })
```

## Testing

To verify the fixes:

1. **Test New Event Creation**:
   - Create a new event via the form
   - You should be redirected to the event list
   - The new event should appear in the list (on page 1)

2. **Test Pagination Consistency**:
   - Go to event list page
   - Verify that 2 events show by default (as set in router config)
   - Change page size to 3, 4, or 6 and verify correct number of events display
   - Navigate between pages - each page should show consistent number of events

3. **Test Search with Pagination**:
   - Search for an event by keyword
   - Verify pagination still works correctly with search results
   - Clear search and verify normal pagination returns

## Technical Details

The pagination system uses:
- Router query parameters: `?page=X&pageSize=Y`
- Default values: `page=1`, `pageSize=2` (set in router/index.ts)
- Backend pagination via `_limit` and `_page` query params
- Total count from response header: `x-total-count`

The fix ensures that:
- `pageSize.value` is always used (not hardcoded `1`)
- `page.value` correctly reflects current page
- No duplicate API calls on mount
- Fresh data loads after creating new event
