CHIAROSCURO WEDDINGS — WEBSITE CONCEPT

Deployment
The site is a static website. GitHub Pages is configured to publish the dist/
folder with the workflow at ../.github/workflows/pages.yml. In repository
Settings > Pages, choose GitHub Actions as the build and deployment source.

Mobile and motion
- The small-screen layout is designed first for 360–430px, then scales up at
  480px, 768px, 1024px and 1280px.
- The mobile navigation is a full-screen overlay; the photography is a
  single-column editorial gallery and the process becomes a vertical timeline.
- The enquiry form uses large controls and service-option pills. It creates a
  local draft only; it does not submit or store personal information.
- The lightbox supports previous/next controls, keyboard arrows, touch swipes,
  swipe-down close and pinch zoom.
- Motion is controlled by the “Motion: on/off” button (in the mobile menu on
  phones, in the header on desktop) and starts disabled when the visitor
  prefers reduced motion.
- Portfolio photographs have 540px, 810px and original 1080px JPEG sources.
  Smaller sources are selected by responsive srcset/sizes attributes.

Motion tuning
In style.css, adjust --section-space for section spacing and --page-gutter for
page margins. The responsive breakpoints are at 480px, 768px, 1024px and
1280px. Adjust --duration-fast, --duration-reveal, --duration-slow, --ease and
--reveal-distance in style.css to tune motion globally.

Fonts load from Google Fonts when available, with local system fallbacks.
Films and contact links open Instagram. The demo label is intentional; confirm
contact copy and enquiry delivery before a final client launch.
