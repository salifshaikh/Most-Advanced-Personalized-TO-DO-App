import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
};

export type Todo = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type Subtask = {
  id: string;
  todo_id: string;
  title: string;
  completed: boolean;
  order_index: number;
  created_at: string;
};

export type Tag = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type TodoWithDetails = Todo & {
  category?: Category;
  subtasks?: Subtask[];
  tags?: Tag[];
};
