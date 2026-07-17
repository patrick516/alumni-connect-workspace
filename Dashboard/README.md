# Exploits University Alumni Success & Analytics Portal

A professional, data-driven analytics dashboard built to support institutional decision-making and accreditation initiatives. The portal provides real-time graduate outcome intelligence—employment rates, remuneration packages, sector placement metrics, and gender distribution analysis for the Exploits University alumni network.

**Mission:** *Data-driven decision making and accreditation support.*

---

## Key Features

- **Interactive Metrics Cards** — Display key KPIs at a glance:
  - Employment Rate (81.3%) with active status indicators
  - Average Starting Salary (MK 1,806,026) with verification badges
  - Average Time to Hire (12.3 Months) with fast-track indicators

- **Graduation Year Cohort Filters** — Multi-select filter spanning 2020–2026 graduation cohorts for tailored analysis and historical trend comparison

- **Gender Distribution Analysis** — Composite visual breakdown of alumni by gender with employment-rate outcomes for each cohort segment

- **Comparative Trends & Sector Breakdowns** — Dual-axis chart combining:
  - Bar chart: Average Starting Salary (MWK) by cohort
  - Line overlay: Employment Rate (%) across graduation years
  - Multi-colored donut chart: Employment by sector (ICT, Accounting, Logistics, Business Admin, Health, Agriculture, Government & Public, Self-Employed)

- **Exportable Reports** — One-click export to PDF and Excel formats for institutional reporting and accreditation submissions

- **Theme Toggle** — Full three-way theme support (Light / Dark / System Default) with brand-aligned color palettes:
  - Dark mode: Professional glassmorphic navy palette with royal purple, crimson, and golden accents
  - Light mode: Crisp, high-contrast slate layout

- **Responsive Design** — Optimized for desktop, tablet, and mobile viewing with semantic Tailwind CSS utilities

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher recommended)
- **npm** (bundled with Node.js) or an alternative package manager (pnpm, yarn, bun)
- **Git** (for cloning and managing the repository)

To verify your installation, run:
```bash
node --version
npm --version
git --version
```

---

## Getting Started Guide

### 1. Clone the Repository

```bash
git clone https://github.com/baah101/exploits-alumni-dashboard.git
cd exploits-alumni-dashboard
```

### 2. Install Dependencies

Install all required packages using npm:

```bash
npm install
```

If you're using an alternative package manager:
```bash
pnpm install
# or
yarn install
# or
bun install
```

### 3. Run the Local Development Server

Start the development server with hot-reload enabled:

```bash
npm run dev
```

The dashboard will be accessible at **http://localhost:3000** in your web browser.

### 4. (Optional) Build for Production

To create a production-ready build:

```bash
npm run build
npm start
```

---

## Project Structure

```
exploits-alumni-dashboard/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles & brand tokens
├── components/
│   ├── ui/                 # shadcn/ui primitives (card, button, dropdown, etc.)
│   ├── action-bar.tsx      # Filter & export controls
│   ├── dashboard-header.tsx # Logo, title, theme toggle
│   ├── dashboard-footer.tsx # Copyright & credentials
│   ├── gender-distribution.tsx
│   ├── metric-cards.tsx    # Employment, salary, time-to-hire cards
│   ├── sectors-donut.tsx   # Sector breakdown pie chart
│   ├── theme-provider.tsx  # next-themes configuration
│   ├── theme-toggle.tsx    # Three-way theme switcher
│   └── trends-chart.tsx    # Dual-axis alumni outcome trends
├── public/
│   └── exploits-logo.jpeg  # University logo asset
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## Collaborative Workflow

### Pulling Updates

To fetch the latest changes from the remote repository:

1. **Using GitHub Desktop:**
   - Open GitHub Desktop
   - Select the repository from the left sidebar
   - Click **Fetch origin** (top bar)
   - If updates are available, click **Pull origin** to merge them locally

2. **Using Git CLI:**
   ```bash
   git fetch origin
   git pull origin main
   ```

### Committing & Pushing Changes

When you've made improvements to the dashboard:

1. **Stage your changes:**
   ```bash
   git add .
   ```

2. **Commit with a descriptive message:**
   ```bash
   git commit -m "feat: add X feature" 
   # or
   git commit -m "fix: resolve Y issue"
   git commit -m "docs: update README"
   ```

3. **Push to the main branch:**
   ```bash
   git push origin main
   ```

4. **Best Practices:**
   - Always pull the latest changes before starting work
   - Write clear, concise commit messages
   - Test your changes locally before pushing
   - Communicate with team members before making major architectural changes

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19.2 |
| Meta Framework | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts (via shadcn/ui chart primitives) |
| Theme Management | next-themes |
| Package Manager | npm (pnpm/yarn/bun compatible) |

---

## Brand Identity

The dashboard uses a carefully curated color palette derived from the Exploits University logo:

- **Primary Accent:** Royal Purple (`#2E2A85`)
- **Secondary Accent:** Crimson Red (`#E31B23`)
- **Tertiary Accent:** Golden Orange (`#D9A441`)
- **Dark Mode Palette:** Navy-dark glassmorphic background with ambient brand glows
- **Light Mode Palette:** Crisp slate with high-contrast text

All design tokens are centrally managed in `/app/globals.css` for consistency across the portal.

---

## Contributing

To contribute improvements to the dashboard:

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit them locally
3. Push to your branch: `git push origin feature/your-feature-name`
4. Open a pull request for team review
5. Once approved, merge to `main`

---

## Support & Troubleshooting

**Issue: Port 3000 is already in use**
```bash
# Use an alternative port
npm run dev -- -p 3001
```

**Issue: Styles not updating in dark mode**
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Restart the dev server: `npm run dev`

**Issue: Dependencies not installing**
```bash
rm -rf node_modules package-lock.json
npm install
```

For additional support, contact the development team or refer to the Next.js and shadcn/ui documentation.

---

## License & Credits

This project is developed for **Exploits University** and is intended for internal institutional use. All rights reserved.

**Built with:** React, Next.js, TypeScript, Tailwind CSS, and shadcn/ui  
**Data Visualization:** Recharts  
**Icons:** Lucide React  
**Developed by:** Exploits University Development Team

---

**Last Updated:** July 2026

For questions or feedback, please reach out to your team lead or contribute via GitHub discussions.
