import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">MedAssembly</h1>
          <p className="text-gray-600 mt-2">Sistema de Primeros Auxilios</p>
        </div>
        {children}
      </div>
    </div>
  );
}
