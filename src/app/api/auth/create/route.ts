import * as jose from 'jose';

import supabase from '@/app/api/supabase';

export async function POST(request: Request) {
  const errorMessages = {
    missingFields: 'Email, password, or name is missing.',
    emailExists: 'Email already exists.',
    createUserError: 'Error creating user.',
    userCreated: 'User created successfully.',
    retrieveUserError: 'Error retrieving user after creation.',
  };
 
  try {
    const { email } = await request.json();

    // Validar entrada antecipadamente
    if (!email) {
      return Response.json(
        { message: errorMessages.missingFields },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const userExists = await isUserExists(email);
    if (userExists) {
      return Response.json(
        { message: errorMessages.emailExists },
        { status: 400 }
      );
    }

    // Criar token JWT
    const token = await generateJwtToken(email);

    // Inserir novo usuário
    const createUser = await createUserInDatabase(email, token);

    // Verificar se a criação foi bem-sucedida
    if (createUser && createUser.statusText === 'Created') {
      // Buscar usuário recém-criado
      const fetchUser = await getUserByEmail(email);

      // Verificar se o usuário foi encontrado
      if (fetchUser.data && fetchUser.data.length > 0) {
        return Response.json(
          {
            code: 201,
            message: errorMessages.userCreated,
            token: token,
            user: {
              id: fetchUser.data[0].id,
              email: email,
            },
          },
          { status: 201 }
        );
      } else {
        throw new Error(errorMessages.retrieveUserError);
      }
    } else {
      throw new Error(errorMessages.createUserError);
    }
  } catch (err) {
    console.error(errorMessages.createUserError, err);
    return Response.json({ message: errorMessages.createUserError }, { status: 500 });
  }

  // Função para verificar se o usuário já existe
  async function isUserExists(email: string) {
    const userWithEmail = await supabase
      .from('apiauth')
      .select('email')
      .eq('email', email);
    return userWithEmail.data && userWithEmail.data.length > 0;
  }

  // Função para gerar token JWT
  async function generateJwtToken(email: string) {
    const alg = 'HS256';
    const signature = new TextEncoder().encode(process.env.JWT_SECRET);
    return new jose.SignJWT({ email: email })
      .setProtectedHeader({ alg })
      .setExpirationTime('24h')
      .sign(signature);
  }

  // Função para criar usuário no banco de dados
  async function createUserInDatabase(email: string, token: string) {
    return await supabase
      .from('apiauth')
      .insert([{ email: email, bearer_token_auth: token }]);
  }

  // Função para obter usuário pelo email
  async function getUserByEmail(email: string) {
    return await supabase
      .from('apiauth')
      .select('id, email')
      .eq('email', email);
  }
}
