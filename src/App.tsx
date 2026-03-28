import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, History, Trash2, MonitorSmartphone, AppWindow } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationHistory {
  id: string;
  value: number;
  createdAt: number;
}

export default function App() {
  const [value, setValue] = useState<string>('');
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [mode, setMode] = useState<'real' | 'fake'>('fake');
  const [showFakeOverlay, setShowFakeOverlay] = useState(false);
  const [overlayValue, setOverlayValue] = useState('');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    // Load history from local storage
    const savedHistory = localStorage.getItem('notificaPixHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
    }
  };

  const formatCurrency = (val: string) => {
    const numericValue = val.replace(/\D/g, '');
    const floatValue = parseFloat(numericValue) / 100;
    if (isNaN(floatValue)) return '';
    return floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatCurrency(e.target.value));
  };

  const triggerNotification = async () => {
    if (!value) return;

    const numericValue = parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.'));
    
    // Save to local history
    const newHistoryItem: NotificationHistory = {
      id: Date.now().toString(),
      value: numericValue,
      createdAt: Date.now()
    };
    
    const updatedHistory = [newHistoryItem, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem('notificaPixHistory', JSON.stringify(updatedHistory));

    // Trigger Notification based on mode
    if (mode === 'real') {
      const transparentPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      // Adicionando espaços invisíveis para empurrar o link para fora da tela
      const paddedTitle = 'PIX gerado' + '\u00A0'.repeat(60); 
      const paddedBody = `sua comissão: ${value}` + '\n\u200B'.repeat(10);

      if (permission === 'granted') {
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(paddedTitle, {
              body: paddedBody,
              icon: 'https://i.ibb.co/mrn3Ln9Z/channels4-profile-1.jpg',
              badge: transparentPng, // Ícone transparente na direita
              vibrate: [200, 100, 200],
            } as any);
          } catch (e) {
            console.error("SW notification failed, trying fallback", e);
            new Notification(paddedTitle, {
              body: paddedBody,
              icon: 'https://i.ibb.co/mrn3Ln9Z/channels4-profile-1.jpg',
              badge: transparentPng
            });
          }
        } else {
          new Notification(paddedTitle, {
            body: paddedBody,
            icon: 'https://i.ibb.co/mrn3Ln9Z/channels4-profile-1.jpg',
            badge: transparentPng
          });
        }
      } else {
        alert("Por favor, ative as permissões de notificação no topo da tela para receber o alerta real.");
      }
    } else {
      // Fake Overlay Mode (for perfect screenshots)
      setOverlayValue(value);
      setShowFakeOverlay(true);
      setTimeout(() => {
        setShowFakeOverlay(false);
      }, 4000);
    }
    
    setValue('');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('notificaPixHistory');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src="https://i.ibb.co/mrn3Ln9Z/channels4-profile-1.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-bold text-lg">NotificaPIX</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 mt-4">
        
        {/* Permission Banner */}
        {permission !== 'granted' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-900 text-sm">Ativar Notificações</h3>
              <p className="text-amber-700 text-xs mt-1 mb-2">Para receber a notificação real no sistema, ative as permissões.</p>
              <button 
                onClick={requestNotificationPermission}
                className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg font-medium"
              >
                Permitir
              </button>
            </div>
          </div>
        )}

        {/* Generator Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5">
          
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('fake')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'fake' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <AppWindow className="w-4 h-4" />
              Modo Print (Sem Link)
            </button>
            <button
              onClick={() => setMode('real')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'real' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MonitorSmartphone className="w-4 h-4" />
              Notificação Real
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Comissão</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={value}
                onChange={handleValueChange}
                placeholder="R$ 0,00"
                className="w-full text-2xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-emerald-500 bg-transparent py-2 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            onClick={triggerNotification}
            disabled={!value}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-lg shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Bell className="w-5 h-5" />
            Enviar Notificação
          </button>
          
          <p className="text-xs text-center text-gray-400">
            {mode === 'fake' 
              ? "A notificação aparecerá na tela do app, perfeita para prints sem mostrar links."
              : "A notificação aparecerá no sistema do celular (pode mostrar o link do site por segurança do Android)."}
          </p>
        </div>

        {/* History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-gray-700">
              <History className="w-5 h-5" />
              <h2 className="font-semibold">Histórico Recente</h2>
            </div>
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
              Nenhuma notificação gerada ainda.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-bold text-lg">R$</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Realistic In-App Notification Overlay (Android 12+ Style) */}
      <AnimatePresence>
        {showFakeOverlay && (
          <motion.div
            initial={{ y: -150, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -150, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center"
          >
            {/* Android style notification bubble (Dark mode) */}
            <div className="bg-[#2d302d] text-white shadow-2xl rounded-[28px] p-4 flex items-center gap-4 w-full max-w-[400px]">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-emerald-600 flex items-center justify-center">
                <img src="https://i.ibb.co/mrn3Ln9Z/channels4-profile-1.jpg" alt="App Icon" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-[16px] leading-tight">PIX gerado</h4>
                  <span className="text-[12px] text-gray-400">agora</span>
                </div>
                <p className="text-[14px] text-gray-300 mt-1 leading-tight">
                  sua comissão: {overlayValue}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
