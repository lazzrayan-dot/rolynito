import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree, Canvas } from '@react-three/fiber';
import { PointerLockControls, Sky, Stars, Text, Billboard, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3, Euler } from 'three';
import { GameUI } from './GameUI';
import { PlayerStats, Enemy, GameStatus, GameMode, ControlScheme, BuildType, Structure, StructureVariant, Skin, Bullet, PaintColor, DamageText, CrosshairSettings } from '../types';
import { COLORS, PLAYER_SPEED, JUMP_FORCE, GRAVITY, BOT_SPEED, GRID_SIZE, MAX_AMMO, CAMERA_OFFSET_TPS, CAMERA_OFFSET_ADS, CAMERA_OFFSET_LOBBY, FOV_TPS, BOT_NAMES, MAP_SIZE_BR, DEFAULT_CROSSHAIR } from '../constants';

// --- VISUAL COMPONENTS ---

const SurvivorCharacter: React.FC<{ position: Vector3, rotation?: Euler, isPlayer?: boolean, isEnemy?: boolean, name?: string, skinColor?: string }> = ({ position, rotation, isPlayer, isEnemy, name, skinColor }) => {
    const group = useRef<THREE.Group>(null);
    const leftLeg = useRef<THREE.Mesh>(null);
    const rightLeg = useRef<THREE.Mesh>(null);
    const leftArm = useRef<THREE.Mesh>(null);
    const rightArm = useRef<THREE.Mesh>(null);
    const lastPos = useRef(new Vector3());

    const shirtColor = skinColor || COLORS.shirtPlaid;

    useFrame(({ clock }) => {
        if (!group.current) return;
        
        if (isEnemy) {
            group.current.position.copy(position);
        }

        const speed = position.distanceTo(lastPos.current) / 0.016;
        lastPos.current.copy(position);

        if (speed > 0.1) {
            const t = clock.getElapsedTime() * 12;
            if(leftLeg.current) leftLeg.current.rotation.x = Math.sin(t) * 0.6;
            if(rightLeg.current) rightLeg.current.rotation.x = Math.sin(t + Math.PI) * 0.6;
            if(leftArm.current) leftArm.current.rotation.x = Math.sin(t + Math.PI) * 0.6;
            if(rightArm.current) rightArm.current.rotation.x = Math.sin(t) * 0.6;
        } else if (!isPlayer) { 
             if(leftLeg.current) leftLeg.current.rotation.x = 0;
             if(rightLeg.current) rightLeg.current.rotation.x = 0;
             if(leftArm.current) leftArm.current.rotation.x = 0;
             if(rightArm.current) rightArm.current.rotation.x = 0;
        }
    });

    return (
        <group ref={group} position={isPlayer ? [0,0,0] : undefined} rotation={rotation}>
            {/* Name Tag for Multiplayer Feel */}
            {name && (
                <Billboard position={[0, 2.5, 0]}>
                    <Text fontSize={0.3} color="white" outlineWidth={0.02} outlineColor="black">
                        {String(name)}
                    </Text>
                </Billboard>
            )}

            {/* Head */}
            <mesh position={[0, 1.7, 0]} castShadow>
                <boxGeometry args={[0.25, 0.3, 0.25]} />
                <meshStandardMaterial color={COLORS.skinTone} />
            </mesh>
            {/* Hat */}
            <group position={[0, 1.9, 0]} rotation={[0, Math.PI, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.26, 0.15, 0.26]} />
                    <meshStandardMaterial color={COLORS.hat} />
                </mesh>
                <mesh position={[0, -0.05, 0.2]}>
                    <boxGeometry args={[0.26, 0.05, 0.2]} />
                    <meshStandardMaterial color={COLORS.hat} />
                </mesh>
            </group>

            {/* Torso */}
            <mesh position={[0, 1.2, 0]} castShadow>
                <boxGeometry args={[0.5, 0.7, 0.3]} />
                <meshStandardMaterial color={shirtColor} />
            </mesh>
            <mesh position={[0, 1.2, 0.16]}>
                 <boxGeometry args={[0.1, 0.7, 0.01]} />
                 <meshStandardMaterial color={COLORS.shirtDetail} />
            </mesh>

            {/* Arms */}
            <group position={[-0.35, 1.4, 0]}>
                <mesh ref={leftArm} position={[0, -0.35, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.75, 0.15]} />
                    <meshStandardMaterial color={COLORS.skinTone} />
                </mesh>
                <mesh position={[0, -0.1, 0]} rotation={[0,0,0.1]} ref={leftArm}>
                     <boxGeometry args={[0.17, 0.3, 0.17]} />
                     <meshStandardMaterial color={shirtColor} />
                </mesh>
            </group>
            <group position={[0.35, 1.4, 0]}>
                <mesh ref={rightArm} position={[0, -0.35, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.75, 0.15]} />
                    <meshStandardMaterial color={COLORS.skinTone} />
                </mesh>
                 <mesh position={[0, -0.1, 0]} rotation={[0,0,-0.1]} ref={rightArm}>
                     <boxGeometry args={[0.17, 0.3, 0.17]} />
                     <meshStandardMaterial color={shirtColor} />
                </mesh>
                {/* Gun */}
                <mesh position={[0, -0.6, 0.4]} rotation={[1.5, 0, 0]} castShadow>
                    <boxGeometry args={[0.1, 0.5, 0.1]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>

            {/* Legs */}
            <group position={[-0.15, 0.8, 0]}>
                <mesh ref={leftLeg} position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.85, 0.2]} />
                    <meshStandardMaterial color={COLORS.jeans} />
                </mesh>
                <mesh position={[0, -0.85, 0.1]} ref={leftLeg}>
                    <boxGeometry args={[0.22, 0.2, 0.3]} />
                    <meshStandardMaterial color={COLORS.boots} />
                </mesh>
            </group>
            <group position={[0.15, 0.8, 0]}>
                <mesh ref={rightLeg} position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.85, 0.2]} />
                    <meshStandardMaterial color={COLORS.jeans} />
                </mesh>
                 <mesh position={[0, -0.85, 0.1]} ref={rightLeg}>
                    <boxGeometry args={[0.22, 0.2, 0.3]} />
                    <meshStandardMaterial color={COLORS.boots} />
                </mesh>
            </group>
        </group>
    );
};

