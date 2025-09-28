import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Calendar, User, Mail, Phone, ExternalLink, Filter, Download, Eye, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Donation {
  id: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'canceled' | 'refunded';
  donor_name: string | null;
  donor_email: string | null;
  donor_phone: string | null;
  donation_purpose: string | null;
  message: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const DonationManager: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'processing', label: 'Processando' },
    { value: 'completed', label: 'Concluída' },
    { value: 'failed', label: 'Falhou' },
    { value: 'canceled', label: 'Cancelada' },
    { value: 'refunded', label: 'Reembolsada' }
  ];

  const dateOptions = [
    { value: 'all', label: 'Todos os Períodos' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'year', label: 'Este Ano' }
  ];

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, dateFilter]);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtro por status
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Filtro por data
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Erro ao carregar doações');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando';
      case 'failed':
        return 'Falhou';
      case 'canceled':
        return 'Cancelada';
      case 'refunded':
        return 'Reembolsada';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const calculateTotals = () => {
    const completed = donations.filter(d => d.status === 'completed');
    const total = completed.reduce((sum, d) => sum + d.amount, 0);
    return {
      total: formatCurrency(total, donations[0]?.currency || 'BRL'),
      count: completed.length,
      totalDonations: donations.length
    };
  };

  const exportDonations = () => {
    const csvContent = [
      ['Data', 'Valor', 'Status', 'Doador', 'Email', 'Telefone', 'Finalidade', 'Stripe Session ID'].join(','),
      ...donations.map(d => [
        new Date(d.created_at).toLocaleDateString('pt-BR'),
        d.amount.toString(),
        getStatusLabel(d.status),
        d.donor_name || '',
        d.donor_email || '',
        d.donor_phone || '',
        d.donation_purpose || '',
        d.stripe_session_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doacoes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800">Gerenciar Doações</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportDonations}
            disabled={donations.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={fetchDonations}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Total Arrecadado</p>
              <p className="text-xl font-bold text-green-800">{totals.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Doações Concluídas</p>
              <p className="text-xl font-bold text-blue-800">{totals.count}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Total de Tentativas</p>
              <p className="text-xl font-bold text-purple-800">{totals.totalDonations}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Doações */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando doações...</p>
        </div>
      ) : donations.length === 0 ? (
        <Card className="p-12 text-center">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma doação encontrada
          </h4>
          <p className="text-gray-500">
            As doações aparecerão aqui quando forem realizadas
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {donations.map((donation) => (
              <motion.div
                key={donation.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {formatCurrency(donation.amount, donation.currency)}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(donation.status)}`}>
                          {getStatusLabel(donation.status)}
                        </span>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        {donation.donor_name && (
                          <p><strong>Doador:</strong> {donation.donor_name}</p>
                        )}
                        {donation.donor_email && (
                          <p><strong>Email:</strong> {donation.donor_email}</p>
                        )}
                        {donation.donor_phone && (
                          <p><strong>Telefone:</strong> {donation.donor_phone}</p>
                        )}
                        {donation.donation_purpose && (
                          <p><strong>Finalidade:</strong> {donation.donation_purpose}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Criada: {new Date(donation.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        {donation.stripe_session_id && (
                          <span>Session: {donation.stripe_session_id.substring(0, 20)}...</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDonation(donation)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {donation.stripe_session_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://dashboard.stripe.com/payments/${donation.stripe_payment_intent_id || donation.stripe_session_id}`, '_blank')}
                          className="text-blue-600"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedDonation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-6 w-6" />
                    <div>
                      <h3 className="text-xl font-bold">
                        {formatCurrency(selectedDonation.amount, selectedDonation.currency)}
                      </h3>
                      <p className="text-blue-200">
                        Doação #{selectedDonation.id.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDonation(null)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="space-y-6">
                  {/* Status */}
                  <div className="text-center">
                    <span className={`inline-block px-4 py-2 rounded-full font-medium ${getStatusColor(selectedDonation.status)}`}>
                      {getStatusLabel(selectedDonation.status)}
                    </span>
                  </div>

                  {/* Informações do Doador */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Informações do Doador</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {selectedDonation.donor_name && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <User className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Nome</p>
                            <p className="font-semibold text-gray-800">{selectedDonation.donor_name}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedDonation.donor_email && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold text-gray-800">{selectedDonation.donor_email}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedDonation.donor_phone && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="text-sm text-gray-600">Telefone</p>
                            <p className="font-semibold text-gray-800">{selectedDonation.donor_phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detalhes da Doação */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Detalhes da Doação</h4>
                    <div className="space-y-3">
                      {selectedDonation.donation_purpose && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Finalidade</p>
                          <p className="text-blue-800">{selectedDonation.donation_purpose}</p>
                        </div>
                      )}
                      
                      {selectedDonation.message && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Mensagem</p>
                          <p className="text-green-800">{selectedDonation.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações Técnicas */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Informações Técnicas</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID da Doação:</span>
                        <span className="font-mono text-gray-800">{selectedDonation.id}</span>
                      </div>
                      {selectedDonation.stripe_session_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stripe Session:</span>
                          <span className="font-mono text-gray-800">{selectedDonation.stripe_session_id}</span>
                        </div>
                      )}
                      {selectedDonation.stripe_payment_intent_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Intent:</span>
                          <span className="font-mono text-gray-800">{selectedDonation.stripe_payment_intent_id}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Criada em:</span>
                        <span className="text-gray-800">
                          {new Date(selectedDonation.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Atualizada em:</span>
                        <span className="text-gray-800">
                          {new Date(selectedDonation.updated_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Link para Stripe Dashboard */}
                  {selectedDonation.stripe_session_id && (
                    <div className="text-center pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => window.open(`https://dashboard.stripe.com/payments/${selectedDonation.stripe_payment_intent_id || selectedDonation.stripe_session_id}`, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver no Dashboard do Stripe
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};