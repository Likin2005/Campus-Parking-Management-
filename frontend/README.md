# CampusPark — Campus Parking Management System (UI/UX + Frontend)

> **College UI/UX Subject Capstone Project & Frontend Demonstration**  
> Built strictly following UI/UX behavioral design principles (Nielsen’s 10 Heuristics, Fitts’s Law, Hick’s Law, Gestalt Psychology, and WCAG 2.2 AA Accessibility standards).

---

## ⚠️ Architecture & Data Persistence (Full-Stack CouchDB Integration)

1. **Persistent Apache CouchDB Backend**: All campus parking zone occupancies, slot vacancies, user profiles, vehicles, and bookings are persistently stored in **Apache CouchDB** (`http://127.0.0.1:5984`) and served through an asynchronous **FastAPI REST API** (`http://127.0.0.1:8000`).
2. **Real Cryptographic Security**: Authentication uses salted **bcrypt password hashing** (`rounds=12`) and signed **JWT access tokens** (`HS256`). Plain-text passwords are never stored in browser storage or CouchDB.
3. **Simulated Sensor Feed**: In keeping with the college capstone guidelines, physical IoT parking barrier sensors and ground induction loops are simulated through deterministic status engines. A visible **"Demo Data"** badge remains displayed wherever live occupancy appears.
4. **Optimistic Concurrency Control (OCC)**: CouchDB revision handling (`_rev`) and distributed locking in `campuspark_locks` prevent race conditions and overlapping double-bookings.

---

## 1. Project Overview & Scope

CampusPark is a responsive, accessible single-page web application engineered to solve college campus congestion. It empowers students, faculty, staff, and guests to monitor parking deck occupancies in real time, filter specialized bays (EV charging, ADA accessible, covered structures), and reserve slots before arriving on campus. Campus facility administrators have a dedicated portal to adjust capacity, toggle bays into maintenance, and resolve safety reports.

### Key Capabilities
- **Role-Based Workflows**: Tailored permits and access rights for Students, Faculty, Staff, Visitors, and Admins.
- **Interactive Deck Slot Map**: Spatial visual layout of campus parking garages with drive aisles and keyboard navigation.
- **Conflict Prevention**: Overlap detection algorithms preventing double-booking of any slot.
- **Dual-Coded Status System**: Every status (Available, Occupied, Reserved, Maintenance, Selected) pairs a distinct color with an unambiguous glyph icon and text label (WCAG 1.4.1 compliance).
- **Offline Digital Parking Pass**: Generates a verifiable booking code, offline SVG QR code, and standard `.ics` calendar download file.
- **User Control & Reversible Actions**: Destructive cancellations trigger an interactive toast notification with an instant **"Undo Cancellation"** action.
- **Living UI/UX Styleguide**: Built-in `/styleguide` route displaying design tokens, typography scales, contrast scores, and component states.

---

## 2. Tech Stack

- **Framework**: React 18 + Vite
- **Routing**: React Router v6 (`react-router-dom`) with `ProtectedRoute` and `RoleRoute` guards
- **Styling**: Tailwind CSS with custom design tokens in `tailwind.config.js`
- **Iconography**: `lucide-react` (uniform 2px stroke width)
- **Typography**: Google Fonts (`Plus Jakarta Sans` for headings, `Inter` for interface copy)
- **State & Persistence**: React Context API (`AuthContext`, `BookingContext`, `ToastContext`, `ThemeContext`) with resilient `localStorage`/`sessionStorage` wrappers.
- **Zero Third-Party UI Kits**: No MUI, Bootstrap, or Ant Design. All components were built from scratch to allow rigorous examination and academic defense.

---

## 3. Demo Credentials (One-Click Autofill Enabled)

The login screen features quick-fill helper cards for rapid evaluation:

| Role | Demo Email | Password | Assigned Vehicle & Pass |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `Student@2026` | Honda Civic (`ABC-1234`), Semester Pass |
| **Faculty** | `faculty@campus.edu` | `Faculty@2026` | Toyota Prius Prime EV (`FAC-9081`), Faculty Pass |
| **Admin** | `admin@campus.edu` | `Admin@2026` | Subaru Outback (`ADM-0001`), Operations Admin |
| **Staff** | `staff@campus.edu` | `Staff@2026` | Ford Focus (`STF-4412`), Staff Regular |
| **Visitor** | `visitor@campus.edu` | `Visitor@2026` | Tesla Model 3 (`VIS-5520`), Daily Guest Pass |

*Note: Guest visitors can also click **"Continue as Visitor (Browse Only)"** on the login page to navigate zones and slots without credentials.*

