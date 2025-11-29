import React, { useState, useEffect } from 'react';
import { GameScene } from './components/GameScene';
import { Menu } from './components/Menu';
import { GameStatus, GameMode, ControlScheme, CrosshairSettings, Skin } from './types';
import { DEFAULT_CONTROLS, SKINS, SHOP_PAINTS, DEFAULT_CROSSHAIR } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [previousStatus, setPreviousStatus] = useState<GameStatus>(GameStatus.MENU);
  const [mode, setMode] = useState<GameMode>(GameMode.ONE_V_ONE);
  const [sensitivity, setSensitivity] = useState<number>(1.0);
  const [controls, setControls] = useState<ControlScheme>(DEFAULT_CONTROLS);
  const [crosshair, setCrosshair] = useState<CrosshairSettings>(DEFAULT_CROSSHAIR);
  
  // Economy & Locker State
  const [currency, setCurrency] = useState(2500); // Start with V-Bucks
  const [ownedSkins, setOwnedSkins] = useState<string[]>(['survivor']);
  const [currentSkin, setCurrentSkin] = useState<Skin>(SKINS[0]);

  // Progression State
  const [wins, setWins] = useState(0);

  // Fake Multiplayer State
  const [region, setRegion] = useState('EU');
  const [partyCode, setPartyCode] = useState('');

  useEffect(() => {
    const savedControls = localStorage.getItem('polynite_controls');
    if (savedControls) setControls(JSON.parse(savedControls));
    
    const savedWins = localStorage.getItem('polynite_wins');
    if (savedWins) setWins(parseInt(savedWins));
  }, []);

  const saveControls = (newControls: ControlScheme) => {
    setControls(newControls);
    localStorage.setItem('polynite_controls', JSON.stringify(newControls));
  };

  const handleBuySkin = (skin: Skin) => {
    if (ownedSkins.includes(skin.id)) return;
    if (currency >= skin.price) {
      setCurrency(prev => prev - skin.price);
      setOwnedSkins(prev => [...prev, skin.id]);
    }
  };

  const handleEquipSkin = (skin: Skin) => {
    if (ownedSkins.includes(skin.id)) {
      setCurrentSkin(skin);
    }
  };

  const handleStartMatchmaking = () => {
    setStatus(GameStatus.MATCHMAKING);
  };

  const handleMatchStart = () => setStatus(GameStatus.PLAYING);
  
  const handleGameOver = (won: boolean) => {
    if (won) {
        setCurrency(prev => prev + 100); // Win reward
        const newWins = wins + 1;
        setWins(newWins);
        localStorage.setItem('polynite_wins', newWins.toString());
    }
    setStatus(won ? GameStatus.VICTORY : GameStatus.DEFEAT);
  };
  
  const handleRestart = () => setStatus(GameStatus.MENU);

  // Pause Logic
  const handleTogglePause = () => {
    if (status === GameStatus.PLAYING) {
      setPreviousStatus(GameStatus.PLAYING);
      setStatus(GameStatus.PAUSED);
    } else if (status === GameStatus.PAUSED) {
      setStatus(GameStatus.PLAYING);
    }
  };

  const handleLeaveMatch = () => {
    setStatus(GameStatus.MENU);
  };

  // Determine Weapon Level based on Wins
  // 0 wins = Level 0 (Rifle)
  // 1-9 wins = Level 1 (Shotgun)
  // 10-49 wins = Level 2 (Legendary Rifle)
  // 50+ wins = Level 3 (Plane Unlock)
  const getWeaponLevel = () => {
      if (wins >= 50) return 3;
      if (wins >= 10) return 2;
      if (wins >= 1) return 1;
      return 0;
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      <GameScene 
        status={status}
        gameMode={mode}
        onMatchStart={handleMatchStart}
        onGameOver={handleGameOver} 
        sensitivity={sensitivity}
        controls={controls}
        playerSkin={currentSkin}
        weaponLevel={getWeaponLevel()}
        hasShotgun={wins >= 1}
        selectedPaint={SHOP_PAINTS[0]}
        wins={wins}
        onTogglePause={handleTogglePause}
      />

      {(status === GameStatus.MENU || status === GameStatus.VICTORY || status === GameStatus.DEFEAT || status === GameStatus.MATCHMAKING || status === GameStatus.PAUSED) && (
        <Menu 
          status={status}
          gameMode={mode}
          setGameMode={setMode} 
          onStart={handleStartMatchmaking} 
          onRestart={handleRestart}
          sensitivity={sensitivity}
          setSensitivity={setSensitivity}
          controls={controls}
          setControls={saveControls}
          crosshair={crosshair}
          setCrosshair={setCrosshair}
          currency={currency}
          ownedSkins={ownedSkins}
          currentSkin={currentSkin}
          onBuySkin={handleBuySkin}
          onEquipSkin={handleEquipSkin}
          hasShotgun={wins >= 1}
          onBuyShotgun={() => {}}
          ownedPaints={[]}
          currentPaint={SHOP_PAINTS[0]}
          onBuyPaint={() => {}}
          region={region}
          setRegion={setRegion}
          partyCode={partyCode}
          setPartyCode={setPartyCode}
          onResume={() => setStatus(GameStatus.PLAYING)}
          onLeave={handleLeaveMatch}
          onMatchmakingComplete={handleMatchStart}
        />
      )}
    </div>
  );
};

export default App;