// oO0+ TRIAD CORE // RUST PHYSICS ENGINE
// Role: "The Core" (The Heavy Math)

pub struct TriadParticle {
    pub x: f32, pub y: f32, pub z: f32,
    pub rpm: f32, pub layer: u8,
}

impl TriadParticle {
    /// G81 Z500 -> 0 Collapse Logic
    /// Incorporates the oO0 Law: 1 * 1 = 2 (Double Entropy Scaling)
    pub fn update_g81(&mut self, time: f32, entropy_limit: f32) {
        let entropy_factor = 2.0; // Based on 1*1=2 law
        
        // Z-Depth Collapse (G81 Cycle)
        if self.z > 0.0 {
            self.z -= 28.0 * time * entropy_factor; 
        } else {
            self.z = 0.0;
        }

        // Counter-Rotation Math
        let rotation_dir = if self.layer % 2 == 0 { 1.0 } else { -1.0 };
        let velocity = self.rpm * rotation_dir * entropy_limit;
        
        // Update coordinates in the oO0 space
        self.x += velocity.cos();
        self.y += velocity.sin();
    }
}