---

## 4. Execution & Setup Instructions (Windows / VS Code)

### Prerequisites
- Node.js (v18 or higher recommended)
- Windows PowerShell or Command Prompt

### Step-by-Step Terminal Commands
```powershell
# 1. Navigate to the project directory
cd "c:\Users\likin\OneDrive\Desktop\UI-UX\campuspark"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Or build and preview production bundle
npm run build
npm run preview
```
Visit `http://localhost:5173` in your browser.

### Resetting Demo Data
To wipe any changes and return all zones, bookings, and users to their factory seeds:
- Navigate to **Profile & Settings** (`/profile`) and click **"Reset Demo Data"**, or
- Clear site data in Chrome DevTools (`Application > Storage > Clear site data`).

---

## 5. Folder Structure
```
campuspark/
├── index.html                  # HTML shell, Google Fonts, accessible meta
├── package.json                # Dependencies and build scripts
├── vite.config.js              # Vite bundler configuration
├── tailwind.config.js          # Design tokens (colors, font-family, radii)
├── postcss.config.js           # PostCSS Tailwind processor
├── test-flows.cjs              # Automated verification test suite
├── README.md                   # Full documentation & viva submission
└── src/
    ├── main.jsx                # Application entrypoint
    ├── App.jsx                 # Route tree & context providers
    ├── index.css               # Focus visible indicators, reduced-motion, base CSS
    ├── context/
    │   ├── AuthContext.jsx     # User session, login, signup, visitor mode
    │   ├── BookingContext.jsx  # Zones, slots, bookings, conflicts, admin controls
    │   ├── ToastContext.jsx    # Global toast notification stack with Undo
    │   └── ThemeContext.jsx    # Light / dark mode controller
    ├── data/
    │   ├── seedUsers.js        # Deterministic student, faculty, admin accounts
    │   ├── seedZones.js        # 6 campus decks & surface lots (164 slots)
    │   └── seedBookings.js     # Initial upcoming, completed, and cancelled bookings
    ├── utils/
    │   ├── storage.js          # Resilient storage wrapper with memory fallback
    │   ├── validators.js       # Email, password strength, plate, overlap checks
    │   ├── dates.js            # Human-readable date & time formatters
    │   └── ics.js              # RFC 5545 iCalendar (.ics) download generator
    ├── components/
    │   ├── ui/                 # Button, Input, Select, Card, Badge, Modal, Tabs,
    │   │                       # ProgressRing, EmptyState, Skeleton, DemoDataBadge
    │   ├── layout/             # AppShell, Navbar, MobileNav
    │   ├── auth/               # LoginForm, SignupForm, ProtectedRoute, RoleRoute
    │   └── parking/            # ZoneCard, SlotMap, SlotButton, Legend, BookingForm
    └── pages/
        ├── Login.jsx           # Split desktop brand layout, visitor bypass
        ├── Signup.jsx          # Registration with password strength meter
        ├── Dashboard.jsx       # Aggregated circular vacancy meter & zone cards
        ├── FindParking.jsx     # Search, filter chips, interactive slot deck
        ├── BookingConfirmation.jsx # Digital pass, offline QR code, .ics download
        ├── MyBookings.jsx      # Categorized tabs, cancellation modal & undo
        ├── History.jsx         # Searchable and sortable permit archive
        ├── Profile.jsx         # Vehicle editor, account settings, reset demo data
        ├── Styleguide.jsx      # Living token and component showcase (/styleguide)
        ├── NoAccess.jsx        # 403 Forbidden with admin demo switch
        ├── NotFound.jsx        # 404 Not Found recovery screen
        └── admin/
            ├── AdminOverview.jsx # SVG trend charts, metrics, support inbox
            ├── ManageZones.jsx   # Zone capacity table and creation modal
            └── ManageSlots.jsx   # Slot maintenance toggler & bay creator
```

---

## 6. UI/UX Report & Viva Defense Material

### A. Problem Statement, Objectives, and User Personas

#### Problem Statement
Campus parking lots suffer from irregular surge patterns (morning classes, stadium events). Students and faculty circle lots blindly, causing carbon emissions, class tardiness, and safety hazards. Existing campus portals either lack real-time vacancy indicators or bury specialized slots (EV charging, ADA access) under dense PDFs.

#### Objectives
1. Provide an instant, high-contrast dashboard showing campus-wide parking availability.
2. Allow users to filter and reserve slots matching their vehicle needs (Standard, EV, ADA, Motorcycle) in under 60 seconds.
3. Provide administrators with a centralized control plane to monitor capacity, disable faulty bays, and review safety incidents.

