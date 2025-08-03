import * as Phaser from "phaser"

// Orange cat sprite creation function
function createCatSprite(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Image {
  const cat = scene.add.image(x, y, "cat")
  cat.setScale(0.25) // Scale down the image to match the original cat size
  return cat
}

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
  private cat?: Phaser.GameObjects.Image
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd?: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  }
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
    // Ensure buildingPositions is always an object
    this.buildingPositions =
      typeof data.buildingPositions === "object" && data.buildingPositions !== null ? data.buildingPositions : {}
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

    // Load the cat sprite
    this.load.image("cat", "/images/cat.png")
  }

  createBuildingTextures() {
    // Create Advertising Agency
    this.createAdvertisingAgency()

    // Create Research Lab
    this.createResearchLab()

    // Create Bank (updated design)
    this.createBankBuilding()

    // Create Hospital
    this.createHospital()

    // Create City Hall (new building)
    this.createCityHallBuilding()
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

  createBankBuilding() {
    const graphics = this.add.graphics()
    // Building dimensions
    const width = 130
    const height = 90
    const depth = 20
    const roofHeight = 25

    // Main building structure (classical bank with triangular pediment)
    // Front face - cream/beige color like in reference
    graphics.fillStyle(0xf5deb3) // Wheat/cream color
    graphics.fillRect(0, depth + roofHeight, width, height)
    graphics.lineStyle(2, 0x333333)
    graphics.strokeRect(0, depth + roofHeight, width, height)

    // Triangular pediment (roof) - properly closed
    graphics.fillStyle(0xdaa520) // Golden rod
    graphics.beginPath()
    graphics.moveTo(0, depth + roofHeight)
    graphics.lineTo(width / 2, depth)
    graphics.lineTo(width, depth + roofHeight)
    graphics.closePath()
    graphics.fillPath()
    graphics.lineStyle(2, 0x333333)
    graphics.strokePath()

    // Right side face - properly closed
    graphics.fillStyle(0xd2b48c) // Tan
    graphics.beginPath()
    graphics.moveTo(width, depth + roofHeight)
    graphics.lineTo(width + depth, roofHeight)
    graphics.lineTo(width + depth, height + roofHeight)
    graphics.lineTo(width, height + depth + roofHeight)
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()

    // Left side face - add missing left side
    graphics.fillStyle(0xd2b48c) // Tan
    graphics.beginPath()
    graphics.moveTo(0, depth + roofHeight)
    graphics.lineTo(-depth, roofHeight)
    graphics.lineTo(-depth, height + roofHeight)
    graphics.lineTo(0, height + depth + roofHeight)
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()

    // Top face of the building (roof top)
    graphics.fillStyle(0xdaa520) // Golden rod
    graphics.beginPath()
    graphics.moveTo(-depth, roofHeight)
    graphics.lineTo(width + depth, roofHeight)
    graphics.lineTo(width + depth, depth + roofHeight)
    graphics.lineTo(-depth, depth + roofHeight)
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()

    // Classical columns (4 columns like in reference)
    graphics.fillStyle(0xfaf0e6) // Linen (light cream for columns)
    graphics.lineStyle(2, 0x333333)
    const columnWidth = 8
    const columnSpacing = (width - 40) / 3 // Space between 4 columns
    for (let i = 0; i < 4; i++) {
      const x = 20 + i * columnSpacing
      // Column base
      graphics.fillRect(x - 2, height + depth + roofHeight - 8, columnWidth + 4, 8)
      graphics.strokeRect(x - 2, height + depth + roofHeight - 8, columnWidth + 4, 8)
      // Column shaft
      graphics.fillRect(x, depth + roofHeight + 15, columnWidth, height - 25)
      graphics.strokeRect(x, depth + roofHeight + 15, columnWidth, height - 25)
      // Column capital (top)
      graphics.fillRect(x - 2, depth + roofHeight + 12, columnWidth + 4, 6)
      graphics.strokeRect(x - 2, depth + roofHeight + 12, columnWidth + 4, 6)
      // Column fluting (vertical lines for detail)
      graphics.lineStyle(1, 0xd3d3d3)
      graphics.moveTo(x + 2, depth + roofHeight + 18)
      graphics.lineTo(x + 2, height + depth + roofHeight - 15)
      graphics.moveTo(x + 4, depth + roofHeight + 18)
      graphics.lineTo(x + 4, height + depth + roofHeight - 15)
      graphics.moveTo(x + 6, depth + roofHeight + 18)
      graphics.lineTo(x + 6, height + depth + roofHeight - 15)
      graphics.strokePath()
      graphics.lineStyle(2, 0x333333) // Reset line style
    }

    // "BANK" text on pediment
    graphics.fillStyle(0x8b4513) // Dark brown text
    graphics.fillRect(width / 2 - 20, depth + roofHeight - 15, 40, 8)

    // Bank logo/emblem (circular like in reference)
    graphics.fillStyle(0x2e7d32) // Dark green circle
    graphics.fillCircle(width / 2, depth + roofHeight - 5, 8)
    graphics.lineStyle(2, 0x333333)
    graphics.strokeCircle(width / 2, depth + roofHeight - 5, 8)

    // Logo details
    graphics.fillStyle(0xffd700) // Gold
    graphics.fillCircle(width / 2, depth + roofHeight - 5, 4)

    // Central entrance doors (between middle columns)
    graphics.fillStyle(0x8b4513) // Dark brown doors
    graphics.fillRect(width / 2 - 15, height + depth + roofHeight - 30, 30, 30)
    graphics.lineStyle(3, 0x333333)
    graphics.strokeRect(width / 2 - 15, height + depth + roofHeight - 30, 30, 30)

    // Door panels
    graphics.fillStyle(0x654321)
    graphics.fillRect(width / 2 - 12, height + depth + roofHeight - 25, 10, 20)
    graphics.fillRect(width / 2 + 2, height + depth + roofHeight - 25, 10, 20)

    // Door handles
    graphics.fillStyle(0xffd700) // Gold handles
    graphics.fillCircle(width / 2 - 4, height + depth + roofHeight - 15, 1.5)
    graphics.fillCircle(width / 2 + 8, height + depth + roofHeight - 15, 1.5)

    // Steps leading to entrance (like in reference)
    graphics.fillStyle(0xf0e68c) // Khaki (lighter than building)
    graphics.lineStyle(1, 0x333333)
    // Bottom step
    graphics.fillRect(width / 2 - 25, height + depth + roofHeight - 5, 50, 5)
    graphics.strokeRect(width / 2 - 25, height + depth + roofHeight - 5, 50, 5)
    // Middle step
    graphics.fillRect(width / 2 - 20, height + depth + roofHeight - 10, 40, 5)
    graphics.strokeRect(width / 2 - 20, height + depth + roofHeight - 10, 40, 5)
    // Top step
    graphics.fillRect(width / 2 - 18, height + depth + roofHeight - 15, 36, 5)
    graphics.strokeRect(width / 2 - 18, height + depth + roofHeight - 15, 36, 5)

    // Decorative elements on pediment
    graphics.fillStyle(0xdaa520)
    // Small decorative circles
    graphics.fillCircle(width / 2 - 15, depth + roofHeight - 8, 2)
    graphics.fillCircle(width / 2 + 15, depth + roofHeight - 8, 2)

    // Convert to texture
    graphics.generateTexture("bank", width + depth * 2, height + depth + roofHeight)
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

  createCityHallBuilding() {
    const graphics = this.add.graphics()
    // Building dimensions
    const width = 150
    const height = 110
    const depth = 22
    const domeHeight = 35

    // Main building structure (government/civic building style)
    // Front face - light stone/marble color
    graphics.fillStyle(0xf5f5dc) // Beige/light stone
    graphics.fillRect(0, depth + domeHeight, width, height)
    graphics.lineStyle(3, 0x333333)
    graphics.strokeRect(0, depth + domeHeight, width, height)

    // Right side face
    graphics.fillStyle(0xe6e6fa) // Lavender (slightly different shade)
    graphics.beginPath()
    graphics.moveTo(width, depth + domeHeight)
    graphics.lineTo(width + depth, domeHeight)
    graphics.lineTo(width + depth, height + domeHeight)
    graphics.lineTo(width, height + depth + domeHeight)
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()

    // Left side face - add missing left side
    graphics.fillStyle(0xe6e6fa) // Lavender
    graphics.beginPath()
    graphics.moveTo(0, depth + domeHeight)
    graphics.lineTo(-depth, domeHeight)
    graphics.lineTo(-depth, height + domeHeight)
    graphics.lineTo(0, height + depth + domeHeight)
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()

    // Central dome (key feature of City Hall)
    const domeX = width / 2
    const domeY = depth + domeHeight / 2
    const domeRadius = 25

    // Dome base (circular)
    graphics.fillStyle(0xd3d3d3) // Light gray dome
    graphics.fillCircle(domeX, domeY, domeRadius)
    graphics.lineStyle(3, 0x333333)
    graphics.strokeCircle(domeX, domeY, domeRadius)

    // Dome top highlight
    graphics.fillStyle(0xe8e8e8) // Lighter gray highlight
    graphics.fillCircle(domeX - 8, domeY - 8, 12)

    // Dome finial (decorative top)
    graphics.fillStyle(0xffd700) // Gold finial
    graphics.fillCircle(domeX, domeY - domeRadius - 5, 4)
    graphics.strokeCircle(domeX, domeY - domeRadius - 5, 4)

    // Flag pole on dome
    graphics.lineStyle(2, 0x8b4513) // Brown pole
    graphics.moveTo(domeX, domeY - domeRadius - 9)
    graphics.lineTo(domeX, domeY - domeRadius - 25)
    graphics.strokePath()

    // American flag (small rectangle)
    graphics.fillStyle(0xff0000) // Red stripes
    graphics.fillRect(domeX + 1, domeY - domeRadius - 25, 12, 8)
    graphics.fillStyle(0x0000ff) // Blue canton
    graphics.fillRect(domeX + 1, domeY - domeRadius - 25, 5, 4)
    graphics.lineStyle(1, 0x333333)
    graphics.strokeRect(domeX + 1, domeY - domeRadius - 25, 12, 8)

    // Top face of the building (roof area around dome)
    graphics.fillStyle(0xf5f5dc) // Beige/light stone
    graphics.beginPath()
    graphics.moveTo(-depth, domeHeight)
    graphics.lineTo(width + depth, domeHeight)
    graphics.lineTo(width + depth, depth + domeHeight)
    graphics.lineTo(-depth, depth + domeHeight)
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()

    // Classical columns (6 columns across the front)
    graphics.fillStyle(0xffffff) // White marble columns
    graphics.lineStyle(2, 0x333333)
    const columnWidth = 8
    const columnSpacing = (width - 60) / 5 // Space between 6 columns
    const columnHeight = height - 35
    for (let i = 0; i < 6; i++) {
      const x = 30 + i * columnSpacing
      // Column base
      graphics.fillRect(x - 3, height + depth + domeHeight - 10, columnWidth + 6, 10)
      graphics.strokeRect(x - 3, height + depth + domeHeight - 10, columnWidth + 6, 10)
      // Column shaft
      graphics.fillRect(x, depth + domeHeight + 25, columnWidth, columnHeight)
      graphics.strokeRect(x, depth + domeHeight + 25, columnWidth, columnHeight)
      // Column capital (Ionic style)
      graphics.fillRect(x - 3, depth + domeHeight + 20, columnWidth + 6, 8)
      graphics.strokeRect(x - 3, depth + domeHeight + 20, columnWidth + 6, 8)
      // Column fluting (vertical decorative lines)
      graphics.lineStyle(1, 0xf0f0f0)
      graphics.moveTo(x + 2, depth + domeHeight + 28)
      graphics.lineTo(x + 2, height + depth + domeHeight - 15)
      graphics.moveTo(x + 4, depth + domeHeight + 28)
      graphics.lineTo(x + 4, height + depth + domeHeight - 15)
      graphics.moveTo(x + 6, depth + domeHeight + 28)
      graphics.lineTo(x + 6, height + depth + domeHeight - 15)
      graphics.strokePath()
      graphics.lineStyle(2, 0x333333) // Reset line style
    }

    // Pediment (triangular section above columns)
    graphics.fillStyle(0xf0f8ff) // Alice blue
    graphics.beginPath()
    graphics.moveTo(20, depth + domeHeight + 20)
    graphics.lineTo(width / 2, depth + domeHeight - 5)
    graphics.lineTo(width - 20, depth + domeHeight + 20)
    graphics.closePath()
    graphics.fillPath()
    graphics.strokePath()

    // "CITY HALL" inscription on pediment
    graphics.fillStyle(0x2f4f4f) // Dark slate gray
    graphics.fillRect(width / 2 - 25, depth + domeHeight + 5, 50, 10)
    graphics.lineStyle(1, 0x333333)
    graphics.strokeRect(width / 2 - 25, depth + domeHeight + 5, 50, 10)

    // Government seal/emblem in pediment
    graphics.fillStyle(0x4169e1) // Royal blue circle
    graphics.fillCircle(width / 2, depth + domeHeight + 2, 8)
    graphics.strokeCircle(width / 2, depth + domeHeight + 2, 8)

    // Seal details (eagle silhouette)
    graphics.fillStyle(0xffd700) // Gold eagle
    graphics.fillCircle(width / 2, depth + domeHeight + 2, 4)

    // Grand entrance staircase (wide steps)
    graphics.fillStyle(0xdcdcdc) // Light gray steps
    graphics.lineStyle(2, 0x333333)
    // Bottom step (widest)
    graphics.fillRect(width / 2 - 40, height + depth + domeHeight - 8, 80, 8)
    graphics.strokeRect(width / 2 - 40, height + depth + domeHeight - 8, 80, 8)
    // Middle step
    graphics.fillRect(width / 2 - 35, height + depth + domeHeight - 16, 70, 8)
    graphics.strokeRect(width / 2 - 35, height + depth + domeHeight - 16, 70, 8)
    // Top step
    graphics.fillRect(width / 2 - 30, height + depth + domeHeight - 24, 60, 8)
    graphics.strokeRect(width / 2 - 30, height + depth + domeHeight - 24, 60, 8)

    // Main entrance doors (double doors between center columns)
    graphics.fillStyle(0x8b4513) // Dark brown doors
    graphics.fillRect(width / 2 - 18, height + depth + domeHeight - 40, 36, 40)
    graphics.lineStyle(3, 0x333333)
    graphics.strokeRect(width / 2 - 18, height + depth + domeHeight - 40, 36, 40)

    // Door panels (ornate government doors)
    graphics.fillStyle(0x654321) // Darker brown panels
    graphics.fillRect(width / 2 - 15, height + depth + domeHeight - 35, 12, 30)
    graphics.fillRect(width / 2 + 3, height + depth + domeHeight - 35, 12, 30)
    graphics.strokeRect(width / 2 - 15, height + depth + domeHeight - 35, 12, 30)
    graphics.strokeRect(width / 2 + 3, height + depth + domeHeight - 35, 12, 30)

    // Ornate door handles (brass)
    graphics.fillStyle(0xb8860b) // Dark golden rod (brass)
    graphics.fillCircle(width / 2 - 5, height + depth + domeHeight - 20, 2)
    graphics.fillCircle(width / 2 + 11, height + depth + domeHeight - 20, 2)

    // Windows on either side of entrance
    graphics.fillStyle(0x87ceeb) // Sky blue windows
    graphics.lineStyle(2, 0x333333)
    // Left side windows
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const x = 8 + col * 20
        const y = depth + domeHeight + 35 + row * 25
        graphics.fillRect(x, y, 15, 20)
        graphics.strokeRect(x, y, 15, 20)
      }
    }
    // Right side windows
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const x = width - 35 + col * 20
        const y = depth + domeHeight + 35 + row * 25
        graphics.fillRect(x, y, 15, 20)
        graphics.strokeRect(x, y, 15, 20)
      }
    }

    // Clock on the front facade (common City Hall feature)
    graphics.fillStyle(0xffffff) // White clock face
    graphics.fillCircle(width / 2, depth + domeHeight + 50, 12)
    graphics.lineStyle(2, 0x333333)
    graphics.strokeCircle(width / 2, depth + domeHeight + 50, 12)

    // Clock hands (showing 3:00)
    graphics.lineStyle(3, 0x000000)
    graphics.moveTo(width / 2, depth + domeHeight + 50)
    graphics.lineTo(width / 2 + 8, depth + domeHeight + 50) // Hour hand
    graphics.moveTo(width / 2, depth + domeHeight + 50)
    graphics.lineTo(width / 2, depth + domeHeight + 42) // Minute hand
    graphics.strokePath()

    // Clock numbers (12, 3, 6, 9)
    graphics.fillStyle(0x000000)
    graphics.fillCircle(width / 2, depth + domeHeight + 40, 1) // 12
    graphics.fillCircle(width / 2 + 10, depth + domeHeight + 50, 1) // 3
    graphics.fillCircle(width / 2, depth + domeHeight + 60, 1) // 6
    graphics.fillCircle(width / 2 - 10, depth + domeHeight + 50, 1) // 9

    // Convert to texture
    graphics.generateTexture("city-hall", width + depth * 2, height + depth + domeHeight)
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
    // Remove any existing avatar
    if (this.avatar) {
      this.avatar.destroy()
      this.avatar = undefined
    }
    if (this.cat) {
      this.cat.destroy()
      this.cat = undefined
    }

    // Create the cat character using the createCatSprite function
    this.cat = createCatSprite(this, 100, 100)
    this.cat.setInteractive()

    // Enable physics for the cat
    this.physics.add.existing(this.cat)
    const catBody = (this.cat as any).body as Phaser.Physics.Arcade.Body
    catBody.setCollideWorldBounds(true)
    catBody.setSize(40, 50) // Set collision box size

    // Create input controls
    this.cursors = this.input.keyboard?.createCursorKeys()
    this.wasd = this.input.keyboard?.addKeys("W,S,A,D") as any

    // Camera follows the cat
    this.cameras.main.startFollow(this.cat)
    this.cameras.main.setBounds(0, 0, 1200, 800)
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

  update() {
    if (!this.cat || !this.cursors || !this.wasd) return

    const catBody = (this.cat as any).body as Phaser.Physics.Arcade.Body
    const speed = 200 // Reset velocity
    catBody.setVelocity(0)

    // Handle keyboard input for cat movement
    if (this.cursors.left?.isDown || this.wasd.A.isDown) {
      catBody.setVelocityX(-speed)
    } else if (this.cursors.right?.isDown || this.wasd.D.isDown) {
      catBody.setVelocityX(speed)
    }

    if (this.cursors.up?.isDown || this.wasd.W.isDown) {
      catBody.setVelocityY(-speed)
    } else if (this.cursors.down?.isDown || this.wasd.S.isDown) {
      catBody.setVelocityY(speed)
    }

    // Normalize diagonal movement
    if (catBody.velocity.x !== 0 && catBody.velocity.y !== 0) {
      catBody.velocity.normalize().scale(speed)
    }
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
        // Set position immediately without animation to prevent blinking
        buildingContainer.setPosition(position.x, position.y)
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
    // Ensure buildingPositions is always an object
    const safeBuildingPositions =
      typeof buildingPositions === "object" && buildingPositions !== null ? buildingPositions : {}
    console.log("CityGame constructor called with building positions:", safeBuildingPositions)

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
      buildingPositions: safeBuildingPositions,
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
