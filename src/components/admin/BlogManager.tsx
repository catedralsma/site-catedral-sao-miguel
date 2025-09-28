import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload';
import { RichTextEditor } from '../ui/RichTextEditor';
import { supabase, BlogPost } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const BlogManager: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPosts(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Erro ao carregar posts do blog');
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCreatePost = () => {
    const newPost: Partial<BlogPost> = {
      title: '',
      content: '',
      excerpt: '',
      featured_image: null,
      cloudinary_public_id: null,
      author: 'Administrador',
      is_published: false,
      slug: '',
    };
    setEditingPost(newPost as BlogPost);
    setIsCreating(true);
  };

  const handleSavePost = async () => {
    if (!editingPost || !editingPost.title || !editingPost.content) {
      toast.error('Preencha título e conteúdo');
      return;
    }

    try {
      const postData = {
        title: editingPost.title,
        content: editingPost.content,
        excerpt: editingPost.excerpt || editingPost.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        featured_image: editingPost.featured_image,
        cloudinary_public_id: editingPost.cloudinary_public_id,
        author: editingPost.author || 'Administrador',
        is_published: editingPost.is_published,
        slug: editingPost.slug || generateSlug(editingPost.title),
        // Adicionando a data de atualização apenas no momento de salvar
        updated_at: new Date().toISOString()
      };

      if (isCreating) {
        // CORRIGIDO: O Supabase gera o ID na inserção, basta capturá-lo
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([{
            ...postData,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        setPosts(prev => [data, ...prev]);
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id)
          .select()
          .single();

        if (error) throw error;
        setPosts(prev => prev.map(p =>
          p.id === editingPost.id ? { ...p, ...data } : p
        ));
      }

      setEditingPost(null);
      setIsCreating(false);
      toast.success('Post salvo com sucesso!');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Erro ao salvar post');
    }
  };

  const handleDeletePost = async (post: BlogPost) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      // Otimização: Atualiza o estado local imediatamente
      setPosts(prev => prev.filter(p => p.id !== post.id));
      toast.success('Post excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erro ao excluir post');
    }
  };

  const handleTogglePublished = async (post: BlogPost) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ 
          is_published: !post.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id)
        .select()
        .single();

      if (error) throw error;
      
      setPosts(prev => prev.map(p =>
        p.id === post.id ? { ...p, ...data } : p
      ));
      
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Error toggling post:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !editingPost) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 10MB)');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('parish-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('parish-photos')
        .getPublicUrl(filePath);

      setEditingPost(prev => prev ? { ...prev, featured_image: urlData.publicUrl } : null);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }) => {
    if (!editingPost) return;
    setEditingPost(prev => prev ? { 
      ...prev, 
      featured_image: result.secureUrl,
      cloudinary_public_id: result.publicId 
    } : null);
    toast.success('Imagem carregada com sucesso!');
  };

  const handleSupabaseUpload = async (result: { url: string; path: string }) => {
    if (!editingPost) return;
    setEditingPost(prev => prev ? { ...prev, featured_image: result.url } : null);
    toast.success('Imagem carregada com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Blog</h3>
        <Button onClick={handleCreatePost}>
          <Plus className="h-4 w-4" />
          Novo Post
        </Button>
      </div>

      {posts.length === 0 && (
        <Card className="p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum post encontrado
          </h4>
          <p className="text-gray-500 mb-4">
            Comece criando o primeiro post do blog
          </p>
          <Button onClick={handleCreatePost}>
            <Plus className="h-4 w-4" />
            Criar Primeiro Post
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-6 ${!post.is_published ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{post.title}</h4>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Por: {post.author}</span>
                      <span>•</span>
                      <span>
                        Criado: {new Date(post.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span>•</span>
                      <span>{post.is_published ? 'Publicado' : 'Rascunho'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePublished(post)}
                    >
                      {post.is_published ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPost(post);
                        setIsCreating(false);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePost(post)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h4 className="text-lg font-semibold flex-1 pr-4">
                  {isCreating ? 'Novo Post' : 'Editar Post'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingPost(null);
                    setIsCreating(false);
                  }}
                  className="w-8 h-8 p-0 rounded-full flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Campos de Título, Slug e Autor agrupados */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={editingPost.title}
                      onChange={(e) => setEditingPost(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Título do post"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost(prev => prev ? { ...prev, slug: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="deixe vazio para gerar automaticamente"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Autor
                    </label>
                    <input
                      type="text"
                      value={editingPost.author}
                      onChange={(e) => setEditingPost(prev => prev ? { ...prev, author: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Nome do autor"
                    />
                  </div>
                  {/* BOTÃO DE STATUS MOVIDO PARA CÁ */}
                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingPost.is_published}
                        onChange={(e) => setEditingPost(prev => prev ? { ...prev, is_published: e.target.checked } : null)}
                        className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {editingPost.is_published ? '✅ Publicado' : '📝 Rascunho'}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resumo/Excerpt
                  </label>
                  <textarea
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost(prev => prev ? { ...prev, excerpt: e.target.value } : null)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Resumo que aparecerá na listagem de posts"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem Destacada
                  </label>
                  {editingPost.featured_image && (
                    <div className="mb-3">
                      <img
                        src={editingPost.featured_image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {editingPost.cloudinary_public_id && (
                        <p className="text-xs text-blue-600 mt-1">
                          Cloudinary: {editingPost.cloudinary_public_id}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <FileUpload
                      onCloudinaryUpload={handleCloudinaryUpload}
                      onSupabaseUpload={handleSupabaseUpload}
                      onFileSelect={handleImageUpload}
                      disabled={isUploading}
                      className="flex-1"
                      folder="blog"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        className="w-full"
                      >
                        <ImageIcon className="h-4 w-4" />
                        {isUploading ? 'Carregando...' : 'Carregar Imagem'}
                      </Button>
                    </FileUpload>
                    {editingPost.featured_image && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPost(prev => prev ? { 
                          ...prev, 
                          featured_image: null,
                          cloudinary_public_id: null 
                        } : null)}
                        className="text-red-600"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo *
                  </label>
                  <RichTextEditor
                    value={editingPost.content}
                    onChange={(value) => setEditingPost(prev => prev ? { ...prev, content: value } : null)}
                    placeholder="Escreva o conteúdo do post..."
                    height="400px"
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleSavePost} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar Post
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPost(null);
                      setIsCreating(false);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};