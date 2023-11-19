import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { grant_type, refresh_token } = await request.json();

    if (!grant_type || !refresh_token) {
      return Response.json(
        { message: 'grant_type or refresh_token is missing.' },
        { status: 400 }
      );
    }

    if (grant_type !== 'refresh_token') {
      return Response.json(
        { message: 'grant_type is invalid.' },
        { status: 400 }
      );
    }

    const request_url =
      (process.env.APP_REQUEST_ENDPOINT_TOKEN as string) +
      new URLSearchParams({
        key: process.env.APP_REQUEST_USER_TOKEN as string,
      });

    const response = await axios.post(request_url, {
      grant_type: grant_type,
      refresh_token: refresh_token,
    });

    return Response.json(response.data);
  } catch (err) {
    console.log(err);
    return Response.json(
      { message: 'Error generating token.' },
      { status: 500 }
    );
  }
}
