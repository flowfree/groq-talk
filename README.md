ChatGPT Clone
=============
A ChatGPT clone built with [Next.js](https://nextjs.org/) and [Vercel AI SDK](https://sdk.vercel.ai/docs). 


## Prerequisites
This project depends on some software and third-party services.

1.  Make sure you already have Node.js and PostgreSQL installed on your machine.

1.  Under the hood, this app will make requests to the Chat Completions API, so you need to get your [OpenAI API key](https://platform.openai.com/docs/quickstart/step-2-setup-your-api-key).

1.  The app is using Github and Google for authentication using OAuth2. You need to to get the OAuth2 client ID and secret for [Github](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) and [Google](https://developers.google.com/identity/protocols/oauth2).

1.  An email server for sending emails e.g: SendGrid.


## Running on development machine
After cloning this repo, follow these steps:

1.  Connect to your PostgreSQL server and create new database and user:

        CREATE DATABASE chatgpt_clone;
        CREATE USER chatgpt_clone WITH PASSWORD '<your password>';
        GRANT ALL PRIVILEGES ON chatgpt_clone TO chatgptp_clone;

1.  Copy the `.env.local_sample` to `.env.local` and fill in all of the values.

1.  Install the dependencies:

        npm install

1.  Run the database migrations:

        npx prisma migrate dev

    The command will create the tables in your PostgreSQL database. Note that the command being used is `npx` instead of `npm`.

1.  Run the development server:

        npm run dev

You can open the app on `http://localhost:8000` using your browser.


## License
MIT
