import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
}

interface Snowflake {
  id: number;
  x: number;
  size: number;
  speed: number;
  opacity: number;
  y?: number;
}

interface Leader {
  name: string;
  score: number;
}

interface PromoCode {
  code: string;
  reward: number;
  used: boolean;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  
  const [clicks, setClicks] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [autoClicker, setAutoClicker] = useState(0);
  const [clickPower, setClickPower] = useState(0);
  const [megaBoost, setMegaBoost] = useState(0);
  const [ultraPower, setUltraPower] = useState(0);
  const [godMode, setGodMode] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [usedPromos, setUsedPromos] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leader[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const particleIdRef = useRef(0);
  const snowflakeIdRef = useRef(0);

  const promoCodes: PromoCode[] = [
    { code: 'dizzyt', reward: 5000, used: false },
    { code: 'anarchy', reward: 10000, used: false },
    { code: 'mega2024', reward: 15000, used: false },
  ];

  useEffect(() => {
    const savedAuth = localStorage.getItem('anarchyclick-auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setUsername(authData.username);
      setPassword(authData.password);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const savedData = localStorage.getItem(`anarchyclick-data-${username}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setClicks(data.clicks || 0);
      setMultiplier(data.multiplier || 1);
      setAutoClicker(data.autoClicker || 0);
      setClickPower(data.clickPower || 0);
      setMegaBoost(data.megaBoost || 0);
      setUltraPower(data.ultraPower || 0);
      setGodMode(data.godMode || 0);
      setUsedPromos(data.usedPromos || []);
    }
  }, [isAuthenticated, username]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const saveData = {
      clicks,
      multiplier,
      autoClicker,
      clickPower,
      megaBoost,
      ultraPower,
      godMode,
      usedPromos,
    };
    localStorage.setItem(`anarchyclick-data-${username}`, JSON.stringify(saveData));
  }, [clicks, multiplier, autoClicker, clickPower, megaBoost, ultraPower, godMode, usedPromos, username, isAuthenticated]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const createSnowflake = () => {
      const snowflake: Snowflake = {
        id: snowflakeIdRef.current++,
        x: Math.random() * window.innerWidth,
        size: 10 + Math.random() * 20,
        speed: 2 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.7,
      };
      setSnowflakes(prev => [...prev, snowflake]);
    };

    for (let i = 0; i < 20; i++) {
      setTimeout(() => createSnowflake(), i * 300);
    }

    const interval = setInterval(createSnowflake, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const moveSnowflakes = setInterval(() => {
      setSnowflakes(prev =>
        prev
          .map(flake => ({
            ...flake,
            y: (flake.y || 0) + flake.speed,
          }))
          .filter(flake => (flake.y || 0) < window.innerHeight)
      );
    }, 50);

    return () => clearInterval(moveSnowflakes);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const generateLeaderboard = () => {
      const mockLeaders: Leader[] = [
        { name: 'AnarchyMaster', score: clicks + 25000 },
        { name: 'ClickKing', score: clicks + 15000 },
        { name: 'TapLegend', score: clicks + 8000 },
        { name: username, score: clicks },
        { name: 'NoobClicker', score: Math.max(0, clicks - 3000) },
      ].sort((a, b) => b.score - a.score);
      
      setLeaderboard(mockLeaders);
    };

    generateLeaderboard();
    const interval = setInterval(generateLeaderboard, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [clicks, isAuthenticated, username]);

  const handleLogin = () => {
    if (!inputUsername.trim() || !inputPassword.trim()) {
      toast.error('Введите никнейм и пароль!');
      return;
    }

    const authData = {
      username: inputUsername,
      password: inputPassword,
    };
    localStorage.setItem('anarchyclick-auth', JSON.stringify(authData));
    setUsername(inputUsername);
    setPassword(inputPassword);
    setIsAuthenticated(true);
    toast.success(`Добро пожаловать, ${inputUsername}! 🎮`);
  };

  const playClickSound = (frequency: number = 600) => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const playBonusSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  const createParticle = (x: number, y: number) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    
    const particle: Particle = {
      id: particleIdRef.current++,
      x,
      y,
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
    };
    
    setParticles(prev => [...prev, particle]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particle.id));
    }, 800);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const clickValue = multiplier + autoClicker + clickPower + megaBoost + ultraPower + godMode;
    const newClicks = clicks + clickValue;
    setClicks(newClicks);
    setIsAnimating(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createParticle(x, y);
    playClickSound(600 + (newClicks % 10) * 50);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const applyPromoCode = () => {
    const promo = promoCodes.find(p => p.code.toLowerCase() === promoInput.toLowerCase());
    
    if (!promo) {
      toast.error('Неверный промокод!');
      return;
    }

    if (usedPromos.includes(promo.code)) {
      toast.error('Этот промокод уже использован!');
      return;
    }

    setClicks(prev => prev + promo.reward);
    setUsedPromos(prev => [...prev, promo.code]);
    toast.success(`Промокод активирован! +${promo.reward} тапов! 🎉`, { duration: 4000 });
    playBonusSound();
    setPromoInput('');
    setShowPromo(false);
  };

  const buyMultiplier = () => {
    if (clicks >= 500) {
      setClicks(prev => prev - 500);
      setMultiplier(prev => prev * 2);
      toast.success('Умножитель x' + (multiplier * 2), { duration: 3000 });
      playBonusSound();
    } else {
      toast.error('Недостаточно тапов! Нужно: 500');
    }
  };

  const buyAutoClicker = () => {
    if (clicks >= 1500) {
      setClicks(prev => prev - 1500);
      setAutoClicker(50);
      toast.success('Уничтожитель +50 💥', { duration: 3000 });
      playBonusSound();
    } else {
      toast.error('Недостаточно тапов! Нужно: 1500');
    }
  };

  const buyClickPower = () => {
    if (clicks >= 800) {
      setClicks(prev => prev - 800);
      setClickPower(prev => prev + 10);
      toast.success('Сила клика +10 ⚡', { duration: 3000 });
      playBonusSound();
    } else {
      toast.error('Недостаточно тапов! Нужно: 800');
    }
  };

  const buyMegaBoost = () => {
    if (clicks >= 3000) {
      setClicks(prev => prev - 3000);
      setMegaBoost(prev => prev + 100);
      toast.success('МЕГА-БУСТ +100! 🚀', { duration: 3000 });
      playBonusSound();
    } else {
      toast.error('Недостаточно тапов! Нужно: 3000');
    }
  };

  const buyUltraPower = () => {
    if (clicks >= 5000) {
      setClicks(prev => prev - 5000);
      setUltraPower(prev => prev + 250);
      toast.success('УЛЬТРА МОЩЬ +250! ⚡⚡', { duration: 3000 });
      playBonusSound();
    } else {
      toast.error('Недостаточно тапов! Нужно: 5000');
    }
  };

  const buyGodMode = () => {
    if (clicks >= 10000) {
      setClicks(prev => prev - 10000);
      setGodMode(prev => prev + 500);
      toast.success('БОГ РЕЖИМ +500! 👑', { duration: 3000 });
      playBonusSound();
    } else {
      toast.error('Недостаточно тапов! Нужно: 10000');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen game-gradient flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        
        {snowflakes.map(flake => (
          <div
            key={flake.id}
            className="absolute text-white pointer-events-none"
            style={{
              left: flake.x,
              top: flake.y || -50,
              fontSize: flake.size,
              opacity: flake.opacity,
            }}
          >
            ❄️
          </div>
        ))}

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl p-8 max-w-md w-full relative z-10">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-red-500 to-yellow-400 text-transparent bg-clip-text">
                AnarchyClick
              </h1>
              <p className="text-white/80 text-lg">Войди в игру</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold mb-2 block">Никнейм</label>
                <Input
                  type="text"
                  placeholder="Введи свой ник"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                />
              </div>

              <div>
                <label className="text-white font-semibold mb-2 block">Пароль</label>
                <Input
                  type="password"
                  placeholder="Придумай пароль"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                />
              </div>

              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-red-500 to-yellow-400 hover:from-red-600 hover:to-yellow-500 text-white font-bold text-lg py-6"
              >
                ВОЙТИ В ИГРУ
              </Button>
            </div>

            <p className="text-white/60 text-xs text-center">
              Твой никнейм и прогресс будут сохранены
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const totalPower = multiplier + autoClicker + clickPower + megaBoost + ultraPower + godMode;

  return (
    <div className="min-h-screen game-gradient flex flex-col p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      {snowflakes.map(flake => (
        <div
          key={flake.id}
          className="absolute text-white pointer-events-none"
          style={{
            left: flake.x,
            top: flake.y || -50,
            fontSize: flake.size,
            opacity: flake.opacity,
          }}
        >
          ❄️
        </div>
      ))}

      <div className="absolute top-4 left-4 z-20">
        <h2 className="text-3xl md:text-4xl font-black drop-shadow-2xl tracking-tight bg-gradient-to-r from-red-500 to-yellow-400 text-transparent bg-clip-text">
          AnarchyClick
        </h2>
        <p className="text-white/80 text-sm mt-1">Игрок: {username}</p>
      </div>

      <div className="fixed top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setShowPromo(!showPromo)}
          className="bg-green-500/80 hover:bg-green-600/80 backdrop-blur-md border-2 border-white/40 rounded-xl px-4 py-2 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <Icon name="Gift" size={20} className="text-white" />
            <span className="text-white font-bold text-sm">ПРОМО</span>
          </div>
        </button>

        <button
          onClick={() => setShowShop(!showShop)}
          className="bg-gradient-to-br from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 backdrop-blur-md border-2 border-white/40 rounded-xl px-4 py-2 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <Icon name="Store" size={20} className="text-white" />
            <span className="text-white font-bold text-sm">МАГАЗИН</span>
          </div>
        </button>
      </div>

      {showPromo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={() => setShowPromo(false)}>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Icon name="Gift" size={28} className="text-green-400" />
                  Промокод
                </h2>
                <button onClick={() => setShowPromo(false)} className="text-white/70 hover:text-white">
                  <Icon name="X" size={24} />
                </button>
              </div>

              <Input
                type="text"
                placeholder="Введи промокод"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
              />

              <Button
                onClick={applyPromoCode}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
              >
                АКТИВИРОВАТЬ
              </Button>

              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/70 text-xs">
                  Использовано промокодов: {usedPromos.length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showShop && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={() => setShowShop(false)}>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl p-5 max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <div className="flex items-center justify-between sticky top-0 bg-white/10 backdrop-blur-md py-2 -mt-2">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Icon name="Store" size={24} />
                  Магазин
                </h2>
                <button onClick={() => setShowShop(false)} className="text-white/70 hover:text-white">
                  <Icon name="X" size={24} />
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Умножитель', icon: 'Zap', color: 'text-accent', value: multiplier, price: 500, onClick: buyMultiplier, desc: 'Удваивает клик' },
                  { name: 'Уничтожитель', icon: 'Rocket', color: 'text-secondary', value: autoClicker, price: 1500, onClick: buyAutoClicker, desc: '+50 за клик', single: true },
                  { name: 'Сила клика', icon: 'Zap', color: 'text-yellow-400', value: clickPower, price: 800, onClick: buyClickPower, desc: '+10 за клик' },
                  { name: 'МЕГА-БУСТ', icon: 'Sparkles', color: 'text-pink-400', value: megaBoost, price: 3000, onClick: buyMegaBoost, desc: '+100 за клик' },
                  { name: 'УЛЬТРА МОЩЬ', icon: 'Flame', color: 'text-orange-400', value: ultraPower, price: 5000, onClick: buyUltraPower, desc: '+250 за клик' },
                  { name: 'БОГ РЕЖИМ', icon: 'Crown', color: 'text-yellow-300', value: godMode, price: 10000, onClick: buyGodMode, desc: '+500 за клик' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1">
                          <Icon name={item.icon as any} size={16} className={item.color} />
                          {item.name}
                        </h3>
                        <p className="text-white/60 text-xs">{item.desc}</p>
                        <p className="text-white/80 text-xs mt-1">
                          {item.single ? (item.value > 0 ? '✅' : '❌') : `+${item.value}`}
                        </p>
                      </div>
                      <Button
                        onClick={item.onClick}
                        disabled={clicks < item.price || (item.single && item.value > 0)}
                        size="sm"
                        className="bg-accent hover:bg-accent/90 text-xs px-3"
                      >
                        {item.price}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <p className="text-white/80 text-center font-medium text-sm">
                  💰 {clicks.toLocaleString()} тапов
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-2 border border-white/20 text-center">
                <a 
                  href="https://t.me/anarchyworld200" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Icon name="Send" size={14} />
                  Тгк @anarchyworld200
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center relative z-10 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-6 w-full">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl p-6 md:p-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">
                  Твои тапы
                </p>
                <div className={`text-6xl md:text-8xl font-black text-white transition-all ${isAnimating ? 'pulse-animation' : ''}`}>
                  {clicks.toLocaleString()}
                </div>
                {totalPower > 1 && (
                  <p className="text-white/60 text-xs font-medium">
                    За клик: +{totalPower}
                  </p>
                )}
              </div>

              <div className="relative">
                <Button
                  onClick={handleClick}
                  size="lg"
                  className="w-full h-28 md:h-36 text-2xl md:text-3xl font-black bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 hover:from-red-600 hover:via-orange-600 hover:to-yellow-500 border-4 border-white/40 shadow-2xl transition-all hover:scale-105 active:scale-95 rounded-3xl relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    🔥 TAP! 🔥
                  </span>
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </Button>

                {particles.map(particle => (
                  <div
                    key={particle.id}
                    className="absolute click-particle pointer-events-none text-3xl font-black text-yellow-300"
                    style={{
                      left: particle.x,
                      top: particle.y,
                      // @ts-ignore
                      '--tx': `${particle.tx}px`,
                      '--ty': `${particle.ty}px`,
                    }}
                  >
                    +{totalPower}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="relative z-10 mt-4 pb-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl p-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Trophy" size={20} className="text-yellow-400" />
            <h3 className="text-lg font-black text-white">Топ игроков</h3>
            <span className="text-white/60 text-xs ml-auto">Обновление: 5 мин</span>
          </div>
          <div className="space-y-1">
            {leaderboard.slice(0, 5).map((leader, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  leader.name === username ? 'bg-accent/20 border border-accent/40' : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white w-6">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </span>
                  <span className="text-white font-semibold text-sm">{leader.name}</span>
                </div>
                <span className="text-white/80 font-bold text-sm">{leader.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
