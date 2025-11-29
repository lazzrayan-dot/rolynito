import { Vector3, Euler } from "three";

export enum GameStatus {
  MENU = 'MENU',
  MATCHMAKING = 'MATCHMAKING',
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT'
}

export enum GameMode {
  ONE_V_ONE = 'ONE_V_ONE',
  BATTLE_ROYALE = 'BATTLE_ROYALE'
}

export interface PlayerStats {
  health: number;
  shield: number;
  ammo: number;
  kills: number;
  alive: boolean;
  materials: number;
  weaponLevel: number;
}

export interface Enemy {
  id: string;
  name: string;
  position: Vector3;
  velocity: Vector3;
  health: number;
  targetPos: Vector3;
  nextMoveTime: number;
  lastShotTime: number; 
  skinColor: string;
  splats: Vector3[];
}

export interface Bullet {
  id: string;
  position: Vector3;
  direction: Vector3;
  ownerId: string;
  createdAt: number;
  color: string; 
  damage: number;
}

export interface Splat {
  id: string;
  position: Vector3;
  rotation: Euler;
  color: string;
  scale: number;
}

export interface DamageText {
  id: string;
  position: Vector3;
  damage: number;
  isCrit: boolean;
  opacity: number;
  createdAt: number;
}

export enum BuildType {
  NONE = 'NONE',
  WALL = 'WALL',
  FLOOR = 'FLOOR',
  RAMP = 'RAMP'
}

export enum StructureVariant {
  FULL = 0,
  WINDOW = 1,
  DOOR = 2
}

export interface Structure {
  id: string;
  type: BuildType;
  position: Vector3;
  rotation: Euler;
  variant: StructureVariant;
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  price: number;
}

export interface PaintColor {
  id: string;
  name: string;
  hex: string;
  price: number;
}

export interface ControlScheme {
  forward: string;
  backward: string;
  left: string;
  right: string;
  jump: string;
  shoot: string;
  buildWall: string;
  buildFloor: string;
  buildRamp: string;
  toggleBuild: string;
  editBuilding: string;
  slot1: string;
  slot2: string;
  ability: string;
}

export interface CrosshairSettings {
  color: string;
  size: number;
  thickness: number;
  gap: number;
}
