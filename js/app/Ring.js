import * as THREE from '../lib/three.js/three.module.js'

class Ring extends THREE.Mesh{
    constructor(diameter, thickness, color=0xffffff, texture=null, details=128){
        const geometry = new THREE.RingGeometry(diameter / 2, diameter/2 + thickness, details);
        const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: color, map: texture});
        
        super(geometry, material);
        
        this.is_ring = true;

        this.rotation.x = Math.PI / 2;
        this.diameter = diameter;
        this.thickness = thickness;

        const hitbox_geometry = new THREE.CircleGeometry((diameter + thickness) / 2 , details);
        const hitbox_material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, opacity: 0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true});

        this.hitbox = new THREE.Mesh(hitbox_geometry, hitbox_material);
        this.add(this.hitbox);        
    }
}

export {Ring}