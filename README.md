# Strapi Upload Provider for Supabase Storage

This custom provider allows you to use Supabase for storing your uploads in a Strapi v4 application. It leverages Supabase's storage capabilities to handle file uploads and deletions.

## Prerequisites

- Node.js
- Strapi v4
- Supabase account and project

## How to Use

### 1. Clone the Package into your strapi project at `./providers` directory and install via below command

```bash
npm i file:providers/strapi-provider-upload-supabase
```

```bash
yarn add file:providers/strapi-provider-upload-supabase
```

### 2. Configure the Plugin

Create a configuration file at ./config/plugins.js with the following content:

```javascript
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: "strapi-provider-upload-supabase",
      providerOptions: {
        apiUrl: env("SUPABASE_API_URL"),
        apiKey: env("SUPABASE_API_KEY"),
        bucket: env("SUPABASE_BUCKET"),
        directory: env("SUPABASE_DIRECTORY"),
        options: {},
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  // ...
});
```

### 3. Set Environment Variables

Create a .env file in the root of your project and add the following variables:

```dotenv
SUPABASE_API_URL="<Your Supabase url>"
SUPABASE_API_KEY="<Your Supabase api key>"
SUPABASE_BUCKET="strapi_bucket"
SUPABASE_DIRECTORY=""
```

### 4. Configure Middleware

Create or update the middleware configuration file at ./config/middlewares.js with the following content:

```javascript
module.exports = ({ env }) => [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "img-src": ["'self'", "data:", "blob:", env("SUPABASE_API_URL")],
        },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
```

You can obtain the values for SUPABASE_API_URL and SUPABASE_API_KEY from your Supabase project settings:

> https://supabase.com/dashboard/project/<your-project>/settings/api

The parameters options, bucket, and directory are optional. If omitted, they will take the default values shown in the examples above.

## How to begin using a Supabase bucket (for newbies)

- Go to the buckets section of the Supabase Project Dashboard.
- Make a `new bucket`, such as `strapi_bucket`.
- Make sure to toggle it via `Public bucket option` to make it publicly accessible
- create new policy for new bucket with `full customization option`
- allow all CRUD operation and add target roles to `anon`
- you are good to go

## Resources

- [MIT License](LICENSE.md)

## Links

- [Strapi website](http://strapi.io)
- [Strapi Provider docs](https://docs.strapi.io/dev-docs/providers)
- [Supabase website](https://supabase.com)
- [Supabase docs](https://supabase.com/docs/reference/javascript)
