import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, History, Trash2, MonitorSmartphone, AppWindow, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationHistory {
  id: string;
  value: number;
  createdAt: number;
  title?: string;
  message?: string;
}

export default function App() {
  const [value, setValue] = useState<string>('');
  const [title, setTitle] = useState('Pix gerado!!!');
  const [message, setMessage] = useState('sua comissão:');
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [mode, setMode] = useState<'real' | 'fake'>('fake');
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatorStep, setSimulatorStep] = useState<'lock' | 'dash'>('lock');
  const [appName, setAppName] = useState('Cakto');
  const [appLogo, setAppLogo] = useState('https://i.ibb.co/mrn3Ln9Z/channels4-profile-1.jpg');
  const [iconBgColor, setIconBgColor] = useState('#ffffff');
  const [quantity, setQuantity] = useState(5);
  const [badge, setBadge] = useState(78);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

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
    try {
      if (!('Notification' in window)) {
        // Silently grant permission to hide the banner in APK WebViews
        setPermission('granted');
        return;
      }
      const perm = await Notification.requestPermission();
      setPermission(perm);
    } catch (error) {
      console.error("Erro ao pedir permissão:", error);
      // Fallback for strict environments
      setPermission('granted');
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
      createdAt: Date.now(),
      title,
      message
    };
    
    const updatedHistory = [newHistoryItem, ...history].slice(0, 50); // Keep last 50
    setHistory(updatedHistory);
    localStorage.setItem('notificaPixHistory', JSON.stringify(updatedHistory));

    // Trigger Notification based on mode
    if (mode === 'real' && 'Notification' in window) {
      const spacer = '\u00A0'.repeat(250);
      // Aumentamos para 250 espaços para garantir que o link suma em qualquer resolução
      const finalTitle = `\u00A0${spacer}\n\u00A0\n\u00A0\nCakto`;
      // Corpo com Pix gerado e Sua comissão
      const finalBody = `Pix gerado!\nSua comissão: ${value}`;

      if (permission === 'granted') {
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(finalTitle, {
              body: finalBody,
              icon: 'https://i.ibb.co/dhzgGMY/154879-1.png',
              vibrate: [200, 100, 200],
            } as any);
          } catch (e) {
            console.error("SW notification failed, trying fallback", e);
            new Notification(finalTitle, {
              body: finalBody,
              icon: 'https://i.ibb.co/dhzgGMY/154879-1.png'
            } as any);
          }
        } else {
          new Notification(finalTitle, {
            body: finalBody,
            icon: 'https://i.ibb.co/dhzgGMY/154879-1.png'
          } as any);
        }
      } else {
        alert("Por favor, ative as permissões de notificação no topo da tela para receber o alerta real.");
      }
    } else {
      // Full Simulator Mode (from user's HTML)
      setSimulatorStep('lock');
      setShowSimulator(true);
      
      // Request Fullscreen
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.log('Fullscreen not supported');
      }
    }
    
    setValue('');
  };

  const exitSimulator = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setShowSimulator(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAppLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
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
          <h1 className="font-bold text-lg">Cakto</h1>
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

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do App</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full text-sm border-b border-gray-200 focus:border-emerald-500 bg-transparent py-1 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor Ícone</label>
                <input
                  type="color"
                  value={iconBgColor}
                  onChange={(e) => setIconBgColor(e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                <img src={appLogo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <label className="flex-1">
                <span className="block text-xs font-medium text-gray-500 mb-1">Trocar Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                <label htmlFor="logo-upload" className="block text-center text-xs bg-gray-100 hover:bg-gray-200 py-2 rounded-lg cursor-pointer font-medium">
                  Selecionar Arquivo
                </label>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Notificações</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  min="1" max="15"
                  className="w-full text-sm border-b border-gray-200 focus:border-emerald-500 bg-transparent py-1 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge (Ícone)</label>
                <input
                  type="number"
                  value={badge}
                  onChange={(e) => setBadge(parseInt(e.target.value))}
                  className="w-full text-sm border-b border-gray-200 focus:border-emerald-500 bg-transparent py-1 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título da Notificação</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-lg font-medium text-gray-900 border-b-2 border-gray-200 focus:border-emerald-500 bg-transparent py-2 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto da Notificação</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-lg font-medium text-gray-900 border-b-2 border-gray-200 focus:border-emerald-500 bg-transparent py-2 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
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
                        {item.title || 'Pix gerado!!!'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.message || 'sua comissão:'} {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} • {new Date(item.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Full Screen Simulator Overlay */}
      <AnimatePresence>
        {showSimulator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black overflow-hidden select-none"
          >
            {/* Lock Screen Step */}
            {simulatorStep === 'lock' && (
              <div className="relative h-full w-full">
                {/* Background */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80" 
                    alt="Wallpaper" 
                    className="w-full h-full object-cover blur-[35px] brightness-[0.6] scale-110" 
                  />
                  <div className="absolute inset-0 bg-white/10" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col px-4 pt-10 pb-32 overflow-y-auto">
                  {/* Time */}
                  <div className="text-center mb-8">
                    <h2 className="text-[78px] font-extralight text-white/95 tracking-tighter leading-none drop-shadow-lg">
                      {currentTime}
                    </h2>
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Central de Notificações</h3>
                    <button onClick={exitSimulator} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-2xl">×</button>
                  </div>

                  {/* App Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-white font-semibold">{appName}</span>
                      <div className="flex gap-2">
                        <button className="bg-white/12 text-white/85 px-3 py-1.5 rounded-full text-xs font-medium">Mostrar menos</button>
                        <button onClick={exitSimulator} className="w-7 h-7 rounded-full bg-white/12 flex items-center justify-center text-white text-lg">×</button>
                      </div>
                    </div>

                    {/* Notification Stack */}
                    <div className="space-y-2.5">
                      {Array.from({ length: quantity }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: -12, opacity: 0, scale: 0.97 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => setSimulatorStep('dash')}
                          className="bg-white/90 backdrop-blur-3xl rounded-[19px] p-3.5 flex items-center gap-3 shadow-lg border-t border-white/60 cursor-pointer active:scale-[0.98] transition-transform"
                        >
                          <div className="relative shrink-0">
                            {i === 0 && badge > 0 && (
                              <div className="absolute -top-1.5 -left-1.5 bg-[#ff3b30] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white/90 min-w-[20px] text-center">
                                {badge}
                              </div>
                            )}
                            <div className="w-11 h-11 rounded-[11px] overflow-hidden shadow-md" style={{ backgroundColor: iconBgColor }}>
                              <img src={appLogo} alt="App Icon" className="w-full h-full object-cover" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[15px] text-black leading-tight">{title}</h4>
                            <p className="text-[14px] text-gray-700 leading-tight mt-0.5">{message} {value}</p>
                          </div>
                          <span className="text-[13px] text-gray-500 font-medium shrink-0">agora</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-10 flex justify-around items-center bg-gradient-to-t from-black/90 to-transparent">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Smartphone className="text-white w-7 h-7" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <div className="text-white font-bold text-2xl">$</div>
                    </div>
                    <span className="text-[11px] font-semibold text-white/85">Make money</span>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center">
                    <AppWindow className="text-white w-7 h-7" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/50 rounded-full" />
              </div>
            )}

            {/* Dashboard Step */}
            {simulatorStep === 'dash' && (
              <div className="h-full w-full bg-[#f8f9fa] flex flex-col">
                <div className="bg-[#10b981] pt-12 pb-8 px-5 rounded-b-[30px] shadow-lg text-white">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2.5">
                      <img src={appLogo} alt="Logo" className="w-9 h-9 rounded-lg object-cover" />
                      <span className="font-bold text-lg">{appName}</span>
                    </div>
                    <button onClick={exitSimulator} className="bg-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold">Sair</button>
                  </div>
                  <p className="text-sm opacity-90 mb-1">Saldo disponível</p>
                  <h2 className="text-4xl font-extrabold tracking-tight">R$ 12.450,00</h2>
                </div>

                <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4 -mt-12">
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Vendas hoje</p>
                      <p className="text-xl font-bold text-gray-800">24</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                      <p className="text-xs text-gray-500 mb-1">Comissão hoje</p>
                      <p className="text-xl font-bold text-emerald-500">{value}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
                    <h3 className="font-bold text-lg text-gray-800">Últimas Vendas</h3>
                    <div className="divide-y divide-gray-100">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="py-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-800">Venda Aprovada</h4>
                            <p className="text-xs text-gray-400">Há {i * 5} minutos</p>
                          </div>
                          <span className="font-bold text-emerald-500">+ {value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
