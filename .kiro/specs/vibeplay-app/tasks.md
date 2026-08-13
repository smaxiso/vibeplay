# Implementation Plan: VibePlay App

## Overview

Build a mobile-first React + Vite static music player from scratch. Zero backend — playlist data from a JSON file, playback via YouTube IFrame API. Two routes: index gallery and player page. Target <50 KB gzipped bundle.

## Tasks

- [ ] 1. Project scaffolding and core setup
  - [ ] 1.1 Initialize Vite + React + TypeScript project
    - Run `npm create vite@latest . -- --template react-ts` in project root
    - Install dependencies: `react-router-dom`
    - Install dev dependencies: `fast-check`, `vitest`, `@testing-library/react`
    - Configure `tsconfig.json` with strict mode
    - Add Google Fonts link (Noto Sans Devanagari, display=swap) to `index.html`
    - _Requirements: 6.3, 8.1, 8.4_

  - [ ] 1.2 Create directory structure and type definitions
    - Create `src/data/`, `src/components/`, `src/pages/`, `src/hooks/`, `src/utils/`
    - Create `src/types.ts` with `Vibe`, `Song`, `PlayerState`, `RepeatMode`, `PlayerAction` interfaces
    - Create `public/images/` directory for vibe backgrounds
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 1.3 Set up routing in App.tsx
    - Configure BrowserRouter with two routes: `/` → IndexPage, `/vibe/:slug` → PlayerPage
    - Use React.lazy for PlayerPage (code-split YouTube API away from index)
    - _Requirements: 1.4, 8.2_

- [ ] 2. Data layer
  - [ ] 2.1 Create vibes.json with sample data
    - Add 3-4 sample vibes (Chhath Puja, Kumar Sanu 90s, Honey Singh, Bollywood Lofi)
    - Each vibe: slug, name, nameHindi, bgImage, color, songs array
    - Each song: title, artist, youtubeId (11 chars), duration (M:SS format)
    - Add placeholder WebP images to `public/images/`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 2.2 Create data validation utility
    - Write `src/utils/validate.ts` with functions to validate Vibe and Song objects
    - Slug: non-empty, lowercase, hyphen-separated regex
    - youtubeId: exactly 11 chars
    - duration: `/^\d{1,2}:\d{2}$/`
    - bgImage: starts with `/images/`
    - color: `/^#[0-9A-Fa-f]{6}$/`
    - Export typed `vibes` import from `src/data/index.ts` with build-time assertion
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 3. Checkpoint - Ensure project builds and types compile
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Index page and VibeCard component
  - [ ] 4.1 Implement IndexPage component
    - Render header with app title
    - Render grid of VibeCard components from vibes.json
    - Use CSS Grid for responsive layout (auto-fill, minmax)
    - _Requirements: 1.1, 1.5, 8.5_

  - [ ] 4.2 Implement VibeCard component
    - Accept `VibeCardProps` (slug, name, nameHindi, bgImage, color, songCount)
    - Render background image with `loading="lazy"` for off-screen cards
    - Display nameHindi and song count overlay
    - Wrap in `<Link to={/vibe/${slug}}>` for navigation
    - _Requirements: 1.2, 1.3, 1.5_