#### Target User Personas

| Attribute | Persona 1: Maya (Commuter Student) | Persona 2: Dr. Vance (Faculty) | Persona 3: Sarah (Campus Admin) |
| :--- | :--- | :--- | :--- |
| **Role & Age** | Junior, Computer Science (21) | Professor, Engineering (48) | Transportation Operations Mgr (39) |
| **Permit Type** | Semester Commuter Pass | Reserved Faculty EV Pass | Full Operations Access |
| **Primary Goal**| Find an open bay 10 minutes before a 9:00 AM lab without driving across campus. | Guarantee an active EV charging slot adjacent to the Engineering hall. | Monitor campus-wide deck occupancy, schedule maintenance, and resolve security reports. |
| **Key Pain Point** | Arriving at a lot only to find it full; confusing parking rules and steep parking fines. | Gas cars blocking EV chargers; needing a fast way to flag broken charger cables. | Manual whiteboard slot tracking, no audit log of bay maintenance, and duplicate bookings. |

---

### B. User Flows (Text Diagrams)

#### 1. Visitor Flow
```
[Arrive at /login]
       │
       ▼
[Click "Continue as Visitor"] ──► [Browse Dashboard & Vacancy Ring]
                                              │
                                              ▼
                                 [Explore Zone & Slot Map]
                                              │
                                              ▼
                                   [Click Available Slot]
                                              │
                                              ▼
                                   [Click "Sign In to Reserve"]
                                              │
                                              ▼
                                [Redirected to /login with Preserved Slot Context]
                                              │
                                              ▼
                                [Sign In ──► Returned Directly to Selected Slot]
```

#### 2. User Booking Flow
```
[Home Dashboard] ──► [Click "Find Parking"]
                            │
                            ▼
     [Filter Decks (Covered / EV / Accessible / Search)]
                            │
                            ▼
                [Select Zone & Deck Level]
                            │
                            ▼
          [Click Slot Unit (e.g. A-07 Standard)]
                            │
                            ▼
      [Booking Drawer Opens: Date, Time Range, Plate]
                            │
                            ▼
        [System Checks hasTimeOverlap Conflict]
               ├── (Conflict Exists) ──► Displays Inline Error: "Slot already reserved"
               └── (No Conflict)     ──► Creates Booking
                                              │
                                              ▼
                            [Digital Pass Confirmation Screen]
                            [Offline QR Code + .ics Calendar Export]
```

#### 3. Admin Maintenance Flow
```
[Admin Signs In] ──► [/admin Dashboard Overview]
                            │
                            ├─► [Examines Hourly Occupancy SVG Trend Chart]
                            │
                            ├─► [Navigates to /admin/slots?zone=A]
                            │         │
                            │         ▼
                            │   [Locates Bay A-13] ──► [Clicks "Maintenance"]
                            │         │
                            │         ▼
                            │   [Slot turns Red (Wrench Icon) & is instantly disabled for users]
                            │
                            └─► [Reviews Facilities Inbox] ──► [Clicks "Resolve Issue"]
```

---

### C. Design Rationale & Principles Applied

| Design Choice | UI/UX Principle / Law | Rationale & Practical Application |
| :--- | :--- | :--- |
| **Dominant Circular Vacancy Ring** | **Visual Hierarchy** & **Nielsen #1** | Availability is the user's primary decision variable. Placing a 140px progress meter as the focal point delivers status in under 2 seconds. |
| **Min 44×44px Touch Targets** | **Fitts's Law** & **WCAG 2.5.5** | Ensures buttons, slot bays, and mobile navigation items can be tapped accurately while driving onto campus or on small mobile screens. |
| **Progressive Disclosure Filters** | **Hick's Law** | Prevents choice paralysis. Users pick a zone first, filter bay types, and only see detailed booking inputs once a slot is clicked. |
| **Dual-Coded Status Badges** | **WCAG 1.4.1 (Use of Color)** | Color blind users (protanopia, deuteranopia) cannot distinguish red and green. Every state pairs a unique color with a distinct glyph icon and text label. |
| **Undo Toast on Cancellation** | **Nielsen #3 (User Control & Freedom)** | Prevents permanent user remorse if an accidental tap cancels a coveted slot. |
| **No Double-Booking Overlap Check** | **Nielsen #5 (Error Prevention)** | Mathematically prevents simultaneous reservations of the same bay before the user submits the form. |
| **Single-Column Forms with Top Labels**| **Eye-Tracking Best Practice** | Labels placed above inputs reduce saccadic lateral eye movements, speeding form completion and reducing submission errors. |
| **Skip-to-Content & Visible Focus** | **WCAG 2.4.1 & 2.4.7 (Accessibility)** | Keyboard-only users can bypass repeated navigation links directly to `#main-content`, accompanied by high-contrast blue focus rings. |