const PlaneAbility: React.FC<{ active: boolean }> = ({ active }) => {
    const group = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (!group.current || !active) return;
        const t = clock.getElapsedTime();
        // Fly over animation
        group.current.position.z = -100 + (t % 10) * 40; 
        group.current.position.y = 40;
    });

    if (!active) return null;

    return (
        <group ref={group}>
            {/* Plane Body */}
            <mesh rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.5, 0.2, 6]} />
                <meshStandardMaterial color="gray" />
            </mesh>
            {/* Wings */}
            <mesh position={[0, 0, 0.5]} rotation={[Math.PI/2, 0, 0]}>
                <boxGeometry args={[6, 0.1, 2]} />
                <meshStandardMaterial color="darkgray" />
            </mesh>
             {/* Tail */}
             <mesh position={[0, 0, 2.5]} rotation={[Math.PI/2, 0, 0]}>
                <boxGeometry args={[2.5, 0.1, 1]} />
                <meshStandardMaterial color="darkgray" />
            </mesh>
        </group>
    )
};

// --- SYNTHWAVE 1v1 MAP ---
const PalmTree: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    return (
        <group position={position}>
            {/* Trunk */}
            <mesh position={[0, 2.5, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.3, 5, 6]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
            {/* Leaves */}
            <mesh position={[0, 5, 0]} rotation={[0.5, 0, 0]}>
                <coneGeometry args={[1.5, 3, 5]} />
                <meshStandardMaterial color="#000" />
            </mesh>
            <mesh position={[0, 5, 0]} rotation={[-0.5, 0.5, 0]}>
                <coneGeometry args={[1.5, 3, 5]} />
                <meshStandardMaterial color="#000" />
            </mesh>
             <mesh position={[0, 5, 0]} rotation={[0, 0, 0.5]}>
                <coneGeometry args={[1.5, 3, 5]} />
                <meshStandardMaterial color="#000" />
            </mesh>
        </group>
    )
}

const SynthwaveHouse: React.FC<{ position: [number, number, number], rotation: [number, number, number] }> = ({ position, rotation }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Body */}
            <mesh position={[0, 3, 0]}>
                <boxGeometry args={[6, 6, 6]} />
                <meshStandardMaterial color="#2a004a" emissive="#4d0099" emissiveIntensity={0.2} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 7.5, 0]} rotation={[0, Math.PI/4, 0]}>
                 <coneGeometry args={[5.5, 3, 4]} />
                 <meshStandardMaterial color="#ff00aa" emissive="#ff00aa" emissiveIntensity={0.5} />
            </mesh>
            {/* Window */}
            <mesh position={[0, 3, 3.1]}>
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.8} />
            </mesh>
        </group>
    )
}