- [ ] 5. Player state machine
  - [ ] 5.1 Implement playerReducer and helper functions
    - Create `src/hooks/playerReducer.ts`
    - Implement `playerReducer` with all action types: PLAY, PAUSE, NEXT, PREV, SEEK, SELECT_TRACK, TOGGLE_SHUFFLE, TOGGLE_REPEAT, SET_VOLUME, TIME_UPDATE, TRACK_ENDED, TOGGLE_DRAWER
    - Implement `computeNextIndex` and `computePrevIndex` (shuffle-aware, repeat-aware)
    - Implement `handleTrackEnded` for all repeat modes
    - Implement `generateShuffleOrder` using Fisher-Yates with current track at position 0
    - Clamp volume to 0-100 in SET_VOLUME
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.3_

  - [ ]* 5.2 Write property test: track index always within bounds
    - **Property 1: Track index always within bounds**
    - Generate arbitrary PlayerState and sequences of NEXT/PREV/SELECT_TRACK/TRACK_ENDED actions
    - Assert `0 <= trackIndex < totalTracks` after every action
    - **Validates: Requirements 3.3, 3.5, 4.5, 5.3**

  - [ ]* 5.3 Write property test: shuffle order is valid permutation
    - **Property 2: Shuffle order is a valid permutation with current track at front**
    - Generate arbitrary state, enable shuffle, verify shuffleOrder is permutation of [0..n-1] with shuffleOrder[0] === currentIndex
    - When disabled, shuffleOrder is empty
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 5.4 Write property test: volume clamped within bounds
    - **Property 3: Volume clamped within bounds**
    - Generate arbitrary integer payloads for SET_VOLUME
    - Assert `0 <= state.volume <= 100`
    - **Validates: Requirements 3.7**

  - [ ]* 5.5 Write property test: repeat mode cycles deterministically
    - **Property 4: Repeat mode cycles deterministically**
    - From any RepeatMode, TOGGLE_REPEAT produces next in cycle: off → all → one → off
    - **Validates: Requirements 4.3**

  - [ ]* 5.6 Write property test: previous restarts when past 3 seconds
    - **Property 5: Previous restarts track when past 3 seconds**
    - Generate state with currentTime > 3, dispatch PREV, assert currentTime = 0 and trackIndex unchanged
    - **Validates: Requirements 3.4**

  - [ ]* 5.7 Write property test: track ended respects repeat mode
    - **Property 6: Track ended respects repeat mode**
    - Test all three repeat modes when TRACK_ENDED dispatched
    - **Validates: Requirements 4.4, 4.5, 4.6**

  - [ ]* 5.8 Write unit tests for playerReducer
    - Test each action type with specific examples and edge cases
    - Test computeNextIndex/computePrevIndex at boundaries (first track, last track)
    - Test handleTrackEnded for all repeat modes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 6. YouTube IFrame API integration
  - [ ] 6.1 Implement YouTube API singleton loader
    - Create `src/utils/youtube.ts` with `loadYouTubeAPI()` — returns cached Promise
    - Appends script tag at most once, resolves on `onYouTubeIframeAPIReady`
    - Handle load failure with Promise rejection
    - _Requirements: 2.1, 2.4, 8.2_

  - [ ] 6.2 Implement YouTubeEmbed component
    - Create `src/components/YouTubeEmbed.tsx`
    - Accept `videoId`, `onReady`, `onStateChange`, `onError` props
    - On mount: call `loadYouTubeAPI()`, then create `YT.Player` in hidden div
    - On `videoId` change: call `player.loadVideoById()` without recreating iframe
    - Cleanup: destroy player on unmount
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 7.2_

  - [ ] 6.3 Implement useVibePlayer custom hook
    - Create `src/hooks/useVibePlayer.ts`
    - Wire useReducer with playerReducer
    - Set up 1Hz polling interval for TIME_UPDATE (getCurrentTime/getDuration)
    - Handle onStateChange to sync isPlaying
    - Handle onError to dispatch NEXT
    - Handle player.playVideo/pauseVideo/seekTo/setVolume as side effects of state changes
    - _Requirements: 2.2, 2.3, 3.1, 3.2, 3.6, 7.2, 8.3_

