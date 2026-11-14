# Design System & Screen Specifications (DESIGN.md)

> **Design Philosophy**: Minimalist, bright, accessible, and high-trust.  
> Avoid dark, intimidating technical interfaces. Use clean white/slate surfaces, warm friendly cards, clear typography, and unambiguous color signifiers.

---

## 1. Color Palette & Tailwind Tokens

```javascript
// tailwind.config.js snippet
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',    // Bright, clean slate-50 canvas
        surface: '#FFFFFF',       // Pure white cards & dialogs
        surfaceSubtle: '#F1F5F9', // Light slate-100 borders & backgrounds
        
        // Brand Primary (Accessible Royal Indigo)
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
        },

        // Status Colors (Bright, unambiguous signals)
        safe: {
          light: '#ECFDF5',   // Emerald-50
          border: '#A7F3D0',  // Emerald-200
          text: '#047857',    // Emerald-700
          main: '#10B981',    // Emerald-500
        },
        caution: {
          light: '#FFFBEB',   // Amber-50
          border: '#FDE68A',  // Amber-200
          text: '#B45309',    // Amber-700
          main: '#F59E0B',    // Amber-500
        },
        scam: {
          light: '#FEF2F2',   // Rose-50
          border: '#FECACA',  // Rose-200
          text: '#B91C1C',    // Rose-700
          main: '#EF4444',    // Rose-500
        },

        // Text & Neutral Hierarchy
        textPrimary: '#0F172A',   // Slate-900 (High contrast)
        textSecondary: '#475569', // Slate-600
        textMuted: '#94A3B8',     // Slate-400
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'float': '0 12px 32px -4px rgba(79, 70, 229, 0.15)',
      }
    }
  }
}
```

---

## 2. Typography & Vernacular Support

- **Primary Latin & Brand Font**: `Kanchenjunga` ([Google Fonts Specimen](https://fonts.google.com/specimen/Kanchenjunga)) — modern, distinctive, high-legibility sans-serif with excellent numerals and micro-typography.
- **Hindi Font Support**: `Noto Sans Devanagari` (clean, native rendering for Hindi text).
- **Bengali Font Support**: `Noto Sans Bengali` (natural, balanced Bengali glyphs).
- **Monospace (for UPI IDs & Cryptographic Hashes)**: `JetBrains Mono` or `ui-monospace`.

### Typography Scale
- **Header 1 (Screen titles)**: `text-2xl font-bold tracking-tight text-slate-900 font-display`
- **Body / Primary Labels**: `text-base font-medium text-slate-800`
- **Vernacular Body**: `text-base font-normal leading-relaxed text-slate-700`
- **Caption / Meta**: `text-xs text-slate-500 font-mono`

---

## 3. Screen Specifications (Mobile-First 4-Screen Flow)

```
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│ Screen 1: Check       │ → │ Screen 2: Risk Result │ → │ Screen 3: Safe Pay    │   │ Screen 4: Dashboard   │
│ Paste SMS/UPI & Lang  │   │ Green / Amber / Red   │   │ Verified UPI Intent   │   │ Stats & Threat Feed   │
└───────────────────────┘   └───────────────────────┘   └───────────────────────┘   └───────────────────────┘
```

### Screen 1: Check Message (`/`)
- **Top Bar**: Minimal TrustLayer logo + Language toggle pill (`[English] [हिन्दी] [বাংলা]`).
- **Main Input Card**:
  - Clean white surface with subtle rounded shadow.
  - Generous textarea (`min-h-[140px]`) with placeholder: *"Paste suspicious SMS, WhatsApp message, or UPI ID here..."*
  - **Quick Action Row**: "📋 Paste from Clipboard" button + "Clear" button.
  - **Preset Scam Chips** (for 1-tap testing during evaluations):
    - `[⚡ Electricity Disconnection]`
    - `[🎁 ₹25L Lottery Winner]`
    - `[☕ Safe Tea Vendor Pay]`
- **Primary Action**: Full-width high-contrast button: `🔍 Check Security (सुरक्षा जांचें)`.

---

### Screen 2: Risk Result (`/result`)
- **Top Status Banner**:
  - **If Safe (<30)**: Bright emerald badge `✓ Verified Safe / सुरक्षित`.
  - **If Caution (30–69)**: Bright amber badge `⚠️ Proceed With Caution / सावधानी बरतें`.
  - **If Scam (≥70)**: High-visibility rose badge `🚨 High Risk Scam Detected / धोखाधड़ी का खतरा!`.
- **Score Meter**: A large circular or linear progress bar showing `Risk Score: X/100`.
- **Vernacular Explanation Box**:
  - 2–3 plain-language bullet points explaining why the message was scored this way.
  - Example (Hindi): *"यह संदेश दावा करता है कि आपका बिजली बिल लंबित है, लेकिन भुगतान एक व्यक्तिगत UPI पते पर मांगा जा रहा है।"*
- **Action Buttons**:
  - If Safe: Primary button `Continue to Safe Pay →`
  - If Scam: Secondary link `Report this Scam`, with payment button completely disabled.

---

### Screen 3: Safe Pay (`/pay`)
- **Verified Payee Card**:
  - Payee Name & Verified VPA (`ramu.tea@upi`).
  - Green Shield Trust Seal: *"Verified by TrustLayer Heuristics"*.
- **Amount Input**: Clean numeric input box with rupee prefix (`₹ [ 350 ]`).
- **Warning Checklist**:
  - *"Remember: You NEVER need to enter your UPI PIN to receive money."*
- **Launch Pay CTA**: Full-width vibrant button:
  - Deep-links to user's installed UPI app (`upi://pay?pa=...&pn=...&am=...`).

---

### Screen 4: Community Dashboard (`/dashboard`)
- **Impact Stats Counters**:
  - Total Scams Blocked (e.g., `1,420+`)
  - Total Amount Protected (e.g., `₹48.2 Lakhs`)
  - Community Reports (e.g., `890`)
- **Live Scam Trend Feed**:
  - List of active scam patterns in India (Electricity, Lottery, Part-time job, KYC).
- **User Recent Checks History**:
  - List of the user's past 5 checks with date, snippet, and Safe/Scam badge.
