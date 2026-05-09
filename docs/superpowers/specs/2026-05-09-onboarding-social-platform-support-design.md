# Onboarding Social Platform Support Design

## Context

The influencer onboarding lets users select these social platforms:

- instagram
- whatsapp
- tiktok
- youtube
- website
- spotify
- threads
- facebook
- x
- soundcloud
- snapchat
- pinterest
- patreon
- twitch
- applemusic

The API already has a broader `Plataforma` enum that includes these values, but the influencer onboarding flow still uses older allowlists in the backend and frontend. Because of that, platforms such as `twitch` and `patreon` are skipped and users see:

`Algumas plataformas ainda nao sao suportadas pela API: twitch, patreon.`

## Goal

Make the API and related frontend save paths support exactly the social platforms that are offered in the influencer onboarding. Do not expand this onboarding flow to every platform in the global API enum.

## Non-Goals

- Do not add support for platforms that are not available in influencer onboarding, such as `github`, `linkedin`, `figma`, `discord`, or `telegram`.
- Do not redesign the onboarding UI.
- Do not change the global Prisma/API enum unless verification shows the onboarding platforms are missing there.
- Do not change public rendering behavior except through successfully saved social links.

## Recommended Approach

Use an onboarding-specific allowlist that matches the frontend onboarding platform list:

`instagram`, `whatsapp`, `tiktok`, `youtube`, `website`, `spotify`, `threads`, `facebook`, `x`, `soundcloud`, `snapchat`, `pinterest`, `patreon`, `twitch`, `applemusic`.

The backend onboarding finalization should validate selected platforms against this allowlist and persist any selected platform from the list when it has a valid normalized URL. The frontend save paths should stop filtering those same platforms as unsupported before calling the API.

## Components

### Backend

Update `src/onboarding/onboarding.service.ts`.

- Keep `PLATFORM_SOCIAL_MAP` scoped to onboarding platform IDs.
- Update `SUPPORTED_SOCIAL_PLATFORMS` to include every platform shown in influencer onboarding.
- Keep the existing normalization rules for handles and URLs.
- Continue returning `skippedPlatforms` only for selected platforms outside the onboarding allowlist.

### Frontend

Update the influencer onboarding and influencer template save helpers.

- `front-bio4dev/src/pages/InfluencerOnboardingPage.tsx` should treat all onboarding platforms as API-supported.
- `front-bio4dev/src/pages/influencers/shared/services.ts` should use the same onboarding-supported set when replacing social links.
- If API TypeScript enums used by the frontend omit onboarding platforms, update them so local typing matches the API contract.

## Data Flow

1. User selects social platforms in influencer onboarding.
2. Frontend normalizes or forwards each selected platform value with its URL.
3. Backend maps each onboarding platform ID to a `Plataforma` enum value.
4. Backend normalizes the URL or handle.
5. Backend persists the social link if the platform is in the onboarding allowlist and the URL is valid.
6. Backend returns `skippedPlatforms` only for invalid or out-of-scope platform IDs.

## Error Handling

- Empty URLs should still be ignored without failing the onboarding.
- Duplicate selected platform IDs should still be de-duplicated.
- Unknown platform IDs should be skipped and returned in `skippedPlatforms`.
- Valid onboarding platforms such as `twitch`, `patreon`, `spotify`, `website`, `threads`, `x`, `soundcloud`, `snapchat`, and `applemusic` should not trigger the unsupported-platform warning.

## Testing

Add or update focused tests around influencer onboarding finalization.

- Verify `twitch` and `patreon` are persisted when selected with valid URLs.
- Verify the full onboarding platform set is accepted.
- Verify an out-of-scope platform still appears in `skippedPlatforms`.
- Run backend tests that cover onboarding and social persistence.

## Acceptance Criteria

- Finalizing influencer onboarding with `twitch` and `patreon` saves both links.
- The unsupported-platform toast no longer appears for any platform offered in the influencer onboarding UI.
- The API remains limited to the onboarding platform set for this specific flow.
- Existing social create/update behavior outside onboarding remains compatible with the current API enum.
