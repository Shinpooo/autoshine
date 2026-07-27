type GoogleBusinessReviewer = {
  profilePhotoUrl?: string;
  displayName?: string;
  isAnonymous?: boolean;
};

type GoogleBusinessReviewMedia = {
  thumbnailUrl?: string;
  thumbnailLabel?: string;
  videoUrl?: string;
};

type GoogleBusinessReviewApiItem = {
  name?: string;
  reviewId?: string;
  reviewer?: GoogleBusinessReviewer;
  starRating?: string;
  comment?: string;
  createTime?: string;
  updateTime?: string;
  reviewMediaItems?: GoogleBusinessReviewMedia[];
};

type GoogleBusinessReviewsApiResponse = {
  reviews?: GoogleBusinessReviewApiItem[];
  averageRating?: number;
  totalReviewCount?: number;
};

type GoogleOAuthTokenResponse = {
  access_token?: string;
  expires_in?: number;
};

export type ReviewImage = {
  src: string;
  alt: string;
};

export type GoogleBusinessReview = {
  id: string;
  text: string;
  rating: number;
  publishedAt: string;
  author: {
    displayName: string;
    photoUri: string;
  };
  images: ReviewImage[];
};

export type GoogleBusinessReviewsData = {
  rating: number;
  reviewCount: number;
  profileUri: string;
  reviews: GoogleBusinessReview[];
};

export type GoogleBusinessReviewsResult =
  | { status: "ready"; data: GoogleBusinessReviewsData }
  | { status: "not-configured" }
  | { status: "unavailable" };

const GOOGLE_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_BUSINESS_API_URL = "https://mybusiness.googleapis.com/v4";
const STAR_RATINGS: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};
const DEFAULT_PROFILE_URI =
  "https://www.google.com/maps/search/?api=1&query=LN%20AutoShine%20Huy";

async function getOwnerAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
) {
  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GoogleOAuthTokenResponse;
  return data.access_token?.trim() || null;
}

export async function getGoogleBusinessReviews(): Promise<GoogleBusinessReviewsResult> {
  const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID?.trim();
  const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID?.trim();
  const clientId = process.env.GOOGLE_BUSINESS_OAUTH_CLIENT_ID?.trim();
  const clientSecret =
    process.env.GOOGLE_BUSINESS_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken =
    process.env.GOOGLE_BUSINESS_OAUTH_REFRESH_TOKEN?.trim();
  const profileUri =
    process.env.GOOGLE_BUSINESS_PROFILE_URL?.trim() || DEFAULT_PROFILE_URI;

  if (
    !accountId ||
    !locationId ||
    !clientId ||
    !clientSecret ||
    !refreshToken
  ) {
    return { status: "not-configured" };
  }

  try {
    const accessToken = await getOwnerAccessToken(
      clientId,
      clientSecret,
      refreshToken,
    );

    if (!accessToken) {
      return { status: "unavailable" };
    }

    const parent = `accounts/${encodeURIComponent(
      accountId,
    )}/locations/${encodeURIComponent(locationId)}`;
    const url = new URL(`${GOOGLE_BUSINESS_API_URL}/${parent}/reviews`);
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "updateTime desc");

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: "unavailable" };
    }

    const data = (await response.json()) as GoogleBusinessReviewsApiResponse;

    if (
      typeof data.averageRating !== "number" ||
      typeof data.totalReviewCount !== "number"
    ) {
      return { status: "unavailable" };
    }

    const reviews = (data.reviews ?? [])
      .map((review, index): GoogleBusinessReview | null => {
        const text = review.comment?.trim();

        if (!text) {
          return null;
        }

        const isAnonymous = review.reviewer?.isAnonymous;
        const displayName =
          !isAnonymous && review.reviewer?.displayName?.trim()
            ? review.reviewer.displayName.trim()
            : "Client Google";

        return {
          id:
            review.reviewId ||
            review.name ||
            `${displayName}-${review.createTime ?? index}`,
          text,
          rating: STAR_RATINGS[review.starRating ?? ""] ?? 0,
          publishedAt: review.createTime ?? review.updateTime ?? "",
          author: {
            displayName,
            photoUri:
              !isAnonymous && review.reviewer?.profilePhotoUrl
                ? review.reviewer.profilePhotoUrl
                : "",
          },
          images: (review.reviewMediaItems ?? [])
            .filter((media) => Boolean(media.thumbnailUrl))
            .map((media) => ({
              src: media.thumbnailUrl as string,
              alt:
                media.thumbnailLabel?.trim() ||
                `Photo de l'avis Google de ${displayName}`,
            })),
        };
      })
      .filter(
        (review): review is GoogleBusinessReview => review !== null,
      );

    return {
      status: "ready",
      data: {
        rating: data.averageRating,
        reviewCount: data.totalReviewCount,
        profileUri,
        reviews,
      },
    };
  } catch {
    return { status: "unavailable" };
  }
}
