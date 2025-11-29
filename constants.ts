import { ControlScheme, Skin, PaintColor, CrosshairSettings } from './types';

export const MAP_SIZE_1V1 = 60;
export const MAP_SIZE_BR = 200;

export const PLAYER_SPEED = 10;
export const BOT_SPEED = 4.5;
export const GRAVITY = 30;
export const JUMP_FORCE = 12;
export const MAX_AMMO = 999; 

export const GRID_SIZE = 4;

// Camera
export const CAMERA_OFFSET_TPS = { x: 0, y: 2, z: 4.5 };
export const CAMERA_OFFSET_ADS = { x: 0.8, y: 1.8, z: 1.5 };
export const CAMERA_OFFSET_LOBBY = { x: 0, y: 1.5, z: 3.5 };

export const FOV_TPS = 80;
export const FOV_ADS = 40;

export const SHOTGUN_PRICE = 0; 
export const PLANE_UNLOCK_WINS = 999;

export const WEAPON_LEVELS = [
  { name: "Fusil de Asalto", fireRate: 150, damage: 30 },
  { name: "Escopeta Táctica", fireRate: 800, damage: 100 },
];

export const SHOP_PAINTS: PaintColor[] = [
  { id: 'default', name: 'Arcoíris', hex: 'rainbow', price: 0 },
  { id: 'neon', name: 'Neón', hex: '#39ff14', price: 0 },
];

export const COLORS = {
  ground: "#1e293b",
  sky: "#38bdf8",    
  storm: "#7c3aed",
  wall: "#f3f4f6",
  wood: "#f59e0b",
  buildPreview: "#3b82f6",
  // Survivor Skin Defaults
  skinTone: "#ffdbac",
  shirtPlaid: "#ef4444", 
  shirtDetail: "#991b1b",
  jeans: "#3b82f6",
  boots: "#451a03",
  hat: "#d97706",
  // Synthwave Map
  synthWater: "#25004d",
  synthSun: "#ff00aa",
  synthGrid: "#00ffff",
  synthSkyTop: "#120024",
  synthSkyBottom: "#470063"
};

export const SKINS: Skin[] = [
  { id: 'survivor', name: 'Recluta', color: '#ef4444', price: 0 }, // Red (Default)
  { id: 'commando', name: 'Comando', color: '#10b981', price: 800 }, // Green
  { id: 'spec_ops', name: 'Agente Secreto', color: '#1f2937', price: 1200 }, // Black
  { id: 'banana', name: 'Señor Banana', color: '#facc15', price: 1500 }, // Yellow
  { id: 'frost', name: 'Operación Nieve', color: '#60a5fa', price: 1500 }, // Blue
  { id: 'midas', name: 'El Dorado', color: '#fbbf24', price: 2000 }, // Gold
];

export const BOT_NAMES = [
  "FaZe_Bot", "Ninja_Clone", "NoobMaster69", "ProBuilder", 
  "TTV_Sweat", "Bot_Anna", "Sniper_Wolf", "Galaxy_Skin",
  "TryHard_99", "Llama_Lover", "Victory_Royale", "Fishstick",
  "Jonesy", "Peely_Fan", "Dark_Knight"
];

export const DEFAULT_CONTROLS: ControlScheme = {
  forward: 'KeyW',
  backward: 'KeyS',
  left: 'KeyA',
  right: 'KeyD',
  jump: 'Space',
  shoot: 'Mouse0', 
  buildWall: 'KeyZ',
  buildFloor: 'KeyX',
  buildRamp: 'KeyC',
  toggleBuild: 'KeyQ',
  editBuilding: 'KeyG',
  slot1: 'Digit1',
  slot2: 'Digit2',
  ability: 'KeyF'
};

export const DEFAULT_CROSSHAIR: CrosshairSettings = {
  color: '#00ff00',
  size: 8,
  thickness: 2,
  gap: 4
};