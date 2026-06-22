import { useState, useMemo } from 'react';
import { useStore } from '@/store';
import {
  AlertTriangle,
  Phone,
  Home,
  MessageSquare,
  MessageCircle,
  MoreHorizontal,
  Plus,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  UserCheck,
  Ban,
  PhoneOff,
  ShoppingCart,
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { CollectionNotice, CollectionMethod, CollectionResult } from '@/types';

export default function Collection() {
  const farmers = useStore((s) => s.farmers);
  const creditRecords = useStore((s) => s.creditRecords);
  const saleOrders = useStore((s) => s.saleOrders);
  const getCollectionNotices = useStore((s) => s.getCollectionNotices);
  const addCollectionRecord = useStore((s) => s.addCollectionRecord);
  const getCollectionRecords = useStore((s) => s.getCollectionRecords);
  const addCreditPayment = useStore((s) => s.addCreditPayment);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedNotice, setSelectedNotice] = useState<string | null>(null);
  const [showAddRecord, setShowAddRecord] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [recordForm, setRecordForm] = useState({
    method: 'phone' as CollectionMethod,
    result: 'pending' as CollectionResult,
    contactPerson: '',
    contactPhone: '',
    promisedPayDate: '',
    promisedAmount: '',
    notes: '',
  });

  const collectionNotices = useMemo(() => {
    const notices = getCollectionNotices();
    if (filterStatus === 'all') return notices;
    return notices.filter((n) => n.status === filterStatus);
  }, [getCollectionNotices, filterStatus, refreshKey]);

  const stats = useMemo(() => {
    const notices = getCollectionNotices();
    return {
      total: notices.length,
      pending: notices.filter((n) => n.status === 'pending').length,
      inProgress: notices.filter((n) => n.status === 'in_progress').length,
      overdue: notices.filter((n) => n.status === 'overdue').length,
      resolved: notices.filter((n) => n.status === 'resolved').length,
      totalAmount: notices.reduce((sum, n) => sum + n.remainingAmount, 0),
    };
  }, [getCollectionNotices, refreshKey]);

  const selectedNoticeData = collectionNotices.find((n) => n.id === selectedNotice);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddRecord) return;

    const notice = collectionNotices.find((n) => n.id === showAddRecord);
    if (!notice) return;

    const farmer = farmers.find((f) => f.id === notice.farmerId);

    addCollectionRecord({
      collectionNoticeId: notice.id,
      creditRecordId: notice.creditRecordId,
      farmerId: notice.farmerId,
      method: recordForm.method,
      result: recordForm.result,
      contactPerson: recordForm.contactPerson || farmer?.name || '',
      contactPhone: recordForm.contactPhone || farmer?.phone || '',
      promisedPayDate: recordForm.promisedPayDate || undefined,
      promisedAmount: recordForm.promisedAmount ? Number(recordForm.promisedAmount) : undefined,
      notes: recordForm.notes,
    });

    setShowAddRecord(null);
    setRecordForm({
      method: 'phone',
      result: 'pending',
      contactPerson: '',
      contactPhone: '',
      promisedPayDate: '',
      promisedAmount: '',
      notes: '',
    });
    setRefreshKey((k) => k + 1);
  };

  const handlePayment = () => {
    if (!showPayment || !paymentAmount) return;
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    addCreditPayment(showPayment, amount);
    setShowPayment(null);
    setPaymentAmount('');
    setRefreshKey((k) => k + 1);
  };

  const openAddRecord = (notice: CollectionNotice) => {
    const farmer = farmers.find((f) => f.id === notice.farmerId);
    setRecordForm({
      method: 'phone',
      result: 'pending',
      contactPerson: farmer?.name || '',
      contactPhone: farmer?.phone || '',
      promisedPayDate: '',
      promisedAmount: '',
      notes: '',
    });
    setShowAddRecord(notice.id);
  };

  const urgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            非常紧急
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-50 text-gold-700 text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            紧急
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-100 text-surface-600 text-xs font-medium">
            <Clock className="w-3 h-3" />
            普通
          </span>
        );
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
            <Clock className="w-3 h-3" />
            待催收
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-50 text-gold-700 text-xs font-medium">
            <MessageSquare className="w-3 h-3" />
            催收中
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            已结清
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            已逾期
          </span>
        );
      default:
        return null;
    }
  };

  const methodIcon = (method: string) => {
    switch (method) {
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'visit':
        return <Home className="w-4 h-4" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4" />;
      case 'wechat':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const methodLabel = (method: string) => {
    switch (method) {
      case 'phone':
        return '电话催收';
      case 'visit':
        return '上门催收';
      case 'sms':
        return '短信催收';
      case 'wechat':
        return '微信催收';
      default:
        return '其他方式';
    }
  };

  const resultIcon = (result: string) => {
    switch (result) {
      case 'promised':
        return <Calendar className="w-4 h-4 text-gold-600" />;
      case 'partial_paid':
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-primary-600" />;
      case 'refused':
        return <Ban className="w-4 h-4 text-red-600" />;
      case 'unreachable':
        return <PhoneOff className="w-4 h-4 text-surface-500" />;
      default:
        return <Clock className="w-4 h-4 text-surface-500" />;
    }
  };

  const resultLabel = (result: string) => {
    switch (result) {
      case 'pending':
        return '待跟进';
      case 'promised':
        return '承诺还款';
      case 'partial_paid':
        return '部分还款';
      case 'paid':
        return '已结清';
      case 'refused':
        return '拒绝还款';
      case 'unreachable':
        return '联系不上';
      default:
        return result;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">赊账催收管理</h1>
          <p className="text-sm text-surface-500 mt-1">秋收前30天自动生成催收清单，跟踪催收进度</p>
        </div>
        <Link
          to="/sales?source=collection"
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          新增赊账
        </Link>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-surface-600" />
            </div>
            <div>
              <p className="text-xs text-surface-500">待催收总数</p>
              <p className="text-xl font-bold text-surface-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-surface-500">待催收</p>
              <p className="text-xl font-bold text-blue-600">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <p className="text-xs text-surface-500">催收中</p>
              <p className="text-xl font-bold text-gold-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-surface-500">已逾期</p>
              <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-surface-500">已结清</p>
              <p className="text-xl font-bold text-primary-600">{stats.resolved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-surface-500">待收总金额</p>
              <p className="text-xl font-bold text-red-600 font-mono">¥{stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
          }`}
        >
          全部 ({stats.total})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'pending'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
          }`}
        >
          待催收 ({stats.pending})
        </button>
        <button
          onClick={() => setFilterStatus('in_progress')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'in_progress'
              ? 'bg-gold-600 text-white shadow-sm'
              : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
          }`}
        >
          催收中 ({stats.inProgress})
        </button>
        <button
          onClick={() => setFilterStatus('overdue')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'overdue'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
          }`}
        >
          已逾期 ({stats.overdue})
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 h-[calc(100vh-340px)]">
        <div className="col-span-2 flex flex-col gap-3 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-2">
            {collectionNotices.length === 0 ? (
              <div className="bg-white rounded-xl border border-surface-200 p-8 text-center">
                <CheckCircle className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                <p className="text-sm text-surface-500">暂无催收任务</p>
                <p className="text-xs text-surface-400 mt-1">农户赊账将在秋收前30天自动生成催收清单</p>
              </div>
            ) : (
              collectionNotices.map((notice) => {
                const records = getCollectionRecords(notice.id);
                const isExpanded = expandedNotice === notice.id;
                return (
                  <div
                    key={notice.id}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                      notice.urgency === 'critical'
                        ? 'border-red-300'
                        : notice.urgency === 'urgent'
                        ? 'border-gold-300'
                        : 'border-surface-200'
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedNotice(isExpanded ? null : notice.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              notice.urgency === 'critical'
                                ? 'bg-red-100 text-red-600'
                                : notice.urgency === 'urgent'
                                ? 'bg-gold-100 text-gold-600'
                                : 'bg-surface-100 text-surface-600'
                            }`}
                          >
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-surface-900">{notice.farmerName}</h3>
                              {urgencyLabel(notice.urgency)}
                              {statusLabel(notice.status)}
                            </div>
                            <p className="text-xs text-surface-500 mt-0.5">{notice.farmerPhone}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm">
                                <span className="text-surface-500">欠款:</span>{' '}
                                <span className="font-mono font-bold text-red-600">
                                  ¥{notice.remainingAmount.toFixed(2)}
                                </span>
                              </span>
                              <span className="text-sm">
                                <span className="text-surface-500">总额:</span>{' '}
                                <span className="font-mono text-surface-700">¥{notice.amount.toFixed(2)}</span>
                              </span>
                              <span className="text-sm">
                                <span className="text-surface-500">已还:</span>{' '}
                                <span className="font-mono text-primary-600">¥{notice.paidAmount.toFixed(2)}</span>
                              </span>
                              <span className="text-sm">
                                <span className="text-surface-500">到期:</span>{' '}
                                <span
                                  className={`font-medium ${
                                    notice.daysUntilDue <= 0 ? 'text-red-600' : 'text-surface-700'
                                  }`}
                                >
                                  {format(new Date(notice.expectedPayDate), 'yyyy-MM-dd')}
                                </span>
                              </span>
                              <span className="text-sm">
                                {notice.daysUntilDue > 0 ? (
                                  <span className="text-surface-500">
                                    还剩 <span className="font-semibold text-gold-600">{notice.daysUntilDue}</span> 天
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-semibold">
                                    已逾期 {Math.abs(notice.daysUntilDue)} 天
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {notice.status !== 'resolved' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAddRecord(notice);
                                }}
                                className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                记录催收
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowPayment(notice.creditRecordId);
                                  setPaymentAmount(notice.remainingAmount.toFixed(2));
                                }}
                                className="px-3 py-1.5 bg-gold-500 text-white rounded-lg text-xs font-medium hover:bg-gold-600 transition-colors flex items-center gap-1"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                还款
                              </button>
                            </>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-surface-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-surface-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && records.length > 0 && (
                      <div className="border-t border-surface-100 bg-surface-50 p-4">
                        <h4 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          催收历史记录 ({records.length})
                        </h4>
                        <div className="space-y-2">
                          {records.map((record) => (
                            <div
                              key={record.id}
                              className="bg-white rounded-lg border border-surface-200 p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-100 text-surface-700 text-xs">
                                    {methodIcon(record.method)}
                                    {methodLabel(record.method)}
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-50 text-surface-600 text-xs">
                                    {resultIcon(record.result)}
                                    {resultLabel(record.result)}
                                  </span>
                                </div>
                                <span className="text-xs text-surface-400">
                                  {format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm')}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-surface-500">联系人:</span>{' '}
                                  <span className="text-surface-700 font-medium">{record.contactPerson}</span>
                                </div>
                                <div>
                                  <span className="text-surface-500">联系电话:</span>{' '}
                                  <span className="text-surface-700 font-mono">{record.contactPhone}</span>
                                </div>
                                {record.promisedPayDate && (
                                  <div>
                                    <span className="text-surface-500">承诺还款日:</span>{' '}
                                    <span className="text-gold-600 font-medium">
                                      {format(new Date(record.promisedPayDate), 'yyyy-MM-dd')}
                                    </span>
                                  </div>
                                )}
                                {record.promisedAmount && (
                                  <div>
                                    <span className="text-surface-500">承诺金额:</span>{' '}
                                    <span className="font-mono text-primary-600 font-medium">
                                      ¥{record.promisedAmount.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {record.notes && (
                                <div className="mt-2 pt-2 border-t border-surface-100">
                                  <p className="text-xs text-surface-600">
                                    <span className="text-surface-500">备注:</span> {record.notes}
                                  </p>
                                </div>
                              )}
                              <div className="mt-2 text-right">
                                <span className="text-xs text-surface-400">操作人: {record.createdBy}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isExpanded && records.length === 0 && (
                      <div className="border-t border-surface-100 bg-surface-50 p-4 text-center">
                        <p className="text-sm text-surface-400">暂无催收记录</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden flex flex-col">
          {!selectedNoticeData ? (
            <div className="flex-1 flex flex-col items-center justify-center text-surface-400">
              <Users className="w-16 h-16 mb-3 opacity-30" />
              <p className="text-sm">选择左侧催收项查看详情</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-surface-200 bg-surface-50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      selectedNoticeData.urgency === 'critical'
                        ? 'bg-red-100 text-red-600'
                        : selectedNoticeData.urgency === 'urgent'
                        ? 'bg-gold-100 text-gold-600'
                        : 'bg-surface-100 text-surface-600'
                    }`}
                  >
                    {selectedNoticeData.farmerName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-surface-900">{selectedNoticeData.farmerName}</h2>
                    <p className="text-xs text-surface-500">{selectedNoticeData.farmerPhone}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-600 font-medium mb-1">待收金额</p>
                  <p className="text-2xl font-bold text-red-600 font-mono">
                    ¥{selectedNoticeData.remainingAmount.toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-50 rounded-lg p-3">
                    <p className="text-xs text-surface-500">赊账总额</p>
                    <p className="text-lg font-bold text-surface-900 font-mono">
                      ¥{selectedNoticeData.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-surface-50 rounded-lg p-3">
                    <p className="text-xs text-surface-500">已还金额</p>
                    <p className="text-lg font-bold text-primary-600 font-mono">
                      ¥{selectedNoticeData.paidAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="bg-surface-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-surface-500">还款进度</p>
                    <p className="text-xs font-medium text-surface-700">
                      {selectedNoticeData.amount > 0
                        ? ((selectedNoticeData.paidAmount / selectedNoticeData.amount) * 100).toFixed(0)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="w-full bg-surface-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${selectedNoticeData.amount > 0
                          ? (selectedNoticeData.paidAmount / selectedNoticeData.amount) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-surface-700">时间信息</h3>
                  <div className="bg-surface-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-500 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        约定还款日期
                      </span>
                      <span className="font-medium text-surface-900">
                        {format(new Date(selectedNoticeData.expectedPayDate), 'yyyy年MM月dd日')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        距到期
                      </span>
                      <span
                        className={`font-medium ${
                          selectedNoticeData.daysUntilDue <= 0 ? 'text-red-600' : 'text-gold-600'
                        }`}
                      >
                        {selectedNoticeData.daysUntilDue > 0
                          ? `${selectedNoticeData.daysUntilDue} 天`
                          : `已逾期 ${Math.abs(selectedNoticeData.daysUntilDue)} 天`}
                      </span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const credit = creditRecords.find((c) => c.id === selectedNoticeData.creditRecordId);
                  const order = saleOrders.find((o) => o.id === credit?.orderId);
                  if (!order) return null;

                  return (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-surface-700">赊账订单明细</h3>
                      <div className="bg-white border border-surface-200 rounded-lg overflow-hidden">
                        <div className="px-3 py-2 bg-surface-50 border-b border-surface-200">
                          <span className="text-xs font-mono text-surface-500">{order.orderNumber}</span>
                          <span className="text-xs text-surface-400 ml-2">
                            {format(new Date(order.saleDate), 'yyyy-MM-dd')}
                          </span>
                        </div>
                        <div className="p-3 space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-surface-600">
                                {item.productName} × {item.quantity}
                              </span>
                              <span className="font-mono text-surface-900">¥{item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="px-3 py-2 bg-surface-50 border-t border-surface-200 flex justify-between">
                          <span className="text-xs text-surface-500">合计</span>
                          <span className="text-sm font-bold font-mono text-surface-900">
                            ¥{order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const records = getCollectionRecords(selectedNoticeData.id);
                  if (records.length === 0) return null;

                  return (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-surface-700">最近催收记录</h3>
                      <div className="space-y-2">
                        {records.slice(0, 3).map((record) => (
                          <div key={record.id} className="bg-surface-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                {methodIcon(record.method)}
                                <span className="text-xs font-medium text-surface-700">
                                  {methodLabel(record.method)}
                                </span>
                              </div>
                              <span className="text-xs text-surface-400">
                                {format(new Date(record.createdAt), 'MM-dd HH:mm')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              {resultIcon(record.result)}
                              <span className="text-surface-600">{resultLabel(record.result)}</span>
                            </div>
                            {record.notes && (
                              <p className="text-xs text-surface-500 mt-1 line-clamp-2">{record.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="p-4 border-t border-surface-200 space-y-2">
                {selectedNoticeData.status !== 'resolved' && (
                  <>
                    <button
                      onClick={() => openAddRecord(selectedNoticeData)}
                      className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      记录催收
                    </button>
                    <button
                      onClick={() => {
                        setShowPayment(selectedNoticeData.creditRecordId);
                        setPaymentAmount(selectedNoticeData.remainingAmount.toFixed(2));
                      }}
                      className="w-full px-4 py-2.5 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      登记还款
                    </button>
                  </>
                )}
                <Link
                  to={`/sales?farmerId=${selectedNoticeData.farmerId}&source=collection`}
                  className="w-full px-4 py-2.5 bg-surface-100 text-surface-700 rounded-lg text-sm font-medium hover:bg-surface-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  新增赊账
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {showAddRecord && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowAddRecord(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                记录催收结果
              </h2>
              <button
                onClick={() => setShowAddRecord(null)}
                className="p-1 rounded-md hover:bg-surface-100 text-surface-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-2">催收方式</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'phone', label: '电话', icon: Phone },
                    { value: 'visit', label: '上门', icon: Home },
                    { value: 'sms', label: '短信', icon: MessageSquare },
                    { value: 'wechat', label: '微信', icon: MessageCircle },
                    { value: 'other', label: '其他', icon: MoreHorizontal },
                  ].map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setRecordForm({ ...recordForm, method: m.value as CollectionMethod })}
                      className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        recordForm.method === m.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-surface-200 hover:border-surface-300'
                      }`}
                    >
                      <m.icon className="w-4 h-4" />
                      <span className="text-xs">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-600 mb-2">催收结果</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'pending', label: '待跟进', icon: Clock, color: 'surface' },
                    { value: 'promised', label: '承诺还款', icon: Calendar, color: 'gold' },
                    { value: 'partial_paid', label: '部分还款', icon: DollarSign, color: 'blue' },
                    { value: 'paid', label: '已结清', icon: CheckCircle, color: 'primary' },
                    { value: 'refused', label: '拒绝还款', icon: Ban, color: 'red' },
                    { value: 'unreachable', label: '联系不上', icon: PhoneOff, color: 'surface' },
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() =>
                        setRecordForm({ ...recordForm, result: r.value as CollectionResult })
                      }
                      className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        recordForm.result === r.value
                          ? r.color === 'primary'
                            ? 'border-primary-500 bg-primary-50'
                            : r.color === 'gold'
                            ? 'border-gold-500 bg-gold-50'
                            : r.color === 'red'
                            ? 'border-red-500 bg-red-50'
                            : r.color === 'blue'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-surface-500 bg-surface-50'
                          : 'border-surface-200 hover:border-surface-300'
                      }`}
                    >
                      <r.icon
                        className={`w-4 h-4 ${
                          recordForm.result === r.value
                            ? r.color === 'primary'
                              ? 'text-primary-600'
                              : r.color === 'gold'
                              ? 'text-gold-600'
                              : r.color === 'red'
                              ? 'text-red-600'
                              : r.color === 'blue'
                              ? 'text-blue-600'
                              : 'text-surface-600'
                            : 'text-surface-400'
                        }`}
                      />
                      <span className="text-xs">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">联系人</label>
                  <input
                    type="text"
                    value={recordForm.contactPerson}
                    onChange={(e) => setRecordForm({ ...recordForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="联系人姓名"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-600 mb-1">联系电话</label>
                  <input
                    type="text"
                    value={recordForm.contactPhone}
                    onChange={(e) => setRecordForm({ ...recordForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="联系电话"
                  />
                </div>
              </div>

              {recordForm.result === 'promised' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-surface-600 mb-1">承诺还款日期</label>
                    <input
                      type="date"
                      value={recordForm.promisedPayDate}
                      onChange={(e) => setRecordForm({ ...recordForm, promisedPayDate: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-surface-600 mb-1">承诺金额(元)</label>
                    <input
                      type="number"
                      value={recordForm.promisedAmount}
                      onChange={(e) => setRecordForm({ ...recordForm, promisedAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="承诺还款金额"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1">催收备注</label>
                <textarea
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="记录催收过程中的重要信息，如农户反馈、特殊情况等..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecord(null)}
                  className="px-4 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm"
                >
                  保存记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPayment && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowPayment(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-600" />
              登记还款
            </h2>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1">还款金额(元)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0.01"
                step="0.01"
                autoFocus
                className="w-full px-3 py-2.5 border border-surface-200 rounded-lg text-sm font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <p className="text-xs text-surface-400 mt-2">输入还款金额，可部分还款或全额结清</p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowPayment(null)}
                className="px-4 py-2 border border-surface-300 rounded-lg text-sm font-medium text-surface-600 hover:bg-surface-50"
              >
                取消
              </button>
              <button
                onClick={handlePayment}
                disabled={!paymentAmount || Number(paymentAmount) <= 0}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                确认还款
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
