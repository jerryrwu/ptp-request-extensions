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
- Comment ordering is breaking comment permalinks. They scroll to their (previous) position
- Some styling misconfigurations/missing
