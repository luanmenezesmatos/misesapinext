import supabase from '@/app/api/supabase';

export async function GET(request: Request) {
  const errorMessages = {
    listUsersError: 'Error listing users.',
  };

  try {
    const users = await listUsers();
    
    if (users && users.length > 0) {
      return Response.json({ users });
    } else {
      throw new Error(errorMessages.listUsersError);
    }
  } catch (error) {
    return Response.json({ message: errorMessages.listUsersError }, { status: 500 });
  }

  async function listUsers() {
    const { data, error } = await supabase.from('apiauth').select('*');
    if (error) {
      throw error;
    }
    return data;
  }
}
