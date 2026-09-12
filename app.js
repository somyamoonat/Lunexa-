const { useState, useEffect, useRef, useMemo } = React;

// Google OAuth 2.0 Client ID
const GOOGLE_CLIENT_ID = "484190105845-7hmcoq9ped5uo5m20cjlok37curofrn0.apps.googleusercontent.com";
const GOOGLE_MEET_API_KEY = "AIzaSyCnhwR62-6Um2CH7kquwDFg-9eYIVooI9c";

// Supabase Real Backend Configuration
const SUPABASE_URL = "https://jpurokfkmigkbrzxdbry.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdXJva2ZrbWlna2JyenhkYnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NTU1MzEsImV4cCI6MjEwNDQzMTUzMX0.Pvnm6WC1t_hqXx0JIvWp5aTuX7BldGWWOHWQlBZnOr0";

let supabaseClient = null;
try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Connected to Supabase Backend successfully!");
  }
} catch (e) {
  console.warn("Supabase initialization note:", e);
}

// Decode Google JWT Token securely
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse Google JWT credential:", e);
    return null;
  }
}

// --- SVG ICON SYSTEM ---
function Icon({ name, className = "w-4 h-4", size = 18 }) {
  const icons = {
    'graduation-cap': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    'zap': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    'search': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    'star': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    'check': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    'check-circle': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    'shield': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    'shield-check': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    'book-open': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    'calendar': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    'heart': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    'crown': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
      </svg>
    ),
    'camera': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    ),
    'user': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    'users': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    'mail': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    'phone': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    'file-text': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" x2="8" y1="13" y2="13" />
        <line x1="16" x2="8" y1="17" y2="17" />
        <line x1="10" x2="8" y1="9" y2="9" />
      </svg>
    ),
    'video': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    'video-off': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
    'mic': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    'mic-off': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    'hand': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 11V6a2 2 0 0 0-4 0v5" />
        <path d="M14 10V4a2 2 0 0 0-4 0v6" />
        <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-16 0v-1.5" />
      </svg>
    ),
    'arrow-right': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    'x': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    'moon': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
    'sun': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
    'pen-tool': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19 7-7 3 3-7 7-3-3z" />
        <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
    'eraser': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
        <path d="M22 21H7" />
        <path d="m5 11 9 9" />
      </svg>
    ),
    'send': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
    'coins': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
        <path d="M7 6h1v4" />
      </svg>
    ),
    'eye': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    'eye-off': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
    'award': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
    'trending-up': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    'menu': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    'log-out': (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    )
  };
  return icons[name] || <span className="inline-block w-4 h-4 bg-slate-300 rounded"></span>;
}

