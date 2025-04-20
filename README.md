# Frontend of Checklist application

This repo contains the frontend of the Checklist application implemented in React.

After starting the container, creating and editing checklists will be available at your ip address at port 3000 or `http://localhost:3000`. If running the docker container is unfeasible, dev mode can be run with `npm start`.

Frontend logic includes robust error handling for server and input error.

## Creating new category

Insert a non-empty string into the input field and click Add category

## Save a new checklist

Once satisfied with the checklist, clicking Save as a new checklist will save the checklist to the database as a new entry

## Update existing checklist

Clicking Update existing checklist overwrites the existing checklist with the current checklist id with what's currently on the screen

## Load checklist

Clicking Load checklist displays a box where a particular checklist can be requested with its checklist id. The available ids are displayed.

After loading a checklist, it can be cloned it Save as new checklist is clicked, creating a separate copy of the clone in the database with a unique checklist id. The loaded checklist can also be edited by modifying categories/files and clicking Update existing checklist.

## Third party sharing

A unique URL is created for each checklist in the database. To interact with existing checklists, use `http://localhost:3000/view/<id>` where id is the checklist id. New files are able to be added and renamed, but the existing structure cannot be modified in this route. To update the checklist, click Update checklist.

## Execution

Build docker image
`docker build -t checklist-frontend .`

Run container
`docker run -p 3000:80 checklist-frontend`