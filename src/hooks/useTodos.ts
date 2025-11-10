import { useState, useEffect } from 'react';
import { supabase, Todo, TodoWithDetails, Subtask, Tag, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useTodos() {
  const [todos, setTodos] = useState<TodoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      const { data: todosData, error } = await supabase
        .from('todos')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const todosWithDetails = await Promise.all(
        (todosData || []).map(async (todo) => {
          const [subtasks, tags, category] = await Promise.all([
            fetchSubtasks(todo.id),
            fetchTodoTags(todo.id),
            todo.category_id ? fetchCategory(todo.category_id) : Promise.resolve(undefined),
          ]);

          return {
            ...todo,
            subtasks,
            tags,
            category,
          };
        })
      );

      setTodos(todosWithDetails);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubtasks = async (todoId: string): Promise<Subtask[]> => {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('todo_id', todoId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching subtasks:', error);
      return [];
    }

    return data || [];
  };

  const fetchTodoTags = async (todoId: string): Promise<Tag[]> => {
    const { data, error } = await supabase
      .from('todo_tags')
      .select('tag_id')
      .eq('todo_id', todoId);

    if (error || !data) return [];

    const tagIds = data.map((t) => t.tag_id);
    const { data: tagsData } = await supabase
      .from('tags')
      .select('*')
      .in('id', tagIds);

    return tagsData || [];
  };

  const fetchCategory = async (categoryId: string): Promise<Category | undefined> => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .maybeSingle();

    return data || undefined;
  };

  const addTodo = async (todo: Partial<Todo>) => {
    const maxOrder = Math.max(...todos.map((t) => t.order_index), 0);

    const { data, error } = await supabase
      .from('todos')
      .insert({
        ...todo,
        user_id: user!.id,
        order_index: maxOrder + 1,
      })
      .select()
      .single();

    if (error) throw error;

    setTodos([...todos, { ...data, subtasks: [], tags: [] }]);
    return data;
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const { error } = await supabase
      .from('todos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) throw error;

    setTodos(todos.filter((t) => t.id !== id));
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await updateTodo(id, {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    });
  };

  const addSubtask = async (todoId: string, title: string) => {
    const todo = todos.find((t) => t.id === todoId);
    const maxOrder = Math.max(...(todo?.subtasks || []).map((s) => s.order_index), 0);

    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        todo_id: todoId,
        title,
        order_index: maxOrder + 1,
      })
      .select()
      .single();

    if (error) throw error;

    await fetchTodos();
    return data;
  };

  const updateSubtask = async (id: string, updates: Partial<Subtask>) => {
    const { error } = await supabase
      .from('subtasks')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    await fetchTodos();
  };

  const deleteSubtask = async (id: string) => {
    const { error } = await supabase.from('subtasks').delete().eq('id', id);

    if (error) throw error;

    await fetchTodos();
  };

  const reorderTodos = async (reorderedTodos: TodoWithDetails[]) => {
    const updates = reorderedTodos.map((todo, index) => ({
      id: todo.id,
      order_index: index,
    }));

    for (const update of updates) {
      await supabase
        .from('todos')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }

    setTodos(reorderedTodos);
  };

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    reorderTodos,
    refreshTodos: fetchTodos,
  };
}
