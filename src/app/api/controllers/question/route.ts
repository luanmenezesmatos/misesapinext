import axios from 'axios';

import capitalize from '@/app/utils/capitalize';

export async function POST(request: Request) {
  const errorMessages = {
    400: 'Refresh token is missing.',
    401: 'Invalid refresh token.',
    500: 'Error retrieving daily challenge.',
  };

  try {
    const format_subject: Record<string, string> = {
      random: 'Aleatório',
      biologia: 'Biologia',
      quimica: 'Química',
      fisica: 'Física',
      matematica: 'Matemática',
      geografia: 'Geografia',
      historia: 'História',
      filosofia: 'Filosofia',
      sociologia: 'Sociologia',
      portugues: 'Português',
      literatura: 'Literatura',
      ingles: 'Inglês',
      espanhol: 'Espanhol',
      artes: 'Artes',
    };

    const format_level: Record<number, string> = {
      0: 'Fácil',
      1: 'Médio',
      2: 'Difícil',
    };

    const { refresh_token, category, level } = await request.json();

    if (!refresh_token) {
      return Response.json(
        { message: 'Refresh token is missing.' },
        { status: 400 }
      );
    }

    if (!category) {
      return Response.json(
        { message: 'Category is missing.' },
        { status: 400 }
      );
    }

    if (!level) {
      return Response.json({ message: 'Level is missing.' }, { status: 400 });
    }

    const request_url =
      (process.env.APP_REQUEST_ENDPOINT as string) +
      `/exercise/category/${category}/${level}`;

    const { data } = await axios.get(request_url, {
      headers: {
        accept: process.env.APP_REQUEST_HEADER_ACCEPT,
        'if-none-match': `${process.env.APP_REQUEST_HEADER_IF_NONE_MATCH}`,
        authtoken: refresh_token,
        'user-agent': process.env.APP_REQUEST_HEADER_USER_AGENT,
        'accept-language': process.env.APP_REQUEST_HEADER_ACCEPT_LANGUAGE,
        'accept-encoding': process.env.APP_REQUEST_HEADER_ACCEPT_ENCODING,
      },
    });

    return Response.json({
      id: data._id,
      options: data.options,
      tags: data.tags.map((tag: string) => capitalize(tag)),
      testName: data.testName,
      content: data.content,
      level: data.level,
      formattedLevel: format_level[data.level],
      rightAnswer: data.rightAnswer,
      subjectName: data.subjectName,
      formattedSubject: format_subject[data.subjectName],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });

  } catch (error: any) {
    console.log(error);

    if (error && error.response && error.response.data) {
      return Response.json(
        {
          code: error.response.data.code,
          message: error.response.data.message,
        },
        { status: error.status }
      );
    } else {
      return Response.json(
        { message: 'Error retrieving daily challenge.' },
        { status: 500 }
      );
    }
  }
}
