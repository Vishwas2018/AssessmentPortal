# 📚 EduAssess Platform - Rich Question Content Implementation Guide

## Overview

This guide explains how to implement NAPLAN-style rich question content in your EduAssess platform, including support for:

- 📷 **Images** - Diagrams, illustrations, photos
- 📊 **Tables** - Data tables with tally marks
- 📈 **Charts** - Bar graphs, dot plots, pie charts
- 🔢 **Math** - Fractions, equations, LaTeX
- 📐 **Shapes** - Geometric figures, grids
- 🕐 **Clocks** - Time problems
- 💰 **Money** - Currency display with coins
- 📏 **Number Lines** - With markers and labels

---

## Files Included

```
src/
├── types/
│   └── question.ts              # TypeScript types for rich content
├── components/
│   └── exam/
│       └── QuestionContentRenderer.tsx  # Renders all content types
└── pages/
    └── TakeExamPageEnhanced.tsx # Updated exam page

migrations/
└── 004_rich_question_content.sql  # Database schema updates
```

---

## Installation Steps

### Step 1: Run Database Migration

In Supabase SQL Editor, run the migration file:

```sql
-- See: migrations/004_rich_question_content.sql
```

This adds the following columns to your `questions` table:

- `content` (JSONB) - Rich content blocks
- `options_data` (JSONB) - Options with images/rich content
- `answer_explanation` (JSONB) - Rich explanations
- `question_image_url` (TEXT) - Simple image URL

### Step 2: Create Storage Bucket

1. Go to **Supabase Dashboard > Storage**
2. Click **Create new bucket**
3. Name: `question-images`
4. Set **Public** to `Yes`
5. Add policy for public read access

### Step 3: Copy Component Files

Copy these files to your project:

- `src/types/question.ts`
- `src/components/exam/QuestionContentRenderer.tsx`
- `src/pages/TakeExamPageEnhanced.tsx`

### Step 4: Update Router (Optional)

To use the enhanced page, update your router:

```tsx
// src/router.tsx
import TakeExamPageEnhanced from './pages/TakeExamPageEnhanced';

// Replace or add route:
{ path: '/exam/:examId/take/:attemptId', element: <TakeExamPageEnhanced /> }
```

---

## Content Block Types

### 1. Text Block

```json
{
  "id": "1",
  "type": "text",
  "content": "Maria gets 10 cents for every bottle...",
  "style": "bold" // normal, bold, italic, heading
}
```

### 2. Image Block

```json
{
  "id": "2",
  "type": "image",
  "url": "https://your-bucket.supabase.co/storage/v1/object/public/question-images/bottle.png",
  "alt": "Plastic bottle",
  "width": 150,
  "alignment": "center"
}
```

### 3. Table Block (with Tally Marks)

```json
{
  "id": "3",
  "type": "table",
  "headers": ["Sport", "Students"],
  "rows": [
    ["Basketball", { "type": "tally", "count": 22 }],
    ["Tennis", { "type": "tally", "count": 10 }]
  ],
  "headerStyle": "blue"
}
```

### 4. Fraction Block

```json
{
  "id": "4",
  "type": "fraction",
  "numerator": 1,
  "denominator": 4,
  "display": "numeric" // numeric, visual-circle, visual-bar
}
```

### 5. Grid Block (Maps, Coordinate Grids)

```json
{
  "id": "5",
  "type": "grid",
  "rows": 8,
  "cols": 8,
  "labels": {
    "x": ["A", "B", "C", "D", "E", "F", "G", "H"],
    "y": ["8", "7", "6", "5", "4", "3", "2", "1"]
  },
  "markers": [{ "x": 1, "y": 1, "icon": "🏠", "label": "Home" }]
}
```

### 6. Number Line Block

```json
{
  "id": "6",
  "type": "number-line",
  "min": 0,
  "max": 1,
  "step": 0.25,
  "markers": [{ "value": 0.25, "icon": "🏃" }]
}
```

