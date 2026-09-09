'use client';

import { useRef, useState } from 'react';
import { X, ImagePlus, Loader2 } from 'lucide-react';

const CLOUDINARY_CLOUD_NAME = 'rparq8mz';
const CLOUDINARY_UPLOAD_PRESET = 'homeease_unsigned';

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
};

export default function PhotoUpload({ value, onChange, max = 8 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError('');
    setUploading(true);

    const remaining = max - value.length;
    const toUpload = Array.from(files).slice(0, remaining);

    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData },
        );
        if (!res.ok) throw new Error('Échec de l\'envoi de la photo.');
        const data = await res.json();
        uploaded.push(data.secure_url);
      }
      onChange([...value, ...uploaded]);
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue pendant l'envoi.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {value.map((url) => (
          <div key={url} className="relative">
            <img src={url} alt="" className="h-24 w-full rounded-lg object-cover bg-muted" />
            <button
              type="button"
              onClick={() => remove(url)}
              aria-label="Retirer la photo"
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-ink/40 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
            <span className="text-[10px]">{uploading ? 'Envoi...' : 'Ajouter'}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-ink/50">
        Appuyez sur "Ajouter" pour choisir des photos depuis votre galerie ou prendre une photo directement
        ({value.length}/{max}).
      </p>
    </div>
  );
}
