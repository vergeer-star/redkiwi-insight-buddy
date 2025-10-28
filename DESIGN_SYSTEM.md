# Redkiwi Website Huisstijl Ontwerpvoorstel

## 🎨 Kleurpalet

### Primaire Kleuren
- **Redkiwi Rood**: `#ED1C24` (HSL: 356° 85% 53%)
  - Gebruik: Logo, accenten, knoppen, belangrijke tekst
  - Hover variant: `#D01821` (HSL: 356° 85% 45%)

- **Zwart**: `#000000` (HSL: 0° 0% 0%)
  - Gebruik: Achtergronden, primaire containers
  - Variant: `#0D0D0D` (5% wit mix voor subtle contrast)

- **Wit**: `#FFFFFF` (HSL: 0° 0% 100%)
  - Gebruik: Tekst op donkere achtergronden, contrastelementen

### Secundaire Kleuren
- **Neon Groen**: `#C5FF00` (HSL: 75° 100% 56%)
  - Gebruik: Call-to-Action buttons, belangrijke interactieve elementen
  - Kenmerken: Hoge zichtbaarheid, moderne tech-uitstraling

### Ondersteunende Kleuren
- **Grijs Tinten**:
  - Muted: `#262626` (15% wit) - voor borders en muted backgrounds
  - Text: `#B3B3B3` (70% wit) - voor subtekst

## 📝 Typografie

### Lettertype Familie
**Inter** - Modern, professioneel sans-serif font
- Uitstekende leesbaarheid op schermen
- Breed gewichtsbereik (400-900)
- Ontworpen voor digital interfaces

### Typografisch Schema

#### H1 - Hero Headlines
```css
font-size: 3.5rem (56px) - 6rem (96px) responsive
font-weight: 900 (Black)
text-transform: uppercase
letter-spacing: -0.02em (tight)
line-height: 1.1
```
Gebruik: Grote hero statements, "WELCOME TO REDKIWI"

#### H2 - Section Headers
```css
font-size: 2.5rem (40px) - 4rem (64px) responsive  
font-weight: 900 (Black)
text-transform: uppercase
letter-spacing: -0.01em
line-height: 1.2
```
Gebruik: Sectie titels, belangrijke headers

#### H3 - Subsection Headers
```css
font-size: 1.5rem (24px) - 2rem (32px) responsive
font-weight: 800 (Extra Bold)
letter-spacing: 0.05em (wide)
text-transform: uppercase
```
Gebruik: Sub-secties, labels

#### Body Text - Regular
```css
font-size: 1rem (16px) - 1.125rem (18px) responsive
font-weight: 500 (Medium)
line-height: 1.6
letter-spacing: 0
```
Gebruik: Standaard body tekst, paragrafen

#### Body Text - Small
```css
font-size: 0.875rem (14px)
font-weight: 500 (Medium)
line-height: 1.5
```
Gebruik: Labels, metadata, kleine tekst

#### Labels & Tags
```css
font-size: 0.75rem (12px) - 0.875rem (14px)
font-weight: 700 (Bold)
text-transform: uppercase
letter-spacing: 0.1em (widest)
```
Gebruik: Tags, badges, status indicators

## 🔲 Vormgeving & Layout

### Border Radius
- **Cards/Containers**: `0.5rem (8px)` - minimaal, strak
- **Buttons**: `0.25rem (4px)` - scherpe hoeken, modern
- **Inputs**: `0.25rem (4px)`
- **Tags/Badges**: `0.25rem (4px)`

### Spacing Systeem
Gebaseerd op 4px base unit (Tailwind spacing scale)
- xs: 0.5rem (8px)
- sm: 1rem (16px)
- md: 1.5rem (24px)
- lg: 2rem (32px)
- xl: 3rem (48px)
- 2xl: 4rem (64px)

### Shadow System
```css
/* Primary Glow - Rood accent */
shadow-primary: 0 0 60px rgba(237, 28, 36, 0.5);

/* Neon Glow - Groen accent */  
shadow-neon: 0 0 40px rgba(197, 255, 0, 0.5);

/* Soft Shadow - Subtle depth */
shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.8);
```

### Border Systeem
- **Subtle borders**: 1px solid rgba(255, 255, 255, 0.1)
- **Accent borders**: 2px solid rgba(237, 28, 36, 0.2)
- **Strong borders**: 2px solid rgba(237, 28, 36, 0.4)

## 🎭 Iconografie Stijl

### Kenmerken
- **Stijl**: Minimalistisch, geometric
- **Lijndikte**: 2px (medium stroke)
- **Kleur**: Primair wit, accenten in rood
- **Grootte**: 16px, 20px, 24px standaard maten
- **Hover**: Scale transform (1.1x) met smooth transition

### Checkmark Symbolen
- ✓ voor checklists (bold, primary red)
- Vierkante bullets voor lijsten
- Geen decoratieve iconen - functionaliteit eerst

## 📐 Homepage Layout Voorbeeld

### Hero Section
```
┌─────────────────────────────────────────┐
│  [LOGO]                    [NAVIGATION]  │
├─────────────────────────────────────────┤
│                                          │
│        [TAG: MERKPERCEPTIE]              │
│                                          │
│     WELCOME TO REDKIWI.                  │
│     AI DRIVEN DIGITAL AGENCY             │
│                                          │
│        [Introductie tekst]               │
│                                          │
│    [NEON GROENE CTA BUTTON]              │
│                                          │
└─────────────────────────────────────────┘
```

