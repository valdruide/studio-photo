# Photo Gallery SaaS

Photo Gallery SaaS is a self-hosted photography portfolio and client gallery platform built with Next.js and PocketBase. It is designed for photographers who need full control over their image pipeline, gallery structure, visibility rules, password-protected access, and admin workflows without relying on third-party media SaaS services.

The current codebase already includes a public gallery, a dedicated admin dashboard, image optimization on upload, password-locked categories and collections, date-filtered statistics, configurable site settings, and a legacy bulk import flow for large libraries.

## Project Goals

- Provide a fast, elegant gallery experience for high-resolution photography
- Keep the infrastructure self-hosted and under full control
- Make day-to-day gallery administration simple for non-technical users
- Support large photo libraries with structured categories, collections, and ordering
- Offer a solid technical base for a future commercial SaaS product

## Current Feature Set

### Public website

- Sidebar-based navigation with:
  - `Home`
  - `About`
  - dynamically loaded categories
  - dynamically loaded collections inside each category
- Public navigation only shows visible categories and visible collections from visible categories
- Optional `All` entry per category, controlled by the category field `allowAll`
- Site-wide dynamic settings loaded from PocketBase:
  - site name
  - portfolio label
  - page title in the header
  - social media links
  - global theme
- Gallery pages:
  - `/{categorySlug}` for the category-wide "All" view
  - `/{categorySlug}/{collectionSlug}` for a single collection
- Masonry grid display for gallery images
- Fullscreen photo viewer with:
  - previous / next navigation
  - slide indicators
  - zoom lens mode
  - mouse wheel lens-size control
  - `Shift + scroll` zoom control
- Rich text descriptions for collections and photos, sanitized before rendering

### Visibility and access control

- Categories can be hidden
- Collections can be hidden
- Photos can be hidden
- Hidden records are excluded from public navigation and public gallery views
- Categories can be protected with a password
- Collections can be protected with a password
- Password-protected access is granted through signed HTTP-only cookies
- Access cookies expire automatically after a configurable TTL
- The "All" category view only includes collections the visitor is actually allowed to access
- Password hashes are stored, never plain text

### Admin dashboard

- Dedicated admin login page
- Protected admin layout that checks the PocketBase auth cookie on the server
- Admin sidebar with:
  - category list
  - drag-and-drop category reordering
  - quick access to statistics
  - settings page
  - help page
  - mass import helper page
- Create category
- Edit category
- Delete category with cascading deletion of its collections and photos
- Create collection inside a category
- Edit collection
- Delete collection with cascading deletion of its photos
- Upload multiple photos at once
- Edit individual photo metadata
- Delete photos
- Drag-and-drop ordering for:
  - categories
  - collections
  - photos

### Category management

- Editable fields:
  - title
  - slug
  - order
  - visibility
  - icon
  - color
  - `allowAll`
  - password protection
- Category icons are selected from a mapped Tabler Icons list
- Category color is configurable in the admin UI
- Category passwords can be changed from the edit page
- Password protection can be disabled, which clears the stored hash

### Collection management

- Editable fields:
  - title
  - slug
  - description
  - category relation
  - order
  - visibility
  - password protection
- Collection descriptions accept HTML and are rendered as rich text on the public site
- Collections can be moved to another category from the admin page
- Collections display password-lock status in the admin table

### Photo management

- Multi-file upload with drag and drop
- Image-only file filtering in the upload dialog
- Automatic upload naming with optional shared prefix
- Shared description applied to all uploaded photos in one batch
- Automatic sequential ordering on upload
- Individual photo editing:
  - name
  - description
  - order
  - visibility
  - collection relation
- Hidden photos are visibly marked in the admin grid

### Settings system

The admin settings page currently supports:

- `site_name`
- `portfolio_name`
- `title`
- social links for:
  - Instagram
  - TikTok
  - Facebook
  - X
  - YouTube
  - Pinterest
  - Dribbble
  - Behance
  - Reddit
- global theme selection

The UI also shows placeholder fields for:

- logo
- favicon

These two are not implemented yet in the current codebase.

### Theme system

The site supports multiple predefined global themes selected from admin settings:

- `default`
- `deep-ocean`
- `forest-veil`
- `uranium`
- `midnight-tokyo`
- `marmalade`
- `coffee`
- `teal-orange`
- `pink-pastel`
- `ivory-light`

