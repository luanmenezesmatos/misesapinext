import supabase from '@/app/api/supabase';

export async function POST(request: Request) {
  const errorMessages = {
    missingFields: 'Email is missing.',
    userNotFound: 'User not found.',
    deleteUserError: 'Error deleting user.',
    userDeleted: 'User deleted successfully.',
  };

  try {
    const { email } = await request.json();

    // Validar entrada antecipadamente
    if (!email) {
      return Response.json({ message: errorMessages.missingFields }, { status: 400 });
    }

    // Verificar se o e-mail não foi encontrado
    const userExists = await isUserExists(email);
    if (userExists) {
      return Response.json(
        { message: errorMessages.userNotFound },
        { status: 400 }
      );
    }

    // Deletar usuário
    const deleteUser = await deleteUserInDatabase(email);

    // Verificar se o usuário foi deletado
    if (deleteUser) {
      return Response.json({ message: errorMessages.userDeleted });
    } else {
      throw new Error(errorMessages.deleteUserError);
    }
  } catch (error) {
    return Response.json({ message: errorMessages.deleteUserError }, { status: 500 });
  }

  // Função para verificar se o usuário já existe
  async function isUserExists(email: string) {
    const userWithEmail = await supabase
      .from('apiauth')
      .select('email')
      .eq('email', email);
    return !userWithEmail.data || userWithEmail.data.length === 0;
  }

  // Função para deletar o usuário no banco de dados
  async function deleteUserInDatabase(email: string) {
    const userToDelete = await supabase
      .from('apiauth')
      .delete()
      .eq('email', email);
    return userToDelete;
  }
}
