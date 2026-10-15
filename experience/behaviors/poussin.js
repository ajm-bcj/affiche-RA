/** @type {import('../../core/behaviors').Behavior} */
export default {
  onFound(ctx) {
    if (!ctx.state.initialized) {
      const loader = new ctx.THREE.TextureLoader()

      // Chargeur de textures nettes avec filtrage trilinéaire et anisotropie maximale
      const loadSharp = (path) => {
        const tex = loader.load(ctx.asset(path), (t) => {
          t.colorSpace = ctx.THREE.SRGBColorSpace
          t.generateMipmaps = true
          t.minFilter = ctx.THREE.LinearMipmapLinearFilter
          t.magFilter = ctx.THREE.LinearFilter
          t.anisotropy = 8
          t.needsUpdate = true
        })
        return tex
      }

      const root = new ctx.THREE.Group()

      // 1. Masque de fond : silhouette verte exacte des 4 poussins et des 3 pancartes
      // Masque le dessin statique imprimé sur l'affiche pour supprimer tout effet de dédoublement ou de flou,
      // tout en laissant 100 % du reste de l'affiche (ciel, buisson jaune, poussins noirs) parfaitement visible.
      const texMask = loadSharp('assets/masque-fond.png')
      const matMask = new ctx.THREE.MeshBasicMaterial({
        map: texMask,
        transparent: true,
        alphaTest: 0.1,
        depthWrite: false,
      })
      const meshMask = new ctx.THREE.Mesh(new ctx.THREE.PlaneGeometry(1.0, 0.5058), matMask)
      meshMask.position.set(0, -0.48913, 0.001)
      meshMask.renderOrder = 1
      root.add(meshMask)

      // 2. Configuration rigoureuse des 4 poussins et pancartes entières
      // Têtes 100 % complètes (sans encoche ni déformation) et pancartes entières bien incrustées.
      const CHICKS_CONFIG = [
        {
          id: 'poussin-1',
          name: 'Poussin gauche (Nuggets en cuisson)',
          baseX: -0.37319,
          baseY: -0.60870,
          chickW: 0.23913,
          chickH: 0.26667,
          texPoussin: 'assets/poussin-1.png',
          hasSign: true,
          signW: 0.26812,
          signH: 0.27174,
          signRelX: 0.01449,
          signRelY: 0.16775,
          texPanneau: 'assets/panneau-1.png',
          timeOffset: 0.0,
          hopHeight: 0.025,
          signLift: 0.045,
          speed: 1.0,
        },
        {
          id: 'poussin-2',
          name: 'Poussin centre-gauche (Poussin cuit, parent aigri)',
          baseX: -0.13768,
          baseY: -0.59783,
          chickW: 0.23913,
          chickH: 0.28841,
          texPoussin: 'assets/poussin-2.png',
          hasSign: true,
          signW: 0.33696,
          signH: 0.34058,
          signRelX: 0.00181,
          signRelY: 0.19130,
          texPanneau: 'assets/panneau-2.png',
          timeOffset: 0.38,
          hopHeight: 0.022,
          signLift: 0.050,
          speed: 1.05,
        },
        {
          id: 'poussin-3',
          name: 'Poussin centre-droit (Joyeux)',
          baseX: 0.11594,
          baseY: -0.59783,
          chickW: 0.23913,
          chickH: 0.28841,
          texPoussin: 'assets/poussin-3.png',
          hasSign: false,
          timeOffset: 0.72,
          hopHeight: 0.028,
          signLift: 0,
          speed: 1.1,
        },
        {
          id: 'poussin-4',
          name: 'Poussin droit (Cui-cui mais pas cuit-cuit !)',
          baseX: 0.36957,
          baseY: -0.59783,
          chickW: 0.23913,
          chickH: 0.28841,
          texPoussin: 'assets/poussin-4.png',
          hasSign: true,
          signW: 0.25725,
          signH: 0.27174,
          signRelX: 0.00181,
          signRelY: 0.15688,
          texPanneau: 'assets/panneau-4.png',
          timeOffset: 1.05,
          hopHeight: 0.024,
          signLift: 0.045,
          speed: 0.98,
        },
      ]

      const chicks = []

      for (const config of CHICKS_CONFIG) {
        // Groupe du poussin (position de base sur l'affiche)
        const chickGroup = new ctx.THREE.Group()
        chickGroup.position.set(config.baseX, config.baseY, 0)

        // A. Pancarte complète (arrière-plan du poussin, z = 0.008)
        let meshPanneau = null
        if (config.hasSign) {
          const texPanneau = loadSharp(config.texPanneau)
          const matPanneau = new ctx.THREE.MeshBasicMaterial({
            map: texPanneau,
            transparent: true,
            alphaTest: 0.05,
            depthWrite: false,
          })
          meshPanneau = new ctx.THREE.Mesh(new ctx.THREE.PlaneGeometry(config.signW, config.signH), matPanneau)
          meshPanneau.position.set(config.signRelX, config.signRelY, 0.008)
          meshPanneau.renderOrder = 2
          chickGroup.add(meshPanneau)
        }

        // B. Tête du poussin 100 % entière (premier plan, z = 0.015, devant le manche)
        const texPoussin = loadSharp(config.texPoussin)
        const matPoussin = new ctx.THREE.MeshBasicMaterial({
          map: texPoussin,
          transparent: true,
          alphaTest: 0.05,
          depthWrite: false,
        })
        const meshPoussin = new ctx.THREE.Mesh(new ctx.THREE.PlaneGeometry(config.chickW, config.chickH), matPoussin)
        meshPoussin.position.set(0, 0, 0.015)
        meshPoussin.renderOrder = 3
        chickGroup.add(meshPoussin)

        root.add(chickGroup)

        chicks.push({
          config,
          chickGroup,
          meshPanneau,
          meshPoussin,
        })
      }

      ctx.poster.add(root)

      ctx.state.root = root
      ctx.state.chicks = chicks
      ctx.state.initialized = true
    } else if (ctx.state.root && ctx.state.root.parent !== ctx.poster) {
      ctx.poster.add(ctx.state.root)
    }

    if (ctx.state.root) {
      ctx.state.root.visible = true
    }
  },

  onLost(ctx) {
    if (ctx.state.root) {
      ctx.state.root.visible = false
    }
  },

  onUpdate(ctx, t) {
    const {root, chicks} = ctx.state
    if (!root || !root.visible || !chicks) return

    for (const chick of chicks) {
      const {config, chickGroup, meshPanneau} = chick
      const localT = (t * config.speed) + config.timeOffset

      // --- 1. Mouvement de la pancarte (monte et descend sans être coupée) ---
      if (meshPanneau) {
        const signProgress = (Math.sin(localT * 2.8) + 1) / 2
        meshPanneau.position.y = config.signRelY + (signProgress * config.signLift)
        meshPanneau.rotation.z = Math.sin(localT * 2.8) * 0.03
      }

      // --- 2. Petits sauts de poussin rigides (AUCUN étirement de la tête) ---
      const hopCycle = localT % 1.3
      let hopY = 0
      let bodyTilt = 0

      if (hopCycle < 0.38) {
        // 1er saut
        const p = hopCycle / 0.38
        hopY = Math.sin(p * Math.PI) * config.hopHeight
        bodyTilt = Math.sin(p * Math.PI) * 0.02
      } else if (hopCycle < 0.46) {
        // Contact sol
        hopY = 0
        bodyTilt = 0
      } else if (hopCycle < 0.84) {
        // 2e petit saut
        const p = (hopCycle - 0.46) / 0.38
        hopY = Math.sin(p * Math.PI) * (config.hopHeight * 0.7)
        bodyTilt = -Math.sin(p * Math.PI) * 0.015
      } else {
        // Pause au sol
        hopY = 0
        bodyTilt = 0
      }

      // Déplacement vertical pur et légère inclinaison : l'échelle reste rigoureusement 1 (pas d'étirement)
      chickGroup.position.y = config.baseY + hopY
      chickGroup.rotation.z = bodyTilt
    }
  },
}
