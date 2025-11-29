import React, { useState, useEffect } from 'react';
import { GameStatus, GameMode, ControlScheme, Skin, PaintColor, CrosshairSettings } from '../types';
import { BOT_NAMES, SKINS } from '../constants';

interface MenuProps {
  status: GameStatus;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  onStart: () => void;
  onRestart: () => void;
  sensitivity: number;
  setSensitivity: (v: number) => void;
  controls: ControlScheme;
  setControls: (c: ControlScheme) => void;
  crosshair: CrosshairSettings;
  setCrosshair: (c: CrosshairSettings) => void;
  currency: number;
  ownedSkins: string[];
  currentSkin: Skin;
  onBuySkin: (s: Skin) => void;
  onEquipSkin: (s: Skin) => void;
  
  hasShotgun: boolean;
  onBuyShotgun: (price: number) => void;
  ownedPaints: string[];
  currentPaint: PaintColor;
  onBuyPaint: (p: PaintColor) => void;

  region: string;
  setRegion: (r: string) => void;
  partyCode: string;
  setPartyCode: (c: string) => void;

  onResume: () => void;
  onLeave: () => void;
  onMatchmakingComplete?: () => void;
}

export const Menu: React.FC<MenuProps> = ({ 
  status, gameMode, setGameMode, onStart, onRestart, 
  sensitivity, setSensitivity, 
  controls, setControls,
  crosshair, setCrosshair,
  currency, ownedSkins, currentSkin, onBuySkin, onEquipSkin,
  region, setRegion, partyCode, setPartyCode,
  onResume, onLeave, onMatchmakingComplete
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'locker' | 'shop' | 'settings' | 'crosshair' | 'party_lobby'>('main');
  const [listeningFor, setListeningFor] = useState<keyof ControlScheme | null>(null);

  // Install PWA State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Matchmaking State
  const [mmState, setMmState] = useState<string>('Initializing...');
  const [lobbyPlayers, setLobbyPlayers] = useState<string[]>([]);
  
  // Party State
  const [myPartyCode, setMyPartyCode] = useState('');
  const [partyMembers, setPartyMembers] = useState<string[]>(['You']);

  useEffect(() => {
    // Listen for PWA install event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("Install prompt captured");
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
        alert("Para instalar el juego:\n\nChrome/Edge: Pulsa el icono (+) en la barra de direcciones.\nSafari iOS: Pulsa 'Compartir' -> 'Añadir a pantalla de inicio'.");
    }
  };

  const handleCreateParty = () => {
    // Generate random code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setMyPartyCode(code);
    setActiveTab('party_lobby');
    setPartyMembers(['You']);
    
    // Simulate a friend joining
    setTimeout(() => {
        setPartyMembers(prev => [...prev, "Amigo_Juan (Online)"]);
    }, 4000);
  };

  useEffect(() => {
    if (status === GameStatus.MATCHMAKING) {
      setLobbyPlayers([]);
      setMmState('Connecting to ' + region + ' servers...');
      
      const steps = [
        { t: 800, msg: 'Authenticating...' },
        { t: 1600, msg: 'Finding match (Estimated wait: 0:02)...' },
        { t: 2500, msg: 'Joining Lobby...' },
      ];

      steps.forEach(s => setTimeout(() => setMmState(s.msg), s.t));

      // Simulate players joining
      let count = 0;
      const maxPlayers = gameMode === GameMode.ONE_V_ONE ? 2 : 15;
      const interval = setInterval(() => {
        if (count >= maxPlayers - 1) {
             clearInterval(interval);
             setTimeout(() => onMatchmakingComplete && onMatchmakingComplete(), 1000);
        } else {
             const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
             setLobbyPlayers(prev => [...prev, botName]);
             count++;
        }
      }, 400); 

      return () => clearInterval(interval);
    }
  }, [status, region, gameMode, onMatchmakingComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (listeningFor) {
      e.preventDefault();
      setControls({ ...controls, [listeningFor]: e.code });
      setListeningFor(null);
    }
  };

  // MATCHMAKING SCREEN
  if (status === GameStatus.MATCHMAKING) {
      return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50 font-mono pointer-events-auto">
              <div className="w-full max-w-3xl bg-black border-2 border-green-500 p-8 rounded shadow-[0_0_20px_rgba(0,255,0,0.3)]">
                  <h1 className="text-3xl font-bold text-green-500 mb-4 animate-pulse"> > SYSTEM_LINK_ESTABLISHED</h1>
                  <div className="text-lg mb-2 text-blue-300">Region: {region}</div>
                  <div className="text-lg mb-6 text-yellow-300">Status: {mmState}</div>
                  
                  <div className="border-t border-gray-700 pt-4 h-64 overflow-y-auto">
                      <div className="text-gray-400 mb-2"> > Lobby Created. Waiting for players...</div>
                      <div className="text-green-400"> > YOU joined the lobby (1/{gameMode === GameMode.ONE_V_ONE ? 2 : 15})</div>
                      {lobbyPlayers.map((p, i) => (
                          <div key={i} className="text-white animate-fade-in">
                              > {p} joined the lobby ({i + 2}/{gameMode === GameMode.ONE_V_ONE ? 2 : 15})
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )
  }

  // PAUSE MENU
  if (status === GameStatus.PAUSED) {
      return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm z-50 pointer-events-auto">
              <h1 className="text-5xl font-black text-white italic mb-8">PAUSED</h1>
              <div className="flex flex-col gap-4 w-64">
                  <button onClick={onResume} className="bg-yellow-400 hover:bg-yellow-300 text-black font-black py-4 rounded text-xl uppercase skew-x-[-10deg]">
                      RESUME
                  </button>
                  <button onClick={() => setActiveTab('settings')} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded uppercase skew-x-[-10deg]">
                      SETTINGS
                  </button>
                  <button onClick={onLeave} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded uppercase skew-x-[-10deg]">
                      LEAVE MATCH
                  </button>
              </div>
              
              {activeTab === 'settings' && (
                <div className="absolute inset-0 bg-gray-900 p-8 flex flex-col items-center justify-center">
                    <h2 className="text-2xl text-white mb-4">SETTINGS</h2>
                    <button onClick={() => setActiveTab('main')} className="bg-white text-black px-4 py-2">Close</button>
                </div>
              )}
          </div>
      )
  }

  // SETTINGS OVERLAY
  if (activeTab === 'settings') {
    return (
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-95 text-white z-50 overflow-y-auto pointer-events-auto"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
         <div className="max-w-2xl w-full p-8 bg-gray-800 rounded-xl shadow-2xl border-4 border-blue-500">
             <div className="flex gap-4 mb-6 justify-center">
                 <button className="text-xl font-bold border-b-2 border-yellow-400">CONTROLS</button>
                 <button onClick={() => setActiveTab('crosshair')} className="text-xl font-bold text-gray-500 hover:text-white">CROSSHAIR</button>
             </div>
             <div className="mb-4">
                 <label>Sensitivity: {sensitivity}</label>
                 <input type="range" min="0.1" max="5.0" step="0.1" value={sensitivity} onChange={e => setSensitivity(parseFloat(e.target.value))} className="w-full" />
             </div>
             <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                 {Object.entries(controls).map(([k, v]) => (
                     <button key={k} onClick={() => setListeningFor(k as any)} className={`p-2 rounded text-left ${listeningFor === k ? 'bg-red-500' : 'bg-gray-700'}`}>
                         {k}: {v}
                     </button>
                 ))}
             </div>
             <button onClick={() => setActiveTab('main')} className="mt-4 w-full bg-yellow-400 text-black font-bold py-2 rounded">BACK</button>
         </div>
      </div>
    );
  }

  // CROSSHAIR OVERLAY
  if (activeTab === 'crosshair') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-95 text-white z-50 pointer-events-auto">
            <div className="max-w-xl w-full p-8 bg-gray-800 rounded-xl shadow-2xl border-4 border-green-500">
                <h2 className="text-3xl font-bold mb-6 text-center">CROSSHAIR EDITOR</h2>
                {/* Visual Editor ... */}
                <div className="flex justify-center mb-8 bg-gray-700 h-32 items-center rounded relative">
                    <div className="relative">
                        <div style={{ position: 'absolute', backgroundColor: crosshair.color, width: crosshair.thickness, height: crosshair.size, top: -crosshair.gap - crosshair.size/2, left: -crosshair.thickness/2 }} />
                        <div style={{ position: 'absolute', backgroundColor: crosshair.color, width: crosshair.thickness, height: crosshair.size, bottom: -crosshair.gap - crosshair.size/2, left: -crosshair.thickness/2 }} />
                        <div style={{ position: 'absolute', backgroundColor: crosshair.color, width: crosshair.size, height: crosshair.thickness, left: -crosshair.gap - crosshair.size/2, top: -crosshair.thickness/2 }} />
                        <div style={{ position: 'absolute', backgroundColor: crosshair.color, width: crosshair.size, height: crosshair.thickness, right: -crosshair.gap - crosshair.size/2, top: -crosshair.thickness/2 }} />
                    </div>
                </div>
                <div className="space-y-4">
                    <div><label>Size</label><input type="range" min="2" max="30" value={crosshair.size} onChange={e => setCrosshair({...crosshair, size: parseInt(e.target.value)})} className="w-full" /></div>
                    <div><label>Thickness</label><input type="range" min="1" max="10" value={crosshair.thickness} onChange={e => setCrosshair({...crosshair, thickness: parseInt(e.target.value)})} className="w-full" /></div>
                    <div><label>Gap</label><input type="range" min="0" max="20" value={crosshair.gap} onChange={e => setCrosshair({...crosshair, gap: parseInt(e.target.value)})} className="w-full" /></div>
                    <div><label>Color</label><input type="color" value={crosshair.color} onChange={e => setCrosshair({...crosshair, color: e.target.value})} className="w-full h-10 rounded" /></div>
                </div>
                <button onClick={() => setActiveTab('settings')} className="mt-6 w-full bg-yellow-400 text-black font-bold py-2 rounded">BACK</button>
            </div>
        </div>
      );
  }

  // --- TOP NAVIGATION BAR ---
  const TopNav = () => (
      <div className="absolute top-0 w-full flex items-center justify-between p-4 z-50 pointer-events-auto">
          <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('main')} 
                className={`text-xl font-black italic px-6 py-2 uppercase transform skew-x-[-10deg] transition-all ${activeTab === 'main' ? 'bg-yellow-400 text-black scale-110 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'bg-transparent text-white hover:text-yellow-400'}`}
              >
                  PLAY
              </button>
              <button 
                onClick={() => setActiveTab('locker')} 
                className={`text-xl font-black italic px-6 py-2 uppercase transform skew-x-[-10deg] transition-all ${activeTab === 'locker' ? 'bg-blue-500 text-white scale-110 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-transparent text-white hover:text-blue-400'}`}
              >
                  LOCKER
              </button>
              <button 
                onClick={() => setActiveTab('shop')} 
                className={`text-xl font-black italic px-6 py-2 uppercase transform skew-x-[-10deg] transition-all ${activeTab === 'shop' ? 'bg-purple-600 text-white scale-110 shadow-[0_0_15px_rgba(147,51,234,0.6)]' : 'bg-transparent text-white hover:text-purple-400'}`}
              >
                  ITEM SHOP
              </button>
          </div>
          
          <div className="flex gap-4 items-center">
               <button onClick={handleInstallClick} className="bg-green-500 hover:bg-green-400 text-white font-bold px-4 py-1 rounded animate-bounce shadow-lg border border-green-300">
                   ⬇ INSTALL APP
               </button>
               <div className="flex items-center gap-2 bg-black bg-opacity-60 px-4 py-1 rounded-full border border-yellow-500">
                   <span className="text-2xl">🪙</span>
                   <span className="text-white font-bold text-xl">{currency}</span>
               </div>
               <button onClick={() => setActiveTab('settings')} className="text-3xl hover:rotate-90 transition-transform">⚙️</button>
          </div>
      </div>
  );

  // --- PARTY LOBBY TAB ---
  if (activeTab === 'party_lobby') {
      return (
          <div className="absolute inset-0 z-50 flex flex-col pointer-events-none">
              <TopNav />
              <div className="flex-1 flex pt-24 px-12 pb-12 gap-8">
                  {/* Left: Party Info */}
                  <div className="w-1/3 bg-black bg-opacity-80 rounded-xl p-6 backdrop-blur-sm border-2 border-green-500 flex flex-col pointer-events-auto">
                      <h2 className="text-3xl font-black text-white italic mb-2">PARTY LOBBY</h2>
                      <div className="bg-gray-800 p-4 rounded mb-6 text-center">
                          <p className="text-gray-400 text-sm mb-1">PARTY CODE</p>
                          <p className="text-4xl font-mono text-yellow-400 tracking-widest select-all">{myPartyCode}</p>
                          <p className="text-xs text-gray-500 mt-2">Share this code with friends to join.</p>
                      </div>

                      <h3 className="text-xl text-white font-bold mb-2">MEMBERS ({partyMembers.length}/4)</h3>
                      <div className="flex-1 overflow-y-auto space-y-2">
                          {partyMembers.map((member, i) => (
                              <div key={i} className="flex items-center gap-2 bg-gray-700 p-2 rounded">
                                  <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                                  <span className="text-white font-bold">{member} {i === 0 ? "(Leader)" : ""}</span>
                              </div>
                          ))}
                      </div>

                      <div className="mt-4 flex gap-2">
                          <button onClick={() => setActiveTab('main')} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded">LEAVE</button>
                          <button onClick={onStart} className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 rounded">START GAME</button>
                      </div>
                  </div>
                  
                  {/* Right: Character Preview (Visible through transparency) */}
                  <div className="w-2/3 flex flex-col items-center justify-center relative pointer-events-none">
                      <div className="absolute top-10 bg-black bg-opacity-50 px-6 py-2 rounded-full text-white font-bold animate-pulse">
                           Waiting for party leader to start...
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // --- LOCKER TAB ---
  if (activeTab === 'locker') {
      return (
          <div className="absolute inset-0 z-50 flex flex-col pointer-events-none">
              <TopNav />
              <div className="flex-1 flex pt-24 px-12 pb-12 gap-8">
                  {/* Left: Inventory Grid */}
                  <div className="w-1/2 bg-black bg-opacity-60 rounded-xl p-6 overflow-y-auto backdrop-blur-sm border-2 border-blue-500 pointer-events-auto">
                      <h2 className="text-3xl font-black text-white italic mb-6 border-b-4 border-blue-500 inline-block">MY SKINS</h2>
                      <div className="grid grid-cols-3 gap-4">
                          {SKINS.filter(s => ownedSkins.includes(s.id)).map(skin => (
                              <button 
                                key={skin.id}
                                onClick={() => onEquipSkin(skin)}
                                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all transform hover:scale-105 ${currentSkin.id === skin.id ? 'border-4 border-yellow-400 bg-blue-600 shadow-lg' : 'bg-gray-800 border-2 border-gray-600 hover:border-white'}`}
                              >
                                  <div className="w-16 h-16 rounded-full mb-2" style={{ backgroundColor: skin.color }} />
                                  <span className="font-bold text-white text-center text-sm">{skin.name}</span>
                                  {currentSkin.id === skin.id && (
                                      <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-1 rounded">EQUIPPED</div>
                                  )}
                              </button>
                          ))}
                      </div>
                  </div>
                  
                  {/* Right: Preview (Transparent to show 3D scene) */}
                  <div className="w-1/2 flex items-center justify-center relative">
                      {/* Character is visible in 3D scene behind UI */}
                      <div className="absolute bottom-10 bg-black bg-opacity-50 px-8 py-4 rounded-xl text-center backdrop-blur-md border border-white">
                          <h2 className="text-4xl font-black text-white uppercase italic">{currentSkin.name}</h2>
                          <p className="text-gray-300">Epic Rarity</p>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // --- ITEM SHOP TAB ---
  if (activeTab === 'shop') {
      return (
          <div className="absolute inset-0 z-50 flex flex-col pointer-events-auto" style={{ background: '#111827' }}>
              <TopNav />
              <div className="flex-1 pt-24 px-12 pb-12 overflow-y-auto">
                  <div className="max-w-6xl mx-auto">
                      <h2 className="text-5xl font-black text-yellow-400 italic mb-2 stroke-black drop-shadow-xl">DAILY ITEMS</h2>
                      <p className="text-white mb-8 text-xl">Updates in: 12:45:30</p>
                      
                      <div className="grid grid-cols-4 gap-6">
                          {SKINS.filter(s => !ownedSkins.includes(s.id)).map(skin => (
                              <div key={skin.id} className="bg-black bg-opacity-70 rounded-xl overflow-hidden border-2 border-purple-500 hover:border-yellow-400 transition-all transform hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                                  <div className="h-48 bg-gradient-to-b from-purple-900 to-black flex items-center justify-center">
                                       <div className="w-24 h-24 rounded-full shadow-xl" style={{ backgroundColor: skin.color }} />
                                  </div>
                                  <div className="p-4 text-center">
                                      <h3 className="text-2xl font-bold text-white uppercase italic mb-1">{skin.name}</h3>
                                      <div className="flex items-center justify-center gap-2 mb-4">
                                          <span>🪙</span>
                                          <span className="text-xl font-bold text-white">{skin.price}</span>
                                      </div>
                                      <button 
                                        onClick={() => currency >= skin.price ? onBuySkin(skin) : null}
                                        className={`w-full py-2 font-black italic uppercase rounded skew-x-[-10deg] ${currency >= skin.price ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                                      >
                                          {currency >= skin.price ? 'PURCHASE' : 'NO FUNDS'}
                                      </button>
                                  </div>
                              </div>
                          ))}
                          {SKINS.filter(s => !ownedSkins.includes(s.id)).length === 0 && (
                              <div className="col-span-4 text-center text-white text-2xl opacity-50 py-20">
                                  YOU OWN EVERYTHING! COME BACK TOMORROW.
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // --- MAIN MENU (PLAY) ---
  return (
    <div className="absolute inset-0 z-50 flex flex-col pointer-events-none">
        <TopNav />
        
        {/* Top Left Socials */}
        <div className="absolute top-24 left-4 flex gap-4 pointer-events-auto">
             <div className="ml-8 flex gap-2">
                 <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-black bg-opacity-50 text-white px-2 rounded border border-blue-400">
                     <option value="EU">🇪🇺 EU</option>
                     <option value="NA">🇺🇸 NA</option>
                     <option value="ASIA">🇯🇵 ASIA</option>
                 </select>
                 <input type="text" placeholder="Party Code" value={partyCode} onChange={(e) => setPartyCode(e.target.value)} className="bg-black bg-opacity-50 text-white px-2 w-24 rounded border border-blue-400 placeholder-gray-400" />
                 <button className="bg-green-500 hover:bg-green-400 text-white px-2 rounded font-bold">JOIN</button>
                 <button onClick={handleCreateParty} className="bg-purple-600 hover:bg-purple-500 text-white px-4 rounded font-bold ml-2">CREATE PARTY</button>
            </div>
        </div>

        {/* Player Name Tag in 3D Space Overlay */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 flex flex-col items-center pointer-events-none">
             <div className="bg-blue-500 bg-opacity-80 text-white px-4 py-1 rounded mb-1 text-sm font-bold">Player 1</div>
             <div className="text-black font-bold text-xs bg-white px-2 rounded">Level 100</div>
        </div>

        {/* Play Controls */}
        <div className="absolute bottom-20 right-10 flex flex-col gap-4 w-72 pointer-events-auto">
            <div className="bg-black bg-opacity-40 p-4 rounded-lg backdrop-blur-sm border border-blue-400">
                <h2 className="text-yellow-400 text-2xl font-black text-center mb-4 uppercase tracking-wider">GAME MODE</h2>
                
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setGameMode(GameMode.ONE_V_ONE)} className={`flex-1 font-bold py-2 rounded skew-x-[-10deg] ${gameMode === GameMode.ONE_V_ONE ? 'bg-pink-500 text-white border-b-4 border-pink-700' : 'bg-gray-700 text-gray-300'}`}>1v1</button>
                    <button onClick={() => setGameMode(GameMode.BATTLE_ROYALE)} className={`flex-1 font-bold py-2 rounded skew-x-[-10deg] ${gameMode === GameMode.BATTLE_ROYALE ? 'bg-purple-600 text-white border-b-4 border-purple-800' : 'bg-gray-700 text-gray-300'}`}>BR</button>
                </div>

                <button onClick={status === GameStatus.MENU || status === GameStatus.VICTORY || status === GameStatus.DEFEAT ? onStart : onRestart} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-3xl italic transform skew-x-[-10deg] py-6 mb-4 shadow-xl border-b-8 border-yellow-600 active:translate-y-1 active:border-b-0">
                    {status === GameStatus.MENU ? 'PLAY' : 'PLAY AGAIN'}
                </button>
            </div>
        </div>
    </div>
  );
};