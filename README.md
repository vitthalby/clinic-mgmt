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

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clinic-mgmt
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Build for Production

```bash
npm run build
# or
yarn build
```

### Start Production Server

```bash
npm start
# or
yarn start
```

## 📁 Project Structure

```
clinic-mgmt/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and utility classes
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main landing page
├── components/            # React components
│   ├── Hero.tsx          # Hero section with rotating cards
│   ├── Services.tsx      # Services carousel
│   ├── Navbar.tsx        # Navigation bar
│   └── Footer.tsx        # Footer component
├── public/               # Static assets
│   └── images/          # Service images
├── tailwind.config.ts   # Tailwind CSS configuration
└── package.json         # Project dependencies
```

## 🎯 Services Offered

1. **Matrix Rhythm Therapy** - Cellular level regeneration
2. **Cupping Therapy** - Ancient suction technique
3. **Pain Management** - Chronic and acute pain relief
4. **Kinesiology Taping** - Muscle and joint support
5. **Post-Surgical Rehab** - Recovery protocols
6. **Dry Needling** - Trigger point release
7. **Ultrasound Therapy** - Deep heat therapy

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.33
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Custom React components
- **Icons**: Heroicons (via SVG)

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
