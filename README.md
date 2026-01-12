# Fit Square - Physiotherapy Clinic Management System

A modern, dark-themed physiotherapy clinic website built with Next.js, featuring a premium UI with orange and blue accents. This project provides a public-facing website for physiotherapy clinics with customizable content and SEO optimization.

## 🌟 Features

- **Modern Dark Theme**: Premium dark design with orange and blue gradient accents
- **Responsive Design**: Fully responsive across mobile, tablet, and desktop devices
- **Interactive Hero Section**: 3D rotating service cards with smooth animations
- **Services Carousel**: Interactive carousel showcasing 7 specialized therapies with premium hover effects
- **SEO Optimized**: Built with SEO best practices for better search rankings
- **Premium Animations**: Smooth transitions and micro-interactions using Framer Motion
- **Glassmorphism UI**: Modern glass-effect cards and components

## 🎨 Design Highlights

- **Color Palette**: Orange (#FF3D00) and Blue primary colors with dark background
- **Typography**: Inter font family for clean, modern text
- **Components**: 
  - Rotating 3D service cards in hero section
  - Interactive services carousel with navigation
  - Premium hover effects with zoom, glow, and animations
  - Modern navbar with smooth scrolling
  - Comprehensive footer with contact information

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **Docker**: For running the local Postgres database
- **Google Cloud Console Account**: For setting up Google OAuth

### Local Setup

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd clinic-mgmt
   npm install
   ```

2. **Environment Configuration**:
   Copy the example environment file and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
   *Note: You will need to generate an `AUTH_SECRET` (run `npx auth secret`) and set up a Google OAuth Client in the [Google Cloud Console](https://console.cloud.google.com/).*

3. **Start the Database**:
   Use Docker to launch the local Postgres instance:
   ```bash
   cd docker
   docker-compose up -d
   cd ..
   ```

4. **Synchronize Database Schema**:
   Push the Drizzle schema to your local database:
   ```bash
   npx drizzle-kit push
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```

6. **First Login**:
   - Visit `http://localhost:3000/management`.
   - Ensure `ALLOW_REGISTRATION="true"` is set in your `.env.local` for the first login.
   - Sign in with Google to create your admin account.
   - Once logged in, set `ALLOW_REGISTRATION="false"` to secure the system.

### Access URLs
- **Main Website**: [http://localhost:3000](http://localhost:3000)
- **Management Dashboard**: [http://localhost:3000/management](http://localhost:3000/management)
- **Database Explorer (Drizzle Studio)**: `npx drizzle-kit studio`

## 📁 Project Structure

```
clinic-mgmt/
├── app/                    # Next.js app directory
│   ├── (site)/            # Public website routes
│   ├── (management)/      # Secure management dashboard routes
│   └── api/auth/          # NextAuth API routes
├── components/            # React components
│   ├── (site)/            # Website specific components
│   └── management/        # Dashboard specific components
├── docker/                 # Docker configuration (Postgres)
├── lib/                    # Shared libraries (DB, Schema)
├── public/                # Static assets
└── drizzle/                # Generated database migrations
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Database**: Postgres (Local via Docker)
- **ORM**: Drizzle ORM
- **Authentication**: Auth.js (NextAuth v5)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Language**: TypeScript

## 🎨 Customization

### Colors

Update the color palette in `tailwind.config.ts`:

```typescript
colors: {
  orange: {
    DEFAULT: '#FF3D00',
    light: '#FF5722',
    dark: '#E63900',
  },
  blue: {
    // Your blue shades
  }
}
```

### Services

Modify the services array in `components/Services.tsx` to add/remove services.

### Content

Update text content in respective component files:
- Hero section: `components/Hero.tsx`
- Services: `components/Services.tsx`
- Footer: `components/Footer.tsx`

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔜 Future Enhancements

- [ ] Blog section with dynamic content
- [ ] Contact form with email integration
- [ ] Appointment booking system
- [ ] Admin dashboard for clinic management
- [ ] Patient portal
- [ ] Multi-clinic support

## 📄 License

This project is private and proprietary.

## 👥 Authors

Developed for Fit Square Physiotherapy Clinic

## 🤝 Contributing

This is a private project. For any questions or suggestions, please contact the development team.

---

Built with ❤️ using Next.js and Tailwind CSS
