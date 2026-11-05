# Group Project


## Team Roster

| Name | GitHub Username |
|------|-----------------|
| Malachi Flynn | [@MalachiAflynn](https://github.com/MalachiAflynn) |
| Caleb Richards | [@CalebUmass](https://github.com/CalebUmass) |
| Maryamawit Gebremedhen | [@gebremedhen-mari](https://github.com/gebremedhen-mari) |
| Lenny Doiron | [@LennartDoiron](https://github.com/LennartDoiron) |


## Working Agreement

- **Communication.** We use a group SMS thread for daily updates and blockers,
  and check it at least once a day. Anything needing more than a few texts moves
  to Zoom.
- **Definition of done.** A PR is done when it passes review from at least one
  teammate who is not the author and is up to date with `main`. No self-merging.
- **Review turnaround.** We review open PRs within 24 hours.
- **Disagreements.** We discuss in the PR thread first. If it stalls, we settle it
  on a Zoom call by majority vote and move on.

## Project domain

We are planning on building a webapp that is a mobile version of a UMass camous lost and found. We did some research about campus lost and found, and saw that there are many different sites to find lost items. The domain would be all of campus, but just a centralized system. This would benefit UMass students and faculty alike making tracking down lost items much less of a headache.

## Getting Started

To run the project locally:

1. Clone the repository:
   `git clone https://github.com/MalachiAflynn/group-project.git`

2. Go into the project folder and open it in the dev container:
   `cd group-project`

3. Copy the example env file:
   `cp .env.example .env`

4. Start the database:
   `dc-up mongo`

5. Install the required dependencies:
   `npm install`

6. Build the CSS:
   `npm run build:css`

7. Start the server:
   `npm start`
   You should see "Connected to MongoDB" in the terminal.

8. Open `http://localhost:3000` in your browser.

## System Diagram

```
Browser (form + public/app.js fetch)
        |
        |  POST /lost  or  POST /found  (JSON)
        v
routes/lost.js | routes/found.js        -> wires paths to controller functions
        |
        v
controllers/lostController.js | foundController.js   -> req/res <-> service
        |
        v
services/lostService.js | foundService.js           -> validation (400 on bad input)
        |
        v
repositories/lostRepository.js | foundRepository.js -> only layer that touches the DB
        |
        v
models/LostItem.js | FoundItem.js (Mongoose)  ->  MongoDB (dev container)

__tests__/lostService.test.js (Jest) -> runs services/lostService.js with
                                        lostRepository mocked, so no database is used

src/input.css -> Tailwind build (npm run build:css) -> public/style.css, linked by the views

HTMX: DELETE /lost/:id and /found/:id return an empty 200, and HTMX swaps out that item's <li>

Errors at any layer -> asyncHandler -> middleware/errorHandler.js -> JSON error response
```

## Sprint 3: Tests and Styling

### Jest tests for the Lost service

The tests are in `__tests__/lostService.test.js`. They cover the two ways `services/lostService.js` can reject something: a required field that's missing or empty (or no body at all) gets a 400, and trying to delete an item that doesn't exist gets a 404. We mock the repository with `jest.unstable_mockModule`, so you don't need MongoDB running to use them.

To run them, use `npm test`.

### Tailwind restyle

We restyled the Lost and Found pages with Tailwind utility classes right in the views. Run `npm run build:css` to build `src/input.css` into `public/style.css`. Any styling changes should go in the views or `src/input.css`, since the build overwrites `public/style.css`.

To see the layout change, open `/lost` or `/found` and resize your browser window:

- **Phone (375 px):** the form sits on top of the item list, all in one column.
- **`sm:` (640 px and up):** the short form fields sit side by side, and the items go into two columns.
- **`lg:` (1024 px and up):** the form moves to the left, with the items next to it.

The header uses UMass maroon, and each item looks like a manila tag you'd see on something in a lost and found bin.

### MongoDB repository

Both repositories now use per record operations instead of loading and saving a whole list:
`getAll`, `findById`, `create`, `updateById` and `removeById`. These are in
`repositories/lostRepository.js` and `repositories/foundRepository.js`, and they are still the
only files that touch the database. Every route hits MongoDB through them:
`GET /lost` and `GET /found` list items, `POST /lost` and `POST /found` create one, and
`DELETE /lost/:id` and `DELETE /found/:id` remove one. An invalid id returns `null` from the
repository, so the service sends a 404 instead of the server sending a 500.

### HTMX delete

Each item on the Lost and Found pages has a Delete button that uses HTMX instead of a full page
reload. The button has `hx-delete="/lost/<id>"` (or `/found/<id>`), and the server responds with
an empty 200, so HTMX swaps that one item out of the list. To see it, open `/lost` or `/found`
and click Delete on an item. It disappears without the page reloading.

### The honest exception

Swapping the repository did not require changing other layers, with one exception: the views
and client JS now need the real MongoDB id. The Delete buttons in `views/lost.ejs`,
`views/found.ejs` and new items created in `public/app.js` use `item._id` to build the
`hx-delete` URL, since there is no list position to use.

## Features

Lost is for someone who lost something. They post what it is and where they lost it, so a finder can contact them.
Found is for someone who found something. They post what they picked up, so the owner can contact them.
Both pages show every report so people who have lost/found items can contact each other.

### Routes

| Method | Path     | What it does |
|--------|----------|--------------|
| GET    | `/`      | Redirects to `/lost`. |
| GET    | `/lost`  | Shows the Lost page with the report form and all lost items, newest being first. |
| POST   | `/lost`  | Saves a lost item. Returns `201` with the saved item, or `400` with an error message if a required field is missing. |
| GET    | `/found` | Shows the Found page with the report form and all found items, newest being first. |
| POST   | `/found` | Saves a found item. Returns `201` with the saved item, or `400` with an error message if a required field is missing. |

### The Form

There are seven fields to fill out in the form. There are five which 
are required: item name, category, location, contact name and email. Description and Date are optional. In addition, an empty date becomes today.

### After You Submit

`app.js` sends the form with fetch, the server checks and saves it, and then one of three things can happen: the item appears at the top and the form clears, the server's error message is shown in red, or "Could not reach the server." shows.

## Design Decisions

### Maryamawit Gebremedhen — Found Backend

 For the Found backend, I decided to check all required fields and return one error message listing everything that is missing. i was chooseing between that stopping checking as soon as the first missing field was found. That would have been easier, but the user would have to keep submitting the form to find out what else was missing. the reason I chose to check all fields at once is because makes feedback more clear and makes it easier to fix the form, even though it takes a little more code.

### Lenny Doiron — Lost Backend

For the Lost backend, I put the required field check in lostService.js instead of adding `required: true` to the Mongoose model. The service throws a 400 that names the missing fields, so the user sees exactly what to fix. With the mongoose option, the error has no status, so our error handler would send a 500 with "Something went wrong on the server." and the user wouldn't know which field was missing.

### Lenny Doiron — Lost Service Tests

For the Lost service tests, I mocked the repository with `jest.unstable_mockModule` instead of connecting to a real test database. This lets the tests go straight at the service rules: each required field is checked for a 400, and deleting an item that doesn't exist is checked for a 404. With a real database, `npm test` would need MongoDB running, and a stopped database would make the tests fail even when the service code was fine.

### Malachi Flynn - Foundation

In server.js, I made the app connect to MongoDB before it starts listening, and exit with a clear error if the connection fails. The alternative was to start listening right away and let Mongoose connect in the background. That would start faster, but if the database was down the server would still look like it was running, and every form submission would fail with a confusing error. Connecting first means a bad connection string or a stopped database shows up immediately as "Could not connect to MongoDB" instead of later on someone's request.

### Caleb Richards - Lost/Found Frontend

In app.js I made the design decision to use one submit handler for both forms, which reads the URL from `form.dataset.endpoint`. The alternative to this method would be to use a separate script for each of the lost and found pages. I chose this way because it keeps all of the submit logic in one place. With two separate scripts, a fix to how errors are shown (like displaying a 400 message or a network failure) could be made on the Lost page and forgotten on the Found page, so the two forms would behave differently. With one handler, if a bug comes up or we want to change how we submit items, we only have to change it once.

### Malachi Flynn - Sprint 3 Lost Repository
For updateById in the Lost repository, I passed two options to Mongoose's findByIdAndUpdate: returnDocument "after" and runValidators true. The alternative was to use the defaults, which is less code. But by default Mongoose returns the item as it was before the update, so anything that shows the result, like a future "mark as claimed" button, would show old data right after a change. Mongoose also skips schema checks on updates by default, so an update could save a value the schema would reject on create. Setting both options means updateById returns what is actually in the database and follows the same rules as create. The cost is that an update with a bad value now fails instead of quietly saving, so the service will need to handle that error.