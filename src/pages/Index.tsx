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
  tokenReward: number;
  used: boolean;
}

interface Skin {
  id: string;
  name: string;
  gradient: string;
  emoji: string;
  price: number;
  requiredRebirth: number;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  
  const [clicks, setClicks] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [rebirthLevel, setRebirthLevel] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [autoClicker, setAutoClicker] = useState(0);
  const [clickPower, setClickPower] = useState(0);
  const [megaBoost, setMegaBoost] = useState(0);
  const [ultraPower, setUltraPower] = useState(0);
  const [godMode, setGodMode] = useState(0);
  const [cosmicPower, setCosmicPower] = useState(0);
  const [infinityMode, setInfinityMode] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [showExchange, setShowExchange] = useState(false);
  const [shopTab, setShopTab] = useState<'upgrades' | 'skins' | 'rebirth'>('upgrades');
  const [showPromo, setShowPromo] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [usedPromos, setUsedPromos] = useState<string[]>([]);
  const [currentSkin, setCurrentSkin] = useState('default');
  const [ownedSkins, setOwnedSkins] = useState<string[]>(['default']);
  const [leaderboard, setLeaderboard] = useState<Leader[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const particleIdRef = useRef(0);
  const snowflakeIdRef = useRef(0);

  const promoCodes: PromoCode[] = [
    { code: 'dizzyt', reward: 5000, tokenReward: 50, used: false },
    { code: 'anarchy', reward: 10000, tokenReward: 100, used: false },
    { code: 'mega2024', reward: 15000, tokenReward: 150, used: false },
  ];

  const skins: Skin[] = [
    { id: 'default', name: 'Классик', gradient: 'from-red-500 via-orange-500 to-yellow-400', emoji: '🔥', price: 0, requiredRebirth: 0 },
    { id: 'ocean', name: 'Океан', gradient: 'from-blue-500 via-cyan-500 to-teal-400', emoji: '🌊', price: 100, requiredRebirth: 0 },
    { id: 'purple', name: 'Космос', gradient: 'from-purple-600 via-pink-500 to-rose-400', emoji: '🚀', price: 150, requiredRebirth: 1 },
    { id: 'green', name: 'Джунгли', gradient: 'from-green-600 via-emerald-500 to-lime-400', emoji: '🌿', price: 200, requiredRebirth: 2 },
    { id: 'gold', name: 'Золото', gradient: 'from-yellow-600 via-yellow-500 to-amber-400', emoji: '👑', price: 300, requiredRebirth: 3 },
    { id: 'dark', name: 'Тень', gradient: 'from-gray-800 via-gray-700 to-gray-600', emoji: '🌑', price: 250, requiredRebirth: 2 },
    { id: 'rainbow', name: 'Радуга', gradient: 'from-red-500 via-purple-500 to-blue-500', emoji: '🌈', price: 500, requiredRebirth: 5 },
    { id: 'diamond', name: 'Алмаз', gradient: 'from-cyan-400 via-blue-300 to-indigo-400', emoji: '💎', price: 750, requiredRebirth: 7 },
    { id: 'fire', name: 'Инферно', gradient: 'from-orange-600 via-red-600 to-pink-600', emoji: '🔥', price: 1000, requiredRebirth: 9 },
  ];

  const getRebirthMultiplier = () => Math.pow(2, rebirthLevel);
  const getRebirthCost = () => Math.pow(10, 6 + rebirthLevel);

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
      setTokens(data.tokens || 0);
      setRebirthLevel(data.rebirthLevel || 0);
      setMultiplier(data.multiplier || 1);
      setAutoClicker(data.autoClicker || 0);
      setClickPower(data.clickPower || 0);
      setMegaBoost(data.megaBoost || 0);
      setUltraPower(data.ultraPower || 0);
      setGodMode(data.godMode || 0);
      setCosmicPower(data.cosmicPower || 0);
      setInfinityMode(data.infinityMode || 0);
      setUsedPromos(data.usedPromos || []);
      setCurrentSkin(data.currentSkin || 'default');
      setOwnedSkins(data.ownedSkins || ['default']);
    }
  }, [isAuthenticated, username]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const saveData = {
      clicks,
      tokens,
      rebirthLevel,
      multiplier,
      autoClicker,
      clickPower,
      megaBoost,
      ultraPower,
      godMode,
      cosmicPower,
      infinityMode,
      usedPromos,
      currentSkin,
      ownedSkins,
    };
    localStorage.setItem(`anarchyclick-data-${username}`, JSON.stringify(saveData));
  }, [clicks, tokens, rebirthLevel, multiplier, autoClicker, clickPower, megaBoost, ultraPower, godMode, cosmicPower, infinityMode, usedPromos, currentSkin, ownedSkins, username, isAuthenticated]);

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

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const tokenInterval = setInterval(() => {
      const totalPower = multiplier + autoClicker + clickPower + megaBoost + ultraPower + godMode + cosmicPower + infinityMode;
      if (totalPower > 10) {
        const tokenGain = Math.floor(totalPower / 100) * getRebirthMultiplier();
        if (tokenGain > 0) {
          setTokens(prev => prev + tokenGain);
        }
      }
    }, 30000);

    return () => clearInterval(tokenInterval);
  }, [multiplier, autoClicker, clickPower, megaBoost, ultraPower, godMode, cosmicPower, infinityMode, rebirthLevel, isAuthenticated]);

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
    const clickValue = (multiplier + autoClicker + clickPower + megaBoost + ultraPower + godMode + cosmicPower + infinityMode) * getRebirthMultiplier();
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

    const rewardMultiplier = getRebirthMultiplier();
    setClicks(prev => prev + promo.reward * rewardMultiplier);
    setTokens(prev => prev + promo.tokenReward * rewardMultiplier);
    setUsedPromos(prev => [...prev, promo.code]);
    toast.success(`Промокод активирован! +${(promo.reward * rewardMultiplier).toLocaleString()} тапов и +${(promo.tokenReward * rewardMultiplier).toLocaleString()} токенов! 🎉`, { duration: 4000 });
    playBonusSound();
    setPromoInput('');
    setShowPromo(false);
  };

  const exchangeClicksToTokens = () => {
    const rate = 1000;
    if (clicks >= rate) {
      const tokensToGain = Math.floor(clicks / rate);
      setClicks(prev => prev % rate);
      setTokens(prev => prev + tokensToGain);
      toast.success(`Обменяно! +${tokensToGain} токенов 💎`);
      playBonusSound();
    } else {
      toast.error(`Нужно минимум ${rate} тапов для обмена!`);
    }
  };

  const exchangeTokensToClicks = () => {
    const rate = 1;
    if (tokens >= rate) {
      const clicksToGain = tokens * 1000;
      setTokens(0);
      setClicks(prev => prev + clicksToGain);
      toast.success(`Обменяно! +${clicksToGain.toLocaleString()} тапов 💰`);
      playBonusSound();
    } else {
      toast.error('Недостаточно токенов!');
    }
  };

  const performRebirth = () => {
    if (rebirthLevel >= 10) {
      toast.error('Достигнут максимальный уровень перерождения!');
      return;
    }

    const cost = getRebirthCost();
    if (clicks >= cost) {
      setClicks(0);
      setMultiplier(1);
      setAutoClicker(0);
      setClickPower(0);
      setMegaBoost(0);
      setUltraPower(0);
      setGodMode(0);
      setCosmicPower(0);
      setInfinityMode(0);
      setRebirthLevel(prev => prev + 1);
      toast.success(`🌟 Перерождение ${rebirthLevel + 1}! Множитель x${getRebirthMultiplier() * 2}`, { duration: 5000 });
      playBonusSound();
      setShowShop(false);
    } else {
      toast.error(`Нужно ${cost.toLocaleString()} тапов!`);
    }
  };

  const buySkin = (skin: Skin) => {
    if (skin.requiredRebirth > rebirthLevel) {
      toast.error(`Требуется перерождение уровня ${skin.requiredRebirth}!`);
      return;
    }

    if (ownedSkins.includes(skin.id)) {
      setCurrentSkin(skin.id);
      toast.success(`Скин "${skin.name}" активирован!`);
      return;
    }

    if (tokens >= skin.price) {
      setTokens(prev => prev - skin.price);
      setOwnedSkins(prev => [...prev, skin.id]);
      setCurrentSkin(skin.id);
      toast.success(`Скин "${skin.name}" куплен и активирован! 🎨`, { duration: 3000 });
      playBonusSound();
    } else {
      toast.error(`Недостаточно токенов! Нужно: ${skin.price}`);
    }
  };

  const buyUpgrade = (name: string, price: number, requiredRebirth: number, action: () => void) => {
    if (requiredRebirth > rebirthLevel) {
      toast.error(`Требуется перерождение уровня ${requiredRebirth}!`);
      return;
    }

    if (clicks >= price) {
      action();
    } else {
      toast.error(`Недостаточно тапов! Нужно: ${price}`);
    }
  };

  const buyMultiplier = () => {
    setClicks(prev => prev - 500);
    setMultiplier(prev => prev * 2);
    toast.success('Умножитель x' + (multiplier * 2), { duration: 3000 });
    playBonusSound();
  };

  const buyAutoClicker = () => {
    setClicks(prev => prev - 1500);
    setAutoClicker(50);
    toast.success('Уничтожитель +50 💥', { duration: 3000 });
    playBonusSound();
  };

  const buyClickPower = () => {
    setClicks(prev => prev - 800);
    setClickPower(prev => prev + 10);
    toast.success('Сила клика +10 ⚡', { duration: 3000 });
    playBonusSound();
  };

  const buyMegaBoost = () => {
    setClicks(prev => prev - 3000);
    setMegaBoost(prev => prev + 100);
    toast.success('МЕГА-БУСТ +100! 🚀', { duration: 3000 });
    playBonusSound();
  };

  const buyUltraPower = () => {
    setClicks(prev => prev - 5000);
    setUltraPower(prev => prev + 250);
    toast.success('УЛЬТРА МОЩЬ +250! ⚡⚡', { duration: 3000 });
    playBonusSound();
  };

  const buyGodMode = () => {
    setClicks(prev => prev - 10000);
    setGodMode(prev => prev + 500);
    toast.success('БОГ РЕЖИМ +500! 👑', { duration: 3000 });
    playBonusSound();
  };

  const buyCosmicPower = () => {
    setClicks(prev => prev - 25000);
    setCosmicPower(prev => prev + 1000);
    toast.success('КОСМИЧЕСКАЯ МОЩЬ +1000! 🌌', { duration: 3000 });
    playBonusSound();
  };

  const buyInfinityMode = () => {
    setClicks(prev => prev - 50000);
    setInfinityMode(prev => prev + 2500);
    toast.success('БЕСКОНЕЧНОСТЬ +2500! ♾️', { duration: 3000 });
    playBonusSound();
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

  const totalPower = (multiplier + autoClicker + clickPower + megaBoost + ultraPower + godMode + cosmicPower + infinityMode) * getRebirthMultiplier();
  const activeSkin = skins.find(s => s.id === currentSkin) || skins[0];

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
        {rebirthLevel > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-yellow-300 text-sm font-bold">🌟 Перерождение {rebirthLevel}</span>
            <span className="text-white/60 text-xs">(x{getRebirthMultiplier()})</span>
          </div>
        )}
      </div>

      <div className="fixed top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setShowExchange(!showExchange)}
          className="bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-md border-2 border-white/40 rounded-xl px-4 py-2 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <Icon name="ArrowLeftRight" size={20} className="text-white" />
            <span className="text-white font-bold text-sm hidden md:inline">ОБМЕН</span>
          </div>
        </button>

        <button
          onClick={() => setShowPromo(!showPromo)}
          className="bg-green-500/80 hover:bg-green-600/80 backdrop-blur-md border-2 border-white/40 rounded-xl px-4 py-2 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <Icon name="Gift" size={20} className="text-white" />
            <span className="text-white font-bold text-sm hidden md:inline">ПРОМО</span>
          </div>
        </button>

        <button
          onClick={() => setShowShop(!showShop)}
          className="bg-gradient-to-br from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 backdrop-blur-md border-2 border-white/40 rounded-xl px-4 py-2 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          <div className="flex items-center gap-2">
            <Icon name="Store" size={20} className="text-white" />
            <span className="text-white font-bold text-sm hidden md:inline">МАГАЗИН</span>
          </div>
        </button>
      </div>

      {showExchange && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={() => setShowExchange(false)}>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Icon name="ArrowLeftRight" size={28} className="text-blue-400" />
                  Обменник
                </h2>
                <button onClick={() => setShowExchange(false)} className="text-white/70 hover:text-white">
                  <Icon name="X" size={24} />
                </button>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="text-center mb-3">
                  <p className="text-white/70 text-sm">Тапы → Токены</p>
                  <p className="text-white text-xs mt-1">Курс: 1000 тапов = 1 токен</p>
                </div>
                <Button
                  onClick={exchangeClicksToTokens}
                  disabled={clicks < 1000}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
                >
                  Обменять все тапы
                </Button>
                <p className="text-white/60 text-xs text-center mt-2">
                  Получишь: ~{Math.floor(clicks / 1000)} токенов
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="text-center mb-3">
                  <p className="text-white/70 text-sm">Токены → Тапы</p>
                  <p className="text-white text-xs mt-1">Курс: 1 токен = 1000 тапов</p>
                </div>
                <Button
                  onClick={exchangeTokensToClicks}
                  disabled={tokens < 1}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold"
                >
                  Обменять все токены
                </Button>
                <p className="text-white/60 text-xs text-center mt-2">
                  Получишь: {(tokens * 1000).toLocaleString()} тапов
                </p>
              </div>

              <div className="bg-white/10 rounded-lg p-3 border border-white/20 grid grid-cols-2 gap-2">
                <div className="text-center">
                  <p className="text-white/60 text-xs">У тебя</p>
                  <p className="text-white font-bold">💰 {clicks.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs">У тебя</p>
                  <p className="text-white font-bold">💎 {tokens.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

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
                {rebirthLevel > 0 && (
                  <p className="text-yellow-300 text-xs mt-1">
                    🌟 Награды увеличены в {getRebirthMultiplier()}x!
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {showShop && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4" onClick={() => setShowShop(false)}>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl p-5 max-w-md w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-4">
              <div className="flex items-center justify-between sticky top-0 bg-white/10 backdrop-blur-md py-2 -mt-2 z-10">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Icon name="Store" size={24} />
                  Магазин
                </h2>
                <button onClick={() => setShowShop(false)} className="text-white/70 hover:text-white">
                  <Icon name="X" size={24} />
                </button>
              </div>

              <div className="flex gap-2 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setShopTab('upgrades')}
                  className={`flex-1 py-2 px-2 rounded-md font-bold text-xs transition-all ${
                    shopTab === 'upgrades' ? 'bg-accent text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Улучшения
                </button>
                <button
                  onClick={() => setShopTab('skins')}
                  className={`flex-1 py-2 px-2 rounded-md font-bold text-xs transition-all ${
                    shopTab === 'skins' ? 'bg-accent text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  Скины
                </button>
                <button
                  onClick={() => setShopTab('rebirth')}
                  className={`flex-1 py-2 px-2 rounded-md font-bold text-xs transition-all ${
                    shopTab === 'rebirth' ? 'bg-yellow-500 text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  🌟 Rebirth
                </button>
              </div>

              {shopTab === 'upgrades' && (
                <div className="space-y-2">
                  {[
                    { name: 'Умножитель', icon: 'Zap', color: 'text-accent', value: multiplier, price: 500, onClick: buyMultiplier, desc: 'Удваивает клик', requiredRebirth: 0 },
                    { name: 'Уничтожитель', icon: 'Rocket', color: 'text-secondary', value: autoClicker, price: 1500, onClick: buyAutoClicker, desc: '+50 за клик', single: true, requiredRebirth: 0 },
                    { name: 'Сила клика', icon: 'Zap', color: 'text-yellow-400', value: clickPower, price: 800, onClick: buyClickPower, desc: '+10 за клик', requiredRebirth: 0 },
                    { name: 'МЕГА-БУСТ', icon: 'Sparkles', color: 'text-pink-400', value: megaBoost, price: 3000, onClick: buyMegaBoost, desc: '+100 за клик', requiredRebirth: 1 },
                    { name: 'УЛЬТРА МОЩЬ', icon: 'Flame', color: 'text-orange-400', value: ultraPower, price: 5000, onClick: buyUltraPower, desc: '+250 за клик', requiredRebirth: 2 },
                    { name: 'БОГ РЕЖИМ', icon: 'Crown', color: 'text-yellow-300', value: godMode, price: 10000, onClick: buyGodMode, desc: '+500 за клик', requiredRebirth: 4 },
                    { name: 'КОСМОС', icon: 'Orbit', color: 'text-purple-400', value: cosmicPower, price: 25000, onClick: buyCosmicPower, desc: '+1000 за клик', requiredRebirth: 6 },
                    { name: 'БЕСКОНЕЧНОСТЬ', icon: 'Infinity', color: 'text-cyan-400', value: infinityMode, price: 50000, onClick: buyInfinityMode, desc: '+2500 за клик', requiredRebirth: 8 },
                  ].map((item, i) => {
                    const isLocked = item.requiredRebirth > rebirthLevel;
                    return (
                      <div key={i} className={`bg-white/5 rounded-lg p-3 border ${isLocked ? 'border-red-500/30' : 'border-white/20'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-white flex items-center gap-1">
                              <Icon name={item.icon as any} size={16} className={item.color} />
                              {item.name}
                              {isLocked && <span className="text-red-400 text-xs ml-1">🔒{item.requiredRebirth}</span>}
                            </h3>
                            <p className="text-white/60 text-xs">{item.desc}</p>
                            <p className="text-white/80 text-xs mt-1">
                              {item.single ? (item.value > 0 ? '✅' : '❌') : `+${item.value}`}
                            </p>
                          </div>
                          <Button
                            onClick={() => buyUpgrade(item.name, item.price, item.requiredRebirth, item.onClick)}
                            disabled={clicks < item.price || (item.single && item.value > 0) || isLocked}
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-xs px-3"
                          >
                            {item.price}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {shopTab === 'skins' && (
                <div className="space-y-2">
                  {skins.map((skin) => {
                    const isLocked = skin.requiredRebirth > rebirthLevel;
                    return (
                      <div key={skin.id} className={`bg-white/5 rounded-lg p-3 border ${isLocked ? 'border-red-500/30' : 'border-white/20'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${skin.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0 ${isLocked ? 'opacity-50' : ''}`}>
                            {isLocked ? '🔒' : skin.emoji}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-white flex items-center gap-1">
                              {skin.name}
                              {isLocked && <span className="text-red-400 text-xs">🔒{skin.requiredRebirth}</span>}
                            </h3>
                            <p className="text-white/60 text-xs">
                              {isLocked ? `Требуется ${skin.requiredRebirth} rebirth` :
                                ownedSkins.includes(skin.id) ? (
                                currentSkin === skin.id ? '✅ Активен' : '✓ Куплен'
                              ) : (
                                `${skin.price} токенов`
                              )}
                            </p>
                          </div>
                          <Button
                            onClick={() => buySkin(skin)}
                            disabled={(!ownedSkins.includes(skin.id) && tokens < skin.price) || isLocked}
                            size="sm"
                            className={`text-xs px-3 ${
                              currentSkin === skin.id
                                ? 'bg-green-500 hover:bg-green-600'
                                : ownedSkins.includes(skin.id)
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-accent hover:bg-accent/90'
                            }`}
                          >
                            {isLocked ? '🔒' : currentSkin === skin.id ? 'Выбран' : ownedSkins.includes(skin.id) ? 'Выбрать' : skin.price === 0 ? 'Базовый' : 'Купить'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="bg-white/5 rounded-lg p-3 border border-white/20 text-center">
                    <p className="text-white/70 text-xs">
                      💎 Токены зарабатываются автоматически при высокой мощности (каждые 30 сек) и из промокодов
                    </p>
                  </div>
                </div>
              )}

              {shopTab === 'rebirth' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border-2 border-yellow-500/40">
                    <h3 className="text-2xl font-black text-yellow-300 text-center mb-2">
                      🌟 ПЕРЕРОЖДЕНИЕ 🌟
                    </h3>
                    <p className="text-white/80 text-sm text-center mb-3">
                      Сбрось прогресс, чтобы получить мощный множитель!
                    </p>
                    
                    <div className="bg-white/10 rounded-lg p-3 mb-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Текущий уровень:</span>
                        <span className="text-white font-bold">{rebirthLevel} / 10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Текущий множитель:</span>
                        <span className="text-yellow-300 font-bold">x{getRebirthMultiplier()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">После rebirth:</span>
                        <span className="text-green-300 font-bold">x{getRebirthMultiplier() * 2}</span>
                      </div>
                    </div>

                    <div className="bg-red-500/20 rounded-lg p-3 mb-3 border border-red-500/40">
                      <p className="text-red-300 text-xs font-bold mb-2">⚠️ ЧТО СБРОСИТСЯ:</p>
                      <ul className="text-white/70 text-xs space-y-1">
                        <li>• Все тапы (станет 0)</li>
                        <li>• Все улучшения (станут базовыми)</li>
                        <li>• Токены остаются</li>
                        <li>• Скины остаются</li>
                      </ul>
                    </div>

                    <div className="bg-green-500/20 rounded-lg p-3 mb-3 border border-green-500/40">
                      <p className="text-green-300 text-xs font-bold mb-2">✅ ЧТО ПОЛУЧИШЬ:</p>
                      <ul className="text-white/70 text-xs space-y-1">
                        <li>• Множитель x{getRebirthMultiplier() * 2} ко всем кликам</li>
                        <li>• x{getRebirthMultiplier() * 2} к заработку токенов</li>
                        <li>• x{getRebirthMultiplier() * 2} к промокодам</li>
                        <li>• Новые улучшения</li>
                        <li>• Новые скины</li>
                      </ul>
                    </div>

                    <Button
                      onClick={performRebirth}
                      disabled={clicks < getRebirthCost() || rebirthLevel >= 10}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-black text-lg py-4"
                    >
                      {rebirthLevel >= 10 ? 'МАКСИМАЛЬНЫЙ УРОВЕНЬ' : `ПЕРЕРОДИТЬСЯ (${getRebirthCost().toLocaleString()} тапов)`}
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-white/10 rounded-lg p-3 border border-white/20 grid grid-cols-2 gap-2">
                <div className="text-center">
                  <p className="text-white/60 text-xs font-medium">Тапы</p>
                  <p className="text-white font-bold text-lg">💰 {clicks.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-xs font-medium">Токены</p>
                  <p className="text-white font-bold text-lg">💎 {tokens.toLocaleString()}</p>
                </div>
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
                    За клик: +{totalPower.toLocaleString()}
                  </p>
                )}
                <div className="flex items-center justify-center gap-3 mt-2">
                  <div className="bg-white/5 px-3 py-1 rounded-lg">
                    <p className="text-white/80 text-xs font-bold">💎 {tokens.toLocaleString()}</p>
                  </div>
                  {rebirthLevel > 0 && (
                    <div className="bg-yellow-500/20 px-3 py-1 rounded-lg border border-yellow-500/40">
                      <p className="text-yellow-300 text-xs font-bold">🌟 x{getRebirthMultiplier()}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <Button
                  onClick={handleClick}
                  size="lg"
                  className={`w-full h-28 md:h-36 text-2xl md:text-3xl font-black bg-gradient-to-br ${activeSkin.gradient} hover:brightness-110 border-4 border-white/40 shadow-2xl transition-all hover:scale-105 active:scale-95 rounded-3xl relative overflow-hidden`}
                >
                  <span className="relative z-10 flex flex-col items-center gap-1">
                    <span className="flex items-center gap-2">
                      {activeSkin.emoji} TAP! {activeSkin.emoji}
                    </span>
                    <span className="text-xs font-bold text-white/90 tracking-widest">
                      ANARCHYWORLD
                    </span>
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
                    +{totalPower.toLocaleString()}
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