- [ ] 7. Checkpoint - Ensure player logic works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. PlayerPage layout and components
  - [ ] 8.1 Implement PlayerPage component
    - Create `src/pages/PlayerPage.tsx`
    - Read slug from `useParams()`, lookup vibe from data
    - Redirect to `/` via `<Navigate>` if slug not found or vibe has 0 songs
    - Set CSS custom property `--accent` from vibe.color
    - Render full-bleed background, TopBar, VibeTitle, PlayerBar, PlaylistDrawer, YouTubeEmbed
    - Show "Unable to load player" message if API fails to load
    - Show "No songs in this vibe" if songs array empty
    - _Requirements: 2.1, 6.1, 6.4, 7.1, 7.3, 7.4_

  - [ ] 8.2 Implement TopBar component
    - Create `src/components/TopBar.tsx`
    - Back arrow link to index page
    - Optional: vibe switcher dropdown
    - _Requirements: 1.4_

  - [ ] 8.3 Implement PlayerBar component
    - Create `src/components/PlayerBar.tsx`
    - Glassmorphism styling (backdrop-filter: blur, semi-transparent bg)
    - Show current song title + artist
    - Play/pause button, next/prev buttons
    - SeekBar (range input or custom) showing progress
    - Time display (current / duration) using `formatTime` utility
    - Volume slider
    - Shuffle toggle (highlight when active)
    - Repeat toggle (cycle icon: off/all/one)
    - Playlist toggle button
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.3, 5.1, 6.2_

  - [ ] 8.4 Implement PlaylistDrawer component
    - Create `src/components/PlaylistDrawer.tsx`
    - Slide-up panel with song list (title, artist, duration)
    - Highlight current track
    - Tap song to dispatch SELECT_TRACK
    - Close button / overlay tap to close
    - CSS transition for open/close animation
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 8.5 Create utility functions (formatTime, parseDuration)
    - Create `src/utils/format.ts`
    - `formatTime(seconds)` → "M:SS" or "MM:SS"
    - `parseDuration(duration)` → total seconds
    - _Requirements: 3.6, 5.2_

- [ ] 9. CSS and styling
  - [ ] 9.1 Implement global styles and CSS variables
    - Create `src/index.css` with reset, dark theme defaults, font-family (Noto Sans Devanagari)
    - Define CSS custom properties: `--accent`, `--glass-bg`, `--glass-blur`
    - Mobile-first responsive breakpoints (320px base, tablet, desktop)
    - _Requirements: 6.2, 6.3, 6.5_

  - [ ] 9.2 Style all components with CSS Modules
    - IndexPage grid (responsive auto-fill)
    - VibeCard (image overlay, hover state)
    - PlayerPage (full-viewport, layered z-index)
    - PlayerBar (glassmorphism, fixed bottom)
    - PlaylistDrawer (slide-up, overlay backdrop)
    - SeekBar and volume slider custom styling
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 8.4_

- [ ] 10. Error handling
  - [ ] 10.1 Implement all error scenarios
    - Invalid slug → `<Navigate to="/" />` (already in PlayerPage)
    - YouTube onError → auto-skip via dispatch NEXT
    - API load failure → "Unable to load player" fallback UI
    - Empty playlist → "No songs in this vibe" message
    - Ensure navigation remains functional in all error states
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 11. Checkpoint - Full app functional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Performance optimization
  - [ ] 12.1 Verify bundle size and optimize
    - Run `npx vite build` and check gzipped output
    - Ensure only react, react-dom, react-router-dom in bundle
    - Lazy-load PlayerPage with `React.lazy` + `Suspense`
    - Verify images use `loading="lazy"` on index
    - Confirm YouTube API script loads only on PlayerPage mount
    - _Requirements: 8.1, 8.2, 8.5_

- [ ] 13. PWA setup (optional)
  - [ ] 13.1 Configure vite-plugin-pwa
    - Install `vite-plugin-pwa` as dev dependency
    - Configure in `vite.config.ts` with GenerateSW strategy
    - Cache app shell: HTML, JS, CSS, fonts
    - Cache images for offline gallery
    - Add manifest.json with app name, icons, theme color
    - Add offline indicator on PlayerPage: "No network — playback unavailable"
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 14. Hosting setup
  - [ ] 14.1 Configure deployment
    - Create `vercel.json` with SPA rewrites (`"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`)
    - OR create `firebase.json` with hosting config and SPA rewrite
    - Add build script to package.json if not present
    - _Requirements: 1.4_

- [ ] 15. Final checkpoint - Production ready
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- TypeScript is the implementation language (as specified in design)
- All CSS uses plain CSS or CSS Modules — no runtime CSS-in-JS

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["4.1", "4.2", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "6.1", "8.5"] },
    { "id": 5, "tasks": ["6.2", "6.3"] },
    { "id": 6, "tasks": ["8.1", "8.2", "8.3", "8.4"] },
    { "id": 7, "tasks": ["9.1"] },
    { "id": 8, "tasks": ["9.2", "10.1"] },
    { "id": 9, "tasks": ["12.1"] },
    { "id": 10, "tasks": ["13.1", "14.1"] }
  ]
}
```
