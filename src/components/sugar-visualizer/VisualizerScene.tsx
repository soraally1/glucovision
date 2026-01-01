'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Mesh } from 'three';

interface VisualizerSceneProps {
    sugarGrams: number;
}

function SugarCube({ position, delay }: { position: [number, number, number], delay: number }) {
    const meshRef = useRef<Mesh>(null);
    const startY = 15; // Start high up
    const targetY = position[1];

    // Independent time tracking for each cube
    const timeRef = useRef(0);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Wait for delay
        if (state.clock.elapsedTime < delay) {
            meshRef.current.position.y = startY + 100; // Hide way above
            return;
        }

        timeRef.current += delta;

        // Simple physics simulation for falling
        const speed = 10;
        const currentY = meshRef.current.position.y;

        if (currentY > targetY) {
            // Fall down
            meshRef.current.position.y = Math.max(targetY, startY - (speed * timeRef.current * timeRef.current));

            // Spin while falling
            meshRef.current.rotation.x += delta * 2;
            meshRef.current.rotation.z += delta * 2;
        } else {
            // Landed - settle rotation
            meshRef.current.position.y = targetY;
            // Dampen rotation to final state (could act as a little bounce/settle if we wanted more complex physics)
            meshRef.current.rotation.x = position[0] * 0.1; // Minimal random rotation based on position
            meshRef.current.rotation.z = position[2] * 0.1;
        }
    });

    return (
        <mesh ref={meshRef} position={[position[0], startY, position[2]]} castShadow receiveShadow>
            <boxGeometry args={[0.95, 0.95, 0.95]} /> {/* Slightly smaller for gap */}
            <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.4}
                metalness={0.1}
                clearcoat={0.3}
                clearcoatRoughness={0.25}
                transmission={0.1} // Slight translucency like real sugar
                thickness={1}
            />
        </mesh>
    );
}

function CubeStack({ count }: { count: number }) {
    const cubes = useMemo(() => {
        const items: { position: [number, number, number], id: number }[] = [];
        const baseSize = Math.ceil(Math.pow(count, 1 / 3) * 1.5);

        const width = 4; // Wider stack
        const depth = 4;

        for (let i = 0; i < count; i++) {
            const layerIndex = Math.floor(i / (width * depth));
            const indexInLayer = i % (width * depth);
            const x = (indexInLayer % width) - (width - 1) / 2;
            const z = (Math.floor(indexInLayer / width)) - (depth - 1) / 2;

            // Random jitter for natural look
            const jitterX = (Math.random() - 0.5) * 0.2;
            const jitterZ = (Math.random() - 0.5) * 0.2;

            items.push({
                id: i,
                position: [x + jitterX, 0.5 + layerIndex * 1.0, z + jitterZ]
            });
        }
        return items;
    }, [count]);

    return (
        <group>
            {cubes.map((cube, i) => (
                <SugarCube key={cube.id} position={cube.position} delay={i * 0.08} />
            ))}
        </group>
    );
}

export default function VisualizerScene({ sugarGrams }: VisualizerSceneProps) {
    const cubeCount = Math.max(1, Math.round(sugarGrams / 4));

    return (
        <div className="w-full h-full">
            <Canvas shadows camera={{ position: [4, 6, 8], fov: 45 }}>
                <color attach="background" args={['#1f2937']} /> {/* Fallback color match bg-gray-800 */}
                <fog attach="fog" args={['#1f2937', 5, 20]} />

                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[5, 10, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />
                <Environment preset="city" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <group position={[0, -cubeCount / 18, 0]}> {/* Centering heuristic */}
                        <CubeStack count={cubeCount} />
                    </group>
                </Float>

                <ContactShadows
                    position={[0, -0.5, 0]}
                    opacity={0.4}
                    scale={10}
                    blur={2}
                    far={4}
                />

                <OrbitControls autoRotate autoRotateSpeed={2} enablePan={false} enableZoom={true} minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
            </Canvas>
        </div>
    );
}
