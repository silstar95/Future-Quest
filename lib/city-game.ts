import * as Phaser from "phaser"

interface BuildingData {
  id: string
  name: string
  type: string
  unlockRequirement: string
  isUnlocked: boolean
  position?: { x: number; y: number }
  description: string
  simulationId: string
}

interface StudentStats {
  name: string
  level: number
  experience: number
  maxExperience: number
  completedSimulations: string[]
  totalSimulations: number
  badges: string[]
  unlockedBuildings: string[]
}

interface TooltipData {
  buildingId: string
  name: string
  description: string
  isUnlocked: boolean
  x: number
  y: number
}

interface ModalData {
  buildingId: string
  name: string
  description: string
  isUnlocked: boolean
  simulationId: string
}

class CityScene extends Phaser.Scene {
  private buildings: BuildingData[] = []
  private studentStats!: StudentStats
  private buildingSprites: Map<string, Phaser.GameObjects.Container> = new Map()
  private avatar?: Phaser.GameObjects.Sprite
  private isDragging = false
  private draggedBuilding?: Phaser.GameObjects.Container
  private gridSize = 80
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter
  private unlockParticles?: Phaser.GameObjects.Particles.ParticleEmitter
  public onBuildingSelect?: (buildingId: string, isUnlocked: boolean) => void
  public onUnlockAnimation?: (buildingId: string) => void

  // Track mouse movement to differentiate click vs drag
  private startPointerPosition = { x: 0, y: 0 }
  private hasMoved = false
  private dragThreshold = 10 // pixels

  private tooltipContainer?: Phaser.GameObjects.Container
  private tooltipBackground?: Phaser.GameObjects.Graphics
  private tooltipText?: Phaser.GameObjects.Text
  private buildingPositions: { [buildingId: string]: { x: number; y: number } } = {}
  public onShowTooltip?: (tooltip: TooltipData | null) => void
  public onShowModal?: (modal: ModalData | null) => void
  public onSavePositions?: (positions: { [buildingId: string]: { x: number; y: number } }) => void
  public onSavePositionSmooth?: (buildingId: string, x: number, y: number) => void

  constructor() {
    super({ key: "CityScene" })
  }

  init(data: {
    buildings: BuildingData[]
    studentStats: StudentStats
    buildingPositions?: { [buildingId: string]: { x: number; y: number } }
    onBuildingSelect: (id: string, isUnlocked: boolean) => void
    onUnlockAnimation?: (buildingId: string) => void
    onShowTooltip?: (tooltip: TooltipData | null) => void
    onShowModal?: (modal: ModalData | null) => void
    onSavePositions?: (positions: { [buildingId: string]: { x: number; y: number } }) => void
    onSavePositionSmooth?: (buildingId: string, x: number, y: number) => void
  }) {
    this.buildings = data.buildings
    this.studentStats = data.studentStats
    this.buildingPositions = data.buildingPositions || {}
    this.onBuildingSelect = data.onBuildingSelect
    this.onUnlockAnimation = data.onUnlockAnimation
    this.onShowTooltip = data.onShowTooltip
    this.onShowModal = data.onShowModal
    this.onSavePositions = data.onSavePositions
    this.onSavePositionSmooth = data.onSavePositionSmooth

    console.log("CityScene initialized with building positions:", this.buildingPositions)
  }