### Content Section Pattern
```
┌─────────────────────────────────────────┐
│  [Zwarte achtergrond]                    │
│                                          │
│  SECTION HEADER                          │
│  [Rode accent lijn]                      │
│                                          │
│  Content in white/grijs                  │
│  - Bullet met rode checkmarks            │
│  - Strakke uitlijning                    │
│  - Veel witruimte                        │
│                                          │
└─────────────────────────────────────────┘
```

## 🎯 Design Principes

### 1. **High Contrast**
- Altijd sterke contrast: Zwart/Wit, Rood/Zwart
- Geen grijze middentoenen in primaire elementen
- Duidelijke hiërarchie door contrast

### 2. **Bold & Impactful**
- Grote, dikgedrukte koppen in hoofdletters
- Sterke typografische statements
- Minimale maar krachtige visuele elementen

### 3. **Modern & Tech**
- Strakke geometrische vormen
- Subtle grid patterns als textuur
- Minimal animations (glow, scale transforms)
- Dark-first design approach

### 4. **Professioneel & Toegankelijk**
- WCAG AAA compliant contrast ratios
- Duidelijke call-to-actions met neon groen
- Leesbare body text (wit op zwart)
- Consistent spacing en alignment

### 5. **AI-Driven Agency Identiteit**
- Tech-forward zonder overdreven futuristisch
- Professioneel maar approachable
- Focus op impact en resultaten
- Clean, distraction-free interfaces

## 🔧 Implementatie Richtlijnen

### CSS Variables (Tailwind/CSS Custom Properties)
```css
:root {
  /* Colors */
  --redkiwi-red: 356 85% 53%;
  --redkiwi-black: 0 0% 0%;
  --redkiwi-white: 0 0% 100%;
  --neon-green: 75 100% 56%;
  
  /* Typography */
  --font-display: 'Inter', system-ui, sans-serif;
  
  /* Spacing */
  --radius: 0.5rem;
  
  /* Effects */
  --shadow-glow: 0 0 60px rgba(237, 28, 36, 0.5);
  --shadow-neon: 0 0 40px rgba(197, 255, 0, 0.5);
}
```

### Button Variants

#### Primary CTA (Neon Green)
```tsx
<Button className="
  bg-[#C5FF00] 
  hover:bg-[#C5FF00]/90 
  text-black 
  font-black 
  uppercase 
  tracking-widest
  shadow-[0_0_40px_rgba(197,255,0,0.5)]
  hover:shadow-[0_0_60px_rgba(197,255,0,0.7)]
  rounded-sm
  px-14 py-7
  text-sm
">
  CALL TO ACTION
</Button>
```

#### Secondary (Red Outline)
```tsx
<Button className="
  bg-transparent
  border-2 border-[#ED1C24]
  text-[#ED1C24]
  hover:bg-[#ED1C24]
  hover:text-white
  font-bold
  uppercase
  tracking-wider
  rounded-sm
  px-8 py-4
">
  SECONDARY
</Button>
```

### Tag/Badge Component
```tsx
<div className="
  inline-block
  px-5 py-2
  bg-[#ED1C24]/10
  border border-[#ED1C24]/40
  rounded-sm
  text-xs
  font-bold
  tracking-widest
  text-[#ED1C24]
  uppercase
">
  TAG TEXT
</div>
```

## 📱 Responsive Gedrag

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px
- Large: > 1400px

### Mobile Aanpassingen
- Font sizes: 0.7x van desktop
- Padding: Reduced (16px instead of 32px)
- Stack layout (geen side-by-side)
- Full-width CTAs
- Logo height: 32px (vs 48px desktop)

### Tablet
- Font sizes: 0.85x van desktop  
- Padding: Reduced (24px)
- Hybrid layouts mogelijk
- Logo height: 40px

## 🎨 Achtergrond Patronen

### Diagonal Grid (Subtiel)
```css
background: 
  linear-gradient(45deg, rgba(237,28,36,0.03) 1px, transparent 1px),
  linear-gradient(-45deg, rgba(237,28,36,0.03) 1px, transparent 1px);
background-size: 80px 80px;
```

### Gebruik
- Homepage achtergrond
- Section backgrounds
- Behind cards voor subtle texture

## ✅ Logo Varianten

### Primair Logo
- Volledig logo met rood kiwi icon + tekst
- Gebruik: Header, footer, belangrijke plaatsen
- Minimale hoogte: 32px (mobile), 48px (desktop)

### Icon Only
- Alleen de rode kiwi
- Gebruik: Favicon, social media avatar, small spaces
- Minimale grootte: 24x24px

### Monochroom
- Wit logo voor dark backgrounds
- Zwart logo voor light backgrounds (indien nodig)
- Gebruik: Alternatieve contexts

---

## 📋 Samenvatting Quick Reference

**Primaire Kleur**: #ED1C24 (Redkiwi Rood)  
**Secundaire Kleur**: #C5FF00 (Neon Groen)  
**Base Kleur**: #000000 (Zwart)  
**Tekst Kleur**: #FFFFFF (Wit)

**Font**: Inter (400-900)  
**H1**: 900 weight, uppercase, 3.5-6rem  
**Body**: 500 weight, 1-1.125rem  
**Labels**: 700 weight, uppercase, 0.75-0.875rem

**Border Radius**: 0.25-0.5rem (strak, minimal)  
**Spacing**: 4px base unit systeem  
**Shadows**: Red glow, neon glow effects

**Stijl**: Bold, Modern, High-contrast, Tech-forward, Professional
