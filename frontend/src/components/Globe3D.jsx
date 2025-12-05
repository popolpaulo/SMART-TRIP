import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader, Raycaster, Vector2 } from 'three';
import * as THREE from 'three';
import { DESTINATIONS } from '../utils/destinations';

const Globe3D = ({ onCountryClick, inspirationMode = false, zoomToDestination = null, onZoomComplete }) => {
  const globeGroupRef = useRef(); // Groupe qui contient le globe ET les marqueurs
  const meshRef = useRef();
  const cloudsRef = useRef();
  const markersRef = useRef([]);
  const { camera, gl } = useThree();
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomAnimation, setZoomAnimation] = useState(null);

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

  // Démarrer l'animation de zoom quand une destination est sélectionnée
  React.useEffect(() => {
    if (zoomToDestination && !isZooming && globeGroupRef.current) {
      const destination = DESTINATIONS.find(d => 
        d.city.toLowerCase() === zoomToDestination.toLowerCase()
      );
      
      if (destination) {
        setIsZooming(true);
        
        // Trouver le marqueur correspondant à cette destination
        const markerIndex = DESTINATIONS.findIndex(d => 
          d.city.toLowerCase() === zoomToDestination.toLowerCase()
        );
        
        const targetMarker = markersRef.current[markerIndex];
        
        if (targetMarker) {
          // Position initiale de la caméra
          const startCameraPos = camera.position.clone();
          
          // Obtenir la position mondiale du marqueur (en tenant compte de la rotation du globe)
          const markerWorldPos = new THREE.Vector3();
          targetMarker.getWorldPosition(markerWorldPos);
          
          // Calculer la direction depuis le centre du globe vers le marqueur
          const direction = markerWorldPos.clone().normalize();
          
          // Position cible de la caméra : en face du marqueur à distance de zoom
          const zoomDistance = 4.5;
          const targetCameraPos = direction.clone().multiplyScalar(zoomDistance);
          
          console.log('Zoom vers:', destination.city);
          console.log('Position du marqueur:', markerWorldPos);
          console.log('Position cible caméra:', targetCameraPos);
          
          setZoomAnimation({
            startTime: Date.now(),
            duration: 2500,
            startCameraPos,
            targetCameraPos,
            startGlobeRotation: null, // Pas de rotation du globe, on bouge juste la caméra
            targetGlobeRotation: null
          });
        }
      }
    }
  }, [zoomToDestination, isZooming, camera]);

  // Animation de rotation automatique et zoom
  useFrame((state, delta) => {
    // Mode inspiration : rotation plus rapide
    if (inspirationMode && globeGroupRef.current && !isZooming) {
      globeGroupRef.current.rotation.y += delta * 0.3;
    } else if (globeGroupRef.current && !isZooming) {
      // Rotation normale
      globeGroupRef.current.rotation.y += delta * 0.15;
    }

    // Animation de zoom en cours
    if (zoomAnimation && globeGroupRef.current) {
      const elapsed = Date.now() - zoomAnimation.startTime;
      const progress = Math.min(elapsed / zoomAnimation.duration, 1);
      
      // Easing function (ease-in-out)
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Animer le zoom de la caméra vers le marqueur
      camera.position.lerpVectors(
        zoomAnimation.startCameraPos, 
        zoomAnimation.targetCameraPos, 
        eased
      );
      camera.lookAt(0, 0, 0);
      
      // Fin de l'animation
      if (progress >= 1) {
        setZoomAnimation(null);
        if (onZoomComplete) {
          setTimeout(() => onZoomComplete(), 500);
        }
      }
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

      {/* Lumière ambiante augmentée pour éclaircir le globe */}
      <ambientLight intensity={0.9} />
      
      {/* Lumière directionnelle (soleil) plus intense */}
      <directionalLight position={[5, 3, 5]} intensity={2.5} />
      
      {/* Point de lumière supplémentaire */}
      <pointLight position={[-10, 0, -10]} intensity={1.2} color="#4080ff" />

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

        {/* Marqueurs invisibles pour les destinations - servent de repères pour le zoom */}
        {DESTINATIONS.map((dest, index) => {
          const position = latLonToVector3(dest.lat, dest.lon);
          return (
            <mesh
              key={index}
              position={position}
              ref={(el) => (markersRef.current[index] = el)}
              userData={{ country: dest.country, city: dest.city }}
            >
              <sphereGeometry args={[0.01, 8, 8]} />
              <meshBasicMaterial 
                transparent
                opacity={0}
                visible={false}
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
        enableZoom={!isZooming}
        enablePan={!isZooming}
        enableRotate={!isZooming}
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