function formatFee(rate) {
  return !rate ? 'Free' : `₹${rate}/hr`;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error(error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">This screen hit a snag</h2>
          <p className="text-sm text-slate-500 max-w-sm">Reload the page, or go back home and try another section.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600"
          >
            Back to home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Brand Logo Component using dynamic Light/Dark theme logo
function BrandLogo({ size = "normal" }) {
  const isLarge = size === "large";
  return (
    <div className="flex items-center space-x-2 cursor-pointer select-none">
      <img
        src="logo-light.png"
        alt="Lunexa"
        className={`dark:hidden ${isLarge ? 'h-14' : 'h-12'} w-auto object-contain`}
      />
      <img
        src="logo-full.png"
        alt="Lunexa"
        className={`hidden dark:block ${isLarge ? 'h-14' : 'h-12'} w-auto object-contain`}
      />
    </div>
  );
}

// Mock Data
const MENTORS = [
  {
    id: 1,
    name: "Aman Gupta",
    college: "IIT Delhi",
    year: "CSE Year 3",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
    online: true,
    rating: 4.95,
    reviewsCount: 68,
    subjects: ["JEE Physics", "Calculus", "Mechanics"],
    hourlyRate: 300,
    batchBadge: "Batch starts Tomorrow • 15/20 Seats Filled",
    bio: "AIR 184 in JEE Advanced 2023. Passionate about deconstructing tough rotational mechanics & multivariate calculus for Class 11-12 students.",
    impactXp: 2840,
    hoursTaught: 84,
    category: "Physics"
  },
  {
    id: 2,
    name: "Priya Nair",
    college: "BITS Pilani",
    year: "ECE Year 2",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    online: true,
    rating: 4.92,
    reviewsCount: 52,
    subjects: ["Coding", "Python", "Data Structures"],
    hourlyRate: 250,
    batchBadge: "Python Bootcamp starts in 3 Days",
    bio: "Google Summer of Code Scholar & ICPC Regionalist. Love teaching algorithms through real-world visual building blocks and interactive debugging.",
    impactXp: 2150,
    hoursTaught: 62,
    category: "CS"
  },
  {
    id: 3,
    name: "Rahul Sharma",
    college: "IIT Bombay",
    year: "Mechanical Year 4",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    online: true,
    rating: 4.98,
    reviewsCount: 114,
    subjects: ["Calculus", "JEE Maths", "Coordinate Geometry"],
    hourlyRate: 0,
    batchBadge: "Free Doubt Session this Sunday",
    bio: "Rank 92 in JEE Main. Conducting weekly free doubt resolution drives for underprivileged school aspirants. Solved over 600 doubts.",
    impactXp: 3400,
    hoursTaught: 120,
    category: "Maths"
  },
  {
    id: 4,
    name: "Ananya Iyer",
    college: "AIIMS New Delhi",
    year: "MBBS Year 2",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    online: false,
    rating: 4.88,
    reviewsCount: 41,
    subjects: ["Biology", "NEET Botany", "Human Physiology"],
    hourlyRate: 200,
    batchBadge: "NEET Sprint Batch: 8/15 Filled",
    bio: "NEET 2023 score 695/720. Mentoring future doctors on NCERT line-by-line decoding and diagrammatic memory mnemonics.",
    impactXp: 1680,
    hoursTaught: 48,
    category: "Biology"
  },
  {
    id: 5,
    name: "Devansh Patel",
    college: "NIT Trichy",
    year: "Chemical Year 3",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    online: true,
    rating: 4.85,
    reviewsCount: 37,
    subjects: ["Chemistry", "Organic Chemistry", "Thermodynamics"],
    hourlyRate: 150,
    batchBadge: "Crash Batch • 11/15 Seats Filled",
    bio: "Organic reaction mechanisms simplified with intuitive electron-pushing methods. No more blind memorizing of reactions!",
    impactXp: 1320,
    hoursTaught: 39,
    category: "Chemistry"
  },
  {
    id: 6,
    name: "Sneha Mukherjee",
    college: "Delhi University",
    year: "B.Sc Maths Year 3",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
    online: true,
    rating: 4.90,
    reviewsCount: 49,
    subjects: ["Maths", "Class 10 CBSE", "Trigonometry"],
    hourlyRate: 0,
    batchBadge: "Class 10 Board Prep Weekly Batch",
    bio: "100/100 in Class 10 & 12 Board Mathematics. Committed to eliminating math anxiety for middle & high school kids.",
    impactXp: 1950,
    hoursTaught: 55,
    category: "Maths"
  }
];

const BATCHES = [
  // CLASS 5-8 BATCHES (Total 40 Students Strength: 30 for All Sub, 10 for Per Sub)
  {
    id: 101,
    title: "Class 5–8 Foundation Super-30 Cohort (All Subjects)",
    classLevel: "Class 5-8",
    category: "All Subjects",
    badge: "30 Max Students",
    seatsTotal: 30,
    seatsFilled: 24,
    price: 3999,
    originalPrice: 6999,
    discount: "43% OFF",
    billing: "Yearly Subscription",
    instructor: "Ananya Sharma",
    instructorRole: "IIT Delhi (AIR 410)",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    rating: 4.95,
    reviewsCount: 128,
    schedule: "Mon, Wed, Fri • 5:00 PM IST",
    duration: "Full Year Course",
    platform: "Google Meet",
    meetLink: "https://meet.google.com/new",
    tags: ["Maths", "Science", "SST", "English"],
    features: [
      "Complete Maths, Science, SST & English Syllabus",
      "Strict cohort limit: Max 30 students for personal care",
      "Live interactive Google Meet classes + Doubt sessions",
      "Weekly homework grading & Parent progress report"
    ]
  },
  {
    id: 102,
    title: "Class 5–8 Subject Booster (Maths & Science Special)",
    classLevel: "Class 5-8",
    category: "Per Subject",
    badge: "10 Max Students",
    seatsTotal: 10,
    seatsFilled: 8,
    price: 799,
    originalPrice: 1499,
    discount: "46% OFF",
    billing: "Per Subject / Year",
    instructor: "Rohan Verma",
    instructorRole: "NIT Trichy Gold Medalist",
    instructorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    rating: 4.92,
    reviewsCount: 94,
    schedule: "Tue & Thu • 5:30 PM IST",
    duration: "Full Year Course",
    platform: "Google Meet",
    meetLink: "https://meet.google.com/new",
    tags: ["Single Subject", "NCERT Focus"],
    features: [
      "Targeted single subject concept mastery",
      "Ultra-exclusive batch capped at only 10 students",
      "1-on-1 micro-doubt resolution on Google Meet",
      "NCERT Exemplar & Olympiad problem solving"
    ]
  },

  // CLASS 9-10 BATCHES (Total 70 Students Strength: 40 for Sci & Maths, 30 for All Sub)
  {
    id: 201,
    title: "Class 9–10 Science & Mathematics Titans Batch",
    classLevel: "Class 9-10",
    category: "Maths & Science",
    badge: "40 Max Students",
    seatsTotal: 40,
    seatsFilled: 33,
    price: 3999,
    originalPrice: 7999,
    discount: "50% OFF",
    billing: "Yearly Subscription",
    instructor: "Dr. Vikramaditya",
    instructorRole: "IIT Bombay CS & Educator",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    rating: 4.98,
    reviewsCount: 215,
    schedule: "Mon, Wed, Fri • 6:30 PM IST",
    duration: "Full Academic Year",
    platform: "Google Meet",
    meetLink: "https://meet.google.com/new",
    tags: ["Physics", "Chemistry", "Higher Maths"],
    features: [
      "Deep-dive into Physics, Chemistry & Advanced Maths",
      "Max capacity 40 students for interactive learning",
      "Class 10 Board exam PYQ drills & mock tests",
      "Formula cheat sheets & handwritten study notes"
    ]
  },
  {
    id: 202,
    title: "Class 9–10 Board Achievers (All Subjects Cohort)",
    classLevel: "Class 9-10",
    category: "All Subjects",
    badge: "30 Max Students",
    seatsTotal: 30,
    seatsFilled: 26,
    price: 5999,
    originalPrice: 9999,
    discount: "40% OFF",
    billing: "Yearly Subscription",
    instructor: "Sneha Mukherjee",
    instructorRole: "IIT Kharagpur Topper",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    rating: 4.94,
    reviewsCount: 180,
    schedule: "Daily • 6:00 PM IST",
    duration: "Full Academic Year",
    platform: "Google Meet",
    meetLink: "https://meet.google.com/new",
    tags: ["Maths", "Science", "SST", "English", "CS"],
    features: [
      "All 5 Board subjects covered comprehensively",
      "Cohort strictly capped at 30 students",
      "Board paper answer writing evaluation",
      "Live doubt clearing calls on Google Meet"
    ]
  },

  // CLASS 11-12 BATCHES (Total 70 Students Strength: 35 for PCMB, 35 for All Sub)
  {
    id: 301,
    title: "Class 11–12 PCMB Pinnacle Batch (Physics, Chemistry, Maths & Bio)",
    classLevel: "Class 11-12",
    category: "PCMB Focus",
    badge: "35 Max Students",
    seatsTotal: 35,
    seatsFilled: 29,
    price: 4999,
    originalPrice: 9999,
    discount: "50% OFF",
    billing: "Yearly Subscription",
    instructor: "Prof. Arvind Swamy",
    instructorRole: "Ex-IIT Madras Faculty",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    rating: 4.96,
    reviewsCount: 260,
    schedule: "Mon, Wed, Fri, Sat • 7:00 PM IST",
    duration: "Full 11th & 12th Cycle",
    platform: "Google Meet",
    meetLink: "https://meet.google.com/new",
    tags: ["Physics", "Chemistry", "Maths", "Biology"],
    features: [
      "Complete Senior Secondary PCMB curriculum",
      "Max 35 students per batch for high rigour",
      "Derivation walkthroughs & numerical mastery",
      "Mindmaps, DPPs & chapter-wise problem banks"
    ]
  },
  {
    id: 302,
    title: "Class 11–12 Complete Board & Competitive Foundation (All Subjects)",
    classLevel: "Class 11-12",
    category: "All Subjects",
    badge: "35 Max Students",
    seatsTotal: 35,
    seatsFilled: 31,
    price: 9999,
    originalPrice: 15999,
    discount: "37% OFF",
    billing: "Yearly Subscription",
    instructor: "Kavita Reddy",
    instructorRole: "BITS Pilani M.Tech",
    instructorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    rating: 4.93,
    reviewsCount: 195,
    schedule: "Daily • 7:30 PM IST",
    duration: "Full Academic Year",
    platform: "Google Meet",
    meetLink: "https://meet.google.com/new",
    tags: ["Board Prep", "Competitive Entrance", "All Subjects"],
    features: [
      "Comprehensive coverage for CBSE/State Boards & Entrance",
      "Strictly limited to 35 students max",
      "Recorded video replays + PDF notes",
      "Google Meet live discussions & strategy mentorship"
    ]
  },

  // JEE & NEET BATCHES (Total 100 Students Strength: 50 for JEE, 50 for NEET)
  {
    id: 401,
    title: "JEE Mains & Advanced Super-50 Rankers Cohort",
    classLevel: "JEE/NEET",
    category: "JEE Prep",
    badge: "50 Max Students",
    seatsTotal: 50,
    seatsFilled: 44,
    price: 9999,
    originalPrice: 16999,
    discount: "41% OFF (30-50% Off)",
    billing: "Per Subject / Year",
    instructor: "Rahul Sharma & Team",
    instructorRole: "IIT Bombay (AIR 142)",
    instructorAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    rating: 4.99,
    reviewsCount: 340,
    schedule: "Mon to Sat • 4:00 PM IST",
    duration: "Target JEE 2026",
    platform: "Google Meet",
    meetLink: "https://meet.google.com/new",
    tags: ["JEE Mains", "JEE Advanced", "Physics/Chem/Maths"],
    features: [
      "High-yield JEE Advanced problem solving tactics",
      "Capped at exactly 50 serious JEE aspirants",
      "15+ All-India rank predictor mock tests",
      "Daily Practice Problems (DPP) with video solutions"
    ]
  },
  {
    id: 402,
    title: "NEET UG AIIMS Squad 50 (Physics, Chem, Biology)",
    classLevel: "JEE/NEET",
    category: "NEET Prep",
    badge: "50 Max Students",
    seatsTotal: 50,
    seatsFilled: 47,
    price: 9999,
    originalPrice: 16999,
    discount: "41% OFF (30-50% Off)",
    billing: "Per Subject / Year",
    instructor: "Dr. Meenakshi Sundaram",
    instructorRole: "AIIMS New Delhi Gold Medalist",
    instructorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&auto=format&fit=crop&q=80",
    rating: 4.98,
    reviewsCount: 310,
    schedule: "Mon to Sat • 5:00 PM IST",
    duration: "Target NEET 2026",
    platform: "Google Meet",
    meetLink: "https://meet.google.com/new",
    tags: ["NEET UG", "NCERT Biology", "AIIMS Focus"],
    features: [
      "NCERT line-by-line Biology masterclasses",
      "Capped at exactly 50 dedicated NEET aspirants",
      "High-speed Physics numerical tricks for NEET",
      "Live Q&A on Google Meet with AIIMS Doctors"
    ]
  }
];

// --- MAIN APPLICATION ROOT ---
function App() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('lunexa-theme') || 'light'; } catch (e) { return 'light'; }
  });
  const [currentView, setCurrentView] = useState('landing');
  const [userRole, setUserRole] = useState('student');
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('lunexa-user') || 'null'); } catch (e) { return null; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modeFilter, setModeFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(500);
  const [studentCoins, setStudentCoins] = useState(250);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [enrolledBatches, setEnrolledBatches] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 101,
      studentName: "Kavya Mehra",
      grade: "Class 12 CBSE",
      topic: "Rotational Dynamics & Torque",
      time: "Tomorrow, 6:00 PM",
      tokenOffer: "₹300"
    }
  ]);

  const [mentorsList, setMentorsList] = useState(MENTORS);
  const [batchesList, setBatchesList] = useState(BATCHES);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      const faviconTag = document.querySelector("link[rel='icon']");
      if (faviconTag) faviconTag.href = 'favicon-dark.svg';
    } else {
      document.documentElement.classList.remove('dark');
      const faviconTag = document.querySelector("link[rel='icon']");
      if (faviconTag) faviconTag.href = 'favicon-light.svg';
    }
    try { localStorage.setItem('lunexa-theme', theme); } catch (e) {}
  }, [theme]);

  useEffect(() => {
    try {
      if (currentUser) sessionStorage.setItem('lunexa-user', JSON.stringify(currentUser));
      else sessionStorage.removeItem('lunexa-user');
    } catch (e) {}
  }, [currentUser]);

  // Sync Data with Supabase Backend
  useEffect(() => {
    async function loadSupabaseData() {
      if (!supabaseClient) return;

      try {
        const { data: mData, error: mErr } = await supabaseClient.from('mentors').select('*');
        if (!mErr && mData && mData.length > 0) {
          setMentorsList(mData);
        }
      } catch (e) {}

      try {
        const { data: bData, error: bErr } = await supabaseClient.from('batches').select('*');
        if (!bErr && bData && bData.length > 0) {
          setBatchesList(bData);
        }
      } catch (e) {}

      if (currentUser && currentUser.email) {
        try {
          const { data: prof } = await supabaseClient.from('profiles').select('*').eq('email', currentUser.email).maybeSingle();
          if (prof && prof.coins !== undefined) {
            setStudentCoins(prof.coins);
          } else {
            await supabaseClient.from('profiles').upsert([
              { full_name: currentUser.name || 'User', email: currentUser.email, avatar_url: currentUser.picture || '', coins: studentCoins }
            ]);
          }

          const { data: bks } = await supabaseClient.from('bookings').select('*').eq('student_name', currentUser.name || 'Student');
          if (bks && bks.length > 0) {
            setUpcomingSessions(bks.map(b => ({
              id: b.id,
              mentorName: "Verified Mentor",
              topic: b.topic,
              time: b.scheduled_time,
              status: b.status || "Confirmed"
            })));
          }
        } catch (e) {}
      }
    }
    loadSupabaseData();
  }, [currentUser]);

  const showToast = (message, icon = "") => {
    setToast({ message, icon, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const navTabs = [
    { id: 'landing', label: 'Home' },
    { id: 'live-classes', label: 'Live Classes' },
    { id: 'batches', label: 'Batches' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'dashboard', label: userRole === 'mentor' ? 'Mentor Hub' : 'Desk' }
  ];

  const goToView = (id) => {
    setMobileOpen(false);
    if (id === 'dashboard' && !currentUser) {
      setActiveModal('auth');
      showToast("Log in to open your desk", "");
      return;
    }
    setCurrentView(id);
  };

  const requireAuth = (thenFn) => {
    if (!currentUser) {
      setActiveModal('auth');
      showToast("Log in to continue", "");
      return;
    }
    thenFn();
  };

  const filteredMentors = useMemo(() => {
    return MENTORS.filter(m => {
      const q = searchQuery.toLowerCase();
      const matchQ = !q || m.name.toLowerCase().includes(q) ||
        m.college.toLowerCase().includes(q) ||
        m.subjects.some(s => s.toLowerCase().includes(q));
      const matchCat = selectedCategory === 'All' || m.category === selectedCategory || m.subjects.some(s => s.toLowerCase().includes(selectedCategory.toLowerCase()));
      const matchMode = modeFilter === 'all' || modeFilter === '1on1' || modeFilter === 'batches';
      const matchPrice = m.hourlyRate <= maxPrice;
      return matchQ && matchCat && matchMode && matchPrice;
    });
  }, [searchQuery, selectedCategory, modeFilter, maxPrice]);

  const dashboardView = (
    <DualDashboardView
      role={userRole}
      currentUser={currentUser}
      studentCoins={studentCoins}
      setStudentCoins={setStudentCoins}
      upcomingSessions={upcomingSessions}
      enrolledBatches={enrolledBatches}
      pendingRequests={pendingRequests}
      mentors={MENTORS}
      onFindMentor={() => setCurrentView('live-classes')}
      onBrowseBatches={() => setCurrentView('batches')}
      onGetTokens={() => setCurrentView('pricing')}
      onBookMentor={(m) => {
        setSelectedMentor(m);
        setActiveModal('booking');
      }}
      onAcceptRequest={(r) => {
        setPendingRequests(pendingRequests.filter(item => item.id !== r.id));
        setUpcomingSessions([
          ...upcomingSessions,
          { id: Date.now(), mentorName: "You (Mentor)", college: "IIT Bombay", topic: r.topic, time: r.time, status: "Confirmed" }
        ]);
        showToast(`Accepted session with ${r.studentName}!`, "");
      }}
      onDeclineRequest={(r) => {
        setPendingRequests(pendingRequests.filter(item => item.id !== r.id));
        showToast(`Declined request from ${r.studentName}`, "");
      }}
      onJoinLive={(s) => {
        showToast("Opening Google Meet live classroom...", "🎥");
        window.open((s && s.meetUrl) || "https://meet.google.com/new", "_blank");
      }}
      onScheduleFreeClass={() => requireAuth(() => setActiveModal('freeClassSchedule'))}
    />
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${theme === 'dark' ? 'dark bg-[#0B0F19] text-slate-100' : 'bg-[#F8FAFC] text-slate-800'}`}>

      {currentView !== 'live-room' && (
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Open menu"
            >
              <Icon name={mobileOpen ? 'x' : 'menu'} className="w-5 h-5" />
            </button>
            <div onClick={() => goToView('landing')} className="cursor-pointer">
              <BrandLogo />
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {navTabs.map(tab => {
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => goToView(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            <div className="hidden xl:flex items-center relative">
              <Icon name="search" className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'live-classes') setCurrentView('live-classes');
                }}
                className="w-40 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle Light/Dark"
            >
              {theme === 'light' ? <Icon name="moon" className="w-4 h-4" /> : <Icon name="sun" className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => goToView('dashboard')}
                  className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
                  title="Go to Dashboard"
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {currentUser.name ? currentUser.name[0] : 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[90px] truncate">
                    {currentUser.name}
                  </span>
                </button>
                <button
                  onClick={() => setActiveModal('logoutConfirm')}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Log Out"
                >
                  <Icon name="log-out" className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setActiveModal('auth')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Log In
                </button>
                <button
                  onClick={() => setActiveModal('auth')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 px-4 pb-4 pt-2 space-y-1 bg-white dark:bg-slate-900">
            {navTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => goToView(tab.id)}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl ${currentView === tab.id ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600' : 'text-slate-700 dark:text-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
            <div className="relative pt-2">
              <Icon name="search" className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-4.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setMobileOpen(false);
                  setCurrentView('live-classes');
                }}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        )}
      </header>
      )}

      <main className="flex-1">
        <ErrorBoundary onReset={() => setCurrentView('landing')}>
        {currentView === 'landing' && (
          <LunexaLandingPage
            onFindMentor={() => setCurrentView('live-classes')}
            onRegisterMentor={() => setCurrentView('mentor-register')}
            onOpenPricing={() => setCurrentView('pricing')}
            onOpenLiveRoom={() => requireAuth(() => setCurrentView('live-room'))}
            mentors={mentorsList}
            batches={batchesList}
            onSelectMentor={(m) => {
              setSelectedMentor(m);
              requireAuth(() => setActiveModal('booking'));
            }}
          />
        )}

        {currentView === 'pricing' && (
          <LunexaPricingPage
            onStartFree={() => requireAuth(() => setActiveModal('freeClassSchedule'))}
            onFindMentor={() => setCurrentView('live-classes')}
            onBrowseBatches={() => setCurrentView('batches')}
            onScheduleFreeClass={() => requireAuth(() => setActiveModal('freeClassSchedule'))}
          />
        )}

        {currentView === 'live-classes' && (
          <LiveClassesPage
            mentors={filteredMentors}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            modeFilter={modeFilter}
            setModeFilter={setModeFilter}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            theme={theme}
            upcomingSessions={upcomingSessions}
            onJoinLive={() => requireAuth(() => setCurrentView('live-room'))}
            showToast={showToast}
            onBookMentor={(m) => {
              setSelectedMentor(m);
              requireAuth(() => setActiveModal('booking'));
            }}
            onViewProfile={(m) => {
              setSelectedMentor(m);
              setActiveModal('profile');
            }}
            onBrowseBatches={() => setCurrentView('batches')}
          />
        )}

        {currentView === 'batches' && (
          <BatchClassesPage
            batches={batchesList}
            enrolledIds={enrolledBatches.map(b => b.id)}
            onEnrollBatch={(b) => requireAuth(() => {
              if (!enrolledBatches.find(item => item.id === b.id)) {
                setEnrolledBatches([...enrolledBatches, b]);
              }
              showToast(`Enrolled in "${b.title}"!`, "🎉");
              setCurrentView('dashboard');
            })}
            onScheduleFreeClass={() => requireAuth(() => setActiveModal('freeClassSchedule'))}
            onJoinMeet={(b) => {
              showToast(`Opening Google Meet live classroom for ${b.title}...`, "🎥");
              window.open(b.meetLink || "https://meet.google.com/new", "_blank");
            }}
          />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorksSection onGetStarted={() => setCurrentView('live-classes')} />
        )}

        {currentView === 'dashboard' && currentUser && dashboardView}

        {currentView === 'mentor-register' && (
          <LunexaMentorRegistrationWizard
            currentUser={currentUser}
            onComplete={(regData) => {
              showToast("Application submitted! College ID under verification.", "");
              if (!currentUser) {
                setCurrentUser({ name: 'Rahul Sharma', email: 'college.email@iitb.ac.in', role: 'mentor' });
              }
              if (supabaseClient && regData) {
                supabaseClient.from('mentors').insert([{
                  name: regData.fullName || 'New Mentor',
                  college: regData.college || 'IIT',
                  year: regData.year || '3rd Year',
                  hourly_rate: regData.rate || 300,
                  subjects: regData.subjects || ['Maths'],
                  bio: regData.bio || 'Verified Peer Mentor'
                }]).then(() => {});
              }
              setCurrentView('dashboard');
              setUserRole('mentor');
            }}
            onCancel={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'live-room' && (
          <LiveClassroomMock
            onExit={() => setCurrentView(currentUser ? 'dashboard' : 'landing')}
            mentor={selectedMentor || mentorsList[2] || MENTORS[2]}
            showToast={showToast}
          />
        )}
        </ErrorBoundary>
      </main>

      {currentView !== 'live-room' && (
      <LunexaFooter
        onNavigate={(view) => goToView(view)}
        onRegisterMentor={() => setCurrentView('mentor-register')}
        onGuidelines={() => setActiveModal('guidelines')}
      />
      )}

      {/* 4. MODALS */}
            {/* FREE CLASS SCHEDULE MODAL */}
      {activeModal === 'freeClassSchedule' && (
        <FreeClassScheduleModal
          mentors={mentorsList}
          currentUser={currentUser}
          onClose={() => setActiveModal(null)}
          onConfirm={(data) => {
            setActiveModal(null);
            const newSession = {
              id: Date.now(),
              mentorName: data.mentorName,
              college: "IIT / NIT Mentor",
              topic: data.topic,
              time: data.timeSlot,
              status: "Confirmed",
              isLive: true
            };
            setUpcomingSessions([newSession, ...upcomingSessions]);

            if (supabaseClient) {
              supabaseClient.from('bookings').insert([{
                student_name: currentUser ? currentUser.name : "Student",
                topic: data.topic,
                scheduled_time: data.timeSlot,
                fee: "FREE (1st Class)",
                status: "Confirmed"
              }]).then(() => {});
            }

            showToast(` Your FREE 1:1 Live Class is scheduled!`, "🎉");

            if (data.meetOption === 'meet') {
              window.open("https://meet.google.com/new", "_blank");
            } else {
              setCurrentView('live-room');
            }
          }}
        />
      )}
      {/* LOGOUT CONFIRMATION MODAL */}
      {activeModal === 'logoutConfirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <Icon name="log-out" className="w-7 h-7 text-rose-500" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Log Out of Lunexa?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to log out? You will need to log back in to access your desk and live classes.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setCurrentUser(null);
                  setCurrentView('landing');
                  showToast("Logged out successfully", "");
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-md shadow-rose-600/20"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'auth' && (
        <LunexaAuthModal
          onClose={() => setActiveModal(null)}
          onSuccess={(userData) => {
            const role = typeof userData === 'object' ? (userData.role || userRole) : userData;
            setUserRole(role);
            if (typeof userData === 'object') {
              setCurrentUser(userData);
              showToast(`Welcome, ${userData.name}!`, "");
            } else {
              setCurrentUser({ name: 'Student', email: 'student@lunexa.edu', role: role });
              showToast(`Logged in successfully!`, "");
            }
            if (selectedMentor) {
              setActiveModal('booking');
            } else {
              setActiveModal(null);
              setCurrentView('dashboard');
            }
          }}
          onGoToMentorRegistration={(prefill) => {
            setActiveModal(null);
            if (prefill && typeof prefill === 'object') {
              setCurrentUser(prefill);
              showToast(`Google profile connected!`, "");
            }
            setCurrentView('mentor-register');
          }}
        />
      )}

      {activeModal === 'booking' && selectedMentor && (
        <BookingModal
          mentor={selectedMentor}
          onClose={() => setActiveModal(null)}
          onConfirm={(data) => {
            setActiveModal(null);
            const cost = selectedMentor.hourlyRate || 0;
            if (cost > 0 && studentCoins < cost) {
              showToast("Not enough tokens. Grab a pack from Pricing.", "");
              setCurrentView('pricing');
              return;
            }
            if (cost > 0) setStudentCoins(studentCoins - cost);
            const newSession = {
              id: Date.now(),
              mentorName: selectedMentor.name,
              college: selectedMentor.college,
              topic: data.topic || "Doubt Solving",
              time: `${data.date} at ${data.time}`,
              status: "Confirmed"
            };
            setUpcomingSessions([...upcomingSessions, newSession]);

            if (supabaseClient) {
              supabaseClient.from('bookings').insert([{
                student_name: currentUser ? currentUser.name : "Student",
                topic: data.topic || "Doubt Solving",
                scheduled_time: `${data.date} at ${data.time}`,
                fee: `${selectedMentor.hourlyRate}`,
                status: "Confirmed"
              }]).then(() => {});
            }

            showToast(`Session booked with ${selectedMentor.name}!`, "");
            setCurrentView('dashboard');
          }}
        />
      )}

      {activeModal === 'profile' && selectedMentor && (
        <MentorProfileModal
          mentor={selectedMentor}
          onClose={() => setActiveModal(null)}
          onBook={() => setActiveModal('booking')}
        />
      )}

      {/* 5. TOAST NOTIFICATION */}
      {activeModal === 'guidelines' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Mentor guidelines</h3>
              <button onClick={() => setActiveModal(null)}><Icon name="x" className="w-4 h-4 text-slate-400" /></button>
            </div>
            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-5">
              <li>Upload a valid college ID and entrance rank proof.</li>
              <li>Keep sessions on-syllabus and academically honest — no leaking papers.</li>
              <li>Show up on time. Cancel at least 2 hours ahead.</li>
              <li>Volunteer mentors keep sessions free; paid mentors set their own hourly rate.</li>
            </ul>
            <button onClick={() => { setActiveModal(null); setCurrentView('mentor-register'); }} className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600">
              Apply as mentor
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl bg-slate-900 text-white border border-slate-700 animate-fade-up">
          <span className="text-base">{toast.icon}</span>
          <div className="text-xs font-medium">{toast.message}</div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white ml-2">
            <Icon name="x" className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6. AI HELPER CHATBOT (Bottom Right Corner) */}
      {currentView !== 'live-room' && (
      <LunexaAIChatbot
        onNavigate={(v) => goToView(v)}
        onOpenAuth={() => setActiveModal('auth')}
      />
      )}

    </div>
  );
}

// =========================================================================
// PRICING / FREE TIER PAGE (Matches Image 5 EXACTLY)
// =========================================================================
// =========================================================================
// PRICING PAGE: YEARLY LIVE CLASS SUBSCRIPTIONS
// =========================================================================
// =========================================================================
// PRICING PAGE: YEARLY LIVE CLASS SUBSCRIPTIONS
// =========================================================================


// =========================================================================
// PRICING PAGE: YEARLY LIVE BATCH SUBSCRIPTIONS
// =========================================================================
// =========================================================================
// PRICING PAGE: YEARLY LIVE BATCH SUBSCRIPTIONS
// =========================================================================
// =========================================================================
// FREE CLASS SCHEDULE & ATTEND MODAL (STRICTLY GOOGLE MEET)
// =========================================================================
function FreeClassScheduleModal({ onClose, onConfirm, currentUser, mentors = [] }) {
  const [gradeLevel, setGradeLevel] = useState('Class 11-12');
  const [subject, setSubject] = useState('Physics');
  const [mentorName, setMentorName] = useState(mentors[0] ? mentors[0].name : 'Ananya Roy (IIT Bombay)');
  const [topic, setTopic] = useState('');
  const [timeSlot, setTimeSlot] = useState('LIVE NOW (Instant Pair)');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      gradeLevel,
      subject,
      mentorName,
      topic: topic || `${subject} Live Doubt Solving`,
      timeSlot,
      meetOption: 'meet'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-up overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Schedule Your FIRST Live Class (FREE)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% Free • No Credit Card • Conducted on Google Meet
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Grade Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Grade / Class Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Class 5-8', 'Class 9-10', 'Class 11-12', 'JEE / NEET Prep'].map(lvl => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setGradeLevel(lvl)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    gradeLevel === lvl 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Mathematics">Mathematics (Algebra, Calculus, Geometry)</option>
              <option value="Physics">Physics (Mechanics, Optics, Electricity)</option>
              <option value="Chemistry">Chemistry (Organic, Physical, Inorganic)</option>
              <option value="Biology">Biology (Botany, Zoology, Genetics)</option>
              <option value="Coding & CS">Coding & Computer Science (Python, Java, DSA)</option>
            </select>
          </div>

          {/* Mentor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Peer College Mentor
            </label>
            <select
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Ananya Roy (IIT Bombay)">Ananya Roy — IIT Bombay (AIR 142)</option>
              <option value="Devansh Patel (NIT Trichy)">Devansh Patel — NIT Trichy (Chemistry Topper)</option>
              <option value="Rohan Verma (BITS Pilani)">Rohan Verma — BITS Pilani (Maths & CS)</option>
              <option value="Priya Sharma (AIIMS Delhi)">Priya Sharma — AIIMS Delhi (NEET Ranker)</option>
            </select>
          </div>

          {/* Date & Time Slot */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'LIVE NOW (Instant Pair)',
                'Today, 5:00 PM',
                'Today, 7:00 PM',
                'Tomorrow, 11:00 AM'
              ].map(slot => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setTimeSlot(slot)}
                  className={`py-2 px-2.5 text-[11px] font-bold rounded-xl border transition-all ${
                    timeSlot === slot 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Topic / Doubt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              What topic or doubt do you want to solve?
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Help with Rotational Motion problems / Board PYQs..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Classroom Platform Note: Strictly Google Meet */}
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
            <span>🎥</span> Class Conducted via: <strong>Google Meet</strong>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-4 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>🎥</span> Schedule & Attend FREE Class on Meet
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

// =========================================================================
// PRICING PAGE: YEARLY LIVE BATCH SUBSCRIPTIONS
// =========================================================================
function LunexaPricingPage({ onStartFree, onFindMentor, onBrowseBatches, onScheduleFreeClass }) {
  const [class58Option, setClass58Option] = useState('each'); // 'each' (₹799) | 'all' (₹3999)
  const [class910Option, setClass910Option] = useState('ms'); // 'ms' (₹3999) | 'all' (₹5999)
  const [class1112Option, setClass1112Option] = useState('ms'); // 'ms' (₹4999) | 'all' (₹9999)
  const [jeeNeetOption, setJeeNeetOption] = useState('1112'); // '1112' (₹11999/2yr) | 'dropper' (₹5999/1yr)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Header Badge & Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
          <span>Yearly Live Class Subscriptions</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Structured Live Batch Classes from College Rankers
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          First Live Class is 100% FREE on signup. Small batch sizes with guaranteed seat limits.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
          <span>✨</span> First Live Class is FREE for All Students!
        </div>
      </div>

      {/* 4 Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">

        {/* CARD 1: Class 5 - 8 Yearly */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-base shadow-md">
                5-8
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                First Class FREE
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Class 5 – 8 Pass</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Middle School Core Foundations</p>

            {/* Subject Selector Toggle */}
            <div className="my-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex text-xs font-semibold">
              <button
                onClick={() => setClass58Option('each')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${class58Option === 'each' ? 'bg-white dark:bg-slate-900 text-teal-600 font-bold shadow-sm' : 'text-slate-500'}`}
              >
                Each Subject
              </button>
              <button
                onClick={() => setClass58Option('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${class58Option === 'all' ? 'bg-white dark:bg-slate-900 text-teal-600 font-bold shadow-sm' : 'text-slate-500'}`}
              >
                All Subjects
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {class58Option === 'each' ? '₹799' : '₹3,999'}
                </span>
                <span className="text-xs text-slate-400 font-semibold line-through">
                  {class58Option === 'each' ? '₹1,599' : '₹7,999'}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  50% OFF
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">per year (Full 1-Year Access)</span>
            </div>

            {/* Batch Strength Info Badge */}
            <div className="mb-5 p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px]">
              <div className="font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <span>👥</span> Batch Strength: <strong>40 Students Max</strong>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                {class58Option === 'all' ? '● 30 seats for All Subjects' : '● 10 seats for Per Subject'}
              </div>
            </div>

            <button
              onClick={onScheduleFreeClass}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-md mb-6"
            >
              Enroll Class 5-8 (First Class Free)
            </button>

            {/* Features */}
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {[
                "1st Live Class 100% FREE",
                "Max 40 Students Batch Capacity",
                class58Option === 'each' ? "Choose 1 Subject (Maths/Science/Eng)" : "All Class 5-8 Subjects Included",
                "Live doubt solving on Google Meet",
                "Weekly practice & quiz tests",
                "Recorded session replays"
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon name="check" className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                  <span className="text-[11px]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 2: Class 9 - 10 Yearly */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-md">
                9-10
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                First Class FREE
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Class 9 – 10 Pass</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Foundational Boards & Science Mastery</p>

            {/* Subject Selector Toggle */}
            <div className="my-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex text-xs font-semibold">
              <button
                onClick={() => setClass910Option('ms')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${class910Option === 'ms' ? 'bg-white dark:bg-slate-900 text-indigo-600 font-bold shadow-sm' : 'text-slate-500'}`}
              >
                Maths & Science
              </button>
              <button
                onClick={() => setClass910Option('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${class910Option === 'all' ? 'bg-white dark:bg-slate-900 text-indigo-600 font-bold shadow-sm' : 'text-slate-500'}`}
              >
                All Subjects
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {class910Option === 'ms' ? '₹3,999' : '₹5,999'}
                </span>
                <span className="text-xs text-slate-400 font-semibold line-through">
                  {class910Option === 'ms' ? '₹7,999' : '₹9,999'}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {class910Option === 'ms' ? '50% OFF' : '40% OFF'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">per year (Full 1-Year Access)</span>
            </div>

            {/* Batch Strength Info Badge */}
            <div className="mb-5 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px]">
              <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <span>👥</span> Batch Strength: <strong>70 Students Max</strong>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                {class910Option === 'ms' ? '● 40 seats for Science & Maths' : '● 30 seats for All Subjects'}
              </div>
            </div>

            <button
              onClick={onScheduleFreeClass}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md mb-6"
            >
              Enroll Class 9-10 (First Class Free)
            </button>

            {/* Features */}
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {[
                "1st Live Class 100% FREE",
                "Max 70 Students Batch Capacity",
                class910Option === 'ms' ? "Full Maths & Science Yearly Syllabus" : "All Class 9-10 Subjects Included",
                "Live doubt solving on Google Meet",
                "Weekly live practice & quiz tests",
                "Recorded session replays for revision"
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon name="check" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-[11px]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 3: Class 11 - 12 Yearly (MOST POPULAR) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-indigo-600 relative shadow-2xl flex flex-col justify-between -mt-2 md:-mt-4">
          <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
            <span>⭐</span> Most Popular
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-base shadow-md">
                11-12
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                First Class FREE
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Class 11 – 12 Pass</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Senior Secondary Boards & Entrance Prep</p>

            {/* Subject Selector Toggle */}
            <div className="my-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex text-xs font-semibold">
              <button
                onClick={() => setClass1112Option('ms')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${class1112Option === 'ms' ? 'bg-white dark:bg-slate-900 text-indigo-600 font-bold shadow-sm' : 'text-slate-500'}`}
              >
                Maths & Science
              </button>
              <button
                onClick={() => setClass1112Option('all')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${class1112Option === 'all' ? 'bg-white dark:bg-slate-900 text-indigo-600 font-bold shadow-sm' : 'text-slate-500'}`}
              >
                All Subjects
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {class1112Option === 'ms' ? '₹4,999' : '₹9,999'}
                </span>
                <span className="text-xs text-slate-400 font-semibold line-through">
                  {class1112Option === 'ms' ? '₹9,999' : '₹17,999'}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {class1112Option === 'ms' ? '50% OFF' : '45% OFF'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">per year (Full 1-Year Access)</span>
            </div>

            {/* Batch Strength Info Badge */}
            <div className="mb-5 p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px]">
              <div className="font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                <span>👥</span> Batch Strength: <strong>70 Students Max</strong>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                {class1112Option === 'ms' ? '● 35 seats for PCMB Stream' : '● 35 seats for All Subjects'}
              </div>
            </div>

            <button
              onClick={onScheduleFreeClass}
              className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl transition-all mb-6"
            >
              Enroll Class 11-12 (First Class Free)
            </button>

            {/* Features */}
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {[
                "1st Live Class 100% FREE",
                "Max 70 Students Batch Capacity",
                class1112Option === 'ms' ? "Full Maths, Physics & Chem Syllabus" : "All Class 11-12 Stream Subjects",
                "Daily live problem solving on Google Meet",
                "Priority live doubt room matching",
                "Complete Board exam test series"
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon name="check" className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span className="text-[11px]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 4: JEE / NEET Prep */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-[10px] shadow-md">
                JEE/NEET
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                50% OFF DEDUCTION
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">JEE / NEET Super Pass</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Targeted Competitive Exam Rank Booster</p>

            {/* Toggle Option Pill */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl my-4 text-xs">
              <button
                onClick={() => setJeeNeetOption('1112')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${jeeNeetOption === '1112' ? 'bg-white dark:bg-slate-900 text-amber-600 font-bold shadow-sm' : 'text-slate-500'}`}
              >
                11th + 12th (2-Yr)
              </button>
              <button
                onClick={() => setJeeNeetOption('dropper')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${jeeNeetOption === 'dropper' ? 'bg-white dark:bg-slate-900 text-amber-600 font-bold shadow-sm' : 'text-slate-500'}`}
              >
                Dropper / 1-Yr
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {jeeNeetOption === '1112' ? '₹11,999' : '₹5,999'}
                </span>
                <span className="text-xs text-slate-400 font-semibold line-through">
                  {jeeNeetOption === '1112' ? '₹23,999' : '₹11,999'}
                </span>
                <span className="text-[10px] text-rose-500 font-extrabold">50% DEDUCTION</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {jeeNeetOption === '1112' ? 'per subject / 2 years (Full 2-Year Batch)' : 'per subject / year (Full Dropper Batch)'}
              </span>
            </div>

            {/* Batch Strength Info Badge */}
            <div className="mb-5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px]">
              <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <span>👥</span> Batch Strength: <strong>100 Students Max</strong>
              </div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                ● 50 seats for JEE • 50 seats for NEET
              </div>
            </div>

            <button
              onClick={onScheduleFreeClass}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-md mb-6"
            >
              Enroll JEE/NEET ({jeeNeetOption === '1112' ? '11th+12th 2-Yr' : 'Dropper Batch'})
            </button>

            {/* Features */}
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {[
                "1st Live Class 100% FREE",
                "Max 100 Students Batch Capacity",
                jeeNeetOption === '1112' ? "Complete 2-Year Syllabus (Class 11 & 12)" : "Full 1-Year Intensive Dropper Syllabus",
                "Top Ranker Mentors (IIT Bombay, AIIMS)",
                "50% Deduction Discount Applied",
                "High-Yield PYQ & Mock Test Sprints",
                "24/7 Priority Doubt Clearing"
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon name="check" className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-[11px]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Guarantee Banner - Interactive Clickable Button */}
      <button
        onClick={onScheduleFreeClass}
        className="w-full mt-16 p-6 rounded-3xl bg-gradient-to-r from-indigo-900/90 via-indigo-800 to-slate-900 text-center text-white border border-indigo-700/50 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all max-w-4xl mx-auto block cursor-pointer group"
      >
        <h4 className="text-lg font-bold mb-1 flex items-center justify-center gap-2 group-hover:text-indigo-200 transition-colors">
          <span>✨</span> Try Before You Subscribe: First Live Class is FREE!
        </h4>
        <p className="text-xs text-indigo-200/90 group-hover:text-white transition-colors">
          No credit card required. Experience live peer mentorship on Google Meet today. Click to schedule your free class →
        </p>
      </button>

    </div>
  );
}

// =========================================================================
// AUTH MODAL: "CREATE YOUR ACCOUNT" (Matches Image 1 EXACTLY)
// =========================================================================
function LunexaAuthModal({ onClose, onSuccess, onGoToMentorRegistration }) {
  const [role, setRole] = useState('student'); // default to student for quick login
  const [authMode, setAuthMode] = useState('signup'); // 'login' | 'signup'

  // Student form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Initialize and Render Google Sign-In button
  useEffect(() => {
    let interval = null;

    const setupGoogle = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              setGoogleLoading(false);
              const profile = parseJwt(response.credential);
              if (profile) {
                const userData = {
                  name: profile.name || profile.given_name || 'Google User',
                  email: profile.email,
                  avatar: profile.picture,
                  role: role
                };
                if (role === 'mentor') {
                  onGoToMentorRegistration(userData);
                } else {
                  onSuccess(userData);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });

          const targetEl = document.getElementById('g-signin-container');
          if (targetEl) {
            targetEl.innerHTML = '';
            window.google.accounts.id.renderButton(targetEl, {
              theme: 'outline',
              size: 'large',
              width: 340,
              text: authMode === 'signup' ? 'signup_with' : 'signin_with',
              shape: 'pill',
              logo_alignment: 'left'
            });
          }

          if (interval) clearInterval(interval);
        } catch (e) {
          console.warn("Google Sign-In initialization notice:", e);
        }
      }
    };

    setupGoogle();
    interval = setInterval(setupGoogle, 400);
    const timeout = setTimeout(() => {
      if (interval) clearInterval(interval);
    }, 4000);

    return () => {
      if (interval) clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [authMode, role]);

  const handleGooglePrompt = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      setGoogleLoading(true);
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
        }
      });
    } else {
      alert("Google Sign-In service is loading... If running locally, ensure third-party cookies or scripts are allowed.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 4) {
      alert("Please enter a valid email and password.");
      return;
    }
    onSuccess({
      name: name || (role === 'student' ? 'Kavya Mehra' : 'Mentor'),
      email: email,
      role: role
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative animate-fade-up">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <Icon name="x" className="w-5 h-5" />
        </button>

        {/* Top Icon: Lunexa Logo */}
        <div className="flex items-center justify-center mx-auto mb-4">
          <img
            src="logo-light.png"
            alt="Lunexa"
            className="dark:hidden h-12 w-auto object-contain rounded-xl"
          />
          <img
            src="logo-full.png"
            alt="Lunexa"
            className="hidden dark:block h-12 w-auto object-contain rounded-xl"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {authMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join Lunexa smart digital peer learning
          </p>
        </div>

        {/* Role Segmented Control Toggle */}
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold mb-4">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${role === 'student'
              ? 'bg-white dark:bg-slate-700 text-[#4F46E5] dark:text-indigo-400 shadow-sm font-bold'
              : 'text-slate-500 dark:text-slate-400'
              }`}
          >
            <Icon name="book-open" className="w-4 h-4" />
            <span>I am a Student</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('mentor')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${role === 'mentor'
              ? 'bg-white dark:bg-slate-700 text-[#4F46E5] dark:text-indigo-400 shadow-sm font-bold'
              : 'text-slate-500 dark:text-slate-400'
              }`}
          >
            <Icon name="users" className="w-4 h-4" />
            <span>I am a Teacher</span>
          </button>
        </div>

        {/* Sub-toggle: Log In | Sign Up */}
        <div className="flex items-center justify-between text-xs mb-4 px-1">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${authMode === 'login'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              Log In
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${authMode === 'signup'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              Sign Up
            </button>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Fast 1-Click Login</span>
        </div>

        {/* GOOGLE SIGN-IN SECTION */}
        <div className="mb-4">
          {/* Target for Google Identity Services Button */}
          <div id="g-signin-container" className="w-full flex justify-center min-h-[44px]">
            {/* Direct fallback trigger button */}
            <button
              type="button"
              onClick={handleGooglePrompt}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm hover:shadow flex items-center justify-center gap-3 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{googleLoading ? 'Connecting to Google...' : (authMode === 'signup' ? `Sign up as ${role === 'student' ? 'Student' : 'Teacher'}` : `Sign in as ${role === 'student' ? 'Student' : 'Teacher'}`)}</span>
            </button>
          </div>

          <div className="flex items-center my-3.5">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
            <span className="px-3 text-[10px] text-slate-400 uppercase font-semibold tracking-wider">or with email</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
          </div>
        </div>

        {/* AUTH FORM FOR BOTH STUDENTS & TEACHERS */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder={role === 'student' ? "e.g. Kavya Mehra" : "e.g. Prof. Rahul Sharma"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder={role === 'student' ? "student@example.com" : "teacher@college.edu"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 pr-10 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400"
              >
                <Icon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-[#4F46E5] hover:bg-[#4338CA] shadow-sm transition-all"
          >
            {authMode === 'signup'
              ? (role === 'student' ? 'Create Student Account' : 'Create Teacher Account')
              : (role === 'student' ? 'Log In as Student' : 'Log In as Teacher')}
          </button>
        </form>

        {role === 'mentor' && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onGoToMentorRegistration()}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Need formal institutional verification? Complete Full Onboarding Wizard →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// =========================================================================
// MENTOR REGISTRATION 3-STEP WIZARD (Matches Images 3 & 4 EXACTLY)
// =========================================================================
function LunexaMentorRegistrationWizard({ onComplete, onCancel, currentUser }) {
  const [step, setStep] = useState(1); // 1, 2, 3

  // Step 1 Form Fields
  const [fullName, setFullName] = useState(currentUser?.name || 'Rahul Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'college.email@iitb.ac.in');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [college, setCollege] = useState('IIT Bombay');
  const [rollNumber, setRollNumber] = useState('2024CSE102');
  const [idFileUploaded, setIdFileUploaded] = useState(false);
  const [yearOfStudy, setYearOfStudy] = useState('Select year');

  // Step 2 Form Fields
  const [subjects, setSubjects] = useState(['JEE Maths', 'Physics']);
  const [languages, setLanguages] = useState(['English', 'Hindi']);
  const [bio, setBio] = useState('AIR 450 in JEE Advanced. Passionate about teaching calculus and mechanics.');
  const [videoUrl, setVideoUrl] = useState('');
  const [experience, setExperience] = useState('1-3 Years');

  // Step 3 Form Fields
  const [teachingModes, setTeachingModes] = useState(['1:1 Live Mentorship']);
  const [availability, setAvailability] = useState(['Mon-Fri Evening']);
  const [rateType, setRateType] = useState('paid');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim() || !email.includes('@') || !rollNumber.trim()) {
        alert("Please fill all required fields.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (subjects.length === 0) {
        alert("Select at least one subject.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!agreedTerms) {
        alert("Please agree to the credentials verification terms.");
        return;
      }
      onComplete();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Top Header with Graduation Cap Icon (Matches Image 4) */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/25">
          <Icon name="graduation-cap" className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Mentor Registration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Join verified college mentors on Lunexa
        </p>
      </div>

      {/* Stepper Header (Matches Image 4) */}
      <div className="flex items-center justify-between max-w-lg mx-auto mb-10 relative">
        {/* Step 1 */}
        <div className="flex flex-col items-center z-10">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${step >= 1 ? 'bg-[#4F46E5]' : 'bg-slate-200 text-slate-400'
            }`}>
            <Icon name="shield" className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xs mt-2 font-medium ${step === 1 ? 'text-[#4F46E5] font-bold' : 'text-slate-400'}`}>
            Personal & College
          </span>
        </div>

        {/* Connecting Line 1 */}
        <div className={`flex-1 h-0.5 mx-2 -mt-6 rounded transition-colors ${step >= 2 ? 'bg-[#4F46E5]' : 'bg-slate-200 dark:bg-slate-700'}`}></div>

        {/* Step 2 */}
        <div className="flex flex-col items-center z-10">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step >= 2 ? 'bg-[#4F46E5] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
            <Icon name="book-open" className="w-5 h-5" />
          </div>
          <span className={`text-xs mt-2 font-medium ${step === 2 ? 'text-[#4F46E5] font-bold' : 'text-slate-400'}`}>
            Teaching Expertise
          </span>
        </div>

        {/* Connecting Line 2 */}
        <div className={`flex-1 h-0.5 mx-2 -mt-6 rounded transition-colors ${step >= 3 ? 'bg-[#4F46E5]' : 'bg-slate-200 dark:bg-slate-700'}`}></div>

        {/* Step 3 */}
        <div className="flex flex-col items-center z-10">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step >= 3 ? 'bg-[#4F46E5] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}>
            <Icon name="calendar" className="w-5 h-5" />
          </div>
          <span className={`text-xs mt-2 font-medium ${step === 3 ? 'text-[#4F46E5] font-bold' : 'text-slate-400'}`}>
            Availability & Mode
          </span>
        </div>
      </div>

      {/* Main Form Container (Matches Images 3 & 4) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

        {/* STEP 1: PERSONAL & COLLEGE VERIFICATION */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Step 1 Title */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Icon name="shield" className="w-5 h-5 text-[#4F46E5]" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Personal & College Verification
              </h2>
            </div>

            {/* Full Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Icon name="user" className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Rahul Sharma"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Icon name="mail" className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="college.email@iitb.ac.in"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Icon name="phone" className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* College / University Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Icon name="search" className="w-3.5 h-3.5 text-slate-400" />
                <span>College / University Name</span>
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="IIT Bombay">IIT Bombay</option>
                <option value="IIT Delhi">IIT Delhi</option>
                <option value="IIT Madras">IIT Madras</option>
                <option value="BITS Pilani">BITS Pilani</option>
                <option value="NIT Trichy">NIT Trichy</option>
                <option value="Delhi University">Delhi University</option>
                <option value="AIIMS New Delhi">AIIMS New Delhi</option>
                <option value="S-VYASA Bangalore">S-VYASA Bangalore</option>
                <option value="Other Premier College">Other Accredited College</option>
              </select>
            </div>

            {/* Student Roll / ID Number */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Icon name="file-text" className="w-3.5 h-3.5 text-slate-400" />
                <span>Student Roll / ID Number</span>
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g., 2024CSE102"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Upload Student ID Card (Matches Image 3) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Upload Student ID Card
              </label>
              <div
                onClick={() => setIdFileUploaded(true)}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${idFileUploaded
                  ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/10 hover:bg-indigo-50/40'
                  }`}
              >
                {idFileUploaded ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2">
                      <Icon name="check" className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-emerald-600">
                      student_id_card.pdf uploaded successfully!
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Click to change file</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Icon name="camera" className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Drag & drop or click to upload
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      JPG, PNG, or PDF (max 5MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Year of Study (Matches Image 3) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <Icon name="graduation-cap" className="w-3.5 h-3.5 text-slate-400" />
                <span>Current Year of Study</span>
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Select year">Select year</option>
                <option value="1st Year">1st Year Undergrad</option>
                <option value="2nd Year">2nd Year Undergrad</option>
                <option value="3rd Year">3rd Year Undergrad</option>
                <option value="4th Year">4th Year Undergrad</option>
                <option value="PostGrad">Postgraduate / Masters</option>
              </select>
            </div>

            {/* Next Step Button (Matches Image 3) */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#4F46E5] hover:bg-[#4338CA] shadow-sm flex items-center gap-2"
              >
                <span>Next Step</span>
                <Icon name="arrow-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TEACHING EXPERTISE & BIO */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Icon name="book-open" className="w-5 h-5 text-[#4F46E5]" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Teaching Expertise & Bio
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Primary Subject Expertise
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Physics',
                  'JEE Maths',
                  'Data Structures & Algo',
                  'Web Dev',
                  'Organic Chemistry',
                  'English'
                ].map(sub => {
                  const active = subjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        if (active) setSubjects(subjects.filter(s => s !== sub));
                        else setSubjects([...subjects, sub]);
                      }}
                      className={`p-2.5 rounded-xl border text-xs text-left flex items-center justify-between transition-all ${active
                        ? 'border-[#4F46E5] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                    >
                      <span>{sub}</span>
                      {active && <Icon name="check" className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Languages Spoken
              </label>
              <div className="flex flex-wrap gap-2">
                {['English', 'Hindi', 'Hinglish', 'Regional'].map(l => {
                  const active = languages.includes(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        if (active) setLanguages(languages.filter(item => item !== l));
                        else setLanguages([...languages, l]);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${active
                        ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your achievement, e.g., AIR 450 in JEE Advanced, love teaching Calculus..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Demo Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube or Drive link of a 2-min sample teaching video"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Prior Teaching Experience
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['No Experience', '< 1 Year', '1-3 Years', '3+ Years'].map(exp => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setExperience(exp)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center ${experience === exp
                      ? 'border-[#4F46E5] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                ← Previous Step
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#4F46E5] hover:bg-[#4338CA] shadow-sm flex items-center gap-2"
              >
                <span>Next Step</span>
                <Icon name="arrow-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AVAILABILITY & MODE */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Icon name="calendar" className="w-5 h-5 text-[#4F46E5]" />
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Availability & Mode
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Preferred Teaching Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['1:1 Live Mentorship', 'Batch Classes'].map(m => {
                  const active = teachingModes.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        if (active) setTeachingModes(teachingModes.filter(item => item !== m));
                        else setTeachingModes([...teachingModes, m]);
                      }}
                      className={`p-3 rounded-xl border text-xs text-left font-semibold flex items-center justify-between ${active
                        ? 'border-[#4F46E5] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                    >
                      <span>{m}</span>
                      {active && <Icon name="check" className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Weekly Availability
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['Mon-Fri Evening', 'Saturday Full Day', 'Sunday Morning'].map(s => {
                  const active = availability.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (active) setAvailability(availability.filter(item => item !== s));
                        else setAvailability([...availability, s]);
                      }}
                      className={`p-2.5 rounded-xl border text-xs text-left font-semibold flex items-center justify-between ${active
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                    >
                      <span>{s}</span>
                      {active && <Icon name="check" className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Class Rates / Volunteering
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setRateType('free')}
                  className={`p-3.5 rounded-2xl border cursor-pointer ${rateType === 'free' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <div className="text-xs font-bold text-emerald-700">Free / Volunteer for SIH Impact</div>
                  <p className="text-[11px] text-slate-500 mt-1">Volunteer certificates and community credits.</p>
                </div>

                <div
                  onClick={() => setRateType('paid')}
                  className={`p-3.5 rounded-2xl border cursor-pointer ${rateType === 'paid' ? 'border-[#4F46E5] bg-indigo-50/50' : 'border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <div className="text-xs font-bold text-[#4F46E5]">Paid Token System (e.g., ₹150 - ₹400 / hour)</div>
                  <p className="text-[11px] text-slate-500 mt-1">Earn direct honorarium payouts via UPI.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  I agree that my college credentials can be verified.
                </span>
              </label>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                ← Previous Step
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#4F46E5] hover:bg-[#4338CA] shadow-sm"
              >
                Submit Mentor Application
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// =========================================================================
// FOOTER (Matches Image 2 EXACTLY)
// =========================================================================
function LunexaFooter({ onNavigate, onRegisterMentor, onGuidelines }) {
  return (
    <footer className="bg-[#0B0F19] text-white pt-14 pb-8 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">

          {/* Left Column: Brand, Tagline, SIH Badge */}
          <div className="md:col-span-4 space-y-3">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('landing')}>
              <img
                src="logo-full.png"
                alt="Lunexa"
                className="h-10 w-auto rounded-lg object-contain shadow-sm"
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              P2P smart digital learning connecting school students with verified college mentors.
            </p>

            {/* Verified Network Badge */}
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/40">
                <span></span>
                <span>Verified Peer Network</span>
              </span>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="font-semibold text-white text-sm mb-3">Platform</h4>
            <div>
              <button onClick={() => onNavigate('live-classes')} className="text-slate-400 hover:text-white transition-colors">
                Find Tutors
              </button>
            </div>
            <div>
              <button onClick={() => onNavigate('batches')} className="text-slate-400 hover:text-white transition-colors">
                Batch Classes
              </button>
            </div>
            <div>
              <button onClick={() => onNavigate('how-it-works')} className="text-slate-400 hover:text-white transition-colors">
                How It Works
              </button>
            </div>
            <div>
              <button onClick={() => onNavigate('pricing')} className="text-slate-400 hover:text-white transition-colors">
                Pricing
              </button>
            </div>
          </div>

          {/* Column 3: For Mentors */}
          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="font-semibold text-white text-sm mb-3">For Mentors</h4>
            <div>
              <button onClick={onRegisterMentor} className="text-slate-400 hover:text-white transition-colors">
                Become a Mentor
              </button>
            </div>
            <div>
              <button onClick={onGuidelines} className="text-slate-400 hover:text-white transition-colors">
                Mentor Guidelines
              </button>
            </div>
            <div>
              <button onClick={() => onNavigate('pricing')} className="text-slate-400 hover:text-white transition-colors">
                Earnings
              </button>
            </div>
          </div>

          {/* Column 4: Connect */}
          <div className="md:col-span-2 space-y-2.5 text-xs">
            <h4 className="font-semibold text-white text-sm mb-3">Connect</h4>
            <a href="mailto:lunexaedu@gmail.com" className="text-slate-400 hover:text-indigo-400 transition-colors block">lunexaedu@gmail.com</a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © 2026 Lunexa. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with</span>
            <span className="text-rose-500"></span>
            <span>for Smart Education</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

// =========================================================================
// INTERACTIVE LIVE CLASSROOM PREVIEW COMPONENT
// =========================================================================
function LiveClassroomPreviewCard({ onOpenLiveRoom }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'You', role: 'student', text: 'Can you explain integration by parts again?', time: '10:42 AM' },
    { id: 2, sender: 'Rahul Sharma (IIT Bombay)', role: 'mentor', text: "Sure! Remember: ∫ u dv = uv - ∫ v du. Always choose 'u' using the ILATE rule.", time: '10:43 AM' },
    { id: 3, sender: 'Kavya M.', role: 'student', text: 'That makes so much sense now! Thank you Rahul bhai!', time: '10:43 AM' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [handRaised, setHandRaised] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [activeTool, setActiveTool] = useState('laser');
  const [activeTab, setActiveTab] = useState('whiteboard');
  const chatEndRef = useRef(null);

  const handleSend = (textToSend) => {
    const query = (typeof textToSend === 'string' ? textToSend : inputMsg).trim();
    if (!query) return;

    const newMsg = {
      id: Date.now(),
      sender: 'You',
      role: 'student',
      text: query,
      time: 'Just now'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');

    setTimeout(() => {
      let replyText = "Great question! Let me write down the step on the board.";
      const lower = query.toLowerCase();
      if (lower.includes('ilate')) {
        replyText = "ILATE priority: Inverse > Logarithmic > Algebraic > Trigonometric > Exponential!";
      } else if (lower.includes('limit') || lower.includes('definite')) {
        replyText = "For definite integrals: evaluate [uv] from a to b, then subtract ∫ v du over [a,b].";
      } else if (lower.includes('step 2') || lower.includes('again') || lower.includes('clear')) {
        replyText = "Step 2: Differentiate u to get du, integrate dv to get v, then plug into uv - ∫v du!";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'Rahul Sharma (IIT Bombay)',
          role: 'mentor',
          text: replyText,
          time: 'Just now'
        }
      ]);
    }, 800);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="mt-14 max-w-5xl mx-auto bg-slate-900 text-slate-100 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 relative overflow-hidden text-left ring-1 ring-white/10">
      
      {/* Studio Header Bar */}
      <div className="px-5 py-3.5 bg-slate-950/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Window Controls + Live Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm"></span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-extrabold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              LIVE STUDIO
            </span>
            <span className="text-xs text-slate-200 font-semibold hidden md:inline">
              Advanced Calculus • JEE 2026 Batch
            </span>
          </div>
        </div>

        {/* Right: Latency info + Enter button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 1080p 60fps
            </span>
            <span>•</span>
            <span>12ms ping</span>
            <span>•</span>
            <span className="text-indigo-300 font-medium"> 38 Students</span>
          </div>

          <button
            type="button"
            onClick={onOpenLiveRoom}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon name="video" className="w-3.5 h-3.5" />
            <span>Enter Classroom</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">

        {/* Left: Collaborative Interactive Whiteboard (7 cols) */}
        <div className="lg:col-span-7 bg-[#060814] p-4 sm:p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative min-h-[390px]">
          
          {/* Top Canvas Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('whiteboard')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === 'whiteboard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                 Whiteboard
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('graph')}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === 'graph'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                 Graph Curve
              </button>
            </div>

            {/* Whiteboard Tool Palette */}
            <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                title="Pen tool"
                className={`p-1.5 rounded-lg text-xs transition-all ${activeTool === 'pen' ? 'bg-indigo-600/40 text-indigo-300 ring-1 ring-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Icon name="pen-tool" className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('eraser')}
                title="Eraser tool"
                className={`p-1.5 rounded-lg text-xs transition-all ${activeTool === 'eraser' ? 'bg-indigo-600/40 text-indigo-300 ring-1 ring-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Icon name="eraser" className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('laser')}
                title="Laser pointer"
                className={`p-1.5 rounded-lg text-xs transition-all ${activeTool === 'laser' ? 'bg-rose-600/40 text-rose-300 ring-1 ring-rose-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                
              </button>
            </div>
          </div>

          {/* Canvas Center View */}
          <div className="my-auto py-5 relative">
            
            {/* Subtle Grid Dot Background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#6366f1 1.2px, transparent 1.2px)',
                backgroundSize: '20px 20px'
              }}
            ></div>

            {/* Mentor Live Video Overlay in Canvas Top-Right */}
            <div className="absolute top-1 right-1 z-10 bg-slate-900/90 backdrop-blur-md rounded-2xl p-2 border border-slate-700/80 shadow-xl flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow">
                  RS
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-white animate-ping"></span>
                </span>
              </div>
              <div className="pr-1 text-left">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-[11px] text-white">Rahul Sharma</span>
                  <span className="px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-300 text-[9px] font-semibold">IIT Bombay</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 h-1.5 bg-emerald-400 animate-pulse"></span>
                    <span className="w-0.5 h-2.5 bg-emerald-400 animate-pulse"></span>
                    <span className="w-0.5 h-2 bg-emerald-400 animate-pulse"></span>
                  </span>
                  <span>Audio Live</span>
                </div>
              </div>
            </div>

            {activeTab === 'whiteboard' ? (
              <div className="text-center font-mono relative z-0 pt-4">
                {/* Main Color-Coded Derived Formula */}
                <div className="inline-block p-3 sm:p-4 rounded-2xl bg-slate-900/85 border border-indigo-500/40 backdrop-blur-md shadow-2xl">
                  <div className="text-xl sm:text-3xl font-extrabold text-white tracking-wider flex items-center justify-center flex-wrap gap-2">
                    <span className="text-indigo-400 text-3xl font-serif">∫</span>
                    <span className="text-cyan-300 font-bold bg-cyan-500/15 px-2 py-0.5 rounded-lg border border-cyan-500/40 shadow-sm">u</span>
                    <span className="text-indigo-300 font-bold bg-indigo-500/15 px-2 py-0.5 rounded-lg border border-indigo-500/40 shadow-sm">dv</span>
                    <span className="text-slate-400 font-sans">=</span>
                    <span className="text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/40 shadow-sm">uv</span>
                    <span className="text-slate-400 font-sans">-</span>
                    <span className="text-indigo-400 text-3xl font-serif">∫</span>
                    <span className="text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/40 shadow-sm">v</span>
                    <span className="text-cyan-300 font-bold bg-cyan-500/15 px-2 py-0.5 rounded-lg border border-cyan-500/40 shadow-sm">du</span>
                  </div>
                </div>

                {/* Subtitle formula breakdown steps */}
                <div className="mt-4 max-w-md mx-auto space-y-2 text-left bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-cyan-400 font-semibold">1. Choose u:</span>
                    <span className="text-slate-400 font-sans">Apply <strong className="text-amber-300">ILATE</strong> (Inverse, Log, Alg, Trig, Exp)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-emerald-400 font-semibold">2. Differentiate u:</span>
                    <span className="text-slate-400 font-mono">du = u'(x) dx</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-amber-400 font-semibold">3. Integrate dv:</span>
                    <span className="text-slate-400 font-mono">v = ∫ dv = v(x)</span>
                  </div>
                </div>

                {/* Animated Laser Pointer */}
                {activeTool === 'laser' && (
                  <div className="absolute -bottom-1 left-1/4 flex items-center gap-1.5 pointer-events-none animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e]"></span>
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-800/80 shadow-md">
                      Rahul is pointing here
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Graph View Tab */
              <div className="py-2 flex flex-col items-center">
                <svg className="w-full max-w-sm h-40" viewBox="0 0 320 160">
                  {/* Grid Lines */}
                  <line x1="20" y1="140" x2="300" y2="140" stroke="#334155" strokeWidth="1.5" />
                  <line x1="40" y1="10" x2="40" y2="150" stroke="#334155" strokeWidth="1.5" />
                  
                  {/* Shaded Area Under Curve */}
                  <path
                    d="M 60 140 Q 130 30 200 80 L 200 140 Z"
                    fill="url(#indigoGradPreview)"
                    opacity="0.35"
                  />
                  
                  {/* Curve y = f(x) */}
                  <path
                    d="M 40 140 Q 130 20 280 110"
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Laser point on curve */}
                  <circle cx="140" cy="50" r="5" fill="#EF4444" className="animate-pulse" />
                  <circle cx="140" cy="50" r="10" fill="none" stroke="#EF4444" opacity="0.6" />
                  
                  {/* Labels */}
                  <text x="290" y="135" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">x</text>
                  <text x="25" y="20" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">y</text>
                  <text x="145" y="45" fill="#F87171" fontSize="10" fontFamily="monospace">P(x, y)</text>
                  <text x="100" y="115" fill="#A5B4FC" fontSize="11" fontWeight="bold" fontFamily="monospace">Area = ∫ f(x)dx</text>

                  <defs>
                    <linearGradient id="indigoGradPreview" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-[11px] text-slate-400 mt-1 font-mono">Geometric proof: Area under curve between limits [a, b]</span>
              </div>
            )}

          </div>

          {/* Bottom Interactive Controls */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 text-[11px]">
                Active student: <strong className="text-white font-medium">Kavya M. (CBSE 12)</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Interactive Hand Raise Button */}
              <button
                type="button"
                onClick={() => setHandRaised(!handRaised)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  handRaised
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/60 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <span></span>
                <span>{handRaised ? 'Hand Raised (#1 in line)' : 'Raise Hand'}</span>
              </button>

              {/* Interactive Mic Toggle */}
              <button
                type="button"
                onClick={() => setMicActive(!micActive)}
                className={`p-1.5 rounded-xl border text-xs transition-all ${
                  micActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title={micActive ? 'Mic Active' : 'Mic Muted'}
              >
                <Icon name={micActive ? 'mic' : 'mic-off'} className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Right: Interactive Real-Time Classroom Chat (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/70 p-4 sm:p-5 flex flex-col justify-between text-xs">
          
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">Live Classroom Chat</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                 Active
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Auto-moderated</span>
          </div>

          {/* Chat Messages Stream */}
          <div className="space-y-2.5 flex-1 mb-3 overflow-y-auto max-h-[220px] pr-1">
            {messages.map((m) => {
              const isMe = m.role === 'student' && m.sender === 'You';
              const isMentor = m.role === 'mentor';
              return (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-2xl transition-all ${
                    isMentor
                      ? 'bg-gradient-to-r from-indigo-950/80 to-violet-950/80 border border-indigo-500/40 text-indigo-50 shadow-sm'
                      : isMe
                      ? 'bg-indigo-600 text-white ml-4 shadow-sm'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-bold flex items-center gap-1">
                      {isMentor && <span></span>}
                      {m.sender}
                    </span>
                    <span className={isMe ? 'text-indigo-200' : 'text-slate-400'}>{m.time}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{m.text}</p>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1 text-[11px]">
            <button
              type="button"
              onClick={() => handleSend("Can you review the ILATE rule again?")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
            >
               ILATE Rule?
            </button>
            <button
              type="button"
              onClick={() => handleSend("What about definite integral limits?")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
            >
               Definite Limits?
            </button>
            <button
              type="button"
              onClick={() => handleSend("That makes complete sense, thanks sir!")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
            >
               Crystal clear!
            </button>
          </div>

          {/* Interactive Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask Rahul a doubt in real-time..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900/90 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center"
              title="Send doubt"
            >
              <Icon name="send" className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}

// =========================================================================
// AI HELPER CHATBOT WIDGET (Bottom Right Corner)
// =========================================================================
function LunexaAIChatbot({ onNavigate, onOpenAuth }) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('lunexa_gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi! I'm Lunexa AI, your 24/7 intelligent learning assistant! Ask me any subject question (Math, Physics, Chemistry, Biology, CS, JEE/NEET), math problems, or Lunexa platform features!",
      time: 'Just now'
    }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSaveApiKey = (key) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('lunexa_gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('lunexa_gemini_api_key');
    }
    setShowKeyInput(false);
  };

  const evaluateMathQuery = (query) => {
    const lower = query.toLowerCase().trim();

    // Exponent check: whats 2^4, 2^4, 5^3, 2**4
    const powMatch = lower.match(/(?:whats|what is|calc|calculate|solve)?\s*(\d+(?:\.\d+)?)\s*(?:\^|\*\*)\s*(\d+(?:\.\d+)?)/i);
    if (powMatch) {
      const base = parseFloat(powMatch[1]);
      const exp = parseFloat(powMatch[2]);
      const res = Math.pow(base, exp);
      return `🔢 **${base}^${exp} = ${res}**`;
    }

    // Square root check: sqrt(144), square root of 16
    const sqrtMatch = lower.match(/(?:square root of|sqrt)\s*(\d+(?:\.\d+)?)/i);
    if (sqrtMatch) {
      const num = parseFloat(sqrtMatch[1]);
      return `🔢 **√${num} = ${Math.sqrt(num)}**`;
    }

    // Basic arithmetic: 5 * 8, 12 + 15, 100 / 4, 50 - 12
    const arithMatch = lower.match(/(?:whats|what is|calc|calculate|solve)?\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/i);
    if (arithMatch) {
      const n1 = parseFloat(arithMatch[1]);
      const op = arithMatch[2];
      const n2 = parseFloat(arithMatch[3]);
      let res;
      if (op === '+') res = n1 + n2;
      if (op === '-') res = n1 - n2;
      if (op === '*') res = n1 * n2;
      if (op === '/') res = n2 !== 0 ? n1 / n2 : 'Undefined (Division by Zero)';
      return `🔢 **${n1} ${op} ${n2} = ${res}**`;
    }

    // Percentage: 20% of 150
    const pctMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)?\s*(\d+(?:\.\d+)?)/i);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const total = parseFloat(pctMatch[2]);
      const res = (pct / 100) * total;
      return `🔢 **${pct}% of ${total} = ${res}**`;
    }

    return null;
  };

  const generateBotReply = async (userQuery) => {
    setIsTyping(true);
    const lower = userQuery.toLowerCase().trim();

    // 1. INSTANT JS MATH & EXPRESSION SOLVER (Direct result in 1ms)
    const mathResult = evaluateMathQuery(userQuery);
    if (mathResult) {
      finishReply(mathResult);
      return;
    }

    // 2. GOOGLE GEMINI 1.5 FLASH AI ENGINE
    const activeKey = apiKey.trim() || GOOGLE_MEET_API_KEY;
    if (activeKey && activeKey.startsWith('AIzaSy')) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are Lunexa AI, an expert 24/7 AI tutor on Lunexa. Give a direct, concise, and accurate answer to the user's question without unnecessary fluff. Question: ${userQuery}`
                }]
              }]
            })
          }
        );

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          const reply = data.candidates[0].content.parts[0].text;
          finishReply(reply);
          return;
        }
      } catch (err) {
        console.warn("Gemini API notice, switching to secondary AI knowledge solver:", err);
      }
    }

    // 3. STEM & PLATFORM KNOWLEDGE SOLVER
    if (lower.includes('quadratic') || lower.includes('x^2') || lower.includes('x²')) {
      finishReply(`📐 **Quadratic Formula:** x = [-b ± √(b² - 4ac)] / 2a\n\nExample for x² - 5x + 6 = 0: a=1, b=-5, c=6 → **x = 3** or **x = 2**`);
      return;
    }

    if (lower.includes('calculus') || lower.includes('derivative') || lower.includes('integration') || lower.includes('d/dx')) {
      finishReply(`∫ **Calculus Rules:**\n• Power Rule: d/dx(xⁿ) = n·xⁿ⁻¹\n• Integral Rule: ∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C\n• Example: d/dx (3x⁴ + 5x²) = 12x³ + 10x`);
      return;
    }

    if (lower.includes('newton') || lower.includes('motion') || lower.includes('force')) {
      finishReply(`⚛ **Newton's Laws of Motion:**\n1. Inertia: Object remains at rest unless forced.\n2. F = m·a (Force = mass × acceleration)\n3. Action-Reaction: Equal and opposite forces.`);
      return;
    }

    if (lower.includes('photosynthesis')) {
      finishReply(`🧬 **Photosynthesis Equation:**\n6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ (Glucose) + 6O₂\nOccurs in plant chloroplasts using chlorophyll.`);
      return;
    }

    if (lower.includes('free') || lower.includes('trial') || lower.includes('schedule')) {
      finishReply("🎁 Every student gets 1 FREE Live Class! Click '🎁 Schedule 1st Class FREE' in the header to select your mentor & topic.");
      return;
    }

    // 4. WIKIPEDIA / DUCKDUCKGO INSTANT KNOWLEDGE RETRIEVAL
    const cleanTerm = userQuery
      .replace(/^(explain|what is|tell me about|how does|define|why is|who is|meaning of|what are|describe|solution for|solve)\s+/i, '')
      .trim();

    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTerm || userQuery)}`);
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (wikiData.extract && wikiData.type !== 'disambiguation' && wikiData.extract.length > 20) {
          finishReply(`📖 **${wikiData.title}:** ${wikiData.extract}`);
          return;
        }
      }
    } catch (e) {
      console.warn("Wikipedia lookup note:", e);
    }

    try {
      const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(userQuery)}&format=json&no_html=1`);
      if (ddgRes.ok) {
        const ddgData = await ddgRes.json();
        if (ddgData.AbstractText) {
          finishReply(`🔍 **${ddgData.Heading || cleanTerm}:** ${ddgData.AbstractText}`);
          return;
        }
      }
    } catch (e) {
      console.warn("DuckDuckGo lookup note:", e);
    }

    // 5. CLEAN SHORT DIRECT FALLBACK (NO VERBOSE MARKETING DISCLAIMERS)
    finishReply(`💡 **${userQuery}:**\n\nI'm Lunexa AI! For deep 1-on-1 derivations and subject doubts, schedule a live Google Meet class with our verified IIT/AIIMS mentors!`);
  };

  const finishReply = (text) => {
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), sender: 'bot', text: text, time: 'Just now' }
      ]);
      setIsTyping(false);
    }, 400);
  };

  const handleSend = (textOverride) => {
    const query = (textOverride || inputMsg).trim();
    if (!query) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', text: query, time: 'Just now' }
    ]);
    setInputMsg('');
    generateBotReply(query);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-indigo-400/30 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <span className="text-xs font-bold tracking-wide">Lunexa AI</span>
          <span className="hidden group-hover:inline-block text-[11px] text-indigo-100 font-medium border-l border-indigo-400/40 pl-2">
            Ask doubts 24/7
          </span>
        </button>
      )}

      {isOpen && (
        <div className="w-[350px] sm:w-[390px] h-[540px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-up">
          
          {/* CHAT HEADER */}
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-base font-bold shadow-sm">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-xs">Lunexa AI Assistant</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Gemini 1.5 AI Active • 24/7 Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-indigo-100 transition-colors cursor-pointer text-xs"
                title="API Settings"
              >
                ⚙️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-indigo-100 transition-colors cursor-pointer"
                title="Close Chat"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* OPTIONAL KEY SETTINGS */}
          {showKeyInput && (
            <div className="p-3.5 bg-indigo-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                <span>Custom Gemini API Key</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-normal">Connected (Built-in)</span>
              </div>
              <input
                type="password"
                placeholder="Paste Custom Gemini API Key (AIzaSy...)"
                value={apiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <p className="text-[10px] text-slate-500 leading-tight">
                Leave blank to use Lunexa's built-in Google Gemini 1.5 AI key automatically!
              </p>
            </div>
          )}

          {/* MESSAGES LIST */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs flex-shrink-0 font-bold">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap break-words ${
                      isBot
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 shadow-sm'
                        : 'bg-[#4F46E5] text-white shadow-sm font-medium'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                  🤖
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl text-slate-500 text-xs flex items-center gap-2 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                  <span>Lunexa AI is computing answer...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* SUGGESTED QUICK PROMPT CHIPS */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <button
              type="button"
              onClick={() => handleSend("Explain Newton's 2nd Law F=ma")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-indigo-500 cursor-pointer"
            >
              ⚛ F=ma Physics
            </button>
            <button
              type="button"
              onClick={() => handleSend("Solve x^2 - 5x + 6 = 0")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-indigo-500 cursor-pointer"
            >
              📐 Quadratic Math
            </button>
            <button
              type="button"
              onClick={() => handleSend("What is Photosynthesis?")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-indigo-500 cursor-pointer"
            >
              🧬 Photosynthesis
            </button>
            <button
              type="button"
              onClick={() => handleSend("How to claim 1 free live session?")}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap hover:border-indigo-500 cursor-pointer"
            >
              🎁 Claim Free Class
            </button>
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Lunexa AI any doubt, math problem..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm"
              title="Send Message"
            >
              <Icon name="send" className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

// =========================================================================
// Lunexa LANDING PAGE (Hero, Live Session Demo, Feature Grid, Leaderboard)
// =========================================================================
function LunexaLandingPage({ onFindMentor, onRegisterMentor, onOpenPricing, onOpenLiveRoom, mentors, batches, onSelectMentor }) {
  const [activeFaq, setActiveFaq] = React.useState(null);

  const stats = [
    { value: `${MENTORS.length}`, label: 'Verified demo mentors' },
    { value: `${BATCHES.length}`, label: 'Live batch courses' },
    { value: 'Free', label: 'First session' },
    { value: 'IIT · NIT · AIIMS', label: 'Mentor colleges' },
  ];

  const features = [
    { icon: 'video', title: 'Live 1:1 Sessions', desc: 'Real-time interactive sessions with an IIT/NIT/AIIMS ranker who cleared your exact exam. Ask anything, get it solved instantly.', color: '#4F46E5', bg: '#EEF2FF' },
    { icon: 'users', title: 'Small Group Batches', desc: 'Affordable batch courses with max 20 students. Structured syllabus, recorded sessions, weekly doubt classes.', color: '#0EA5E9', bg: '#E0F2FE' },
    { icon: 'zap', title: 'Instant Doubt Solving', desc: 'Post a doubt and get matched to an available mentor in under 60 seconds. No scheduling needed.', color: '#10B981', bg: '#D1FAE5' },
    { icon: 'shield', title: 'Verified Mentors Only', desc: 'Every mentor is manually verified with college ID and entrance rank proof. Zero fake profiles.', color: '#F59E0B', bg: '#FEF3C7' },
    { icon: 'trending-up', title: 'Track Your Progress', desc: 'Personalised progress dashboard, session history, topic-wise coverage — all in one place.', color: '#8B5CF6', bg: '#EDE9FE' },
    { icon: 'award', title: 'Pay What You Learn', desc: 'Transparent token pricing. Pay per session directly to your mentor. No hidden subscriptions.', color: '#EC4899', bg: '#FCE7F3' },
  ];

  const steps = [
    { num: '01', title: 'Create Your Profile', desc: 'Sign up in 30 seconds with Google. Tell us your class, board, and target exam.' },
    { num: '02', title: 'Find Your Mentor', desc: 'Browse verified mentors filtered by subject, rank, college, price, and availability.' },
    { num: '03', title: 'Book a Free Session', desc: 'Every new student gets 1 complimentary live session — no payment required.' },
    { num: '04', title: 'Learn & Grow', desc: 'Join live classes, solve doubts, track progress, and crack your exams.' },
  ];

  const subjects = [
    { label: 'Mathematics', sub: 'Calculus, Algebra, Geometry', color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Physics', sub: 'Mechanics, Optics, Modern Physics', color: '#0EA5E9', bg: '#E0F2FE' },
    { label: 'Chemistry', sub: 'Organic, Inorganic, Physical', color: '#10B981', bg: '#D1FAE5' },
    { label: 'Biology', sub: 'Botany, Zoology, Genetics', color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Computer Science', sub: 'DSA, OOP, Web Dev', color: '#8B5CF6', bg: '#EDE9FE' },
    { label: 'English', sub: 'Grammar, Writing, Literature', color: '#EC4899', bg: '#FCE7F3' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', grade: 'Class 12 CBSE — JEE Aspirant', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=80', quote: 'I cleared JEE Advanced with AIR 312 after 6 months of mentoring from Rahul bhaiya from IIT Bombay. Lunexa made it affordable and actually fun.', rating: 5 },
    { name: 'Arjun Mehta', grade: 'NEET UG Aspirant — 680/720 Score', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80', quote: 'Biology was my weakest subject. My AIIMS mentor rebuilt my concepts from scratch in just 3 weeks. The live whiteboard sessions are incredibly clear.', rating: 5 },
    { name: 'Sneha Patel', grade: 'Class 11 — Boards + JEE Prep', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=80', quote: 'The batch classes are incredibly affordable — ₹250 per session and I get a proper structured course. Way better than coaching centres.', rating: 5 },
  ];

  const faqs = [
    { q: 'Who are the mentors on Lunexa?', a: 'All mentors are currently enrolled college students from IITs, NITs, BITS Pilani, AIIMS, and other top institutions. Every mentor is verified with college ID and entrance exam rank proof.' },
    { q: 'How much does a session cost?', a: 'Sessions range from ₹150 to ₹400 per hour, set directly by mentors. Volunteer mentors teach for free. New students get 1 complimentary session.' },
    { q: 'Can I try before paying?', a: 'Yes! Every new student receives 1 Complimentary Free Live Session upon signing up. No credit card required.' },
    { q: 'What subjects are covered?', a: 'We cover JEE Physics, Chemistry, Maths, NEET Biology, Class 11-12 CBSE/ISC boards, Computer Science, English, and more.' },
    { q: 'How do I become a mentor?', a: 'Click "Register as College Mentor", fill out your profile, upload your college ID and entrance rank proof. Verification takes 24-48 hours.' },
  ];

  return (
    <div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950 pt-16 pb-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-700/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-80 h-80 bg-violet-300/20 dark:bg-violet-700/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-300/15 dark:bg-emerald-700/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Peer-to-peer learning for JEE, NEET & Boards
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Learn from students who{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-500 bg-clip-text text-transparent">just cracked</span>{" "}
                your exam.
              </h1>
              <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect with verified IIT, NIT, BITS and AIIMS students for live 1:1 sessions, batch classes, and instant doubt solving — at a fraction of coaching centre prices.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button onClick={onFindMentor} className="px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2">
                  Find a Mentor Now
                  <Icon name="arrow-right" className="w-4 h-4" />
                </button>
                <button onClick={onRegisterMentor} className="px-7 py-3.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 shadow-sm transition-all">
                  Become a Mentor and Earn
                </button>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 justify-center lg:justify-start text-xs text-slate-500 dark:text-slate-400">
                {['No subscription lock-in', '1 Free session for new students', 'College-ID verified mentors'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 max-w-md w-full">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">L</div>
                    <div>
                      <div className="text-white font-bold text-xs">Lunexa Live Session</div>
                      <div className="text-indigo-200 text-[10px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        5 mentors available now
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/30 text-rose-200 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                    LIVE
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {(mentors || []).slice(0, 3).map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer" onClick={() => onSelectMentor && onSelectMentor(m)}>
                      <div className="relative flex-shrink-0">
                        <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-xl object-cover" />
                        {m.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-800"></span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white text-xs truncate">{m.name}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-[10px]">{m.college} — {m.subjects[0]}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-amber-500 text-[10px] font-semibold">{m.rating} stars</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={onFindMentor} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md">
                    Browse all mentors
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-indigo-600 dark:bg-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</div>
              <div className="text-indigo-200 text-xs font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold mb-4 border border-slate-200 dark:border-slate-700">All Major Subjects</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">We cover everything you study</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm max-w-xl mx-auto">From JEE to NEET to CBSE Boards — find expert peer mentors for every subject and exam.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {subjects.map(s => (
              <button key={s.label} onClick={onFindMentor} className="group p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all text-center">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center font-extrabold text-base" style={{ background: s.bg, color: s.color }}>{s.label[0]}</div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">{s.label}</div>
                <div className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 leading-tight">{s.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4 border border-indigo-100 dark:border-indigo-800">Platform Features</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Everything you need to learn smarter</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm max-w-xl mx-auto">High-friction coaching replaced with fast, affordable, peer-to-peer learning.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                  <Icon name={f.icon} className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 border border-emerald-100 dark:border-emerald-800">How It Works</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Start learning in 4 simple steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-lg shadow-indigo-600/30">{s.num}</div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{s.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={onFindMentor} className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all inline-flex items-center gap-2">
              Get Started Free
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-4 border border-amber-100 dark:border-amber-800">Student Stories</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Stories from students like you</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{t.name}</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px]">{t.grade}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-4 border border-violet-100 dark:border-violet-800">FAQ</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Questions? We have answers.</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                  <span className="font-semibold text-slate-900 dark:text-white text-sm pr-4">{faq.q}</span>
                  <Icon name={activeFaq === i ? "chevron-up" : "chevron-down"} className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 pt-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-800/30 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">Your dream exam score starts here.</h2>
          <p className="mt-4 text-indigo-200 text-base max-w-xl mx-auto leading-relaxed">Learn from IIT, NIT, BITS and AIIMS students on Lunexa. Your first session is on us.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onFindMentor} className="px-8 py-4 rounded-xl font-bold text-sm text-indigo-700 bg-white hover:bg-indigo-50 shadow-xl transition-all inline-flex items-center justify-center gap-2">
              Find Your Mentor — It's Free
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
            <button onClick={onRegisterMentor} className="px-8 py-4 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all inline-flex items-center justify-center gap-2">
              Become a Mentor — Earn Money
            </button>
          </div>
          <p className="mt-6 text-indigo-200/70 text-xs">No credit card required. Sign up with Google in 30 seconds.</p>
        </div>
      </section>

    </div>
  );
}

const SUBJECT_DOODLES = {
  All: {
    color: '#4F46E5', lightBg: '#EEF2FF', emoji: '∑',
    label: 'All Subjects',
    doodle: (
      <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.07 }}>
        <text x="30" y="80" fontSize="48" fontFamily="serif" fill="#4F46E5">∑</text>
        <text x="160" y="120" fontSize="32" fontFamily="monospace" fill="#10B981">DNA</text>
        <text x="450" y="100" fontSize="36" fontFamily="monospace" fill="#4F46E5">01101</text>
        <circle cx="100" cy="200" r="40" stroke="#4F46E5" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx="400" cy="300" r="60" stroke="#10B981" strokeWidth="2" strokeDasharray="8 4" />
        <circle cx="700" cy="250" r="35" stroke="#6366F1" strokeWidth="2" strokeDasharray="5 3" />
        <line x1="50" y1="320" x2="750" y2="320" stroke="#4F46E5" strokeWidth="1" strokeDasharray="10 6" />
      </svg>
    )
  },
  Maths: {
    color: '#4F46E5', lightBg: '#EEF2FF', emoji: 'π',
    label: 'Mathematics',
    doodle: (
      <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.08 }}>
        <text x="20" y="100" fontSize="80" fontFamily="serif" fill="#4F46E5" style={{ fontStyle: 'italic' }}>∫</text>
        <text x="280" y="110" fontSize="72" fontFamily="serif" fill="#6366F1">π</text>
        <text x="400" y="90" fontSize="60" fontFamily="serif" fill="#4F46E5">Σ</text>
        <line x1="0" y1="200" x2="800" y2="200" stroke="#4F46E5" strokeWidth="1" strokeDasharray="8 6" />
        <path d="M0 280 Q100 230 200 280 Q300 330 400 280 Q500 230 600 280 Q700 330 800 280" stroke="#6366F1" strokeWidth="2" fill="none" strokeDasharray="6 4" />
        <text x="30" y="350" fontSize="13" fontFamily="monospace" fill="#6366F1">a² + b² = c²</text>
      </svg>
    )
  },
  Physics: {
    color: '#0EA5E9', lightBg: '#E0F2FE', emoji: '⚛',
    label: 'Physics',
    doodle: (
      <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.08 }}>
        <ellipse cx="150" cy="160" rx="80" ry="30" stroke="#0EA5E9" strokeWidth="2" transform="rotate(-30 150 160)" />
        <ellipse cx="150" cy="160" rx="80" ry="30" stroke="#0EA5E9" strokeWidth="2" transform="rotate(30 150 160)" />
        <circle cx="150" cy="160" r="10" fill="#0EA5E9" />
        <text x="290" y="80" fontSize="28" fontFamily="serif" fill="#0EA5E9">E = mc²</text>
        <path d="M270 160 Q310 120 350 160 Q390 200 430 160 Q470 120 510 160" stroke="#38BDF8" strokeWidth="2.5" fill="none" />
        <text x="20" y="340" fontSize="13" fontFamily="monospace" fill="#38BDF8">v = u + at</text>
      </svg>
    )
  },
  Chemistry: {
    color: '#10B981', lightBg: '#D1FAE5', emoji: '⚗',
    label: 'Chemistry',
    doodle: (
      <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.08 }}>
        <polygon points="120,100 160,78 200,100 200,145 160,167 120,145" stroke="#10B981" strokeWidth="2.5" fill="none" />
        <circle cx="400" cy="120" r="22" stroke="#34D399" strokeWidth="2" fill="none" />
        <text x="392" y="128" fontSize="16" fontFamily="serif" fill="#10B981">O</text>
        <text x="280" y="280" fontSize="14" fontFamily="monospace" fill="#10B981">2H₂ + O₂ → 2H₂O</text>
      </svg>
    )
  },
  Biology: {
    color: '#F59E0B', lightBg: '#FEF3C7', emoji: 'DNA',
    label: 'Biology',
    doodle: (
      <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.08 }}>
        <path d="M60 30 Q90 80 60 130 Q30 180 60 230 Q90 280 60 330" stroke="#F59E0B" strokeWidth="3" fill="none" />
        <path d="M120 30 Q90 80 120 130 Q150 180 120 230 Q90 280 120 330" stroke="#FBBF24" strokeWidth="3" fill="none" />
        <ellipse cx="350" cy="160" rx="110" ry="80" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
        <text x="200" y="330" fontSize="12" fontFamily="monospace" fill="#FBBF24">6CO₂+6H₂O→C₆H₁₂O₆+6O₂</text>
      </svg>
    )
  },
  CS: {
    color: '#8B5CF6', lightBg: '#EDE9FE', emoji: '</>',
    label: 'Coding & CS',
    doodle: (
      <svg width="100%" height="100%" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.09 }}>
        <text x="20" y="60" fontSize="14" fontFamily="monospace" fill="#8B5CF6">{"function solve(n) {"}</text>
        <text x="20" y="82" fontSize="14" fontFamily="monospace" fill="#A78BFA">{"  return n <= 1 ? n : solve(n-1)+solve(n-2);"}</text>
        <text x="20" y="104" fontSize="14" fontFamily="monospace" fill="#8B5CF6">{"}"}</text>
        <text x="560" y="260" fontSize="28" fontFamily="monospace" fill="#8B5CF6">O(log n)</text>
      </svg>
    )
  }
};

function LiveClassesPage({
  mentors,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  modeFilter,
  setModeFilter,
  maxPrice,
  setMaxPrice,
  theme,
  onBookMentor,
  onViewProfile,
  upcomingSessions = [],
  onJoinLive,
  showToast,
  onBrowseBatches
}) {
  const subjectConfig = SUBJECT_DOODLES[selectedCategory] || SUBJECT_DOODLES.All;
  const isDark = theme === 'dark';
  const [doodleKey, setDoodleKey] = useState(0);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setDoodleKey(k => k + 1);
  };

  const handleJoinGoogleMeet = (session) => {
    const meetUrl = session && session.meetUrl 
      ? session.meetUrl 
      : `https://meet.google.com/new`;
    if (showToast) {
      showToast(`Joining Google Meet Room (API Key Connected)...`, "🎥");
    }
    window.open(meetUrl, '_blank');
  };

  const defaultLiveClasses = [
    {
      id: "live-101",
      mentorName: "Ananya Roy",
      college: "IIT Bombay (AIR 142)",
      topic: "Rotational Dynamics & Torque High-Yield Practice",
      subject: "Physics",
      time: "LIVE NOW • Started 10m ago",
      isLive: true,
      meetUrl: "https://meet.google.com/new",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
    },
    {
      id: "live-102",
      mentorName: "Devansh Patel",
      college: "NIT Trichy",
      topic: "Organic Reaction Mechanisms for JEE & NEET",
      subject: "Chemistry",
      time: "Today • 4:00 PM IST",
      isLive: false,
      meetUrl: "https://meet.google.com/new",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
    },
    {
      id: "live-103",
      mentorName: "Rohan Verma",
      college: "BITS Pilani",
      topic: "Integration & Calculus Problem Solving Sprint",
      subject: "Maths",
      time: "Tomorrow • 6:00 PM IST",
      isLive: false,
      meetUrl: "https://meet.google.com/new",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    }
  ];

  const activeClassesList = upcomingSessions.length > 0 
    ? upcomingSessions.map((s, idx) => ({
        id: s.id || `session-${idx}`,
        mentorName: s.mentorName || "Verified Mentor",
        college: s.college || "IIT / NIT College Mentor",
        topic: s.topic || "1:1 Live Doubt Solving Class",
        subject: s.subject || "General",
        time: s.time || "Scheduled Class",
        isLive: true,
        meetUrl: "https://meet.google.com/new",
        avatar: s.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
      }))
    : defaultLiveClasses;

  const subjects = [
    { id: 'All', emoji: '∑', label: 'All Subjects' },
    { id: 'Maths', emoji: 'π', label: 'Maths', color: '#4F46E5', bg: '#EEF2FF' },
    { id: 'Physics', emoji: '⚛', label: 'Physics', color: '#0EA5E9', bg: '#E0F2FE' },
    { id: 'Chemistry', emoji: '⚗', label: 'Chemistry', color: '#10B981', bg: '#D1FAE5' },
    { id: 'Biology', emoji: '🧬', label: 'Biology', color: '#F59E0B', bg: '#FEF3C7' },
    { id: 'CS', emoji: '</>', label: 'CS / Code', color: '#8B5CF6', bg: '#EDE9FE' },
  ];

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>

      {/* Background Layer */}
      <div
        key={doodleKey}
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          transition: 'opacity 0.5s ease',
          animation: 'doodleFadeIn 0.6s ease forwards'
        }}
      >
        {subjectConfig.doodle}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎥</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Live Interactive Classes & Google Meet Rooms
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Attend scheduled live 1:1 sessions, join Google Meet rooms, and connect with online college mentors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Google Meet
            </span>
          </div>
        </div>

        {/* SECTION 1: ATTEND UPCOMING / ACTIVE LIVE CLASSES */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📚</span> Your Live Classes & Google Meetings
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {activeClassesList.length} Active Class Room{activeClassesList.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeClassesList.map((cls) => (
              <div
                key={cls.id}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                      {cls.subject}
                    </span>
                    {cls.isLive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                        ● LIVE NOW
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        SCHEDULED
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {cls.topic}
                  </h3>

                  <div className="flex items-center gap-3 py-2 border-t border-b border-slate-100 dark:border-slate-800/80 my-3">
                    <img src={cls.avatar} alt={cls.mentorName} className="w-9 h-9 rounded-full object-cover border border-indigo-200 dark:border-indigo-900" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{cls.mentorName}</div>
                      <div className="text-[10px] text-slate-400">{cls.college}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 flex items-center gap-1.5">
                    <Icon name="calendar" className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{cls.time}</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleJoinGoogleMeet(cls)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>🎥</span> Attend on Google Meet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: BROWSE & BOOK LIVE TUTORS */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <span>🎯</span> Book Live Tutors & Doubt Sessions
          </h2>

          {/* Subject Pill Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {subjects.map(s => {
              const isActive = selectedCategory === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleCategoryChange(s.id)}
                  style={{
                    background: isActive ? (s.color || '#4F46E5') : (isDark ? '#0F172A' : 'white'),
                    color: isActive ? 'white' : (s.color || '#64748b'),
                    border: `2px solid ${isActive ? (s.color || '#4F46E5') : (isDark ? '#334155' : '#e2e8f0')}`,
                    borderRadius: 99,
                    padding: '6px 16px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? `0 4px 14px ${(s.color || '#4F46E5')}40` : '0 1px 3px rgba(0,0,0,0.06)',
                    transform: isActive ? 'scale(1.06)' : 'scale(1)',
                  }}
                >
                  <span style={{ fontSize: 15 }}>{s.emoji}</span>
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Filter Bar */}
          <div
            className="rounded-2xl p-4 mb-8 space-y-3"
            style={{
              background: isDark ? 'rgba(19,27,46,0.88)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(12px)',
              border: isDark ? '1.5px solid rgba(51,65,85,0.8)' : '1.5px solid rgba(226,232,240,0.8)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-6 relative">
                <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search live tutor by name, college, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 dark:text-slate-100 text-slate-800 focus:outline-none focus:ring-2"
                />
              </div>

              <div className="md:col-span-6 flex items-center bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setModeFilter('all')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    modeFilter === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ⊕ All Mentors
                </button>
                <button
                  onClick={() => setModeFilter('1on1')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    modeFilter === '1on1'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  🎥 Live Mentors
                </button>
                <button
                  onClick={() => onBrowseBatches ? onBrowseBatches() : setModeFilter('batches')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    modeFilter === 'batches'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  📚 Cohort Batches
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="text-slate-500 font-medium">Max Hourly Fee:</span>
                <input
                  type="range" min="0" max="500" step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-32 accent-indigo-600"
                />
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {maxPrice === 0 ? 'Free Only' : `₹${maxPrice}/hr`}
                </span>
              </div>
              <span className="text-slate-400">
                <strong className="text-indigo-600 dark:text-indigo-400">{mentors.length}</strong> Live Tutors Available
              </span>
            </div>
          </div>

          {/* Mentor Cards Grid */}
          {mentors.length === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 font-semibold">No live tutors found. Adjust search filters above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map(m => (
                <div
                  key={m.id}
                  style={{
                    background: isDark ? 'rgba(19,27,46,0.92)' : 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(16px)',
                    border: isDark ? '1.5px solid rgba(51,65,85,0.8)' : '1.5px solid rgba(226,232,240,0.7)',
                    borderRadius: 24,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover:-translate-y-1 hover:shadow-xl"
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 64, height: 64, borderRadius: 18, padding: 2,
                          background: `linear-gradient(135deg,${subjectConfig.color},${subjectConfig.color}80)`,
                          flexShrink: 0
                        }}>
                          <img
                            src={m.avatar}
                            alt={m.name}
                            style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                        <span style={{
                          position: 'absolute', bottom: -2, right: -2,
                          width: 12, height: 12, background: '#10B981',
                          border: '2px solid white', borderRadius: '50%'
                        }}></span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: isDark ? '#F8FAFC' : '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                          <Icon name="shield-check" className="w-3.5 h-3.5 text-blue-500" style={{ flexShrink: 0 }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>{m.college}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4, marginBottom: 4 }}>{m.year}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 700 }}>★ {m.rating}</span>
                          <span style={{ fontSize: 10, color: '#94A3B8' }}>({m.reviewsCount} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {m.subjects.map(s => (
                        <span
                          key={s}
                          style={{
                            fontSize: 10, fontWeight: 700,
                            padding: '2px 8px', borderRadius: 6,
                            background: subjectConfig.lightBg,
                            color: subjectConfig.color
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <p style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#475569', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.bio}</p>
                  </div>

                  <div style={{ paddingTop: 12, borderTop: '1.5px solid #F1F5F9', display: 'flex', alignItems: 'center', justify: 'between' }} className="dark:border-slate-800">
                    <span style={{ fontSize: 13, fontWeight: 800, color: isDark ? '#F8FAFC' : '#1E293B' }}>
                      {formatFee(m.hourlyRate)}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => onViewProfile(m)}
                        style={{
                          padding: '6px 12px', fontSize: 11, fontWeight: 600,
                          color: '#64748B', background: isDark ? '#1E293B' : '#F8FAFC',
                          border: '1.5px solid #E2E8F0', borderRadius: 10,
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                        className="dark:border-slate-700 dark:text-slate-300"
                      >Profile</button>
                      <button
                        onClick={() => onBookMentor(m)}
                        style={{
                          padding: '6px 14px', fontSize: 11, fontWeight: 700,
                          color: 'white',
                          background: `linear-gradient(135deg,${subjectConfig.color},${subjectConfig.color}cc)`,
                          border: 'none', borderRadius: 10,
                          cursor: 'pointer',
                          boxShadow: `0 3px 10px ${subjectConfig.color}40`,
                          transition: 'all 0.15s'
                        }}
                      >Book Live Class</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}



// =========================================================================
// BATCH CLASSES PAGE
function BatchClassesPage({ batches = [], enrolledIds = [], onEnrollBatch, onScheduleFreeClass, onJoinMeet }) {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'All', label: 'All Batches', count: batches.length },
    { id: 'Class 5-8', label: 'Class 5–8', cap: 'Max 40 Seats' },
    { id: 'Class 9-10', label: 'Class 9–10', cap: 'Max 70 Seats' },
    { id: 'Class 11-12', label: 'Class 11–12', cap: 'Max 70 Seats' },
    { id: 'JEE/NEET', label: 'JEE / NEET', cap: 'Max 100 Seats' }
  ];

  const filteredBatches = batches.filter(b => {
    const matchesTab = activeTab === 'All' || b.classLevel === activeTab;
    const matchesSearch = !searchTerm || 
      (b.title && b.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.category && b.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.instructor && b.instructor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.tags && b.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HERO BANNER & HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl border border-indigo-500/20">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Icon name="sparkles" className="w-4 h-4 text-amber-400" />
              <span>Limited Seat Live Cohorts • Google Meet Powered</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Structured College-Led <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">Live Batches</span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Join small, high-attention live cohorts capped strictly between 10 to 50 students per class. 
              Taught by verified IIT Delhi, IIT Bombay & AIIMS toppers exclusively via Google Meet.
            </p>

            {/* TRUST BADGES ROW */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="text-emerald-400 font-bold">✓</span> 1st Live Class FREE Trial
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="text-amber-400">⚡</span> Strictly Capped Batch Capacity
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="text-sky-400">🎥</span> Google Meet Live Video & Q&A
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="text-indigo-300">📚</span> Recorded Replays & Notes
              </div>
            </div>
          </div>
        </div>

        {/* COHORT CAPACITY SUMMARY NOTICE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] flex items-center justify-center font-bold">
              <Icon name="users" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Batch Strength Allocations</h3>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                Strict limits enforced for individual mentor attention & active doubt clearing:
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto text-xs font-bold">
            <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-[#4F46E5]">Class 5–8</div>
              <div className="text-[10px] text-slate-500">40 Seats Total</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-[#4F46E5]">Class 9–10</div>
              <div className="text-[10px] text-slate-500">70 Seats Total</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-[#4F46E5]">Class 11–12</div>
              <div className="text-[10px] text-slate-500">70 Seats Total</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
              <div className="text-[#4F46E5]">JEE / NEET</div>
              <div className="text-[10px] text-slate-500">100 Seats Total</div>
            </div>
          </div>
        </div>

        {/* FILTER TABS & SEARCH BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* TAB BUTTONS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {tabs.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                    active
                      ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.cap && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {tab.cap}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SEARCH BOX */}
          <div className="relative min-w-[240px]">
            <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search batches, subjects, tutors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
        </div>

        {/* BATCH GRID CARDS */}
        {filteredBatches.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] rounded-full mx-auto flex items-center justify-center mb-3">
              <Icon name="book-open" className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No batches found</h3>
            <p className="text-xs text-slate-500 mt-1">Try selecting another filter or clearing your search keywords.</p>
            <button
              onClick={() => { setActiveTab('All'); setSearchTerm(''); }}
              className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredBatches.map(b => {
              const isEnrolled = enrolledIds.includes(b.id);
              const fillPercentage = Math.round((b.seatsFilled / b.seatsTotal) * 100);
              const seatsRemaining = b.seatsTotal - b.seatsFilled;

              return (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* CARD HEADER TAGS */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                          {b.classLevel}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {b.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          ⭐ {b.rating} <span className="text-[10px] text-slate-400 font-normal">({b.reviewsCount || 100})</span>
                        </span>
                      </div>
                    </div>

                    {/* TITLE */}
                    <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white group-hover:text-[#4F46E5] transition-colors leading-snug">
                      {b.title}
                    </h3>

                    {/* INSTRUCTOR CARD */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <img
                        src={b.instructorAvatar}
                        alt={b.instructor}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/20"
                      />
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{b.instructor}</span>
                          <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center font-bold">✓</span>
                        </div>
                        <div className="text-[11px] font-bold text-[#4F46E5] dark:text-indigo-300">
                          {b.instructorRole || "IIT / AIIMS Top Ranker"}
                        </div>
                      </div>
                    </div>

                    {/* SCHEDULE & PLATFORM */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Schedule</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{b.schedule}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Live Classroom</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span>🎥</span> Google Meet
                        </div>
                      </div>
                    </div>

                    {/* SEAT CAPACITY PROGRESS BAR */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Icon name="users" className="w-3.5 h-3.5 text-indigo-500" />
                          Seats Filled: <span className="font-extrabold text-slate-900 dark:text-white">{b.seatsFilled}</span> / {b.seatsTotal}
                        </span>
                        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                          seatsRemaining <= 3
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          🔥 Only {seatsRemaining} seats left!
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            fillPercentage > 85 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* KEY FEATURES LIST */}
                    {b.features && (
                      <div className="space-y-1.5 pt-2">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Batch Highlights</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {b.features.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="text-emerald-500 font-bold text-xs">✓</span>
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PRICE & FOOTER ACTIONS */}
                  <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{b.billing || 'Yearly Subscription'}</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">₹{b.price ? b.price.toLocaleString('en-IN') : b.price}</span>
                          {b.originalPrice && (
                            <span className="text-xs line-through text-slate-400 font-bold">₹{b.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                          {b.discount && (
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              {b.discount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                          🎁 1st Class FREE
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => onEnrollBatch && onEnrollBatch(b)}
                        disabled={isEnrolled}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                          isEnrolled
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-500/20'
                        }`}
                      >
                        {isEnrolled ? (
                          <><span>✓</span> Enrolled</>
                        ) : (
                          <><span>⚡</span> Enroll Now</>
                        )}
                      </button>

                      <button
                        onClick={() => onJoinMeet && onJoinMeet(b)}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1"
                      >
                        <span>🎥</span> Meet Class
                      </button>

                      <button
                        onClick={() => onScheduleFreeClass && onScheduleFreeClass()}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all flex items-center justify-center gap-1 border border-amber-200 dark:border-amber-800"
                      >
                        <span>🎁</span> Try Free Class
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* WHY LUNEXA SMALL BATCHES SECTION */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Why Lunexa Small-Cohort Batches Win
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Unlike traditional ed-tech platforms with 5,000+ students per webinar, Lunexa keeps cohorts small & intimate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] flex items-center justify-center font-bold text-lg">
                👥
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Max 10-50 Students</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Guaranteed active mic & chat participation. No student is left invisible or ignored in the back row.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-lg">
                🎓
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">IIT & AIIMS Mentors</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Learn directly from rankers who cleared JEE Advanced & NEET UG with top national ranks.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center font-bold text-lg">
                🎥
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Strictly Google Meet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seamless browser-native Google Meet rooms with screen sharing, hand-raising, and crystal clear HD audio.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-lg">
                🎁
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">1st Live Class FREE</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Experience the teaching style and interactive Google Meet environment before committing to subscription.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// =========================================================================
// HOW IT WORKS PAGE
// =========================================================================
function HowItWorksSection({ onGetStarted }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">How Lunexa Works</h1>
        <p className="text-sm text-slate-500 mt-2">Institutional verification meets instant 1:1 peer mentorship.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-[#4F46E5] text-white font-bold mx-auto mb-3 flex items-center justify-center">1</div>
          <h3 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">Post Doubt or Search</h3>
          <p className="text-xs text-slate-500">Pick your topic or chapter. Connect with verified college mentors who cleared that exact exam.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold mx-auto mb-3 flex items-center justify-center">2</div>
          <h3 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">Interactive Whiteboard</h3>
          <p className="text-xs text-slate-500">Hop on a shared whiteboard room with WebRTC audio/video and real-time step derivations.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-bold mx-auto mb-3 flex items-center justify-center">3</div>
          <h3 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">Release Tokens & Rate</h3>
          <p className="text-xs text-slate-500">Mentors earn honorarium and volunteer certificates. Students build concept confidence.</p>
        </div>
      </div>

      <button onClick={onGetStarted} className="px-6 py-3 rounded-xl font-semibold text-xs text-white bg-[#4F46E5] hover:bg-[#4338CA]">
        Start Exploring Tutors
      </button>
    </div>
  );
}

// =========================================================================
// DUAL DASHBOARD VIEW
// =========================================================================
function DualDashboardView({
  role,
  currentUser,
  studentCoins,
  setStudentCoins,
  upcomingSessions = [],
  enrolledBatches = [],
  pendingRequests = [],
  onFindMentor,
  onBrowseBatches,
  onGetTokens,
  onAcceptRequest,
  onDeclineRequest,
  onJoinLive,
  onScheduleFreeClass
}) {
  const userName = currentUser ? (currentUser.name || currentUser.email || 'Student') : 'Learner';
  const userAvatar = currentUser && currentUser.picture
    ? currentUser.picture
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* EXECUTIVE HEADER CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* USER PROFILE INFO */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/10 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[10px]">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Welcome back, {userName}! 👋
                  </h1>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    role === 'student'
                      ? 'bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {role === 'student' ? 'Pro Student Account' : 'Verified IIT/AIIMS Mentor'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span>🎥 Classroom Platform: <strong className="text-emerald-600 dark:text-emerald-400">Google Meet Active</strong></span>
                  <span>•</span>
                  <span>Yearly Live Access Active</span>
                </p>
              </div>
            </div>

            {/* HEADER QUICK ACTIONS */}
            {role === 'student' ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onScheduleFreeClass && onScheduleFreeClass()}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🎁</span> Schedule 1st Class FREE
                </button>
                
                <button
                  onClick={() => onJoinLive && onJoinLive()}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🎥</span> Launch Google Meet Room
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="text-slate-500">Earnings Payout: </span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹4,350 (1,450 XP)</strong>
                </div>
                <button
                  onClick={() => alert("Simulated Payout: ₹4,350 sent directly to your registered UPI ID!")}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
                >
                  Withdraw Payout to UPI
                </button>
              </div>
            )}
          </div>

          {/* METRICS BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Upcoming Calls</div>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {upcomingSessions.length} Scheduled
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Cohorts</div>
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {enrolledBatches.length} Batches
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Classroom Format</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <span>🎥</span> Google Meet
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Learning Tokens</div>
              <div className="text-lg font-black text-amber-500 mt-0.5 flex items-center justify-between">
                <span>{studentCoins || 500} XP</span>
                <button
                  onClick={() => onGetTokens && onGetTokens()}
                  className="text-[10px] font-extrabold text-[#4F46E5] hover:underline"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN DESK CONTENT AREA */}
        {role === 'student' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN (8 COLS) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* UPCOMING GOOGLE MEET LIVE CLASSES */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Upcoming Google Meet Classes
                    </h2>
                    <p className="text-xs text-slate-500">Your scheduled live interactive sessions with college mentors.</p>
                  </div>
                  
                  <button
                    onClick={() => onScheduleFreeClass && onScheduleFreeClass()}
                    className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Book Trial Class</span>
                  </button>
                </div>

                {upcomingSessions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[#4F46E5] mx-auto flex items-center justify-center font-bold text-xl">
                      🎥
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">No upcoming live classes scheduled</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Schedule your first live class for free or browse upcoming cohort batch schedules.
                    </p>
                    <button
                      onClick={() => onScheduleFreeClass && onScheduleFreeClass()}
                      className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold shadow-sm cursor-pointer"
                    >
                      Schedule Free Trial Class
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.map(s => (
                      <div
                        key={s.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-500/30 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">{s.mentorName}</span>
                            {s.college && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-[#4F46E5] dark:text-indigo-300">
                                {s.college}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-[#4F46E5]">{s.topic}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>📅 {s.time}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">🎥 Google Meet</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onJoinLive && onJoinLive(s)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>🎥</span> Join Class on Meet
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MY ENROLLED COHORT BATCHES */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                      My Enrolled Cohort Batches
                    </h2>
                    <p className="text-xs text-slate-500">Live batch courses you have subscribed to.</p>
                  </div>
                  
                  <button
                    onClick={() => onBrowseBatches && onBrowseBatches()}
                    className="text-xs font-bold text-[#4F46E5] hover:underline cursor-pointer"
                  >
                    Browse All Batches →
                  </button>
                </div>

                {enrolledBatches.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[#4F46E5] mx-auto flex items-center justify-center font-bold text-xl">
                      📚
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">No active batch enrollments</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Explore our small-cohort batches (Class 5-8, 9-10, 11-12, JEE/NEET) led by IITians & AIIMS doctors.
                    </p>
                    <button
                      onClick={() => onBrowseBatches && onBrowseBatches()}
                      className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold cursor-pointer"
                    >
                      Explore Live Batches
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {enrolledBatches.map(b => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-[#4F46E5] dark:text-indigo-300">
                            {b.classLevel || b.category}
                          </span>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">{b.title}</h4>
                          <div className="text-[11px] text-slate-500">{b.instructor}</div>
                          <div className="text-[11px] text-slate-400">📅 {b.schedule}</div>
                        </div>

                        <button
                          onClick={() => onJoinLive && onJoinLive(b)}
                          className="w-full py-2 rounded-xl text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>🎥</span> Classroom (Google Meet)
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* STUDY MATERIALS & HANDWRITTEN NOTES */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Handwritten Notes & Practice Sheets
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">📄 JEE Calculus Formula Book</div>
                    <div className="text-[10px] text-slate-400">Handwritten by Aman Gupta (IIT Delhi)</div>
                    <button onClick={() => alert("Downloading JEE Calculus Formula Book PDF...")} className="text-[10px] font-extrabold text-[#4F46E5] hover:underline pt-1 block cursor-pointer">
                      Download PDF ↓
                    </button>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">📄 NEET Organic Mindmaps</div>
                    <div className="text-[10px] text-slate-400">By Dr. Meenakshi (AIIMS Delhi)</div>
                    <button onClick={() => alert("Downloading NEET Organic Mindmaps PDF...")} className="text-[10px] font-extrabold text-[#4F46E5] hover:underline pt-1 block cursor-pointer">
                      Download PDF ↓
                    </button>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">📄 Class 10 Board PYQs</div>
                    <div className="text-[10px] text-slate-400">2015-2025 Solved Papers</div>
                    <button onClick={() => alert("Downloading Class 10 Board PYQs PDF...")} className="text-[10px] font-extrabold text-[#4F46E5] hover:underline pt-1 block cursor-pointer">
                      Download PDF ↓
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* QUICK GOOGLE MEET CLASSROOM CARD */}
              <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-6 text-white shadow-xl space-y-4 border border-indigo-500/20">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-lg">
                  🎥
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Instant Google Meet Classroom</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Join ongoing mentor live calls or schedule your next doubt session. No downloads required.
                  </p>
                </div>
                <button
                  onClick={() => onJoinLive && onJoinLive()}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Join Google Meet Call
                </button>
              </div>

              {/* FIRST CLASS FREE TRIAL WIDGET */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                  <span>✨</span> First Live Class is FREE!
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Try Before Subscribing</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Experience our small-cohort live Google Meet teaching environment with zero commitment.
                </p>
                <button
                  onClick={() => onScheduleFreeClass && onScheduleFreeClass()}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer"
                >
                  🎁 Schedule Free Live Class
                </button>
              </div>

              {/* NEED MENTOR ASSISTANCE */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Need Personal Mentorship?</h3>
                <p className="text-xs text-slate-500">Connect with top IIT & AIIMS mentors for academic guidance.</p>
                <button
                  onClick={() => onFindMentor && onFindMentor()}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Browse Top Mentors →
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* MENTOR COMMAND CENTER */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Pending Student Doubt Requests
                </h2>
                {pendingRequests.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No pending requests right now.</p>
                ) : (
                  pendingRequests.map(r => (
                    <div key={r.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white">{r.studentName} ({r.grade})</div>
                        <div className="text-xs font-semibold text-[#4F46E5]">{r.topic}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">📅 {r.time} • Honorarium Offer: {r.tokenOffer}</div>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                        <button onClick={() => onDeclineRequest(r)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl cursor-pointer">
                          Decline
                        </button>
                        <button onClick={() => onAcceptRequest(r)} className="px-4 py-1.5 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-sm cursor-pointer">
                          Accept Session
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">Mentor Verification</div>
                <div className="text-xs text-slate-500">IIT Bombay • Mechanical Engineering</div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-bold">
                  <span>Hours Mentored:</span>
                  <span className="text-[#4F46E5]">64.5 hrs</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// =========================================================================
// INTERACTIVE LIVE CLASSROOM (`/live-room`) - FULL SCREEN HD VIRTUAL CLASSROOM
// =========================================================================
function LiveClassroomMock({ onExit, mentor, showToast }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState('pen');
  const [color, setColor] = useState('#4F46E5');
  const [lineWidth, setLineWidth] = useState(3);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: mentor ? mentor.name : "Rahul Sharma", text: "Welcome! Let's solve the definite integral problem using by-parts.", time: "14:15", isMentor: true },
    { id: 2, sender: "You (Student)", text: "Sir, does the cyclic integration trick apply for e^x·sin(x)?", time: "14:18", isMentor: false }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderWhiteboard = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // Clean White Canvas
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Crisp Light Grid Pattern
      ctx.strokeStyle = "#F1F5F9";
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < rect.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }
      for (let y = 0; y < rect.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }

      // Title & Formula Container
      const boxW = Math.min(rect.width - 60, 660);
      ctx.fillStyle = "#EEF2FF";
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(40, 24, boxW, 60, 16);
        ctx.fill();
        ctx.strokeStyle = "#C7D2FE";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.fillRect(40, 24, boxW, 60);
      }

      ctx.font = "bold 19px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#4338CA";
      ctx.fillText("∫ u · v dx  =  u · ∫ v dx  -  ∫ ( u' · ∫ v dx ) dx", 60, 60);

      // Worked Example Step by Step
      ctx.font = "600 15px 'Inter', sans-serif";
      ctx.fillStyle = "#0F172A";
      ctx.fillText("Example: Evaluate  I = ∫ x · sin(x) dx", 60, 118);

      ctx.font = "500 14px 'Inter', sans-serif";
      ctx.fillStyle = "#047857";
      ctx.fillText("Step 1: Choose u = x  &  v = sin(x)", 60, 146);

      ctx.fillStyle = "#0369A1";
      ctx.fillText("Step 2: u' = 1  and  ∫ sin(x) dx = -cos(x)", 60, 172);

      ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
      ctx.fillStyle = "#4F46E5";
      ctx.fillText("Result:  I = -x · cos(x) + sin(x) + C   ", 60, 208);
    };

    renderWhiteboard();
    window.addEventListener('resize', renderWhiteboard);
    return () => window.removeEventListener('resize', renderWhiteboard);
  }, []);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const coords = getCanvasCoords(e);
    // ctx.scale(dpr, dpr) is already applied during init, so coords are in CSS-pixel space — do NOT multiply by dpr again
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const coords = getCanvasCoords(e);
    const ctx = canvas.getContext('2d');
    // lineWidth is in CSS pixels — ctx.scale handles the DPR mapping
    ctx.lineWidth = activeTool === 'eraser' ? 28 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = activeTool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // canvas.width/height are physical pixels; divide by dpr to get CSS pixels (which is what the scaled context expects)
    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: "You (Student)",
      text: userMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMentor: false
    }]);
    setChatInput('');

    // Mentor auto response simulator
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: mentor ? mentor.name : "Rahul Sharma",
        text: `Great question! Yes, for cyclic integrals like e^x·sin(x), we apply by-parts twice and group the integral on the LHS. Let me write it on the whiteboard!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMentor: true
      }]);
    }, 1400);
  };

  const activeMentor = mentor || {
    name: "Rahul Sharma",
    college: "IIT Bombay",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden font-sans">
      {/* 1. TOP HEADER BANNER */}
      <div className="h-14 px-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>LIVE REC • 14:22</span>
          </div>
          
          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Calculus Live Doubt Room</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-400 text-[11px] font-semibold border border-indigo-800/60">
              {activeMentor.name} ({activeMentor.college || 'IIT Bombay'})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setIsHandRaised(!isHandRaised); showToast(isHandRaised ? "Hand Lowered" : "Hand Raised to Mentor!", ""); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isHandRaised ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span></span>
            <span className="hidden sm:inline">{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
          </button>

          <button
            onClick={onExit}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all"
          >
            Leave Session
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* WHITEBOARD CANVAS CONTAINER */}
        <div className="flex-1 flex flex-col relative bg-white overflow-hidden">
          
          {/* Floating Whiteboard Control Toolbar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl text-white shadow-2xl border border-slate-700/80">
            <button
              onClick={() => setActiveTool('pen')}
              className={`p-2 rounded-xl transition-all ${activeTool === 'pen' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title="Pen Tool"
            >
              <Icon name="pen-tool" className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTool('eraser')}
              className={`p-2 rounded-xl transition-all ${activeTool === 'eraser' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title="Eraser"
            >
              <Icon name="eraser" className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-800"></div>

            {/* Colors */}
            <div className="flex items-center gap-1.5 px-1">
              {['#4F46E5', '#10B981', '#DC2626', '#0F172A'].map(c => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setActiveTool('pen'); }}
                  className={`w-5 h-5 rounded-full transition-transform ${color === c && activeTool === 'pen' ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="h-4 w-px bg-slate-800"></div>

            <button
              onClick={clearCanvas}
              className="px-2.5 py-1 text-xs text-rose-400 font-bold hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Crisp HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            id="whiteboard-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full block cursor-crosshair"
          />

          {/* FLOATING WEBCAM SPEAKER BAR (Bottom Left Overlay) */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 p-2 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-800 shadow-2xl">
            {/* Mentor Tile */}
            <div className="w-44 h-28 rounded-xl bg-slate-900 border-2 border-indigo-500 overflow-hidden relative shadow-md group">
              <img src={activeMentor.avatar} alt="Mentor" className="w-full h-full object-cover" />
              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-800 text-white font-medium">
                <span className="truncate max-w-[90px]">{activeMentor.name}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Mic
                </span>
              </div>
            </div>

            {/* Student Tile */}
            <div className="w-36 h-28 rounded-xl bg-slate-900 border-2 border-slate-700 overflow-hidden relative shadow-md">
              {isCamOn ? (
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" alt="You" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 bg-slate-900">
                  <Icon name="video-off" className="w-5 h-5 mb-1 text-slate-600" />
                  <span>Cam Off</span>
                </div>
              )}

              {isHandRaised && (
                <span className="absolute top-1.5 right-1.5 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-md animate-bounce">
                   Hand
                </span>
              )}

              <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-800 text-white font-medium">
                <span>You</span>
                <span className={isMicOn ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {isMicOn ? 'On' : 'Muted'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RIGHT SIDEBAR (Live Doubt Chat & Controls) */}
        <div className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 flex flex-col justify-between z-20">
          
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Live Doubt Chat</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-950 text-indigo-400 rounded-full border border-indigo-800/60">
                {messages.length} msgs
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Connected
            </div>
          </div>

          {/* Message History */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs">
            {messages.map(m => (
              <div
                key={m.id}
                className={`p-3 rounded-2xl border transition-all ${
                  m.isMentor
                    ? 'bg-indigo-950/50 border-indigo-800/60 text-indigo-100'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-200'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] mb-1">
                  <span className={`font-bold ${m.isMentor ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {m.isMentor ? ` ${m.sender}` : m.sender}
                  </span>
                  <span className="text-slate-500">{m.time}</span>
                </div>
                <p className="leading-relaxed text-xs">{m.text}</p>
              </div>
            ))}
          </div>

          {/* Quick Reaction Pills */}
          <div className="px-3 py-1.5 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto bg-slate-950/30">
            <button
              onClick={() => handleSend({ preventDefault: () => {}, target: {} }, "Got it! Thanks sir ")}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium whitespace-nowrap"
            >
               Got it!
            </button>
            <button
              onClick={() => handleSend({ preventDefault: () => {}, target: {} }, "Can you explain step 2 again?")}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium whitespace-nowrap"
            >
               Explain Step 2
            </button>
          </div>

          {/* Chat Input & Media Controls */}
          <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setIsMicOn(!isMicOn); showToast(isMicOn ? "Microphone Muted" : "Microphone Unmuted", isMicOn ? "" : ""); }}
                className={`py-1.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  isMicOn ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-rose-950/60 border-rose-800 text-rose-400'
                }`}
              >
                <span>{isMicOn ? ' Mute' : ' Unmute'}</span>
              </button>

              <button
                onClick={() => { setIsCamOn(!isCamOn); showToast(isCamOn ? "Camera Turned Off" : "Camera Turned On", isCamOn ? "" : ""); }}
                className={`py-1.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  isCamOn ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-rose-950/60 border-rose-800 text-rose-400'
                }`}
              >
                <span>{isCamOn ? ' Stop Cam' : ' Start Cam'}</span>
              </button>
            </div>

            <form onSubmit={handleSend} className="flex gap-2 pt-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask doubt in live class..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center justify-center"
              >
                <Icon name="send" className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

// =========================================================================
// BOOKING & PROFILE MODALS
// =========================================================================
function BookingModal({ mentor, onClose, onConfirm }) {
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedSlot, setSelectedSlot] = useState('05:30 PM');
  const [topic, setTopic] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <div className="font-bold text-sm text-slate-900 dark:text-white">Book 1:1 with {mentor.name}</div>
          <button onClick={onClose}><Icon name="x" className="w-4 h-4 text-slate-400" /></button>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Day</label>
          <div className="grid grid-cols-4 gap-1.5">
            {['Today', 'Tomorrow', 'Friday', 'Saturday'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`py-1.5 text-xs font-semibold rounded-xl border ${selectedDate === d ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'border-slate-200 dark:border-slate-800'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Time Slot</label>
          <div className="grid grid-cols-3 gap-1.5">
            {['04:00 PM', '05:30 PM', '07:00 PM'].map(s => (
              <button
                key={s}
                onClick={() => setSelectedSlot(s)}
                className={`py-1.5 text-xs font-semibold rounded-xl border ${selectedSlot === s ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 dark:border-slate-800'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Doubt Topic</label>
          <input
            type="text"
            placeholder="e.g. Integration by parts, Rotational Torque..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold">{mentor.hourlyRate === 0 ? 'Free' : `₹${mentor.hourlyRate}`}</span>
          <button
            onClick={() => onConfirm({ date: selectedDate, time: selectedSlot, topic })}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA]"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

function MentorProfileModal({ mentor, onClose, onBook }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <img src={mentor.avatar} alt={mentor.name} className="w-14 h-14 rounded-2xl object-cover" />
            <div>
              <div className="flex items-center gap-1 font-bold text-sm text-slate-900 dark:text-white">
                <span>{mentor.name}</span>
                <Icon name="shield-check" className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xs text-slate-500">{mentor.college} • {mentor.year}</div>
              <div className="text-xs text-amber-500 font-bold mt-0.5"> {mentor.rating} ({mentor.reviewsCount} reviews)</div>
            </div>
          </div>
          <button onClick={onClose}><Icon name="x" className="w-4 h-4 text-slate-400" /></button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{mentor.bio}</p>

        <div>
          <div className="text-xs font-bold text-slate-400 mb-1.5">Expertise</div>
          <div className="flex flex-wrap gap-1.5">
            {mentor.subjects.map(s => (
              <span key={s} className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-[#4F46E5]">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold">{mentor.hourlyRate === 0 ? 'Free (Volunteer)' : `₹${mentor.hourlyRate}/hr`}</span>
          <button onClick={onBook} className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA]">
            Book 1:1 Live
          </button>
        </div>
      </div>
    </div>
  );
}

// Render React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
