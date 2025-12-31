'use client';

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

interface VisualizerSceneProps {
    sugarGrams: number;
}

function SugarCube({ position, delay }: { position: [number, number, number], delay: number }) {
    // Small random rotation for realism
    const rotation = useMemo(() => [
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
    ] as [number, number, number], []);

    return (
        <mesh position={position} rotation={rotation} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />{/* 1 unit = 1 cube */}
            <meshStandardMaterial
                color="#ffffff"
                roughness={0.6}
                metalness={0.1}
            />
            {/* Sub-mesh for slight detailing or grain could go here, but omitted for simple style */}
        </mesh>
    );
}

function CubeStack({ count }: { count: number }) {
    const cubes = useMemo(() => {
        const items: { position: [number, number, number], id: number }[] = [];
        // Stack logic: Simple pyramid-ish pile or just a grid?
        // Let's do a compact grid to ensure it fits in view.
        // Base size depends on total count to keep it stable.
        const baseSize = Math.ceil(Math.pow(count, 1 / 3) * 1.5); // Heuristic for base

        let stored = 0;
        let y = 0.5; // Start half-height up (box is height 1, origin center)

        // Simple stacking: fill layers 
        // 4 cubes per layer example, or varying.
        // Let's do a fixed width grid, e.g., 3x3 max base for typical soda cans

        const width = 3;
        const depth = 3;

        for (let i = 0; i < count; i++) {
            // Grid layout
            const layerIndex = Math.floor(i / (width * depth));
            const indexInLayer = i % (width * depth);
            const x = (indexInLayer % width) - (width - 1) / 2;
            const z = (Math.floor(indexInLayer / width)) - (depth - 1) / 2;

            // Add random noise to position
            const jitterX = (Math.random() - 0.5) * 0.1;
            const jitterZ = (Math.random() - 0.5) * 0.1;

            items.push({
                id: i,
                position: [x + jitterX, 0.5 + layerIndex * 1.01, z + jitterZ]
            });
        }
        return items;
    }, [count]);

    return (
        <group>
            {cubes.map((cube, i) => (
                <SugarCube key={cube.id} position={cube.position} delay={i * 0.05} />
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
