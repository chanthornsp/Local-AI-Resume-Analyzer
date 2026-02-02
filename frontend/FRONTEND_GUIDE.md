# Frontend Quick Reference Guide

## 🚀 Running the Application

### Development Mode
```bash
cd frontend
npm run dev
```
Server: `http://localhost:5174/`

### Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Shadcn UI base components
│   ├── jobs/        # Job-related components
│   ├── candidates/  # Candidate-related components
│   └── upload/      # File upload components
├── hooks/           # Custom React Query hooks
├── lib/             # Utilities and API client
├── pages/           # Page components (routes)
├── App.tsx          # Main app with routing
└── main.tsx         # Entry point
```

---

## 🔌 API Integration

### Environment Variables
**.env**
```
VITE_API_URL=http://localhost:5001
```

### API Modules
- `jobsApi` - Job CRUD operations
- `candidatesApi` - Candidate management
- `analysisApi` - CV analysis operations

---

## 🎯 Key Components

### JobCard
Displays job summary with statistics
```tsx
<JobCard job={jobData} />
```

### JobForm
Create/edit job form with validation
```tsx
<JobForm 
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  defaultValues={existingJob}
  isSubmitting={isPending}
/>
```

### CVUploader
Drag & drop file uploader
```tsx
<CVUploader 
  onUpload={handleUpload}
  isUploading={isUploading}
  maxFiles={50}
/>
```

### CandidateCard
Displays candidate summary
```tsx
<CandidateCard candidate={candidateData} />
```

---

## 🪝 Custom Hooks

### Jobs
```tsx
const { data: jobs, isLoading } = useJobs();
const { data: job } = useJob(jobId);
const { mutate: createJob } = useCreateJob();
```

### Candidates
```tsx
const { data: candidates } = useCandidates(jobId);
const { mutate: uploadCVs } = useUploadCVs(jobId);
const { mutate: exportCandidates } = useExportCandidates(jobId);
```

### Analysis
```tsx
const { mutate: startAnalysis } = useStartAnalysis(jobId);
const { progress, isAnalyzing } = useAnalysisPolling(jobId, enabled);
```

---

## 🎨 Styling

### Tailwind CSS 4
- Utility-first CSS framework
- Custom theme in `index.css`
- Dark mode support (`.dark` class)

### Custom Colors
```css
--primary: oklch(0.205 0 0)
--secondary: oklch(0.97 0 0)
--muted: oklch(0.97 0 0)
--destructive: oklch(0.577 0.245 27.325)
--border: oklch(0.922 0 0)
```

---

## 📱 Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Job listings & stats |
| `/jobs/new` | JobCreate | Create new job |
| `/jobs/:id` | JobDetail | Job details & candidates |
| `/candidates/:id` | CandidateView | Candidate profile |

---

## 🔧 Common Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Link to it using `useNavigate()` or `<Link>`

### Adding a New API Endpoint
1. Add function to `src/lib/api.ts`
2. Create hook in `src/hooks/`
3. Use hook in component

### Adding a New Component
1. Create in appropriate `src/components/` folder
2. Import Shadcn UI components as needed
3. Use TypeScript types from `src/lib/types.ts`

---

## 🛠️ Troubleshooting

### Build Errors
```bash
npm run build
# Check for TypeScript errors
```

### Type Errors
- Check `src/lib/types.ts` for type definitions
- Ensure imports match exports
- Use `any` temporarily, then fix

### API Connection Issues
- Verify backend is running on port 5001
- Check `.env` file has correct API URL
- Check browser console for CORS errors

---

## 📦 Dependencies

### Core
- react v19.2
- react-dom v19.2
- react-router v7

### State Management
- @tanstack/react-query

### Forms
- react-hook-form
- zod
- @hookform/resolvers

### UI
- @radix-ui/react-* (via Shadcn)
- lucide-react (icons)
- sonner (toasts)

### Styling
- tailwindcss v4.1.18
- @tailwindcss/vite
- tw-animate-css

---

## 🎯 Best Practices

1. **Use TypeScript** - Add types for all props and functions
2. **Use React Query** - For all API calls
3. **Use Shadcn UI** - For consistent components
4. **Follow File Structure** - Keep components organized
5. **Handle Errors** - Always show user-friendly messages
6. **Add Loading States** - Improve UX with skeletons
7. **Responsive Design** - Test on mobile and desktop
8. **Accessibility** - Use semantic HTML and ARIA labels

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [React Router v7](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Last Updated:** February 2, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
