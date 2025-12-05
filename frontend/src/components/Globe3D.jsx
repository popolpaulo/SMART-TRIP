import React, { useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader, Raycaster, Vector2 } from 'three';
import * as THREE from 'three';

// Coordonnées approximatives des principales destinations
const DESTINATIONS = [
  { name: 'France', lat: 46.2276, lon: 2.2137, city: 'Paris' },
  { name: 'États-Unis', lat: 37.0902, lon: -95.7129, city: 'New York' },
  { name: 'Japon', lat: 36.2048, lon: 138.2529, city: 'Tokyo' },
  { name: 'Royaume-Uni', lat: 55.3781, lon: -3.4360, city: 'London' },
  { name: 'Italie', lat: 41.8719, lon: 12.5674, city: 'Rome' },
  { name: 'Espagne', lat: 40.4637, lon: -3.7492, city: 'Madrid' },
  { name: 'Allemagne', lat: 51.1657, lon: 10.4515, city: 'Berlin' },
  { name: 'Brésil', lat: -14.2350, lon: -51.9253, city: 'Rio' },
  { name: 'Australie', lat: -25.2744, lon: 133.7751, city: 'Sydney' },
  { name: 'Chine', lat: 35.8617, lon: 104.1954, city: 'Beijing' },
];

const Globe3D = ({ onCountryClick }) => {
  const globeGroupRef = useRef(); // Groupe qui contient le globe ET les marqueurs
  const meshRef = useRef();
  const cloudsRef = useRef();
  const markersRef = useRef([]);
  const { camera, gl } = useThree();
  const [hoveredMarker, setHoveredMarker] = useState(null);

  // Charger la texture de la Terre
  const earthTexture = useLoader(TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  const bumpTexture = useLoader(TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-topology.png');

  // Convertir lat/lon en position 3D
  const latLonToVector3 = (lat, lon, radius = 2.55) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Gérer les clics sur les marqueurs
  const handlePointerMove = (event) => {
    const raycaster = new Raycaster();
    const mouse = new Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markersRef.current);
    
    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
      setHoveredMarker(intersects[0].object.userData.name);
    } else {
      document.body.style.cursor = 'grab';
      setHoveredMarker(null);
    }
  };

  const handleClick = (event) => {
    const raycaster = new Raycaster();
    const mouse = new Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markersRef.current);
    
    if (intersects.length > 0 && onCountryClick) {
      onCountryClick(intersects[0].object.userData.city);
    }
  };

  // Animation de rotation automatique - rotation du groupe entier
  useFrame((state, delta) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <>
      {/* Étoiles de fond */}
      <Stars
        radius={300}
        depth={60}
        count={30000}
        factor={8}
        saturation={0}
        fade
        speed={2}
      />

      {/* Lumière ambiante */}
      <ambientLight intensity={0.6} />
      
      {/* Lumière directionnelle (soleil) */}
      <directionalLight position={[5, 3, 5]} intensity={2} />
      
      {/* Point de lumière supplémentaire */}
      <pointLight position={[-10, 0, -10]} intensity={0.8} color="#4080ff" />

      {/* Groupe contenant le globe et les marqueurs - tourne ensemble */}
      <group ref={globeGroupRef}>
        {/* Globe terrestre avec texture satellite */}
        <mesh ref={meshRef} onPointerMove={handlePointerMove} onClick={handleClick}>
          <sphereGeometry args={[2.5, 64, 64]} />
          <meshStandardMaterial 
            map={earthTexture}
            bumpMap={bumpTexture}
            bumpScale={0.05}
          />
        </mesh>

        {/* Marqueurs pour les destinations principales - attachés au globe */}
        {DESTINATIONS.map((dest, index) => {
          const position = latLonToVector3(dest.lat, dest.lon);
          return (
            <mesh
              key={index}
              position={position}
              ref={(el) => (markersRef.current[index] = el)}
              userData={{ name: dest.name, city: dest.city }}
              onPointerMove={handlePointerMove}
              onClick={handleClick}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial 
                color={hoveredMarker === dest.name ? '#ff6b6b' : '#ffd93d'} 
                opacity={0.9}
                transparent
              />
            </mesh>
          );
        })}

        {/* Couche de nuages - attachée au globe */}
        <mesh ref={cloudsRef} scale={[1.008, 1.008, 1.008]}>
          <sphereGeometry args={[2.5, 64, 64]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.2}
            roughness={1}
          />
        </mesh>
      </group>

      {/* Contrôles de caméra - INTERACTIFS */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={20}
        autoRotate={false}
        autoRotateSpeed={0.5}
        rotateSpeed={0.8}
        zoomSpeed={0.8}
        makeDefault
      />
    </>
  );
};

export default Globe3D;
