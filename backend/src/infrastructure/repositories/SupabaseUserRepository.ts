import { User, type UserRole, type UserProps } from '../../domain/entities/user/User.js';
import { type IUserRepository } from '../../domain/repositories/IUserRepository.js';
import supabase from '../supabase/client.js';

export class SupabaseUserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*');

    if (error) throw new Error(`Failed to fetch users: ${error.message}`);

    return (data || []).map(row => new User({
      id: row.id,
      email: '', // User roles table doesn't store email, we'd need to join with auth.users
      role: row.role as UserRole,
      createdAt: new Date(),
    }));
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return new User({
      id: data.id,
      email: '', // No email in user_roles
      role: data.role as UserRole,
      createdAt: new Date(),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    // This requires querying auth.users table which needs special handling
    // For now, we'll search in user_roles and assume the email exists
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.warn('Could not list auth users:', authError.message);
      return null;
    }

    const user = authData.users.find(u => u.email === email);
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch user role: ${error.message}`);
    }

    return new User({
      id: data.id,
      email: user.email || '',
      role: data.role as UserRole,
      createdAt: new Date(),
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', role);

    if (error) throw new Error(`Failed to fetch users: ${error.message}`);

    return (data || []).map(row => new User({
      id: row.id,
      email: '',
      role: row.role as UserRole,
      createdAt: new Date(),
    }));
  }

  async save(user: User): Promise<User> {
    const plain = user.toPlain();
    
    // First create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: plain.email,
      emailConfirm: true,
    });

    if (authError) throw new Error(`Failed to create auth user: ${authError.message}`);

    // Then create the user role
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        id: plain.id,
        user_id: authData.user.id,
        role: plain.role,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create user role: ${error.message}`);

    return new User({
      id: data.id,
      email: plain.email,
      role: data.role as UserRole,
      createdAt: new Date(),
    });
  }

  async update(user: User): Promise<User> {
    const plain = user.toPlain();
    const { data, error } = await supabase
      .from('user_roles')
      .update({
        role: plain.role,
      })
      .eq('id', plain.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);

    return new User({
      id: data.id,
      email: plain.email,
      role: data.role as UserRole,
      createdAt: new Date(),
    });
  }

  async delete(id: string): Promise<void> {
    // Get the user_id first
    const { data, error: fetchError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) throw new Error(`Failed to find user: ${fetchError.message}`);

    // Delete from user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id);

    if (roleError) throw new Error(`Failed to delete user role: ${roleError.message}`);

    // Delete from auth.users
    await supabase.auth.admin.deleteUser(data.user_id);
  }
}