The selected theme is applied through the `data-theme` attribute on the root HTML element.

### Statistics

The admin statistics page provides:

- total photo views
- most viewed photo
- best performing category
- best performing collection
- top 10 photos
- least performing photos
- top categories
- top collections

Statistics filters:

- all time
- last 24 hours
- last 7 days
- last 30 days
- custom date range

Statistics behavior:

- every recorded view belongs to one photo, one collection, one category, one visitor, and one time bucket
- the public viewer registers a view when a photo is opened in the fullscreen dialog
- duplicate views are prevented with a unique `viewKey`
- current implementation uses a 10-minute bucket in production logic
- administrator views are ignored when the viewer is authenticated as admin
- locked photos can appear in rankings but are visually masked in the UI unless the admin enables the "Show locked photos" toggle
- hidden categories, hidden collections, and hidden photos are excluded from ranking output

### Mass import helper

The project includes:

- a Node.js script: `scripts/import-pocketbase.mjs`
- a JSON example file: `scripts/import-data.json`
- an admin information page at `/admin/mass-import`

Important note:

The import script is older than the current admin schema. It supports the legacy core content structure well, but newer fields such as category icon, color, `allowAll`, and password options are not fully handled automatically by the script.

## Tech Stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Radix UI primitives
- dnd-kit
- Recharts
- Framer Motion

### Backend and data layer

- PocketBase
- PocketBase file storage
- Next.js Route Handlers
- Node.js runtime for upload / lock / admin routes

### Image processing and utilities

- Sharp
- image-size
- bcryptjs
- sanitize-html
- date-fns
- zod

## Environment Variables

Create a `.env` file with at least the following variables:

```env
NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090
PB_ADMIN_EMAIL=your-pocketbase-admin-email
PB_ADMIN_PASSWORD=your-pocketbase-admin-password
LOCK_ACCESS_SECRET=change-me
LOCK_ACCESS_TTL_SECONDS=1800
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Variable reference

| Variable | Required | Used for |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_PB_URL` | Yes | PocketBase base URL used by public and admin code |
| `PB_ADMIN_EMAIL` | Yes | PocketBase admin/superuser auth for unlock routes and import script |
| `PB_ADMIN_PASSWORD` | Yes | PocketBase admin/superuser auth for unlock routes and import script |
| `LOCK_ACCESS_SECRET` | Strongly recommended | HMAC signing secret for password-access cookies |
| `LOCK_ACCESS_TTL_SECONDS` | Optional | Lifetime of category / collection access cookies |
| `APP_URL` | Optional | Used to infer secure cookie behavior in production |
| `NEXT_PUBLIC_APP_URL` | Optional | Same purpose as above for secure cookie detection |

## Local Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Available scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Application Structure

### Public routes

- `/`
  - current marketing / placeholder-style homepage
- `/about`
  - current about page
- `/{categorySlug}`
  - category "All" page when `allowAll` is enabled
- `/{categorySlug}/{collectionSlug}`
  - collection page

### Admin routes

- `/login`
  - admin login page
- `/admin/settings`
  - global site settings and theme selection
- `/admin/statistics`
  - aggregated photo-view analytics with date filters
- `/admin/help`
  - admin support and FAQ page
- `/admin/mass-import`
  - helper page for the import script
- `/admin/categories/{id}`
  - category editor
- `/admin/collections/{id}`
  - collection editor and photo manager

## Authentication and Security Model

### Admin authentication

- Admin login is handled by `POST /api/admin/login`
- The current implementation authenticates against the PocketBase collection `admin_users`
- On successful login, PocketBase auth is exported to an HTTP-only cookie
- Admin pages verify the auth cookie server-side
- Admin logout clears the `pb_auth` cookie

### Password-locked galleries

- Category and collection locks use `lockedByPassword` plus `passwordHash`
- Password verification uses `bcryptjs`
- After a successful unlock:
  - category access is stored in `cat_access_{categoryId}`
  - collection access is stored in `col_access_{collectionId}`
- Access cookies are:
  - signed with HMAC-SHA256
  - HTTP-only
  - time-limited
  - scoped to `/`
- The signed token payload contains:
  - type
  - target record id
  - expiration timestamp

