import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
}

interface Leader {
  name: string;
  score: number;
}

const Index = () => {
  const [clicks, setClicks] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [autoClicker, setAutoClicker] = useState(0);
  const [clickPower, setClickPower] = useState(0);
  const [megaBoost, setMegaBoost] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Leader[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const particleIdRef = useRef(0);
  const snowflakeIdRef = useRef(0);

  useEffect(() => {
    const savedData = localStorage.getItem('anarchyclick-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      setClicks(data.clicks || 0);
      setMultiplier(data.multiplier || 1);
      setAutoClicker(data.autoClicker || 0);
      setClickPower(data.clickPower || 0);
      setMegaBoost(data.megaBoost || 0);
    }
  }, []);

  useEffect(() => {
    const saveData = {
      clicks,
      multiplier,
      autoClicker,
      clickPower,
      megaBoost,
    };
    localStorage.setItem('anarchyclick-data', JSON.stringify(saveData));
  }, [clicks, multiplier, autoClicker, clickPower, megaBoost]);

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
    const generateLeaderboard = () => {
      const mockLeaders: Leader[] = [
        { name: 'AnarchyMaster', score: clicks + 15000 },
        { name: 'ClickKing', score: clicks + 8000 },
        { name: 'TapLegend', score: clicks + 5000 },
        { name: 'Ты', score: clicks },
        { name: 'NoobClicker', score: Math.max(0, clicks - 2000) },
      ].sort((a, b) => b.score - a.score);
      
      setLeaderboard(mockLeaders);
    };

    generateLeaderboard();
    const interval = setInterval(generateLeaderboard, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [clicks]);

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
    const clickValue = multiplier + autoClicker + clickPower + megaBoost;
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

  const buyMultiplier = () => {
    if (clicks >= 500) {
      setClicks(prev => prev - 500);
      setMultiplier(prev => prev * 2);
      toast.success('Умножитель куплен! x' + (multiplier * 2), { duration: 3000 });
      playBonusSound();
    } else {
      toast.error('Недостаточно тапов! Нужно: 500');
    }
  };

  const buyAutoClicker = () => {
    if (clicks >= 1500) {
      setClicks(prev => prev - 1500);
      setAutoClicker(50);
      toast.success('Уничтожитель тапов куплен! +50 💥', { duration: 3000 });
      playBonusSound();
    } else {
      toast.error('Недостаточно тапов! Нужно: 1500');
    }
  };

  const buyClickPower = () => {
    if (clicks >= 800) {
      setClicks(prev => prev - 800);
      setClickPower(prev => prev + 10);
      toast.success('Сила клика +10! ⚡', { duration: 3000 });
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

  return (
    <div className="min-h-screen game-gradient flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      {snowflakes.map(flake => (
        <div
          key={flake.id}
          className="absolute text-white pointer-events-none"
          style={{
            left: flake.x,
            top: (flake as any).y || -50,
            fontSize: flake.size,
            opacity: flake.opacity,
          }}
        >
          ❄️
        </div>
      ))}

      <div className="absolute top-6 left-6 z-20">
        <h2 className="text-4xl md:text-5xl font-black drop-shadow-2xl tracking-tight bg-gradient-to-r from-red-500 to-yellow-400 text-transparent bg-clip-text">
          AnarchyClick
        </h2>
      </div>

      <button
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 rounded-2xl px-6 py-3 transition-all hover:scale-105 active:scale-95 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <Icon name="Trophy" size={24} className="text-yellow-400" />
          <span className="text-white font-bold text-lg">ЛИДЕРЫ</span>
        </div>
      </button>

      <button
        onClick={() => setShowShop(!showShop)}
        className="fixed top-6 right-6 z-20 bg-gradient-to-br from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 backdrop-blur-md border-4 border-white/40 rounded-2xl px-8 py-4 transition-all hover:scale-110 active:scale-95 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <Icon name="Store" size={32} className="text-white" />
          <span className="text-white font-black text-2xl tracking-wide">МАГАЗИН</span>
        </div>
      </button>

      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={() => setShowLeaderboard(false)}>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl p-6 md:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white flex items-center gap-2">
                  <Icon name="Trophy" size={32} className="text-yellow-400" />
                  Лидеры
                </h2>
                <button onClick={() => setShowLeaderboard(false)} className="text-white/70 hover:text-white transition-colors">
                  <Icon name="X" size={28} />
                </button>
              </div>

              <div className="space-y-2">
                {leaderboard.map((leader, index) => (
                  <div
                    key={index}
                    className={`bg-white/5 rounded-xl p-4 border flex items-center justify-between ${
                      leader.name === 'Ты' ? 'border-accent bg-accent/10' : 'border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-white">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <span className="text-white font-bold">{leader.name}</span>
                    </div>
                    <span className="text-white/90 font-semibold">{leader.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <p className="text-white/60 text-xs text-center">
                Обновляется каждые 5 минут
              </p>
            </div>
          </Card>
        </div>
      )}

      {showShop && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={() => setShowShop(false)}>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex items-center justify-between sticky top-0 bg-white/10 backdrop-blur-md py-2 -mt-2">
                <h2 className="text-3xl font-black text-white flex items-center gap-2">
                  <Icon name="Store" size={32} />
                  Магазин
                </h2>
                <button onClick={() => setShowShop(false)} className="text-white/70 hover:text-white transition-colors">
                  <Icon name="X" size={28} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="Zap" size={20} className="text-accent" />
                        Умножитель тапов
                      </h3>
                      <p className="text-white/70 text-xs mt-1">Удваивает силу клика</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 font-semibold text-sm">x{multiplier}</span>
                    <Button onClick={buyMultiplier} disabled={clicks < 500} size="sm" className="bg-accent hover:bg-accent/90">
                      500
                    </Button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="Rocket" size={20} className="text-secondary" />
                        Уничтожитель тапов
                      </h3>
                      <p className="text-white/70 text-xs mt-1">+50 тапов за клик</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 font-semibold text-sm">{autoClicker > 0 ? '✅' : '❌'}</span>
                    <Button onClick={buyAutoClicker} disabled={clicks < 1500 || autoClicker > 0} size="sm" className="bg-secondary hover:bg-secondary/90">
                      1500
                    </Button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="Zap" size={20} className="text-yellow-400" />
                        Сила клика
                      </h3>
                      <p className="text-white/70 text-xs mt-1">+10 тапов за клик</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 font-semibold text-sm">+{clickPower}</span>
                    <Button onClick={buyClickPower} disabled={clicks < 800} size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                      800
                    </Button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="Sparkles" size={20} className="text-pink-400" />
                        МЕГА-БУСТ
                      </h3>
                      <p className="text-white/70 text-xs mt-1">+100 тапов за клик!</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 font-semibold text-sm">+{megaBoost}</span>
                    <Button onClick={buyMegaBoost} disabled={clicks < 3000} size="sm" className="bg-pink-500 hover:bg-pink-600">
                      3000
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-white/80 text-center font-medium">
                  💰 Твои тапы: <span className="text-white font-bold text-xl">{clicks.toLocaleString()}</span>
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/20 text-center">
                <a 
                  href="https://t.me/anarchyworld200" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="Send" size={16} />
                  Тгк @anarchyworld200
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-white/90 font-medium">
              Нажимай и собирай очки! 🎮
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl p-8 md:p-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-white/80 text-lg font-semibold uppercase tracking-wider">
                  Твои тапы
                </p>
                <div className={`text-8xl md:text-9xl font-black text-white transition-all ${isAnimating ? 'pulse-animation' : ''}`}>
                  {clicks.toLocaleString()}
                </div>
                {(multiplier > 1 || autoClicker > 0 || clickPower > 0 || megaBoost > 0) && (
                  <p className="text-white/70 text-sm font-medium">
                    За клик: +{multiplier + autoClicker + clickPower + megaBoost} тапов
                  </p>
                )}
              </div>

              <div className="relative">
                <Button
                  onClick={handleClick}
                  size="lg"
                  className="w-full h-32 md:h-40 text-3xl md:text-4xl font-bold bg-gradient-to-br from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 border-4 border-white/30 shadow-2xl transition-all hover:scale-105 active:scale-95 rounded-2xl relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    <Icon name="Zap" size={48} className="animate-pulse" />
                    ТАПНУТЬ!
                    <Icon name="Zap" size={48} className="animate-pulse" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </Button>

                {particles.map(particle => (
                  <div
                    key={particle.id}
                    className="absolute click-particle pointer-events-none text-4xl font-black text-white"
                    style={{
                      left: particle.x,
                      top: particle.y,
                      // @ts-ignore
                      '--tx': `${particle.tx}px`,
                      '--ty': `${particle.ty}px`,
                    }}
                  >
                    +{multiplier + autoClicker + clickPower + megaBoost}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
