# Expert Verticals Asset Manifest

All website code must use the production paths below. The original generated filenames are included for traceability only.

| Purpose | Original generated file | Production website path |
| --- | --- | --- |
| Primary integrated fire-systems photograph | `generated_images/exec-97cdbaa8-7398-4fc0-a6f8-d6149310a599.png` | `assets/images/fire-integrated-systems.png` and `assets/images/fire-integrated-systems.webp` |
| Secondary sprinkler/hydrant engineering photograph | `generated_images/exec-32a9daa9-84f9-42b1-bf9a-24f2655a1ff4.png` | `assets/images/fire-sprinkler-hydrant-engineering.png` and `assets/images/fire-sprinkler-hydrant-engineering.webp` |
| Primary traction-elevator cutaway | `generated_images/exec-d94fbd06-833f-4abb-9b86-e5d18aba49a7.png` | `assets/images/traction-elevator-cutaway.png` |
| Alternate transparent traction-elevator cutaway | `generated_images/exec-637ccd33-4ae1-4fb4-924d-4f9a00018e7c.png` | `assets/images/traction-elevator-cutaway-minimal.png` |

Responsive 1200 px fire-photo renditions are included at:

- `assets/images/fire-integrated-systems-1200.webp`
- `assets/images/fire-sprinkler-hydrant-engineering-1200.webp`

Editable icon locations:

- Elevator icons: `assets/icons/elevators/*.svg`
- Fire-fighting icons: `assets/icons/fire/*.svg`

Installation: extract this bundle at the repository root, then merge the included `assets/` directory into the repository's existing `assets/` directory. Do not reference the original `generated_images/exec-*.png` paths from website code.
