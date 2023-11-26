import axios from 'axios';

export async function POST(request: Request) {
  try {
    const request_url =
      (process.env.APP_REQUEST_ENDPOINT_TOKEN as string) +
      new URLSearchParams({
        key: process.env.APP_REQUEST_USER_TOKEN as string,
      });

    const response = await axios.post(request_url, {
      grant_type: "refresh_token",
      refresh_token: process.env.APP_REFRESH_TOKEN,
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
