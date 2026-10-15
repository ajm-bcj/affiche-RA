/** @type {import('../../core/behaviors').Behavior} */
export default {
  onFound(ctx) {
    if (!ctx.state.cube) {
      // Cube 3D : 2 fois plus gros (40 % de la largeur de l'affiche au lieu de 20 %)
      const size = 0.4
      const geometry = new ctx.THREE.BoxGeometry(size, size, size)

      const vert = new ctx.THREE.Color('#00e676')
      const rouge = new ctx.THREE.Color('#ff3b30')

      const material = new ctx.THREE.MeshStandardMaterial({
        color: vert.clone(),
        roughness: 0.35,
        metalness: 0.1,
      })
      const cube = new ctx.THREE.Mesh(geometry, material)

      // Centré sur l'affiche, décollé de 0.15 vers le spectateur (+Z)
      cube.position.set(0, 0, 0.15)

      ctx.poster.add(cube)
      ctx.state.cube = cube
      ctx.state.colorGreen = vert
      ctx.state.colorRed = rouge
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

    // Rotation douce sur deux axes
    cube.rotation.x += dt * 0.6
    cube.rotation.y += dt * 0.9

    // Transition fluide entre vert et rouge sur un cycle de 10 secondes
    // (à 0s = vert, à 5s = rouge, à 10s = vert...)
    const factor = 0.5 + 0.5 * Math.sin((t * Math.PI * 2) / 10 - Math.PI / 2)
    cube.material.color.lerpColors(ctx.state.colorGreen, ctx.state.colorRed, factor)
  },
}