const SynthwaveMap: React.FC = () => {
    return (
        <group>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.2} color={COLORS.synthSkyBottom} />
            <pointLight position={[0, 50, 0]} intensity={1} color={COLORS.synthSun} />
            
            {/* Infinite Reflective Water Floor (Size increased from 200 to 1000) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial 
                    color={COLORS.synthWater} 
                    roughness={0} 
                    metalness={0.8} 
                    emissive={COLORS.synthWater}
                    emissiveIntensity={0.2}
                />
            </mesh>
            
            {/* Neon Grid */}
            <gridHelper args={[200, 50, COLORS.synthGrid, COLORS.synthSkyBottom]} position={[0, 0.05, 0]} />

            {/* Ramps */}
            <mesh position={[0, 1, 8]} rotation={[0, 0, -0.25]} castShadow>
                <boxGeometry args={[4, 0.2, 5]} />
                <meshStandardMaterial color="#000" emissive={COLORS.synthGrid} emissiveIntensity={0.5} />
            </mesh>
             <mesh position={[0, 2, 8]} rotation={[-0.5, 0, 0]}>
                 <boxGeometry args={[4, 5, 0.2]} />
                 <meshStandardMaterial color="#000" emissive={COLORS.synthGrid} emissiveIntensity={0.5} />
            </mesh>

            <mesh position={[0, 1, -8]} rotation={[0, 0, 0.25]} castShadow>
                 <boxGeometry args={[4, 0.2, 5]} />
                 <meshStandardMaterial color="#000" emissive={COLORS.synthSun} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 2, -8]} rotation={[0.5, 0, 0]}>
                 <boxGeometry args={[4, 5, 0.2]} />
                 <meshStandardMaterial color="#000" emissive={COLORS.synthSun} emissiveIntensity={0.5} />
            </mesh>

            {/* Palm Trees */}
            <PalmTree position={[15, 0, 15]} />
            <PalmTree position={[-15, 0, 15]} />
            <PalmTree position={[15, 0, -15]} />
            <PalmTree position={[-15, 0, -15]} />
            
            {/* Houses surrounding the arena */}
            <SynthwaveHouse position={[40, 0, 0]} rotation={[0, -Math.PI/2, 0]} />
            <SynthwaveHouse position={[-40, 0, 0]} rotation={[0, Math.PI/2, 0]} />
            <SynthwaveHouse position={[0, 0, 40]} rotation={[0, Math.PI, 0]} />
            <SynthwaveHouse position={[0, 0, -40]} rotation={[0, 0, 0]} />
            
            <SynthwaveHouse position={[30, 0, 30]} rotation={[0, -Math.PI/4, 0]} />
            <SynthwaveHouse position={[-30, 0, 30]} rotation={[0, Math.PI/4, 0]} />
            <SynthwaveHouse position={[30, 0, -30]} rotation={[0, -Math.PI*0.75, 0]} />
            <SynthwaveHouse position={[-30, 0, -30]} rotation={[0, Math.PI*0.75, 0]} />

            {/* Floating text */}
            <Float speed={2} rotationIntensity={0} floatIntensity={1}>
                <Text position={[0, 15, -30]} fontSize={4} color={COLORS.synthGrid} outlineColor="#000" outlineWidth={0.1}>
                    1v1 ARENA
                </Text>
            </Float>
        </group>
    );
};

// --- BATTLE ROYALE MAP ---
const BattleRoyaleMap: React.FC = () => {
    const trees = useMemo(() => {
        const t = [];
        for(let i=0; i<40; i++) {
            const x = (Math.random() - 0.5) * MAP_SIZE_BR;
            const z = (Math.random() - 0.5) * MAP_SIZE_BR;
            t.push(<PalmTree key={i} position={[x, 0, z]} />);
        }
        return t;
    }, []);

    return (
        <group>
            <Sky sunPosition={[100, 20, 100]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[50, 50, 50]} castShadow intensity={1} />
            
            {/* Grass Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[MAP_SIZE_BR, MAP_SIZE_BR]} />
                <meshStandardMaterial color="#2d5a27" roughness={0.8} />
            </mesh>

            {trees}

            {/* Some Rocks */}
            <mesh position={[20, 1, 20]} castShadow><dodecahedronGeometry args={[2]} /><meshStandardMaterial color="#555" /></mesh>
            <mesh position={[-30, 2, -10]} castShadow><dodecahedronGeometry args={[4]} /><meshStandardMaterial color="#555" /></mesh>
        </group>
    );
};