### 7. Chart Block

```json
{
  "id": "7",
  "type": "chart",
  "chartType": "bar", // bar, dot-plot, pie
  "data": {
    "labels": ["20kg", "21kg", "22kg", "23kg"],
    "values": [2, 1, 3, 3]
  },
  "xLabel": "Weight",
  "yLabel": "Dogs"
}
```

### 8. Clock Block

```json
{
  "id": "8",
  "type": "clock",
  "hours": 10,
  "minutes": 30,
  "showDigital": true
}
```

### 9. Shape Block

```json
{
  "id": "9",
  "type": "shape",
  "shapeType": "rectangle", // rectangle, triangle, circle, custom-svg
  "dimensions": { "width": 10, "height": 6 },
  "labels": { "width": "10 cm" }
}
```

---

## Example: Full NAPLAN Question

Here's a complete example of Question 27 (Fractions):

```json
{
  "question_text": "What fraction is left for Mark?",
  "question_type": "multiple_choice",
  "content": [
    {
      "id": "1",
      "type": "text",
      "content": "Bill, Sue and Mark share a bag of apples."
    },
    { "id": "2", "type": "text", "content": "Bill and Sue each get " },
    {
      "id": "3",
      "type": "fraction",
      "numerator": 1,
      "denominator": 6,
      "display": "numeric"
    },
    { "id": "4", "type": "text", "content": " of the apples in the bag." },
    {
      "id": "5",
      "type": "text",
      "content": "What fraction of the bag of apples is left for Mark?",
      "style": "bold"
    }
  ],
  "options_data": [
    {
      "id": "A",
      "content": [{ "type": "fraction", "numerator": 4, "denominator": 6 }]
    },
    {
      "id": "B",
      "content": [{ "type": "fraction", "numerator": 3, "denominator": 6 }]
    },
    {
      "id": "C",
      "content": [{ "type": "fraction", "numerator": 2, "denominator": 6 }]
    },
    {
      "id": "D",
      "content": [{ "type": "fraction", "numerator": 1, "denominator": 6 }]
    }
  ],
  "correct_answer": "A"
}
```

---

## Admin Question Editor (Future)

For creating questions with rich content, you'll need an admin editor. Options:

1. **Simple JSON Editor** - Direct JSON input (quick to build)
2. **Block-based Editor** - Drag-and-drop blocks (better UX)
3. **WYSIWYG Editor** - Rich text with embeds (best UX, most complex)

Recommended libraries for the editor:

- **TipTap** - Extensible rich text editor
- **Plate** - Headless rich text editor
- **BlockNote** - Notion-like block editor

---

## Uploading Images

### Via Supabase Storage:

```typescript
const uploadImage = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("question-images")
    .upload(fileName, file);

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("question-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};
```

---

## Adding KaTeX for Advanced Math (Optional)

For full LaTeX support, install KaTeX:

```bash
npm install katex react-katex
```

Update MathBlockRenderer:

```tsx
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

const MathBlockRenderer = ({ block }) => {
  if (block.display === "block") {
    return <BlockMath math={block.latex} />;
  }
  return <InlineMath math={block.latex} />;
};
```

---

## Summary

Your EduAssess platform now supports NAPLAN-style questions with:

✅ Images and diagrams embedded in questions
✅ Tables with tally marks
✅ Visual fractions (numeric, pie, bar)
✅ Coordinate grids with markers
✅ Number lines with labels
✅ Bar charts and dot plots
✅ Clock faces for time problems
✅ Geometric shapes

The system is backward-compatible - existing questions with simple text continue to work.

---

## Next Steps

1. ✅ Run the database migration
2. ✅ Create the storage bucket
3. ✅ Copy the component files
4. 🔜 Build an admin question editor
5. 🔜 Create sample questions with rich content
6. 🔜 Test all content types
