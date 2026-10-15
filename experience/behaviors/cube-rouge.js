/** @type {import('../../core/behaviors').Behavior} */
export default {
  onFound(ctx) {
    if (!ctx.state.cube) {
      // Cube 3D : 20 % de la largeur de l'affiche (1 unité Three.js = 1 largeur d'affiche)
      const size = 0.2
      const geometry = new ctx.THREE.BoxGeometry(size, size, size)
      const material = new ctx.THREE.MeshStandardMaterial({
        color: 0xff3b30,
        roughness: 0.35,
        metalness: 0.1,
      })
      const cube = new ctx.THREE.Mesh(geometry, material)

      // Centré sur l'affiche, décollé de 0.15 vers le spectateur (+Z)
      cube.position.set(0, 0, 0.15)

      ctx.poster.add(cube)
      ctx.state.cube = cube
    } else if (ctx.state.cube.parent !== ctx.poster) {
      ctx.poster.add(ctx.state.cube)
    }

    ctx.state.cube.visible = true
  },

  onLost(ctx) {
    if (ctx.state.cube) {
      ctx.state.cube.visible = false
    }
  },

  onUpdate(ctx, t, dt) {
    const cube = ctx.state.cube
    if (!cube || !cube.visible) return

    // Rotation lente sur deux axes
    cube.rotation.x += dt * 0.6
    cube.rotation.y += dt * 0.9
  },
}
