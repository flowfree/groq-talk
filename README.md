Groq Talk
=========
Chat with advanced LLM models using the [Groq API](https://console.groq.com/docs/quickstart).

## Prerequisites
This project depends on some software and third-party services.

1.  Make sure you already have Node.js and PostgreSQL installed on your machine.

1.  Under the hood, this app will make requests to the Groq API, so you need to get your [Groq API key](https://console.groq.com/keys).

1.  The app is using Github and Google for authentication using OAuth2. You need to to get the OAuth2 client ID and secret for [Github](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) and [Google](https://developers.google.com/identity/protocols/oauth2).

1.  An email server for sending emails e.g: SendGrid.


## Running on development machine
After cloning this repo, follow these steps:

1.  Connect to your PostgreSQL server and create new database and user:

        CREATE DATABASE grok_talk;
        CREATE USER grok_talk WITH PASSWORD '<your password>';
        GRANT ALL PRIVILEGES ON DATABASE grok_talk TO grok_talk;

1.  Copy the `.env.local_sample` to `.env.local` and fill in all of the values.

1.  Install the dependencies:

        npm install

1.  Run the database migrations:

        npx prisma migrate dev

    The command will create the tables in your PostgreSQL database. Note that the command being used is `npx` instead of `npm`.

1.  Run the development server:

        npm run dev

You can open the app on `http://localhost:8002` using your browser.


## License
MIT
