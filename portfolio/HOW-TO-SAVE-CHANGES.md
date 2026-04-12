# 💾 How to Save Changes in Admin Panel

## 🎯 **Quick Answer: Where Are The Save Buttons?**

### **Personal Information** (`/admin/personal`)
- **Save Button Location**: Bottom of the form
- **Button Text**: "Save Changes" 
- **When Enabled**: Only when you modify any field
- **Result**: Changes reflect immediately on live site

### **Projects** (`/admin/projects/[slug]`)
- **Basic Info Tab**: "Save Project" button at bottom of form
- **Case Study Tab**: "Save Case Study" button at bottom of form  
- **Assets Tab**: No save needed - uploads are automatic
- **CV Sync Tab**: No save needed - generates bullets on demand

### **Images/Assets**
- **Hero Images**: Automatic save on upload + page reload
- **Gallery Images**: Automatic save when added/reordered
- **No manual save needed** for any image operations

## 📋 **Step-by-Step Save Instructions**

### **1. Saving Personal Information**
```
1. Go to: http://localhost:3000/admin/personal
2. Edit any field (name, role, email, etc.)
3. Scroll to bottom of page
4. Click "Save Changes" button (orange gradient)
5. Wait for green success message
6. Changes appear on live site immediately
```

### **2. Saving Project Basic Info**
```
1. Go to: http://localhost:3000/admin/projects
2. Click "Edit" on any project
3. Stay on "Basic Info" tab
4. Edit title, slug, tag, blurb, etc.
5. Scroll to bottom of form
6. Click "Save Project" button
7. Success message appears
8. Changes reflect on live site
```

### **3. Saving Case Study Content**
```
1. In project editor, click "Case Study" tab
2. Edit problem, approach, constraints, outcome
3. Scroll to bottom of form
4. Click "Save Case Study" button
5. Success message appears
6. Changes reflect on live site
```

### **4. Uploading Images (Auto-Save)**
```
1. In project editor, click "Assets" tab
2. Upload hero image OR add gallery images
3. NO SAVE BUTTON NEEDED - automatic!
4. Page reloads after 2 seconds
5. Check live site - images appear immediately
```

## 🔍 **Troubleshooting: "I Don't See Save Buttons"**

### **Check These Things:**

1. **Are you in the right section?**
   - Personal Info: Scroll to bottom of form
   - Projects: Make sure you're in Basic Info or Case Study tab

2. **Is the button disabled?**
   - Save buttons only enable when you make changes
   - Try editing a field first, then look for the button

3. **Are you logged in properly?**
   - Make sure you're at `http://localhost:3000/admin`
   - Admin panel only works in development mode

4. **Is the server running?**
   - Check that `npm run dev` is running
   - Server should be on `http://localhost:3000`

## ⚡ **When Changes Reflect on Live Site**

### **Immediate Updates (Real-time)**
- ✅ **Personal Info**: Immediately after "Save Changes"
- ✅ **Project Info**: Immediately after "Save Project/Case Study"  
- ✅ **Hero Images**: Immediately after upload + page reload
- ✅ **Gallery Images**: Immediately after adding/reordering

### **What Triggers Updates**
1. **AST Manipulation**: Updates `site-content.ts` file
2. **Hot Reload**: Triggers Next.js to recompile
3. **Live Site**: Shows changes without server restart

## 🎯 **Common Save Button Locations**

```
Personal Info Page:
┌─────────────────────────────────┐
│ Form fields...                  │
│ ...                            │
│ ...                            │
│                                │
│              [Save Changes] ←── HERE
└─────────────────────────────────┘

Project Editor - Basic Info Tab:
┌─────────────────────────────────┐
│ Title: [____________]           │
│ Slug:  [____________]           │
│ Tag:   [____________]           │
│ ...                            │
│                                │
│              [Save Project] ←── HERE
└─────────────────────────────────┘

Project Editor - Case Study Tab:
┌─────────────────────────────────┐
│ Problem: [________________]     │
│ Approach: [_______________]     │
│ Outcome: [________________]     │
│ ...                            │
│                                │
│            [Save Case Study] ←── HERE
└─────────────────────────────────┘
```

## 🚀 **Test Your Changes**

1. **Make a change** in admin panel
2. **Click the save button**
3. **Wait for success message**
4. **Open live site** in new tab: `http://localhost:3000`
5. **Verify changes** appear immediately

If changes still don't appear, check the browser console for errors or let me know what specific section you're trying to save!