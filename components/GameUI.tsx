import React from 'react';
import { PlayerStats, BuildType, CrosshairSettings, GameStatus } from '../types';
import { WEAPON_LEVELS, MAX_AMMO } from '../constants';

interface GameUIProps {
  stats: PlayerStats;
  enemiesAlive: number;
  stormDistance: number;
  buildMode: BuildType;
  lobbyTime: number | null;
  canEdit: boolean;
  skinColor: string;
  onWatchAd: () => void;
  isWatchingAd: boolean;
  wins: number;
  showPlaneAbility: boolean;
  crosshair: CrosshairSettings;
  gameStatus: GameStatus;
}

export const GameUI: React.FC<GameUIProps> = ({ 
  stats, enemiesAlive, stormDistance, buildMode, lobbyTime, 
  canEdit, skinColor, onWatchAd, isWatchingAd, wins, showPlaneAbility,
  crosshair, gameStatus
}) => {
  const currentWeapon = WEAPON_LEVELS[stats.weaponLevel];

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      
      {/* DYNAMIC CROSSHAIR */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
              <div style={{
                  position: 'absolute', backgroundColor: crosshair.color,
                  width: `${crosshair.thickness}px`, height: `${crosshair.size}px`,
                  top: `${-crosshair.gap - crosshair.size/2}px`, left: `${-crosshair.thickness/2}px`
              }} />
              <div style={{
                  position: 'absolute', backgroundColor: crosshair.color,
                  width: `${crosshair.thickness}px`, height: `${crosshair.size}px`,
                  bottom: `${-crosshair.gap - crosshair.size/2}px`, left: `${-crosshair.thickness/2}px`
              }} />
              <div style={{
                  position: 'absolute', backgroundColor: crosshair.color,
                  width: `${crosshair.size}px`, height: `${crosshair.thickness}px`,
                  left: `${-crosshair.gap - crosshair.size/2}px`, top: `${-crosshair.thickness/2}px`
              }} />
              <div style={{
                  position: 'absolute', backgroundColor: crosshair.color,
                  width: `${crosshair.size}px`, height: `${crosshair.thickness}px`,
                  right: `${-crosshair.gap - crosshair.size/2}px`, top: `${-crosshair.thickness/2}px`
              }} />
          </div>
      </div>

      {/* DEFEAT MESSAGE */}
      {gameStatus === GameStatus.DEFEAT && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
              <h1 className="text-8xl font-black text-red-600 italic stroke-black drop-shadow-xl animate-pulse text-center">
                  PERDISTE<br/>PERDEDOR
              </h1>
          </div>
      )}

      {/* AD OVERLAY */}
      {isWatchingAd && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center text-white pointer-events-auto">
             <h2 className="text-3xl font-bold mb-4">RECARGANDO ARMA...</h2>
             <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
                 <div className="h-full bg-yellow-400 animate-pulse w-full origin-left transition-transform duration-[3000ms] scale-x-0" style={{ transform: 'scaleX(1)', transitionProperty: 'transform' }}></div>
             </div>
             <p className="mt-4 text-gray-400">Viendo anuncio simulado...</p>
        </div>
      )}

      {!isWatchingAd && stats.ammo === 0 && (
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-black bg-opacity-90 p-6 rounded-xl text-center pointer-events-auto border-2 border-red-500">
             <h2 className="text-3xl font-black text-red-500 mb-2">¡SIN MUNICIÓN!</h2>
             <p className="text-white mb-4">Necesitas más pintura.</p>
             <button onClick={onWatchAd} className="bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xl px-6 py-3 rounded shadow-lg animate-pulse">
                 VER ANUNCIO PARA RECARGAR
             </button>
         </div>
      )}

      {canEdit && !isWatchingAd && stats.ammo > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-12 bg-gray-900 bg-opacity-80 text-white px-4 py-2 rounded border border-white">
          Presiona <span className="text-yellow-400 font-bold">G</span> para Editar
        </div>
      )}

      {lobbyTime !== null && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-8 py-2 rounded-full font-black text-2xl shadow-xl animate-bounce">
              BUS SE LANZA EN: {Math.ceil(lobbyTime)}s
          </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
           <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded font-bold text-xl border-l-4 border-yellow-400">
             VIVOS: <span className="text-yellow-400">{enemiesAlive + 1}</span>
           </div>
           <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded font-bold text-lg border-l-4 border-red-500">
             KILLS: <span className="text-white">{stats.kills}</span>
           </div>
           {showPlaneAbility && (
               <div className="mt-2 bg-blue-600 bg-opacity-80 text-white px-4 py-1 rounded font-bold animate-pulse">
                   [F] ATAQUE AÉREO LISTO
               </div>
           )}
        </div>

        {stormDistance < 30 && lobbyTime === null && (
          <div className="animate-pulse bg-red-600 text-white px-6 py-2 rounded-full font-black border-2 border-white shadow-lg">
            ¡LA TORMENTA SE CIERRA!
          </div>
        )}

        <div className="flex items-center gap-2 bg-black bg-opacity-40 p-2 rounded">
          <div className="w-6 h-6 rounded-full border border-white" style={{ backgroundColor: skinColor }}></div>
        </div>
      </div>

      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-2">
         {buildMode !== BuildType.NONE && (
             <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg border-2 border-white">
                 <div className="font-black text-center mb-1">CONSTRUYENDO</div>
                 <div className="text-3xl text-center">
                     {buildMode === BuildType.WALL && "PARED"}
                     {buildMode === BuildType.FLOOR && "SUELO"}
                     {buildMode === BuildType.RAMP && "RAMPA"}
                 </div>
                 <div className="text-xs text-center mt-2 opacity-80">Click para colocar</div>
             </div>
         )}
      </div>

      <div className="flex justify-between items-end">
        <div className="flex gap-4">
          <div className="flex flex-col w-64">
             <div className="flex justify-between text-white font-bold text-sm mb-1">
               <span>ESCUDO</span>
               <span>{Math.floor(stats.shield)}</span>
             </div>
             <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${stats.shield}%` }} />
             </div>
             <div className="flex justify-between text-white font-bold text-sm mt-2 mb-1">
               <span>SALUD</span>
               <span>{Math.floor(stats.health)}</span>
             </div>
             <div className="w-full h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${stats.health}%` }} />
             </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
            <div className="bg-black bg-opacity-60 px-3 py-1 rounded text-yellow-300 font-bold text-sm border border-yellow-500">
                 ⭐ NIVEL {stats.weaponLevel + 1}: {currentWeapon.name.toUpperCase()}
            </div>

            <div className="bg-gray-800 bg-opacity-80 p-2 rounded text-white font-bold flex gap-2">
                <span className="text-orange-300">🪵 MADERA</span>
                <span>{stats.materials}</span>
            </div>
            
            <div className="flex items-end gap-2">
                <div className={`text-6xl font-black italic drop-shadow-md ${stats.ammo === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {stats.ammo}
                </div>
                <div className="text-gray-300 text-xl font-bold mb-2">
                    / {MAX_AMMO}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