// --- LOBBY MAP ---
const LobbyMap: React.FC = () => {
    return (
        <group>
            <color attach="background" args={['#3b82f6']} />
            <ambientLight intensity={0.8} />
            <spotLight position={[5, 5, 5]} intensity={1} castShadow />
            <directionalLight position={[-5, 5, 5]} intensity={0.5} />
            
            {/* Simple Floor/Pedestal */}
            <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
               <circleGeometry args={[2, 32]} />
               <meshStandardMaterial color="#1d4ed8" />
            </mesh>
            
            {/* Subtle Grid behind */}
             <gridHelper args={[20, 20, '#60a5fa', '#3b82f6']} position={[0, 0, -2]} rotation={[Math.PI/4, 0, 0]} />
        </group>
    )
}

const DamageIndicator: React.FC<{ data: DamageText }> = ({ data }) => {
    // Explicitly cast to string to prevent object-as-child error
    const textContent = String(`${data.isCrit ? "CRIT!" : ""}${Math.floor(data.damage)}`);
    return (
        <group position={data.position}>
            <Float speed={2} floatIntensity={1}>
                <Billboard>
                    <Text fontSize={data.isCrit ? 0.8 : 0.5} color={data.isCrit ? "red" : "white"}>
                        {textContent}
                    </Text>
                </Billboard>
            </Float>
        </group>
    );
};

// --- GAME LOGIC COMPONENT ---

interface GameContentProps {
  status: GameStatus;
  gameMode: GameMode;
  onMatchStart: () => void;
  onGameOver: (won: boolean) => void;
  sensitivity: number;
  controls: ControlScheme;
  playerSkin: Skin;
  weaponLevel: number;
  
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  setEnemiesAlive: React.Dispatch<React.SetStateAction<number>>;
  setBuildMode: React.Dispatch<React.SetStateAction<BuildType>>;
  setCanEdit: React.Dispatch<React.SetStateAction<boolean>>;
  onTogglePause: () => void;
  wins: number;
}

