# Storage Bucket Troubleshooting Guide

## 🚨 Issue: Cover Image 400 Error & Download Not Working

You're getting a 400 error because the storage buckets aren't properly set up.

---

## ⚡ **EASIEST FIX: Run the SQL Script**

**This is the fastest way to set everything up:**

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Open the file `STORAGE_SETUP.sql` in this repository
4. **Copy ALL the SQL** from that file
5. **Paste** into the SQL Editor
6. Click **"Run"**
7. ✅ Done! Both buckets and all policies are created automatically

**Then skip to Step 6 below to test!**

---

## 📋 **Manual Step-by-Step Fix** (if SQL doesn't work)

### **Step 1: Verify Supabase Credentials**

First, make sure your `.env.local` file has the correct credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lgjzetyzbxuxzjcmrrij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### **Step 2: Check Storage Buckets Exist**

1. Go to: https://supabase.com/dashboard
2. Select your project: `lgjzetyzbxuxzjcmrrij`
3. Click **"Storage"** in left sidebar

**Do you see these buckets?**
- `books` ← Should exist
- `covers` ← Should exist

**If NO, follow these steps:**

#### Create "books" Bucket:
```
1. Click "New bucket"
2. Name: books
3. ✅ Check "Public bucket"
4. Click "Create bucket"
```

#### Create "covers" Bucket:
```
1. Click "New bucket"
2. Name: covers
3. ✅ Check "Public bucket"
4. Click "Create bucket"
```

### **Step 3: Verify Buckets Are Public**

1. Click on "books" bucket
2. Look at the top - it should say **"Public"** with a globe icon 🌐
3. If it says "Private" 🔒:
   - Click the bucket settings (3 dots)
   - Click "Edit bucket"
   - ✅ Check "Public bucket"
   - Save

Repeat for "covers" bucket.

### **Step 4: Add Storage Policies**

**For "books" bucket:**

1. Click "books" bucket
2. Click "Policies" tab
3. Click "New Policy"
4. Click "Get started quickly" → "Allow public read access"
5. Click "Review" → "Save policy"

6. Click "New Policy" again
7. Click "For full customization"
8. Paste:
```sql
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'books');
```
9. Click "Review" → "Save policy"

**For "covers" bucket:**

Repeat the above steps, but change `'books'` to `'covers'`.

### **Step 5: Test the Storage**

Go to Supabase → Storage → books bucket.

**Can you see your uploaded files?**

- **YES** → Great! Policies are the issue. Make sure policies are set.
- **NO** → Files never uploaded. Bucket didn't exist during upload.

### **Step 6: Manual Test**

Let's test if the bucket works:

1. Go to Supabase → Storage → books bucket
2. Click "Upload file"
3. Upload any PDF file
4. After upload, click the file
5. Click "Get URL" → Copy the URL
6. Paste the URL in a new browser tab

**Does the PDF open?**
- **YES** → Bucket is working! ✅
- **NO** → Bucket is not public or policies missing

---

## 🔧 **Quick Fix - Re-upload After Setup**

Once you've completed ALL the steps above:

1. **Delete** the book you just uploaded (from database)
2. **Upload again** at `/upload`
3. **This time it should work!**

---

## 🐛 **Still Not Working? Do This:**

Open browser console (F12) and run this when uploading:

```javascript
// Check if buckets are configured
console.log('Checking storage...');
fetch('https://lgjzetyzbxuxzjcmrrij.supabase.co/storage/v1/bucket/books')
  .then(r => r.json())
  .then(d => console.log('Books bucket:', d))
  .catch(e => console.error('Error:', e));
```

**Copy the output and share it with me!**

---

## 📸 **Screenshot These and Share:**

1. Supabase → Storage page (showing buckets list)
2. Supabase → Storage → books → Policies tab
3. Supabase → Storage → covers → Policies tab
4. Browser console when uploading

This will help me see exactly what's wrong!

---

## ⚡ **Expected Behavior After Fix:**

When you upload:
```
✅ File uploaded: 1762781232594-rwgrus.pdf
🔗 File URL: https://...supabase.co/.../books/...
✅ Cover uploaded: 1762781232594-rwgrus.png
🔗 Cover URL: https://...supabase.co/.../covers/...
```

When you click the cover URL in browser:
✅ Image should display

When you click Download:
✅ PDF should open

---

**Complete the steps above and try uploading a NEW book. Let me know what happens!** 🚀
