# ptp-request-extensions
Extensions for the Requests feature.

Features:
- Cached API calls
- Styling for: Dates, Sizes, Tags(Source exists, Any source, Purchasable)
- User-set ratio limit for request voting
- 'Verbose' metadata
  - 'Exists' hyperlink formatted to 'Name[Year] - Format/Container...'
  - Movie details mirrored from parent

Currently works on the following:
- User record view
- Request create form
- Request record view
- Request list view
- Torrent record view

Configure:
Go to the record list view. There should be a "Requests config" button in the linkbox

Known issues:
- Some styling missing
- Some features not configurable (Check boolean constants in code)
- Requests comments reversal might be broken when using infinite scroll, or changing pages

Changelog:
Added PTP-Infinite-Scroll compatibility
- Added event listener for node inserts
- Applies changes based of those inserts
- May not cover every instance of infinite scroll...
- Known issue is with request comments + order reversal

Changelog:
- Fixed window position problem from reordering comments
- Added Filled and Golden Popcorn styling in the request record view