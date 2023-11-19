import axios from 'axios';

export async function POST(request: Request) {
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

    const { refresh_token } = await request.json();

    if (!refresh_token) {
      return Response.json(
        { message: 'Refresh token is missing.' },
        { status: 400 }
      );
    }

    const request_url =
      (process.env.APP_REQUEST_ENDPOINT as string) + '/daily-challenge';

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

    const rightAnswers = data.rightAnswers;
    const wrongAnswers = data.wrongAnswers;
    const totalAnswers = rightAnswers + wrongAnswers;
    const averagePercent = Math.round((rightAnswers / totalAnswers) * 100);

    return Response.json({
      id: data._id,
      question: {
        id: data.question._id,
        options: data.question.options,
        tags: data.question.tags,
        testName: data.question.testName,
        content: data.question.content,
        level: data.question.level,
        formattedLevel: format_level[data.question.level],
        rightAnswer: data.question.rightAnswer,
        subjectName: data.question.subjectName,
        formattedSubject: format_subject[data.question.subjectName],
        createdAt: data.question.createdAt,
        updatedAt: data.question.updatedAt,
      },
      questionId: data.questionId,
      rightAnswers: data.rightAnswers,
      wrongAnswers: data.wrongAnswers,
      averagePercent: averagePercent,
      comments: data.comments,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  } catch (error: any) {
    if (error.response.data) {
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
