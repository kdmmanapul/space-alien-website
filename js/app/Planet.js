import * as THREE from '../lib/three.js/three.module.js'

class Planet extends THREE.Mesh{
    constructor(config, texture=null, model=null, quality=256){
        var geometry = new THREE.SphereGeometry(config.diameter / 2, quality, quality);
        var material = new THREE.MeshBasicMaterial();
        if(texture){
            geometry = new THREE.SphereGeometry(config.diameter / 2, quality, quality);
            material = new THREE.MeshBasicMaterial(Object.assign({}, {map: texture}, {}));
        }
        else{
            geometry = new THREE.SphereGeometry(config.diameter / 2, quality, quality);
            material = new THREE.MeshBasicMaterial();
        }

        if(model){
            geometry = new THREE.BufferGeometry();
            material = new THREE.MeshBasicMaterial();  
        }

        super(geometry, material);
        
        if(model){
            this.geometry.dispose();
            this.material.dispose();

            const bbox = new THREE.Box3();
            bbox.setFromObject(model);
            const size = new THREE.Vector3(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z);
            const max = Math.max(size.x, size.y, size.z);
            model.position.x = -bbox.min.x - size.x / 2;
            model.position.y = -bbox.min.y - size.y / 2;
            model.position.z = -bbox.min.z - size.z / 2;
            const model_wrapped = new THREE.Group();
            model_wrapped.scale.x *= config.diameter / max;
            model_wrapped.scale.y *= config.diameter / max;
            model_wrapped.scale.z *= config.diameter / max;
            model_wrapped.add(model);
            this.add(model_wrapped);
            if(texture){
                model.traverse((node) => {
                    if(node.isMesh){
                        if(node.material){
                            node.material.map = texture;
                        }
                    }
                });
            }
        }

        this.is_planet = true;

        this.config = config;

        if(this.config.type === 'spaceship'){
            this.parts = [];
            var i=0;
            this.traverse((node) => {
                if(node.isMesh){
                    if(node === this) return;
                    node.spaceship = this;
                    node.geometry = node.geometry.clone();
                    node.material = node.material.clone();
                    node._color = node.material.color === undefined ? undefined : node.material.color.clone();
                    node.is_part = true;
                    node.index = i;
                    // node.position.y = i * 3;
                    node.material = new THREE.MeshStandardMaterial({color: node.material.color ? node.material.color : null, map: node.material.map ? node.material.map : null});
                    i += 1;
                    this.parts.push(node);
                }
            });
        }

        this.position.x = this.config.x + this.config.offset_x;
        this.position.y = this.config.y + this.config.offset_y;
        this.position.z = this.config.z + this.config.offset_z;

        this.rotation.x = this.config.rotation / 360 * 2 * Math.PI;     
        
        if(this.config.rotation_y){
            this.rotation.y = this.config.rotation_y / 360 * 2 * Math.PI;
            this.rotation_y = this.config.rotation_y / 360 * 2 * Math.PI;
        }
        else{
            this.rotation_y = 0;
        }
    }
}

export {Planet};