# Requirements Document

## Introduction

VibePlay is a mobile-first static web music player organized around cultural "vibes." Users browse a gallery of vibe cards on the index page, tap one, and land on a full-screen themed player page streaming audio from YouTube via the IFrame Player API. The app is a pure React + Vite site with zero backend — playlist data lives in a static JSON file imported at build time.

## Glossary

- **VibePlay**: The static web music player application
- **Vibe**: A cultural mood/theme containing a playlist of songs (e.g., Chhath Puja, Kumar Sanu 90s)
- **VibeCard**: A visual card on the index page representing a single vibe
- **PlayerPage**: The full-screen themed music player view for a single vibe
- **PlayerBar**: The glassmorphism bottom bar containing playback controls
- **PlaylistDrawer**: A slide-up panel listing all songs in the current vibe
- **YouTubeEmbed**: A hidden iframe controlled via the YouTube IFrame Player API
- **PlayerReducer**: The useReducer state machine managing all player state
- **RepeatMode**: The repeat cycle state — off, all, or one
- **ShuffleOrder**: A pre-computed permutation of track indices for shuffle playback
- **Slug**: A URL-safe lowercase hyphen-separated identifier for a vibe

## Requirements

### Requirement 1: Vibe Gallery Browsing

**User Story:** As a user, I want to browse a gallery of vibe cards on the index page, so that I can discover and select a mood to listen to.

#### Acceptance Criteria

1. WHEN a user navigates to the root path ("/"), THE VibePlay SHALL render an IndexPage displaying a grid of VibeCard components sourced from the static vibes.json data
2. THE VibeCard SHALL display the vibe background image, Hindi title (nameHindi), and song count for each vibe
3. WHEN a user taps a VibeCard, THE VibePlay SHALL navigate to the route "/vibe/{slug}" corresponding to that vibe
4. THE VibePlay SHALL use react-router-dom for client-side routing between IndexPage and PlayerPage
5. WHILE the index page is displayed, THE VibePlay SHALL lazy-load vibe card background images using WebP format

### Requirement 2: Music Playback via YouTube

**User Story:** As a user, I want to play music through a themed player powered by YouTube, so that I can listen to songs without leaving the app.

#### Acceptance Criteria

1. WHEN PlayerPage mounts for a valid slug, THE YouTubeEmbed SHALL load the YouTube IFrame API script as a singleton and create a player instance with the first song's youtubeId
2. WHEN the YouTube IFrame API fires onReady, THE PlayerPage SHALL begin autoplay of the current track
3. WHEN the YouTube player fires onStateChange, THE PlayerReducer SHALL synchronize isPlaying state with the actual player state
4. THE YouTubeEmbed SHALL load the IFrame API script at most once across the entire application lifecycle (singleton pattern)
5. WHEN a new track is selected, THE YouTubeEmbed SHALL load the new video by youtubeId without recreating the iframe

### Requirement 3: Playback Controls

**User Story:** As a user, I want play/pause, next, previous, seek, and volume controls, so that I can manage playback of my music.

#### Acceptance Criteria

1. WHEN a user dispatches PLAY, THE PlayerReducer SHALL set isPlaying to true and call player.playVideo()
2. WHEN a user dispatches PAUSE, THE PlayerReducer SHALL set isPlaying to false and call player.pauseVideo()
3. WHEN a user dispatches NEXT, THE PlayerReducer SHALL advance trackIndex using computeNextIndex respecting current shuffle and repeat mode
4. WHEN a user dispatches PREV and currentTime is greater than 3 seconds, THE PlayerReducer SHALL reset currentTime to 0 without changing trackIndex
5. WHEN a user dispatches PREV and currentTime is 3 seconds or less, THE PlayerReducer SHALL move trackIndex to the previous track using computePrevIndex
6. WHEN a user dispatches SEEK with a payload, THE PlayerReducer SHALL update currentTime and call player.seekTo with the specified seconds
7. WHEN a user dispatches SET_VOLUME with a payload, THE PlayerReducer SHALL update volume to the payload value clamped to the range 0 through 100

### Requirement 4: Shuffle and Repeat Modes

**User Story:** As a user, I want shuffle and repeat controls, so that I can vary playback order and loop songs or playlists.

#### Acceptance Criteria

1. WHEN a user dispatches TOGGLE_SHUFFLE to enable shuffle, THE PlayerReducer SHALL generate a new shuffleOrder using Fisher-Yates algorithm with the current track at position 0
2. WHEN a user dispatches TOGGLE_SHUFFLE to disable shuffle, THE PlayerReducer SHALL clear shuffleOrder to an empty array and resume sequential playback
3. WHEN a user dispatches TOGGLE_REPEAT, THE PlayerReducer SHALL cycle RepeatMode through off then all then one then back to off
4. WHEN a track ends and repeat is "one", THE PlayerReducer SHALL restart the same track with currentTime 0 and isPlaying true
5. WHEN a track ends and repeat is "all", THE PlayerReducer SHALL advance to the next track (wrapping to first if at end) with isPlaying true
6. WHEN a track ends and repeat is "off" at the last track, THE PlayerReducer SHALL stop playback by setting isPlaying to false

