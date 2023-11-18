import axios from "axios";

export async function POST(request: Request) {
    try {
        const format_category: Record<string, string> = {
            random: "Aleatório",
            biologia: "Biologia",
            quimica: "Química",
            fisica: "Física",
            matematica: "Matemática",
            geografia: "Geografia",
            historia: "História",
            filosofia: "Filosofia",
            sociologia: "Sociologia",
            portugues: "Português",
            literatura: "Literatura",
            ingles: "Inglês",
            espanhol: "Espanhol",
            artes: "Artes",
        };
    
        const format_level: Record<number, string> = {
            0: "Fácil",
            1: "Médio",
            2: "Difícil",
        };
    
        const { refresh_token } = await request.json();
    
        if (!refresh_token) {
            return Response.json({ message: "Refresh token is missing." }, { status: 400 });
        }
    
        const request_url = process.env.APP_REQUEST_ENDPOINT_CHALLENGE as string + "/daily-challenge";
    
        const response = await axios.get(request_url, {
            headers: {
                "accept": process.env.APP_REQUEST_HEADER_ACCEPT,
                "if-none-match": `${process.env.APP_REQUEST_HEADER_IF_NONE_MATCH}`,
                "authtoken": refresh_token,
                "user-agent": process.env.APP_REQUEST_HEADER_USER_AGENT,
                "accept-language": process.env.APP_REQUEST_HEADER_ACCEPT_LANGUAGE,
                "accept-encoding": process.env.APP_REQUEST_HEADER_ACCEPT_ENCODING
            },
        });
    
        return Response.json(response.data);
    
        /* return Response.json({
            category: format_category[category],
            level: format_level[level],
            question: response.data.question,
            answers: response.data.answers,
            correct_answer: response.data.correct_answer,
            explanation: response.data.explanation,
            source: response.data.source,
            image: response.data.image,
        }); */
    } catch (err) {
        console.log(err);
        return Response.json({ message: "Error retrieving daily challenge." }, { status: 500 });
    }
}
