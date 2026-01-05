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

interface Bonus {
  id: number;
  message: string;
  icon: string;
  color: string;
}

const Index = () => {
  const [clicks, setClicks] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [autoClicker, setAutoClicker] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const particleIdRef = useRef(0);
  const bonusIdRef = useRef(0);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

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

  const getBonusReward = (): Bonus => {
    const bonusTypes = [
      { message: '+5 бонусных тапов! 🎉', value: 5, icon: 'Sparkles', color: '#F97316' },
      { message: '+10 мега-бонус! ⭐', value: 10, icon: 'Star', color: '#D946EF' },
      { message: '+3 тапа удачи! 🍀', value: 3, icon: 'Clover', color: '#10B981' },
      { message: '+7 супер-тапов! 💎', value: 7, icon: 'Gem', color: '#8B5CF6' },
    ];
    
    const bonus = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    setClicks(prev => prev + bonus.value);
    
    return {
      id: bonusIdRef.current++,
      message: bonus.message,
      icon: bonus.icon,
      color: bonus.color,
    };
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const clickValue = multiplier + autoClicker;
    const newClicks = clicks + clickValue;
    setClicks(newClicks);
    setIsAnimating(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createParticle(x, y);
    playClickSound(600 + (newClicks % 10) * 50);
    
    setTimeout(() => setIsAnimating(false), 300);
    
    if (newClicks % 10 === 0) {
      const bonus = getBonusReward();
      setBonuses(prev => [...prev, bonus]);
      playBonusSound();
      toast.success(bonus.message, {
        duration: 2000,
      });
      
      setTimeout(() => {
        setBonuses(prev => prev.filter(b => b.id !== bonus.id));
      }, 2000);
    }
  };

  const buyMultiplier = () => {
    if (clicks >= 500) {
      setClicks(prev => prev - 500);
      setMultiplier(prev => prev * 2);
      toast.success('Куплен умножитель! Теперь каждый клик даёт x' + (multiplier * 2) + ' тапов', {
        duration: 3000,
      });
      playBonusSound();
    } else {
      toast.error('Недостаточно тапов! Нужно: 500');
    }
  };

  const buyAutoClicker = () => {
    if (clicks >= 1500) {
      setClicks(prev => prev - 1500);
      setAutoClicker(50);
      toast.success('Куплен уничтожитель тапов! +50 тапов за клик! 💥', {
        duration: 3000,
      });
      playBonusSound();
    } else {
      toast.error('Недостаточно тапов! Нужно: 1500');
    }
  };

  return (
    <div className="min-h-screen game-gradient flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-6 left-6 z-20">
        <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl tracking-tight">
          AWtest
        </h2>
      </div>

      <button
        onClick={() => setShowShop(!showShop)}
        className="fixed top-6 right-6 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 rounded-2xl px-6 py-3 transition-all hover:scale-105 active:scale-95"
      >
        <div className="flex items-center gap-2">
          <Icon name="ShoppingBag" size={24} className="text-white" />
          <span className="text-white font-bold text-lg">МАГАЗИН</span>
        </div>
      </button>

      {showShop && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={() => setShowShop(false)}>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl p-6 md:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white flex items-center gap-2">
                  <Icon name="Store" size={32} />
                  Магазин
                </h2>
                <button onClick={() => setShowShop(false)} className="text-white/70 hover:text-white transition-colors">
                  <Icon name="X" size={28} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Icon name="Zap" size={24} className="text-accent" />
                        Умножитель тапов
                      </h3>
                      <p className="text-white/70 text-sm mt-1">
                        Удваивает силу каждого клика
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 font-semibold">Текущий: x{multiplier}</span>
                    <Button
                      onClick={buyMultiplier}
                      disabled={clicks < 500}
                      className="bg-accent hover:bg-accent/90 text-white font-bold"
                    >
                      500 тапов
                    </Button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Icon name="Rocket" size={24} className="text-secondary" />
                        Уничтожитель тапов
                      </h3>
                      <p className="text-white/70 text-sm mt-1">
                        +50 тапов за каждый клик!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/90 font-semibold">
                      {autoClicker > 0 ? '✅ Куплено' : 'Не куплено'}
                    </span>
                    <Button
                      onClick={buyAutoClicker}
                      disabled={clicks < 1500 || autoClicker > 0}
                      className="bg-secondary hover:bg-secondary/90 text-white font-bold"
                    >
                      1500 тапов
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-white/80 text-center font-medium">
                  💰 Твои тапы: <span className="text-white font-bold text-xl">{clicks.toLocaleString()}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      <div className="relative z-10 max-w-2xl w-full">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl tracking-tight">
              КЛИКЕР
            </h1>
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
                {(multiplier > 1 || autoClicker > 0) && (
                  <p className="text-white/70 text-sm font-medium">
                    За клик: +{multiplier + autoClicker} тапов
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
                    +{multiplier + autoClicker}
                  </div>
                ))}
              </div>

              {clicks >= 10 && (
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-white/90 text-sm font-medium flex items-center gap-2 justify-center">
                    <Icon name="Gift" size={20} />
                    Каждые 10 тапов = случайный бонус!
                  </p>
                </div>
              )}
            </div>
          </Card>

          {bonuses.map(bonus => (
            <div
              key={bonus.id}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-scale-in z-50"
            >
              <div
                className="text-5xl font-black text-white drop-shadow-2xl px-8 py-6 rounded-2xl"
                style={{ backgroundColor: bonus.color }}
              >
                {bonus.message}
              </div>
            </div>
          ))}

          {clicks > 0 && (
            <div className="text-white/70 text-sm font-medium space-y-1">
              <p>🎯 Бонусов получено: {Math.floor(clicks / 10)}</p>
              <p>⚡ До следующего бонуса: {10 - (clicks % 10)} тапов</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;