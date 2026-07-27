import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip } from '@mui/material';
import type { ClassDetail, CreateClassRequest, UpdateClassRequest } from '../../types/class';
import type { ApiError } from '../../types/common';
import * as classService from '../../services/classService';
import ActionButton from '../../components/common/ActionButton';
import Pagination, { usePagination } from '../../components/common/Pagination';

interface ModalState {
  type: 'create' | 'edit' | null;
  cls?: ClassDetail;
}

export default function ClassListPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [deleteTarget, setDeleteTarget] = useState<ClassDetail | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

  const { paginatedItems: paginatedClasses, currentPage, pageSize, totalItems, setCurrentPage, setPageSize } = usePagination(classes);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formError, setFormError] = useState('');

  const loadClasses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await classService.getAll();
      setClasses(data);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  function extractError(err: unknown): string {
    const axiosErr = err as AxiosError<ApiError>;
    return axiosErr.response?.data?.error?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }

  function openCreateModal() {
    setFormName('');
    setFormYear('');
    setFormError('');
    setModal({ type: 'create' });
  }

  function openEditModal(cls: ClassDetail) {
    setFormName(cls.name);
    setFormYear(cls.year);
    setFormError('');
    setModal({ type: 'edit', cls });
  }

  function closeModal() {
    setModal({ type: null });
    setFormError('');
  }

  function handleSubmit() {
    const event = { preventDefault: () => undefined } as FormEvent;
    void (modal.type === 'create' ? handleCreateSubmit(event) : handleEditSubmit(event));
  }

  async function handleCreateSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formYear.trim()) {
      setFormError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setActionLoading(true);
    try {
      const data: CreateClassRequest = {
        name: formName.trim(),
        year: formYear.trim(),
      };
      await classService.create(data);
      closeModal();
      await loadClasses();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!modal.cls) return;
    setFormError('');

    if (!formName.trim() || !formYear.trim()) {
      setFormError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setActionLoading(true);
    try {
      const data: UpdateClassRequest = {
        name: formName.trim(),
        year: formYear.trim(),
      };
      await classService.update(modal.cls.id, data);
      closeModal();
      await loadClasses();
    } catch (err) {
      setFormError(extractError(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await classService.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadClasses();
    } catch (err) {
      setError(extractError(err));
      setDeleteTarget(null);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div style={{ padding: 'clamp(12px, 3vw, 24px)', color: 'var(--edub-text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: 'var(--edub-text-primary)' }}>Danh sách lớp</h1>
        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-add"
        >
          + Thêm lớp
        </button>
      </div>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : classes.length === 0 ? (
        <Typography sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          Không có lớp học nào
        </Typography>
      ) : (
        <>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
            {paginatedClasses.map((cls) => (
              <Card key={cls.id} sx={{ position: 'relative' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ position: 'absolute', top: 6, right: 6, display: 'flex' }}>
                    <Tooltip title="Sửa lớp"><span><IconButton aria-label={`Sửa lớp ${cls.name}`} onClick={() => openEditModal(cls)} disabled={actionLoading} sx={{ minWidth: 44, minHeight: 44 }}><EditIcon fontSize="small" /></IconButton></span></Tooltip>
                    <Tooltip title="Xóa lớp"><span><IconButton aria-label={`Xóa lớp ${cls.name}`} color="error" onClick={() => setDeleteTarget(cls)} disabled={actionLoading} sx={{ minWidth: 44, minHeight: 44 }}><DeleteIcon fontSize="small" /></IconButton></span></Tooltip>
                  </Box>
                  <Typography component="button" onClick={() => navigate(`/lecturer/classes/${cls.id}`)} sx={{ p: 0, pr: 9, minHeight: 44, border: 0, background: 'none', color: 'primary.main', fontWeight: 700, textAlign: 'left' }}>{cls.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Năm học: {cls.year}</Typography>
                  <Typography variant="body2" color="text.secondary">Số học sinh: {cls.studentCount}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Tên lớp</th>
                <th style={thStyle}>Niên khóa</th>
                <th style={thStyle}>Số học sinh</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 16 }}>
                    Không có lớp học nào
                  </td>
                </tr>
              ) : (
                paginatedClasses.map((cls) => (
                  <tr
                    key={cls.id}
                    style={{ cursor: 'pointer', backgroundColor: hoveredRowId === cls.id ? 'var(--edub-hover)' : undefined, transition: 'background-color 0.15s' }}
                    onMouseEnter={() => setHoveredRowId(cls.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    onClick={() => navigate(`/lecturer/classes/${cls.id}`)}
                  >
                    <td style={tdStyle}>{cls.name}</td>
                    <td style={tdStyle}>{cls.year}</td>
                    <td style={tdStyle}>{cls.studentCount}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <ActionButton icon="edit" label="Sửa" color="warning" onClick={() => openEditModal(cls)} disabled={actionLoading} />
                        <ActionButton icon="delete" label="Xóa" color="error" onClick={() => setDeleteTarget(cls)} disabled={actionLoading} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </Box>
          <Pagination totalItems={totalItems} currentPage={currentPage} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </>
      )}

      {/* Create / Edit Modal */}
      <Dialog open={modal.type !== null} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {modal.type === 'create' ? 'Thêm lớp học' : 'Sửa lớp học'}
        </DialogTitle>

        {formError && (
          <Box sx={{ px: 3, pt: 0 }}>
            <Alert severity="error">{formError}</Alert>
          </Box>
        )}

        <DialogContent sx={{ pt: formError ? 1 : 2 }}>
          <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              label="Tên lớp"
              placeholder="Nhập tên lớp"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Năm học"
              placeholder="Nhập năm học (vd: 2024-2025)"
              value={formYear}
              onChange={(e) => setFormYear(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={closeModal} disabled={actionLoading}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" className="btn btn-update" disabled={actionLoading}>
            {actionLoading ? 'Đang xử lý...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa lớp <strong>{deleteTarget?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={actionLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            className="btn btn-delete"
            disabled={actionLoading}
          >
            {actionLoading ? 'Đang xử lý...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid var(--edub-table-border)',
  backgroundColor: 'var(--edub-table-header-bg)',
  color: 'var(--edub-table-header-text)',
  fontWeight: 600,
  fontSize: '14px',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--edub-table-border)',
}; // Desktop table cell styling.

