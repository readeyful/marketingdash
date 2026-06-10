# Project notes

- After completing and pushing any task, always end the reply with the commands the user needs to update their local prototype, e.g.:

  ```bash
  # in the terminal running the dev server: press Ctrl+C, then
  git pull origin claude/eager-planck-lubzo5
  npm install   # only needed if package.json changed
  npm run dev
  ```

  Then refresh the browser. Mention `npm install` only when dependencies changed.
