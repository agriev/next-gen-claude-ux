/**
 * WorkerSpinner — B12. Renders a "thinking…" placeholder at the Worker
 * spawn position the moment the user kicks off a prompt, before any
 * create_artifact tool call has arrived. The spinner is a slowly rotating
 * dodecahedron + SDF label with the prompt preview.
 *
 * Cleared by the store when the action status transitions to a terminal
 * value (done / error / cancelled).
 *
 * Why this matters: the perception gap between "I pressed Enter" and "I
 * see something happen" is what makes the product feel slow even when
 * the LLM is just being normally fast. Closing that gap to ≤200ms gives
 * the user a clear acknowledgement signal.
 */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';
import { useWorldStore } from '../store/world-store';
import { Label } from './text/Label';

function Spinner({ position, prompt }: { position: { x: number; y: number; z: number }; prompt: string }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += dt * 1.8;
    meshRef.current.rotation.x += dt * 1.2;
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color="#5EEAD4"
          emissive="#5EEAD4"
          emissiveIntensity={0.7}
          transparent
          opacity={0.55}
          wireframe
        />
      </mesh>
      <Label
        position={[0, -0.7, 0]}
        fontSize={0.16}
        color="#5EEAD4"
        outlineWidth={0.012}
        outlineColor="#0A0B0E"
        anchorY="top"
        renderOrder={20}
      >
        {`Worker · ${prompt.length > 40 ? prompt.slice(0, 39) + '…' : prompt}`}
      </Label>
    </group>
  );
}

export function WorkerSpinners() {
  const spinners = useWorldStore(s => s.workerSpinners);
  if (spinners.size === 0) return null;
  return (
    <group>
      {[...spinners.values()].map(s => (
        <Spinner key={s.actionId} position={s.position} prompt={s.prompt} />
      ))}
    </group>
  );
}
