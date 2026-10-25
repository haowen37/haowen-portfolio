# Typography — 2026-10-26

All portfolio and Near Horizon pages use Neue Haas Unica W1G Regular (400). Arial is the only named fallback; `sans-serif` is the browser's generic family category. The shared `typography.css` defines this system, and all four HTML entry points load it.

The font is resolved from the visitor's installed fonts using `local()`. A device without Unica displays Arial. No commercial font binary has been added to the deployment. Earlier typeface declarations and font preloads have been removed.

The original LHW image is a custom-drawn mark, independent of the text typeface, and remains unchanged. Existing project artwork is preserved.
