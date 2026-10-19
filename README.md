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

2. Go into the project folder:
   `cd group-project`

3. Install the required dependencies:
   `npm install`

4. Set up the database:
   - Copy the example env file: `cp .env.example .env`
   - Put the team's MongoDB Atlas connection string in `.env` as `MONGODB_URI`
     (ask a teammate for it; it is never committed).

5. Start the server:
   `npm start`
   You should see "Connected to MongoDB" in the terminal.

6. Open `http://localhost:3000` in your browser.

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
models/LostItem.js | FoundItem.js (Mongoose)  ->  MongoDB Atlas

Errors at any layer -> asyncHandler -> middleware/errorHandler.js -> JSON error response
```

## Design Decisions

### Maryamawit Gebremedhen — Found Backend

 For the Found backend, I decided to check all required fields and return one error message listing everything that is missing. i was chooseing between that stopping checking as soon as the first missing field was found. That would have been easier, but the user would have to keep submitting the form to find out what else was missing. the reason I chose to check all fields at once is because makes feedback more clear and makes it easier to fix the form, even though it takes a little more code.