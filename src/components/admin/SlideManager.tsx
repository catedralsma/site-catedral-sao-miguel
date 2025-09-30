import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard as Edit, Trash2, Save, X, Eye, EyeOff, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FileUpload } from '../ui/FileUpload'; // Assuming FileUpload takes a File object directly
import { supabase, Slide, BlogPost, ParishAnnouncement, Celebration } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const SlideManager: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [announcements, setAnnouncements] = useState<ParishAnnouncement[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);

  useEffect(() => {
    fetchSlides();
    fetchRelatedContent();
  }, []);

  const fetchRelatedContent = async () => {
    try {
      // Fetch blog posts
      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('id, title, is_published')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (blogData) setBlogPosts(blogData);

      // Fetch announcements
      const { data: announcementData } = await supabase
        .from('parish_announcements')
        .select('id, title, type, is_published')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (announcementData) setAnnouncements(announcementData);

      // Fetch celebrations
      const { data: celebrationData } = await supabase
        .from('celebrations')
        .select('id, community_name, celebration_type, day_of_week, time, is_active')
        .eq('is_active', true)
        .order('day_of_week', { ascending: true });
      
      if (celebrationData) setCelebrations(celebrationData);
    } catch (error) {
      console.error('Error fetching related content:', error);
    }
  };

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('slides')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }
      if (data) {
        setSlides(data);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast.error('Erro ao buscar slides');
    }
  };

  const handleCreateSlide = () => {
    const newSlide: Slide = {
      id: '', // Supabase will generate this on insert
      title: '',
      description: '',
      image_url: '',
      link_url: null,
      link_text: null,
      content_type: 'custom',
      related_content_id: null,
      cloudinary_public_id: null,
      order_index: slides.length, // Assign a unique order index for new slides
      is_active: true,
      created_at: new Date().toISOString()
    };
    setEditingSlide(newSlide);
    setIsCreating(true);
  };

  const handleSaveSlide = async () => {
    if (!editingSlide || !editingSlide.title || !editingSlide.description) {
      toast.error('Preencha título e descrição');
      return;
    }

    try {
      if (isCreating) {
        // Ensure order_index is unique and correctly assigned for new slides
        const newOrderIndex = slides.length > 0 ? Math.max(...slides.map(s => s.order_index)) + 1 : 0;
        const { data, error } = await supabase
          .from('slides')
          .insert([{
            title: editingSlide.title,
            description: editingSlide.description,
            image_url: editingSlide.image_url || '',
            link_url: editingSlide.link_url,
            link_text: editingSlide.link_text,
            content_type: editingSlide.content_type,
            related_content_id: editingSlide.related_content_id,
            cloudinary_public_id: editingSlide.cloudinary_public_id,
            order_index: newOrderIndex, // Use the new unique order index
            is_active: editingSlide.is_active
          }])
          .select()
          .single();

        if (error) throw error;
        setSlides(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      } else {
        const { error } = await supabase
          .from('slides')
          .update({
            title: editingSlide.title,
            description: editingSlide.description,
            image_url: editingSlide.image_url,
            link_url: editingSlide.link_url,
            link_text: editingSlide.link_text,
            content_type: editingSlide.content_type,
            related_content_id: editingSlide.related_content_id,
            cloudinary_public_id: editingSlide.cloudinary_public_id,
            order_index: editingSlide.order_index,
            is_active: editingSlide.is_active
          })
          .eq('id', editingSlide.id);

        if (error) throw error;
        setSlides(prev => prev.map(s =>
          s.id === editingSlide.id ? editingSlide : s
        ).sort((a, b) => a.order_index - b.order_index));
      }

      setEditingSlide(null);
      setIsCreating(false);
      toast.success('Slide salvo com sucesso!');
    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error('Erro ao salvar slide');
    }
  };

  const handleDeleteSlide = async (slide: Slide) => {
    if (!confirm('Tem certeza que deseja excluir este slide?')) return;

    try {
      const { error } = await supabase
        .from('slides')
        .delete()
        .eq('id', slide.id);

      if (error) throw error;

      setSlides(prev => prev.filter(s => s.id !== slide.id));
      toast.success('Slide excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Erro ao excluir slide');
    }
  };

  const handleToggleActive = async (slide: Slide) => {
    try {
      const { error } = await supabase
        .from('slides')
        .update({ is_active: !slide.is_active })
        .eq('id', slide.id);

      if (error) throw error;

      setSlides(prev => prev.map(s =>
        s.id === slide.id ? { ...s, is_active: !s.is_active } : s
      ));
      toast.success('Status do slide atualizado!');
    } catch (error) {
      console.error('Error toggling slide:', error);
      toast.error('Erro ao atualizar slide');
    }
  };

  const handleMoveSlide = async (slide: Slide, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slide.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const targetSlide = slides[targetIndex];

    try {
      // Create a temporary array to manage the swap in state first
      const updatedSlides = [...slides];
      // Perform the swap in the temporary array by updating order_index
      updatedSlides[currentIndex] = { ...slide, order_index: targetSlide.order_index };
      updatedSlides[targetIndex] = { ...targetSlide, order_index: slide.order_index };

      // Update the database for both slides in parallel
      const { error: error1 } = await supabase
        .from('slides')
        .update({ order_index: targetSlide.order_index })
        .eq('id', slide.id);

      const { error: error2 } = await supabase
        .from('slides')
        .update({ order_index: slide.order_index })
        .eq('id', targetSlide.id);

      if (error1 || error2) {
        throw new Error(error1?.message || error2?.message);
      }

      // Sort the updated array to reflect the new order visually
      setSlides(updatedSlides.sort((a, b) => a.order_index - b.order_index));

      toast.success('Ordem dos slides atualizada!');
    } catch (error) {
      console.error('Error moving slide:', error);
      toast.error('Erro ao mover slide');
    }
  };

  // This is the single, corrected image upload function
  const handleCloudinaryUpload = async (result: { publicId: string; url: string; secureUrl: string }) => {
    if (!editingSlide) return;
    setEditingSlide(prev => prev ? { 
      ...prev, 
      image_url: result.secureUrl,
      cloudinary_public_id: result.publicId 
    } : null);
    toast.success('Imagem carregada com sucesso!');
  };

  const handleSupabaseUpload = async (result: { url: string; path: string }) => {
    if (!editingSlide) return;
    setEditingSlide(prev => prev ? { ...prev, image_url: result.url } : null);
    toast.success('Imagem carregada com sucesso!');
  };

  const handleImageUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !editingSlide) return;

    setIsUploading(true);
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Imagem muito grande (máximo 10MB)');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `slide-${Date.now()}.${fileExt}`;
      const filePath = `slides/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('parish-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('parish-photos')
        .getPublicUrl(filePath);

      setEditingSlide(prev => prev ? { ...prev, image_url: urlData.publicUrl } : null);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao carregar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const getRelatedContentOptions = () => {
    if (!editingSlide?.content_type || editingSlide.content_type === 'custom') {
      return [];
    }

    switch (editingSlide.content_type) {
      case 'blog_post':
        return blogPosts.map(post => ({ id: post.id, title: post.title }));
      case 'announcement':
        return announcements.map(announcement => ({ 
          id: announcement.id, 
          title: `${announcement.title} (${announcement.type === 'event' ? 'Evento' : 'Aviso'})` 
        }));
      case 'event':
        return celebrations.map(celebration => ({ 
          id: celebration.id, 
          title: `${celebration.community_name} - ${celebration.celebration_type} (${celebration.day_of_week} ${celebration.time})` 
        }));
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Slides</h3>
        <Button onClick={handleCreateSlide}>
          <Plus className="h-4 w-4" />
          Novo Slide
        </Button>
      </div>

      {slides.length === 0 && (
        <Card className="p-8 text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhum slide encontrado
          </h4>
          <p className="text-gray-500 mb-4">
            Comece criando o primeiro slide para o carrossel principal
          </p>
          <Button onClick={handleCreateSlide}>
            <Plus className="h-4 w-4" />
            Criar Primeiro Slide
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`p-6 ${!slide.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-4">
                  {slide.image_url && (
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{slide.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{slide.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Ordem: {slide.order_index}</span>
                      <span>•</span>
                      <span>{slide.is_active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveSlide(slide, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveSlide(slide, 'down')}
                        disabled={index === slides.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(slide)}
                      >
                        {slide.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingSlide(slide);
                          setIsCreating(false);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSlide(slide)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingSlide && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold flex-1 pr-4">
                  {isCreating ? 'Novo Slide' : 'Editar Slide'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSlide(null);
                    setIsCreating(false);
                  }}
                  className="w-8 h-8 p-0 rounded-full flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingSlide.title}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Título do slide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={editingSlide.description}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="Descrição do slide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem
                  </label>
                  {editingSlide.image_url && (
                    <div className="mb-3">
                      <img
                        src={editingSlide.image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <FileUpload
                      onCloudinaryUpload={handleCloudinaryUpload}
                      onSupabaseUpload={handleSupabaseUpload}
                      onFileSelect={handleImageUpload}
                      disabled={isUploading}
                      className="flex-1"
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
                    {editingSlide.image_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSlide(prev => prev ? { ...prev, image_url: '' } : null)}
                        className="text-red-600"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Conteúdo
                    </label>
                    <select
                      value={editingSlide.content_type || 'custom'}
                      onChange={(e) => setEditingSlide(prev => prev ? { 
                        ...prev, 
                        content_type: e.target.value as 'custom' | 'blog_post' | 'announcement' | 'event',
                        related_content_id: null // Reset related content when type changes
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="custom">Personalizado</option>
                     <option value="internal_page">Página Interna</option>
                      <option value="blog_post">Post do Blog</option>
                      <option value="announcement">Anúncio</option>
                      <option value="event">Celebração</option>
                    </select>
                  </div>

                 {editingSlide.content_type && editingSlide.content_type !== 'custom' && editingSlide.content_type !== 'internal_page' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conteúdo Relacionado
                      </label>
                      <select
                        value={editingSlide.related_content_id || ''}
                        onChange={(e) => setEditingSlide(prev => prev ? { 
                          ...prev, 
                          related_content_id: e.target.value || null 
                        } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Selecione um item</option>
                        {getRelatedContentOptions().map(option => (
                          <option key={option.id} value={option.id}>
                            {option.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                 {editingSlide.content_type === 'internal_page' && (
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Página Interna
                     </label>
                     <select
                       value={editingSlide.link_url || ''}
                       onChange={(e) => setEditingSlide(prev => prev ? { 
                         ...prev, 
                         link_url: e.target.value || null 
                       } : null)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                     >
                       <option value="">Selecione uma página</option>
                       <option value="historia">História</option>
                       <option value="capela">Capela São Miguel</option>
                       <option value="pastorals">Pastorais</option>
                       <option value="celebrations">Celebrações</option>
                       <option value="blog">Blog</option>
                       <option value="photos">Galeria de Fotos</option>
                       <option value="albums">Álbuns de Fotos</option>
                       <option value="timeline">Linha do Tempo</option>
                       <option value="announcements">Eventos e Avisos</option>
                       <option value="priests">Nosso Clero</option>
                       <option value="contact">Contato</option>
                       <option value="privacy-policy">Política de Privacidade</option>
                       <option value="terms-of-use">Termos de Uso</option>
                     </select>
                   </div>
                 )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                     Link/URL {editingSlide.content_type === 'custom' ? '(opcional)' : editingSlide.content_type === 'internal_page' ? '(automático)' : '(automático se relacionado)'}
                    </label>
                    <input
                      type="url"
                      value={editingSlide.link_url || ''}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, link_url: e.target.value || null } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="https://exemplo.com ou /pagina-interna"
                     disabled={(editingSlide.content_type !== 'custom' && editingSlide.content_type !== 'internal_page' && editingSlide.related_content_id) || editingSlide.content_type === 'internal_page'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                     {editingSlide.content_type === 'custom' 
                       ? 'URL externo ou rota interna'
                       : editingSlide.content_type === 'internal_page'
                       ? 'Será gerado automaticamente baseado na página selecionada'
                       : 'Será gerado automaticamente se conteúdo relacionado for selecionado'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={editingSlide.link_text || ''}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, link_text: e.target.value || null } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Saiba Mais"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Texto que aparecerá no botão de ação
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingSlide.is_active}
                      onChange={(e) => setEditingSlide(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Slide ativo</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveSlide} className="flex-1">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSlide(null);
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
