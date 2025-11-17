# Setting Up Your New Supabase Project

Since you created a new Supabase project, follow these steps:

## Step 1: Get Your New Supabase Credentials

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **new project**
3. Click **"Project Settings"** (gear icon in left sidebar)
4. Click **"API"** tab
5. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (under "Project API keys")

## Step 2: Update Your .env.local File

1. Open `.env.local` in your project root
2. Replace the old values with your new credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key-here
```

3. Save the file

## Step 3: Run the Complete Setup SQL

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Open the file **`COMPLETE_SETUP.sql`** in your code editor
4. **Copy ALL the SQL** (Ctrl+A, Ctrl+C)
5. **Paste** into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)

This will create:
- ✅ `books` table with all columns
- ✅ `reviews` table
- ✅ All indexes for performance
- ✅ Triggers for automatic timestamp updates
- ✅ Triggers for automatic rating calculations
- ✅ Row Level Security (RLS) policies for both tables
- ✅ `books` storage bucket (50MB limit, for PDFs/EPUBs)
- ✅ `covers` storage bucket (5MB limit, for images)
- ✅ All storage policies (public read and upload)

## Step 4: Verify Setup Worked

At the bottom of the SQL output, you should see verification results showing:
- 2 tables created
- 2 storage buckets created
- Multiple RLS policies created
- Multiple storage policies created

## Step 5: Restart Your Dev Server

```powershell
# Stop the current server (Ctrl+C if running)
npm run dev
```

## Step 6: Test Everything

1. Go to http://localhost:3000
2. Try searching for books (from Open Library) - should work
3. Go to `/upload`
4. Upload a test book with a cover image
5. Check that:
   - ✅ Upload succeeds
   - ✅ Book appears on homepage
   - ✅ Cover image displays correctly
   - ✅ Download button works
   - ✅ You can leave a review

## Troubleshooting

### If you get authentication errors:
- Double-check your `.env.local` credentials are correct
- Make sure you restarted the dev server after updating `.env.local`

### If storage buckets show as not configured:
- Verify both buckets exist in Supabase → Storage
- Verify they are both marked as "Public"
- Run the COMPLETE_SETUP.sql script again

### If uploads fail:
- Check browser console for errors
- Verify storage policies were created (should see 4 policies in the SQL output)

## Need Help?

If something doesn't work:
1. Share the error message from your browser console
2. Share the output from running COMPLETE_SETUP.sql
3. Verify your Supabase project URL and key are correct
