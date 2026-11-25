import React, { useState } from 'react';
import { Check, Download, RotateCcw } from 'lucide-react';
import { Campaign, SavedReport, UserProfile } from '../types/campaign';

interface ProfileViewProps {
  profile: UserProfile;
  campaigns: Campaign[];
  reports: SavedReport[];
  onSaveProfile: (profile: UserProfile) => void;
  onResetDemo: () => void;
  onNotify: (type: 'success' | 'warning' | 'error' | 'info', title: string, description?: string) => void;
}

export function ProfileView({
  profile,
  campaigns,
  reports,
  onSaveProfile,
  onResetDemo,
  onNotify,
}: ProfileViewProps) {
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [organization, setOrganization] = useState(profile.organization);
  const [email, setEmail] = useState(profile.email);
  const [defaultUnitNote, setDefaultUnitNote] = useState(profile.defaultUnitNote);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organization.trim()) {
      onNotify('warning', 'Data profil belum lengkap', 'Nama dan organisasi wajib diisi.');
      return;
    }
    onSaveProfile({
      name: name.trim(),
      role: role.trim() || 'Praktisi Hubungan Masyarakat',
      organization: organization.trim(),
      email: email.trim(),
      defaultUnitNote: defaultUnitNote.trim(),
    });
    onNotify('success', 'Profil diperbarui', 'Identitas penyusun laporan berhasil disimpan.');
  };

  const handleExportBackupJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile,
      campaigns,
      reports,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `humalysis-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('success', 'Cadangan data diekspor', 'Berkas JSON telah diunduh.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#1B1B1B]">
          Pengaturan Profil
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Identitas pengguna akan ditampilkan pada sapaan beranda dan dokumen laporan
          evaluasi.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#1B1B1B]">Nama Lengkap</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#1B1B1B]">
              Peran / Jabatan
            </span>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#1B1B1B]">
              Organisasi / Agensi
            </span>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[#1B1B1B]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-[#1B1B1B]">
            Catatan Standar Evaluasi
          </span>
          <input
            type="text"
            value={defaultUnitNote}
            onChange={(e) => setDefaultUnitNote(e.target.value)}
            className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#315CF5]"
          />
        </label>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#315CF5] text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-[#274cd1]"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>

      {/* Local Data & Backup Management */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="font-display text-base font-bold text-[#1B1B1B]">
            Pengelolaan Data Lokal
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Seluruh data kampanye dan riwayat laporan tersimpan otomatis di browser
            Anda. Anda dapat mencadangkan atau memulihkan data demo kapan saja.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportBackupJson}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#1B1B1B] hover:bg-[#F4F5F7] inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Cadangan Data (.json)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onResetDemo();
              onNotify('info', 'Data DEMO dipulihkan', 'Seluruh data awal telah dikembalikan.');
            }}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#D94B4B] hover:bg-[#D94B4B]/5 inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Pulihkan Data Demo Awal</span>
          </button>
        </div>
      </section>
    </div>
  );
}
