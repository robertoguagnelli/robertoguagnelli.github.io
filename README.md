# robertoguagnelli.github.io
Mechanical &amp; Aeronautical Engineering Portfolio | Aircraft Design, CAD, CFD, FEA, Manufacturing &amp; Flight Testing

## Reference CV

The canonical general-purpose CV for this portfolio is `assets/Roberto_Guagnelli_CV.tex` (LaTeX source); `assets/Roberto_Guagnelli_CV.pdf` is the generated public download. For any future job-specific CV, begin with this source and adapt only the material relevant to the vacancy. Preserve factual experience, dates, and achievements. Use **RISE** as the project name in GE Aerospace experience, consistently across the website and CV.

The GitHub Actions workflow `.github/workflows/build-cv.yml` automatically rebuilds the published PDF when the LaTeX source changes.

## Content map

- `index.html`: introduction, aircraft, CFD feature, GE / La Corona experience, expandable academic projects, about and contact.
- `projects/wingull.html` and `projects/latias.html`: existing aircraft case studies; factual content retained.
- `projects/aerodynamics.html`: CFD study structure, with explicitly pending methodology and results.
- `style.css`: shared responsive design. No JavaScript, build step or external font dependencies.
- `images/famex-2025.jpeg`: original personal FAMEX photograph, shown only in About with a caption.

## Completing the portfolio

1. Replace `.media-placeholder` blocks with descriptive images or videos with `controls`, `poster` and `preload="metadata"`. Preserve the surrounding section and navigation IDs.
2. Fill `.content-placeholder` blocks with confirmed contributions and results. GE is professional experience; only use material approved for public sharing.
3. Academic project `details` elements provide expandable slots for scope, personal contribution and evidence. Do not imply BIC or GENERAC employment from an academic project.
4. Add the supplied CV and preferred email to Contact. The current CV text is deliberately not a dead link.
5. FAMEX is personal photography, separate from project evidence. Prefer aircraft, CAD, test and CFD imagery for the main portfolio.

Run locally: `python3 -m http.server 8000` from the repository root.

- `projects/hyperion.html`: SAE Aero Design México 2024 Regular Class; manufacturing coordination and nose landing gear case study. Photos, flight video and award evidence have labeled media placeholders. The 4 kg aircraft mass is kept as reported; empty/loaded condition has not been specified.
