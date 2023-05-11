import * as THREE from '../lib/three.js/three.module.js'

class Path extends THREE.Mesh{
    constructor(width=0.2, positions, color=0xffffff){
        const curve = new THREE.CatmullRomCurve3(positions, true, 'centripetal', 0.5);

        const geometry = new THREE.TubeBufferGeometry(curve, 512, width, 3, false);
        
        const material = new THREE.MeshBasicMaterial({color: color, side: THREE.FrontSide, opacity: 0.5, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true});
                
        super(geometry, material);

        this.curve = curve;

        const num = 6;
        for(let i=0; i<geometry.attributes.position.count; i+=num){
           
            var counter = 0;
            for(let j=i; j<i+num; j++){
                counter += geometry.attributes.position.getY(j);
            }
            for(let j=i; j<i+num; j++){
                geometry.attributes.position.setY(j, counter / num);
            }  
        }
        geometry.attributes.position.needsUpdate = true;
    }
}

export {Path}