  preload() {
    // Load the city background
    this.load.image("city-bg", "/images/city-background1.jpg")

    // Create building textures programmatically
    this.createBuildingTextures()

    // Create avatar sprite
    this.load.image(
      "avatar",
      "data:image/svg+xml;base64," +
        btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="12" r="6" fill="#FFB366"/>
        <rect x="12" y="18" width="8" height="12" fill="#4A90E2" rx="2"/>
        <circle cx="14" cy="8" r="1" fill="#333"/>
        <circle cx="18" cy="8" r="1" fill="#333"/>
        <path d="M14 10 Q16 12 18 10" stroke="#333" stroke-width="1" fill="none"/>
      </svg>
    `),
    )

    // Create particle texture
    this.load.image(
      "particle",
      "data:image/svg+xml;base64;" +
        btoa(`
      <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
        <circle cx="4" cy="4" r="4" fill="#FFD700"/>
      </svg>
    `),
    )
  }

  createBuildingTextures() {
    // Create Advertising Agency
    this.createAdvertisingAgency()

    // Create Research Lab
    this.createResearchLab()

    // Create Bank
    this.createBank()

    // Create Hospital
    this.createHospital()
  }

  createAdvertisingAgency() {
    const graphics = this.add.graphics()
    const width = 120
    const height = 100
    const depth = 20

    // Main building structure (modern glass office)
    // Front face - glass facade
    graphics.fillStyle(0x2c3e50) // Dark blue-gray base
    graphics.fillRect(0, depth, width, height)

    // Glass panels
    graphics.fillStyle(0x3498db) // Bright blue glass
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const x = 8 + col * 20
        const y = depth + 10 + row * 20
        graphics.fillRect(x, y, 18, 18)
        graphics.lineStyle(1, 0x2c3e50)
        graphics.strokeRect(x, y, 18, 18)
      }
    }

    // Top face (roof)
    graphics.fillStyle(0x34495e)
    graphics.beginPath()
    graphics.moveTo(0, depth)
    graphics.lineTo(depth, 0)
    graphics.lineTo(width + depth, 0)
    graphics.lineTo(width, depth)
    graphics.closePath()
    graphics.fillPath()

    // Right side face
    graphics.fillStyle(0x2c3e50)
    graphics.beginPath()
    graphics.moveTo(width, depth)
    graphics.lineTo(width + depth, 0)
    graphics.lineTo(width + depth, height)
    graphics.lineTo(width, height + depth)
    graphics.closePath()
    graphics.fillPath()

    // Company logo/sign
    graphics.fillStyle(0xe74c3c) // Red accent
    graphics.fillRect(width / 2 - 15, depth + 5, 30, 8)
    graphics.fillStyle(0xffffff)
    graphics.fillRect(width / 2 - 12, depth + 6, 24, 6)

    // Main entrance
    graphics.fillStyle(0x1a252f)
    graphics.fillRect(width / 2 - 10, height + depth - 25, 20, 25)
    graphics.fillStyle(0x3498db, 0.7)
    graphics.fillRect(width / 2 - 8, height + depth - 23, 16, 20)

    graphics.generateTexture("advertising", width + depth, height + depth)
    graphics.destroy()
  }

  createResearchLab() {
    const graphics = this.add.graphics()
    const width = 130
    const height = 110
    const depth = 22

    // Main building structure (modern research facility)
    // Front face - white/gray scientific building
    graphics.fillStyle(0xecf0f1) // Light gray
    graphics.fillRect(0, depth, width, height)

    // Laboratory windows
    graphics.fillStyle(0x3498db, 0.8)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const x = 15 + col * 25
        const y = depth + 15 + row * 25
        graphics.fillRect(x, y, 20, 20)
        graphics.lineStyle(2, 0xbdc3c7)
        graphics.strokeRect(x, y, 20, 20)
      }
    }

    // Top face (roof with equipment)
    graphics.fillStyle(0xd5dbdb)
    graphics.beginPath()
    graphics.moveTo(0, depth)
    graphics.lineTo(depth, 0)
    graphics.lineTo(width + depth, 0)
    graphics.lineTo(width, depth)
    graphics.closePath()
    graphics.fillPath()

    // Roof equipment (ventilation, antennas)
    graphics.fillStyle(0x7f8c8d)
    graphics.fillRect(depth + 20, 5, 8, 15)
    graphics.fillRect(depth + 40, 3, 6, 17)
    graphics.fillRect(depth + 60, 7, 10, 13)

    // Right side face
    graphics.fillStyle(0xe8eaea)
    graphics.beginPath()
    graphics.moveTo(width, depth)
    graphics.lineTo(width + depth, 0)
    graphics.lineTo(width + depth, height)
    graphics.lineTo(width, height + depth)
    graphics.closePath()
    graphics.fillPath()

    // Lab sign
    graphics.fillStyle(0x9b59b6) // Purple accent
    graphics.fillRect(10, depth + 8, 50, 12)
    graphics.fillStyle(0xffffff)
    graphics.fillRect(12, depth + 9, 46, 10)

    // Main entrance with glass doors
    graphics.fillStyle(0x34495e)
    graphics.fillRect(width / 2 - 12, height + depth - 30, 24, 30)
    graphics.fillStyle(0x3498db, 0.6)
    graphics.fillRect(width / 2 - 10, height + depth - 28, 20, 25)

    // Scientific equipment visible through windows
    graphics.fillStyle(0xe67e22, 0.5)
    graphics.fillCircle(30, depth + 35, 3)
    graphics.fillCircle(80, depth + 55, 4)
    graphics.fillCircle(50, depth + 75, 2)

    graphics.generateTexture("research-lab", width + depth, height + depth)
    graphics.destroy()
  }

  createBank() {
    const graphics = this.add.graphics()
    const width = 140
    const height = 120
    const depth = 25

    // Main building structure (classical bank architecture)
    // Front face - marble/stone appearance
    graphics.fillStyle(0xf8f9fa) // Off-white marble
    graphics.fillRect(0, depth, width, height)

    // Classical columns
    graphics.fillStyle(0xe9ecef)
    for (let i = 0; i < 5; i++) {
      const x = 15 + i * 25
      graphics.fillRect(x, depth + 20, 8, height - 40)
      // Column capitals
      graphics.fillRect(x - 2, depth + 20, 12, 6)
      // Column bases
      graphics.fillRect(x - 2, height + depth - 26, 12, 6)
    }

    // Bank windows between columns
    graphics.fillStyle(0x2c3e50, 0.8)
    for (let i = 0; i < 4; i++) {
      const x = 23 + i * 25
      graphics.fillRect(x, depth + 35, 12, 35)
      graphics.lineStyle(2, 0x34495e)
      graphics.strokeRect(x, depth + 35, 12, 35)
    }

    // Top face (roof)
    graphics.fillStyle(0xdee2e6)
    graphics.beginPath()
    graphics.moveTo(0, depth)
    graphics.lineTo(depth, 0)
    graphics.lineTo(width + depth, 0)
    graphics.lineTo(width, depth)
    graphics.closePath()
    graphics.fillPath()

    // Right side face
    graphics.fillStyle(0xf1f3f4)
    graphics.beginPath()
    graphics.moveTo(width, depth)
    graphics.lineTo(width + depth, 0)
    graphics.lineTo(width + depth, height)
    graphics.lineTo(width, height + depth)
    graphics.closePath()
    graphics.fillPath()

    // Bank name sign
    graphics.fillStyle(0x2c3e50)
    graphics.fillRect(20, depth + 5, 100, 15)
    graphics.fillStyle(0xf39c12) // Gold lettering
    graphics.fillRect(22, depth + 7, 96, 11)

    // Main entrance with steps
    graphics.fillStyle(0x34495e)
    graphics.fillRect(width / 2 - 15, height + depth - 35, 30, 35)

    // Steps
    graphics.fillStyle(0xe9ecef)
    graphics.fillRect(width / 2 - 20, height + depth - 8, 40, 8)
    graphics.fillRect(width / 2 - 18, height + depth - 12, 36, 4)

    // Entrance doors
    graphics.fillStyle(0x8b4513) // Brown doors
    graphics.fillRect(width / 2 - 12, height + depth - 32, 10, 25)
    graphics.fillRect(width / 2 + 2, height + depth - 32, 10, 25)

    // Door handles
    graphics.fillStyle(0xf39c12)
    graphics.fillCircle(width / 2 - 3, height + depth - 20, 1)
    graphics.fillCircle(width / 2 + 11, height + depth - 20, 1)

    graphics.generateTexture("bank", width + depth, height + depth)
    graphics.destroy()
  }

  createHospital() {
    const graphics = this.add.graphics()
    const width = 135
    const height = 115
    const depth = 23

    // Main building structure (modern hospital)
    // Front face - clean white medical facility
    graphics.fillStyle(0xffffff) // Pure white
    graphics.fillRect(0, depth, width, height)

    // Hospital windows
    graphics.fillStyle(0x74b9ff, 0.7) // Light blue medical
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const x = 10 + col * 23
        const y = depth + 12 + row * 22
        graphics.fillRect(x, y, 18, 18)
        graphics.lineStyle(1, 0xddd)
        graphics.strokeRect(x, y, 18, 18)
      }
    }

    // Top face (roof)
    graphics.fillStyle(0xf8f9fa)
    graphics.beginPath()
    graphics.moveTo(0, depth)
    graphics.lineTo(depth, 0)
    graphics.lineTo(width + depth, 0)
    graphics.lineTo(width, depth)
    graphics.closePath()
    graphics.fillPath()

    // Medical helicopter pad on roof
    graphics.fillStyle(0xe17055)
    graphics.fillCircle(depth + width / 2, 10, 15)
    graphics.fillStyle(0xffffff)
    graphics.fillRect(depth + width / 2 - 8, 8, 16, 4)
    graphics.fillRect(depth + width / 2 - 2, 4, 4, 12)

    // Right side face
    graphics.fillStyle(0xf8f9fa)
    graphics.beginPath()
    graphics.moveTo(width, depth)
    graphics.lineTo(width + depth, 0)
    graphics.lineTo(width + depth, height)
    graphics.lineTo(width, height + depth)
    graphics.closePath()
    graphics.fillPath()

    // Large red cross symbol
    graphics.fillStyle(0xe74c3c) // Medical red
    // Vertical bar
    graphics.fillRect(width / 2 - 6, depth + 15, 12, 35)
    // Horizontal bar
    graphics.fillRect(width / 2 - 18, depth + 27, 36, 12)

    // Hospital sign
    graphics.fillStyle(0x2c3e50)
    graphics.fillRect(15, depth + 5, 80, 10)
    graphics.fillStyle(0xffffff)
    graphics.fillRect(17, depth + 6, 76, 8)

    // Emergency entrance
    graphics.fillStyle(0xe74c3c)
    graphics.fillRect(width / 2 - 15, height + depth - 30, 30, 30)
    graphics.fillStyle(0xffffff)
    graphics.fillRect(width / 2 - 12, height + depth - 27, 24, 24)

    // Ambulance bay
    graphics.fillStyle(0x34495e)
    graphics.fillRect(5, height + depth - 15, 25, 15)
    graphics.fillStyle(0xe74c3c, 0.3)
    graphics.fillRect(7, height + depth - 13, 21, 11)

    graphics.generateTexture("hospital", width + depth, height + depth)
    graphics.destroy()
  }

  create() {
    // Add city background
    const bg = this.add.image(0, 0, "city-bg").setOrigin(0, 0)
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height)

    // Create grid overlay
    this.createGrid()

    // Add buildings
    this.createBuildings()

    // Add avatar
    this.createAvatar()

    // Add particle systems
    this.createParticleSystems()

    // Enable input
    this.input.on("pointerdown", this.onPointerDown, this)
    this.input.on("pointermove", this.onPointerMove, this)
    this.input.on("pointerup", this.onPointerUp, this)
  }

  createGrid() {
    const graphics = this.add.graphics()
    graphics.lineStyle(1, 0xffffff, 0.2)

    for (let x = 0; x < this.cameras.main.width; x += this.gridSize) {
      graphics.moveTo(x, 0)
      graphics.lineTo(x, this.cameras.main.height)
    }

    for (let y = 0; y < this.cameras.main.height; y += this.gridSize) {
      graphics.moveTo(0, y)
      graphics.lineTo(this.cameras.main.width, y)
    }

    graphics.strokePath()
  }

  createBuildings() {
    this.buildings.forEach((building, index) => {
      // Use saved position or default position
      const savedPosition = this.buildingPositions[building.id]
      const defaultX = 200 + (index % 3) * 180
      const defaultY = 150 + Math.floor(index / 3) * 160

      const x = savedPosition ? savedPosition.x : defaultX
      const y = savedPosition ? savedPosition.y : defaultY

      console.log(`Creating building ${building.id} at position:`, { x, y, savedPosition })

      // Create container for building and its lock icon
      const container = this.add.container(x, y)

      // Add building sprite to container
      const sprite = this.add.sprite(0, 0, building.id)
      sprite.setScale(0.6)
      container.add(sprite)

      // Apply visual effects based on unlock status
      if (building.isUnlocked) {
        sprite.setTint(0xffffff)
        sprite.setAlpha(1)
      } else {
        sprite.setTint(0x666666)
        sprite.setAlpha(0.7)

        // Add lock icon as part of the container
        const lockBadge = this.add.circle(35, -35, 12, 0xff6b6b)
        lockBadge.setStrokeStyle(3, 0xcc5555)
        const lockIcon = this.add
          .text(35, -35, "🔒", {
            fontSize: "16px",
          })
          .setOrigin(0.5)

        container.add([lockBadge, lockIcon])

        // Store lock elements for later reference
        container.setData("lockBadge", lockBadge)
        container.setData("lockIcon", lockIcon)

        // Pulsing animation for lock
        this.tweens.add({
          targets: [lockBadge, lockIcon],
          alpha: 0.6,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        })
      }

      // Make container interactive
      container.setSize(sprite.width * 0.6, sprite.height * 0.6)
      container.setInteractive()
      container.setData("buildingId", building.id)
      container.setData("isUnlocked", building.isUnlocked)
      container.setData("buildingSprite", sprite)
      container.setData("buildingData", building)

      // Add hover effects with tooltip
      container.on("pointerover", () => {
        if (!this.isDragging && this.onShowTooltip) {
          this.onShowTooltip({
            buildingId: building.id,
            name: building.name,
            description: building.description,
            isUnlocked: building.isUnlocked,
            x: container.x,
            y: container.y,
          })
        }

        if (!this.isDragging) {
          this.tweens.add({
            targets: container,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            ease: "Power2",
          })
        }
      })

      container.on("pointerout", () => {
        if (this.onShowTooltip) {
          this.onShowTooltip(null)
        }

        if (!this.isDragging || this.draggedBuilding !== container) {
          this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: "Power2",
          })
        }
      })

      this.buildingSprites.set(building.id, container)

      // Update internal position tracking
      this.buildingPositions[building.id] = { x, y }
    })
  }

  createAvatar() {
    this.avatar = this.add.sprite(120, 400, "avatar")
    this.avatar.setScale(2)

    // Idle animation
    this.tweens.add({
      targets: this.avatar,
      scaleY: 1.8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    })
  }

  createParticleSystems() {
    // Regular particles for placement
    this.particles = this.add.particles(0, 0, "particle", {
      scale: { start: 0.3, end: 0 },
      speed: { min: 50, max: 100 },
      lifespan: 1000,
      quantity: 3,
    })
    this.particles.stop()

    // Special unlock particles
    this.unlockParticles = this.add.particles(0, 0, "particle", {
      scale: { start: 0.5, end: 0 },
      speed: { min: 100, max: 200 },
      lifespan: 2000,
      quantity: 20,
      tint: [0xffd700, 0x00ff00, 0x4ecdc4],
    })
    this.unlockParticles.stop()
  }

  // Public method to trigger unlock animation
  public unlockBuilding(buildingId: string) {
    const container = this.buildingSprites.get(buildingId)
    if (container) {
      const sprite = container.getData("buildingSprite")
      const lockBadge = container.getData("lockBadge")
      const lockIcon = container.getData("lockIcon")

      // Update building data
      container.setData("isUnlocked", true)

      // Visual transformation of building
      this.tweens.add({
        targets: sprite,
        tint: 0xffffff,
        alpha: 1,
        duration: 500,
        ease: "Power2",
      })

      // Transform lock to green tick with animation
      if (lockBadge && lockIcon) {
        // Stop pulsing animation
        this.tweens.killTweensOf([lockBadge, lockIcon])

        // Change to green tick
        this.tweens.add({
          targets: lockBadge,
          tint: 0x00ff00,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 300,
          ease: "Back.easeOut",
          onComplete: () => {
            lockIcon.setText("✓")
            lockIcon.setStyle({ fontSize: "18px", color: "#FFF" })

            // Hold for a moment then fade out
            this.time.delayedCall(1000, () => {
              this.tweens.add({
                targets: [lockBadge, lockIcon],
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 500,
                ease: "Power2",
                onComplete: () => {
                  container.remove([lockBadge, lockIcon])
                  lockBadge.destroy()
                  lockIcon.destroy()
                },
              })
            })
          },
        })
      }

      // Unlock particle explosion
      if (this.unlockParticles) {
        this.unlockParticles.setPosition(container.x, container.y)
        this.unlockParticles.start()
        this.time.delayedCall(2000, () => {
          this.unlockParticles?.stop()
        })
      }

      // Trigger callback
      if (this.onUnlockAnimation) {
        this.onUnlockAnimation(buildingId)
      }
    }
  }

  onPointerDown(pointer: Phaser.Input.Pointer) {
    const hitObjects = this.input.hitTestPointer(pointer)
    if (hitObjects.length > 0) {
      const container = hitObjects[0] as Phaser.GameObjects.Container
      const buildingId = container.getData("buildingId")
      const isUnlocked = container.getData("isUnlocked")

      if (buildingId) {
        this.startPointerPosition = { x: pointer.x, y: pointer.y }
        this.hasMoved = false
        this.draggedBuilding = container

        const sprite = container.getData("buildingSprite")
        sprite.setTint(isUnlocked ? 0xffff00 : 0xffaaaa)
      }
    }
  }

  onPointerMove(pointer: Phaser.Input.Pointer) {
    if (this.draggedBuilding) {
      const distance = Phaser.Math.Distance.Between(
        this.startPointerPosition.x,
        this.startPointerPosition.y,
        pointer.x,
        pointer.y,
      )

      if (distance > this.dragThreshold && !this.isDragging) {
        this.isDragging = true
        this.hasMoved = true
      }

      if (this.isDragging) {
        const gridX = Math.round(pointer.x / this.gridSize) * this.gridSize
        const gridY = Math.round(pointer.y / this.gridSize) * this.gridSize
        this.draggedBuilding.setPosition(gridX, gridY)

        // Update internal position tracking immediately for smooth experience
        const buildingId = this.draggedBuilding.getData("buildingId")
        this.buildingPositions[buildingId] = { x: gridX, y: gridY }
        
        // Add a subtle visual feedback during dragging
        this.draggedBuilding.setScale(1.05)
      }
    }
  }

  onPointerUp(pointer: Phaser.Input.Pointer) {
    if (this.draggedBuilding) {
      const buildingId = this.draggedBuilding.getData("buildingId")
      const isUnlocked = this.draggedBuilding.getData("isUnlocked")
      const buildingData = this.draggedBuilding.getData("buildingData")
      const sprite = this.draggedBuilding.getData("buildingSprite")

      sprite.setTint(isUnlocked ? 0xffffff : 0x666666)

      if (this.isDragging) {
        this.isDragging = false

        // Reset scale immediately
        this.draggedBuilding.setScale(1)

        // Get final position
        const finalPosition = {
          x: this.draggedBuilding.x,
          y: this.draggedBuilding.y,
        }

        // Update internal tracking
        this.buildingPositions[buildingId] = finalPosition

        console.log(`Building ${buildingId} moved to position:`, finalPosition)

        // Use smooth saving instead of immediate batch save
        if (this.onSavePositionSmooth) {
          this.onSavePositionSmooth(buildingId, finalPosition.x, finalPosition.y)
        }

        // Add placement effect
        if (this.particles) {
          this.particles.setPosition(this.draggedBuilding.x, this.draggedBuilding.y)
          this.particles.start()
          this.time.delayedCall(500, () => {
            this.particles?.stop()
          })
        }

        // Scale animation for drop
        this.tweens.add({
          targets: this.draggedBuilding,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
          yoyo: true,
          ease: "Power2",
          onComplete: () => {
            if (this.draggedBuilding) {
              this.draggedBuilding.setScale(1)
            }
          },
        })
      } else if (!this.hasMoved) {
        // Simple click - show modal for buildings
        if (this.onShowModal) {
          this.onShowModal({
            buildingId: buildingId,
            name: buildingData.name,
            description: buildingData.description,
            isUnlocked: isUnlocked,
            simulationId: buildingData.simulationId,
          })
        }
      }

      this.draggedBuilding = undefined
      this.hasMoved = false
    }
  }

  public getBuildingPositions(): { [buildingId: string]: { x: number; y: number } } {
    return { ...this.buildingPositions }
  }

  public updateBuildingPositions(positions: { [buildingId: string]: { x: number; y: number } }) {
    this.buildingPositions = { ...positions }
    console.log("Building positions updated in scene:", this.buildingPositions)
    
    // Update existing building positions without recreating the scene
    Object.entries(positions).forEach(([buildingId, position]) => {
      const buildingContainer = this.buildingSprites.get(buildingId)
      if (buildingContainer) {
        // Smoothly animate the building to its new position
        this.tweens.add({
          targets: buildingContainer,
          x: position.x,
          y: position.y,
          duration: 300,
          ease: "Power2",
        })
      }
    })
  }
}

export class CityGame {
  private game: Phaser.Game
  public onBuildingSelect?: (buildingId: string, isUnlocked: boolean) => void
  public onUnlockAnimation?: (buildingId: string) => void
  private scene?: CityScene
  public onShowTooltip?: (tooltip: any) => void
  public onShowModal?: (modal: any) => void
  public onSavePositions?: (positions: { [buildingId: string]: { x: number; y: number } }) => void
  public onSavePositionSmooth?: (buildingId: string, x: number, y: number) => void

  constructor(
    parent: HTMLElement,
    buildings: BuildingData[],
    studentStats: StudentStats,
    buildingPositions?: { [buildingId: string]: { x: number; y: number } },
  ) {
    console.log("CityGame constructor called with building positions:", buildingPositions)

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: parent.clientWidth,
      height: parent.clientHeight,
      parent: parent,
      backgroundColor: "#87CEEB",
      scene: CityScene,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    }

    this.game = new Phaser.Game(config)
    this.scene = this.game.scene.getScene("CityScene") as CityScene

    this.game.scene.start("CityScene", {
      buildings,
      studentStats,
      buildingPositions: buildingPositions || {},
      onBuildingSelect: (buildingId: string, isUnlocked: boolean) => {
        if (this.onBuildingSelect) {
          this.onBuildingSelect(buildingId, isUnlocked)
        }
      },
      onUnlockAnimation: (buildingId: string) => {
        if (this.onUnlockAnimation) {
          this.onUnlockAnimation(buildingId)
        }
      },
      onShowTooltip: (tooltip: any) => {
        if (this.onShowTooltip) {
          this.onShowTooltip(tooltip)
        }
      },
      onShowModal: (modal: any) => {
        if (this.onShowModal) {
          this.onShowModal(modal)
        }
      },
      onSavePositions: (positions: any) => {
        if (this.onSavePositions) {
          this.onSavePositions(positions)
        }
      },
      onSavePositionSmooth: (buildingId: string, x: number, y: number) => {
        if (this.onSavePositionSmooth) {
          this.onSavePositionSmooth(buildingId, x, y)
        }
      },
    })
  }

  public unlockBuilding(buildingId: string) {
    if (this.scene) {
      this.scene.unlockBuilding(buildingId)
    }
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true)
    }
  }

  public getBuildingPositions(): { [buildingId: string]: { x: number; y: number } } {
    if (this.scene) {
      return this.scene.getBuildingPositions()
    }
    return {}
  }

  public updateBuildingPositions(positions: { [buildingId: string]: { x: number; y: number } }) {
    if (this.scene) {
      this.scene.updateBuildingPositions(positions)
    }
  }
}
