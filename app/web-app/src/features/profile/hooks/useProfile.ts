import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { User } from '../../../shared/types/user.types';
import { API_URL } from '../../../shared/config/api';

interface ProfileFormData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  celphone: string;
  userName: string;
}

const toFormData = (user: User): ProfileFormData => ({
  name: user.name || '',
  lastName: user.lastName || '',
  email: user.email || '',
  phone: user.phone || '',
  celphone: user.celphone || '',
  userName: user.userName || '',
});

export const useProfile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(authUser);
  const [formData, setFormData] = useState<ProfileFormData>(
    authUser ? toFormData(authUser) : ({} as ProfileFormData),
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/users/${authUser.id}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data: User = await res.json();
        setProfile(data);
        setFormData(toFormData(data));
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        // Si falla, seguimos mostrando los datos que ya tenemos en sesión.
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // Solo se ejecuta al montar: recarga desde el servidor una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(null);
  };

  const handleSave = useCallback(async () => {
    if (!authUser) return;

    setError(null);
    setSuccess(null);

    if (!formData.name.trim() || !formData.lastName.trim()) {
      setError('Nombre y apellido son obligatorios.');
      return;
    }
    if (!formData.email.trim()) {
      setError('El email es obligatorio.');
      return;
    }

    const wantsPasswordChange =
      newPassword.length > 0 || confirmPassword.length > 0;
    if (wantsPasswordChange) {
      if (newPassword.length < 8) {
        setError('La nueva contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    const payload: Record<string, unknown> = { ...formData };
    if (wantsPasswordChange) {
      payload.password = newPassword;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/${authUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      const updated: User = await res.json();
      setProfile(updated);
      setFormData(toFormData(updated));
      updateUser(updated);
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Perfil actualizado correctamente.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el perfil',
      );
    } finally {
      setSaving(false);
    }
  }, [authUser, formData, newPassword, confirmPassword, updateUser]);

  return {
    profile,
    formData,
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    loading,
    saving,
    error,
    success,
    handleChange,
    handleSave,
  };
};