### Requirement 5: Playlist Drawer

**User Story:** As a user, I want to see and select from all songs in the current vibe, so that I can jump to any track directly.

#### Acceptance Criteria

1. WHEN a user dispatches TOGGLE_DRAWER, THE PlayerReducer SHALL toggle isDrawerOpen between true and false
2. WHILE PlaylistDrawer is open, THE PlaylistDrawer SHALL display all songs in the vibe with title, artist, and duration, highlighting the current track
3. WHEN a user selects a track in PlaylistDrawer, THE PlayerReducer SHALL set trackIndex to the selected index, set isPlaying to true, and reset currentTime to 0
4. WHEN a user closes PlaylistDrawer, THE PlaylistDrawer SHALL animate closed and set isDrawerOpen to false

### Requirement 6: Visual Design and Theming

**User Story:** As a user, I want a visually immersive themed experience with Hindi typography and glassmorphism styling, so that the app feels like a premium music player.

#### Acceptance Criteria

1. WHEN PlayerPage renders, THE PlayerPage SHALL display a full-bleed background image from the vibe's bgImage field
2. THE PlayerBar SHALL render with glassmorphism styling (backdrop-filter blur, semi-transparent background)
3. THE VibePlay SHALL use Noto Sans Devanagari from Google Fonts with font-display swap to render Hindi text without flash of invisible text
4. THE VibePlay SHALL apply the vibe's hex accent color as a CSS custom property (--accent) for themed UI elements
5. THE VibePlay SHALL be responsive and mobile-first, usable on viewports from 320px width up to desktop

### Requirement 7: Error Handling

**User Story:** As a user, I want the app to handle errors gracefully, so that broken content does not crash my experience.

#### Acceptance Criteria

1. WHEN a user navigates to "/vibe/{slug}" with an invalid slug, THE PlayerPage SHALL redirect to the index page using Navigate component
2. WHEN the YouTube player fires onError for a video, THE PlayerPage SHALL auto-skip to the next track via dispatch NEXT
3. IF the YouTube IFrame API script fails to load, THEN THE PlayerPage SHALL display an "Unable to load player" message in the PlayerBar area while keeping navigation functional
4. IF a vibe has zero songs in its data, THEN THE PlayerPage SHALL display "No songs in this vibe" message instead of player controls

### Requirement 8: Performance

**User Story:** As a developer, I want the app to load fast and stay lightweight, so that users on slow networks have a good experience.

#### Acceptance Criteria

1. THE VibePlay SHALL produce a production bundle under 50 KB gzipped with only react, react-dom, and react-router-dom as runtime dependencies
2. THE VibePlay SHALL load the YouTube IFrame API script only when PlayerPage mounts, not on the index page
3. THE VibePlay SHALL dispatch TIME_UPDATE at a polling rate of 1 Hz (once per second) to minimize re-renders
4. THE VibePlay SHALL use plain CSS or CSS Modules with zero runtime CSS-in-JS overhead
5. THE IndexPage SHALL lazy-load vibe card images so that off-screen images do not block initial render

### Requirement 9: Data Validation

**User Story:** As a developer, I want data structures validated at build time, so that runtime errors from malformed data are prevented.

#### Acceptance Criteria

1. THE Vibe data SHALL require slug to be non-empty, lowercase, and hyphen-separated
2. THE Vibe data SHALL require songs array to contain at least 1 entry
3. THE Song data SHALL require youtubeId to be exactly 11 characters
4. THE Song data SHALL require duration to match the pattern "M:SS" or "MM:SS" (regex: /^\d{1,2}:\d{2}$/)
5. THE Vibe data SHALL require bgImage path to start with "/images/"
6. THE Vibe data SHALL require color to be a valid hex string matching #RRGGBB format

### Requirement 10: PWA and Offline Behavior

**User Story:** As a user, I want the app shell to load offline after first visit, so that I can at least browse vibes without network.

#### Acceptance Criteria

1. WHERE PWA support is enabled, THE VibePlay SHALL register a service worker that caches the app shell (HTML, JS, CSS, fonts)
2. WHERE PWA support is enabled, THE VibePlay SHALL cache vibe card images for offline gallery browsing
3. WHILE offline, THE VibePlay SHALL display the index page with cached vibe cards and show a "No network — playback unavailable" indicator on the PlayerPage
4. WHEN network is restored, THE VibePlay SHALL resume normal YouTube playback without requiring page reload
