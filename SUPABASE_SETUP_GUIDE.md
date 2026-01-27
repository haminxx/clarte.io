# Supabase Setup Guide for Authentication & Data Storage

This guide will help you set up Google OAuth authentication and store user data/conversation history with your VAPI AI agent.

## Prerequisites

- A Supabase account (free tier available at https://supabase.com)
- Your Vercel deployment URL (for OAuth redirects)

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: Clarte (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start

4. Wait 2-3 minutes for the project to be created

## Step 2: Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `scripts/001_create_tables.sql` (or run it directly)
4. Click **Run** to execute the SQL

This creates:
- `profiles` table - stores user information
- `conversations` table - stores conversation sessions
- `messages` table - stores individual messages with screen context
- Row Level Security (RLS) policies for data protection

## Step 3: Configure Google OAuth

### 3.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure OAuth consent screen (if first time):
   - User Type: External
   - App name: Clarte
   - User support email: your email
   - Developer contact: your email
   - Save and continue through scopes
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: Clarte Web
   - **Authorized redirect URIs**: Add:
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     (Replace YOUR_PROJECT_REF with your Supabase project reference)
7. Copy the **Client ID** and **Client Secret**

### 3.2 Configure in Supabase

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** and toggle it **Enabled**
3. Enter:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
4. Click **Save**

## Step 4: Configure GitHub OAuth (Optional but Recommended)

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Clarte
   - **Homepage URL**: Your Vercel deployment URL
   - **Authorization callback URL**: 
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**
6. In Supabase, go to **Authentication** > **Providers** > **GitHub**
7. Enable and enter credentials
8. Click **Save**

## Step 5: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings** > **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 6: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Go to **Settings** > **Environment Variables**
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

4. For local development, create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Never commit `.env.local` to git!

## Step 7: Update Redirect URLs

1. In Supabase dashboard, go to **Authentication** > **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `https://your-vercel-domain.vercel.app`
   - **Redirect URLs**: Add:
     ```
     https://your-vercel-domain.vercel.app/auth/callback
     http://localhost:3000/auth/callback (for local dev)
     ```

## Step 8: Test Authentication

1. Deploy your changes to Vercel
2. Visit `/auth/login` on your site
3. Try signing in with Google or GitHub
4. You should be redirected back and logged in

## Step 9: Store Conversation History

Your database is already set up! To save conversations from your VAPI AI:

### Example: Saving a Conversation

```typescript
// In your API route or server component
import { createClient } from '@/lib/supabase/server'

export async function saveConversation(userId: string, messages: ConversationMessage[]) {
  const supabase = await createClient()
  
  // Create a new conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title: messages[0]?.content.substring(0, 50) || 'New Conversation'
    })
    .select()
    .single()
  
  if (convError) throw convError
  
  // Save all messages
  const messagesToInsert = messages.map(msg => ({
    conversation_id: conversation.id,
    role: msg.role,
    content: msg.content,
    // Optional: store screen context if available
    // screen_context: msg.screenContext
  }))
  
  const { error: msgError } = await supabase
    .from('messages')
    .insert(messagesToInsert)
  
  if (msgError) throw msgError
  
  return conversation
}
```

### Example: Retrieving User's Conversations

```typescript
export async function getUserConversations(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

## Step 10: Update Your VAPI Hook to Save Conversations

You can modify `hooks/use-vapi.ts` to automatically save conversations:

```typescript
// Add this function to save conversation when call ends
const saveConversationToDB = useCallback(async () => {
  if (!state.conversationHistory.length) return
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return
  
  // Save conversation logic here
  // ... (use the example above)
}, [state.conversationHistory])

// Call it when call ends
vapi.on("call-end", async () => {
  // ... existing code ...
  await saveConversationToDB()
})
```

## Security Notes

✅ **Row Level Security (RLS)** is enabled - users can only access their own data
✅ **Environment variables** are secure - never expose your service role key
✅ **OAuth redirects** are validated by Supabase
✅ **Database policies** prevent unauthorized access

## Troubleshooting

### OAuth not working?
- Check redirect URLs match exactly
- Verify Google/GitHub OAuth credentials
- Check browser console for errors
- Verify environment variables in Vercel

### Database errors?
- Ensure SQL script ran successfully
- Check RLS policies are enabled
- Verify user is authenticated before queries

### Can't save conversations?
- Ensure user is logged in
- Check database permissions
- Verify table structure matches schema

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Configure Google/GitHub OAuth
3. ✅ Add environment variables
4. ✅ Test authentication flow
5. ✅ Implement conversation saving in your VAPI hook
6. ✅ Create UI to display conversation history
7. ✅ Add export functionality for conversations

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
