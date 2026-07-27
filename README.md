This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Create a local `.env.local` file with the required private keys:

```bash
GEOAPIFY_API_KEY=your_geoapify_api_key
GOOGLE_BUSINESS_ACCOUNT_ID=your_business_profile_account_id
GOOGLE_BUSINESS_LOCATION_ID=your_business_profile_location_id
GOOGLE_BUSINESS_OAUTH_CLIENT_ID=your_oauth_client_id
GOOGLE_BUSINESS_OAUTH_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_BUSINESS_OAUTH_REFRESH_TOKEN=your_owner_refresh_token
GOOGLE_BUSINESS_PROFILE_URL=your_public_google_business_profile_url
```

The project uses the **Google Business Profile API** to retrieve up to 50 reviews
owned by the business, ordered by most recently updated. The Google Cloud project
must be approved for Business Profile API access, and the OAuth refresh token
must belong to an owner or manager of the verified profile. Until these values
are configured, the homepage keeps displaying the existing review selection.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