### Rich text sanitization

Collection and photo descriptions are sanitized before rendering. Allowed content includes common formatting tags such as:

- paragraphs
- headings
- lists
- blockquotes
- links
- code / preformatted blocks
- limited `span` styling

Unsafe protocols such as `javascript:` are blocked.

## Database Architecture

The project is centered on PocketBase. The codebase currently depends on the following collections.

### `categories`

Top-level gallery grouping.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `slug` | `string` | Yes | Public URL slug for the category |
| `title` | `string` | Yes | Display title |
| `order` | `number` | Yes | Manual ordering value |
| `isHidden` | `boolean` | Yes | Hides the category from public navigation and public pages |
| `icon` | `string` | Yes in practice | Tabler icon name used in the public sidebar |
| `color` | `string` | Yes in practice | Display color for the category icon / label |
| `allowAll` | `boolean` | Yes | Enables the `/{categorySlug}` "All" route |
| `lockedByPassword` | `boolean` | Yes | Enables password protection |
| `passwordHash` | `string` | Conditional | Bcrypt hash stored when password protection is enabled |

Behavior notes:

- Creating a category auto-generates the slug if omitted
- If the slug already exists, the API retries with a random suffix
- If no order is provided, the API appends the category at the end
- Deleting a category deletes all child collections and all child photos

### `photo_collections`

Child grouping inside a category.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `slug` | `string` | Yes | Public URL slug for the collection |
| `title` | `string` | Yes | Collection title |
| `description` | `string / HTML` | No | Rich text HTML description |
| `category` | `relation -> categories` | Yes | Parent category |
| `order` | `number` | Yes | Manual ordering inside the category |
| `isHidden` | `boolean` | Yes | Hides the collection from public navigation and public pages |
| `lockedByPassword` | `boolean` | Yes | Enables password protection |
| `passwordHash` | `string` | Conditional | Bcrypt hash stored when protection is enabled |

Behavior notes:

- Collections are ordered per category
- The API auto-generates the slug from the title
- If no order is provided, the API appends the collection at the end of its category
- Deleting a collection deletes all photos inside it
- A collection can be reassigned to another category from the admin editor

### `photos`

Individual uploaded images.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `collection` | `relation -> photo_collections` | Yes | Parent collection |
| `name` | `string` | Yes | Display name |
| `description` | `string / HTML` | No | Rich text HTML description |
| `image` | `file` | Yes | Uploaded image file |
| `order` | `number` | Yes | Manual ordering inside the collection |
| `isHidden` | `boolean` | Yes | Hides the photo from public views |
| `width` | `number` | Yes | Stored output width after processing |
| `height` | `number` | Yes | Stored output height after processing |

Behavior notes:

- Multi-upload starts at the current last order + 1
- Uploaded images are optimized to JPEG before record creation
- Width and height are generated automatically during upload
- Photos can be reordered from the admin grid
- Photos can be moved to another collection from the edit API

### `site_settings`

Single-record settings collection used by both the public site and the admin panel.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `site_name` | `string` | No | Sidebar brand label |
| `portfolio_name` | `string` | No | Label for the category / collection navigation block |
| `title` | `string` | No | Header title shown in the public layout |
| `instagram` | `string` | No | Social URL |
| `tiktok` | `string` | No | Social URL |
| `facebook` | `string` | No | Social URL |
| `x` | `string` | No | Social URL |
| `youtube` | `string` | No | Social URL |
| `pinterest` | `string` | No | Social URL |
| `dribbble` | `string` | No | Social URL |
| `behance` | `string` | No | Social URL |
| `reddit` | `string` | No | Social URL |
| `site_theme` | `string` | No | Selected theme name |

Behavior notes:

- The API always reads the first record of this collection
- If no settings record exists yet, the admin `PATCH` route creates one
- Theme validation falls back to the default theme if an unknown value is stored

### `photos_statistics`

Analytics collection used to track unique viewer opens.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `photo` | `relation -> photos` | Yes | Viewed photo |
| `collection` | `relation -> photo_collections` | Yes | Parent collection at the time of the event |
| `category` | `relation -> categories` | Yes | Parent category at the time of the event |
| `visitorId` | `string` | Yes | Browser-level visitor identifier stored in localStorage |
| `viewKey` | `string` | Yes | Uniqueness key used to deduplicate repeated opens within one time bucket |
| `created` | `datetime` | Auto | Event creation date used for date filtering |

