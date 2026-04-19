import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type DialogType = 'confirm' | 'alert' | 'danger';

interface DialogOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  icon?: string;
}

interface DialogState extends DialogOptions {
  resolve?: (value: boolean) => void;
  isOpen: boolean;
}

interface DialogContextValue {
  confirm: (opts: DialogOptions) => Promise<boolean>;
  alert: (opts: Omit<DialogOptions, 'cancelText'>) => Promise<void>;
  danger: (opts: DialogOptions) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used inside DialogProvider');
  return ctx;
}

const TYPE_STYLES: Record<DialogType, { icon: string; badgeBg: string; confirmBtn: string }> = {
  confirm: {
    icon: '❓',
    badgeBg: 'bg-blue-100 text-blue-600',
    confirmBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
  },
  alert: {
    icon: '⚠️',
    badgeBg: 'bg-amber-100 text-amber-600',
    confirmBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
  },
  danger: {
    icon: '🗑️',
    badgeBg: 'bg-red-100 text-red-600',
    confirmBtn: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
  },
};

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({ title: '', isOpen: false, type: 'confirm' });

  const open = useCallback(
    (opts: DialogOptions, asAlert: boolean) =>
      new Promise<boolean>((resolve) => {
        setState({
          ...opts,
          type: opts.type || (asAlert ? 'alert' : 'confirm'),
          isOpen: true,
          resolve,
        });
        if (asAlert) {
          // alert auto-resolves only when user dismisses
        }
      }),
    []
  );

  const confirm = useCallback((opts: DialogOptions) => open(opts, false), [open]);
  const danger = useCallback((opts: DialogOptions) => open({ ...opts, type: 'danger' }, false), [open]);
  const alert = useCallback(
    async (opts: Omit<DialogOptions, 'cancelText'>) => {
      await open({ ...opts, cancelText: '' }, true);
    },
    [open]
  );

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState((s) => ({ ...s, isOpen: false }));
  };

  const styles = TYPE_STYLES[state.type || 'confirm'];
  const icon = state.icon || styles.icon;

  return (
    <DialogContext.Provider value={{ confirm, alert, danger }}>
      {children}
      {state.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => handleClose(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className={`w-14 h-14 rounded-2xl ${styles.badgeBg} flex items-center justify-center text-3xl mb-4 mx-auto`}>
                {icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{state.title}</h3>
              {state.message && (
                <p className="text-sm text-gray-600 text-center whitespace-pre-wrap leading-relaxed">{state.message}</p>
              )}
            </div>
            <div className="px-6 pb-6 flex flex-col-reverse sm:flex-row gap-2">
              {state.cancelText !== '' && (
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  {state.cancelText || 'Cancelar'}
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                autoFocus
                className={`flex-1 px-4 py-3 ${styles.confirmBtn} text-white rounded-xl font-semibold shadow-lg transition-all`}
              >
                {state.confirmText || (state.type === 'danger' ? 'Eliminar' : 'Aceptar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
