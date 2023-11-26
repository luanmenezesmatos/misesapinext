import * as jose from 'jose';

import supabase from '@/app/api/supabase';

export async function POST(request: Request) {
  const errorMessages = {
    missingFields: 'Email is missing.',
    userNotFound: 'User not found.',
    tokenError: 'Error generating token.',
    tokenCreated: 'Token created successfully.',
    retrieveUserError: 'Error retrieving user.',
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

    // Verificar se o e-mail não foi encontrado
    const userExists = await isUserExists(email);
    if (userExists) {
      return Response.json(
        { message: errorMessages.userNotFound },
        { status: 400 }
      );
    }

    // Criar token JWT
    const token = await generateJwtToken(email);

    // Atualizar usuário
    const updateUser = await updateUserInDatabase(email, token);

    // Verificar se o usuário foi atualizado
    if (updateUser) {
      // return Response.json({ token: token });

      // Buscar o usuário
      const fetchUser = await getUserByEmail(email);

      // Verificar se o usuário foi encontrado
      if (fetchUser.data && fetchUser.data.length > 0) {
        return Response.json(
          {
            code: 201,
            message: errorMessages.tokenCreated,
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
      throw new Error(errorMessages.tokenError);
    }
    
  } catch (err) {
    return Response.json(
      { message: 'Error generating token.' },
      { status: 500 }
    );
  }

  // Função para verificar se o usuário já existe
  async function isUserExists(email: string) {
    const userWithEmail = await supabase
      .from('apiauth')
      .select('email')
      .eq('email', email);
    return !userWithEmail.data || userWithEmail.data.length === 0;
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

  // Função para atualizar o usuário no banco de dados
  async function updateUserInDatabase(email: string, token: string) {
    return await supabase
      .from('apiauth')
      .update({ bearer_token_auth: token, updated_at: new Date() })
      .eq('email', email);
  }

  // Função para obter usuário pelo email
  async function getUserByEmail(email: string) {
    return await supabase
      .from('apiauth')
      .select('id, email')
      .eq('email', email);
  }
}