const GameContent: React.FC<GameContentProps> = ({ 
    status, gameMode, onMatchStart, onGameOver, sensitivity, controls, playerSkin, weaponLevel,
    setStats, setEnemiesAlive, setBuildMode, setCanEdit, onTogglePause, wins
}) => {
  const { camera, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const movementRaycaster = useMemo(() => new THREE.Raycaster(), []);
  
  const isAiming = useRef(false);
  const keys = useRef<{ [key: string]: boolean }>({});
  
  const playerPos = useRef(new Vector3(0, 0, 15)); 
  const playerRot = useRef(new Euler(0, Math.PI, 0)); 
  const playerVel = useRef(new Vector3());
  const isGrounded = useRef(true);

  const enemies = useRef<Enemy[]>([]);
  const bullets = useRef<Bullet[]>([]);
  const structures = useRef<Structure[]>([]);
  const [visualBullets, setVisualBullets] = useState<Bullet[]>([]);
  const [damageTexts, setDamageTexts] = useState<DamageText[]>([]);
  
  // Building Logic
  const [currentBuildMode, setCurrentBuildMode] = useState(BuildType.NONE);
  const [previewPos, setPreviewPos] = useState(new Vector3());
  const [previewRot, setPreviewRot] = useState(new Euler());

  // Plane Ability State
  const [planeActive, setPlaneActive] = useState(false);
  const planeTimer = useRef(0);

  // Determine Weapon Type
  const isShotgun = weaponLevel === 1; // Level 1 is Shotgun
  const hasPlane = wins >= 50;

  // Cleanup old damage texts
  useEffect(() => {
      const i = setInterval(() => {
          setDamageTexts(prev => prev.filter(t => Date.now() - t.createdAt < 1000));
      }, 500);
      return () => clearInterval(i);
  }, []);

  // Initialize Match
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
        playerPos.current.set(0, 50, 0); // Drop from sky
        structures.current = []; // Clear buildings
        setDamageTexts([]);
        setVisualBullets([]);
        setPlaneActive(false);
        setStats(s => ({ ...s, weaponLevel: weaponLevel }));
        
        const count = gameMode === GameMode.ONE_V_ONE ? 1 : 14;
        const newEnemies: Enemy[] = [];
        const spawnRange = gameMode === GameMode.ONE_V_ONE ? 15 : 80;

        for (let i = 0; i < count; i++) {
            newEnemies.push({
                id: `bot-${i}`,
                name: BOT_NAMES[i % BOT_NAMES.length],
                position: new Vector3(
                    (Math.random() - 0.5) * spawnRange, 
                    0, 
                    (Math.random() - 0.5) * spawnRange
                ),
                velocity: new Vector3(),
                health: 100,
                targetPos: new Vector3(),
                nextMoveTime: 0,
                lastShotTime: 0,
                skinColor: 'red',
                splats: []
            });
        }
        enemies.current = newEnemies;
        setEnemiesAlive(count);
    }
  }, [status, gameMode, setEnemiesAlive, weaponLevel]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
        keys.current[e.code] = true;
        if (e.code === 'Escape') onTogglePause();
        if (status !== GameStatus.PLAYING) return;
        
        if (e.code === controls.buildWall) { setCurrentBuildMode(BuildType.WALL); setBuildMode(BuildType.WALL); }
        if (e.code === controls.buildFloor) { setCurrentBuildMode(BuildType.FLOOR); setBuildMode(BuildType.FLOOR); }
        if (e.code === controls.buildRamp) { setCurrentBuildMode(BuildType.RAMP); setBuildMode(BuildType.RAMP); }
        if (e.code === controls.toggleBuild) { 
             const newVal = currentBuildMode === BuildType.NONE ? BuildType.WALL : BuildType.NONE;
             setCurrentBuildMode(newVal); 
             setBuildMode(newVal);
        }
        
        // Plane Ability
        if (e.code === controls.ability && hasPlane && !planeActive) {
            setPlaneActive(true);
            planeTimer.current = Date.now();
        }
    };
    const up = (e: KeyboardEvent) => keys.current[e.code] = false;
    
    const mousedown = (e: MouseEvent) => {
        if (status !== GameStatus.PLAYING) return;
        
        // --- BUILDING PLACEMENT ---
        if (currentBuildMode !== BuildType.NONE && e.button === 0) {
            const newStruct: Structure = {
                id: Math.random().toString(),
                type: currentBuildMode,
                position: previewPos.clone(),
                rotation: previewRot.clone(),
                variant: StructureVariant.FULL
            };
            structures.current.push(newStruct);
            setStats(p => ({...p, materials: p.materials - 10}));
            return;
        }

        // --- SHOOTING (Rifle or Shotgun) ---
        if(e.button === 0 && currentBuildMode === BuildType.NONE) {
             const bulletsToFire = isShotgun ? 6 : 1;
             const spreadAmount = isShotgun ? 0.15 : 0.01;

             for(let i=0; i<bulletsToFire; i++) {
                 // Raycast from camera center
                 raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
                 // Add Spread if Shotgun
                 if (isShotgun) {
                     raycaster.ray.direction.x += (Math.random() - 0.5) * spreadAmount;
                     raycaster.ray.direction.y += (Math.random() - 0.5) * spreadAmount;
                 }
                 
                 const intersects = raycaster.intersectObjects(scene.children, true);
                 
                 let targetPoint = new Vector3();
                 if (intersects.length > 0) {
                     targetPoint.copy(intersects[0].point);
                 } else {
                     targetPoint.copy(camera.position).add(raycaster.ray.direction.multiplyScalar(100));
                 }

                 const gunPos = playerPos.current.clone().add(new Vector3(0.5, 1.5, 0.5).applyEuler(playerRot.current));
                 const direction = targetPoint.sub(gunPos).normalize().multiplyScalar(50);

                 const newBullet: Bullet = {
                     id: Math.random().toString(),
                     position: gunPos,
                     direction: direction,
                     ownerId: 'player',
                     createdAt: Date.now(),
                     color: isShotgun ? 'orange' : 'blue', // Ink Color
                     damage: isShotgun ? 15 : 35 // Lower damage per pellet for shotgun
                 };
                 setVisualBullets(prev => [...prev, newBullet]);
             }
             setStats(prev => ({...prev, ammo: Math.max(0, prev.ammo - 1)}));
        }
        if(e.button === 2) isAiming.current = true;
    };
    const mouseup = (e: MouseEvent) => { if(e.button === 2) isAiming.current = false; };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('mousedown', mousedown);
    window.addEventListener('mouseup', mouseup);
    return () => {
        window.removeEventListener('keydown', down);
        window.removeEventListener('keyup', up);
        window.removeEventListener('mousedown', mousedown);
        window.removeEventListener('mouseup', mouseup);
    }
  }, [controls, status, onMatchStart, setBuildMode, setStats, onTogglePause, currentBuildMode, previewPos, previewRot, hasPlane, planeActive, isShotgun]);

  useFrame((state, delta) => {
      if (status === GameStatus.PAUSED) return;

      if (status === GameStatus.MENU || status === GameStatus.LOBBY || status === GameStatus.MATCHMAKING || status === GameStatus.VICTORY || status === GameStatus.DEFEAT) {
          // Reset player pos for lobby view
          playerPos.current.set(0, 0, 0);
          
          const targetPos = playerPos.current.clone().add(CAMERA_OFFSET_LOBBY as Vector3);
          camera.position.lerp(targetPos, delta * 5);
          camera.lookAt(playerPos.current.clone().add(new Vector3(0,1,0)));
          playerRot.current.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2 + Math.PI; 
          return;
      }

      if (status === GameStatus.PLAYING) {
          // --- MOVEMENT & COLLISION ---
          const speed = PLAYER_SPEED * delta;
          const camDir = new Vector3();
          camera.getWorldDirection(camDir);
          const forward = new Vector3(camDir.x, 0, camDir.z).normalize();
          const right = new Vector3(camDir.z, 0, -camDir.x).normalize();
          
          const move = new Vector3();
          if(keys.current[controls.forward]) move.add(forward);
          if(keys.current[controls.backward]) move.sub(forward);
          if(keys.current[controls.left]) move.add(right);
          if(keys.current[controls.right]) move.sub(right);

          if(move.length() > 0) {
               move.normalize().multiplyScalar(speed);
               
               // --- COLLISION CHECK ---
               const nextPos = playerPos.current.clone().add(move);
               let collided = false;
               
               movementRaycaster.set(playerPos.current.clone().add(new Vector3(0,1,0)), move.clone().normalize());
               
               for (const struct of structures.current) {
                   const dist = struct.position.distanceTo(nextPos);
                   if (dist < 2.5 && Math.abs(struct.position.y - nextPos.y) < 3) {
                       collided = true;
                       break;
                   }
               }
               
               if (!collided) {
                   playerPos.current.add(move);
                   playerRot.current.y = Math.atan2(camDir.x, camDir.z); 
               }
          }

          // --- VERTICAL COLLISION (Gravity & Ramps) ---
          let groundY = 0;
          for (const s of structures.current) {
               const dx = playerPos.current.x - s.position.x;
               const dz = playerPos.current.z - s.position.z;
               const theta = -s.rotation.y;
               const localX = dx * Math.cos(theta) - dz * Math.sin(theta);
               const localZ = dx * Math.sin(theta) + dz * Math.cos(theta);

               if (Math.abs(localX) < 2 && Math.abs(localZ) < 2) {
                   if (s.type === BuildType.FLOOR) {
                       if (playerPos.current.y >= s.position.y - 0.5) {
                           groundY = Math.max(groundY, s.position.y);
                       }
                   } else if (s.type === BuildType.RAMP) {
                       const rampHeight = s.position.y - localZ;
                       if (playerPos.current.y >= rampHeight - 1.0 && playerPos.current.y <= rampHeight + 2.0) {
                           groundY = Math.max(groundY, rampHeight);
                       }
                   }
               }
          }

          if(!isGrounded.current) playerVel.current.y -= GRAVITY * delta;
          if(playerPos.current.y <= groundY + 0.2 && playerVel.current.y <= 0) {
              playerPos.current.y = groundY;
              playerVel.current.y = 0;
              isGrounded.current = true;
          } else {
              isGrounded.current = false;
          }

          if(isGrounded.current && keys.current[controls.jump]) {
              playerVel.current.y = JUMP_FORCE;
              isGrounded.current = false;
          }
          playerPos.current.y += playerVel.current.y * delta;
          
          if(playerPos.current.y < 0) {
              playerPos.current.y = 0;
              isGrounded.current = true;
          }

          // --- PLANE AIRSTRIKE LOGIC ---
          if (planeActive) {
              if (Date.now() - planeTimer.current > 5000) setPlaneActive(false); 
              if (Math.random() < 0.1) {
                   const randomEnemy = enemies.current[Math.floor(Math.random() * enemies.current.length)];
                   if (randomEnemy) {
                       randomEnemy.health -= 50;
                       setDamageTexts(d => [...d, {
                            id: Math.random().toString(),
                            position: randomEnemy.position.clone().add(new Vector3(0, 3, 0)),
                            damage: 999,
                            isCrit: true,
                            opacity: 1,
                            createdAt: Date.now()
                       }]);
                        if(randomEnemy.health <= 0) {
                            setStats(s => ({...s, kills: s.kills + 1}));
                            setEnemiesAlive(a => a - 1);
                        }
                   }
              }
          }

          // --- CAMERA ---
          const offset = isAiming.current ? CAMERA_OFFSET_ADS : CAMERA_OFFSET_TPS;
          const yaw = new Euler(0, camera.rotation.y, 0);
          const chaseOffset = new Vector3(offset.x, offset.y, offset.z).applyEuler(yaw);
          const desiredPos = playerPos.current.clone().add(chaseOffset);
          camera.position.lerp(desiredPos, delta * 20);

          // --- BUILDING PREVIEW CALCULATION ---
          if (currentBuildMode !== BuildType.NONE) {
              const snapSize = GRID_SIZE;
              const front = new Vector3(0, 0, -snapSize).applyEuler(playerRot.current).add(playerPos.current);
              
              const snapX = Math.round(front.x / snapSize) * snapSize;
              const snapZ = Math.round(front.z / snapSize) * snapSize;
              const snapY = Math.round(playerPos.current.y / snapSize) * snapSize + (snapSize/2);

              setPreviewPos(new Vector3(snapX, snapY, snapZ));

              const deg = (playerRot.current.y * 180 / Math.PI + 360) % 360;
              let rotY = 0;
              if (deg >= 45 && deg < 135) rotY = -Math.PI/2;
              else if (deg >= 135 && deg < 225) rotY = Math.PI; 
              else if (deg >= 225 && deg < 315) rotY = Math.PI/2;
              else rotY = 0;

              setPreviewRot(new Euler(0, rotY, 0));
          }

          // --- BULLET UPDATE & COLLISION ---
          setVisualBullets(prev => {
               const nextBullets: Bullet[] = [];
               prev.forEach(b => {
                   const moveStep = b.direction.clone().multiplyScalar(delta);
                   const nextPos = b.position.clone().add(moveStep);
                   let hit = false;
                   for(const enemy of enemies.current) {
                        const center = enemy.position.clone().add(new Vector3(0, 1.2, 0));
                        if(nextPos.distanceTo(center) < 1.0) {
                            hit = true;
                            const isCrit = Math.random() > 0.8;
                            const dmg = isCrit ? b.damage * 2 : b.damage;
                            enemy.health -= dmg;

                            setDamageTexts(d => [...d, {
                                id: Math.random().toString(),
                                position: enemy.position.clone().add(new Vector3(0, 2.2, 0)),
                                damage: dmg,
                                isCrit,
                                opacity: 1,
                                createdAt: Date.now()
                            }]);

                            if(enemy.health <= 0) {
                                setStats(s => ({...s, kills: s.kills + 1}));
                                setEnemiesAlive(a => a - 1);
                            }
                            break;
                        }
                   }

                   if (!hit && b.createdAt + 2000 > Date.now()) {
                        b.position.copy(nextPos);
                        nextBullets.push(b);
                   }
               });
               return nextBullets;
          });
          
          enemies.current = enemies.current.filter(e => e.health > 0);
          
          enemies.current.forEach(e => {
               const dir = playerPos.current.clone().sub(e.position).normalize();
               if(e.position.distanceTo(playerPos.current) > 5) {
                   e.position.add(dir.multiplyScalar(BOT_SPEED * delta));
               }
          });
      }
  });

  const isMenu = status === GameStatus.MENU || status === GameStatus.LOBBY || status === GameStatus.MATCHMAKING || status === GameStatus.VICTORY || status === GameStatus.DEFEAT;

  return (
    <>
         {isMenu ? (
             <LobbyMap />
         ) : (
             gameMode === GameMode.ONE_V_ONE ? <SynthwaveMap /> : <BattleRoyaleMap />
         )}
         
         <PlaneAbility active={planeActive} />
         
         <SurvivorCharacter position={playerPos.current} rotation={playerRot.current} isPlayer={true} skinColor={playerSkin.color} />
         
         {!isMenu && enemies.current.map(e => (
             <SurvivorCharacter key={e.id} position={e.position} isEnemy={true} name={e.name} />
         ))}

         {/* RENDER BULLETS */}
         {visualBullets.map(b => (
             <mesh key={b.id} position={b.position}><sphereGeometry args={[0.1]} /><meshBasicMaterial color={b.color} /></mesh>
         ))}

         {/* RENDER DAMAGE TEXTS */}
         {damageTexts.map(t => (
             <DamageIndicator key={t.id} data={t} />
         ))}

         {/* RENDER STRUCTURES */}
         {structures.current.map(s => (
             <group key={s.id} position={s.position} rotation={s.rotation}>
                 {s.type === BuildType.WALL && (
                     <mesh>
                         <boxGeometry args={[4, 4, 0.2]} />
                         <meshStandardMaterial color={COLORS.wood} map={null} />
                     </mesh>
                 )}
                 {s.type === BuildType.FLOOR && (
                     <mesh rotation={[Math.PI/2, 0, 0]}>
                         <boxGeometry args={[4, 4, 0.2]} />
                         <meshStandardMaterial color={COLORS.wood} />
                     </mesh>
                 )}
                 {s.type === BuildType.RAMP && (
                     <mesh rotation={[-Math.PI/4, 0, 0]} position={[0, 0, 0]}>
                         <boxGeometry args={[4, 5.6, 0.2]} />
                         <meshStandardMaterial color={COLORS.wood} />
                     </mesh>
                 )}
             </group>
         ))}

         {/* BUILDING PREVIEW */}
         {currentBuildMode !== BuildType.NONE && (
             <group position={previewPos} rotation={previewRot}>
                 {currentBuildMode === BuildType.WALL && (
                     <mesh>
                         <boxGeometry args={[4, 4, 0.2]} />
                         <meshBasicMaterial color={COLORS.buildPreview} transparent opacity={0.5} />
                     </mesh>
                 )}
                 {currentBuildMode === BuildType.FLOOR && (
                     <mesh rotation={[Math.PI/2, 0, 0]}>
                         <boxGeometry args={[4, 4, 0.2]} />
                         <meshBasicMaterial color={COLORS.buildPreview} transparent opacity={0.5} />
                     </mesh>
                 )}
                 {currentBuildMode === BuildType.RAMP && (
                     <mesh rotation={[-Math.PI/4, 0, 0]} position={[0, 0, 0]}>
                         <boxGeometry args={[4, 5.6, 0.2]} />
                         <meshBasicMaterial color={COLORS.buildPreview} transparent opacity={0.5} />
                     </mesh>
                 )}
             </group>
         )}

         {status === GameStatus.PLAYING && (
            <PointerLockControls />
         )}
    </>
  );
};

