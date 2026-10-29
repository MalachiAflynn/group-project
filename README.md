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

6. Start the server:
   `npm start`
   You should see "Connected to MongoDB" in the terminal.

7. Open `http://localhost:3000` in your browser.

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

Errors at any layer -> asyncHandler -> middleware/errorHandler.js -> JSON error response
```

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

### Malachi Flynn - Foundation

In server.js, I made the app connect to MongoDB before it starts listening, and exit with a clear error if the connection fails. The alternative was to start listening right away and let Mongoose connect in the background. That would start faster, but if the database was down the server would still look like it was running, and every form submission would fail with a confusing error. Connecting first means a bad connection string or a stopped database shows up immediately as "Could not connect to MongoDB" instead of later on someone's request.
