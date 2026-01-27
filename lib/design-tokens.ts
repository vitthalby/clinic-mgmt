/**
 * Centralized Design Tokens
 * 
 * This file contains all design tokens (colors, spacing, etc.) used across
 * both the public website and management application.
 * 
 * Usage:
 * - In Tailwind: These are configured in tailwind.config.ts
 * - In JS/TS: Import from this file for programmatic access
 */

export const colors = {
  // Brand Colors
  brand: {
    primary: '#FF4D00',      // Orange - main brand color
    primaryLight: '#FF7A40',
    primaryDark: '#CC3D00',
    secondary: '#00A3FF',    // Blue - accent color
    secondaryLight: '#40C2FF',
    secondaryDark: '#007ACC',
  },

  // Surface Colors (Dark Theme - Website)
  surface: {
    base: '#0A0A0A',
    highlight: '#141414',
    card: '#1A1A1A',
    border: 'rgba(255, 255, 255, 0.08)',
  },

  // Management App Colors (Light Theme)
  management: {
    background: '#F9FAFB',   // gray-50
    card: '#FFFFFF',
    border: '#E5E7EB',       // gray-200
    primary: '#4F46E5',      // indigo-600
    primaryHover: '#4338CA', // indigo-700
    primaryLight: '#EEF2FF', // indigo-50
    text: {
      primary: '#111827',    // gray-900
      secondary: '#6B7280',  // gray-500
      muted: '#9CA3AF',      // gray-400
    },
    success: '#10B981',      // emerald-500
    warning: '#F59E0B',      // amber-500
    error: '#EF4444',        // red-500
    info: '#3B82F6',         // blue-500
  },

  // Semantic Colors (shared)
  semantic: {
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },

  // Text Colors
  text: {
    white: '#FFFFFF',
    light: 'rgba(255, 255, 255, 0.8)',
    muted: 'rgba(255, 255, 255, 0.6)',
    dark: '#111827',
    darkMuted: '#6B7280',
  },
} as const

export const spacing = {
  page: {
    paddingX: '1.5rem',      // px-6
    paddingY: '1.5rem',      // py-6
    maxWidth: '80rem',       // max-w-7xl
  },
  card: {
    padding: '1.5rem',       // p-6
    gap: '1rem',             // gap-4
  },
  section: {
    gap: '2rem',             // gap-8
    marginY: '3rem',         // my-12
  },
} as const

export const borderRadius = {
  sm: '0.375rem',   // rounded-md
  md: '0.5rem',     // rounded-lg
  lg: '0.75rem',    // rounded-xl
  xl: '1rem',       // rounded-2xl
  full: '9999px',   // rounded-full
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const

export const typography = {
  fontFamily: {
    sans: 'var(--font-outfit), sans-serif',
    display: 'var(--font-playfair), serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
} as const

// CSS class helpers for consistent styling
export const managementStyles = {
  // Page container
  pageContainer: 'space-y-6',
  
  // Page header
  pageHeader: 'flex justify-between items-center',
  pageTitle: 'text-2xl font-bold text-gray-900',
  
  // Cards
  card: 'bg-white shadow rounded-lg border border-gray-200',
  cardHeader: 'px-6 py-4 border-b border-gray-200',
  cardBody: 'p-6',
  
  // Tables
  table: 'min-w-full divide-y divide-gray-200',
  tableHeader: 'bg-gray-50',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableBody: 'bg-white divide-y divide-gray-200',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm',
  
  // Buttons
  buttonPrimary: 'inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium text-sm',
  buttonSecondary: 'inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm',
  buttonDanger: 'inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium text-sm',
  buttonGhost: 'inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors text-sm',
  
  // Form elements
  label: 'block text-sm font-medium text-gray-700 mb-1',
  input: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2',
  inputError: 'border-red-300 focus:border-red-500 focus:ring-red-500',
  select: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2',
  checkbox: 'h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded',
  
  // Badges
  badgePrimary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800',
  badgeSuccess: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800',
  badgeWarning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800',
  badgeError: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800',
  badgeGray: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800',
  
  // Alerts
  alertError: 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm',
  alertSuccess: 'bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm',
  alertWarning: 'bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm',
  alertInfo: 'bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm',
  
  // Modal
  modalOverlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
  modalContent: 'bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto',
  modalHeader: 'px-6 py-4 border-b border-gray-200',
  modalBody: 'p-6',
  modalFooter: 'px-6 py-4 border-t border-gray-200 flex justify-end gap-3',
} as const

// Website (public) styles
export const websiteStyles = {
  // Sections
  section: 'py-20',
  sectionHeader: 'text-center mb-12',
  sectionTitle: 'text-4xl md:text-5xl font-bold mb-4',
  sectionSubtitle: 'text-white/60 text-lg max-w-2xl mx-auto',
  
  // Cards
  glassCard: 'bg-surface-highlight/40 backdrop-blur-md border border-surface-border rounded-2xl p-6 transition-all duration-300 hover:bg-surface-highlight/60',
  
  // Buttons
  buttonPrimary: 'px-6 py-3 bg-orange text-white rounded-full font-semibold hover:bg-orange/90 transition-all hover:scale-105 active:scale-95',
  buttonSecondary: 'px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-semibold hover:bg-white/10 transition-all',
  
  // Text
  textGradient: 'bg-clip-text text-transparent bg-gradient-to-r from-orange via-orange-light to-blue',
} as const
