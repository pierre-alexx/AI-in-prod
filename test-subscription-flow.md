# Subscription Flow Test Plan

## Test Scenarios

### 1. User Without Subscription
- **Expected**: No credits, highly visible "Get Credits" button
- **UI**: Credit counter shows "No Subscription" with prominent button
- **Generation**: Redirects to /pricing when trying to generate

### 2. Basic Plan User (€9/mo)
- **Expected**: 50 credits per month
- **UI**: Credit counter shows "X/50" with progress bar
- **Generation**: Works until credits exhausted

### 3. Pro Plan User (€19/mo)
- **Expected**: 200 credits per month
- **UI**: Credit counter shows "X/200" with progress bar
- **Generation**: Works until credits exhausted

### 4. Exhausted Credits
- **Expected**: Clear CTA to upgrade
- **UI**: Red styling, upgrade button
- **Generation**: Redirects to /pricing

## Key Features Implemented

✅ **Credit Counter Component**
- Shows current plan and remaining credits
- Visual progress bar
- Red styling when no subscription
- Auto-refresh every 30 seconds
- **Immediate refresh** after generation

✅ **Backend Credit Management**
- No free plan - subscription required
- Basic users: 50 credits
- Pro users: 200 credits
- **1 credit = 1 generation** (enforced)
- **Double credit checks** (start and before generation)
- Proper error handling with redirects

✅ **UI/UX Improvements**
- Clear CTAs when no subscription
- Beautiful credit counter on dashboard
- Enhanced profile page with credit info
- Simplified pricing page (no free plan)
- **White, highly visible buttons**

✅ **Error Handling**
- Graceful redirects to pricing page
- Clear error messages
- Proper status codes
- **Prevents generation without credits**

## Testing Steps

1. **Test User Without Subscription**:
   - Login as new user
   - Check dashboard shows "No Subscription"
   - Try to generate image → should redirect to pricing

2. **Test Subscription Flow**:
   - Go to pricing page
   - Subscribe to Basic plan
   - Check dashboard shows 50 credits
   - Generate images until exhausted

3. **Test Upgrade Flow**:
   - When credits exhausted, check UI shows upgrade CTA
   - Click upgrade → should go to pricing
   - Subscribe to Pro plan
   - Check dashboard shows 200 credits

## Files Modified

- `src/app/api/generate/route.ts` - Backend credit logic
- `src/components/CreditCounter.tsx` - New credit counter component
- `src/app/dashboard/page.tsx` - Added credit counter
- `src/app/profile/page.tsx` - Enhanced credit display
- `src/app/pricing/page.tsx` - Added free plan
- `src/lib/initializeUser.ts` - User initialization
- `src/app/page.tsx` - Error handling for no credits