export const GameScene: React.FC<{ 
  status: GameStatus;
  gameMode: GameMode;
  onMatchStart: () => void;
  onGameOver: (won: boolean) => void;
  sensitivity: number;
  controls: ControlScheme;
  playerSkin: Skin;
  weaponLevel: number;
  hasShotgun: boolean;
  selectedPaint: PaintColor;
  wins: number;
  onTogglePause: () => void;
}> = (props) => {
  const [stats, setStats] = useState<PlayerStats>({ health: 100, shield: 100, ammo: MAX_AMMO, kills: 0, alive: true, materials: 9999, weaponLevel: 0 });
  const [enemiesAlive, setEnemiesAlive] = useState(1);
  const [buildMode, setBuildMode] = useState<BuildType>(BuildType.NONE);
  const [canEdit, setCanEdit] = useState(false);
  
  const crosshair = DEFAULT_CROSSHAIR; 

  return (
    <>
      <Canvas shadows camera={{ fov: FOV_TPS }}>
         <GameContent 
            {...props}
            setStats={setStats}
            setEnemiesAlive={setEnemiesAlive}
            setBuildMode={setBuildMode}
            setCanEdit={setCanEdit}
         />
      </Canvas>
      <GameUI 
        stats={stats} enemiesAlive={enemiesAlive} stormDistance={0} buildMode={buildMode} 
        lobbyTime={null} canEdit={canEdit} skinColor="white" onWatchAd={()=>{}} isWatchingAd={false} wins={props.wins} showPlaneAbility={props.wins >= 50}
        crosshair={crosshair}
        gameStatus={props.status}
      />
    </>
  );
};