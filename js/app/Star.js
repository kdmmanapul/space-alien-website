import * as THREE from '../lib/three.js/three.module.js'

class Star extends THREE.Sprite{
    constructor(size=1, speed=(Math.random() + 1) * 0.35, min_opacity=Math.random() / 2, max_opacity=1.0, color=0xffffff, time_offset = Math.random()){
        speed *= Math.random() * 0.5 + 0.5;
        const material = new THREE.SpriteMaterial({color: color, opacity: min_opacity});
        
        super(material);
        
        this.scale.x = size;
        this.scale.y = size;
        this.scale.z = size;
        
        this.material = material;
        
        this.min_opacity = min_opacity;
        this.max_opacity = max_opacity;
        this.color = color;
        this.time_offset = time_offset;
        this.speed = speed;
    }
    
    update(time_elapsed){
        this.material.opacity = ((time_elapsed + this.time_offset) * this.speed) % 2;
        if(this.material.opacity > 1){
            this.material.opacity = 2 - this.material.opacity;
        }
    }
    
}

export {Star};