---

### D. Accessibility Verification Checklist (WCAG 2.2 AA)

- [x] **1.4.1 Use of Color**: Verified. Color is never the sole visual indicator. Statuses include glyph icons and text tags.
- [x] **1.4.3 Contrast (Minimum)**: Verified. All primary text exceeds 4.5:1 against light (#F6F8FB, #FFFFFF) and dark (#0B1120, #151F32) backgrounds. Brand Navy (#12306B) against white yields 10.4:1 (AAA).
- [x] **2.1.1 Keyboard Navigation**: Verified. Interactive slot buttons, modal dialogs, and tabs are fully operable with `Tab`, `Shift+Tab`, `Space`, `Enter`, and Arrow keys.
- [x] **2.4.1 Bypass Blocks**: Verified. "Skip to main content" link is the first focusable element on every page.
- [x] **2.4.7 Focus Visible**: Verified. High-contrast 2px blue ring (`focus-visible:ring-2 focus-visible:ring-brand-500`) on all interactive controls.
- [x] **2.3.3 Animation from Interactions**: Verified. `@media (prefers-reduced-motion: reduce)` resets CSS transitions and pulses to 0.01ms.
- [x] **2.5.5 Target Size**: Verified. Touch targets across mobile navigation and buttons meet or exceed 44×44px.
- [x] **3.3.1 / 3.3.2 Error Identification & Labels**: Verified. Input labels are persistently visible and linked via `htmlFor`/`id`. Errors render with `role="alert"` and descriptive fix instructions.
- [ ] *What was not physically verified*: Live screen reader testing across JAWS/NVDA on physical braille hardware was not executed in this environment.

---

### E. Usability Test Script & Blank Results Sheet

#### Test Script Overview
- **Participant Roles**: 3–5 classmates testing representative tasks.
- **Environment**: Chrome or Edge on Windows laptop or mobile viewport.

#### Test Tasks:
1. **Task 1**: Sign in as the demo Student (`student@campus.edu`) using the one-click demo helper.
   * *Success Criterion*: Reaches dashboard within 15 seconds; sees personalized greeting and active permit.
2. **Task 2**: Find an available EV Charging slot in **Zone A** or **Zone C** and initiate reservation.
   * *Success Criterion*: Uses vehicle filter chip, selects an EV bay, and sees charging rate calculation in summary.
3. **Task 3**: Complete booking for slot **A-01** and download the `.ics` calendar invite.
   * *Success Criterion*: Receives digital pass with QR code and triggers browser download of `campuspark-A-01.ics`.
4. **Task 4**: Cancel an upcoming reservation from **My Bookings** and restore it using the **Undo** toast.
   * *Success Criterion*: Confirms modal dialog, notices the floating notification, and clicks "Undo" to restore slot.
5. **Task 5**: Sign in as the Admin and mark slot **B-02** as "Maintenance".
   * *Success Criterion*: Enters `/admin/slots`, toggles status, and confirms bay turns Red across the map.

#### Blank Usability Test Results Sheet (For Class Testing)
| Participant ID | Device / OS | Task 1 (Sign In) | Task 2 (Filter EV) | Task 3 (Book & ICS) | Task 4 (Cancel & Undo) | Task 5 (Admin Override) | Qualitative Notes / Friction Points |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **P-01** | *[Fill: Win/Mac]* | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | *[Observations]* |
| **P-02** | *[Fill: Mobile]* | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | *[Observations]* |
| **P-03** | *[Fill: Desktop]* | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | *[Observations]* |
| **P-04** | *[Fill: Laptop]* | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | [ ] Pass / [ ] Fail | *[Observations]* |

---

### F. 10 Viva Questions & Detailed Answers

1. **Q: Why did you implement mock authentication instead of a real backend?**  
   *A:* This project evaluates product design, user heuristics, and frontend state ergonomics. Mock auth allows evaluation of full authentication states (validation, protected routes, role-based access, session expiry) without requiring server infrastructure or exposing real credentials.
2. **Q: How does the system prevent double-booking of the same parking bay?**  
   *A:* The `hasTimeOverlap` utility uses interval algebra: `Math.max(startA, startB) < Math.min(endA, endB)`. When a user attempts to book, the system compares the proposed timeframe against all existing bookings for that slot. Overlapping slots are rejected before submission.
3. **Q: Why is status never conveyed by color alone?**  
   *A:* Per WCAG 2.2 Guideline 1.4.1, relying on color alone excludes color-blind individuals (~8% of males). CampusPark combines color with semantic glyphs (Check, Clock, Ban, Wrench) and explicit text labels.
4. **Q: How is Fitts's Law reflected in your UI?**  
   *A:* Interactive controls, slot buttons, and mobile bottom tab items have generous hit targets (minimum 44×44px). Primary calls-to-action ("Find Parking", "Reserve Slot") are large and positioned within comfortable reach.
5. **Q: How does Hick's Law influence the slot selection flow?**  
   *A:* Presenting 160+ slots simultaneously creates cognitive overload. We apply progressive disclosure: user selects a Zone (1 of 6) → filters bay type → views ~20 slots → clicks to open reservation panel.
6. **Q: What role does Nielsen Heuristic #3 (User Control and Freedom) play?**  
   *A:* Cancellation is non-punitive. After confirming cancellation, a floating notification with an interactive "Undo" button allows the user to restore the booking immediately.
7. **Q: How do you handle session persistence across page reloads?**  
   *A:* When "Remember me" is checked, user session tokens persist in `localStorage`. When unchecked, session data resides in `sessionStorage`, expiring when the tab closes.
8. **Q: How do you prevent logged-out users from viewing protected data using the browser Back button?**  
   *A:* Route guards (`ProtectedRoute` and `RoleRoute`) check the live authentication state on every render. If the session is null, the user is redirected to `/login` with `replace: true`, preventing back-navigation leakage.
9. **Q: What four states are provided for every screen?**  
   *A:* Loading (pulsing skeleton components), Empty (friendly zero-state illustrations with actionable CTAs), Error (inline contextual validation alerts with fix guidance), and Success (digital passes and confirmation toasts).
10. **Q: How does your mobile navigation adapt across different screen widths?**  
    *A:* On desktop (≥1024px), navigation uses an expansive top bar and split-panel views. On mobile (360px–768px), it collapses into a thumb-accessible bottom tab bar and a slide-out drawer, eliminating horizontal scrolling.

---

### G. 2-Minute Viva Demonstration Script

1. **[0:00 - 0:20] Introduction & Honesty Notice**  
   *"Welcome. CampusPark is an accessible college parking management frontend. Notice the 'Demo Data' badge at the top: all vacancy rates are simulated to maintain transparency. I will begin by demonstrating visitor exploration without an account."*
2. **[0:20 - 0:40] Visitor Browsing & Protected Gate**  
   *"As a visitor, I browse the Campus Vacancy ring at 65% and filter Zone A. I select slot A-02. When I attempt to reserve, the system intercepts me with a friendly sign-in prompt while preserving my chosen slot in memory."*
3. **[0:40 - 1:10] One-Click Demo Login & Real-Time Booking**  
   *"I click 'Try demo Student' to autofill Maya Lin's credentials. After a simulated 600ms validation delay, I am returned directly to slot A-02. I submit the reservation: the system validates my license plate, confirms zero time overlap, and issues my digital pass with an offline QR code and .ics calendar download."*
4. **[1:10 - 1:35] User Control: Cancel & Undo Action**  
   *"In 'My Bookings', I locate my upcoming reservation. I click 'Cancel', provide a reason in the confirmation modal, and submit. The slot is freed, and an Undo toast appears. Clicking 'Undo' safely restores my reservation."*
5. **[1:35 - 2:00] Admin Portal & Styleguide Defense**  
   *"Finally, switching to Sarah Jenkins (Admin), I access the Operations Portal. Here we have live SVG trend curves and slot management. Marking slot B-01 as 'Maintenance' immediately disables it across student views. Visiting `/styleguide` displays our WCAG AA color tokens, typography scales, and component library."*

---

### H. Future Scope & Production Roadmap

1. **Backend Integration**: Replace browser storage with a FastAPI or Node.js/NestJS service backed by PostgreSQL with PostGIS for spatial queries.
2. **Production Authentication**: Implement OAuth2 / OpenID Connect integrated with university SSO (Shibboleth, CAS, Google Workspace for Education) using secure HTTP-only JWTs.
3. **Hardware IoT Sensors**: Ingest MQTT / WebSockets streams from physical ultrasonic bay sensors and license plate recognition (ALPR) entry gate cameras.
4. **Digital Payments & Permits**: Integrate Stripe Elements or university bursar student billing accounts for hourly visitor parking validation.
