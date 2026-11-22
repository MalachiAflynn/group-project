# Group Project

## Team Roster

| Name                   | GitHub Username                                          |
| ---------------------- | -------------------------------------------------------- |
| Malachi Flynn          | [@MalachiAflynn](https://github.com/MalachiAflynn)       |
| Caleb Richards         | [@CalebUmass](https://github.com/CalebUmass)             |
| Maryamawit Gebremedhen | [@gebremedhen-mari](https://github.com/gebremedhen-mari) |
| Lenny Doiron           | [@LennartDoiron](https://github.com/LennartDoiron)       |

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
db.js -> connectDB() opens the Mongoose connection (MONGODB_URI), called by server.js at startup

GET /health -> routes/health.js -> controllers/healthController.js -> {"status":"ok"}
               (set up before the login code, so no login needed)

__tests__/lostService.test.js (Jest) -> runs services/lostService.js with
                                          lostRepository mocked, so no database is used

__tests__/foundServiceRules.test.js (Jest) -> runs services/foundService.js with
                                          foundRepository mocked

tests/foundService.test.js (Jest) -> runs services/foundService.js with
                                          foundRepository mocked (whitespace fields, delete 404)

__tests__/healthController.test.js (Jest) -> tests getHealth, no database needed


src/input.css -> Tailwind build (npm run build:css) -> public/style.css, linked by the views

HTMX: DELETE /lost/:id and /found/:id return an empty 200, and HTMX swaps out that item's <li>

Errors at any layer -> asyncHandler -> middleware/errorHandler.js -> JSON error response
```

## Sprint 3: Tests and Styling

### Jest tests for the Lost service

The tests are in `__tests__/lostService.test.js`. They cover the two ways `services/lostService.js` can reject something: a required field that's missing or empty (or no body at all) gets a 400, and trying to delete an item that doesn't exist gets a 404. We mock the repository with `jest.unstable_mockModule`, so you don't need MongoDB running to use them.

The Found service tests in `__tests__/foundServiceRules.test.js` cover the Found rules the same way: a required field that is only spaces gets a 400, and deleting a found item that doesn't exist gets a 404.

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

## Sprint 4: Login, Authorization, Accessibility and Health Check

### Signing up and logging in

### Signing up and logging in

We used **express-session** with sessions stored in MongoDB through **connect-mongo**, not tokens. When you log in, the server keeps your session in the database and your browser only gets a signed session cookie (`connect.sid`). The cookie is `httpOnly` (page JavaScript can't read it), `sameSite: "lax"`, and lasts one day. We picked sessions because logging out actually ends the session on the server, and the browser never holds anything it could leak. The session secret is `SESSION_SECRET` in `.env` (see `.env.example`).

Passwords are hashed with bcrypt before they are saved, so the database only has `passwordHash`, never the password itself.

To try it:

1. Go to `/signup` and make an account. The username needs at least 3 characters (it is saved in lowercase) and the password at least 8. **Expect** to land on `/lost` with "Logged in as <your name>" in the header.
2. Try signing up again with the same username. **Expect** "Username already taken".
3. Click Log out. **Expect** to go to `/login`, and the header shows the login and signup links again.
4. Log in at `/login` with a wrong password. **Expect** "Username or password invalid". You get the same message for a username that doesn't exist, so the form doesn't reveal which usernames are taken.
5. Log in with the right password. **Expect** to land on `/lost`, logged in.

### Making an admin account

Every new account is a `member`. The signup form never reads a role, so nobody can make themselves an admin by changing the form. The only way to get an admin is the make-admin script, run by someone who has access to the server and its `.env`:

1. Sign up for the account normally at `/signup` (the script only changes an existing user).
2. Run `npm run make-admin -- <username>`. **Expect** `<username> is now an admin`. If the name is wrong you'll see `No user named <username>`.
3. If that user is logged in, they need to log out and log back in. The role is saved in the session at login, so the change only shows up after a new login.



### Testing the authorization rule

Only the person who posted a Lost or Found item, or an admin, can delete it. The check happens in two places:

- **Route:** `requireLogin` on `DELETE /lost/:id` and `DELETE /found/:id` checks that someone is logged in at all. If not, the request gets a `401`.
- **Service:** `removeLostItem` and `removeFoundItem` load the item first, then call `isOwnerOrAdmin` (in `services/ownership.js`). If the user is not the owner or an admin, they get a `403` and nothing is deleted.

The owner is set by the server from the logged-in user when an item is posted, so an `owner` field sent in the form is ignored. Items posted before Sprint 4 have no owner, so only an admin can delete them.

To check it with two accounts:

1. Sign up as `alice` at `/signup`, post a Lost item, then log out.
2. Sign up as `bob`, go to `/lost` and click Delete on alice's item. **Expect `403`:** the item stays and the page shows "You can only delete lost items you posted".
3. Log out and make bob an admin with `npm run make-admin -- bob`. Log back in as bob (the role is saved when you log in, so a user who was already logged in has to log in again after the script). Delete alice's item. **Expect `200`:** the item disappears.
4. Log in as alice, post another item and delete it. **Expect `200`:** the item disappears.
5. Log out and try a delete without a login: `curl -i -X DELETE http://localhost:3000/lost/<item id>` (the id is in the Delete button's `hx-delete` attribute in the page source). **Expect `401`** with `{"error":"You must be logged in"}`.

The same steps work on `/found`. `npm test` checks the same rule without a database, in `__tests__/lostService.test.js` and `__tests__/foundServiceRules.test.js`.

### Accessibility audit

_TODO: add once the audit is done._

### Health check

`GET /health` sends back `{"status":"ok"}` so you can check that the app is running. You don't need to be logged in. Start the server and run:

```bash
curl -i -w '\n' http://localhost:3000/health
```

You should see `200 OK`, `Content-Type: application/json`, and `{"status":"ok"}` at the bottom. On Windows PowerShell, use `curl.exe` instead of `curl`.

The route is set up at the top of `server.js`, before any of the login code, so it always works. `npm test` also runs a test for it in `__tests__/healthController.test.js`.

## Features

Lost is for someone who lost something. They post what it is and where they lost it, so a finder can contact them.
Found is for someone who found something. They post what they picked up, so the owner can contact them.
Both pages show every report so people who have lost/found items can contact each other.

### Routes

| Method | Path     | What it does                                                                                                          |
| ------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`      | Redirects to `/lost`.                                                                                                 |
| GET    | `/lost`  | Shows the Lost page with the report form and all lost items, newest being first.                                      |
| POST   | `/lost`  | Saves a lost item. Returns `201` with the saved item, or `400` with an error message if a required field is missing.  |
| GET    | `/found` | Shows the Found page with the report form and all found items, newest being first.                                    |
| POST   | `/found` | Saves a found item. Returns `201` with the saved item, or `400` with an error message if a required field is missing. |

### The Form

There are seven fields to fill out in the form. There are five which
are required: item name, category, location, contact name and email. Description and Date are optional. In addition, an empty date becomes today.

### After You Submit

`app.js` sends the form with fetch, the server checks and saves it, and then one of three things can happen: the item appears at the top and the form clears, the server's error message is shown in red, or "Could not reach the server." shows.

## Design Decisions

### Maryamawit Gebremedhen — Found Backend

For the Found backend, I chose to check all required fields and return one error message listing everything that is missing. i was chooseing between that stopping checking as soon as the first missing field was found. That would have been easier, but the user would have to keep submitting the form to find out what else was missing. the reason I chose to check all fields at once is because makes feedback more clear and makes it easier to fix the form, even though it takes a little more code.

### Lenny Doiron — Lost Backend

For the Lost backend, I put the required field check in lostService.js instead of adding `required: true` to the Mongoose model. The service throws a 400 that names the missing fields, so the user sees exactly what to fix. With the mongoose option, the error has no status, so our error handler would send a 500 with "Something went wrong on the server." and the user wouldn't know which field was missing.

### Lenny Doiron — Lost Service Tests

For the Lost service tests, I mocked the repository with `jest.unstable_mockModule` instead of connecting to a real test database. This lets the tests go straight at the service rules: each required field is checked for a 400, and deleting an item that doesn't exist is checked for a 404. With a real database, `npm test` would need MongoDB running, and a stopped database would make the tests fail even when the service code was fine.

### Lenny Doiron — Sprint 4 Health Check

I put `GET /health` at the top of `server.js`, before the session middleware and `requireLogin`. The other option was to put it with the rest of the routes and add an exception for `/health` inside `requireLogin`. That would keep all the routes together, but every health check would go through the session store and hit MongoDB just to say the app is running. The exception would also be easy to break, since someone changing `requireLogin` later might not know the health check depends on it. Putting it first means it never needs a login and never touches the database.

### Malachi Flynn - Foundation

In server.js, I made the app connect to MongoDB before it starts listening, and exit with a clear error if the connection fails. The alternative was to start listening right away and let Mongoose connect in the background. That would start faster, but if the database was down the server would still look like it was running, and every form submission would fail with a confusing error. Connecting first means a bad connection string or a stopped database shows up immediately as "Could not connect to MongoDB" instead of later on someone's request.

### Sprint 2: Caleb Richards - Lost/Found Frontend

In app.js I made the design decision to use one submit handler for both forms, which reads the URL from `form.dataset.endpoint`. The alternative to this method would be to use a separate script for each of the lost and found pages. I chose this way because it keeps all of the submit logic in one place. With two separate scripts, a fix to how errors are shown (like displaying a 400 message or a network failure) could be made on the Lost page and forgotten on the Found page, so the two forms would behave differently. With one handler, if a bug comes up or we want to change how we submit items, we only have to change it once.

### Sprint 3 — Maryamawit Gebremedhen

I added CRUD operations to the Found repository using Mongoose. Instead of putting the database operations directly into the service layer, I decided to keep them in the repository. The reason I went with this option was that I could test the Found service by mocking the repository without needing a live MongoDB connection. Also, putting the database logic in the service would have made testing harder because I would've to connect to an actual database or mock Mongoose.

### Sprint 3: Caleb Richards - HTMX Feature

In found.ejs I made the design decision to add an HTMX delete button that uses the item's MongoDB `_id` and has the server send back an empty 200, so `hx-target="closest li"` and `hx-swap="outerHTML"` remove the item that was clicked. A different approach to this would to have the delete route render the whole list again and swap the entire `<ul>`. I chose this way because when you delete an item only that one item changes. There is no reason to rebuild the rest of the page. If I went with that way, every delete would need an extra `findAll()` query to MongoDB and we would have to make a separate partial template for the list that both the page and the route share. With the empty response, the controller stays one line and the rest of the list is left alone.

### Malachi Flynn - Sprint 3 Lost Repository

For updateById in the Lost repository, I passed two options to Mongoose's findByIdAndUpdate: returnDocument "after" and runValidators true. The alternative was to use the defaults, which is less code. But by default Mongoose returns the item as it was before the update, so anything that shows the result, like a future "mark as claimed" button, would show old data right after a change. Mongoose also skips schema checks on updates by default, so an update could save a value the schema would reject on create. Setting both options means updateById returns what is actually in the database and follows the same rules as create. The cost is that an update with a bad value now fails instead of quietly saving, so the service will need to handle that error.

### Sprint 4, Malachi Flynn - Ownership Check in the Service

I put the ownership check inside the service: `removeLostItem` and `removeFoundItem` load the item, then call `isOwnerOrAdmin` before deleting it. The alternative was a route-level middleware like `requireOwner` on the delete routes that loads the item and compares owners before the controller runs. That would leave the services unchanged, but the middleware would have to know which model to load for each route, so it would either skip the service layer and call the repositories directly or need a separate copy for Lost and Found. It would also load the item twice, once to check it and once to delete it. Keeping the check in the service means it runs on the same item that gets deleted, and our Jest tests can check the 403 by calling the service with a fake user and a mocked repository. The alternative would have cost duplicate loading code, and a rule that is easy to skip: if someone adds a new route later, like a "mark as claimed" update, and forgets the middleware, anyone could change anyone's item.

### Sprint 4, Caleb Richards - Authorization (Sessions Instead of Tokens)
For login I used express-session with the sessions stored in MongoDB through connect-mongo, instead of a token scheme like a JWT. With a JWT, the server signs a token holding the user's id and role and the browser sends it back on every request, so the server doesn't have to look anything up or store sessions at all. That is the main thing tokens would have saved us: one database read per each request and the connect-mongo dependency. But a JWT stays valid until it expires, so logging out only deletes the browser's copy, and a stolen token keeps working. Ending it for real would mean keeping a blocklist of revoked tokens in the database, which brings back the lookup we were trying to avoid. The token would also have to be stored somewhere, and if it went in localStorage, any script on the page could read it. With sessions, logout calls `req.session.destroy()` and the session is gone on the server. The browser only holds a random session id in an `httpOnly` cookie that page JavaScript can't read, and `req.session.regenerate()` gives a fresh id at every login. For a small app with one server and a database we already run, an extra lookup per request costs much less than writing token revocation ourselves.