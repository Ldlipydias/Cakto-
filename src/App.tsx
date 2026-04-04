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
  const [quantity, setQuantity] = useState(7);
  const [badge, setBadge] = useState<number | string>('');
  const [currentTime, setCurrentTime] = useState('');
  const [clockStyle, setClockStyle] = useState('1');
  const [blurAmount, setBlurAmount] = useState(35);
  const [wallpaper, setWallpaper] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80');

  const presetWallpapers: Record<string, string> = {
    nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
    city: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80',
    abstract: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80',
    dark: 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=800&q=80',
    gradient: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80',
    portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'
  };

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
    const formatted = formatCurrency(e.target.value);
    setValue(formatted);
    // Auto-update message if it contains commission text
    if (formatted) {
      setMessage(`Sua comissão: ${formatted}`);
    }
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

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setWallpaper(event.target.result as string);
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
            {/* App Config Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Configuração do App</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Nome do App</label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="w-full text-sm border-b-2 border-gray-100 focus:border-emerald-500 bg-transparent py-1.5 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Cor do Ícone</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={iconBgColor}
                      onChange={(e) => setIconBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none"
                    />
                    <span className="text-xs font-mono text-gray-400">{iconBgColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-100 shrink-0 shadow-sm">
                  <img src={appLogo} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Logo do App</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                  <label htmlFor="logo-upload" className="block text-center text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 py-2.5 rounded-xl cursor-pointer font-bold transition-colors">
                    📷 Trocar Logo
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conteúdo da Notificação</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm border-b-2 border-gray-100 focus:border-emerald-500 bg-transparent py-1.5 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Valor / Comissão</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={value}
                  onChange={handleValueChange}
                  placeholder="R$ 0,00"
                  className="w-full text-xl font-bold text-gray-900 border-b-2 border-gray-100 focus:border-emerald-500 bg-transparent py-1.5 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Mensagem / Subtítulo</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-sm border-b-2 border-gray-100 focus:border-emerald-500 bg-transparent py-1.5 outline-none transition-colors resize-none h-16"
                />
              </div>
            </div>

            {/* Visual Config Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estilo Visual (iPhone)</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Estilo Relógio</label>
                  <select 
                    value={clockStyle}
                    onChange={(e) => setClockStyle(e.target.value)}
                    className="w-full text-sm border-b-2 border-gray-100 focus:border-emerald-500 bg-transparent py-1.5 outline-none"
                  >
                    <option value="1">iOS Clássico</option>
                    <option value="2">Bold Moderno</option>
                    <option value="3">Com Data</option>
                    <option value="4">Minimalista</option>
                    <option value="5">Digital Neon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Badge (Ícone)</label>
                  <input
                    type="number"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Vazio = sem"
                    className="w-full text-sm border-b-2 border-gray-100 focus:border-emerald-500 bg-transparent py-1.5 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Qtd. Notificações</label>
                <input
                  type="range"
                  min="1" max="15"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                  <span>1</span>
                  <span>{quantity}</span>
                  <span>15</span>
                </div>
              </div>
            </div>

            {/* Wallpaper Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Wallpaper & Blur</h3>
              
              <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-100 group">
                <img src={wallpaper} alt="Wallpaper" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <input type="file" accept="image/*" onChange={handleWallpaperUpload} className="hidden" id="wallpaper-upload" />
                  <label htmlFor="wallpaper-upload" className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">
                    Trocar Fundo
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {Object.keys(presetWallpapers).map(key => (
                  <button 
                    key={key}
                    onClick={() => setWallpaper(presetWallpapers[key])}
                    className="text-[10px] font-bold py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 capitalize"
                  >
                    {key}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Intensidade do Blur</label>
                <input
                  type="range"
                  min="0" max="80"
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                  <span>Nítido</span>
                  <span>{blurAmount}px</span>
                  <span>Máximo</span>
                </div>
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
                    src={wallpaper} 
                    alt="Wallpaper" 
                    className="w-full h-full object-cover brightness-[0.6] scale-110" 
                    style={{ filter: `blur(${blurAmount}px) brightness(0.6)` }}
                  />
                  <div className="absolute inset-0 bg-black/5" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col px-4 pt-10 pb-40 overflow-y-auto">
                  {/* Time Section with Styles */}
                  <div className="text-center mb-8">
                    {clockStyle === '1' && (
                      <h2 className="text-[78px] font-extralight text-white/95 tracking-tighter leading-none drop-shadow-lg">
                        {currentTime}
                      </h2>
                    )}
                    {clockStyle === '2' && (
                      <h2 className="text-[72px] font-bold text-white tracking-tight leading-none drop-shadow-2xl">
                        {currentTime}
                      </h2>
                    )}
                    {clockStyle === '3' && (
                      <div className="flex flex-col items-center">
                        <h2 className="text-[64px] font-light text-white/95 tracking-tight leading-none">
                          {currentTime}
                        </h2>
                        <span className="text-lg text-white/85 font-medium mt-1">
                          {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    )}
                    {clockStyle === '4' && (
                      <h2 className="text-[56px] font-medium text-white tracking-normal leading-none">
                        {currentTime}
                      </h2>
                    )}
                    {clockStyle === '5' && (
                      <h2 className="text-[68px] font-bold text-[#00ff88] tracking-[4px] leading-none drop-shadow-[0_0_20px_rgba(0,255,136,0.5)] font-mono">
                        {currentTime}
                      </h2>
                    )}
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
                          transition={{ delay: i * 0.06 }}
                          onClick={() => setSimulatorStep('dash')}
                          className="bg-white/88 backdrop-blur-[50px] rounded-[19px] p-3.5 flex items-center gap-3 shadow-lg border-t border-white/60 cursor-pointer active:scale-[0.98] transition-transform"
                        >
                          <div className="relative shrink-0">
                            {i === 0 && badge && (
                              <div className="absolute -top-1.5 -left-1.5 bg-[#ff3b30] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white/90 min-w-[20px] text-center z-10">
                                {badge}
                              </div>
                            )}
                            <div className="w-11 h-11 rounded-[11px] overflow-hidden shadow-md" style={{ backgroundColor: iconBgColor }}>
                              <img src={appLogo} alt="App Icon" className="w-full h-full object-cover" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[15px] text-black leading-tight">{title}</h4>
                            <p className="text-[14px] text-gray-700 leading-tight mt-0.5">{message}</p>
                          </div>
                          <span className="text-[13px] text-gray-500 font-medium shrink-0">agora</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions - iPhone Exact Proportion */}
                <div className="absolute bottom-0 left-0 right-0 p-7 pb-12 flex justify-between items-end bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
                  <button 
                    onClick={(e) => { e.stopPropagation(); alert('🔦 Lanterna ativada!'); }}
                    className="w-[50px] h-[50px] rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center shadow-xl active:scale-95 transition-all pointer-events-auto"
                  >
                    <img src="https://i.ibb.co/gFVw8ZRf/af01eaca-a0f9-4799-a742-922c2f1bd4b1-1.png" alt="Flashlight" className="w-7 h-7 object-contain brightness-200" />
                  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); alert('📷 Abrindo câmera...'); }}
                    className="w-[50px] h-[50px] rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center shadow-xl active:scale-95 transition-all pointer-events-auto"
                  >
                    <img src="https://i.ibb.co/Kp2y8VpX/d41e74800b28d7f7598e21fa7faf51bd.png" alt="Camera" className="w-7 h-7 object-contain brightness-200" />
                  </button>
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