Recommended PocketBase constraint:

- `viewKey` should be unique

### `admin_users`

Used by the custom admin login route.

Expected capability:

- email/password authentication for dashboard access

### PocketBase superusers / `_superusers`

The unlock routes authenticate using PocketBase superuser credentials from:

- `PB_ADMIN_EMAIL`
- `PB_ADMIN_PASSWORD`

This is separate from the `admin_users` collection used by dashboard login.

## Image Pipeline

### Upload flow

When photos are uploaded from the admin dashboard:

1. files are read from the browser
2. each image is passed through `sharp`
3. EXIF orientation is normalized with `.rotate()`
4. the image is resized to fit within `3000x3000`
5. the output is converted to JPEG
6. JPEG quality is set to `85`
7. width and height are extracted and stored in the `photos` record
8. the optimized file is uploaded to PocketBase

### Thumbnails

The app expects PocketBase thumb presets to match [`lib/pb/thumbs.ts`](./lib/pb/thumbs.ts):

```ts
export const PB_THUMBS = {
    blur: '32x0',
    grid: '320x0',
    modal: '2000x2000f',
} as const;
```

Important:

The README and the code both assume that the `image` file field in PocketBase is configured with matching thumbnail sizes.

## Statistics Implementation Details

### How a view is registered

- A local visitor id is stored in `localStorage` under `portfolio_visitor_id`
- When a user opens a photo in the fullscreen dialog, the frontend calls `/api/public/stats/photo-view`
- The route builds a bucketed key:
  - current production logic: 10-minute buckets
  - a 10-second helper exists in code for local testing
- If the same visitor opens the same photo inside the same bucket, the unique `viewKey` prevents a second record

### How admin analytics are computed

`getStatisticsOverview()`:

- loads all visible photos
- loads all statistic records for the selected date range
- excludes hidden categories, collections, and photos
- counts views per photo, per collection, and per category
- computes:
  - total views
  - most viewed photo
  - best category
  - best collection
  - top photos
  - least viewed photos
  - top collections
  - top categories

## Import Script

### File

- `scripts/import-pocketbase.mjs`

### What it currently does

- authenticates to PocketBase
- reads `scripts/import-data.json`
- upserts categories by slug
- upserts collections by slug
- uploads photos from local paths
- optionally converts / compresses large images
- stores width and height metadata
- skips duplicate photos based on `(collection + order)`

### What it does not fully cover anymore

The import script does not fully reflect every newer admin field. In particular, verify or extend it before production imports if you depend on:

- category icon
- category color
- `allowAll`
- password protection fields
- any newer schema customizations

### Example JSON structure

```json
{
    "categories": [
        {
            "slug": "portraits",
            "title": "Portraits",
            "order": 1,
            "isHidden": false,
            "collections": [
                {
                    "slug": "studio-session",
                    "title": "Studio Session",
                    "descriptionHtml": "<p>Describe the collection here.</p>",
                    "order": 1,
                    "isHidden": false,
                    "photos": [
                        {
                            "file": "public/series/studio-session/photo-01.jpg",
                            "name": "Hero shot",
                            "descriptionHtml": "<p>Optional HTML description.</p>",
                            "order": 1,
                            "isHidden": false
                        }
                    ]
                }
            ]
        }
    ]
}
```

## Known Implementation Notes

- The homepage and about page currently contain handcrafted placeholder/editorial content rather than fully settings-driven CMS content
- Logo upload and favicon upload are displayed as "Coming soon" in admin settings and are not implemented yet
- The mass import page is a guide and generator; it does not execute imports itself
- The statistics page uses localized `fr-FR` date formatting in the current UI
- The codebase contains a few mixed legacy assumptions around PocketBase auth:
  - dashboard login uses `admin_users`
  - unlock/import flows use PocketBase admin or superuser credentials

## Deployment Notes

- This project is intended to run with a self-hosted PocketBase instance
- File storage is handled by PocketBase itself
- `docker-compose.yml` and `Dockerfile` are present in the repository, but the README should still be validated against your final deployment topology before production rollout

## License

This project is proprietary and not open-source.

## Status

Actively developed.
