import React from 'react';

interface Props {
  phone?: string | null;
  email?: string | null;
  name?: string;
  size?: 'sm' | 'md';
  className?: string;
}

// Normalize phone for tel: / wa.me links (strip spaces, dashes, parens, leading +)
function cleanPhone(phone: string) {
  return phone.replace(/[\s\-()]/g, '').replace(/^\+/, '');
}

export default function ContactActions({ phone, email, name, size = 'sm', className = '' }: Props) {
  const iconSize = size === 'sm' ? 'w-7 h-7 text-sm' : 'w-9 h-9 text-base';
  const phoneClean = phone ? cleanPhone(phone) : '';
  const waMessage = name ? `Hola ${name}, te escribo desde MedAssembly.` : '';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {phone && (
        <>
          <a
            href={`tel:${phoneClean}`}
            title={`Llamar ${phone}`}
            onClick={e => e.stopPropagation()}
            className={`${iconSize} inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors`}
            aria-label="Llamar"
          >
            📞
          </a>
          <a
            href={`https://wa.me/${phoneClean}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`WhatsApp ${phone}`}
            onClick={e => e.stopPropagation()}
            className={`${iconSize} inline-flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors`}
            aria-label="WhatsApp"
          >
            💬
          </a>
        </>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          title={`Email ${email}`}
          onClick={e => e.stopPropagation()}
          className={`${iconSize} inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors`}
          aria-label="Email"
        >
          ✉️
        </a>
      )}
    </div>
  );
}
