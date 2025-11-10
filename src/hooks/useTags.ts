import { useState, useEffect } from 'react';
import { supabase, Tag } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  }, [user]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = async (tag: Omit<Tag, 'id' | 'user_id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('tags')
      .insert({
        ...tag,
        user_id: user!.id,
      })
      .select()
      .single();

    if (error) throw error;

    setTags([...tags, data]);
    return data;
  };

  const addTagToTodo = async (todoId: string, tagId: string) => {
    const { error } = await supabase
      .from('todo_tags')
      .insert({ todo_id: todoId, tag_id: tagId });

    if (error) throw error;
  };

  const removeTagFromTodo = async (todoId: string, tagId: string) => {
    const { error } = await supabase
      .from('todo_tags')
      .delete()
      .eq('todo_id', todoId)
      .eq('tag_id', tagId);

    if (error) throw error;
  };

  const deleteTag = async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id);

    if (error) throw error;

    setTags(tags.filter((t) => t.id !== id));
  };

  return {
    tags,
    loading,
    addTag,
    addTagToTodo,
    removeTagFromTodo,
    deleteTag,
    refreshTags: fetchTags,
  };
}
