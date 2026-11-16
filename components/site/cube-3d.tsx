"use client";

/**
 * Cubo 3D decorativo del hero — seis caras planas (sin iluminación, por eso
 * meshBasicMaterial) en la paleta estricta del kit: frente negro, dorso
 * blanco, laterales y base en gris "plástico", canto de 1px. `progress`
 * (0–1) rota de la cara negra (el problema) a la blanca (la solución),
 * controlado desde HeroCube vía ScrollTrigger.
 */

import { Canvas } from "@react-three/fiber";
import { Edges, OrthographicCamera } from "@react-three/drei";

const FACE = {
  plastic: "#a5a5a5",
  plasticLight: "#c9c7c3",
  plasticDark: "#3a3937",
  black: "#010101",
  white: "#ffffff",
};

function CubeMesh({ progress }: { progress: number }) {
  return (
    <group rotation={[-0.34, 0.75 + Math.PI * progress, 0]}>
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial attach="material-0" color={FACE.plastic} />
        <meshBasicMaterial attach="material-1" color={FACE.plastic} />
        <meshBasicMaterial attach="material-2" color={FACE.plasticLight} />
        <meshBasicMaterial attach="material-3" color={FACE.plasticDark} />
        <meshBasicMaterial attach="material-4" color={FACE.black} />
        <meshBasicMaterial attach="material-5" color={FACE.white} />
        <Edges color="#5e5e5e" />
      </mesh>
    </group>
  );
}

export function Cube3D({ progress = 0 }: { progress?: number }) {
  return (
    <Canvas frameloop="demand" dpr={[1, 2]} gl={{ alpha: true }}>
      <OrthographicCamera makeDefault position={[4, 3.2, 4]} zoom={70} />
      <CubeMesh progress={progress} />
    </Canvas>
  );
}
